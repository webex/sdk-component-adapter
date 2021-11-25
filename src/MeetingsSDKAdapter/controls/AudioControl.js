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

export default class AudioControl extends MeetingControl {
  /**
   * Calls the adapter handleLocalAudio() method
   *
   * @private
   * @param {string} meetingID  ID of the meeting to mute audio
   */
  action(meetingID) {
    logger.debug('MEETING', meetingID, 'AudioControl::action()', ['called with', {meetingID}]);

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
    logger.debug('MEETING', meetingID, 'AudioControl::display()', ['called with', {meetingID}]);

    const common = {
      ID: this.ID,
      type: 'BUTTON',
    };

    const STATES = {
      muted: {
        icon: 'microphone-muted',
        tooltip: 'Unmute audio',
        state: MeetingControlState.ACTIVE,
        text: 'Unmute',
      },
      unmuted: {
        icon: 'microphone',
        tooltip: 'Mute audio',
        state: MeetingControlState.INACTIVE,
        text: 'Mute',
      },
      muting: {
        icon: 'microphone',
        tooltip: 'Muting audio',
        state: MeetingControlState.DISABLED,
        text: 'Muting...',
      },
      unmuting: {
        icon: 'microphone-muted',
        tooltip: 'Unmuting audio',
        state: MeetingControlState.DISABLED,
        text: 'Unmuting...',
      },
      noMicrophone: {
        icon: 'microphone-muted',
        tooltip: 'No microphone available',
        state: MeetingControlState.DISABLED,
        text: 'No microphone',
      },
    };

    return this.adapter.getMeeting(meetingID).pipe(
      map(({localAudio: {stream, muting}, disabledLocalAudio}) => (
        (muting === true && STATES.muting)
          || (muting === false && STATES.unmuting)
          || (stream && STATES.unmuted)
          || (disabledLocalAudio && STATES.muted)
          || STATES.noMicrophone
      )),
      distinctUntilChanged(),
      map((state) => ({...common, ...state})),
      tap((display) => logger.debug('MEETING', meetingID, 'AudioControl::display()', ['emitting', display])),
    );
  }
}
