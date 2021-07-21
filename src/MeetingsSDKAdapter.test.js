import * as rxjs from 'rxjs';
import {
  take,
  last,
  concatMap,
} from 'rxjs/operators';

import MeetingSDKAdapter from './MeetingsSDKAdapter';
import createMockSDK, {mockSDKMediaStreams} from './mockSdk';

describe('Meetings SDK Adapter', () => {
  let meeting;
  let meetingID;
  let meetingSDKAdapter;
  let mockSDK;
  let mockSDKMeeting;
  let target;

  beforeEach(() => {
    global.DOMException = jest.fn();
    mockSDK = createMockSDK();
    meetingID = 'meetingID';
    mockSDKMeeting = mockSDK.meetings.getMeetingByType('id', meetingID);
    meetingSDKAdapter = new MeetingSDKAdapter(mockSDK);
    rxjs.fromEvent = jest.fn(() => rxjs.of({}));
    meeting = {
      ID: meetingID,
      localAudio: {
        stream: null,
        permission: null,
      },
      localShare: {
        stream: null,
      },
      localVideo: {
        stream: null,
        permission: null,
      },
      remoteAudio: null,
      remoteVideo: null,
      remoteShare: null,
      showRoster: null,
      showSettings: false,
      title: 'my meeting',
      cameraID: null,
      microphoneID: null,
      speakerID: null,
    };
    target = 'target';
    meetingSDKAdapter.meetings[meetingID] = meeting;
  });

  afterEach(() => {
    meeting = null;
    rxjs.fromEvent = null;
    mockSDK = null;
    mockSDKMeeting = null;
    meetingSDKAdapter = null;
    meetingID = null;
    target = null;
  });

  describe('getLocalMedia()', () => {
    beforeEach(() => {
      global.MediaStream = jest.fn((instance) => instance);
    });

    test('returns local media in a proper shape', (done) => {
      meetingSDKAdapter.getLocalMedia(meetingID).pipe(last()).subscribe((dataDisplay) => {
        expect(dataDisplay).toMatchObject({
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

    test('throws errors if the local media is not retrieved successfully', (done) => {
      global.console.error = jest.fn();
      const mockConsole = global.console.error;

      mockSDKMeeting.getMediaStreams = jest.fn(() => Promise.reject());
      meetingSDKAdapter.getLocalMedia(meetingID).pipe(last()).subscribe(
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
      meetingSDKAdapter.getLocalMedia(meetingID).pipe(last()).subscribe((localMedia) => {
        expect(localMedia.localAudio.stream).toBeNull();
        done();
      });
    });

    test('nullifies local Video if the local media is not retrieved successfully', (done) => {
      mockSDKMeeting.getMediaStreams = jest.fn(() => Promise.reject());
      meetingSDKAdapter.getLocalMedia(meetingID).subscribe((localMedia) => {
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
      meetingSDKAdapter.getStream(meetingID, {sendAudio: true}).pipe(last()).subscribe(
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
      meetingSDKAdapter.getStream(meetingID, {sendVideo: true}).pipe(
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
      meetingSDKAdapter.getStream(meetingID, {sendAudio: true})
        .pipe(last())
        .subscribe((localMedia) => {
          expect(localMedia).toMatchObject({
            stream: mockSDKMediaStreams.localAudio,
            permission: 'ALLOWED',
          });
          done();
        });
      meetingSDKAdapter.getStream(meetingID, {sendVideo: true}).pipe(
        last(),
      ).subscribe((localMedia) => {
        expect(localMedia).toMatchObject({
          stream: mockSDKMediaStreams.localVideo,
          permission: 'ALLOWED',
        });
        done();
      });
    });
  });

  describe('attachMedia()', () => {
    let event;
    let mockMediaStreamInstance;

    beforeEach(() => {
      mockMediaStreamInstance = {
        getAudioTrack: () => [],
        getVideoTrack: () => [],
      };
      event = {
        type: 'local',
        stream: {
          getAudioTracks: jest.fn(() => mockSDKMediaStreams.localAudio),
          getVideoTracks: jest.fn(() => mockSDKMediaStreams.localVideo),
        },
      };

      global.MediaStream = jest.fn(() => mockMediaStreamInstance);
    });

    test('keeps `localAudio.stream` empty, if the event type is `local` and the audio stream is empty', () => {
      meetingSDKAdapter.meetings[meetingID] = {
        disabledLocalAudio: {},
      };
      meetingSDKAdapter.attachMedia(meetingID, event);

      expect(meetingSDKAdapter.meetings[meetingID]).toMatchObject({
        localAudio: {
          stream: null,
        },
      });
    });

    test('keeps `localVideo.stream` empty, if the event type is `local` and the audio stream is empty', () => {
      meetingSDKAdapter.meetings[meetingID] = {
        disabledLocalVideo: {},
      };
      meetingSDKAdapter.attachMedia(meetingID, event);

      expect(meetingSDKAdapter.meetings[meetingID]).toMatchObject({
        localVideo: {
          stream: null,
        },
      });
    });

    test('keeps both `localVideo` and `localVideo` empty, if the event type is `local` and the audio stream is empty', () => {
      meetingSDKAdapter.meetings[meetingID] = {
        disabledLocalVideo: {},
        disabledLocalAudio: {},
      };
      meetingSDKAdapter.attachMedia(meetingID, event);

      expect(meetingSDKAdapter.meetings[meetingID]).toMatchObject({
        localVideo: {
          stream: null,
        },
        localAudio: {
          stream: null,
        },
      });
    });

    test('sets `localAudio` and `localVideo`, if the event type is `local`', () => {
      meetingSDKAdapter.attachMedia(meetingID, event);

      expect(meetingSDKAdapter.meetings[meetingID]).toMatchObject({
        localAudio: {
          stream: mockMediaStreamInstance,
        },
        localVideo: {
          stream: mockMediaStreamInstance,
        },
      });
    });

    test('sets `remoteAudio`, if the event type is `remoteAudio`', () => {
      event = {
        type: 'remoteAudio',
        stream: 'remoteAudio',
      };
      meetingSDKAdapter.attachMedia(meetingID, event);

      expect(meetingSDKAdapter.meetings[meetingID]).toMatchObject({
        remoteAudio: 'remoteAudio',
      });
    });

    test('sets `remoteVideo`, if the event type is `remoteVideo`', () => {
      event = {
        type: 'remoteVideo',
        stream: 'remoteVideo',
      };
      meetingSDKAdapter.attachMedia(meetingID, event);

      expect(meetingSDKAdapter.meetings[meetingID]).toMatchObject({
        remoteVideo: 'remoteVideo',
      });
    });

    test('sets `remoteShare`, if the event type is `meeting:startedSharingRemote`', () => {
      event = {
        type: 'meeting:startedSharingRemote',
      };
      meetingSDKAdapter.meetings[meetingID] = {
        remoteShareStream: 'remoteShareStream',
      };
      meetingSDKAdapter.attachMedia(meetingID, event);

      expect(meetingSDKAdapter.meetings[meetingID]).toMatchObject({
        remoteShare: 'remoteShareStream',
      });
    });

    test('clears `remoteShare`, if the event type is `meeting:stoppedSharingRemote`', () => {
      event = {
        type: 'meeting:stoppedSharingRemote',
      };

      meetingSDKAdapter.meetings[meetingID] = {
        remoteShare: 'remoteShareStream',
      };
      meetingSDKAdapter.attachMedia(meetingID, event);

      expect(meetingSDKAdapter.meetings[meetingID]).toMatchObject({
        remoteShare: null,
      });
    });

    test('returns the same meeting object, if the event type is not declared', () => {
      event = {
        type: 'NA',
        stream: {},
      };

      meetingSDKAdapter.attachMedia(meetingID, event);

      expect(meetingSDKAdapter.meetings[meetingID]).toMatchObject(meeting);
    });
  });

  describe('stopStream()', () => {
    const mockStop = jest.fn();
    let mockMediaStreamInstance;

    beforeEach(() => {
      mockMediaStreamInstance = {
        getTracks: () => [{stop: mockStop}],
      };

      global.MediaStream = jest.fn(() => mockMediaStreamInstance);
    });

    test('calls stop() of the stream track', () => {
      meetingSDKAdapter.stopStream(new MediaStream());

      expect(mockStop).toHaveBeenCalled();
    });
  });

  describe('removeMedia()', () => {
    let stopStream;

    beforeEach(() => {
      const {trueStopStream} = meetingSDKAdapter.stopStream;

      stopStream = trueStopStream;
      meetingSDKAdapter.stopStream = jest.fn();
    });

    afterEach(() => {
      meetingSDKAdapter.stopStream = stopStream;
    });

    test('removes `localAudio.stream` and `localVideo.stream`, if the event type is `local`', () => {
      meetingSDKAdapter.removeMedia(meetingID, {type: 'local'});

      expect(meetingSDKAdapter.meetings[meetingID]).toMatchObject({
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

      meetingSDKAdapter.removeMedia(meetingID, event);

      expect(meetingSDKAdapter.meetings[meetingID]).toMatchObject({
        remoteAudio: null,
      });
    });

    test('removes `remoteVideo`, if the event type is `remoteVideo`', () => {
      const event = {
        type: 'remoteVideo',
      };

      meetingSDKAdapter.removeMedia(meetingID, event);

      expect(meetingSDKAdapter.meetings[meetingID]).toMatchObject({
        remoteVideo: null,
      });
    });

    test('returns the same meeting object, if the event type is not declared', () => {
      const event = {
        type: 'NA',
      };

      meetingSDKAdapter.meetings[meetingID] = meeting;
      meetingSDKAdapter.removeMedia(meetingID, event);

      expect(meetingSDKAdapter.meetings[meetingID]).toMatchObject(meeting);
    });
  });

  describe('createMeeting()', () => {
    let stopStream;

    beforeEach(() => {
      const {trueStopStream} = meetingSDKAdapter.stopStream;

      stopStream = trueStopStream;
      meetingSDKAdapter.stopStream = jest.fn();
    });

    afterEach(() => {
      meetingSDKAdapter.stopStream = stopStream;
    });

    test('returns a new meeting in a proper shape', (done) => {
      meetingSDKAdapter.fetchMeetingTitle = jest.fn(() => Promise.resolve('my meeting'));
      meetingSDKAdapter.getLocalMedia = jest.fn(() => rxjs.of({
        localAudio: {
          stream: mockSDKMediaStreams.localAudio,
          permission: 'ALLOWED',
        },
        localVideo: {
          stream: mockSDKMediaStreams.localVideo,
          permission: 'ALLOWED',
        },
      }));

      meetingSDKAdapter.createMeeting(target).pipe(last()).subscribe((newMeeting) => {
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

      meetingSDKAdapter.datasource.meetings.create = jest.fn(() => Promise.reject(errorMessage));

      meetingSDKAdapter.createMeeting(wrongTarget).subscribe(
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

      expect(await meetingSDKAdapter.fetchMeetingTitle(meetingTitle)).toEqual(meetingTitle);
    });

    test('returns person displayName if the destination is a personID', async () => {
      const meetingTitle = 'HYDRA_PEOPLE_ID';

      meetingSDKAdapter.datasource.people.get = jest.fn(() => Promise.resolve({displayName: 'displayName'}));

      expect(await meetingSDKAdapter.fetchMeetingTitle(meetingTitle)).toEqual("displayName's Personal Room");
    });

    test("returns room's title if the destination is a personID", async () => {
      const meetingTitle = 'HYDRA_ROOM_ID';

      meetingSDKAdapter.datasource.rooms.get = jest.fn(() => Promise.resolve({title: 'title'}));

      expect(await meetingSDKAdapter.fetchMeetingTitle(meetingTitle)).toEqual('title');
    });

    test('returns person display name if the sipUri is an email address', async () => {
      const meetingTitle = 'person@webex.com';

      meetingSDKAdapter.datasource.people.list = jest.fn(() => Promise.resolve({items: [{displayName: 'displayName'}]}));

      expect(await meetingSDKAdapter.fetchMeetingTitle(meetingTitle)).toEqual("displayName's Personal Room");
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

  describe('exitControl()', () => {
    test('returns the display data of a meeting control in a proper shape', (done) => {
      meetingSDKAdapter.exitControl().subscribe((dataDisplay) => {
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
      meetingSDKAdapter.audioControl(meetingID).subscribe((dataDisplay) => {
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
      meetingSDKAdapter.audioControl('inexistent').subscribe(
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
      meetingSDKAdapter.meetings[meetingID] = {
        ...meeting,
        localAudio: {
          stream: {},
        },
        remoteAudio: {},
      };
    });

    test('skips muting audio if there is an inactive meeting', async () => {
      meetingSDKAdapter.meetings[meetingID].remoteAudio = null;
      await meetingSDKAdapter.handleLocalAudio(meetingID);

      expect(mockSDKMeeting.muteAudio).not.toHaveBeenCalled();
    });

    test('skips unmuting audio if there is an inactive meeting', async () => {
      meetingSDKAdapter.meetings[meetingID].remoteAudio = null;
      await meetingSDKAdapter.handleLocalAudio(meetingID);

      expect(mockSDKMeeting.unmuteAudio).not.toHaveBeenCalled();
    });

    test('mutes audio if the the audio track is enabled', async () => {
      await meetingSDKAdapter.handleLocalAudio(meetingID);

      expect(mockSDKMeeting.muteAudio).toHaveBeenCalled();
    });

    test('localAudio.stream property should be null once the audio track is muted', async () => {
      await meetingSDKAdapter.handleLocalAudio(meetingID);

      expect(meetingSDKAdapter.meetings[meetingID].localAudio.stream).toBeNull();
    });

    test('emits the custom event after muting the audio track', async () => {
      await meetingSDKAdapter.handleLocalAudio(meetingID);

      expect(mockSDKMeeting.emit).toHaveBeenCalledWith('adapter:media:local:update', {
        control: 'mute-audio',
        state: 'inactive',
      });
    });

    test('unmutes audio if the the audio track is disabled', async () => {
      meetingSDKAdapter.meetings[meetingID].localAudio.stream = null;
      await meetingSDKAdapter.handleLocalAudio(meetingID);

      expect(mockSDKMeeting.emit).toHaveBeenCalledWith('adapter:media:local:update', {
        control: 'mute-audio',
        state: 'disabled',
      });
    });

    test('localAudio.stream property should be defined once the audio track is unmuted', async () => {
      meetingSDKAdapter.meetings[meetingID].localAudio.stream = null;
      meetingSDKAdapter.meetings[meetingID].disabledLocalAudio = {};
      await meetingSDKAdapter.handleLocalAudio(meetingID);

      expect(meetingSDKAdapter.meetings[meetingID].localAudio.stream).toEqual({});
    });

    test('emits the custom event after unmuting the audio track', async () => {
      meetingSDKAdapter.meetings[meetingID].localAudio.stream = null;
      await meetingSDKAdapter.handleLocalAudio(meetingID);

      expect(mockSDKMeeting.emit).toHaveBeenCalledWith('adapter:media:local:update', {
        control: 'mute-audio',
        state: 'disabled',
      });
    });

    test('throws error if audio control is not handled properly', async () => {
      mockSDKMeeting.muteAudio = jest.fn(() => Promise.reject());
      global.console.error = jest.fn();
      await meetingSDKAdapter.handleLocalAudio(meetingID);

      expect(global.console.error).toHaveBeenCalledWith(
        'Unable to update local audio settings for meeting "meetingID"',
        undefined,
      );
    });
  });

  describe('videoControl()', () => {
    test('returns the display data of a meeting control in a proper shape', (done) => {
      meetingSDKAdapter.videoControl(meetingID).subscribe((dataDisplay) => {
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
      meetingSDKAdapter.videoControl('inexistent').subscribe(
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
      meetingSDKAdapter.meetings[meetingID] = {
        ...meeting,
        localVideo: {
          stream: {},
        },
        remoteVideo: {},
      };
    });

    test('skips muting video if there is an inactive meeting', async () => {
      meetingSDKAdapter.meetings[meetingID].remoteVideo = null;
      await meetingSDKAdapter.handleLocalVideo(meetingID);

      expect(mockSDKMeeting.muteVideo).not.toHaveBeenCalled();
    });

    test('skips unmuting video if there is an inactive meeting', async () => {
      meetingSDKAdapter.meetings[meetingID].remoteVideo = null;
      await meetingSDKAdapter.handleLocalVideo(meetingID);

      expect(mockSDKMeeting.unmuteVideo).not.toHaveBeenCalled();
    });

    test('mutes video if the the video track is enabled', async () => {
      await meetingSDKAdapter.handleLocalVideo(meetingID);

      expect(mockSDKMeeting.muteVideo).toHaveBeenCalled();
    });

    test('localVideo property should be null once the video track is muted', async () => {
      await meetingSDKAdapter.handleLocalVideo(meetingID);

      expect(meetingSDKAdapter.meetings[meetingID].localVideo.stream).toBeNull();
    });

    test('emits the custom event after muting the video track', async () => {
      await meetingSDKAdapter.handleLocalVideo(meetingID);

      expect(mockSDKMeeting.emit).toHaveBeenCalledWith('adapter:media:local:update', {
        control: 'mute-video',
        state: 'inactive',
      });
    });

    test('unmutes video if the video track is disabled', async () => {
      meetingSDKAdapter.meetings[meetingID].localVideo.stream = null;
      await meetingSDKAdapter.handleLocalVideo(meetingID);

      expect(mockSDKMeeting.emit).toHaveBeenCalledWith('adapter:media:local:update', {
        control: 'mute-video',
        state: 'disabled',
      });
    });

    test('localVideo property should be defined once the video track is unmuted', async () => {
      meetingSDKAdapter.meetings[meetingID].localVideo.stream = null;
      meetingSDKAdapter.meetings[meetingID].disabledLocalVideo = {};
      await meetingSDKAdapter.handleLocalVideo(meetingID);

      expect(meetingSDKAdapter.meetings[meetingID].localVideo.stream).toEqual({});
    });

    test('emits the custom event after unmuting the video track', async () => {
      meetingSDKAdapter.meetings[meetingID].localVideo.stream = null;
      await meetingSDKAdapter.handleLocalVideo(meetingID);

      expect(mockSDKMeeting.emit).toHaveBeenCalledWith('adapter:media:local:update', {
        control: 'mute-video',
        state: 'disabled',
      });
    });

    test('throws error if video control is not handled properly', async () => {
      mockSDKMeeting.muteVideo = jest.fn(() => Promise.reject());
      global.console.error = jest.fn();
      await meetingSDKAdapter.handleLocalVideo(meetingID);

      expect(global.console.error).toHaveBeenCalledWith(
        'Unable to update local video settings for meeting "meetingID"',
        undefined,
      );
    });
  });

  describe('shareControl()', () => {
    test('returns the display data of a meeting control in a proper shape', (done) => {
      global.console.log = jest.fn();
      meetingSDKAdapter.meetings[meetingID] = {...meeting};

      meetingSDKAdapter.shareControl(meetingID).subscribe((dataDisplay) => {
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
      meetingSDKAdapter.fetchMeeting = jest.fn();

      meetingSDKAdapter.shareControl('inexistent-meeting-id').subscribe(
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
      const {trueStopStream} = meetingSDKAdapter.stopStream;

      stopStream = trueStopStream;
      meetingSDKAdapter.stopStream = jest.fn();

      mockConsole = jest.fn();
    });

    afterEach(() => {
      meetingSDKAdapter.stopStream = stopStream;
      mockConsole = null;
    });

    test('skips start/stop share if sdk meeting is in SDP negotiation', async () => {
      global.console.error = jest.fn();
      const {canUpdateMedia} = mockSDKMeeting;

      mockSDKMeeting.canUpdateMedia = jest.fn(() => false);
      await meetingSDKAdapter.handleLocalShare(meetingID);

      expect(global.console.error).toHaveBeenCalledWith(expect.stringContaining('due to unstable connection'));
      mockSDKMeeting.canUpdateMedia = canUpdateMedia;
    });

    test('start share if the share track is disabled', async () => {
      meetingSDKAdapter.meetings[meetingID] = {...meeting};
      const {getMediaStreams} = mockSDKMeeting;

      mockSDKMeeting.getMediaStreams = jest.fn(() => Promise.resolve([['mockStream'], 'localShare']));
      await meetingSDKAdapter.handleLocalShare(meetingID);

      expect(meetingSDKAdapter.meetings[meetingID].localShare.stream).toEqual('localShare');
      expect(mockSDKMeeting.updateShare).toHaveBeenCalled();
      mockSDKMeeting.getMediaStreams = getMediaStreams;
    });

    test('stop share if the share track is enabled', async () => {
      meetingSDKAdapter.meetings[meetingID] = {...meeting, localShare: {stream: 'localShare'}};
      await meetingSDKAdapter.handleLocalShare(meetingID);

      expect(mockSDKMeeting.updateShare).toHaveBeenCalledWith({
        sendShare: false,
        receiveShare: true,
      });
    });

    test('resets sharing stream if share control is not handled properly', async () => {
      meetingSDKAdapter.meetings[meetingID] = {...meeting, localShare: {stream: 'localShare'}};
      global.console.warn = mockConsole;
      mockSDKMeeting.updateShare = jest.fn(() => Promise.reject());
      await meetingSDKAdapter.handleLocalShare(meetingID);

      expect(mockConsole).toHaveBeenCalledWith(
        expect.stringContaining(`Unable to update local share stream for meeting "${meetingID}"`),
        undefined,
      );
    });
  });

  describe('toggleRoster()', () => {
    test('shows roster is roster is hidden', async () => {
      meetingSDKAdapter.meetings[meetingID].showRoster = false;
      await meetingSDKAdapter.toggleRoster(meetingID);

      expect(mockSDKMeeting.emit).toHaveBeenCalledTimes(1);
      expect(mockSDKMeeting.emit.mock.calls[0][0]).toBe('adapter:meeting:updated');
      expect(mockSDKMeeting.emit.mock.calls[0][1]).toMatchObject({showRoster: true});
    });

    test('hides roster if roster is shown', async () => {
      meetingSDKAdapter.meetings[meetingID].showRoster = true;
      await meetingSDKAdapter.toggleRoster(meetingID);

      expect(mockSDKMeeting.emit).toHaveBeenCalledTimes(1);
      expect(mockSDKMeeting.emit.mock.calls[0][0]).toBe('adapter:meeting:updated');
      expect(mockSDKMeeting.emit.mock.calls[0][1]).toMatchObject({showRoster: false});
    });

    test('returns a rejected promise if meeting does not exist', (done) => {
      meetingSDKAdapter.toggleRoster('inexistent').catch((error) => {
        expect(error.message).toBe('Could not find meeting with ID "inexistent"');
        done();
      });
    });
  });

  describe('toggleSettings()', () => {
    test('shows settings if settings is hidden', async () => {
      meetingSDKAdapter.meetings[meetingID].showSettings = false;
      await meetingSDKAdapter.toggleSettings(meetingID);
      expect(mockSDKMeeting.emit).toHaveBeenCalledTimes(1);
      expect(mockSDKMeeting.emit.mock.calls[0][0]).toBe('adapter:meeting:updated');
      expect(mockSDKMeeting.emit.mock.calls[0][1]).toMatchObject({showSettings: true});
    });

    test('hides settings if settings is shown', async () => {
      meetingSDKAdapter.meetings[meetingID].showSettings = true;
      await meetingSDKAdapter.toggleSettings(meetingID);
      expect(mockSDKMeeting.emit).toHaveBeenCalledTimes(1);
      expect(mockSDKMeeting.emit.mock.calls[0][0]).toBe('adapter:meeting:updated');
      expect(mockSDKMeeting.emit.mock.calls[0][1]).toMatchObject({showSettings: false});
    });

    test('returns a rejected promise if meeting does not exist', (done) => {
      meetingSDKAdapter.toggleSettings('inexistent').catch((error) => {
        expect(error.message).toBe('Could not find meeting with ID "inexistent"');
        done();
      });
    });
  });

  describe('switchCameraControl()', () => {
    test('returns the display data of a meeting control in a proper shape', (done) => {
      meetingSDKAdapter.switchCameraControl(meetingID)
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
      meetingSDKAdapter.fetchMeeting = jest.fn();

      meetingSDKAdapter.switchCameraControl(meetingID).subscribe(
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
      meetingSDKAdapter.meetings[meetingID] = {
        cameraID: null,
        localVideo: {
          stream: null,
        },
      };
    });

    test('emits the switch camera events with cameraID', async () => {
      await meetingSDKAdapter.switchCamera(meetingID, 'cameraID');

      expect(mockSDKMeeting.emit).toHaveBeenCalledWith('adapter:camera:switch', {
        cameraID: 'cameraID',
      });
    });
  });

  describe('switchMicrophoneControl()', () => {
    test('returns the display data of a meeting control in a proper shape', (done) => {
      meetingSDKAdapter.switchMicrophoneControl(meetingID)
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
      meetingSDKAdapter.fetchMeeting = jest.fn();

      meetingSDKAdapter.switchMicrophoneControl(meetingID).subscribe(
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
      meetingSDKAdapter.meetings[meetingID] = {
        microphoneID: null,
        localAudio: {
          stream: null,
        },
      };
    });

    test('emits the switch microphone events with microphoneID', async () => {
      await meetingSDKAdapter.switchMicrophone(meetingID, 'microphoneID');

      expect(mockSDKMeeting.emit).toHaveBeenCalledWith('adapter:microphone:switch', {
        microphoneID: 'microphoneID',
      });
    });
  });

  describe('switchSpeakerControl()', () => {
    test('returns the display data of a meeting control in a proper shape', (done) => {
      meetingSDKAdapter.switchSpeakerControl(meetingID)
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
      meetingSDKAdapter.fetchMeeting = jest.fn();

      meetingSDKAdapter.switchSpeakerControl(meetingID).subscribe(
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
      meetingSDKAdapter.meetings[meetingID] = {
        speakerID: null,
      };
    });

    test('emits the switch speaker events with speakerID', async () => {
      await meetingSDKAdapter.switchSpeaker(meetingID, 'speakerID');

      expect(mockSDKMeeting.emit).toHaveBeenCalledWith('adapter:speaker:switch', {
        speakerID: 'speakerID',
      });
    });
  });

  describe('getMeeting()', () => {
    let stopStream;

    beforeEach(() => {
      const {trueStopStream} = meetingSDKAdapter.stopStream;

      stopStream = trueStopStream;
      meetingSDKAdapter.stopStream = jest.fn();
      meetingSDKAdapter.fetchMeetingTitle = jest.fn(() => Promise.resolve('my meeting'));
      meetingSDKAdapter.getLocalMedia = jest.fn(() => rxjs.of({
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
      meetingSDKAdapter.stopStream = stopStream;
    });

    test('returns a meeting in a proper shape', (done) => {
      meetingSDKAdapter
        .createMeeting(target)
        .pipe(
          last(),
          concatMap(() => meetingSDKAdapter.getMeeting(meetingID)),
          take(1),
        )
        .subscribe((getMeeting) => {
          expect(getMeeting).toMatchObject(meeting);
          done();
        });
    });

    test('stops listening to events when unsubscribing', () => {
      const subscription = meetingSDKAdapter
        .createMeeting(target)
        .pipe(concatMap(() => meetingSDKAdapter.getMeeting(meetingID)))
        .subscribe();

      subscription.unsubscribe();
      expect(meetingSDKAdapter.getMeetingObservables).toEqual({});
    });

    test('throws error on failed meeting fetch request', (done) => {
      meetingID = 'invalid meetingID';
      const errorMessage = `Could not find meeting with ID "${meetingID}"`;

      meetingSDKAdapter
        .createMeeting(target)
        .pipe(concatMap(() => meetingSDKAdapter.getMeeting(meetingID)))
        .subscribe(
          () => {},
          (error) => {
            expect(error.message).toBe(errorMessage);
            done();
          },
        );
    });
  });
});
