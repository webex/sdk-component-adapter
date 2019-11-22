import {MeetingsAdapter} from '@webex/component-adapter-interfaces';
import {Observable} from 'rxjs';
import {publishReplay, refCount} from 'rxjs/operators';

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
    this.meetingsObservables = {};
  }

  async connect() {
    // Check if the meetings is registred
    if (!this.datasource.meeting.registered) {
      this.datasource.meetings.register();
    }

    this.registerEvents();
    await this.datasource.meetings.syncMeetings();
  }

  async disconnect() {
    await this.datasource.meetings.unregister();
  }

  fetchMeeting(ID) {
    const meeting = this.datasource.meetings.getMeetingByType('id', ID);

    if (meeting) {
      return {
        ID: meeting.Id,
        title: meeting.title,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        localVideo: meeting.localVideo,
        localAudio: meeting.remoteVideo,
        localShare: meeting.localShare,
        remoteVideo: meeting.remoteVideo,
        remoteAudio: meeting.remoteAudio,
        remoteShare: meeting.remoteShare,
      };
    }

    return null;
  }

  /**
   * Returns an observable that emits meeting data of the given ID.
   *
   * @param {string} ID ID of meeting to get
   * @returns {Observable.<Meetings>}
   * @memberof MeetingsSDKAdapter
   */
  getMeeting(ID) {
    const meeting = this.fetchMeeting(ID);

    if (!(ID in this.meetingsObservables)) {
      const source = Observable.create((observer) => {
        if (meeting) {
          observer.next(meeting);
        } else {
          observer.error(new Error('No meeting object'));
        }

        observer.complete();

        return () => {
          // Cleanup when subscription count is 0
          delete this.meetingsObservables[ID];
        };
      });

      // Convert to a multicast observable
      this.meetingsObservables[ID] = source.pipe(
        publishReplay(1),
        refCount()
      );
    }

    // This will be just ID which will be the correlation ID
    return this.meetingsObservables[ID];
  }
}
