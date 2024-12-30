import {Observable, of} from 'rxjs';
import {tap} from 'rxjs/operators';
import logger from '../../logger';
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
  async action({meetingID}) {
    logger.debug('MEETING', meetingID, 'ExitControl::action()', ['called with', {meetingID}]);

    await this.adapter.leaveMeeting(meetingID);
  }

  /**
   * Returns and observable that emits the display data of the control.
   *
   * @param meetingID
   * @returns {Observable.<MeetingControlDisplay>} Observable that emits display of the exit control
   */
  // eslint-disable-next-line class-methods-use-this
  display(meetingID) {
    logger.debug('MEETING', meetingID, 'ExitControl::display()', 'called');

    return of({
      ID: this.ID,
      type: 'CANCEL',
      icon: 'cancel',
      tooltip: 'Leave meeting',
    }).pipe(
      tap((display) => logger.debug('MEETING', meetingID, 'ExitControl::display()', ['emitting', display])),
    );
  }
}
