import {MeetingsAdapter} from '@webex/component-adapter-interfaces';
import {Observable} from 'rxjs';
import {publish, refCount} from 'rxjs/operators';

export const ROOM_UPDATED_EVENT = 'updated';

/**
 * The `MeetingsSDKAdapter` is an implementation of the `MeetingsAdapter` interface.
 * This adapter utilizes the Webex JS SDK to create and join webex meetings.
 *
 * @export
 * @class MeetingsSDKAdapter
 * @extends {MeetingsAdapter}
 */
export default class MeetingsSDKAdapter extends MeetingsAdapter {
  constructor(datasource) {
    super(datasource);
    this.meetingsObservables = {};
    this.meetingControls = {};
  }

  connect() {
    // Check if the meetings is registred
    if (!this.datasource.meeting.registered) {
      this.datasource.meetings.register();
    }

    this.registerEvents();
    this.syncMeetings();
  }

  syncMeetings() {
    this.datasource.meetings.syncMeetings();
  }

  meetingAdded(meetingInstance) {
    const {type, meeting} = meetingInstance;

    if (type === 'INCOMING') {
      // The meeting get acknowleged but we dont have to show any UI indication
      meeting.acknowledge(type);
    }

    // TODO: check if its correct
    this.createObservable(meeting.id, meetingInstance);

    this.registerMeetingsListener(meeting);
  }

  meetingRemoved(meetingInstance) {
    this.meetingsObservables[meetingInstance.id].complet();
    // TODO: check how to unsubscribe and delete
    delete this.meetingsObservables[meetingInstance.id];
  }

  registerEvents() {
    this.datasource.meetings.on('meeting:added', this.meetingAdded);
    this.datasource.meetings.on('meeting:removed', this.meetingRemoved);
  }

  generateMeetingObject(meeting) {
    return {
      id: meeting.Id,
    };
  }

  createObservable(ID, meeting) {
    const source = Observable.create((observer) => {
      observer.next(meeting).catch((error) => observer.error(error));

      return () => {
        // Cleanup when subscription count is 0
        delete this.meetingsObservables[ID];
      };
    });

    // Convert to a multicast observable
    this.meetingsObservables[ID] = source.pipe(
      publish(),
      refCount()
    );
  }

  /**
   * Returns an observable that emits meeting data of the given ID.
   *
   * @param {string} ID ID of meeting to get
   * @returns {Observable.<Meetings>}
   * @memberof MeetingsSDKAdapter
   */
  getMeeting(ID) {
    const meeting = this.datasource.meetings.getMeetingByType('id', ID);

    if (!(ID in this.meetingsObservables)) {
      this.createObservable(ID, meeting);
    }

    // This will be just ID which will be the correlation ID
    return this.meetingsObservables[ID];
    // return this.generateMeetingObject(meeting);
  }
}
