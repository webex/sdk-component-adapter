import {MeetingsAdapter, MeetingControlState} from '@webex/component-adapter-interfaces';
import {concat, from, fromEvent, Observable} from 'rxjs';
import {filter, finalize, map, merge, publishReplay, refCount} from 'rxjs/operators';

const EVENT_MEDIA_READY = 'media:ready';
const EVENT_MEDIA_STOPPED = 'media:stopped';
const EVENT_MEDIA_LOCAL_UPDATE = 'adapter:media:local:update';
const JOIN_CONTROL = 'join-meeting';
const AUDIO_CONTROL = 'audio';
const VIDEO_CONTROL = 'video';
const MEDIA_TYPE_LOCAL = 'local';
const MEDIA_TYPE_REMOTE_AUDIO = 'remoteAudio';
const MEDIA_TYPE_REMOTE_VIDEO = 'remoteVideo';
const MEDIA_EVENT_TYPES = [MEDIA_TYPE_LOCAL, MEDIA_TYPE_REMOTE_AUDIO, MEDIA_TYPE_REMOTE_VIDEO];
const DEFAULT_MEDIA_SETTINGS = {
  receiveVideo: true,
  receiveAudio: true,
  receiveShare: false,
  sendVideo: true,
  sendAudio: true,
  sendShare: false,
};

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

    this.meetingControls[JOIN_CONTROL] = {
      ID: JOIN_CONTROL,
      action: this.joinMeeting.bind(this),
      display: this.joinControl.bind(this),
    };

    this.meetingControls[AUDIO_CONTROL] = {
      ID: AUDIO_CONTROL,
      action: this.handleLocalAudio.bind(this),
      display: this.audioControl.bind(this),
    };

    this.meetingControls[VIDEO_CONTROL] = {
      ID: VIDEO_CONTROL,
      action: this.handleLocalVideo.bind(this),
      display: this.videoControl.bind(this),
    };
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
  async addLocalMedia(ID) {
    const sdkMeeting = this.fetchMeeting(ID);

    try {
      const [localStream] = await sdkMeeting.getMediaStreams(DEFAULT_MEDIA_SETTINGS);

      // We need to emit a media ready event for retrieving local stream media
      sdkMeeting.emit(EVENT_MEDIA_READY, {type: MEDIA_TYPE_LOCAL, stream: localStream});
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Unable to retrieve local stream media "${ID}"`, error);
    }
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
          localAudio: new MediaStream(stream.getAudioTracks()),
          localVideo: new MediaStream(stream.getVideoTracks()),
        };
        break;
      case MEDIA_TYPE_REMOTE_AUDIO:
        this.meetings[ID] = {...meeting, remoteAudio: stream};
        break;
      case MEDIA_TYPE_REMOTE_VIDEO:
        this.meetings[ID] = {...meeting, remoteVideo: stream};
        break;
      default:
        break;
    }
  }

  /**
   * Update the meeting object by removing media based on a given event type.
   *
   * @param {string} ID  ID of the meeting to fetch
   * @memberof MeetingsSDKAdapter
   * @private
   */
  removeMedia(ID, {type}) {
    const meeting = this.meetings[ID];

    switch (type) {
      case MEDIA_TYPE_LOCAL:
        this.meetings[ID] = {
          ...meeting,
          localAudio: null,
          localVideo: null,
        };
        break;
      case MEDIA_TYPE_REMOTE_AUDIO:
        this.meetings[ID] = {...meeting, remoteAudio: null};
        break;
      case MEDIA_TYPE_REMOTE_VIDEO:
        this.meetings[ID] = {...meeting, remoteVideo: null};
        break;
      default:
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
            remoteAudio: null,
            remoteVideo: null,
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
  async joinMeeting(ID) {
    try {
      const sdkMeeting = this.fetchMeeting(ID);
      const {localAudio, localVideo} = this.meetings[ID];
      const localStream = new MediaStream([localAudio.getAudioTracks()[0], localVideo.getVideoTracks()[0]]);

      await sdkMeeting.join();

      // SDK requires to join the meeting before adding the local stream media to the meeting
      await sdkMeeting.addMedia({localStream, DEFAULT_MEDIA_SETTINGS});
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Unable to join meeting "${ID}"`, error);
    }
  }

  /**
   * Attempts to leave the meeting of the given meeting ID.
   * If the user had left the meeting successfully, a stopped event is dispatched.
   *
   * @param {string} ID ID of the meeting to leave from
   * @memberof MeetingsSDKAdapter
   */
  leaveMeeting(ID) {
    this.fetchMeeting(ID)
      .leave()
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(`Unable to leave from the meeting "${ID}"`, error);
      });
  }

  /**
   * Returns an observable that emits the display data of a meeting control.
   *
   * @returns {Observable.<MeetingControlDisplay>}
   * @memberof MeetingJSONAdapter
   * @private
   */
  joinControl() {
    return Observable.create((observer) => {
      observer.next({
        ID: JOIN_CONTROL,
        text: 'Join meeting',
        tooltip: 'Join meeting',
        state: MeetingControlState.ACTIVE,
      });

      observer.complete();
    });
  }

  /**
   * Attempts to mute the microphone of the given meeting ID.
   * If the microphone is successfully muted, an audio mute event is dispatched.
   *
   * @param {string} ID ID of the meeting to mute audio
   * @memberof MeetingsSDKAdapter
   */
  async handleLocalAudio(ID) {
    const sdkMeeting = this.fetchMeeting(ID);

    try {
      let audioEnabled = this.meetings[ID].localAudio !== null;

      if (audioEnabled) {
        await sdkMeeting.muteAudio();
        // Store the current local audio stream to avoid an extra request call
        this.meetings[ID].disabledLocalAudio = this.meetings[ID].localAudio;
        this.meetings[ID].localAudio = null;
        audioEnabled = false;
      } else {
        await sdkMeeting.unmuteAudio();
        // Retrieve the stored local audio stream
        this.meetings[ID].localAudio = this.meetings[ID].disabledLocalAudio;
        this.meetings[ID].disabledLocalAudio = null;
        audioEnabled = true;
      }

      // Due to SDK limitation around local media updates,
      // we need to emit a custom event for audio mute updates
      sdkMeeting.emit(EVENT_MEDIA_LOCAL_UPDATE, {
        control: AUDIO_CONTROL,
        state: audioEnabled,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Unable to update local audio settings for meeting "${ID}"`, error);
    }
  }

  /**
   * Returns an observable that emits the display data of a mute meeting audio control.
   *
   * @param {string} ID ID of the meeting to mute audio
   * @returns {Observable.<MeetingControlDisplay>}
   * @memberof MeetingJSONAdapter
   */
  audioControl(ID) {
    const sdkMeeting = this.fetchMeeting(ID);
    const muted = {
      ID: AUDIO_CONTROL,
      icon: 'microphone-muted',
      tooltip: 'Unmute',
      state: MeetingControlState.ACTIVE,
      text: null,
    };
    const unmuted = {
      ID: AUDIO_CONTROL,
      icon: 'microphone-muted',
      tooltip: 'Mute',
      state: MeetingControlState.INACTIVE,
      text: null,
    };

    const getDisplayData$ = Observable.create((observer) => {
      if (sdkMeeting) {
        observer.next(unmuted);
      } else {
        observer.error(new Error(`Could not find meeting with ID "${ID}" to add audio control`));
      }

      observer.complete();
    });

    const localMediaUpdateEvent$ = fromEvent(sdkMeeting, EVENT_MEDIA_LOCAL_UPDATE).pipe(
      filter((event) => event.control === AUDIO_CONTROL),
      map(({state}) => (state ? unmuted : muted))
    );

    return concat(getDisplayData$, localMediaUpdateEvent$);
  }

  /**
   * Attempts to mute the camera of the given meeting ID.
   * If the camera is successfully muted, a video mute event is dispatched.
   *
   * @param {string} ID ID of the meeting to mute video
   * @memberof MeetingsSDKAdapter
   */
  async handleLocalVideo(ID) {
    const sdkMeeting = this.fetchMeeting(ID);

    try {
      let videoEnabled = this.meetings[ID].localVideo !== null;

      if (videoEnabled) {
        await sdkMeeting.muteVideo();
        // Store the current local video stream to avoid an extra request call
        this.meetings[ID].disabledLocalVideo = this.meetings[ID].localVideo;
        this.meetings[ID].localVideo = null;
        videoEnabled = false;
      } else {
        await sdkMeeting.unmuteVideo();
        // Retrieve the stored local video stream
        this.meetings[ID].localVideo = this.meetings[ID].disabledLocalVideo;
        this.meetings[ID].disabledLocalVideo = null;
        videoEnabled = true;
      }

      // Due to SDK limitation around local media updates,
      // we need to emit a custom event for video mute updates
      sdkMeeting.emit(EVENT_MEDIA_LOCAL_UPDATE, {
        control: VIDEO_CONTROL,
        state: videoEnabled,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Unable to update local video settings for meeting "${ID}"`, error);
    }
  }

  /**
   * Returns an observable that emits the display data of a mute meeting video control.
   *
   * @param {string} ID ID of the meeting to mute video
   * @returns {Observable.<MeetingControlDisplay>}
   * @memberof MeetingJSONAdapter
   */
  videoControl(ID) {
    const sdkMeeting = this.fetchMeeting(ID);
    const muted = {
      ID: VIDEO_CONTROL,
      icon: 'camera-muted',
      tooltip: 'Start video',
      state: MeetingControlState.ACTIVE,
      text: null,
    };
    const unmuted = {
      ID: VIDEO_CONTROL,
      icon: 'camera',
      tooltip: 'Stop video',
      state: MeetingControlState.INACTIVE,
      text: null,
    };

    const getDisplayData$ = Observable.create((observer) => {
      if (sdkMeeting) {
        observer.next(unmuted);
      } else {
        observer.error(new Error(`Could not find meeting with ID "${ID}" to add video control`));
      }

      observer.complete();
    });

    const localMediaUpdateEvent$ = fromEvent(sdkMeeting, EVENT_MEDIA_LOCAL_UPDATE).pipe(
      filter((event) => event.control === VIDEO_CONTROL),
      map(({state}) => (state ? unmuted : muted))
    );

    return concat(getDisplayData$, localMediaUpdateEvent$);
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
      const meetingWithMediaReadyEvent$ = fromEvent(sdkMeeting, EVENT_MEDIA_READY).pipe(
        filter((event) => MEDIA_EVENT_TYPES.includes(event.type)),
        map((event) => this.attachMedia(ID, event)),
        map(() => this.meetings[ID])
      );

      // Listen to remove mediaStream source objects from the existing meeting
      const meetingWithMediaStoppedEvent$ = fromEvent(sdkMeeting, EVENT_MEDIA_STOPPED).pipe(
        filter((event) => MEDIA_EVENT_TYPES.includes(event.type)),
        map((event) => this.removeMedia(ID, event)),
        map(() => this.meetings[ID])
      );

      // Listen to update event to return the meeting object
      const meetingWithLocalUpdateEvents$ = fromEvent(sdkMeeting, EVENT_MEDIA_LOCAL_UPDATE).pipe(
        map(() => this.meetings[ID])
      );

      // Merge all event observables to update the existing meeting object simultaneously
      const meetingsWithEvents$ = merge(
        meetingWithMediaReadyEvent$,
        meetingWithMediaStoppedEvent$,
        meetingWithLocalUpdateEvents$
      );

      const getMeetingWithEvents$ = getMeeting$.pipe(
        meetingsWithEvents$,
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
