import {Observable, of} from 'rxjs';
import MeetingControl from './MeetingControl';

/**
 * Display options of a meeting control.
 *
 * @external MeetingControlDisplay
 * @see {@link https://github.com/webex/component-adapter-interfaces/blob/master/src/MeetingsAdapter.js#L58}
 */

export default class ExitControl extends MeetingControl {
  /**
   * Calls the adapter leaveMeeting method.
   *
   * @param {string} meetingID  Id of the meeting to leave from
   */
  async action(meetingID) {
    await this.adapter.leaveMeeting(meetingID);
  }

  /**
   * Returns and observable that emits the display data of the control.
   *
   * @returns {Observable.<MeetingControlDisplay>} Observable that emits display of the exit control
   */
  // eslint-disable-next-line class-methods-use-this
  display() {
    return of({
      ID: this.ID,
      type: 'CANCEL',
      icon: 'cancel_28',
      tooltip: 'Leave',
    });
  }
}
