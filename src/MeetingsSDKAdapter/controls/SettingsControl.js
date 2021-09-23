import {Observable} from 'rxjs';
import {map, distinctUntilChanged} from 'rxjs/operators';
import {MeetingControlState} from '@webex/component-adapter-interfaces';
import MeetingControl from './MeetingControl';

/**
 * Display options of a meeting control.
 *
 * @external MeetingControlDisplay
 * @see {@link https://github.com/webex/component-adapter-interfaces/blob/master/src/MeetingsAdapter.js#L58}
 */

export default class SettingsControl extends MeetingControl {
  /**
   * Toggles the showSettings flag of the given meeting ID.
   * A settings toggle event is dispatched.
   *
   * @param {string} meetingID  Meeting ID
   */
  action(meetingID) {
    this.adapter.toggleSettings(meetingID);
  }

  /**
   * Returns an observable that emits the display data of a settings control.
   *
   * @param {string} meetingID  Meeting id
   * @returns {Observable.<MeetingControlDisplay>} Observable stream that emits display data of the settings control
   */
  display(meetingID) {
    const active = {
      ID: this.ID,
      type: 'TOGGLE',
      state: MeetingControlState.ACTIVE,
      icon: 'settings_32',
      text: 'Settings',
      tooltip: 'Meeting settings',
    };
    const inactive = {
      ID: this.ID,
      type: 'TOGGLE',
      state: MeetingControlState.INACTIVE,
      icon: 'settings_32',
      text: 'Settings',
      tooltip: 'Meeting settings',
    };

    return this.adapter.getMeeting(meetingID).pipe(
      map(({showSettings}) => (showSettings ? active : inactive)),
      distinctUntilChanged(),
    );
  }
}
