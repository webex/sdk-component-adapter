import * as rxjs from 'rxjs';
import {
  last,
  first,
} from 'rxjs/operators';

import {createMockSDKMediaStreams} from './mockSdk';
import {meetingID, createTestMeetingsSDKAdapter} from './MeetingsSDKAdapter/testHelper';

import logger from './logger';

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
    it('returns local media in a proper shape', (done) => {
      meetingsSDKAdapter.getLocalMedia(meetingID).pipe(last()).subscribe((localMedia) => {
        expect(localMedia.localAudio.stream).toMatchMediaStream(mockSDKMediaStreams.localAudio);
        expect(localMedia.localVideo.stream).toMatchMediaStream(mockSDKMediaStreams.localVideo);

        expect(localMedia.localAudio.permission).toBe('ALLOWED');
        expect(localMedia.localVideo.permission).toBe('ALLOWED');
        done();
      });
    });

    it('emits permission=ERROR if the local media is not retrieved successfully', (done) => {
      logger.error = jest.fn();
      const sdkError = {error: {}};

      mockSDKMeeting.getMediaStreams = jest.fn(() => Promise.reject(sdkError));
      meetingsSDKAdapter.getLocalMedia(meetingID).pipe(last()).subscribe(
        (localMedia) => {
          expect(localMedia).toMatchObject({
            localAudio: {
              stream: null,
              permission: 'ERROR',
            },
            localVideo: {
              stream: null,
              permission: 'ERROR',
            },
          });
          done();
        },
      );
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

    it('logs errors and returns a null stream and error status if stream cannot be retrieved', (done) => {
      const sdkError = {error: {}};

      logger.error = jest.fn();
      mockSDKMeeting.getMediaStreams = jest.fn(() => Promise.reject(sdkError));
      meetingsSDKAdapter.getStream(meetingID, {sendAudio: true}).pipe(last()).subscribe(
        ({permission, stream}) => {
          expect(stream).toBeNull();
          expect(permission).toBe('ERROR');
          expect(logger.error).toHaveBeenCalledWith(
            'MEETING',
            'meetingID',
            'getStream()',
            'Unable to retrieve local media stream',
            sdkError.error,
          );
          done();
        },
      );
    });

    it('throws errors, nullifies local video and sets permissions to denied, dismissed or error if not retrieved successfully', (done) => {
      const permissions = [
        'DENIED',
        'DISMISSED',
        'ERROR',
      ];
      const sdkError = {error: {}};

      mockSDKMeeting.getMediaStreams = jest.fn(() => Promise.reject(sdkError));
      logger.error = jest.fn();
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

    it('returns local media in a proper shape', (done) => {
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

    it('keeps `localAudio.stream` empty, if the event type is `local` and the audio stream is empty', () => {
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

    it('keeps `localVideo.stream` empty, if the event type is `local` and the audio stream is empty', () => {
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

    it('keeps both `localVideo` and `localVideo` empty, if the event type is `local` and the audio stream is empty', () => {
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

    it('sets `localAudio` and `localVideo`, if the event type is `local`', () => {
      meetingsSDKAdapter.attachMedia(meetingID, event);

      expect(meetingsSDKAdapter.meetings[meetingID].localAudio.stream)
        .toMatchMediaStream(mockSDKMediaStreams.localAudio);
      expect(meetingsSDKAdapter.meetings[meetingID].localVideo.stream)
        .toMatchMediaStream(mockSDKMediaStreams.localVideo);
    });

    it('sets `remoteAudio`, if the event type is `remoteAudio`', () => {
      event = {
        type: 'remoteAudio',
        stream: 'remoteAudio',
      };
      meetingsSDKAdapter.attachMedia(meetingID, event);

      expect(meetingsSDKAdapter.meetings[meetingID]).toMatchObject({
        remoteAudio: 'remoteAudio',
      });
    });

    it('sets `remoteVideo`, if the event type is `remoteVideo`', () => {
      event = {
        type: 'remoteVideo',
        stream: 'remoteVideo',
      };
      meetingsSDKAdapter.attachMedia(meetingID, event);

      expect(meetingsSDKAdapter.meetings[meetingID]).toMatchObject({
        remoteVideo: 'remoteVideo',
      });
    });

    it('sets `remoteShare`, if the event type is `meeting:startedSharingRemote`', () => {
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

    it('clears `remoteShare`, if the event type is `meeting:stoppedSharingRemote`', () => {
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

    it('returns the same meeting object, if the event type is not declared', () => {
      event = {
        type: 'NA',
        stream: {},
      };

      meetingsSDKAdapter.attachMedia(meetingID, event);

      expect(meetingsSDKAdapter.meetings[meetingID]).toMatchObject(meeting);
    });
  });

  describe('stopStream()', () => {
    it('calls stop() of the stream track', () => {
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

    it('removes `localAudio.stream` and `localVideo.stream`, if the event type is `local`', () => {
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

    it('removes `remoteAudio`, if the event type is `remoteAudio`', () => {
      const event = {
        type: 'remoteAudio',
      };

      meetingsSDKAdapter.removeMedia(meetingID, event);

      expect(meetingsSDKAdapter.meetings[meetingID]).toMatchObject({
        remoteAudio: null,
      });
    });

    it('removes `remoteVideo`, if the event type is `remoteVideo`', () => {
      const event = {
        type: 'remoteVideo',
      };

      meetingsSDKAdapter.removeMedia(meetingID, event);

      expect(meetingsSDKAdapter.meetings[meetingID]).toMatchObject({
        remoteVideo: null,
      });
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

    it('returns a new meeting in a proper shape', (done) => {
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
          title: 'my meeting',
          localAudio: {
            stream: mockSDKMediaStreams.localAudio,
            permission: 'ALLOWED',
          },
          localVideo: {
            stream: mockSDKMediaStreams.localVideo,
            permission: 'ALLOWED',
          },
          localShare: {
            stream: null,
          },
          passwordRequired: true,
          remoteAudio: null,
          remoteVideo: null,
          remoteShare: null,
          showRoster: null,
          settings: {
            visible: false,
            preview: {
              audio: null,
              video: null,
            },
          },
          state: 'NOT_JOINED',
          cameraID: null,
          microphoneID: null,
          speakerID: '',
        });
        done();
      });
    });

    it('returns a new meeting in a proper shape with no passwordStatus', (done) => {
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

      mockSDKMeeting.passwordStatus = 'NOT_REQUIRED';

      meetingsSDKAdapter.createMeeting(target).pipe(last()).subscribe((newMeeting) => {
        expect(newMeeting).toMatchObject({
          title: 'my meeting',
          localAudio: {
            stream: mockSDKMediaStreams.localAudio,
            permission: 'ALLOWED',
          },
          localVideo: {
            stream: mockSDKMediaStreams.localVideo,
            permission: 'ALLOWED',
          },
          localShare: {
            stream: null,
          },
          passwordRequired: false,
          remoteAudio: null,
          remoteVideo: null,
          remoteShare: null,
          showRoster: null,
          settings: {
            visible: false,
            preview: {
              audio: null,
              video: null,
            },
          },
          state: 'NOT_JOINED',
          cameraID: null,
          microphoneID: null,
          speakerID: '',
        });
        done();
      });
    });

    it('should emit EVENT_MEETING_UPDATED with the updated title from sdkMeeting.meetingInfo.topic', (done) => {
      // Mock implementations
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

      // Mock fetchMeeting to return an object containing meetingInfo.topic and an emit function
      const mockEmit = jest.fn();

      meetingsSDKAdapter.fetchMeeting = jest.fn(() => ({
        meetingInfo: {
          topic: 'Updated Meeting Title',
        },
        emit: mockEmit,
      }));

      meetingsSDKAdapter.createMeeting(target).pipe(last()).subscribe(() => {
        // Ensure the emit function was called with the updated meeting
        expect(mockEmit).toHaveBeenCalledWith('adapter:meeting:updated', expect.objectContaining({
          title: 'Updated Meeting Title',
        }));

        done();
      });
    });

    it('throws error on failed meeting push request', (done) => {
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
    it('returns meeting sipUri as title', async () => {
      const meetingTitle = 'sipUri';

      expect(await meetingsSDKAdapter.fetchMeetingTitle(meetingTitle)).toEqual(meetingTitle);
    });

    it('returns person displayName if the destination is a personID', async () => {
      const meetingTitle = 'HYDRA_PEOPLE_ID';

      meetingsSDKAdapter.datasource.people.get = jest.fn(() => Promise.resolve({displayName: 'displayName'}));

      expect(await meetingsSDKAdapter.fetchMeetingTitle(meetingTitle)).toEqual('displayName');
    });

    it("returns room's title if the destination is a personID", async () => {
      const meetingTitle = 'HYDRA_ROOM_ID';

      meetingsSDKAdapter.datasource.rooms.get = jest.fn(() => Promise.resolve({title: 'title'}));

      expect(await meetingsSDKAdapter.fetchMeetingTitle(meetingTitle)).toEqual('title');
    });

    it('returns person display name if the sipUri is an email address', async () => {
      const meetingTitle = 'person@webex.com';

      meetingsSDKAdapter.datasource.people.list = jest.fn(() => Promise.resolve({items: [{displayName: 'displayName'}]}));

      expect(await meetingsSDKAdapter.fetchMeetingTitle(meetingTitle)).toEqual('displayName');
    });
  });

  describe('leaveMeeting()', () => {
    it('calls removeMedia() sdk adapter method and sdk leave method', async () => {
      meetingsSDKAdapter.removeMedia = jest.fn();
      await meetingsSDKAdapter.leaveMeeting(meetingID);
      expect(meetingsSDKAdapter.removeMedia).toHaveBeenCalledWith(meetingID);
      expect(mockSDKMeeting.leave).toHaveBeenCalled();
    });

    it('logs error if the SDK cannot leave the meeting', async () => {
      const sdkError = new Error('sdk leave error');

      mockSDKMeeting.leave = jest.fn(() => Promise.reject(sdkError));
      logger.error = jest.fn();
      await meetingsSDKAdapter.leaveMeeting(meetingID);

      expect(logger.error).toHaveBeenCalledWith(
        'MEETING',
        'meetingID',
        'leaveMeeting()',
        'Unable to leave',
        sdkError,
      );
    });
  });

  describe('handleLocalAudio()', () => {
    describe('meeting is unmuted', () => {
      beforeEach(() => {
        meetingsSDKAdapter.meetings[meetingID] = {
          ...meeting,
          localAudio: {
            stream: mockSDKMediaStreams.localAudio,
            permission: 'ALLOWED',
          },
          disabledLocalAudio: null,
          remoteAudio: {},
        };
      });

      it('does not call sdk muteAudio() if the meeting is inactive', async () => {
        meetingsSDKAdapter.meetings[meetingID].remoteAudio = null;
        await meetingsSDKAdapter.handleLocalAudio(meetingID);

        expect(mockSDKMeeting.muteAudio).not.toHaveBeenCalled();
      });

      it('calls sdk muteAudio() if the meeting is active', async () => {
        await meetingsSDKAdapter.handleLocalAudio(meetingID);

        expect(mockSDKMeeting.muteAudio).toHaveBeenCalled();
      });

      it('updates the meeting object to have audio muted', async () => {
        await meetingsSDKAdapter.handleLocalAudio(meetingID);

        expect(meetingsSDKAdapter.meetings[meetingID].localAudio.stream).toBeNull();
        expect(meetingsSDKAdapter.meetings[meetingID].disabledLocalAudio).toMatchMediaStream(
          mockSDKMediaStreams.localAudio,
        );
      });

      it('emits 2 meeting updated events', async () => {
        await meetingsSDKAdapter.handleLocalAudio(meetingID);

        expect(mockSDKMeeting.emit).toHaveBeenCalledTimes(2);
        expect(mockSDKMeeting.emit.mock.calls[1][0]).toBe('adapter:meeting:updated');
        expect(mockSDKMeeting.emit.mock.calls[1][1]).toMatchObject({
          localAudio: {stream: null, muting: undefined},
          disabledLocalAudio: mockSDKMediaStreams.localAudio,
        });
      });

      it('logs error if the sdk muteAudio() rejects with an error', async () => {
        const error = new Error('sdk error');

        mockSDKMeeting.muteAudio = jest.fn(() => Promise.reject(error));
        logger.error = jest.fn();
        await meetingsSDKAdapter.handleLocalAudio(meetingID);

        expect(logger.error).toHaveBeenCalledWith(
          'MEETING',
          'meetingID',
          'handleLocalAudio()',
          'Unable to update local audio settings',
          error,
        );
      });
    });

    describe('meeting is muted', () => {
      beforeEach(() => {
        meetingsSDKAdapter.meetings[meetingID] = {
          ...meeting,
          localAudio: {
            stream: null,
            permission: undefined,
          },
          disabledLocalAudio: mockSDKMediaStreams.localAudio,
          remoteAudio: {},
        };
      });

      it('does not call sdk unmuteAudio() if the meeting is inactive', async () => {
        meetingsSDKAdapter.meetings[meetingID].remoteAudio = null;
        await meetingsSDKAdapter.handleLocalAudio(meetingID);

        expect(mockSDKMeeting.unmuteAudio).not.toHaveBeenCalled();
      });

      it('calls sdk unmuteAudio() if the meeting is active', async () => {
        await meetingsSDKAdapter.handleLocalAudio(meetingID);

        expect(mockSDKMeeting.unmuteAudio).toHaveBeenCalled();
      });

      it('updates the meeting object to have audio unmuted', async () => {
        await meetingsSDKAdapter.handleLocalAudio(meetingID);

        expect(meetingsSDKAdapter.meetings[meetingID].localAudio.stream)
          .toMatchMediaStream(mockSDKMediaStreams.localAudio);
        expect(meetingsSDKAdapter.meetings[meetingID].disabledLocalAudio).toBeNull();
      });

      it('emits 2 meeting updated events', async () => {
        await meetingsSDKAdapter.handleLocalAudio(meetingID);

        expect(mockSDKMeeting.emit).toHaveBeenCalledTimes(2);
        expect(mockSDKMeeting.emit.mock.calls[1][0]).toBe('adapter:meeting:updated');
        expect(mockSDKMeeting.emit.mock.calls[1][1]).toMatchObject({
          localAudio: {
            stream: mockSDKMediaStreams.localAudio,
            muting: undefined,
          },
        });
      });

      it('logs error if the sdk unmuteAudio() rejects with an error', async () => {
        const error = new Error('sdk error');

        mockSDKMeeting.unmuteAudio = jest.fn(() => Promise.reject(error));
        logger.error = jest.fn();
        await meetingsSDKAdapter.handleLocalAudio(meetingID);

        expect(logger.error).toHaveBeenCalledWith(
          'MEETING',
          'meetingID',
          'handleLocalAudio()',
          'Unable to update local audio settings',
          error,
        );
      });
    });
  });

  describe('handleLocalVideo()', () => {
    describe('video is unmuted', () => {
      beforeEach(() => {
        meetingsSDKAdapter.meetings[meetingID] = {
          ...meeting,
          localVideo: {
            stream: mockSDKMediaStreams.localVideo,
            permission: 'ALLOWED',
          },
          disabledLocalVideo: null,
          remoteVideo: {},
        };
      });

      it('does not call sdk muteVideo() if the meeting is inactive', async () => {
        meetingsSDKAdapter.meetings[meetingID].remoteVideo = null;
        await meetingsSDKAdapter.handleLocalVideo(meetingID);

        expect(mockSDKMeeting.muteVideo).not.toHaveBeenCalled();
      });

      it('calls sdk muteVideo() if the meeting is active', async () => {
        await meetingsSDKAdapter.handleLocalVideo(meetingID);

        expect(mockSDKMeeting.muteVideo).toHaveBeenCalled();
      });

      it('updates the meeting object to have video muted', async () => {
        await meetingsSDKAdapter.handleLocalVideo(meetingID);

        expect(meetingsSDKAdapter.meetings[meetingID].localVideo.stream).toBeNull();
        expect(meetingsSDKAdapter.meetings[meetingID].disabledLocalVideo).toMatchMediaStream(
          mockSDKMediaStreams.localVideo,
        );
      });

      it('emits 2 meeting updated events', async () => {
        await meetingsSDKAdapter.handleLocalVideo(meetingID);

        expect(mockSDKMeeting.emit).toHaveBeenCalledTimes(2);
        expect(mockSDKMeeting.emit.mock.calls[1][0]).toBe('adapter:meeting:updated');
        expect(mockSDKMeeting.emit.mock.calls[1][1]).toMatchObject({
          localVideo: {stream: null, muting: undefined},
          disabledLocalVideo: mockSDKMediaStreams.localVideo,
        });
      });

      it('logs error if the sdk muteVideo() rejects with an error', async () => {
        const error = new Error('sdk error');

        mockSDKMeeting.muteVideo = jest.fn(() => Promise.reject(error));
        logger.error = jest.fn();
        await meetingsSDKAdapter.handleLocalVideo(meetingID);

        expect(logger.error).toHaveBeenCalledWith(
          'MEETING',
          'meetingID',
          'handleLocalVideo()',
          'Unable to update local video settings',
          error,
        );
      });
    });

    describe('video is muted', () => {
      beforeEach(() => {
        meetingsSDKAdapter.meetings[meetingID] = {
          ...meeting,
          localVideo: {
            stream: null,
            permission: undefined,
          },
          disabledLocalVideo: mockSDKMediaStreams.localVideo,
          remoteVideo: {},
        };
      });

      it('does not call sdk unmuteVideo() if the meeting is inactive', async () => {
        meetingsSDKAdapter.meetings[meetingID].remoteVideo = null;
        await meetingsSDKAdapter.handleLocalVideo(meetingID);

        expect(mockSDKMeeting.unmuteVideo).not.toHaveBeenCalled();
      });

      it('calls sdk unmuteVideo() if the meeting is active', async () => {
        await meetingsSDKAdapter.handleLocalVideo(meetingID);

        expect(mockSDKMeeting.unmuteVideo).toHaveBeenCalled();
      });

      it('updates the meeting object to have video unmuted', async () => {
        await meetingsSDKAdapter.handleLocalVideo(meetingID);

        expect(meetingsSDKAdapter.meetings[meetingID].localVideo.stream)
          .toMatchMediaStream(mockSDKMediaStreams.localVideo);
        expect(meetingsSDKAdapter.meetings[meetingID].disabledLocalVideo).toBeNull();
      });

      it('emits 2 meeting updated events', async () => {
        await meetingsSDKAdapter.handleLocalVideo(meetingID);

        expect(mockSDKMeeting.emit).toHaveBeenCalledTimes(2);
        expect(mockSDKMeeting.emit.mock.calls[1][0]).toBe('adapter:meeting:updated');
        expect(mockSDKMeeting.emit.mock.calls[1][1]).toMatchObject({
          localVideo: {
            stream: mockSDKMediaStreams.localVideo,
            muting: undefined,
          },
        });
      });

      it('logs error if the sdk unmuteVideo() rejects with an error', async () => {
        const error = new Error('sdk error');

        mockSDKMeeting.unmuteVideo = jest.fn(() => Promise.reject(error));
        logger.error = jest.fn();
        await meetingsSDKAdapter.handleLocalVideo(meetingID);

        expect(logger.error).toHaveBeenCalledWith(
          'MEETING',
          'meetingID',
          'handleLocalVideo()',
          'Unable to update local video settings',
          error,
        );
      });
    });
  });

  describe('handleLocalShare()', () => {
    let mockLogger;
    let stopStream;

    beforeEach(() => {
      const {trueStopStream} = meetingsSDKAdapter.stopStream;

      stopStream = trueStopStream;
      meetingsSDKAdapter.stopStream = jest.fn();

      mockLogger = jest.fn();
    });

    afterEach(() => {
      meetingsSDKAdapter.stopStream = stopStream;
      mockLogger = null;
    });

    it('skips start/stop share if sdk meeting is in SDP negotiation', async () => {
      logger.error = jest.fn();
      const {canUpdateMedia} = mockSDKMeeting;

      mockSDKMeeting.canUpdateMedia = jest.fn(() => false);
      await meetingsSDKAdapter.handleLocalShare(meetingID);

      expect(logger.error).toHaveBeenCalledWith(
        'MEETING',
        'meetingID',
        'handleLocalShare()',
        'Unable to update screen share due to unstable connection.',
      );
      mockSDKMeeting.canUpdateMedia = canUpdateMedia;
    });

    it('start share if the share track is disabled', async () => {
      meetingsSDKAdapter.meetings[meetingID] = {...meeting, localShare: {stream: null}};
      const {getMediaStreams} = mockSDKMeeting;

      mockSDKMeeting.getMediaStreams = jest.fn(() => Promise.resolve([['mockStream'], 'localShare']));
      await meetingsSDKAdapter.handleLocalShare(meetingID);

      expect(meetingsSDKAdapter.meetings[meetingID].localShare.stream).toEqual('localShare');
      expect(mockSDKMeeting.updateShare).toHaveBeenCalled();
      mockSDKMeeting.getMediaStreams = getMediaStreams;
    });

    it('stop share if the share track is enabled', async () => {
      meetingsSDKAdapter.meetings[meetingID] = {...meeting, localShare: {stream: 'localShare'}};
      await meetingsSDKAdapter.handleLocalShare(meetingID);

      expect(mockSDKMeeting.updateShare).toHaveBeenCalledWith({
        sendShare: false,
        receiveShare: true,
      });
    });

    it('resets sharing stream if share control is not handled properly', async () => {
      meetingsSDKAdapter.meetings[meetingID] = {...meeting, localShare: {stream: 'localShare'}};
      logger.warn = mockLogger;
      mockSDKMeeting.updateShare = jest.fn(() => Promise.reject());
      await meetingsSDKAdapter.handleLocalShare(meetingID);

      expect(mockLogger).toHaveBeenCalledWith(
        'MEETING',
        'meetingID',
        'handleLocalShare()',
        'Unable to update local share stream',
        undefined,
      );
    });
  });

  describe('toggleRoster()', () => {
    it('shows roster is roster is hidden', async () => {
      meetingsSDKAdapter.meetings[meetingID].showRoster = false;
      await meetingsSDKAdapter.toggleRoster(meetingID);

      expect(mockSDKMeeting.emit).toHaveBeenCalledTimes(1);
      expect(mockSDKMeeting.emit.mock.calls[0][0]).toBe('adapter:meeting:updated');
      expect(mockSDKMeeting.emit.mock.calls[0][1]).toMatchObject({showRoster: true});
    });

    it('hides roster if roster is shown', async () => {
      meetingsSDKAdapter.meetings[meetingID].showRoster = true;
      await meetingsSDKAdapter.toggleRoster(meetingID);

      expect(mockSDKMeeting.emit).toHaveBeenCalledTimes(1);
      expect(mockSDKMeeting.emit.mock.calls[0][0]).toBe('adapter:meeting:updated');
      expect(mockSDKMeeting.emit.mock.calls[0][1]).toMatchObject({showRoster: false});
    });

    it('returns a rejected promise if meeting does not exist', async () => {
      await expect(meetingsSDKAdapter.toggleRoster('inexistent')).rejects
        .toThrow('Could not find meeting with ID "inexistent"');
    });
  });

  describe('toggleSettings()', () => {
    it('shows settings if settings is hidden', async () => {
      meetingsSDKAdapter.meetings[meetingID].settings.visible = false;
      await meetingsSDKAdapter.toggleSettings(meetingID);
      expect(mockSDKMeeting.emit).toHaveBeenCalledTimes(1);
      expect(mockSDKMeeting.emit.mock.calls[0][0]).toBe('adapter:meeting:updated');
      expect(mockSDKMeeting.emit.mock.calls[0][1]).toMatchObject({settings: {visible: true}});
    });

    it('hides settings if settings is shown', async () => {
      meetingsSDKAdapter.meetings[meetingID].settings.visible = true;
      await meetingsSDKAdapter.toggleSettings(meetingID);
      expect(mockSDKMeeting.emit).toHaveBeenCalledTimes(1);
      expect(mockSDKMeeting.emit.mock.calls[0][0]).toBe('adapter:meeting:updated');
      expect(mockSDKMeeting.emit.mock.calls[0][1]).toMatchObject({settings: {visible: false}});
    });

    it('returns a rejected promise if meeting does not exist', async () => {
      await expect(meetingsSDKAdapter.toggleSettings('inexistent')).rejects
        .toThrow('Could not find meeting with ID "inexistent"');
    });
  });

  describe('switchCamera()', () => {
    it('sets the camera that was chosen by the user', async () => {
      meetingsSDKAdapter.meetings[meetingID].cameraID = null;
      meetingsSDKAdapter.getStream = jest.fn(() => ({stream: new MediaStream(), deviceId: '', toPromise: () => Promise.resolve({stream: new MediaStream(), permission: 'ALLOWED', deviceId: 'example-camera-id'})}));
      await meetingsSDKAdapter.switchCamera(meetingID, 'example-camera-id');

      expect(mockSDKMeeting.emit).toHaveBeenCalledTimes(1);
      expect(mockSDKMeeting.emit.mock.calls[0][0]).toBe('adapter:meeting:updated');
      expect(mockSDKMeeting.emit.mock.calls[0][1]).toMatchObject({cameraID: 'example-camera-id'});
    });

    it('returns a rejected promise if meeting does not exist', async () => {
      await expect(meetingsSDKAdapter.switchCamera('inexistent', 'example-camera-id'))
        .rejects.toThrow('Could not find meeting with ID "inexistent"');
    });

    it('returns a rejected promise if camera stream cannot be obtained', async () => {
      const sdkError = new Error('sdk switch camera error');

      mockSDKMeeting.getMediaStreams = () => Promise.reject(sdkError);

      await expect(meetingsSDKAdapter.switchCamera(meetingID, 'example-camera-id'))
        .rejects.toThrow('Could not change camera, permission not granted: ERROR');
    });
  });

  describe('switchMicrophone()', () => {
    it('sets the microphone that was chosen by the user', async () => {
      meetingsSDKAdapter.meetings[meetingID].microphoneID = null;
      meetingsSDKAdapter.getStream = jest.fn(() => ({stream: new MediaStream(), deviceId: '', toPromise: () => Promise.resolve({stream: new MediaStream(), permission: 'ALLOWED', deviceId: 'example-microphone-id'})}));
      await meetingsSDKAdapter.switchMicrophone(meetingID, 'example-microphone-id');

      expect(mockSDKMeeting.emit).toHaveBeenCalledTimes(1);
      expect(mockSDKMeeting.emit.mock.calls[0][0]).toBe('adapter:meeting:updated');
      expect(mockSDKMeeting.emit.mock.calls[0][1]).toMatchObject({microphoneID: 'example-microphone-id'});
    });

    it('returns a rejected promise if meeting does not exist', async () => {
      await expect(meetingsSDKAdapter.switchMicrophone('inexistent', 'example-microphone-id'))
        .rejects.toThrow('Could not find meeting with ID "inexistent"');
    });

    it('returns a rejected promise if microphone stream cannot be obtained', async () => {
      const sdkError = new Error('sdk switch microphone error');

      mockSDKMeeting.getMediaStreams = () => Promise.reject(sdkError);

      await expect(meetingsSDKAdapter.switchMicrophone(meetingID, 'example-microphone-id'))
        .rejects.toThrow('Could not change microphone, permission not granted: ERROR');
    });
  });

  describe('switchSpeaker()', () => {
    it('sets the speaker that was chosen by the user', async () => {
      meetingsSDKAdapter.meetings[meetingID].speakerID = null;
      await meetingsSDKAdapter.switchSpeaker(meetingID, 'example-speaker-id');

      expect(mockSDKMeeting.emit).toHaveBeenCalledTimes(1);
      expect(mockSDKMeeting.emit.mock.calls[0][0]).toBe('adapter:meeting:updated');
      expect(mockSDKMeeting.emit.mock.calls[0][1]).toMatchObject({speakerID: 'example-speaker-id'});
    });

    it('returns a rejected promise if meeting does not exist', async () => {
      await expect(meetingsSDKAdapter.switchSpeaker('inexistent', 'example-speaker-id'))
        .rejects.toThrow('Could not find meeting with ID "inexistent"');
    });
  });

  describe('ignoreVideoAccessPrompt()', () => {
    it('calls ignoreMediaAccessPrompt() on the meeting object if defined', () => {
      meetingsSDKAdapter.meetings[meetingID].localVideo.ignoreMediaAccessPrompt = jest.fn();

      meetingsSDKAdapter.ignoreVideoAccessPrompt(meetingID);

      expect(meetingsSDKAdapter.meetings[meetingID].localVideo.ignoreMediaAccessPrompt)
        .toHaveBeenCalled();
    });
  });

  describe('ignoreAudioAccessPrompt()', () => {
    it('calls ignoreAudioAccessPrompt() on the meeting object if defined', () => {
      meetingsSDKAdapter.meetings[meetingID].localAudio.ignoreMediaAccessPrompt = jest.fn();

      meetingsSDKAdapter.ignoreAudioAccessPrompt(meetingID);

      expect(meetingsSDKAdapter.meetings[meetingID].localAudio.ignoreMediaAccessPrompt)
        .toHaveBeenCalled();
    });
  });

  describe('getMeeting()', () => {
    it('returns a meeting in a proper shape', (done) => {
      meetingsSDKAdapter.getMeeting(meetingID).pipe(first())
        .subscribe((receivedMeeting) => {
          expect(receivedMeeting).toMatchObject(meeting);
          done();
        });
    });

    it('emits error if meeting does not exist', (done) => {
      meetingsSDKAdapter.getMeeting('inexistent')
        .subscribe(
          () => {},
          (error) => {
            expect(error.message).toBe('Could not find meeting with ID "inexistent"');
            done();
          },
        );
    });
  });

  describe('supportedControls()', () => {
    it('returns an array containing the available control names', () => {
      const availableControls = meetingsSDKAdapter.supportedControls();

      expect(availableControls.sort()).toEqual([
        'join-meeting',
        'leave-meeting',
        'member-roster',
        'mute-audio',
        'mute-video',
        'settings',
        'share-screen',
        'switch-camera',
        'switch-microphone',
        'switch-speaker',
      ]);
    });
  });

  describe('getLayoutTypes()', () => {
    it('returns an array containing the available layout types', () => {
      const availableLayouts = meetingsSDKAdapter.getLayoutTypes();

      expect(availableLayouts.sort()).toEqual([
        'Focus',
        'Grid',
        'Overlay',
        'Prominent',
        'Stack',
      ]);
    });
  });

  describe('changeLayout()', () => {
    it('calls the SDK changeVideoLayout function with the provided layout type', async () => {
      await meetingsSDKAdapter.changeLayout(meetingID, 'Grid');

      expect(mockSDKMeeting.changeVideoLayout).toHaveBeenCalledWith('Equal');
    });
  });

  describe('clearPasswordRequiredFlag()', () => {
    it('clears the passwordRequired flag if set', async () => {
      meetingsSDKAdapter.meetings[meetingID].passwordRequired = true;
      await meetingsSDKAdapter.clearPasswordRequiredFlag(meetingID);

      expect(mockSDKMeeting.emit).toHaveBeenCalledTimes(1);
      expect(mockSDKMeeting.emit.mock.calls[0][0]).toBe('adapter:meeting:updated');
      expect(mockSDKMeeting.emit.mock.calls[0][1]).toMatchObject({passwordRequired: false});
    });
  });

  describe('clearInvalidPasswordFlag()', () => {
    it('clears the invalidPassword flag if set', async () => {
      meetingsSDKAdapter.meetings[meetingID].invalidPassword = true;
      await meetingsSDKAdapter.clearInvalidPasswordFlag(meetingID);

      expect(mockSDKMeeting.emit).toHaveBeenCalledTimes(1);
      expect(mockSDKMeeting.emit.mock.calls[0][0]).toBe('adapter:meeting:updated');
      expect(mockSDKMeeting.emit.mock.calls[0][1]).toMatchObject({invalidPassword: false});
    });
  });

  describe('clearInvalidHostKeyFlag()', () => {
    it('clears the invalidHostKey flag if set', async () => {
      meetingsSDKAdapter.meetings[meetingID].invalidHostKey = true;
      await meetingsSDKAdapter.clearInvalidHostKeyFlag(meetingID);

      expect(mockSDKMeeting.emit).toHaveBeenCalledTimes(1);
      expect(mockSDKMeeting.emit.mock.calls[0][0]).toBe('adapter:meeting:updated');
      expect(mockSDKMeeting.emit.mock.calls[0][1]).toMatchObject({invalidHostKey: false});
    });
  });

  describe('refreshCaptcha()', () => {
    const mockCaptcha = {
      captchaId: 'Captcha_c57280d4-6baf-4a27-87e9-290757754bb6',
      verificationImageURL: 'https://cisco.webex.com/captchaservice/v1/captchas/Captcha_c57280d4-6baf-4a27-87e9-290757754bb6/verificationCodeImage',
      refreshURL: 'https://cisco.webex.com/captchaservice/v1/captchas/refresh?siteurl=cisco&captchaID=Captcha_c57280d4-6baf-4a27-87e9-290757754bb6',
      verificationAudioURL: 'https://cisco.webex.com/captchaservice/v1/captchas/Captcha_c57280d4-6baf-4a27-87e9-290757754bb6/verificationCodeAudio',
    };

    it('refreshes the captcha', async () => {
      meetingsSDKAdapter.meetings[meetingID].requiredCaptcha = {
        captchaId: 'Captcha_b40798d4-6baf-4a27-bf77-2907577524d6',
        verificationImageURL: 'https://cisco.webex.com/captchaservice/v1/captchas/Captcha_b40798d4-6baf-4a27-bf77-2907577524d6/verificationCodeImage',
        refreshURL: 'https://cisco.webex.com/captchaservice/v1/captchas/refresh?siteurl=cisco&captchaID=Captcha_b40798d4-6baf-4a27-bf77-2907577524d6',
        verificationAudioURL: 'https://cisco.webex.com/captchaservice/v1/captchas/Captcha_b40798d4-6baf-4a27-bf77-2907577524d6/verificationCodeAudio',
      };

      mockSDKMeeting.requiredCaptcha = mockCaptcha;

      await meetingsSDKAdapter.refreshCaptcha(meetingID);

      expect(mockSDKMeeting.refreshCaptcha).toHaveBeenCalledWith();
      expect(mockSDKMeeting.emit).toHaveBeenCalledTimes(1);
      expect(mockSDKMeeting.emit.mock.calls[0][0]).toBe('adapter:meeting:updated');
      expect(mockSDKMeeting.emit.mock.calls[0][1]).toMatchObject({requiredCaptcha: mockCaptcha});
    });
  });

  describe('joinMeeting()', () => {
    const verifyPasswordRes1 = {
      failureReason: 'WRONG_PASSWORD',
      isPasswordValid: false,
      requiredCaptcha: {
        captchaId: 'Captcha_c3c3009f-c844-4305-b1c4-6aed2a251247',
        refreshURL: 'https://cisco.webex.com/captchaservice/v1/captchas/refresh?siteurl=cisco&captchaID=Captcha_c3c3009f-c844-4305-b1c4-6aed2a251247',
        verificationAudioURL: 'https://cisco.webex.com/captchaservice/v1/captchas/Captcha_c3c3009f-c844-4305-b1c4-6aed2a251247/verificationCodeAudio',
        verificationImageURL: 'https://cisco.webex.com/captchaservice/v1/captchas/Captcha_c3c3009f-c844-4305-b1c4-6aed2a251247/verificationCodeImage',
      },
    };

    const mockResponse1 = {
      failureReason: 'WRONG_PASSWORD',
      invalidPassword: true,
      requiredCaptcha: {
        captchaId: 'Captcha_c3c3009f-c844-4305-b1c4-6aed2a251247',
        refreshURL: 'https://cisco.webex.com/captchaservice/v1/captchas/refresh?siteurl=cisco&captchaID=Captcha_c3c3009f-c844-4305-b1c4-6aed2a251247',
        verificationAudioURL: 'https://cisco.webex.com/captchaservice/v1/captchas/Captcha_c3c3009f-c844-4305-b1c4-6aed2a251247/verificationCodeAudio',
        verificationImageURL: 'https://cisco.webex.com/captchaservice/v1/captchas/Captcha_c3c3009f-c844-4305-b1c4-6aed2a251247/verificationCodeImage',
      },
    };

    const verifyPasswordRes2 = {
      failureReason: 'WRONG_CAPTCHA',
      isPasswordValid: false,
      requiredCaptcha: {
        captchaId: 'Captcha_e34a56d8-c75e-4424-9a34-b1dd28badd68',
        refreshURL: 'https://cisco.webex.com/captchaservice/v1/captchas/refresh?siteurl=cisco&captchaID=Captcha_e34a56d8-c75e-4424-9a34-b1dd28badd68',
        verificationAudioURL: 'https://cisco.webex.com/captchaservice/v1/captchas/Captcha_e34a56d8-c75e-4424-9a34-b1dd28badd68/verificationCodeAudio',
        verificationImageURL: 'https://cisco.webex.com/captchaservice/v1/captchas/Captcha_e34a56d8-c75e-4424-9a34-b1dd28badd68/verificationCodeImage',
      },
    };

    const mockResponse2 = {
      failureReason: 'WRONG_CAPTCHA',
      invalidPassword: true,
      requiredCaptcha: {
        captchaId: 'Captcha_e34a56d8-c75e-4424-9a34-b1dd28badd68',
        refreshURL: 'https://cisco.webex.com/captchaservice/v1/captchas/refresh?siteurl=cisco&captchaID=Captcha_e34a56d8-c75e-4424-9a34-b1dd28badd68',
        verificationAudioURL: 'https://cisco.webex.com/captchaservice/v1/captchas/Captcha_e34a56d8-c75e-4424-9a34-b1dd28badd68/verificationCodeAudio',
        verificationImageURL: 'https://cisco.webex.com/captchaservice/v1/captchas/Captcha_e34a56d8-c75e-4424-9a34-b1dd28badd68/verificationCodeImage',
      },
    };

    it('joinMeeting with correct password with no captcha needed', async () => {
      mockSDKMeeting.verifyPassword = jest.fn(() => Promise.resolve({
        failureReason: 'NONE',
        isPasswordValid: true,
        requiredCaptcha: null,
      }));
      await meetingsSDKAdapter.joinMeeting(meetingID, {password: 'BJzbHDKd347'});

      expect(mockSDKMeeting.verifyPassword).toHaveBeenCalledWith('BJzbHDKd347', undefined);
      expect(mockSDKMeeting.emit).not.toHaveBeenCalled();
      expect(mockSDKMeeting.join).toHaveBeenCalledTimes(1);
    });

    it('joinMeeting with incorrect password multiple times and receiving captcha code to be entered', async () => {
      mockSDKMeeting.verifyPassword = jest.fn(() => Promise.resolve(verifyPasswordRes1));
      mockSDKMeeting.requiredCaptcha = verifyPasswordRes1.requiredCaptcha;

      await meetingsSDKAdapter.joinMeeting(meetingID, {password: 'fahdkwlr'});

      expect(mockSDKMeeting.verifyPassword).toHaveBeenCalledWith('fahdkwlr', undefined);
      expect(mockSDKMeeting.emit).toHaveBeenCalledTimes(1);
      expect(mockSDKMeeting.emit.mock.calls[0][0]).toBe('adapter:meeting:updated');
      expect(mockSDKMeeting.emit.mock.calls[0][1]).toMatchObject(mockResponse1);
    });

    it('joinMeeting with correct password and incorrect captcha', async () => {
      mockSDKMeeting.verifyPassword = jest.fn(() => Promise.resolve(verifyPasswordRes2));
      mockSDKMeeting.requiredCaptcha = verifyPasswordRes2.requiredCaptcha;

      await meetingsSDKAdapter.joinMeeting(meetingID, {password: 'BJzbHDKd347', captcha: 'pfucip'});

      expect(mockSDKMeeting.verifyPassword).toHaveBeenCalledWith('BJzbHDKd347', 'pfucip');
      expect(mockSDKMeeting.emit).toHaveBeenCalledTimes(1);
      expect(mockSDKMeeting.emit.mock.calls[0][0]).toBe('adapter:meeting:updated');
      expect(mockSDKMeeting.emit.mock.calls[0][1]).toMatchObject(mockResponse2);
    });

    it('joinMeeting with empty password', async () => {
      mockSDKMeeting.verifyPassword = jest.fn();
      await meetingsSDKAdapter.joinMeeting(meetingID, {password: ''});

      expect(mockSDKMeeting.verifyPassword).not.toHaveBeenCalled();
      expect(mockSDKMeeting.emit).toHaveBeenCalledTimes(1);
      expect(mockSDKMeeting.join).not.toHaveBeenCalled();
    });
  });
});
