import * as rxjs from 'rxjs';
import {flatMap} from 'rxjs/operators';

import MeetingSDKAdapter from './MeetingsSDKAdapter';
import createMockSDK, {mockSDKMeeting} from './mockSdk';

describe('Meetings SDK Adapter', () => {
  let meeting;
  let meetingID;
  let meetingSDKAdapter;
  let mockSDK;
  let target;

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

  describe('getLocalMedia()', () => {
    beforeEach(() => {
      global.MediaStream = jest.fn((instance) => instance);
    });

    test('returns local media in a proper shape', async () => {
      expect(await meetingSDKAdapter.getLocalMedia(meetingID)).toEqual({
        localAudio: ['localAudio'],
        localVideo: ['localVideo'],
      });
    });

    test('throws errors if the local media is not retrieved successfully', async () => {
      mockSDKMeeting.getMediaStreams = jest.fn(() => Promise.reject());
      global.console.error = jest.fn();
      await meetingSDKAdapter.getLocalMedia(meetingID);

      expect(global.console.error).toHaveBeenCalledWith(
        expect.stringContaining('Unable to retrieve local media stream for meeting "meetingID"'),
        undefined,
      );
    });

    test('nullifies local Audio if the local media is not retrieved successfully', async () => {
      mockSDKMeeting.getMediaStreams = jest.fn(() => Promise.reject());
      global.console.error = jest.fn();
      const localMedia = await meetingSDKAdapter.getLocalMedia(meetingID);

      expect(localMedia.localAudio).toBeNull();
    });

    test('nullifies local Video if the local media is not retrieved successfully', async () => {
      mockSDKMeeting.getMediaStreams = jest.fn(() => Promise.reject());
      global.console.error = jest.fn();
      const localMedia = await meetingSDKAdapter.getLocalMedia(meetingID);

      expect(localMedia.localVideo).toBeNull();
    });
  });

  describe('getStream()', () => {
    afterEach(() => {
      mockSDKMeeting.getMediaStreams = jest.fn((constraint) => Promise.resolve([constraint.sendAudio ? ['localAudio'] : ['localVideo']]));
    });

    test('throws errors and nullifies local Audio if not retrieved successfully', async () => {
      mockSDKMeeting.getMediaStreams = jest.fn(() => Promise.reject());
      global.console.error = jest.fn();
      const localAudio = await meetingSDKAdapter.getStream(meetingID, {sendAudio: true});

      expect(localAudio).toBeNull();
      expect(global.console.error).toHaveBeenCalledWith(
        expect.stringContaining('Unable to retrieve local media stream for meeting "meetingID"'),
        undefined,
      );
    });

    test('throws errors and nullifies local Video if not retrieved successfully', async () => {
      mockSDKMeeting.getMediaStreams = jest.fn(() => Promise.reject());
      global.console.error = jest.fn();
      const localVideo = await meetingSDKAdapter.getStream(meetingID, {sendVideo: true});

      expect(localVideo).toBeNull();
      expect(global.console.error).toHaveBeenCalledWith(
        expect.stringContaining('Unable to retrieve local media stream for meeting "meetingID"'),
        undefined,
      );
    });

    test('returns local media in a proper shape', async () => {
      expect(await meetingSDKAdapter.getStream(meetingID, {sendAudio: true})).toEqual(['localAudio']);
      expect(await meetingSDKAdapter.getStream(meetingID, {sendVideo: true})).toEqual(['localVideo']);
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
          getAudioTracks: jest.fn(() => ['localAudio']),
          getVideoTracks: jest.fn(() => ['localVideo']),
        },
      };

      global.MediaStream = jest.fn(() => mockMediaStreamInstance);
    });

    test('keeps `localAudio` empty, if the event type is `local` and the audio stream is empty', () => {
      meetingSDKAdapter.meetings[meetingID] = {
        disabledLocalAudio: {},
      };
      meetingSDKAdapter.attachMedia(meetingID, event);

      expect(meetingSDKAdapter.meetings[meetingID]).toMatchObject({
        localAudio: null,
      });
    });

    test('keeps `localVideo` empty, if the event type is `local` and the audio stream is empty', () => {
      meetingSDKAdapter.meetings[meetingID] = {
        disabledLocalVideo: {},
      };
      meetingSDKAdapter.attachMedia(meetingID, event);

      expect(meetingSDKAdapter.meetings[meetingID]).toMatchObject({
        localVideo: null,
      });
    });

    test('keeps both `localVideo` and `localVideo` empty, if the event type is `local` and the audio stream is empty', () => {
      meetingSDKAdapter.meetings[meetingID] = {
        disabledLocalVideo: {},
        disabledLocalAudio: {},
      };
      meetingSDKAdapter.attachMedia(meetingID, event);

      expect(meetingSDKAdapter.meetings[meetingID]).toMatchObject({
        localVideo: null,
        localAudio: null,
      });
    });

    test('sets `localAudio` and `localVideo`, if the event type is `local`', () => {
      meetingSDKAdapter.attachMedia(meetingID, event);

      expect(meetingSDKAdapter.meetings[meetingID]).toMatchObject({
        localAudio: mockMediaStreamInstance,
        localVideo: mockMediaStreamInstance,
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

      meetingSDKAdapter.meetings[meetingID] = meeting;
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

    test('removes `localAudio` and `localVideo`, if the event type is `local`', () => {
      meetingSDKAdapter.removeMedia(meetingID, {type: 'local'});

      expect(meetingSDKAdapter.meetings[meetingID]).toMatchObject({
        localAudio: null,
        localVideo: null,
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
      meetingSDKAdapter.getLocalMedia = jest.fn(() => Promise.resolve({localAudio: 'localAudio', localVideo: 'localVideo'}));

      meetingSDKAdapter.createMeeting(target).subscribe((newMeeting) => {
        expect(newMeeting).toMatchObject({...meeting, localAudio: 'localAudio', localVideo: 'localVideo'});
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
          icon: 'cancel',
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
        },
      );
    });
  });

  describe('handleLocalAudio()', () => {
    beforeEach(() => {
      meetingSDKAdapter.meetings[meetingID] = {
        ...meeting,
        localAudio: {},
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

    test('localAudio property should be null once the audio track is muted', async () => {
      await meetingSDKAdapter.handleLocalAudio(meetingID);

      expect(meetingSDKAdapter.meetings[meetingID].localAudio).toBeNull();
    });

    test('emits the custom event after muting the audio track', async () => {
      await meetingSDKAdapter.handleLocalAudio(meetingID);

      expect(mockSDKMeeting.emit).toHaveBeenCalledWith('adapter:media:local:update', {
        control: 'mute-audio',
        state: false,
      });
    });

    test('unmutes audio if the the audio track is disabled', async () => {
      meetingSDKAdapter.meetings[meetingID].localAudio = null;
      await meetingSDKAdapter.handleLocalAudio(meetingID);

      expect(mockSDKMeeting.unmuteAudio).toHaveBeenCalled();
    });

    test('localAudio property should be defined once the audio track is unmuted', async () => {
      meetingSDKAdapter.meetings[meetingID].localAudio = null;
      meetingSDKAdapter.meetings[meetingID].disabledLocalAudio = {};
      await meetingSDKAdapter.handleLocalAudio(meetingID);

      expect(meetingSDKAdapter.meetings[meetingID].localAudio).toEqual({});
    });

    test('emits the custom event after unmuting the audio track', async () => {
      meetingSDKAdapter.meetings[meetingID].localAudio = null;
      await meetingSDKAdapter.handleLocalAudio(meetingID);

      expect(mockSDKMeeting.emit).toHaveBeenCalledWith('adapter:media:local:update', {
        control: 'mute-audio',
        state: true,
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
          icon: 'camera-muted',
          tooltip: 'Stop video',
          state: 'inactive',
          text: null,
        });
        done();
      });
    });

    test('throws errors if sdk meeting object is not defined', (done) => {
      meetingSDKAdapter.fetchMeeting = jest.fn();

      meetingSDKAdapter.videoControl(meetingID).subscribe(
        () => {},
        (error) => {
          expect(error.message).toBe('Could not find meeting with ID "meetingID" to add video control');
          done();
        },
      );
    });
  });

  describe('handleLocalVideo()', () => {
    beforeEach(() => {
      meetingSDKAdapter.meetings[meetingID] = {
        ...meeting,
        localVideo: {},
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

      expect(meetingSDKAdapter.meetings[meetingID].localVideo).toBeNull();
    });

    test('emits the custom event after muting the video track', async () => {
      await meetingSDKAdapter.handleLocalVideo(meetingID);

      expect(mockSDKMeeting.emit).toHaveBeenCalledWith('adapter:media:local:update', {
        control: 'mute-video',
        state: false,
      });
    });

    test('unmutes video if the video track is disabled', async () => {
      meetingSDKAdapter.meetings[meetingID].localVideo = null;
      await meetingSDKAdapter.handleLocalVideo(meetingID);

      expect(mockSDKMeeting.unmuteVideo).toHaveBeenCalled();
    });

    test('localVideo property should be defined once the video track is unmuted', async () => {
      meetingSDKAdapter.meetings[meetingID].localVideo = null;
      meetingSDKAdapter.meetings[meetingID].disabledLocalVideo = {};
      await meetingSDKAdapter.handleLocalVideo(meetingID);

      expect(meetingSDKAdapter.meetings[meetingID].localVideo).toEqual({});
    });

    test('emits the custom event after unmuting the video track', async () => {
      meetingSDKAdapter.meetings[meetingID].localVideo = null;
      await meetingSDKAdapter.handleLocalVideo(meetingID);

      expect(mockSDKMeeting.emit).toHaveBeenCalledWith('adapter:media:local:update', {
        control: 'mute-video',
        state: true,
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

      meetingSDKAdapter.shareControl(meetingID).subscribe((dataDisplay) => {
        expect(dataDisplay).toMatchObject({
          ID: 'share-screen',
          icon: 'share',
          text: null,
        });
        done();
      });
    });

    test('throws errors if sdk meeting object is not defined', (done) => {
      global.console.log = jest.fn();
      meetingSDKAdapter.fetchMeeting = jest.fn();

      meetingSDKAdapter.shareControl(meetingID).subscribe(
        () => {},
        (error) => {
          expect(error.message).toBe('Could not find meeting with ID "meetingID" to add share control');
          done();
        },
      );
    });
  });

  describe('handleLocalShare()', () => {
    let mockConsole;
    let stopStream;

    beforeEach(() => {
      meetingSDKAdapter.meetings[meetingID] = {
        ...meeting,
        localShare: {},
        remoteShare: {},
      };
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
      meetingSDKAdapter.meetings[meetingID].localShare = null;
      const {getMediaStreams} = mockSDKMeeting;

      mockSDKMeeting.getMediaStreams = jest.fn(() => Promise.resolve([['mockStream'], 'localShare']));
      await meetingSDKAdapter.handleLocalShare(meetingID);

      expect(meetingSDKAdapter.meetings[meetingID].localShare).toEqual('localShare');
      expect(mockSDKMeeting.updateShare).toHaveBeenCalled();
      mockSDKMeeting.getMediaStreams = getMediaStreams;
    });

    test('stop share if the share track is enabled', async () => {
      meetingSDKAdapter.meetings[meetingID].localShare = 'localShare';
      await meetingSDKAdapter.handleLocalShare(meetingID);

      expect(mockSDKMeeting.updateShare).toHaveBeenCalled();
      expect(meetingSDKAdapter.meetings[meetingID].localShare).toBeNull();
    });

    test('resets sharing stream if share control is not handled properly', async () => {
      global.console.warn = mockConsole;
      mockSDKMeeting.updateShare = jest.fn(() => Promise.reject());
      await meetingSDKAdapter.handleLocalShare(meetingID);

      expect(mockConsole).toHaveBeenCalledWith(
        expect.stringContaining(`Unable to update local share stream for meeting "${meetingID}"`),
        undefined,
      );
    });
  });

  describe('getMeeting()', () => {
    let stopStream;

    beforeEach(() => {
      const {trueStopStream} = meetingSDKAdapter.stopStream;

      stopStream = trueStopStream;
      meetingSDKAdapter.stopStream = jest.fn();
      meetingSDKAdapter.fetchMeetingTitle = jest.fn(() => Promise.resolve('my meeting'));
      meetingSDKAdapter.getLocalMedia = jest.fn(() => Promise.resolve({localAudio: 'localAudio', localVideo: 'localVideo'}));
      meeting = {...meeting, localAudio: 'localAudio', localVideo: 'localVideo'};
    });

    afterEach(() => {
      meetingSDKAdapter.stopStream = stopStream;
    });

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
          },
        );
    });
  });
});
