import {Observable} from 'rxjs';
import {map, distinctUntilChanged} from 'rxjs/operators';
import MeetingControl from './MeetingControl';

/**
 * Display options of a meeting control.
 *
 * @external MeetingControlDisplay
 * @see {@link https://github.com/webex/component-adapter-interfaces/blob/master/src/MeetingsAdapter.js#L58}
 */

export default class JoinControl extends MeetingControl {
  /**
   * Calls the adapter joinMeeting method.
   *
   * @param {string} meetingID  Id of the meeting to join
   */
  async action(meetingID) {
    await this.adapter.joinMeeting(meetingID);
  }

  /**
   * Returns an observable that emits the display data of the control.
   *
   * @returns {Observable.<MeetingControlDisplay>} Observable that emits display of the join control
   */
  // eslint-disable-next-line class-methods-use-this
  display(meetingID) {
    return this.adapter.getMeeting(meetingID).pipe(
      map((meeting) => (
        (meeting.localAudio.stream ? 'Unmuted, ' : 'Muted, ')
        + (meeting.localVideo.stream ? 'video on' : 'video off')
      )),
      distinctUntilChanged(),
      map((hint) => ({
        ID: this.ID,
        type: 'JOIN',
        text: 'Join meeting',
        tooltip: 'Join meeting',
        hint,
      })),
    );
  }
}
