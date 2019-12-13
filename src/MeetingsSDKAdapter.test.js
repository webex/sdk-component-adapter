import * as rxjs from 'rxjs';
import {flatMap} from 'rxjs/operators';

import MeetingSDKAdapter from './MeetingsSDKAdapter';
import createMockSDK, {mockSDKMeeting} from './__mocks__/sdk';

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

  describe('addLocalMedia()', () => {
    test('throws errors if the local media is not added to the meeting successfully', async () => {
      mockSDKMeeting.getMediaStreams = jest.fn(() => Promise.reject());
      global.console.error = jest.fn();
      await meetingSDKAdapter.addLocalMedia(meetingID);

      expect(global.console.error).toHaveBeenCalledWith('Unable to add local media to meeting "meetingID"', undefined);
    });
  });

  describe('attachMedia()', () => {
    test('sets `localAudio` and `localVideo`, if the event type is `local`', () => {
      const mockMediaStreamInstance = {
        getAudioTrack: () => [],
        getVideoTrack: () => [],
      };
      const event = {
        type: 'local',
        stream: {
          getAudioTracks: jest.fn(() => ['localAudio']),
          getVideoTracks: jest.fn(() => ['localVideo']),
        },
      };

      global.MediaStream = jest.fn(() => mockMediaStreamInstance);

      meetingSDKAdapter.attachMedia(meetingID, event);
      expect(meetingSDKAdapter.meetings[meetingID]).toMatchObject({
        localAudio: mockMediaStreamInstance,
        localVideo: mockMediaStreamInstance,
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

  describe('audioControl()', () => {
    test('returns the display data of a meeting control in a proper shape', (done) => {
      meetingSDKAdapter.audioControl(meetingID).subscribe((dataDisplay) => {
        expect(dataDisplay).toMatchObject({
          ID: 'audio',
          icon: 'microphone-muted',
          tooltip: 'Mute',
          state: 'inactive',
          text: null,
        });
        done();
      });
    });

    test('throws errors if sdk meeting object is not defined', (done) => {
      meetingSDKAdapter.fetchMeeting = jest.fn();

      meetingSDKAdapter.audioControl(meetingID).subscribe(
        () => {},
        (error) => {
          expect(error.message).toBe('Could not find meeting with ID "meetingID" to add audio control');
          done();
        }
      );
    });
  });

  describe('handleLocalAudio()', () => {
    beforeEach(() => {
      meetingSDKAdapter.meetings[meetingID] = {
        ...meeting,
        localAudio: {
          getAudioTracks: jest.fn(() => [{enabled: true}]),
        },
      };
    });

    test('mutes audio if the the audio track is enabled', () => {
      meetingSDKAdapter.handleLocalAudio(meetingID);
      expect(mockSDKMeeting.muteAudio).toHaveBeenCalled();
    });

    test('emits the custom event after muting the audio track', () => {
      meetingSDKAdapter.handleLocalAudio(meetingID);
      expect(mockSDKMeeting.emit).toHaveBeenCalledWith('adapter:media:local:update', {
        control: 'audio',
        state: true,
      });
    });

    test('unmutes audio if the the audio track is disabled', () => {
      meetingSDKAdapter.meetings[meetingID].localAudio.getAudioTracks = jest.fn(() => [{enabled: false}]);
      meetingSDKAdapter.handleLocalAudio(meetingID);
      expect(mockSDKMeeting.unmuteAudio).toHaveBeenCalled();
    });

    test('emits the custom event after unmuting the audio track', () => {
      meetingSDKAdapter.meetings[meetingID].localAudio.getAudioTracks = jest.fn(() => [{enabled: false}]);
      meetingSDKAdapter.handleLocalAudio(meetingID);
      expect(mockSDKMeeting.emit).toHaveBeenCalledWith('adapter:media:local:update', {
        control: 'audio',
        state: false,
      });
    });

    test('throws error if audio control is not handled properly', async () => {
      mockSDKMeeting.muteAudio = jest.fn(() => Promise.reject());
      global.console.error = jest.fn();
      await meetingSDKAdapter.handleLocalAudio(meetingID);

      expect(global.console.error).toHaveBeenCalledWith(
        'Unable to update local audio settings for meeting "meetingID"',
        undefined
      );
    });
  });
  describe('muteVideoControl()', () => {
    test('returns the display data of a meeting control in a proper shape', (done) => {
      meetingSDKAdapter.muteVideoControl(meetingID).subscribe((dataDisplay) => {
        expect(dataDisplay).toMatchObject({
          ID: 'mute-video',
          icon: 'camera',
          tooltip: 'Mute',
          state: 'active',
          text: null,
        });
        done();
      });
    });

    test('throws errors if sdk meeting object is not defined', (done) => {
      meetingSDKAdapter.fetchMeeting = jest.fn();

      meetingSDKAdapter.muteVideoControl(meetingID).subscribe(
        () => {},
        (error) => {
          expect(error.message).toBe('Could not find meeting with ID "meetingID" to mute video on');
          done();
        }
      );
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
