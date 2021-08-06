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
      icon: 'microphone-muted_28',
      tooltip: 'Unmute',
      state: MeetingControlState.ACTIVE,
      text: null,
    };
    const unmuted = {
      ID: this.ID,
      icon: 'microphone-muted_28',
      tooltip: 'Mute',
      state: MeetingControlState.INACTIVE,
      text: null,
    };
    const disabled = {
      ID: this.ID,
      icon: 'microphone-muted_28',
      tooltip: 'No microphone available',
      state: MeetingControlState.DISABLED,
      text: null,
    };

    return this.adapter.getMeeting(meetingID).pipe(
      map(({localAudio: {stream}, disabledLocalAudio}) => (
        (stream && unmuted) || (disabledLocalAudio && muted) || disabled
      )),
      distinctUntilChanged(),
    );
  }
}
