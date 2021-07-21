import {MeetingsAdapter, MeetingControlState, MeetingState} from '@webex/component-adapter-interfaces';
import {deconstructHydraId} from '@webex/common';
import {
  concat,
  from,
  fromEvent,
  merge,
  Observable,
  BehaviorSubject,
  throwError,
  defer,
  of,
} from 'rxjs';
import {
  catchError,
  concatMap,
  distinctUntilChanged,
  flatMap,
  filter,
  last,
  map,
  publishReplay,
  refCount,
  takeWhile,
  tap,
} from 'rxjs/operators';

import RosterControl from './MeetingsSDKAdapter/controls/RosterControl';

// TODO: Figure out how to import JS Doc definitions and remove duplication.
/**
 * A video conference in Webex over WebRTC.
 *
 * @external Meeting
 * @see {@link https://github.com/webex/component-adapter-interfaces/blob/master/src/MeetingsAdapter.js#L20}
 * @see {@link https://webrtc.org}
 */

// TODO: Figure out how to import JS Doc definitions and remove duplication.
/**
 * Display options of a meeting control.
 *
 * @external MeetingControlDisplay
 * @see {@link https://github.com/webex/component-adapter-interfaces/blob/master/src/MeetingsAdapter.js#L58}
 */

// JS SDK Events
const EVENT_MEDIA_READY = 'media:ready';
const EVENT_MEDIA_STOPPED = 'media:stopped';
const EVENT_STATE_CHANGE = 'meeting:stateChange';
const EVENT_LOCAL_SHARE_STOP = 'meeting:stoppedSharingLocal';
const EVENT_LOCAL_SHARE_START = 'meeting:startedSharingLocal';
const EVENT_REMOTE_SHARE_START = 'meeting:startedSharingRemote';
const EVENT_REMOTE_SHARE_STOP = 'meeting:stoppedSharingRemote';

// Adapter Events
const EVENT_MEETING_UPDATED = 'adapter:meeting:updated';
const EVENT_MEDIA_LOCAL_UPDATE = 'adapter:media:local:update';
const EVENT_SETTINGS_TOGGLE = 'adapter:settings:toggle';
const EVENT_CAMERA_SWITCH = 'adapter:camera:switch';
const EVENT_MICROPHONE_SWITCH = 'adapter:microphone:switch';
const EVENT_SPEAKER_SWITCH = 'adapter:speaker:switch';

// Meeting controls
const JOIN_CONTROL = 'join-meeting';
const EXIT_CONTROL = 'leave-meeting';
const AUDIO_CONTROL = 'mute-audio';
const VIDEO_CONTROL = 'mute-video';
const SHARE_CONTROL = 'share-screen';
const ROSTER_CONTROL = 'member-roster';
const SETTINGS_CONTROL = 'settings';
const SWITCH_CAMERA_CONTROL = 'switch-camera';
const SWITCH_MICROPHONE_CONTROL = 'switch-microphone';
const SWITCH_SPEAKER_CONTROL = 'switch-speaker';
const PROCEED_WITHOUT_CAMERA_CONTROL = 'proceed-without-camera';

// Media stream types
const MEDIA_TYPE_LOCAL = 'local';
const MEDIA_TYPE_LOCAL_SHARE = 'localShare';
const MEDIA_TYPE_REMOTE_AUDIO = 'remoteAudio';
const MEDIA_TYPE_REMOTE_VIDEO = 'remoteVideo';
const MEDIA_TYPE_REMOTE_SHARE = 'remoteShare';
const MEDIA_EVENT_TYPES = [
  MEDIA_TYPE_LOCAL,
  MEDIA_TYPE_LOCAL_SHARE,
  MEDIA_TYPE_REMOTE_AUDIO,
  MEDIA_TYPE_REMOTE_VIDEO,
  MEDIA_TYPE_REMOTE_SHARE,
];

const mediaSettings = {
  receiveVideo: true,
  receiveAudio: true,
  receiveShare: true,
  sendVideo: true,
  sendAudio: true,
  sendShare: false,
};

const HYDRA_ID_TYPE_PEOPLE = 'PEOPLE';
const HYDRA_ID_TYPE_ROOM = 'ROOM';

/**
 * The `MeetingsSDKAdapter` is an implementation of the `MeetingsAdapter` interface.
 * This adapter utilizes the Webex JS SDK to create and join Webex meetings.
 *
 * @implements {MeetingsAdapter}
 */
export default class MeetingsSDKAdapter extends MeetingsAdapter {
  constructor(datasource) {
    super(datasource);
    this.getMeetingObservables = {};
    this.meetings = {};

    this.meetingControls[JOIN_CONTROL] = {
      ID: JOIN_CONTROL,
      action: this.joinMeeting.bind(this),
      display: this.joinControl.bind(this),
    };

    this.meetingControls[AUDIO_CONTROL] = {
      ID: AUDIO_CONTROL,
      action: this.handleLocalAudio.bind(this),
      display: this.audioControl.bind(this),
    };

    this.meetingControls[VIDEO_CONTROL] = {
      ID: VIDEO_CONTROL,
      action: this.handleLocalVideo.bind(this),
      display: this.videoControl.bind(this),
    };

    this.meetingControls[SHARE_CONTROL] = {
      ID: SHARE_CONTROL,
      action: this.handleLocalShare.bind(this),
      display: this.shareControl.bind(this),
    };

    this.meetingControls[EXIT_CONTROL] = {
      ID: EXIT_CONTROL,
      action: this.leaveMeeting.bind(this),
      display: this.exitControl.bind(this),
    };

    this.meetingControls[ROSTER_CONTROL] = new RosterControl(this, ROSTER_CONTROL);

    this.meetingControls[SETTINGS_CONTROL] = {
      ID: SETTINGS_CONTROL,
      action: this.toggleSettings.bind(this),
      display: this.settingsControl.bind(this),
    };

    this.meetingControls[SWITCH_CAMERA_CONTROL] = {
      ID: SWITCH_CAMERA_CONTROL,
      action: this.switchCamera.bind(this),
      display: this.switchCameraControl.bind(this),
    };

    this.meetingControls[SWITCH_MICROPHONE_CONTROL] = {
      ID: SWITCH_MICROPHONE_CONTROL,
      action: this.switchMicrophone.bind(this),
      display: this.switchMicrophoneControl.bind(this),
    };

    this.meetingControls[SWITCH_SPEAKER_CONTROL] = {
      ID: SWITCH_SPEAKER_CONTROL,
      action: this.switchSpeaker.bind(this),
      display: this.switchSpeakerControl.bind(this),
    };
    this.meetingControls[PROCEED_WITHOUT_CAMERA_CONTROL] = {
      ID: PROCEED_WITHOUT_CAMERA_CONTROL,
      action: this.ignoreVideoAccessPrompt.bind(this),
      display: this.proceedWithoutCameraControl.bind(this),
    };
  }

