import * as rxjs from 'rxjs';
import {
  take,
  last,
  concatMap,
  first,
} from 'rxjs/operators';

import {createMockSDKMediaStreams} from './mockSdk';
import {meetingID, createTestMeetingsSDKAdapter} from './MeetingsSDKAdapter/testHelper';

describe('Meetings SDK Adapter', () => {
  let meeting;
  let meetingsSDKAdapter;
  let mockSDK;
  let mockSDKMeeting;
  let mockSDKMediaStreams;
  let target;

  beforeEach(() => {
    global.DOMException = jest.fn();
    meetingsSDKAdapter = createTestMeetingsSDKAdapter();
    meeting = meetingsSDKAdapter.meetings[meetingID];
    mockSDK = meetingsSDKAdapter.datasource;
    mockSDKMeeting = mockSDK.meetings.getMeetingByType('id', meetingID);
    rxjs.fromEvent = jest.fn(() => rxjs.of({}));
    mockSDKMediaStreams = createMockSDKMediaStreams();
    target = 'target';
  });

  afterEach(() => {
    meeting = null;
    rxjs.fromEvent = null;
    mockSDK = null;
    mockSDKMeeting = null;
    meetingsSDKAdapter = null;
    target = null;
  });

  describe('getLocalMedia()', () => {
    test('returns local media in a proper shape', (done) => {
      meetingsSDKAdapter.getLocalMedia(meetingID).pipe(last()).subscribe((dataDisplay) => {
        expect(dataDisplay.localAudio.stream).toMatchMediaStream(mockSDKMediaStreams.localAudio);
        expect(dataDisplay.localVideo.stream).toMatchMediaStream(mockSDKMediaStreams.localVideo);

        expect(dataDisplay.localAudio.permission).toBe('ALLOWED');
        expect(dataDisplay.localVideo.permission).toBe('ALLOWED');
        done();
      });
    });

    test('throws errors if the local media is not retrieved successfully', (done) => {
      global.console.error = jest.fn();
      const mockConsole = global.console.error;

      mockSDKMeeting.getMediaStreams = jest.fn(() => Promise.reject());
      meetingsSDKAdapter.getLocalMedia(meetingID).pipe(last()).subscribe(
        () => {
          expect(mockConsole).toHaveBeenCalledWith(
            'Unable to retrieve local media stream for meeting',
            'meetingID',
            'with mediaDirection',
            expect.anything(),
            'and audioVideo',
            undefined,
            'reason:',
            undefined,
          );
          done();
        },
      );
    });

    test('nullifies local Audio if the local media is not retrieved successfully', (done) => {
      mockSDKMeeting.getMediaStreams = jest.fn(() => Promise.reject());
      meetingsSDKAdapter.getLocalMedia(meetingID).pipe(last()).subscribe((localMedia) => {
        expect(localMedia.localAudio.stream).toBeNull();
        done();
      });
    });

    test('nullifies local Video if the local media is not retrieved successfully', (done) => {
      mockSDKMeeting.getMediaStreams = jest.fn(() => Promise.reject());
      meetingsSDKAdapter.getLocalMedia(meetingID).subscribe((localMedia) => {
        expect(localMedia.localVideo.stream).toBeNull();
        done();
      });
    });
  });

  describe('getStream()', () => {
    afterEach(() => {
      mockSDKMeeting.getMediaStreams = jest.fn((constraint) => Promise.resolve([
        constraint.sendAudio
          ? mockSDKMediaStreams.localAudio
          : mockSDKMediaStreams.localVideo,
      ]));
    });

    test('logs errors and returns a null stream and error status if stream cannot be retrieved', (done) => {
      global.console.error = jest.fn();
      mockSDKMeeting.getMediaStreams = jest.fn(() => Promise.reject());
      meetingsSDKAdapter.getStream(meetingID, {sendAudio: true}).pipe(last()).subscribe(
        ({permission, stream}) => {
          expect(stream).toBeNull();
          expect(permission).toBe('ERROR');
          expect(global.console.error).toHaveBeenCalledWith(
            'Unable to retrieve local media stream for meeting',
            'meetingID',
            'with mediaDirection',
            {sendAudio: true},
            'and audioVideo',
            undefined,
            'reason:',
            undefined,
          );
          done();
        },
      );
    });

    test('throws errors, nullifies local video and sets permissions to denied, dismissed or error if not retrieved successfully', (done) => {
      const permissions = [
        'DENIED',
        'DISMISSED',
        'ERROR',
      ];

      mockSDKMeeting.getMediaStreams = jest.fn(() => Promise.reject());
      global.console.error = jest.fn();
      meetingsSDKAdapter.getStream(meetingID, {sendVideo: true}).pipe(
        last(),
      ).subscribe(
        ({permission, stream}) => {
          expect(stream).toBeNull();
          expect(permissions.indexOf(permission)).toBeGreaterThan(-1);
          done();
        },
        (error) => {
          done.fail(error);
        },
      );
    });

    test('returns local media in a proper shape', (done) => {
      meetingsSDKAdapter.getStream(meetingID, {sendAudio: true})
        .pipe(last())
        .subscribe((localMedia) => {
          expect(localMedia.stream).toMatchMediaStream(mockSDKMediaStreams.localAudio);
          expect(localMedia.permission).toBe('ALLOWED');
          done();
        });
      meetingsSDKAdapter.getStream(meetingID, {sendVideo: true}).pipe(
        last(),
      ).subscribe((localMedia) => {
        expect(localMedia.stream).toMatchMediaStream(mockSDKMediaStreams.localVideo);
        expect(localMedia.permission).toBe('ALLOWED');
        done();
      });
    });
  });

  describe('attachMedia()', () => {
    let event;

    beforeEach(() => {
      event = {
        type: 'local',
        stream: mockSDKMediaStreams.localAudioVideo,
      };
    });

    test('keeps `localAudio.stream` empty, if the event type is `local` and the audio stream is empty', () => {
      meetingsSDKAdapter.meetings[meetingID] = {
        ...meeting,
        disabledLocalAudio: mockSDKMediaStreams.localAudio,
      };
      meetingsSDKAdapter.attachMedia(meetingID, event);

      expect(meetingsSDKAdapter.meetings[meetingID]).toMatchObject({
        localAudio: {
          stream: null,
        },
      });
    });

    test('keeps `localVideo.stream` empty, if the event type is `local` and the audio stream is empty', () => {
      meetingsSDKAdapter.meetings[meetingID] = {
        ...meeting,
        disabledLocalVideo: mockSDKMediaStreams.localVideo,
      };
      meetingsSDKAdapter.attachMedia(meetingID, event);

      expect(meetingsSDKAdapter.meetings[meetingID]).toMatchObject({
        localVideo: {
          stream: null,
        },
      });
    });

    test('keeps both `localVideo` and `localVideo` empty, if the event type is `local` and the audio stream is empty', () => {
      meetingsSDKAdapter.meetings[meetingID] = {
        ...meeting,
        disabledLocalVideo: mockSDKMediaStreams.localVideo,
        disabledLocalAudio: mockSDKMediaStreams.localAudio,
      };
      meetingsSDKAdapter.attachMedia(meetingID, event);

      expect(meetingsSDKAdapter.meetings[meetingID]).toMatchObject({
        localVideo: {
          stream: null,
        },
        localAudio: {
          stream: null,
        },
      });
    });

    test('sets `localAudio` and `localVideo`, if the event type is `local`', () => {
      meetingsSDKAdapter.attachMedia(meetingID, event);

      expect(meetingsSDKAdapter.meetings[meetingID].localAudio.stream)
        .toMatchMediaStream(mockSDKMediaStreams.localAudio);
      expect(meetingsSDKAdapter.meetings[meetingID].localVideo.stream)
        .toMatchMediaStream(mockSDKMediaStreams.localVideo);
    });

    test('sets `remoteAudio`, if the event type is `remoteAudio`', () => {
      event = {
        type: 'remoteAudio',
        stream: 'remoteAudio',
      };
      meetingsSDKAdapter.attachMedia(meetingID, event);

      expect(meetingsSDKAdapter.meetings[meetingID]).toMatchObject({
        remoteAudio: 'remoteAudio',
      });
    });

    test('sets `remoteVideo`, if the event type is `remoteVideo`', () => {
      event = {
        type: 'remoteVideo',
        stream: 'remoteVideo',
      };
      meetingsSDKAdapter.attachMedia(meetingID, event);

      expect(meetingsSDKAdapter.meetings[meetingID]).toMatchObject({
        remoteVideo: 'remoteVideo',
      });
    });

    test('sets `remoteShare`, if the event type is `meeting:startedSharingRemote`', () => {
      event = {
        type: 'meeting:startedSharingRemote',
      };
      meetingsSDKAdapter.meetings[meetingID] = {
        ...meeting,
        remoteShareStream: 'remoteShareStream',
      };
      meetingsSDKAdapter.attachMedia(meetingID, event);

      expect(meetingsSDKAdapter.meetings[meetingID]).toMatchObject({
        remoteShare: 'remoteShareStream',
      });
    });

    test('clears `remoteShare`, if the event type is `meeting:stoppedSharingRemote`', () => {
      event = {
        type: 'meeting:stoppedSharingRemote',
      };

      meetingsSDKAdapter.meetings[meetingID] = {
        ...meeting,
        remoteShare: 'remoteShareStream',
      };
      meetingsSDKAdapter.attachMedia(meetingID, event);

      expect(meetingsSDKAdapter.meetings[meetingID]).toMatchObject({
        remoteShare: null,
      });
    });

    test('returns the same meeting object, if the event type is not declared', () => {
      event = {
        type: 'NA',
        stream: {},
      };

      meetingsSDKAdapter.attachMedia(meetingID, event);

      expect(meetingsSDKAdapter.meetings[meetingID]).toMatchObject(meeting);
    });
  });

  describe('stopStream()', () => {
    test('calls stop() of the stream track', () => {
      meetingsSDKAdapter.stopStream(mockSDKMediaStreams.localAudioVideo);

      for (const track of mockSDKMediaStreams.localAudioVideo.getTracks()) {
        expect(track.stop).toHaveBeenCalled();
      }
    });
  });

  describe('removeMedia()', () => {
    let stopStream;

    beforeEach(() => {
      const {trueStopStream} = meetingsSDKAdapter.stopStream;

      stopStream = trueStopStream;
      meetingsSDKAdapter.stopStream = jest.fn();
    });

    afterEach(() => {
      meetingsSDKAdapter.stopStream = stopStream;
    });

    test('removes `localAudio.stream` and `localVideo.stream`, if the event type is `local`', () => {
      meetingsSDKAdapter.removeMedia(meetingID, {type: 'local'});

      expect(meetingsSDKAdapter.meetings[meetingID]).toMatchObject({
        localAudio: {
          stream: null,
        },
        localVideo: {
          stream: null,
        },
      });
    });

    test('removes `remoteAudio`, if the event type is `remoteAudio`', () => {
      const event = {
        type: 'remoteAudio',
      };

      meetingsSDKAdapter.removeMedia(meetingID, event);

      expect(meetingsSDKAdapter.meetings[meetingID]).toMatchObject({
        remoteAudio: null,
      });
    });

    test('removes `remoteVideo`, if the event type is `remoteVideo`', () => {
      const event = {
        type: 'remoteVideo',
      };

      meetingsSDKAdapter.removeMedia(meetingID, event);

      expect(meetingsSDKAdapter.meetings[meetingID]).toMatchObject({
        remoteVideo: null,
      });
    });

    test('returns the same meeting object, if the event type is not declared', () => {
      const event = {
        type: 'NA',
      };

      meetingsSDKAdapter.meetings[meetingID] = meeting;
      meetingsSDKAdapter.removeMedia(meetingID, event);

      expect(meetingsSDKAdapter.meetings[meetingID]).toMatchObject(meeting);
    });
  });

  describe('createMeeting()', () => {
    let stopStream;

    beforeEach(() => {
      const {trueStopStream} = meetingsSDKAdapter.stopStream;

      stopStream = trueStopStream;
      meetingsSDKAdapter.stopStream = jest.fn();
    });

    afterEach(() => {
      meetingsSDKAdapter.stopStream = stopStream;
    });

    test('returns a new meeting in a proper shape', (done) => {
      meetingsSDKAdapter.fetchMeetingTitle = jest.fn(() => Promise.resolve('my meeting'));
      meetingsSDKAdapter.getLocalMedia = jest.fn(() => rxjs.of({
        localAudio: {
          stream: mockSDKMediaStreams.localAudio,
          permission: 'ALLOWED',
        },
        localVideo: {
          stream: mockSDKMediaStreams.localVideo,
          permission: 'ALLOWED',
        },
      }));

      meetingsSDKAdapter.createMeeting(target).pipe(last()).subscribe((newMeeting) => {
        expect(newMeeting).toMatchObject({
          ...meeting,
          localAudio: {
            stream: mockSDKMediaStreams.localAudio,
            permission: 'ALLOWED',
          },
          localVideo: {
            stream: mockSDKMediaStreams.localVideo,
            permission: 'ALLOWED',
          },
        });
        done();
      });
    });

    test('throws error on failed meeting push request', (done) => {
      const wrongTarget = 'wrongTarget';
      const errorMessage = `Unable to create a meeting "${wrongTarget}"`;

      meetingsSDKAdapter.datasource.meetings.create = jest.fn(() => Promise.reject(errorMessage));

      meetingsSDKAdapter.createMeeting(wrongTarget).subscribe(
        (meetingInstance) => {
          done.fail('Unexpected message', meetingInstance);
        },
        (error) => {
          expect(error).toBe(errorMessage);
          done();
        },
      );
    });
  });

  describe('fetchMeetingTitle()', () => {
    test('returns meeting sipUri as title', async () => {
      const meetingTitle = 'sipUri';

      expect(await meetingsSDKAdapter.fetchMeetingTitle(meetingTitle)).toEqual(meetingTitle);
    });

    test('returns person displayName if the destination is a personID', async () => {
      const meetingTitle = 'HYDRA_PEOPLE_ID';

      meetingsSDKAdapter.datasource.people.get = jest.fn(() => Promise.resolve({displayName: 'displayName'}));

      expect(await meetingsSDKAdapter.fetchMeetingTitle(meetingTitle)).toEqual('displayName');
    });

    test("returns room's title if the destination is a personID", async () => {
      const meetingTitle = 'HYDRA_ROOM_ID';

      meetingsSDKAdapter.datasource.rooms.get = jest.fn(() => Promise.resolve({title: 'title'}));

      expect(await meetingsSDKAdapter.fetchMeetingTitle(meetingTitle)).toEqual('title');
    });

    test('returns person display name if the sipUri is an email address', async () => {
      const meetingTitle = 'person@webex.com';

      meetingsSDKAdapter.datasource.people.list = jest.fn(() => Promise.resolve({items: [{displayName: 'displayName'}]}));

      expect(await meetingsSDKAdapter.fetchMeetingTitle(meetingTitle)).toEqual('displayName');
    });
  });

  describe('joinControl()', () => {
    test('returns the display data of a meeting control in a proper shape', (done) => {
      meetingsSDKAdapter.joinControl().subscribe((dataDisplay) => {
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

  describe('exitControl()', () => {
    test('returns the display data of a meeting control in a proper shape', (done) => {
      meetingsSDKAdapter.exitControl().subscribe((dataDisplay) => {
        expect(dataDisplay).toMatchObject({
          ID: 'leave-meeting',
          icon: 'cancel_28',
          tooltip: 'Leave',
          state: 'active',
        });
        done();
      });
    });
  });

  describe('audioControl()', () => {
    test('returns the display data of a meeting control in a proper shape', (done) => {
      meetingsSDKAdapter.audioControl(meetingID).subscribe((dataDisplay) => {
        expect(dataDisplay).toMatchObject({
          ID: 'mute-audio',
          icon: 'microphone-muted_28',
          tooltip: 'No microphone available',
          state: 'disabled',
          text: null,
        });
        done();
      });
    });

    test('throws errors if sdk meeting object is not defined', (done) => {
      meetingsSDKAdapter.audioControl('inexistent').subscribe(
        () => {},
        (error) => {
          expect(error.message).toBe('Could not find meeting with ID "inexistent"');
          done();
        },
      );
    });
  });

  describe('handleLocalAudio()', () => {
    beforeEach(() => {
      meetingsSDKAdapter.meetings[meetingID] = {
        ...meeting,
        localAudio: {
          stream: mockSDKMediaStreams.localAudio,
        },
        remoteAudio: {},
      };
    });

    test('skips muting audio if there is an inactive meeting', async () => {
      meetingsSDKAdapter.meetings[meetingID].remoteAudio = null;
      await meetingsSDKAdapter.handleLocalAudio(meetingID);

      expect(mockSDKMeeting.muteAudio).not.toHaveBeenCalled();
    });

    test('skips unmuting audio if there is an inactive meeting', async () => {
      meetingsSDKAdapter.meetings[meetingID].remoteAudio = null;
      await meetingsSDKAdapter.handleLocalAudio(meetingID);

      expect(mockSDKMeeting.unmuteAudio).not.toHaveBeenCalled();
    });

    test('mutes audio if the the audio track is enabled', async () => {
      await meetingsSDKAdapter.handleLocalAudio(meetingID);

      expect(mockSDKMeeting.muteAudio).toHaveBeenCalled();
    });

    test('localAudio.stream property should be null once the audio track is muted', async () => {
      await meetingsSDKAdapter.handleLocalAudio(meetingID);

      expect(meetingsSDKAdapter.meetings[meetingID].localAudio.stream).toBeNull();
    });

    test('emits the custom event after muting the audio track', async () => {
      await meetingsSDKAdapter.handleLocalAudio(meetingID);

      expect(mockSDKMeeting.emit).toHaveBeenCalledWith('adapter:media:local:update', {
        control: 'mute-audio',
        state: 'inactive',
      });
    });

    test('unmutes audio if the the audio track is disabled', async () => {
      meetingsSDKAdapter.meetings[meetingID].localAudio.stream = null;
      await meetingsSDKAdapter.handleLocalAudio(meetingID);

      expect(mockSDKMeeting.emit).toHaveBeenCalledWith('adapter:media:local:update', {
        control: 'mute-audio',
        state: 'disabled',
      });
    });

    test('localAudio.stream property should be defined once the audio track is unmuted', async () => {
      meetingsSDKAdapter.meetings[meetingID].localAudio.stream = null;
      meetingsSDKAdapter.meetings[meetingID].disabledLocalAudio = mockSDKMediaStreams.localAudio;
      await meetingsSDKAdapter.handleLocalAudio(meetingID);

      expect(meetingsSDKAdapter.meetings[meetingID].localAudio.stream)
        .toMatchMediaStream(mockSDKMediaStreams.localAudio);
    });

    test('emits the custom event after unmuting the audio track', async () => {
      meetingsSDKAdapter.meetings[meetingID].localAudio.stream = null;
      await meetingsSDKAdapter.handleLocalAudio(meetingID);

      expect(mockSDKMeeting.emit).toHaveBeenCalledWith('adapter:media:local:update', {
        control: 'mute-audio',
        state: 'disabled',
      });
    });

    test('throws error if audio control is not handled properly', async () => {
      mockSDKMeeting.muteAudio = jest.fn(() => Promise.reject());
      global.console.error = jest.fn();
      await meetingsSDKAdapter.handleLocalAudio(meetingID);

      expect(global.console.error).toHaveBeenCalledWith(
        'Unable to update local audio settings for meeting "meetingID"',
        undefined,
      );
    });
  });

  describe('videoControl()', () => {
    test('returns the display data of a meeting control in a proper shape', (done) => {
      meetingsSDKAdapter.videoControl(meetingID).subscribe((dataDisplay) => {
        expect(dataDisplay).toMatchObject({
          ID: 'mute-video',
          icon: 'camera-muted_28',
          tooltip: 'No camera available',
          state: 'disabled',
          text: null,
        });
        done();
      });
    });

    test('throws errors if sdk meeting object is not defined', (done) => {
      meetingsSDKAdapter.videoControl('inexistent').subscribe(
        () => {},
        (error) => {
          expect(error.message).toBe('Could not find meeting with ID "inexistent"');
          done();
        },
      );
    });
  });

  describe('handleLocalVideo()', () => {
    beforeEach(() => {
      meetingsSDKAdapter.meetings[meetingID] = {
        ...meeting,
        localVideo: {
          stream: mockSDKMediaStreams.localVideo,
        },
        remoteVideo: {},
      };
    });

    test('skips muting video if there is an inactive meeting', async () => {
      meetingsSDKAdapter.meetings[meetingID].remoteVideo = null;
      await meetingsSDKAdapter.handleLocalVideo(meetingID);

      expect(mockSDKMeeting.muteVideo).not.toHaveBeenCalled();
    });

    test('skips unmuting video if there is an inactive meeting', async () => {
      meetingsSDKAdapter.meetings[meetingID].remoteVideo = null;
      await meetingsSDKAdapter.handleLocalVideo(meetingID);

      expect(mockSDKMeeting.unmuteVideo).not.toHaveBeenCalled();
    });

    test('mutes video if the the video track is enabled', async () => {
      await meetingsSDKAdapter.handleLocalVideo(meetingID);

      expect(mockSDKMeeting.muteVideo).toHaveBeenCalled();
    });

    test('localVideo property should be null once the video track is muted', async () => {
      await meetingsSDKAdapter.handleLocalVideo(meetingID);

      expect(meetingsSDKAdapter.meetings[meetingID].localVideo.stream).toBeNull();
    });

    test('emits the custom event after muting the video track', async () => {
      await meetingsSDKAdapter.handleLocalVideo(meetingID);

      expect(mockSDKMeeting.emit).toHaveBeenCalledWith('adapter:media:local:update', {
        control: 'mute-video',
        state: 'inactive',
      });
    });

    test('unmutes video if the video track is disabled', async () => {
      meetingsSDKAdapter.meetings[meetingID].localVideo.stream = null;
      await meetingsSDKAdapter.handleLocalVideo(meetingID);

      expect(mockSDKMeeting.emit).toHaveBeenCalledWith('adapter:media:local:update', {
        control: 'mute-video',
        state: 'disabled',
      });
    });

    test('localVideo property should be defined once the video track is unmuted', async () => {
      meetingsSDKAdapter.meetings[meetingID].localVideo.stream = null;
      meetingsSDKAdapter.meetings[meetingID].disabledLocalVideo = mockSDKMediaStreams.localVideo;
      await meetingsSDKAdapter.handleLocalVideo(meetingID);

      expect(meetingsSDKAdapter.meetings[meetingID].localVideo.stream)
        .toMatchMediaStream(mockSDKMediaStreams.localVideo);
    });

    test('emits the custom event after unmuting the video track', async () => {
      meetingsSDKAdapter.meetings[meetingID].localVideo.stream = null;
      await meetingsSDKAdapter.handleLocalVideo(meetingID);

      expect(mockSDKMeeting.emit).toHaveBeenCalledWith('adapter:media:local:update', {
        control: 'mute-video',
        state: 'disabled',
      });
    });

    test('throws error if video control is not handled properly', async () => {
      mockSDKMeeting.muteVideo = jest.fn(() => Promise.reject());
      global.console.error = jest.fn();
      await meetingsSDKAdapter.handleLocalVideo(meetingID);

      expect(global.console.error).toHaveBeenCalledWith(
        'Unable to update local video settings for meeting "meetingID"',
        undefined,
      );
    });
  });

  describe('shareControl()', () => {
    test('returns the display data of a meeting control in a proper shape', (done) => {
      global.console.log = jest.fn();
      meetingsSDKAdapter.meetings[meetingID] = {...meeting};

      meetingsSDKAdapter.shareControl(meetingID).subscribe((dataDisplay) => {
        expect(dataDisplay).toMatchObject({
          ID: 'share-screen',
          icon: 'share-screen-presence-stroke_26',
          text: null,
        });
        done();
      });
    });

    test('throws errors if sdk meeting object is not defined', (done) => {
      global.console.log = jest.fn();
      meetingsSDKAdapter.fetchMeeting = jest.fn();

      meetingsSDKAdapter.shareControl('inexistent-meeting-id').subscribe(
        () => {},
        (error) => {
          expect(error.message).toBe('Could not find meeting with ID "inexistent-meeting-id" to add share control');
          done();
        },
      );
    });
  });

  describe('handleLocalShare()', () => {
    let mockConsole;
    let stopStream;

    beforeEach(() => {
      const {trueStopStream} = meetingsSDKAdapter.stopStream;

      stopStream = trueStopStream;
      meetingsSDKAdapter.stopStream = jest.fn();

      mockConsole = jest.fn();
    });

    afterEach(() => {
      meetingsSDKAdapter.stopStream = stopStream;
      mockConsole = null;
    });

    test('skips start/stop share if sdk meeting is in SDP negotiation', async () => {
      global.console.error = jest.fn();
      const {canUpdateMedia} = mockSDKMeeting;

      mockSDKMeeting.canUpdateMedia = jest.fn(() => false);
      await meetingsSDKAdapter.handleLocalShare(meetingID);

      expect(global.console.error).toHaveBeenCalledWith(expect.stringContaining('due to unstable connection'));
      mockSDKMeeting.canUpdateMedia = canUpdateMedia;
    });

    test('start share if the share track is disabled', async () => {
      meetingsSDKAdapter.meetings[meetingID] = {...meeting};
      const {getMediaStreams} = mockSDKMeeting;

      mockSDKMeeting.getMediaStreams = jest.fn(() => Promise.resolve([['mockStream'], 'localShare']));
      await meetingsSDKAdapter.handleLocalShare(meetingID);

      expect(meetingsSDKAdapter.meetings[meetingID].localShare.stream).toEqual('localShare');
      expect(mockSDKMeeting.updateShare).toHaveBeenCalled();
      mockSDKMeeting.getMediaStreams = getMediaStreams;
    });

    test('stop share if the share track is enabled', async () => {
      meetingsSDKAdapter.meetings[meetingID] = {...meeting, localShare: {stream: 'localShare'}};
      await meetingsSDKAdapter.handleLocalShare(meetingID);

      expect(mockSDKMeeting.updateShare).toHaveBeenCalledWith({
        sendShare: false,
        receiveShare: true,
      });
    });

    test('resets sharing stream if share control is not handled properly', async () => {
      meetingsSDKAdapter.meetings[meetingID] = {...meeting, localShare: {stream: 'localShare'}};
      global.console.warn = mockConsole;
      mockSDKMeeting.updateShare = jest.fn(() => Promise.reject());
      await meetingsSDKAdapter.handleLocalShare(meetingID);

      expect(mockConsole).toHaveBeenCalledWith(
        expect.stringContaining(`Unable to update local share stream for meeting "${meetingID}"`),
        undefined,
      );
    });
  });

  describe('toggleRoster()', () => {
    test('shows roster is roster is hidden', async () => {
      meetingsSDKAdapter.meetings[meetingID].showRoster = false;
      await meetingsSDKAdapter.toggleRoster(meetingID);

      expect(mockSDKMeeting.emit).toHaveBeenCalledTimes(1);
      expect(mockSDKMeeting.emit.mock.calls[0][0]).toBe('adapter:meeting:updated');
      expect(mockSDKMeeting.emit.mock.calls[0][1]).toMatchObject({showRoster: true});
    });

    test('hides roster if roster is shown', async () => {
      meetingsSDKAdapter.meetings[meetingID].showRoster = true;
      await meetingsSDKAdapter.toggleRoster(meetingID);

      expect(mockSDKMeeting.emit).toHaveBeenCalledTimes(1);
      expect(mockSDKMeeting.emit.mock.calls[0][0]).toBe('adapter:meeting:updated');
      expect(mockSDKMeeting.emit.mock.calls[0][1]).toMatchObject({showRoster: false});
    });

    test('returns a rejected promise if meeting does not exist', (done) => {
      meetingsSDKAdapter.toggleRoster('inexistent').catch((error) => {
        expect(error.message).toBe('Could not find meeting with ID "inexistent"');
        done();
      });
    });
  });

  describe('toggleSettings()', () => {
    test('shows settings if settings is hidden', async () => {
      meetingsSDKAdapter.meetings[meetingID].showSettings = false;
      await meetingsSDKAdapter.toggleSettings(meetingID);
      expect(mockSDKMeeting.emit).toHaveBeenCalledTimes(1);
      expect(mockSDKMeeting.emit.mock.calls[0][0]).toBe('adapter:meeting:updated');
      expect(mockSDKMeeting.emit.mock.calls[0][1]).toMatchObject({showSettings: true});
    });

    test('hides settings if settings is shown', async () => {
      meetingsSDKAdapter.meetings[meetingID].showSettings = true;
      await meetingsSDKAdapter.toggleSettings(meetingID);
      expect(mockSDKMeeting.emit).toHaveBeenCalledTimes(1);
      expect(mockSDKMeeting.emit.mock.calls[0][0]).toBe('adapter:meeting:updated');
      expect(mockSDKMeeting.emit.mock.calls[0][1]).toMatchObject({showSettings: false});
    });

    test('returns a rejected promise if meeting does not exist', (done) => {
      meetingsSDKAdapter.toggleSettings('inexistent').catch((error) => {
        expect(error.message).toBe('Could not find meeting with ID "inexistent"');
        done();
      });
    });
  });

  describe('switchCameraControl()', () => {
    test('returns the display data of a meeting control in a proper shape', (done) => {
      meetingsSDKAdapter.switchCameraControl(meetingID)
        .pipe(take(1)).subscribe((dataDisplay) => {
          expect(dataDisplay).toMatchObject({
            ID: 'switch-camera',
            tooltip: 'Video Devices',
            options: null,
            selected: null,
          });
          done();
        });
    });

    test('throws errors if sdk meeting object is not defined', (done) => {
      meetingsSDKAdapter.fetchMeeting = jest.fn();

      meetingsSDKAdapter.switchCameraControl(meetingID).subscribe(
        () => {},
        (error) => {
          expect(error.message).toBe('Could not find meeting with ID "meetingID" to add switch camera control');
          done();
        },
      );
    });
  });

  describe('switchCamera()', () => {
    beforeEach(() => {
      meetingsSDKAdapter.meetings[meetingID] = {
        ...meeting,
        cameraID: null,
        localVideo: {
          stream: null,
        },
      };
    });

    test('emits the switch camera events with cameraID', async () => {
      await meetingsSDKAdapter.switchCamera(meetingID, 'cameraID');

      expect(mockSDKMeeting.emit).toHaveBeenCalledWith('adapter:camera:switch', {
        cameraID: 'cameraID',
      });
    });
  });

  describe('switchMicrophoneControl()', () => {
    test('returns the display data of a meeting control in a proper shape', (done) => {
      meetingsSDKAdapter.switchMicrophoneControl(meetingID)
        .pipe(take(1)).subscribe((dataDisplay) => {
          expect(dataDisplay).toMatchObject({
            ID: 'switch-microphone',
            tooltip: 'Microphone Devices',
            options: null,
            selected: null,
          });
          done();
        });
    });

    test('throws errors if sdk meeting object is not defined', (done) => {
      meetingsSDKAdapter.fetchMeeting = jest.fn();

      meetingsSDKAdapter.switchMicrophoneControl(meetingID).subscribe(
        () => {},
        (error) => {
          expect(error.message).toBe('Could not find meeting with ID "meetingID" to add switch microphone control');
          done();
        },
      );
    });
  });

  describe('switchMicrophone()', () => {
    beforeEach(() => {
      meetingsSDKAdapter.meetings[meetingID] = {
        ...meeting,
        microphoneID: null,
        localAudio: {
          stream: null,
        },
      };
    });

    test('emits the switch microphone events with microphoneID', async () => {
      await meetingsSDKAdapter.switchMicrophone(meetingID, 'microphoneID');

      expect(mockSDKMeeting.emit).toHaveBeenCalledWith('adapter:microphone:switch', {
        microphoneID: 'microphoneID',
      });
    });
  });

  describe('switchSpeakerControl()', () => {
    test('returns the display data of a meeting control in a proper shape', (done) => {
      meetingsSDKAdapter.switchSpeakerControl(meetingID)
        .pipe(take(1)).subscribe((dataDisplay) => {
          expect(dataDisplay).toMatchObject({
            ID: 'switch-speaker',
            tooltip: 'Speaker Devices',
            options: null,
            selected: null,
          });
          done();
        });
    });

    test('throws errors if sdk meeting object is not defined', (done) => {
      meetingsSDKAdapter.fetchMeeting = jest.fn();

      meetingsSDKAdapter.switchSpeakerControl(meetingID).subscribe(
        () => {},
        (error) => {
          expect(error.message).toBe('Could not find meeting with ID "meetingID" to add switch speaker control');
          done();
        },
      );
    });
  });

  describe('switchSpeaker()', () => {
    beforeEach(() => {
      meetingsSDKAdapter.meetings[meetingID] = {
        ...meeting,
        speakerID: null,
      };
    });

    test('emits the switch speaker events with speakerID', async () => {
      await meetingsSDKAdapter.switchSpeaker(meetingID, 'speakerID');

      expect(mockSDKMeeting.emit).toHaveBeenCalledWith('adapter:speaker:switch', {
        speakerID: 'speakerID',
      });
    });
  });

  describe('proceedWithoutCameraControl()', () => {
    test('returns the display data of a meeting control in a proper shape', (done) => {
      meetingsSDKAdapter.proceedWithoutCameraControl(meetingID)
        .pipe(first()).subscribe((dataDisplay) => {
          expect(dataDisplay).toMatchObject({
            ID: 'proceed-without-camera',
            text: 'Proceed without camera',
            tooltip: 'Ignore media access prompt and proceed without camera',
          });
          done();
        });
    });

    test('throws errors if sdk meeting object is not defined', (done) => {
      meetingsSDKAdapter.proceedWithoutCameraControl('inexistent').subscribe(
        () => {},
        (error) => {
          expect(error.message).toBe('Could not find meeting with ID "inexistent" to add proceed without camera control');
          done();
        },
      );
    });
  });

  describe('ignoreVideoAccessPrompt()', () => {
    test('calls ignoreMediaAccessPrompt() on the meeting object if defined', () => {
      meetingsSDKAdapter.meetings[meetingID].localVideo.ignoreMediaAccessPrompt = jest.fn();

      meetingsSDKAdapter.ignoreVideoAccessPrompt(meetingID);

      expect(meetingsSDKAdapter.meetings[meetingID].localVideo.ignoreMediaAccessPrompt)
        .toHaveBeenCalled();
    });
  });

  describe('proceedWithoutMicrophoneControl()', () => {
    test('returns the display data of a meeting control in a proper shape', (done) => {
      meetingsSDKAdapter.proceedWithoutMicrophoneControl(meetingID)
        .pipe(first()).subscribe((dataDisplay) => {
          expect(dataDisplay).toMatchObject({
            ID: 'proceed-without-microphone',
            text: 'Proceed without microphone',
            tooltip: 'Ignore media access prompt and proceed without microphone',
          });
          done();
        });
    });

    test('throws errors if sdk meeting object is not defined', (done) => {
      meetingsSDKAdapter.proceedWithoutMicrophoneControl('inexistent').subscribe(
        () => {},
        (error) => {
          expect(error.message).toBe('Could not find meeting with ID "inexistent" to add proceed without microphone control');
          done();
        },
      );
    });
  });

  describe('ignoreAudioAccessPrompt()', () => {
    test('calls ignoreAudioAccessPrompt() on the meeting object if defined', () => {
      meetingsSDKAdapter.meetings[meetingID].localAudio.ignoreMediaAccessPrompt = jest.fn();

      meetingsSDKAdapter.ignoreAudioAccessPrompt(meetingID);

      expect(meetingsSDKAdapter.meetings[meetingID].localAudio.ignoreMediaAccessPrompt)
        .toHaveBeenCalled();
    });
  });

  describe('getMeeting()', () => {
    let stopStream;

    beforeEach(() => {
      const {trueStopStream} = meetingsSDKAdapter.stopStream;

      stopStream = trueStopStream;
      meetingsSDKAdapter.stopStream = jest.fn();
      meetingsSDKAdapter.fetchMeetingTitle = jest.fn(() => Promise.resolve('my meeting'));
      meetingsSDKAdapter.getLocalMedia = jest.fn(() => rxjs.of({
        localAudio: {
          stream: mockSDKMediaStreams.localAudio,
          permission: 'ALLOWED',
        },
        localVideo: {
          stream: mockSDKMediaStreams.localVideo,
          permission: 'ALLOWED',
        },
      }));
      meeting = {
        ...meeting,
        localAudio: {
          stream: mockSDKMediaStreams.localAudio,
          permission: 'ALLOWED',
        },
        localVideo: {
          stream: mockSDKMediaStreams.localVideo,
          permission: 'ALLOWED',
        },
      };
    });

    afterEach(() => {
      meetingsSDKAdapter.stopStream = stopStream;
    });

    test('returns a meeting in a proper shape', (done) => {
      meetingsSDKAdapter
        .createMeeting(target)
        .pipe(
          last(),
          concatMap(() => meetingsSDKAdapter.getMeeting(meetingID)),
          take(1),
        )
        .subscribe((getMeeting) => {
          expect(getMeeting).toMatchObject(meeting);
          done();
        });
    });

    test('stops listening to events when unsubscribing', () => {
      const subscription = meetingsSDKAdapter
        .createMeeting(target)
        .pipe(concatMap(() => meetingsSDKAdapter.getMeeting(meetingID)))
        .subscribe();

      subscription.unsubscribe();
      expect(meetingsSDKAdapter.getMeetingObservables).toEqual({});
    });

    test('throws error on failed meeting fetch request', (done) => {
      meetingsSDKAdapter
        .createMeeting(target)
        .pipe(concatMap(() => meetingsSDKAdapter.getMeeting('inexistent')))
        .subscribe(
          () => {},
          (error) => {
            expect(error.message).toBe('Could not find meeting with ID "inexistent"');
            done();
          },
        );
    });
  });
});
