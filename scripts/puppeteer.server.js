/* eslint-disable no-console, no-param-reassign, jsdoc/require-jsdoc */
import {DestinationType} from '@webex/component-adapter-interfaces';
import Webex from 'webex';

import {tap} from 'rxjs/operators';
import WebexSDKAdapter from '../src/WebexSDKAdapter';

let MEETING_ID = null;
let webexSDKAdapter;

function setupControlButton(name) {
  webexSDKAdapter.meetingsAdapter.meetingControls[name].display(MEETING_ID).subscribe((data) => {
    const button = document.getElementById(name);

    button.innerHTML = data.text;
    button.title = data.tooltip;
    button.disabled = data.state === 'disabled';
  });
}

function setSelectOptions(select, options, noOptionsMessage) {
  while (select.options.length) {
    select.remove(0);
  }
  if (options === null) {
    select.disabled = true;
    select.add(new Option('loading...'));
  } else if (options && !options.length && noOptionsMessage) {
    select.disabled = true;
    select.add(new Option(noOptionsMessage));
  } else {
    select.disabled = false;
    options.forEach((option) => {
      select.add(new Option(option.label, option.value));
    });
  }
}

function handleCameraSelect() {
  const switchCameraSelect = document.getElementById('switch-camera');

  webexSDKAdapter.meetingsAdapter.meetingControls['switch-camera']
    .display(MEETING_ID).subscribe((display) => {
      setSelectOptions(switchCameraSelect, display.options, display.noOptionsMessage);
    });
}

function handleLayoutSelect() {
  const switchLayoutSelect = document.getElementById('switch-layout');
  const options = ['', ...webexSDKAdapter.meetingsAdapter.getLayoutTypes()].map((type) => ({
    label: type,
    value: type,
  }));

  setSelectOptions(switchLayoutSelect, options);
}

function handleMicrophoneSelect() {
  const switchMicrophoneSelect = document.getElementById('switch-microphone');

  webexSDKAdapter.meetingsAdapter.meetingControls['switch-microphone']
    .display(MEETING_ID).subscribe((display) => {
      setSelectOptions(switchMicrophoneSelect, display.options, display.noOptionsMessage);
    });
}

function handleSpeakerSelect() {
  const switchSpeakerSelect = document.getElementById('switch-speaker');

  webexSDKAdapter.meetingsAdapter.meetingControls['switch-speaker']
    .display(MEETING_ID).subscribe((display) => {
      setSelectOptions(switchSpeakerSelect, display.options, display.noOptionsMessage);
    });
}

function setMediaStream(elemId, mediaStream) {
  const elem = document.getElementById(elemId);

  if (elem.srcObject !== mediaStream) {
    elem.srcObject = mediaStream;
  }
}

function getMeeting() {
  webexSDKAdapter.meetingsAdapter.getMeeting(MEETING_ID).subscribe(
    (meeting) => {
      console.log('Received meeting update: ', JSON.stringify(meeting, null, 4));

      document.getElementById('meeting-title').innerText = meeting.title;
      document.getElementById('meeting-state').value = meeting.state;

      document.getElementById('proceed-without-camera').disabled = !meeting.localVideo.ignoreMediaAccessPrompt;
      document.getElementById('proceed-without-microphone').disabled = !meeting.localAudio.ignoreMediaAccessPrompt;

      document.getElementById('video-perm').innerText = `(${meeting.localVideo.permission})`;
      document.getElementById('audio-perm').innerText = `(${meeting.localAudio.permission})`;

      setMediaStream('remote-audio', meeting.remoteAudio);
      setMediaStream('remote-video', meeting.remoteVideo);
      setMediaStream('remote-share', meeting.remoteShare);

      setMediaStream('local-audio', meeting.settings.preview.audio || meeting.localAudio.stream);
      setMediaStream('local-video', meeting.settings.preview.video || meeting.localVideo.stream);
      setMediaStream('local-share', meeting.localShare.stream);
    },
    (error) => {
      console.error('getMeeting error:', error);
    },
    () => console.log(`Meeting "${MEETING_ID}" has ended.`),
  );
}

document.getElementById('credentials').value = localStorage.getItem('access-token') || '';
document.getElementById('destination').value = localStorage.getItem('meeting-destination') || '';

document.getElementById('connector').addEventListener('click', async (event) => {
  event.preventDefault();
  const status = document.getElementById('connection-status');
  const credentials = document.getElementById('credentials').value;

  try {
    if (event.target.id === 'connect') {
      status.innerText = 'Connecting... 🕑';
      localStorage.setItem('access-token', credentials);

      const webex = new Webex({
        credentials,
      });

      webexSDKAdapter = new WebexSDKAdapter(webex);
      await webexSDKAdapter.connect();
      status.innerText = 'Connected ✅';
    } else if (event.target.id === 'disconnect') {
      await webexSDKAdapter.disconnect();
      status.innerText = 'Disconnected ❌';
    }
  } catch (error) {
    console.error('Unable to connect/disconnect:', error);
    status.innerText = error;
  }
});

