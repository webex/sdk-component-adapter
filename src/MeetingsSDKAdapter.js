import {Observable} from 'rxjs';
import {publish, refCount} from 'rxjs/operators';
import {MeetingsAdapter} from '@webex/components';

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
    this.datasource = datasource;

    // Check if the meetings is registred
    if (!datasource.meeting.registered) {
      datasource.meetings.register();
    }

    this.registerEvents();
    this.syncMeetins();
  }

  syncMeetins() {
    this.datasource.meetings.syncMeetings();
  }

  registerMeetingListner(meeting) {
    // all the meeting related event can be here because meeting:added gets triggred
    // irrespective of remote of local create

    meeting.on('media:ready', (media) => {
      // {type, stream}
    });

    meeting.on('meeting:stoppedSharingLocal', () => {});
    meeting.on('meeting:startedSharingLocal', () => {});
    meeting.on('media:stopped', (media) => {});

    meeting.members.on('members:update', (delta) => {
      const {full} = delta;
    });

    meeting.members.on('members:content:update', (payload) => {});

    meeting.on('meeting:ringing', () => {});
    meeting.on('move-update-media', () => {});
    meeting.on('meeting:locked', () => {});
    meeting.on('meeting:unlocked', () => {});
    meeting.on('meeting:actionsUpdate', () => {});
    meeting.on('meeting:self:lobbyWaiting', () => {});
    meeting.on('meeting:self:guestAdmitted', () => {});
    meeting.on('meeting:reconnectionStarting', () => {});
    meeting.on('meeting:reconnectionSuccess', () => {});
    meeting.on('meeting:reconnectionFailure', () => {});
    meeting.on('meeting:self:mutedByOthers', () => {});
  }

  meetingAdded(meetingInstance) {
    const {type, meeting} = meetingInstance;

    if (type === 'INCOMING') {
      // The meeting get acknowleged but we dont have to show any UI indication
      meeting.acknowledge(type);
    }

    this.registerMeetingListner(meeting);
  }

  registerEvents() {
    this.datasource.meetings.on('meeting:added', this.meetingAdded);
    this.datasource.meetings.on('meeting:removed', this.meetingRemoved);
  }

  /**
   * Returns an observable that emits meeting data of the given ID.
   *
   * @param {string} ID ID of meeting to get
   * @returns {Observable.<Meetings>}
   * @memberof MeetingsSDKAdapter
   */
  getMeeting(ID) {
    return {
      ID,
      title: '',
      startTime: '', // Valid date-time string
      endTime: '', // Valid date-time string
    };
  }

  setLocalAudioMuted() {}
}
