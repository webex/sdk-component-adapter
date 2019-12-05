import * as rxjs from 'rxjs';

import MeetingSDKAdapter from './MeetingsSDKAdapter';
import createMockSDK from './__mocks__/sdk';

describe('Meetings SDK Adapter', () => {
  let meetingSDKAdapter, mockSDK, meetingID, meeting;

  beforeEach(() => {
    mockSDK = createMockSDK();
    meetingSDKAdapter = new MeetingSDKAdapter(mockSDK);
    meetingID = 'meetingID';
    rxjs.fromEvent = jest.fn(() => rxjs.of({}));
    meeting = {
      ID: meetingID,
      localAudio: null,
      localShare: null,
      localVideo: null,
      remoteShare: null,
      remoteStream: null,
      title: 'my meeting',
    };
  });

  afterEach(() => {
    meeting = null;
    rxjs.fromEvent = null;
    mockSDK = null;
    meetingSDKAdapter = null;
    meetingID = null;
  });

  describe('attachMedia()', () => {
    test('sets `localAudio` and `localVideo`, if the event type is `local`', () => {
      const event = {
        type: 'local',
        stream: {
          getAudioTracks: jest.fn(() => ['localAudio']),
          getVideoTracks: jest.fn(() => ['localVideo']),
        },
      };

      meetingSDKAdapter.attachMedia(meetingID, event);
      expect(meetingSDKAdapter.meetings[meetingID]).toMatchObject({
        localAudio: 'localAudio',
        localVideo: 'localVideo',
      });
    });

    test('returns the same meeting object, if the event type is not declared', () => {
      meetingSDKAdapter.meetings[meetingID] = meeting;
      const event = {
        type: 'NA',
        stream: {},
      };

      meetingSDKAdapter.attachMedia(meetingID, event);
      expect(meetingSDKAdapter.meetings[meetingID]).toMatchObject(meeting);
    });
  });

  describe('getMeeting()', () => {
    test('returns a meeting in a proper shape', (done) => {
      meetingSDKAdapter.getMeeting(meetingID).subscribe((getMeeting) => {
        expect(getMeeting).toMatchObject(meeting);
        done();
      });
    });

    test('stops listening to events when unsubscribing', () => {
      const subscription = meetingSDKAdapter.getMeeting(meetingID).subscribe();

      subscription.unsubscribe();
      expect(meetingSDKAdapter.getMeetingObservables).toEqual({});
    });

    test('throws error on failed meeting fetch request', (done) => {
      meetingID = 'invalid meetingID';
      const errorMessage = `Could not find meeting with ID "${meetingID}"`;

      meetingSDKAdapter.getMeeting(meetingID).subscribe(
        () => {},
        (error) => {
          expect(error.message).toBe(errorMessage);
          done();
        }
      );
    });
  });
});