  /**
   * Register the SDK meeting plugin to the device
   * and sync the meeting collection from the server.
   */
  async connect() {
    await this.datasource.meetings.register();
    await this.datasource.meetings.syncMeetings();
  }

  /**
   * Unregister the SDK meeting plugin from the device.
   */
  async disconnect() {
    await this.datasource.meetings.unregister();
  }

  /**
   * Returns an observable that emits local device media streams and their user permission status
   *
   * @private
   * @param {string} ID ID to retrieve the SDK meeting object to add the local media to
   * @returns {Observable} Observable that emits local media streams and their user permission status
   */
  getLocalMedia(ID) {
    const audio$ = mediaSettings.sendAudio
      ? this.getStream(ID, {sendAudio: true}).pipe(
        map(({permission, stream}) => ({
          localAudio: {
            stream,
            permission,
          },
          localVideo: {
            stream: null,
            permission: null,
          },
        })),
      )
      : of({permission: null, stream: null});
    const video$ = mediaSettings.sendVideo
      ? audio$.pipe(
        last(),
        concatMap((audio) => this.getStream(ID, {sendVideo: true}).pipe(
          map(({permission, stream, ignore}) => ({
            ...audio,
            localVideo: {
              stream,
              permission,
              ignoreMediaAccessPrompt: ignore,
            },
          })),
        )),
      )
      : of({permission: null, stream: null});

    return concat(audio$, video$);
  }

  /**
   * Returns an observable that emits local device media streams and their user permission status based on the given constraints.
   *
   * @see {@link MediaStream|https://developer.mozilla.org/en-US/docs/Web/API/MediaStream}.
   *
   * @private
   * @param {string} ID ID of the meeting for which to fetch streams
   * @param {object} mediaDirection A configurable options object for joining a meetings
   * @param {object} audioVideo audio/video object to set audioinput and videoinput devices
   * @returns {Observable} Observable that emits local media streams and their user permission status
   */
  getStream(ID, mediaDirection, audioVideo) {
    return new Observable(async (subscriber) => {
      let ignored = false;

      try {
        const sdkMeeting = this.fetchMeeting(ID);

        const ignore = () => {
          ignored = true;
          subscriber.next({permission: 'IGNORED', stream: null});
          subscriber.complete();
        };

        subscriber.next({permission: 'ASKING', stream: null, ignore});

        const [localStream] = await sdkMeeting.getMediaStreams(mediaDirection, audioVideo);

        for (const track of localStream.getTracks()) {
          if (track.kind === 'video' && !mediaDirection.sendVideo) {
            localStream.removeTrack(track);
          }
          if (track.kind === 'audio' && !mediaDirection.sendAudio) {
            localStream.removeTrack(track);
          }
        }

        if (!ignored) {
          subscriber.next({permission: 'ALLOWED', stream: localStream});
          subscriber.complete();
        }
      } catch (error) {
        if (!ignored) {
          let perm;

          // eslint-disable-next-line no-console
          console.error('Unable to retrieve local media stream for meeting', ID, 'with mediaDirection', mediaDirection, 'and audioVideo', audioVideo, 'reason:', error);

          if (error instanceof DOMException && error.name === 'NotAllowedError') {
            if (error.message === 'Permission dismissed') {
              perm = 'DISMISSED';
            } else {
              perm = 'DENIED';
            }
          } else {
            perm = 'ERROR';
          }
          subscriber.next({permission: perm, stream: null});
          subscriber.complete();
        }
      }
    });
  }

