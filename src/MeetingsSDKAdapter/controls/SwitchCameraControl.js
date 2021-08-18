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

export default class SwitchCameraControl extends MeetingControl {
  /**
   * Calls the action of the switch camera control.
   *
   * @param {string} meetingID  Meeting ID
   * @param {string} cameraID  Id of the camera to switch to
   */
  async action(meetingID, cameraID) {
    await this.adapter.switchCamera(meetingID, cameraID);
  }

  /**
   * Returns an observable that emits the display data of the switch camera control.
   *
   * @param {string} meetingID  Meeting ID
   * @returns {Observable.<MeetingControlDisplay>} Observable that emits control display data of the switch camera control
   */
  display(meetingID) {
    const cameraID$ = this.adapter.getMeeting(meetingID).pipe(
      map((meeting) => meeting.cameraID),
      distinctUntilChanged(),
    );
    const options$ = defer(() => this.adapter.getAvailableDevices(meetingID, 'videoinput')).pipe(
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
      })),
    );
  }
}
