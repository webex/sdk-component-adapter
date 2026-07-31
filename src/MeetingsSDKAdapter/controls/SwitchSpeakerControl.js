import {Observable} from 'rxjs';
import {distinctUntilChanged, map, tap} from 'rxjs/operators';
import logger from '../../logger';
import MeetingControl from './MeetingControl';
import {combineLatestImmediate, isSpeakerSupported, resolveDeviceSwitchArgs} from '../../utils';
/**
 * Display options of a meeting control.
 *
 * @external MeetingControlDisplay
 * @see {@link https://github.com/webex/component-adapter-interfaces/blob/master/src/MeetingsAdapter.js#L58}
 */

export default class SwitchSpeakerControl extends MeetingControl {
  /**
   * Calls the action of the switch speaker control.
   *
   * @param {object|string} meetingContext  Meeting context object or meeting ID string (@webex/components)
   * @param {string} [meetingContext.meetingID]  Meeting ID when passed on the context object (PR #346 call shape)
   * @param {string} [meetingContext.speakerId]  Speaker device ID on the context object (PR #346 call shape)
   * @param {string} [deviceId]  Speaker device ID as the second argument (@webex/components call shape)
   */
  async action(meetingContext, deviceId) {
    const {meetingID, deviceId: speakerId} = resolveDeviceSwitchArgs(
      meetingContext,
      deviceId,
      'speakerId',
    );

    if (speakerId == null) {
      logger.warn('MEETING', meetingID, 'SwitchSpeakerControl::action()', 'No speaker device ID provided');

      return;
    }

    logger.debug('MEETING', meetingID, 'SwitchSpeakerControl::action()', ['called with', {meetingID, speakerId}]);

    await this.adapter.switchSpeaker(meetingID, speakerId);
  }

  /**
   * Returns and observable that emits the display data of the control.
   *
   * @param {string} meetingID  Meeting ID
   * @returns {Observable.<MeetingControlDisplay>} Observable that emits control display of the control
   */
  display(meetingID) {
    logger.debug('MEETING', meetingID, 'SwitchSpeakerControl::display()', ['called with', {meetingID}]);

    const speakerID$ = this.adapter.getMeeting(meetingID).pipe(
      map((meeting) => meeting.speakerID),
      distinctUntilChanged(),
    );

    const options$ = this.adapter.getAvailableDevices(meetingID, 'audiooutput').pipe(
      map((availableSpeakers) => availableSpeakers.map((speaker) => ({
        value: speaker.deviceId,
        label: speaker.label,
      }))),
      map((options) => ([{value: '', label: 'Browser Default'}, ...options])),
    );

    return combineLatestImmediate(speakerID$, options$).pipe(
      map(([speakerID, options]) => ({
        ID: this.ID,
        type: 'MULTISELECT',
        // The browser api setSinkId() does not work properly on Firefox and Safari browsers so we need to treat them separately by displaying a message inside a tooltip in both cases.
        // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/setSinkId
        tooltip: isSpeakerSupported ? 'Speaker Devices' : 'The current browser does not support changing speakers',
        noOptionsMessage: 'No available speakers',
        options: options || null,
        selected: speakerID || null,
        hint: 'Use arrow keys to navigate between speaker options and hit "Enter" to select.',
      })),
      tap((display) => logger.debug('MEETING', meetingID, 'SwitchSpeakerControl::display()', ['emitting', display])),
    );
  }
}
