import * as rxjs from 'rxjs';
import {flatMap} from 'rxjs/operators';

import MeetingSDKAdapter from './MeetingsSDKAdapter';
import createMockSDK from './__mocks__/sdk';

describe('Meetings SDK Adapter', () => {
  let meetingSDKAdapter, mockSDK, meetingID, meeting, target;

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
      remoteAudio: null,
      remoteVideo: null,
      remoteShare: null,
      title: 'my meeting',
    };
    target = 'target';
  });

  afterEach(() => {
    meeting = null;
    rxjs.fromEvent = null;
    mockSDK = null;
    meetingSDKAdapter = null;
    meetingID = null;
    target = null;
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

    test('sets `remoteAudio`, if the event type is `remoteAudio`', () => {
      const event = {
        type: 'remoteAudio',
        stream: 'remoteAudio',
      };

      meetingSDKAdapter.attachMedia(meetingID, event);
      expect(meetingSDKAdapter.meetings[meetingID]).toMatchObject({
        remoteAudio: 'remoteAudio',
      });
    });

    test('sets `remoteVideo`, if the event type is `remoteVideo`', () => {
      const event = {
        type: 'remoteVideo',
        stream: 'remoteVideo',
      };

      meetingSDKAdapter.attachMedia(meetingID, event);
      expect(meetingSDKAdapter.meetings[meetingID]).toMatchObject({
        remoteVideo: 'remoteVideo',
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

  describe('createMeeting()', () => {
    test('returns a new meeting in a proper shape', (done) => {
      meetingSDKAdapter.createMeeting(target).subscribe((newMeeting) => {
        expect(newMeeting).toMatchObject(meeting);
        done();
      });
    });

    test('throws error on failed meeting push request', (done) => {
      const wrongTarget = 'wrongTarget';
      const errorMessage = `Unable to create a meeting "${wrongTarget}"`;

      meetingSDKAdapter.datasource.meetings.create = jest.fn(() => Promise.reject(errorMessage));
      meetingSDKAdapter.createMeeting(target).subscribe(
        () => {},
        (error) => {
          expect(error).toBe(errorMessage);
          done();
        }
      );
    });
  });

  describe('joinControl()', () => {
    test('returns the display data of a meeting control in a proper shape', (done) => {
      meetingSDKAdapter.joinControl().subscribe((dataDisplay) => {
        expect(dataDisplay).toMatchObject({
          ID: 'join-meeting',
          text: 'Join meeting',
          tooltip: 'Join meeting',
          state: 'active',
        });
        done();
      });
    });
  });

  describe('getMeeting()', () => {
    test('returns a meeting in a proper shape', (done) => {
      meetingSDKAdapter
        .createMeeting(target)
        .pipe(flatMap(() => meetingSDKAdapter.getMeeting(meetingID)))
        .subscribe((getMeeting) => {
          expect(getMeeting).toMatchObject(meeting);
          done();
        });
    });

    test('stops listening to events when unsubscribing', () => {
      const subscription = meetingSDKAdapter
        .createMeeting(target)
        .pipe(flatMap(() => meetingSDKAdapter.getMeeting(meetingID)))
        .subscribe();

      subscription.unsubscribe();
      expect(meetingSDKAdapter.getMeetingObservables).toEqual({});
    });

    test('throws error on failed meeting fetch request', (done) => {
      meetingID = 'invalid meetingID';
      const errorMessage = `Could not find meeting with ID "${meetingID}"`;

      meetingSDKAdapter
        .createMeeting(target)
        .pipe(flatMap(() => meetingSDKAdapter.getMeeting(meetingID)))
        .subscribe(
          () => {},
          (error) => {
            expect(error.message).toBe(errorMessage);
            done();
          }
        );
    });
  });
});
