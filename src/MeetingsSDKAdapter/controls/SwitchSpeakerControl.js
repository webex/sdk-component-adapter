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

export default class SwitchSpeakerControl extends MeetingControl {
  /**
   * Calls the the action of the switch speaker control.
   *
   * @param {string} meetingID  Meeting ID
   * @param {string} speakerID  ID of the speaker device to switch to
   */
  async action(meetingID, speakerID) {
    await this.adapter.switchSpeaker(meetingID, speakerID);
  }

  /**
   * Returns and observable that emits the display data of the control.
   *
   * @param {string} meetingID  Meeting ID
   * @returns {Observable.<MeetingControlDisplay>} Observable that emits control display of the control
   */
  display(meetingID) {
    const speakerID$ = this.adapter.getMeeting(meetingID).pipe(
      map((meeting) => meeting.speakerID),
      distinctUntilChanged(),
    );
    const options$ = defer(() => this.adapter.getAvailableDevices(meetingID, 'audiooutput')).pipe(
      map((availableSpeakers) => availableSpeakers.map((speaker) => ({
        value: speaker.deviceId,
        label: speaker.label,
      }))),
    );

    return combineLatestImmediate(speakerID$, options$).pipe(
      map(([speakerID, options]) => ({
        ID: this.ID,
        tooltip: 'Speaker Devices',
        noOptionsMessage: 'No available speakers',
        options: options || null,
        selected: speakerID || null,
      })),
    );
  }
}
