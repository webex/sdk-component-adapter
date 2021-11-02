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

export default class AudioControl extends MeetingControl {
  /**
   * Calls the adapter handleLocalAudio() method
   *
   * @private
   * @param {string} meetingID  ID of the meeting to mute audio
   */
  action(meetingID) {
    return this.adapter.handleLocalAudio(meetingID);
  }

  /**
   * Returns an observable that emits the display data of a mute meeting audio control.
   *
   * @private
   * @param {string} meetingID  ID of the meeting to mute audio
   * @returns {Observable.<MeetingControlDisplay>} Observable stream that emits display data of the audio control
   */
  display(meetingID) {
    const muted = {
      ID: this.ID,
      type: 'BUTTON',
      icon: 'microphone-muted',
      tooltip: 'Unmute audio',
      state: MeetingControlState.ACTIVE,
      text: 'Unmute',
    };
    const unmuted = {
      ID: this.ID,
      type: 'BUTTON',
      icon: 'microphone',
      tooltip: 'Mute audio',
      state: MeetingControlState.INACTIVE,
      text: 'Mute',
    };
    const disabled = {
      ID: this.ID,
      type: 'BUTTON',
      icon: 'microphone-muted',
      state: MeetingControlState.DISABLED,
      text: 'No microphone',
    };

    return this.adapter.getMeeting(meetingID).pipe(
      map(({localAudio: {stream}, disabledLocalAudio}) => (
        (stream && unmuted) || (disabledLocalAudio && muted) || disabled
      )),
      distinctUntilChanged(),
    );
  }
}
