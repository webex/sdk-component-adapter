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

export default class SwitchCameraControl extends MeetingControl {
  /**
   * Calls the action of the switch camera control.
   *
   * @param {object|string} contextOrMeetingID  Meeting context object or meeting ID string (@webex/components)
   * @param {string} context.meetingID  Meeting ID when passed on the context object (PR #346 call shape)
   * @param {string} [context.cameraId]  Camera device ID on the context object (PR #346 call shape)
   * @param {string} [deviceId]  Camera device ID as the second argument (@webex/components call shape)
   */
  async action(contextOrMeetingID, deviceId) {
    const {meetingID, deviceId: cameraId} = resolveDeviceSwitchArgs(
      contextOrMeetingID,
      deviceId,
      'cameraId',
    );

    if (cameraId == null) {
      logger.warn('MEETING', meetingID, 'SwitchCameraControl::action()', 'No camera device ID provided');

      return;
    }

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
