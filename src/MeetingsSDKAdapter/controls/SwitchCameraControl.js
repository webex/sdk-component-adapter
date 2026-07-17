import {Observable} from 'rxjs';
import {distinctUntilChanged, map, tap} from 'rxjs/operators';
import logger from '../../logger';
import MeetingControl from './MeetingControl';
import {combineLatestImmediate} from '../../utils';
/**
 * Display options of a meeting control.
 *
 * @external MeetingControlDisplay
 * @see {@link https://github.com/webex/component-adapter-interfaces/blob/master/src/MeetingsAdapter.js#L58}
 */

export default class SwitchCameraControl extends MeetingControl {
  /**
   * Calls the action of the switch camera control.
   *
   * @param {object} context  Meeting control context
   * @param {string} context.meetingID  Meeting ID
   * @param {string} [context.cameraId]  Id of the camera to switch to
   * @param {string} [deviceId]  Id of the camera to switch to (passed by @webex/components)
   */
  async action(context, deviceId) {
    const {meetingID} = context;
    const cameraId = context.cameraId != null ? context.cameraId : deviceId;

    logger.debug('MEETING', meetingID, 'SwitchCameraControl::action()', ['called with', {meetingID, cameraId}]);

    await this.adapter.switchCamera(meetingID, cameraId);
  }

  /**
   * Returns an observable that emits the display data of the switch camera control.
   *
   * @param {string} meetingID  Meeting ID
   * @returns {Observable.<MeetingControlDisplay>} Observable that emits control display data of the switch camera control
   */
  display(meetingID) {
    logger.debug('MEETING', meetingID, 'SwitchCameraControl::display()', ['called with', {meetingID}]);

    const cameraID$ = this.adapter.getMeeting(meetingID).pipe(
      map((meeting) => meeting.cameraID),
      distinctUntilChanged(),
    );

    const options$ = this.adapter.getAvailableDevices(meetingID, 'videoinput').pipe(
      map((availableCameras) => availableCameras.map((camera) => ({
        value: camera.deviceId,
        label: camera.label,
      }))),
    );

    return combineLatestImmediate(cameraID$, options$).pipe(
      map(([cameraID, options]) => ({
        ID: this.ID,
        type: 'MULTISELECT',
        tooltip: 'Video Devices',
        noOptionsMessage: 'No available cameras',
        options: options || null,
        selected: cameraID || null,
        hint: 'Use arrow keys to navigate between camera options and hit "Enter" to select.',
      })),
      tap((display) => logger.debug('MEETING', meetingID, 'SwitchCameraControl::display()', ['emitting', display])),
    );
  }
}