document.getElementById('dialer').addEventListener('click', async (event) => {
  event.preventDefault();

  const destination = document.getElementById('destination').value;
  const password = document.getElementById('password').value || undefined;
  const hostKey = document.getElementById('host-key').value || undefined;

  try {
    switch (event.target.id) {
      case 'create-meeting':
        localStorage.setItem('meeting-destination', destination);
        MEETING_ID = null;
        webexSDKAdapter.meetingsAdapter.createMeeting(destination).pipe(
          tap((meeting) => console.log('Creating meeting:', meeting)),
        ).subscribe((meeting) => {
          if (!MEETING_ID) {
            MEETING_ID = meeting.ID;
            getMeeting();
            ['mute-audio', 'mute-video', 'share-screen', 'member-roster', 'settings'].forEach(setupControlButton);
            handleCameraSelect();
            handleMicrophoneSelect();
            handleSpeakerSelect();
            handleLayoutSelect();
          }
        });
        break;
      case 'join-meeting':
        await webexSDKAdapter.meetingsAdapter.joinMeeting(MEETING_ID, {password, hostKey});
        break;
      case 'leave-meeting':
        await webexSDKAdapter.meetingsAdapter.meetingControls['leave-meeting'].action(MEETING_ID);
        break;
      default:
        break;
    }
  } catch (error) {
    console.error('Unable to perform any dialing actions:', error);
  }
});

document.getElementById('actions').addEventListener('click', async (event) => {
  event.preventDefault();

  try {
    switch (event.target.id) {
      case 'mute-audio':
        await webexSDKAdapter.meetingsAdapter.meetingControls['mute-audio'].action(MEETING_ID);
        break;
      case 'mute-video':
        await webexSDKAdapter.meetingsAdapter.meetingControls['mute-video'].action(MEETING_ID);
        break;
      case 'share-screen':
        await webexSDKAdapter.meetingsAdapter.meetingControls['share-screen'].action(MEETING_ID);
        break;
      case 'member-roster':
        await webexSDKAdapter.meetingsAdapter.meetingControls['member-roster'].action(MEETING_ID);
        break;
      case 'settings':
        await webexSDKAdapter.meetingsAdapter.meetingControls.settings.action(MEETING_ID);
        break;
      case 'proceed-without-camera':
        await webexSDKAdapter.meetingsAdapter.ignoreVideoAccessPrompt(MEETING_ID);
        break;
      case 'proceed-without-microphone':
        await webexSDKAdapter.meetingsAdapter.ignoreAudioAccessPrompt(MEETING_ID);
        break;
      default:
        break;
    }
  } catch (error) {
    console.error('Unable to perform an action:', error);
  }
});

document.getElementById('switch-camera').addEventListener('change', async () => {
  try {
    const switchCameraSelect = document.getElementById('switch-camera');
    const cameraID = switchCameraSelect.value;

    await webexSDKAdapter.meetingsAdapter.meetingControls['switch-camera'].action(MEETING_ID, cameraID);
  } catch (error) {
    console.error('Unable to switch camera:', error);
  }
});

document.getElementById('switch-microphone').addEventListener('change', async () => {
  try {
    const switchMicrophoneSelect = document.getElementById('switch-microphone');
    const microphoneID = switchMicrophoneSelect.value;

    await webexSDKAdapter.meetingsAdapter.meetingControls['switch-microphone'].action(MEETING_ID, microphoneID);
  } catch (error) {
    console.error('Unable to switch microphone:', error);
  }
});

document.getElementById('switch-speaker').addEventListener('change', async () => {
  try {
    const switchSpeakerSelect = document.getElementById('switch-speaker');
    const speakerID = switchSpeakerSelect.value;
    const audioNode = document.getElementById('remote-audio');

    await webexSDKAdapter.meetingsAdapter.meetingControls['switch-speaker'].action(MEETING_ID, speakerID);
    if (audioNode.setSinkId) {
      audioNode.setSinkId(speakerID);
    }
  } catch (error) {
    console.log('Unable to switch speaker:', error);
  }
});

document.getElementById('switch-layout').addEventListener('change', async () => {
  try {
    const switchLayoutSelect = document.getElementById('switch-layout');
    const layoutType = switchLayoutSelect.value;

    await webexSDKAdapter.meetingsAdapter.changeLayout(MEETING_ID, layoutType);
  } catch (error) {
    console.error('Unable to switch layout:', error);
  }
});

document.getElementById('members').addEventListener('click', (event) => {
  event.preventDefault();

  if (event.target.id === 'get-members') {
    webexSDKAdapter.membershipsAdapter
      .getMembersFromDestination(MEETING_ID, DestinationType.MEETING)
      .subscribe((members) => {
        document.getElementById('members-list').value = JSON.stringify(members, '', 2);
      });
  }
});
