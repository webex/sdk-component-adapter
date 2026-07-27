import {Observable} from 'rxjs';
import {distinctUntilChanged, map, tap} from 'rxjs/operators';
import logger from '../../logger';
import MeetingControl from './MeetingControl';
import {combineLatestImmediate, resolveDeviceSwitchArgs} from '../../utils';

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
   * @param {object|string} contextOrMeetingID  Meeting context object or meeting ID string (@webex/components)
   * @param {string} context.meetingID  Meeting ID when passed on the context object (PR #346 call shape)
   * @param {string} [context.microphoneId]  Microphone device ID on the context object (PR #346 call shape)
   * @param {string} [deviceId]  Microphone device ID as the second argument (@webex/components call shape)
   */
  async action(contextOrMeetingID, deviceId) {
    const {meetingID, deviceId: microphoneId} = resolveDeviceSwitchArgs(
      contextOrMeetingID,
      deviceId,
      'microphoneId',
    );

    if (microphoneId == null) {
      logger.warn('MEETING', meetingID, 'SwitchMicrophoneControl::action()', 'No microphone device ID provided');

      return;
    }

    logger.debug('MEETING', meetingID, 'SwitchMicrophoneControl::action()', ['called with', {meetingID, microphoneId}]);

    await this.adapter.switchMicrophone(meetingID, microphoneId);
  }

  /**
   * Returns an observable that emits the display data of the switch microphone control.
   *
   * @param {string} meetingID  Meeting ID
   * @returns {Observable.<MeetingControlDisplay>} Observable that emits control display data of the switch microphone control
   */
  display(meetingID) {
    logger.debug('MEETING', meetingID, 'SwitchMicrophoneControl::display()', ['called with', {meetingID}]);

    const microphoneID$ = this.adapter.getMeeting(meetingID).pipe(
      map((meeting) => meeting.microphoneID),
      distinctUntilChanged(),
    );

    const options$ = this.adapter.getAvailableDevices(meetingID, 'audioinput').pipe(
      map((availableMicrophones) => availableMicrophones.map((microphone) => ({
        value: microphone.deviceId,
        label: microphone.label,
      }))),
    );

    return combineLatestImmediate(microphoneID$, options$).pipe(
      map(([microphoneID, options]) => ({
        ID: this.ID,
        type: 'MULTISELECT',
        tooltip: 'Audio Devices',
        noOptionsMessage: 'No available microphones',
        options: options || null,
        selected: microphoneID || null,
        hint: 'Use arrow keys to navigate between microphone options and hit "Enter" to select.',
      })),
      tap((display) => logger.debug('MEETING', meetingID, 'SwitchMicrophoneControl::display()', ['emitting', display])),
    );
  }
}
