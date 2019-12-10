import {MeetingsAdapter} from '@webex/component-adapter-interfaces';
import {concat, from, fromEvent, Observable} from 'rxjs';
import {filter, finalize, map, publishReplay, refCount} from 'rxjs/operators';

const EVENT_MEDIA_READY = 'media:ready';
const MEDIA_TYPE_LOCAL = 'local';
const MEDIA_TYPE_REMOTE_AUDIO = 'remoteAudio';
const MEDIA_TYPE_REMOTE_VIDEO = 'remoteVideo';
const MEDIA_EVENT_TYPES = [MEDIA_TYPE_LOCAL, MEDIA_TYPE_REMOTE_AUDIO, MEDIA_TYPE_REMOTE_VIDEO];

/**
 * The `MeetingsSDKAdapter` is an implementation of the `MeetingsAdapter` interface.
 * This adapter utilizes the Webex JS SDK to create and join webex meetings.
 *
 * @class MeetingsSDKAdapter
 * @extends {MeetingsAdapter}
 */
export default class MeetingsSDKAdapter extends MeetingsAdapter {
  constructor(datasource) {
    super(datasource);
    this.getMeetingObservables = {};
    this.meetings = {};
  }

  /**
   * Register the SDK meeting plugin to the device
   * and sync the meeting collection from the server.
   */
  async connect() {
    await this.datasource.meetings.register();
    await this.datasource.meetings.syncMeetings();
  }

  /**
   * Unregister the SDK meeting plugin from the device.
   */
  async disconnect() {
    await this.datasource.meetings.unregister();
  }

  /**
   * Retrieve the local device media and add them to the meeting
   * with the given default media settings to the meeting.
   *
   * @param {string} ID  ID to retrieve the SDK meeting object to add the local media to
   */
  addLocalMedia(ID) {
    const sdkMeeting = this.fetchMeeting(ID);

    // default media setting
    const mediaSettings = {
      receiveVideo: true,
      receiveAudio: true,
      receiveShare: false,
      sendVideo: true,
      sendAudio: true,
      sendShare: false,
    };

    sdkMeeting
      .getMediaStreams(mediaSettings)
      .then(([localStream, localShare]) => {
        sdkMeeting
          .addMedia({
            localShare,
            localStream,
            mediaSettings,
          })
          .catch((error) => {
            // eslint-disable-next-line no-console
            console.error(`Unable to add local media to meeting "${ID}"`, error);
          });
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(`Unable to get local media streams for meeting ${ID}`, error);
      });
  }

  /**
   * Update the meeting object with media attached based on a given event type.
   *
   * @param {string} ID     ID of the meeting to fetch
   * @param {Object} media  new media stream to attach to the meeting object based on a given event type
   * @memberof MeetingsSDKAdapter
   * @private
   */
  attachMedia(ID, {type, stream}) {
    const meeting = this.meetings[ID];

    switch (type) {
      case MEDIA_TYPE_LOCAL:
        this.meetings[ID] = {
          ...meeting,
          localAudio: stream.getAudioTracks()[0],
          localVideo: stream.getVideoTracks()[0],
        };
        break;
      case MEDIA_TYPE_REMOTE_AUDIO:
        this.meetings[ID] = {...meeting, remoteAudio: stream};
        break;
      case MEDIA_TYPE_REMOTE_VIDEO:
        this.meetings[ID] = {...meeting, remoteVideo: stream};
        break;
      default:
        this.meetings[ID] = {...meeting};
        break;
    }
  }

  /**
   * Creates meeting and returns an observable to the new meeting data.
   *
   * @param {string} target destination to start the meeting at
   * @returns {Observable.<Meeting>}
   * @memberof MeetingsSDKAdapter
   */
  createMeeting(target) {
    return from(this.datasource.meetings.create(target)).pipe(
      map(
        ({id, destination, sipuri}) => {
          this.meetings[id] = {
            ID: id,
            title: destination || sipuri,
            localVideo: null,
            localAudio: null,
            localShare: null,
            remoteStream: null,
            remoteShare: null,
          };

          return this.meetings[id];
        },
        (error) => {
          // eslint-disable-next-line no-console
          console.error(`Unable to create a meeting with "${target}"`, error);
        }
      )
    );
  }

  /**
   * Returns a SDK meeting object retrieved from the collection.
   *
   * @param {string} ID ID of the meeting to fetch.
   * @returns {Object} The SDK meeting object from the meetings collection.
   * @memberof MeetingsSDKAdapter
   * @private
   */
  fetchMeeting(ID) {
    return this.datasource.meetings.getMeetingByType('id', ID);
  }

  /**
   * Attempts to join the meeting of the given meeting ID.
   * If the meeting is successfully joined, a ready event is dispatched.
   *
   * @param {string} ID ID of the meeting to join
   * @memberof MeetingsSDKAdapter
   */
  joinMeeting(ID) {
    this.fetchMeeting(ID)
      .join()
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(`Unable to join meeting "${ID}"`, error);
      });
  }

  /**
   * Returns an observable that emits meeting data of the given ID.
   *
   * @param {string} ID ID of meeting to get
   * @returns {Observable.<Meeting>}
   * @memberof MeetingsSDKAdapter
   */
  getMeeting(ID) {
    if (!(ID in this.getMeetingObservables)) {
      const sdkMeeting = this.fetchMeeting(ID);

      const getMeeting$ = Observable.create((observer) => {
        if (this.meetings[ID]) {
          observer.next(this.meetings[ID]);
        } else {
          observer.error(new Error(`Could not find meeting with ID "${ID}"`));
        }

        observer.complete();
      });

      // Listen to attach mediaStream source objects to the existing meeting
      const meetingWithReadyEvent$ = fromEvent(sdkMeeting, EVENT_MEDIA_READY).pipe(
        filter((event) => MEDIA_EVENT_TYPES.includes(event.type)),
        map((event) => this.attachMedia(ID, event)),
        map(() => this.meetings[ID])
      );

      const getMeetingWithEvents$ = concat(getMeeting$, meetingWithReadyEvent$).pipe(
        finalize(() => {
          // clean up
          delete this.meetings[ID];
          delete this.getMeetingObservables[ID];
        })
      );

      // Convert to a multicast observable
      this.getMeetingObservables[ID] = getMeetingWithEvents$.pipe(
        publishReplay(1),
        refCount()
      );
    }

    return this.getMeetingObservables[ID];
  }
}
