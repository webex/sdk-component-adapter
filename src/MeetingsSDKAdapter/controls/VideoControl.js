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

export default class VideoControl extends MeetingControl {
  /**
   * Calls the adapter handleLocalVideo() method
   *
   * @param {string} meetingID  Meeting id
   */
  action(meetingID) {
    logger.debug('MEETING', meetingID, 'VideoControl::action()', ['called with', {meetingID}]);

    return this.adapter.handleLocalVideo(meetingID);
  }

  /**
   * Returns an observable that emits the display data of a mute meeting video control.
   *
   * @param {string} meetingID  Meeting id
   * @returns {Observable.<MeetingControlDisplay>} Observable stream that emits display data of the video control
   */
  display(meetingID) {
    logger.debug('MEETING', meetingID, 'VideoControl::display()', ['called with', {meetingID}]);

    const common = {
      ID: this.ID,
      type: 'BUTTON',
    };

    const STATES = {
      muted: {
        icon: 'camera-muted',
        tooltip: 'Start video',
        state: MeetingControlState.ACTIVE,
        text: 'Start video',
      },
      unmuted: {
        icon: 'camera',
        tooltip: 'Stop video',
        state: MeetingControlState.INACTIVE,
        text: 'Stop video',
      },
      muting: {
        icon: 'camera',
        tooltip: 'Stopping video',
        state: MeetingControlState.DISABLED,
        text: 'Stopping...',
      },
      unmuting: {
        icon: 'camera-muted',
        tooltip: 'Starting video',
        state: MeetingControlState.DISABLED,
        text: 'Starting...',
      },
      noCamera: {
        icon: 'camera-muted',
        tooltip: 'No camera available',
        state: MeetingControlState.DISABLED,
        text: 'No camera',
      },
    };

    return this.adapter.getMeeting(meetingID).pipe(
      map(({localVideo: {stream, muting, error}, disabledLocalVideo}) => (
        (muting === true && STATES.muting)
        || (muting === false && STATES.unmuting)
        || (stream && STATES.unmuted)
        || (disabledLocalVideo && STATES.muted)
        || (error && {...STATES.noCamera, tooltip: error})
        || STATES.noCamera
      )),
      distinctUntilChanged(),
      map((state) => ({...common, ...state})),
      tap((display) => logger.debug('MEETING', meetingID, 'VideoControl::display()', ['emitting', display])),
    );
  }
}
