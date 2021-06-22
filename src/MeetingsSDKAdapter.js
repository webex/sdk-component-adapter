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
} from 'rxjs';
import {
  catchError,
  concatMap,
  flatMap,
  filter,
  map,
  publishReplay,
  refCount,
  takeWhile,
  tap,
} from 'rxjs/operators';

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
const EVENT_MEDIA_LOCAL_UPDATE = 'adapter:media:local:update';
const EVENT_ROSTER_TOGGLE = 'adapter:roster:toggle';
const EVENT_SETTINGS_TOGGLE = 'adapter:settings:toggle';
const EVENT_CAMERA_SWITCH = 'adapter:camera:switch';

// Meeting controls
const JOIN_CONTROL = 'join-meeting';
const EXIT_CONTROL = 'leave-meeting';
const AUDIO_CONTROL = 'mute-audio';
const VIDEO_CONTROL = 'mute-video';
const SHARE_CONTROL = 'share-screen';
const ROSTER_CONTROL = 'member-roster';
const SETTINGS_CONTROL = 'settings';
const SWITCH_CAMERA_CONTROL = 'switch-camera';

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

    this.meetingControls[ROSTER_CONTROL] = {
      ID: ROSTER_CONTROL,
      action: this.handleRoster.bind(this),
      display: this.rosterControl.bind(this),
    };

    this.meetingControls[SETTINGS_CONTROL] = {
      ID: SETTINGS_CONTROL,
      action: this.handleSettings.bind(this),
      display: this.settingsControl.bind(this),
    };

    this.meetingControls[SWITCH_CAMERA_CONTROL] = {
      ID: SWITCH_CAMERA_CONTROL,
      action: this.switchCamera.bind(this),
      display: this.switchCameraControl.bind(this),
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
   * Returns a promise to the local device media streams.
   *
   * @private
   * @param {string} ID ID to retrieve the SDK meeting object to add the local media to
   * @returns {Promise.<MediaStream>} Promise to requested media stream
   */
  async getLocalMedia(ID) {
    const localMedia = {localAudio: null, localVideo: null};

    if (mediaSettings.sendAudio) {
      localMedia.localAudio = await this.getStream(ID, {sendAudio: true});
    }

    if (mediaSettings.sendVideo) {
      localMedia.localVideo = await this.getStream(ID, {sendVideo: true});
    }

    return localMedia;
  }

  /**
   * Returns a promise to a local media stream based on the given mediaDirection, audioVideo options.
   *
   * @see {@link MediaStream|https://developer.mozilla.org/en-US/docs/Web/API/MediaStream}.
   *
   * @private
   * @param {string} ID ID of the meeting for which to fetch streams
   * @param {object} mediaDirection A configurable options object for joining a meetings
   * @param {object} audioVideo audio/video object to set audioinput and videoinput devices
   * @returns {Promise.<MediaStream>} Promise to requested media stream
   */
  async getStream(ID, mediaDirection, audioVideo) {
    let localStream = null;

    try {
      const sdkMeeting = this.fetchMeeting(ID);

      [localStream] = await sdkMeeting.getMediaStreams(mediaDirection, audioVideo);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Unable to retrieve local media stream for meeting', ID, 'with mediaDirection', mediaDirection, 'and audioVideo', audioVideo, 'reason:', error);
    }

    return localStream;
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
          localAudio: meeting.disabledLocalAudio ? null : new MediaStream(stream.getAudioTracks()),
          localVideo: meeting.disabledLocalVideo ? null : new MediaStream(stream.getVideoTracks()),
        };
        break;
      case MEDIA_TYPE_REMOTE_AUDIO:
        this.meetings[ID] = {...meeting, remoteAudio: stream};
        break;
      case MEDIA_TYPE_REMOTE_VIDEO:
        this.meetings[ID] = {...meeting, remoteVideo: stream};
        break;
      case MEDIA_TYPE_LOCAL_SHARE:
        this.meetings[ID] = {...meeting, localShare: stream};
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
      this.stopStream(this.meetings[ID].localAudio);
      this.stopStream(this.meetings[ID].localVideo);
      this.stopStream(this.meetings[ID].localShare);
    }

    this.meetings[ID] = {
      ...this.meetings[ID],
      localAudio: null,
      localVideo: null,
      localShare: null,
      remoteAudio: null,
      remoteVideo: null,
      remoteShare: null,
      cameraID: null,
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
        localVideo: null,
        localAudio: null,
        localShare: null,
        remoteAudio: null,
        remoteVideo: null,
        remoteShare: null,
        showRoster: null,
        showSettings: false,
        state: MeetingState.NOT_JOINED,
        cameraID: null,
      })),
      tap((meeting) => {
        this.meetings[meeting.ID] = meeting;
      }),
    );

    const meeting$ = newMeeting$.pipe(
      concatMap((meeting) => from(this.getLocalMedia(meeting.ID)).pipe(
        map((localMedia) => ({
          ...meeting,
          ...localMedia,
        })),
      )),
      tap((meeting) => {
        this.meetings[meeting.ID] = meeting;
      }),
    );

    return concat(newMeeting$, meeting$).pipe(
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

      const localAudio = this.meetings[ID].localAudio || this.meetings[ID].disabledLocalAudio;
      const localVideo = this.meetings[ID].localVideo || this.meetings[ID].disabledLocalVideo;

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
      if (this.meetings[ID].localAudio === null) {
        await sdkMeeting.muteAudio();
      }

      if (this.meetings[ID].localVideo === null) {
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

      await sdkMeeting.leave();

      // Due to SDK limitations, We need to emit a media stopped event for remote media types
      sdkMeeting.emit(EVENT_MEDIA_STOPPED, {type: MEDIA_TYPE_REMOTE_AUDIO});
      sdkMeeting.emit(EVENT_MEDIA_STOPPED, {type: MEDIA_TYPE_REMOTE_VIDEO});
      sdkMeeting.emit(EVENT_MEDIA_STOPPED, {type: MEDIA_TYPE_LOCAL_SHARE});
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
      const noAudio = !this.meetings[ID].disabledLocalAudio && !this.meetings[ID].localAudio;
      const audioEnabled = !!this.meetings[ID].localAudio;
      let state;

      if (noAudio) {
        state = MeetingControlState.DISABLED;
      } else if (audioEnabled) {
        // Mute the audio only if there is an active meeting
        if (isInSession) {
          await sdkMeeting.muteAudio();
        }

        // Store the current local audio stream to avoid an extra request call
        this.meetings[ID].disabledLocalAudio = this.meetings[ID].localAudio;
        this.meetings[ID].localAudio = null;
        state = MeetingControlState.INACTIVE;
      } else {
        // Unmute the audio only if there is an active meeting
        if (isInSession) {
          await sdkMeeting.unmuteAudio();
        }

        // Retrieve the stored local audio stream
        this.meetings[ID].localAudio = this.meetings[ID].disabledLocalAudio;
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
    const sdkMeeting = this.fetchMeeting(ID);
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
    const states = {
      [MeetingControlState.ACTIVE]: unmuted,
      [MeetingControlState.INACTIVE]: muted,
      [MeetingControlState.DISABLED]: disabled,
    };

    const initialState$ = Observable.create((observer) => {
      if (sdkMeeting) {
        const meeting = this.meetings[ID] || {};
        const noAudio = !meeting.disabledLocalAudio && !meeting.localAudio;

        observer.next(noAudio ? disabled : unmuted);
      } else {
        observer.error(new Error(`Could not find meeting with ID "${ID}" to add audio control`));
      }

      observer.complete();
    });

    const localMediaUpdateEvent$ = fromEvent(sdkMeeting, EVENT_MEDIA_LOCAL_UPDATE).pipe(
      filter((event) => event.control === AUDIO_CONTROL),
      map(({state}) => states[state]),
    );

    return concat(initialState$, localMediaUpdateEvent$);
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
      const noVideo = !this.meetings[ID].disabledLocalVideo && !this.meetings[ID].localVideo;
      const videoEnabled = !!this.meetings[ID].localVideo;
      let state;

      if (noVideo) {
        state = MeetingControlState.DISABLED;
      } else if (videoEnabled) {
        // Mute the video only if there is an active meeting
        if (isInSession) {
          await sdkMeeting.muteVideo();
        }

        // Store the current local video stream to avoid an extra request call
        this.meetings[ID].disabledLocalVideo = this.meetings[ID].localVideo;
        this.meetings[ID].localVideo = null;
        state = MeetingControlState.INACTIVE;
      } else {
        // Unmute the video only if there is an active meeting
        if (isInSession) {
          await sdkMeeting.unmuteVideo();
        }

        // Retrieve the stored local video stream
        this.meetings[ID].localVideo = this.meetings[ID].disabledLocalVideo;
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
    const sdkMeeting = this.fetchMeeting(ID);
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
    const states = {
      [MeetingControlState.ACTIVE]: unmuted,
      [MeetingControlState.INACTIVE]: muted,
      [MeetingControlState.DISABLED]: disabled,
    };

    const initialState$ = Observable.create((observer) => {
      if (sdkMeeting) {
        const meeting = this.meetings[ID] || {};
        const noVideo = !meeting.disabledLocalVideo && !meeting.localVideo;

        observer.next(noVideo ? disabled : unmuted);
      } else {
        observer.error(new Error(`Could not find meeting with ID "${ID}" to add video control`));
      }

      observer.complete();
    });

    const localMediaUpdateEvent$ = fromEvent(sdkMeeting, EVENT_MEDIA_LOCAL_UPDATE).pipe(
      filter((event) => event.control === VIDEO_CONTROL),
      map(({state}) => states[state]),
    );

    return concat(initialState$, localMediaUpdateEvent$);
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
      // Disable the button while the SDK is enabling sharing
      sdkMeeting.emit(EVENT_MEDIA_LOCAL_UPDATE, {
        control: SHARE_CONTROL,
        state: MeetingControlState.DISABLED,
      });

      const [, localShare] = await sdkMeeting.getMediaStreams({sendShare: true});

      this.meetings[ID].localShare = localShare;

      await sdkMeeting.updateShare({stream: localShare, sendShare: true, receiveShare: true});
    };

    const disableSharingStream = async () => {
      // Disable the control while the SDK is stopping sharing, which could take 30 seconds or more
      sdkMeeting.emit(EVENT_MEDIA_LOCAL_UPDATE, {
        control: SHARE_CONTROL,
        state: MeetingControlState.DISABLED,
      });

      await sdkMeeting.updateShare({
        sendShare: false,
        receiveShare: true,
      });

      // The rest of the cleanup is done in the handling of the EVENT_LOCAL_SHARE_STOP event emitted by sdkMeeting.updateShare
    };

    const resetSharingStream = (error) => {
      if (this.meetings[ID] && this.meetings[ID].localShare) {
        // eslint-disable-next-line no-console
        console.warn(`Unable to update local share stream for meeting "${ID}"`, error);
        this.stopStream(this.meetings[ID].localShare);
        this.meetings[ID].localShare = null;
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
      if (this.meetings[ID].localShare) {
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
      tap(() => console.info('EVENT_LOCAL_SHARE_STOP was triggered', this)),
      map(() => inactiveShare),
    );

    const meetingWithMediaStartedSharingLocalEvent$ = fromEvent(
      sdkMeeting,
      EVENT_LOCAL_SHARE_START,
    ).pipe(
      // eslint-disable-next-line no-console
      tap(() => console.info('EVENT_LOCAL_SHARE_START was triggered', this)),
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
  handleRoster(ID) {
    const sdkMeeting = this.fetchMeeting(ID);
    const showRoster = !this.meetings[ID].showRoster;

    this.meetings[ID].showRoster = showRoster;

    sdkMeeting.emit(EVENT_ROSTER_TOGGLE, {
      state: showRoster
        ? MeetingControlState.ACTIVE
        : MeetingControlState.INACTIVE,
    });
  }

  /**
   * Returns an observable that emits the display data of a roster control.
   *
   * @private
   * @param {string} ID ID of the meeting to toggle roster
   * @returns {Observable.<MeetingControlDisplay>} Observable stream that emits display data of the roster control
   */
  rosterControl(ID) {
    const sdkMeeting = this.fetchMeeting(ID);
    const active = {
      ID: ROSTER_CONTROL,
      icon: 'participant-list_28',
      tooltip: 'Hide participants panel',
      state: MeetingControlState.ACTIVE,
      text: 'Participants',
    };
    const inactive = {
      ID: ROSTER_CONTROL,
      icon: 'participant-list_28',
      tooltip: 'Show participants panel',
      state: MeetingControlState.INACTIVE,
      text: 'Participants',
    };

    let state$;

    if (sdkMeeting) {
      const initialControl = (this.meetings[ID] && this.meetings[ID].showRoster)
        ? active
        : inactive;

      state$ = new BehaviorSubject(initialControl);

      const rosterEvent$ = fromEvent(sdkMeeting, EVENT_ROSTER_TOGGLE)
        .pipe(map(({state}) => (state === MeetingControlState.ACTIVE ? active : inactive)));

      rosterEvent$.subscribe((value) => state$.next(value));
    } else {
      state$ = throwError(new Error(`Could not find meeting with ID "${ID}" to add roster control`));
    }

    return state$;
  }

  /**
   * Toggles the showSettings flag of the given meeting ID.
   * A settings toggle event is dispatched.
   *
   * @private
   * @param {string} ID  Meeting ID
   */
  handleSettings(ID) {
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

    this.meetings[ID].localVideo = await this.getStream(
      ID,
      {sendVideo: true},
      {video: {deviceId: cameraID}},
    );
    this.meetings[ID].cameraID = cameraID;
    sdkMeeting.emit(EVENT_CAMERA_SWITCH, {cameraID});
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
          options: null,
          selected: null,
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

      const meetingWithLocalShareStoppedEvent$ = fromEvent(sdkMeeting, EVENT_LOCAL_SHARE_STOP)
        .pipe(
          tap(() => {
            this.meetings[ID].localShare = null;
            this.stopStream(this.meetings[ID].localShare);
          }),
        );

      const meetingWithLocalUpdateEvent$ = fromEvent(sdkMeeting, EVENT_MEDIA_LOCAL_UPDATE);

      const meetingWithRosterToggleEvent$ = fromEvent(sdkMeeting, EVENT_ROSTER_TOGGLE);

      const meetingWithSettingsToggleEvent$ = fromEvent(sdkMeeting, EVENT_SETTINGS_TOGGLE);

      const meetingWithSwitchCameraEvent$ = fromEvent(sdkMeeting, EVENT_CAMERA_SWITCH);

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
        meetingWithMediaReadyEvent$,
        meetingWithMediaStoppedEvent$,
        meetingWithLocalUpdateEvent$,
        meetingWithLocalShareStoppedEvent$,
        meetingWithMediaShareEvent$,
        meetingWithMediaStoppedShareEvent$,
        meetingWithRosterToggleEvent$,
        meetingWithSettingsToggleEvent$,
        meetingStateChange$,
        meetingWithSwitchCameraEvent$,
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
}
