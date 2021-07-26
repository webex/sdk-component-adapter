import {
  defer,
  Observable,
} from 'rxjs';
import {map, distinctUntilChanged} from 'rxjs/operators';
import MeetingControl from './MeetingControl';
import {combineLatestImmediate} from '../../utils';

/**
 * Display options of a meeting control.
 *
 * @external MeetingControlDisplay
 * @see {@link https://github.com/webex/component-adapter-interfaces/blob/master/src/MeetingsAdapter.js#L58}
 */

export default class SwitchMicrophoneControl extends MeetingControl {
  /**
   * Switches the microphone control.
   *
   * @param {string} meetingID  Meeting ID
   * @param {string} microphoneID  Id of the microphone to switch to
   */
  async action(meetingID, microphoneID) {
    await this.adapter.switchMicrophone(meetingID, microphoneID);
  }

  /**
   * Returns an observable that emits the display data of the switch microphone control.
   *
   * @param {string} meetingID  Meeting ID
   * @returns {Observable.<MeetingControlDisplay>} Observable that emits control display data of the switch microphone control
   */
  display(meetingID) {
    const microphoneID$ = this.adapter.getMeeting(meetingID).pipe(
      map((meeting) => meeting.microphoneID),
      distinctUntilChanged(),
    );

    const options$ = defer(() => this.adapter.getAvailableDevices(meetingID, 'audioinput')).pipe(
      map((availableMicrophones) => availableMicrophones.map((microphone) => ({
        value: microphone.deviceId,
        label: microphone.label,
      }))),
    );

    return combineLatestImmediate(microphoneID$, options$).pipe(
      map(([microphoneID, options]) => ({
        ID: this.ID,
        tooltip: 'Audio Devices',
        noOptionsMessage: 'No available microphones',
        options: options || null,
        selected: microphoneID || null,
      })),
    );
  }
}