  /**
   * Returns available media devices.
   *
   * @param {string} ID ID of the meeting
   * @param {'videoinput'|'audioinput'|'audiooutput'} type String specifying the device type.
   * See {@link https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo/kind|MDN}
   * @returns {MediaDeviceInfo[]} Array containing media devices.
   * @private
   */
  // eslint-disable-next-line class-methods-use-this
  async getAvailableDevices(ID, type) {
    let devices;

    try {
      const sdkMeeting = this.fetchMeeting(ID);

      devices = await sdkMeeting.getDevices();
      devices = devices.filter((device) => device.kind === type);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Unable to retrieve devices for meeting "${ID}"`, error);

      devices = [];
    }

    return devices;
  }

  /**
   * Update the meeting object with media attached based on a given event type.
   *
   * @private
   * @param {string} ID ID of the meeting to update
   * @param {object} media Media stream to attach to the meeting object based on a given event type
   * @param {string} media.type Type of event associated with the media change
   * @param {MediaStream} media.stream Media stream to attach to meeting
   */
  attachMedia(ID, {type, stream}) {
    const meeting = {...this.meetings[ID]};

    switch (type) {
      case MEDIA_TYPE_LOCAL:
        this.meetings[ID] = {
          ...meeting,
          // Attach the media streams only if the streams are unmuted
          // `disableLocalAudio/Video` change inside handle media stream methods
          localAudio: {
            ...meeting.localAudio,
            stream: meeting.disabledLocalAudio ? null : new MediaStream(stream.getAudioTracks()),
          },
          localVideo: {
            ...meeting.localVideo,
            stream: meeting.disabledLocalVideo ? null : new MediaStream(stream.getVideoTracks()),
          },
        };
        break;
      case MEDIA_TYPE_REMOTE_AUDIO:
        this.meetings[ID] = {...meeting, remoteAudio: stream};
        break;
      case MEDIA_TYPE_REMOTE_VIDEO:
        this.meetings[ID] = {...meeting, remoteVideo: stream};
        break;
      case MEDIA_TYPE_LOCAL_SHARE:
        this.meetings[ID] = {...meeting, localShare: {stream}};
        break;
      case MEDIA_TYPE_REMOTE_SHARE:
        this.meetings[ID] = {...meeting, remoteShareStream: stream};
        break;
      case EVENT_REMOTE_SHARE_START:
        // Only activate the remote stream when get get the start notification
        this.meetings[ID] = {...meeting, remoteShare: meeting.remoteShareStream};
        break;
      case EVENT_REMOTE_SHARE_STOP:
        // Remove remote share on stop event
        this.meetings[ID] = {...meeting, remoteShare: null};
        break;
      default:
        break;
    }
  }

  /**
   * Stops the tracks of the given media stream.
   *
   * @see {@link MediaStream|https://developer.mozilla.org/en-US/docs/Web/API/MediaStream}.
   *
   * @private
   * @static
   * @param {MediaStream} stream Media stream for which to stop tracks
   */
  // eslint-disable-next-line class-methods-use-this
  stopStream(stream) {
    if (stream) {
      const tracks = stream.getTracks();

      tracks.forEach((track) => track.stop());
    }
  }

  /**
   * Update the meeting object by removing all media.
   *
   * @private
   * @param {string} ID ID of the meeting to update
   */
  removeMedia(ID) {
    if (this.meetings && this.meetings[ID]) {
      this.stopStream(this.meetings[ID].localAudio.stream);
      this.stopStream(this.meetings[ID].localVideo.stream);
      this.stopStream(this.meetings[ID].localShare.stream);
    }

    this.meetings[ID] = {
      ...this.meetings[ID],
      localAudio: {
        stream: null,
        permission: null,
      },
      localVideo: {
        stream: null,
        permission: null,
      },
      localShare: {
        stream: null,
      },
      remoteAudio: null,
      remoteVideo: null,
      remoteShare: null,
      cameraID: null,
      microphoneID: null,
      speakerID: null,
    };
  }

  /**
   * Returns a promise of a meeting title for a given destination.
   * Supported destinations are person ID, room ID and SIP URI.
   *
   * @private
   * @param {string} destination Virtual meeting destination
   * @returns {Promise.<string>} Promise to the tile of the meeting at the destination
   */
  async fetchMeetingTitle(destination) {
    const {id, type} = deconstructHydraId(destination);
    let meetingTitle = destination;

    if (type === HYDRA_ID_TYPE_PEOPLE) {
      const {displayName} = await this.datasource.people.get(id);

      meetingTitle = `${displayName}'s Personal Room`;
    } else if (type === HYDRA_ID_TYPE_ROOM) {
      // One must use a Hydra ID when calling `get` on rooms.
      // It has both the convo ID and cluster name in it.
      const {title} = await this.datasource.rooms.get(destination);

      meetingTitle = title;
    } else {
      try {
        const people = await this.datasource.people.list({email: destination});

        if (people.items) {
          const {displayName} = people.items[0];

          meetingTitle = `${displayName}'s Personal Room`;
        }
        // eslint-disable-next-line no-empty
      } catch (error) {}
    }

    return meetingTitle;
  }

  /**
   * Creates meeting and returns an observable to the new meeting data.
   *
   * @param {string} destination Destination where to start the meeting at
   * @returns {Observable.<Meeting>} Observable stream that emits data of the newly created meeting
   */
  createMeeting(destination) {
    const newMeeting$ = from(this.datasource.meetings.create(destination)).pipe(
      flatMap(({id}) => from(this.fetchMeetingTitle(destination)).pipe(
        map((title) => ({ID: id, title})),
      )),
      map((meeting) => ({
        ...meeting,
        localAudio: {
          stream: null,
          permission: null,
        },
        localVideo: {
          stream: null,
          permission: null,
        },
        localShare: {
          stream: null,
        },
        remoteAudio: null,
        remoteVideo: null,
        remoteShare: null,
        showRoster: null,
        showSettings: false,
        state: MeetingState.NOT_JOINED,
        cameraID: null,
        microphoneID: null,
        speakerID: null,
      })),
    );

    const meeting$ = newMeeting$.pipe(
      concatMap((meeting) => this.getLocalMedia(meeting.ID).pipe(
        map((localMedia) => ({
          ...meeting,
          ...localMedia,
        })),
      )),
    );

    return concat(newMeeting$, meeting$).pipe(
      tap((meeting) => {
        const sdkMeeting = this.fetchMeeting(meeting.ID);

        this.meetings[meeting.ID] = meeting;
        sdkMeeting.emit(EVENT_MEETING_UPDATED);
      }),
      catchError((err) => {
        // eslint-disable-next-line no-console
        console.error(`Unable to create a meeting with "${destination}"`, err);
        throw err;
      }),
    );
  }

  /**
   * Returns a SDK meeting object retrieved from the collection.
   *
   * @private
   * @param {string} ID ID of the meeting to fetch.
   * @returns {object} The SDK meeting object from the meetings collection.
   */
  fetchMeeting(ID) {
    return this.datasource.meetings.getMeetingByType('id', ID);
  }

