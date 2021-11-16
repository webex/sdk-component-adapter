import {Observable} from 'rxjs';
import {distinctUntilChanged, map, tap} from 'rxjs/operators';
import {MeetingControlState} from '@webex/component-adapter-interfaces';
import logger from '../../logger';
import MeetingControl from './MeetingControl';

/**
 * Display options of a meeting control.
 *
 * @external MeetingControlDisplay
 * @see {@link https://github.com/webex/component-adapter-interfaces/blob/master/src/MeetingsAdapter.js#L58}
 */

export default class ShareControl extends MeetingControl {
  /**
   * Calls the adapter handleLocalShare() method
   *
   * @param {string} meetingID  ID of the meeting to share screen
   */
  async action(meetingID) {
    logger.debug('MEETING', meetingID, 'ShareControl::action()', ['called with', {meetingID}]);

    await this.adapter.handleLocalShare(meetingID);
  }

  /**
   * Returns an observable that emits the display data of a share control.
   *
   * @param {string} meetingID  ID of the meeting to start/stop screen share
   * @returns {Observable.<MeetingControlDisplay>} Observable stream that emits display data of the screen share control
   */
  display(meetingID) {
    logger.debug('MEETING', meetingID, 'ShareControl::display()', ['called with', {meetingID}]);
    const inactive = {
      ID: this.ID,
      type: 'TOGGLE',
      state: MeetingControlState.INACTIVE,
      icon: 'share-screen-presence-stroke',
      text: 'Start sharing',
      tooltip: 'Start sharing content',
    };
    const active = {
      ID: this.ID,
      type: 'TOGGLE',
      state: MeetingControlState.ACTIVE,
      icon: 'share-screen-presence-stroke',
      text: 'Stop sharing',
      tooltip: 'Stop sharing content',
    };

    return this.adapter.getMeeting(meetingID).pipe(
      map(({localShare: {stream}}) => (stream ? active : inactive)),
      distinctUntilChanged(),
      tap((display) => logger.debug('MEETING', meetingID, 'ShareControl::display()', ['emitting', display])),
    );
  }
}