  /**
   * Attempts to join the meeting of the given meeting ID.
   * If the meeting is successfully joined, a ready event is dispatched.
   *
   * @param {string} ID ID of the meeting to join
   */
  async joinMeeting(ID) {
    try {
      const sdkMeeting = this.fetchMeeting(ID);
      const localStream = new MediaStream();

      const localAudio = this.meetings[ID].localAudio.stream
        || this.meetings[ID].disabledLocalAudio;
      const localVideo = this.meetings[ID].localVideo.stream
        || this.meetings[ID].disabledLocalVideo;

      if (localAudio) {
        localAudio.getTracks().forEach((track) => localStream.addTrack(track));
      }

      if (localVideo) {
        localVideo.getTracks().forEach((track) => localStream.addTrack(track));
      }

      await sdkMeeting.join();

      // SDK requires to join the meeting before adding the local stream media to the meeting
      await sdkMeeting.addMedia({localStream, mediaSettings});

      // Mute either streams after join if user had muted them before joining
      if (this.meetings[ID].localAudio.stream === null) {
        await sdkMeeting.muteAudio();
      }

      if (this.meetings[ID].localVideo.stream === null) {
        await sdkMeeting.muteVideo();
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Unable to join meeting "${ID}"`, error);
    }
  }

  /**
   * Attempts to leave the meeting of the given meeting ID.
   * If the user had left the meeting successfully, a stopped event is dispatched.
   *
   * @param {string} ID ID of the meeting to leave from
   */
  async leaveMeeting(ID) {
    try {
      const sdkMeeting = this.fetchMeeting(ID);

      this.removeMedia(ID);

      await sdkMeeting.leave();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Unable to leave from the meeting "${ID}"`, error);
    }
  }

  /**
   * Returns an observable that emits the display data of a meeting control.
   *
   * @private
   * @returns {Observable.<MeetingControlDisplay>} Observable stream that emits display data of the join control
   */
  // eslint-disable-next-line class-methods-use-this
  joinControl() {
    return Observable.create((observer) => {
      observer.next({
        ID: JOIN_CONTROL,
        text: 'Join meeting',
        tooltip: 'Join meeting',
        state: MeetingControlState.ACTIVE,
      });

      observer.complete();
    });
  }

  /**
   * Returns an observable that emits the display data of a meeting control.
   *
   * @private
   * @returns {Observable.<MeetingControlDisplay>} Observable stream that emits display data of the exit control
   */
  // eslint-disable-next-line class-methods-use-this
  exitControl() {
    return Observable.create((observer) => {
      observer.next({
        ID: EXIT_CONTROL,
        icon: 'cancel_28',
        tooltip: 'Leave',
        state: MeetingControlState.ACTIVE,
      });

      observer.complete();
    });
  }

  /**
   * Attempts to mute the microphone of the given meeting ID.
   * If the microphone is successfully muted, an audio mute event is dispatched.
   *
   * @private
   * @param {string} ID ID of the meeting to mute audio
   */
  async handleLocalAudio(ID) {
    const sdkMeeting = this.fetchMeeting(ID);

    try {
      const isInSession = !!this.meetings[ID].remoteAudio;
      const noAudio = !this.meetings[ID].disabledLocalAudio && !this.meetings[ID].localAudio.stream;
      const audioEnabled = !!this.meetings[ID].localAudio.stream;
      let state;

      if (noAudio) {
        state = MeetingControlState.DISABLED;
      } else if (audioEnabled) {
        // Mute the audio only if there is an active meeting
        if (isInSession) {
          await sdkMeeting.muteAudio();
        }

        // Store the current local audio stream to avoid an extra request call
        this.meetings[ID].disabledLocalAudio = this.meetings[ID].localAudio.stream;
        this.meetings[ID].localAudio.stream = null;
        state = MeetingControlState.INACTIVE;
      } else {
        // Unmute the audio only if there is an active meeting
        if (isInSession) {
          await sdkMeeting.unmuteAudio();
        }

        // Retrieve the stored local audio stream
        this.meetings[ID].localAudio.stream = this.meetings[ID].disabledLocalAudio;
        this.meetings[ID].disabledLocalAudio = null;
        state = MeetingControlState.ACTIVE;
      }

      // Due to SDK limitation around local media updates,
      // we need to emit a custom event for audio mute updates
      sdkMeeting.emit(EVENT_MEDIA_LOCAL_UPDATE, {
        control: AUDIO_CONTROL,
        state,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Unable to update local audio settings for meeting "${ID}"`, error);
    }
  }

  /**
   * Returns an observable that emits the display data of a mute meeting audio control.
   *
   * @private
   * @param {string} ID ID of the meeting to mute audio
   * @returns {Observable.<MeetingControlDisplay>} Observable stream that emits display data of the audio control
   */
  audioControl(ID) {
    const muted = {
      ID: AUDIO_CONTROL,
      icon: 'microphone-muted_28',
      tooltip: 'Unmute',
      state: MeetingControlState.ACTIVE,
      text: null,
    };
    const unmuted = {
      ID: AUDIO_CONTROL,
      icon: 'microphone-muted_28',
      tooltip: 'Mute',
      state: MeetingControlState.INACTIVE,
      text: null,
    };
    const disabled = {
      ID: AUDIO_CONTROL,
      icon: 'microphone-muted_28',
      tooltip: 'No microphone available',
      state: MeetingControlState.DISABLED,
      text: null,
    };

    return this.getMeeting(ID).pipe(
      map(({localAudio: {stream}, disabledLocalAudio}) => (
        (stream && unmuted) || (disabledLocalAudio && muted) || disabled
      )),
      distinctUntilChanged(),
    );
  }

  /**
   * Attempts to mute the camera of the given meeting ID.
   * If the camera is successfully muted, a video mute event is dispatched.
   *
   * @private
   * @param {string} ID ID of the meeting to mute video
   */
  async handleLocalVideo(ID) {
    const sdkMeeting = this.fetchMeeting(ID);

    try {
      const isInSession = !!this.meetings[ID].remoteVideo;
      const noVideo = !this.meetings[ID].disabledLocalVideo && !this.meetings[ID].localVideo.stream;
      const videoEnabled = !!this.meetings[ID].localVideo.stream;
      let state;

      if (noVideo) {
        state = MeetingControlState.DISABLED;
      } else if (videoEnabled) {
        // Mute the video only if there is an active meeting
        if (isInSession) {
          await sdkMeeting.muteVideo();
        }

        // Store the current local video stream to avoid an extra request call
        this.meetings[ID].disabledLocalVideo = this.meetings[ID].localVideo.stream;
        this.meetings[ID].localVideo.stream = null;
        state = MeetingControlState.INACTIVE;
      } else {
        // Unmute the video only if there is an active meeting
        if (isInSession) {
          await sdkMeeting.unmuteVideo();
        }

        // Retrieve the stored local video stream
        this.meetings[ID].localVideo.stream = this.meetings[ID].disabledLocalVideo;
        this.meetings[ID].disabledLocalVideo = null;
        state = MeetingControlState.ACTIVE;
      }

      // Due to SDK limitation around local media updates,
      // we need to emit a custom event for video mute updates
      sdkMeeting.emit(EVENT_MEDIA_LOCAL_UPDATE, {
        control: VIDEO_CONTROL,
        state,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Unable to update local video settings for meeting "${ID}"`, error);
    }
  }

  /**
   * Returns an observable that emits the display data of a mute meeting video control.
   *
   * @private
   * @param {string} ID ID of the meeting to mute video
   * @returns {Observable.<MeetingControlDisplay>} Observable stream that emits display data of the video control
   */
  videoControl(ID) {
    const muted = {
      ID: VIDEO_CONTROL,
      icon: 'camera-muted_28',
      tooltip: 'Start video',
      state: MeetingControlState.ACTIVE,
      text: null,
    };
    const unmuted = {
      ID: VIDEO_CONTROL,
      icon: 'camera-muted_28',
      tooltip: 'Stop video',
      state: MeetingControlState.INACTIVE,
      text: null,
    };
    const disabled = {
      ID: VIDEO_CONTROL,
      icon: 'camera-muted_28',
      tooltip: 'No camera available',
      state: MeetingControlState.DISABLED,
      text: null,
    };

    return this.getMeeting(ID).pipe(
      map(({localVideo: {stream}, disabledLocalVideo}) => (
        (stream && unmuted) || (disabledLocalVideo && muted) || disabled
      )),
      distinctUntilChanged(),
    );
  }

  /**
   * Attempts to start/stop screen sharing to the given meeting ID.
   * If successful, a sharing start/stop event is dispatched.
   *
   * @private
   * @param {string} ID ID of the meeting to start/stop sharing
   */
  async handleLocalShare(ID) {
    const sdkMeeting = this.fetchMeeting(ID);

    if (!sdkMeeting.canUpdateMedia()) {
      // eslint-disable-next-line no-console
      console.error(`Unable to update screen share for meeting "${ID}" due to unstable connection.`);

      return;
    }

    const enableSharingStream = async () => {
      const [, localShare] = await sdkMeeting.getMediaStreams({sendShare: true});

      this.meetings[ID].localShare.stream = localShare;

      sdkMeeting.emit(EVENT_MEDIA_LOCAL_UPDATE, {
        control: SHARE_CONTROL,
        state: MeetingControlState.ACTIVE,
      });

      await sdkMeeting.updateShare({stream: localShare, sendShare: true, receiveShare: true});
    };

    const disableSharingStream = async () => {
      this.stopStream(this.meetings[ID].localShare.stream);
      this.meetings[ID].localShare.stream = null;

      sdkMeeting.emit(EVENT_MEDIA_LOCAL_UPDATE, {
        control: SHARE_CONTROL,
        state: MeetingControlState.INACTIVE,
      });

      await sdkMeeting.updateShare({
        sendShare: false,
        receiveShare: true,
      });

      // The rest of the cleanup is done in the handling of the EVENT_LOCAL_SHARE_STOP event emitted by sdkMeeting.updateShare
    };

    const resetSharingStream = (error) => {
      // eslint-disable-next-line no-console
      console.warn(`Unable to update local share stream for meeting "${ID}"`, error);

      if (this.meetings[ID] && this.meetings[ID].localShare.stream) {
        this.stopStream(this.meetings[ID].localShare.stream);
        this.meetings[ID].localShare.stream = null;
      }

      sdkMeeting.emit(EVENT_MEDIA_LOCAL_UPDATE, {
        control: SHARE_CONTROL,
        state: MeetingControlState.INACTIVE,
      });
    };

    //
    // Workflow:
    // To enable or to disable the local sharing stream based on toggle state.
    // Will stop sharing stream and reset UI state when error happens
    //
    try {
      if (this.meetings[ID].localShare.stream) {
        await disableSharingStream();
      } else {
        await enableSharingStream();
      }
    } catch (error) {
      resetSharingStream(error);
    }
  }

  /**
   * Returns an observable that emits the display data of a share control.
   *
   * @private
   * @param {string} ID ID of the meeting to start/stop screen share
   * @returns {Observable.<MeetingControlDisplay>} Observable stream that emits display data of the screen share control
   */
  shareControl(ID) {
    const sdkMeeting = this.fetchMeeting(ID);
    const inactiveShare = {
      ID: SHARE_CONTROL,
      icon: 'share-screen-presence-stroke_26',
      tooltip: 'Start Share',
      state: MeetingControlState.INACTIVE,
      text: null,
    };
    const activeShare = {
      ID: SHARE_CONTROL,
      icon: 'share-screen-presence-stroke_26',
      tooltip: 'Stop Share',
      state: MeetingControlState.ACTIVE,
      text: null,
    };
    const disabledShare = {
      ID: SHARE_CONTROL,
      icon: 'share-screen-presence-stroke_26',
      tooltip: 'Sharing is Unavailable',
      state: MeetingControlState.DISABLED,
      text: null,
    };

    const getDisplayData$ = Observable.create((observer) => {
      if (sdkMeeting) {
        observer.next(inactiveShare);
      } else {
        observer.error(new Error(`Could not find meeting with ID "${ID}" to add share control`));
      }

      observer.complete();
    });

    const localMediaUpdateEvent$ = fromEvent(sdkMeeting, EVENT_MEDIA_LOCAL_UPDATE).pipe(
      filter((event) => event.control === SHARE_CONTROL),
      map(({state}) => {
        let eventData;

        switch (state) {
          case MeetingControlState.DISABLED:
            eventData = disabledShare;
            break;
          case MeetingControlState.INACTIVE:
            eventData = inactiveShare;
            break;
          case MeetingControlState.ACTIVE:
            eventData = activeShare;
            break;
          default:
            eventData = disabledShare;
            break;
        }

        return eventData;
      }),
    );

    const meetingWithMediaStoppedSharingLocalEvent$ = fromEvent(
      sdkMeeting,
      EVENT_LOCAL_SHARE_STOP,
    ).pipe(
      // eslint-disable-next-line no-console
      tap(() => console.info('EVENT_LOCAL_SHARE_STOP was triggered')),
      map(() => inactiveShare),
    );

    const meetingWithMediaStartedSharingLocalEvent$ = fromEvent(
      sdkMeeting,
      EVENT_LOCAL_SHARE_START,
    ).pipe(
      // eslint-disable-next-line no-console
      tap(() => console.info('EVENT_LOCAL_SHARE_START was triggered')),
      map(() => activeShare),
    );

    const sharingEvents$ = merge(
      localMediaUpdateEvent$,
      meetingWithMediaStoppedSharingLocalEvent$,
      meetingWithMediaStartedSharingLocalEvent$,
    );

    return concat(getDisplayData$, sharingEvents$);
  }

  /**
   * Attempts to toggle roster to the given meeting ID.
   * A roster toggle event is dispatched.
   *
   * @private
   * @param {string} ID ID of the meeting to toggle roster
   */
  toggleRoster(ID) {
    return this.updateMeeting(ID, ({showRoster}) => ({showRoster: !showRoster}));
  }

  /**
   * Toggles the showSettings flag of the given meeting ID.
   * A settings toggle event is dispatched.
   *
   * @private
   * @param {string} ID  Meeting ID
   */
  toggleSettings(ID) {
    const sdkMeeting = this.fetchMeeting(ID);
    const showSettings = !this.meetings[ID].showSettings;

    this.meetings[ID].showSettings = showSettings;

    sdkMeeting.emit(EVENT_SETTINGS_TOGGLE, {
      state: showSettings
        ? MeetingControlState.ACTIVE
        : MeetingControlState.INACTIVE,
    });
  }

  /**
   * Returns an observable that emits the display data of a settings control.
   *
   * @private
   * @param {string} ID  Meeting id
   * @returns {Observable.<MeetingControlDisplay>} Observable stream that emits display data of the settings control
   */
  settingsControl(ID) {
    const sdkMeeting = this.fetchMeeting(ID);
    const active = {
      ID: SETTINGS_CONTROL,
      icon: 'settings_32',
      tooltip: 'Hide settings panel',
      state: MeetingControlState.ACTIVE,
      text: 'Settings',
    };
    const inactive = {
      ID: SETTINGS_CONTROL,
      icon: 'settings_32',
      tooltip: 'Show settings panel',
      state: MeetingControlState.INACTIVE,
      text: 'Settings',
    };

    let state$;

    if (sdkMeeting) {
      const initialState = (this.meetings[ID] && this.meetings[ID].showSettings)
        ? active
        : inactive;

      state$ = new BehaviorSubject(initialState);

      const settingsEvent$ = fromEvent(sdkMeeting, EVENT_SETTINGS_TOGGLE)
        .pipe(map(({state}) => (state === MeetingControlState.ACTIVE ? active : inactive)));

      settingsEvent$.subscribe((value) => state$.next(value));
    } else {
      state$ = throwError(new Error(`Could not find meeting with ID "${ID}" to add settings control`));
    }

    return state$;
  }

  /**
   * Switches the camera control.
   *
   * @param {string} ID Meeting ID
   * @param {string} cameraID ID of the camera to switch to
   * @private
   */
  async switchCamera(ID, cameraID) {
    const sdkMeeting = this.fetchMeeting(ID);
    const {stream, permission} = await this.getStream(
      ID,
      {sendVideo: true},
      {video: {deviceId: cameraID}},
    ).toPromise();

    if (stream) {
      this.meetings[ID].localVideo.stream = stream;
      this.meetings[ID].cameraID = cameraID;

      if (this.meetings[ID].state === MeetingState.JOINED) {
        await sdkMeeting.updateVideo({
          stream,
          receiveVideo: mediaSettings.receiveVideo,
          sendVideo: mediaSettings.sendVideo,
        });
      }
      sdkMeeting.emit(EVENT_CAMERA_SWITCH, {cameraID});
    } else {
      throw new Error('Could not change camera, permission not granted:', permission);
    }
  }

  /**
   * Switches the microphone control.
   *
   * @param {string} ID Meeting ID
   * @param {string} microphoneID ID of the microphone to switch to
   * @private
   */
  async switchMicrophone(ID, microphoneID) {
    const sdkMeeting = this.fetchMeeting(ID);

    const {stream, permission} = await this.getStream(
      ID,
      {sendAudio: true},
      {audio: {deviceId: microphoneID}},
    ).toPromise();

    if (stream) {
      this.meetings[ID].localAudio.stream = stream;
      this.meetings[ID].microphoneID = microphoneID;

      if (this.meetings[ID].state === MeetingState.JOINED) {
        await sdkMeeting.updateAudio({
          stream,
          receiveAudio: mediaSettings.receiveAudio,
          sendAudio: mediaSettings.sendAudio,
        });
      }
      sdkMeeting.emit(EVENT_MICROPHONE_SWITCH, {microphoneID});
    } else {
      throw new Error('Could not change microphone, permission not granted:', permission);
    }
  }

  /**
   * Switches the speaker control.
   *
   * @param {string} ID  Meeting ID
   * @param {string} speakerID  ID of the speaker device to switch to
   * @private
   */
  async switchSpeaker(ID, speakerID) {
    const sdkMeeting = this.fetchMeeting(ID);

    this.meetings[ID].speakerID = speakerID;
    sdkMeeting.emit(EVENT_SPEAKER_SWITCH, {speakerID});
  }

  /**
   * Returns an observable that emits the display data of the switch camera control.
   *
   * @param {string} ID Meeting ID
   * @returns {Observable.<MeetingControlDisplay>} Observable that emits control display data of the switch camera control
   * @private
   */
  switchCameraControl(ID) {
    const sdkMeeting = this.fetchMeeting(ID);
    const availableCameras$ = defer(() => this.getAvailableDevices(ID, 'videoinput'));

    const initialControl$ = new Observable((observer) => {
      if (sdkMeeting) {
        observer.next({
          ID: SWITCH_CAMERA_CONTROL,
          tooltip: 'Video Devices',
          noOptionsMessage: 'No available cameras',
          options: null,
          selected: this.meetings[ID].cameraID,
        });
        observer.complete();
      } else {
        observer.error(new Error(`Could not find meeting with ID "${ID}" to add switch camera control`));
      }
    });

    const controlWithOptions$ = initialControl$.pipe(
      concatMap((control) => availableCameras$.pipe(
        map((availableCameras) => ({
          ...control,
          selected: this.meetings[ID].cameraID,
          options: availableCameras && availableCameras.map((camera) => ({
            value: camera.deviceId,
            label: camera.label,
            camera,
          })),
        })),
      )),
    );

    const controlFromEvent$ = fromEvent(sdkMeeting, EVENT_CAMERA_SWITCH).pipe(
      concatMap(({cameraID}) => controlWithOptions$.pipe(
        map((control) => ({
          ...control,
          selected: cameraID,
        })),
      )),
    );

    return concat(initialControl$, controlWithOptions$, controlFromEvent$);
  }

  /**
   * Returns an observable that emits the display data of the switch microphone control.
   *
   * @param {string} ID Meeting ID
   * @returns {Observable.<MeetingControlDisplay>} Observable that emits control display data of the switch microphone control
   * @private
   */
  switchMicrophoneControl(ID) {
    const sdkMeeting = this.fetchMeeting(ID);
    const availableMicrophones$ = defer(() => this.getAvailableDevices(ID, 'audioinput'));

    const initialControl$ = new Observable((observer) => {
      if (sdkMeeting) {
        observer.next({
          ID: SWITCH_MICROPHONE_CONTROL,
          tooltip: 'Microphone Devices',
          noOptionsMessage: 'No available microphones',
          options: null,
          selected: this.meetings[ID].microphoneID,
        });
        observer.complete();
      } else {
        observer.error(new Error(`Could not find meeting with ID "${ID}" to add switch microphone control`));
      }
    });

    const controlWithOptions$ = initialControl$.pipe(
      concatMap((control) => availableMicrophones$.pipe(
        map((availableMicrophones) => ({
          ...control,
          selected: this.meetings[ID].microphoneID,
          options: availableMicrophones && availableMicrophones.map((microphone) => ({
            value: microphone.deviceId,
            label: microphone.label,
            microphone,
          })),
        })),
      )),
    );

    const controlFromEvent$ = fromEvent(sdkMeeting, EVENT_MICROPHONE_SWITCH).pipe(
      concatMap(({microphoneID}) => controlWithOptions$.pipe(
        map((control) => ({
          ...control,
          selected: microphoneID,
        })),
      )),
    );

    return concat(initialControl$, controlWithOptions$, controlFromEvent$);
  }

  /**
   * Returns an observable that emits the display data of the speaker switcher control.
   *
   * @param {string} ID  Meeting ID
   * @returns {Observable.<MeetingControlDisplay>} Observable that emits control display data of speaker switcher control
   * @private
   */
  switchSpeakerControl(ID) {
    const sdkMeeting = this.fetchMeeting(ID);
    const availableSpeakers$ = defer(() => this.getAvailableDevices(ID, 'audiooutput'));

    const initialControl$ = new Observable((observer) => {
      if (sdkMeeting) {
        observer.next({
          ID: SWITCH_SPEAKER_CONTROL,
          tooltip: 'Speaker Devices',
          noOptionsMessage: 'No available speakers',
          options: null,
          selected: this.meetings[ID].speakerID,
        });
        observer.complete();
      } else {
        observer.error(new Error(`Could not find meeting with ID "${ID}" to add switch speaker control`));
      }
    });

    const controlWithOptions$ = initialControl$.pipe(
      concatMap((control) => availableSpeakers$.pipe(
        map((availableSpeakers) => ({
          ...control,
          selected: this.meetings[ID].speakerID,
          options: availableSpeakers && availableSpeakers.map((speaker) => ({
            value: speaker.deviceId,
            label: speaker.label,
            speaker,
          })),
        })),
      )),
    );

    const controlFromEvent$ = fromEvent(sdkMeeting, EVENT_SPEAKER_SWITCH).pipe(
      concatMap(({speakerID}) => controlWithOptions$.pipe(
        map((control) => ({
          ...control,
          selected: speakerID,
        })),
      )),
    );

    return concat(initialControl$, controlWithOptions$, controlFromEvent$);
  }

  /**
   * Returns an observable that emits the display data of the proceed without camera control.
   *
   * @param {string} ID  Meeting ID
   * @returns {Observable.<MeetingControlDisplay>} Observable that emits control display data of proceed without camera control
   * @private
   */
  proceedWithoutCameraControl(ID) {
    const sdkMeeting = this.fetchMeeting(ID);

    const control$ = new Observable((observer) => {
      if (sdkMeeting) {
        observer.next({
          ID: PROCEED_WITHOUT_CAMERA_CONTROL,
          text: 'Proceed without camera',
          tooltip: 'Ignore media access prompt and proceed without camera',
        });
        observer.complete();
      } else {
        observer.error(new Error(`Could not find meeting with ID "${ID}" to add proceed without camera control`));
      }
    });

    return control$;
  }

  /**
   * Allows user to join meeting without allowing camera access
   *
   * @param {string} ID Meeting ID
   */
  ignoreVideoAccessPrompt(ID) {
    const meeting = this.meetings[ID];

    if (meeting.localVideo.ignoreMediaAccessPrompt) {
      meeting.localVideo.ignoreMediaAccessPrompt();
    } else {
      // eslint-disable-next-line no-console
      console.error('Can not ignore video prompt in current state:', meeting.localVideo.permission);
    }
  }

  /**
   * Returns an observable that emits meeting data of the given ID.
   *
   * @param {string} ID ID of meeting to get
   * @returns {Observable.<Meeting>} Observable stream that emits meeting data of the given ID
   */
  getMeeting(ID) {
    if (!(ID in this.getMeetingObservables)) {
      const sdkMeeting = this.fetchMeeting(ID);
      const getMeeting$ = Observable.create((observer) => {
        if (this.meetings[ID]) {
          observer.next(this.meetings[ID]);
        } else {
          observer.error(new Error(`Could not find meeting with ID "${ID}"`));
        }

        observer.complete();
      });

      const meetingUpdateEvent$ = fromEvent(sdkMeeting, EVENT_MEETING_UPDATED);

      const meetingWithMediaReadyEvent$ = fromEvent(sdkMeeting, EVENT_MEDIA_READY).pipe(
        filter((event) => MEDIA_EVENT_TYPES.includes(event.type)),
        map((event) => this.attachMedia(ID, event)),
      );

      const meetingWithMediaStoppedEvent$ = fromEvent(sdkMeeting, EVENT_MEDIA_STOPPED).pipe(
        tap(() => this.removeMedia(ID)),
      );

      const meetingWithMediaShareEvent$ = fromEvent(sdkMeeting, EVENT_REMOTE_SHARE_START).pipe(
        tap(() => this.attachMedia(ID, {type: EVENT_REMOTE_SHARE_START})),
      );

      const meetingWithMediaStoppedShareEvent$ = fromEvent(sdkMeeting, EVENT_REMOTE_SHARE_STOP)
        .pipe(
          tap(() => this.attachMedia(ID, {type: EVENT_REMOTE_SHARE_STOP})),
        );

      const meetingWithLocalShareStoppedEvent$ = fromEvent(sdkMeeting, EVENT_LOCAL_SHARE_STOP);

      const meetingWithLocalUpdateEvent$ = fromEvent(sdkMeeting, EVENT_MEDIA_LOCAL_UPDATE);

      const meetingWithUpdateEvent$ = fromEvent(sdkMeeting, EVENT_MEETING_UPDATED);

      const meetingWithSwitchSpeakerEvent$ = fromEvent(sdkMeeting, EVENT_SPEAKER_SWITCH);

      const meetingWithSettingsToggleEvent$ = fromEvent(sdkMeeting, EVENT_SETTINGS_TOGGLE);

      const meetingWithSwitchCameraEvent$ = fromEvent(sdkMeeting, EVENT_CAMERA_SWITCH);

      const meetingWithSwitchMicrophoneEvent$ = fromEvent(sdkMeeting, EVENT_MICROPHONE_SWITCH);

      const meetingStateChange$ = fromEvent(sdkMeeting, EVENT_STATE_CHANGE).pipe(
        tap((event) => {
          const sdkState = event.payload.currentState;
          let state;

          if (sdkState === 'ACTIVE') {
            state = MeetingState.JOINED;
          } else if (sdkState === 'INACTIVE') {
            state = MeetingState.LEFT;
          } else {
            state = this.meetings[ID].state;
          }

          this.meetings[ID] = {...this.meetings[ID], state};
        }),
      );

      const meetingsWithEvents$ = merge(
        meetingUpdateEvent$,
        meetingWithMediaReadyEvent$,
        meetingWithMediaStoppedEvent$,
        meetingWithLocalUpdateEvent$,
        meetingWithLocalShareStoppedEvent$,
        meetingWithMediaShareEvent$,
        meetingWithMediaStoppedShareEvent$,
        meetingWithUpdateEvent$,
        meetingWithSettingsToggleEvent$,
        meetingStateChange$,
        meetingWithSwitchCameraEvent$,
        meetingWithSwitchMicrophoneEvent$,
        meetingWithSwitchSpeakerEvent$,
      ).pipe(map(() => this.meetings[ID])); // Return a meeting object from event

      const getMeetingWithEvents$ = concat(getMeeting$, meetingsWithEvents$);

      // Convert to a multicast observable
      this.getMeetingObservables[ID] = getMeetingWithEvents$.pipe(
        publishReplay(1),
        refCount(),
        takeWhile((meeting) => meeting.state && meeting.state !== MeetingState.LEFT, true),
      );
    }

    return this.getMeetingObservables[ID];
  }

  /**
   * A callback that returns an updated meeting
   *
   * @callback UpdateMeetingCallback
   * @param {Meeting} meeting  Original meeting object
   * @returns {Promise<Meeting>} Updated meeting object
   */

  /**
   * Updates a meeting and notifies listeners
   *
   * @private
   * @async
   * @param {string} ID  Id of the meeting to update.
   * @param {UpdateMeetingCallback} updater  Function to update the meeting
   */

  async updateMeeting(ID, updater) {
    const sdkMeeting = this.fetchMeeting(ID);
    const meeting = this.meetings[ID];

    if (!sdkMeeting || !meeting) {
      throw new Error(`Could not find meeting with ID "${ID}"`);
    }

    const updates = await updater(meeting);
    const updatedMeeting = {...meeting, ...updates};

    sdkMeeting.emit(EVENT_MEETING_UPDATED, updatedMeeting);
  }
}
