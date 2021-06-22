/* eslint-disable no-console */
import {DestinationType} from '@webex/component-adapter-interfaces';
import Webex from 'webex';

import WebexSDKAdapter from '../src/WebexSDKAdapter';
import {last, tap, first} from 'rxjs/operators';

let MEETING_ID = null;
let webexSDKAdapter;

function handleAudio() {
  webexSDKAdapter.meetingsAdapter.meetingControls['mute-audio'].display(MEETING_ID).subscribe((data) => {
    const muteAudio = document.getElementById('mute-audio');

    muteAudio.innerHTML = data.tooltip;
  });
}

function handleVideo() {
  webexSDKAdapter.meetingsAdapter.meetingControls['mute-video'].display(MEETING_ID).subscribe((data) => {
    const muteVideo = document.getElementById('mute-video');

    muteVideo.innerHTML = data.tooltip;
  });
}

function handleShare() {
  webexSDKAdapter.meetingsAdapter.meetingControls['share-screen'].display(MEETING_ID).subscribe((data) => {
    const startShare = document.getElementById('share-screen');

    startShare.innerHTML = data.tooltip;
  });
}

function handleRoster() {
  webexSDKAdapter.meetingsAdapter.meetingControls['member-roster'].display(MEETING_ID).subscribe((display) => {
    const memberRoster = document.getElementById('member-roster');

    memberRoster.innerText = display.tooltip;
  });
}

function setSelectOptions(select, options) {
  options.forEach((option, key)  => { select[key] = new Option(option.label, option.value); });
}

function handleCameraSelect() {
  const switchCameraSelect = document.getElementById('switch-camera');
  webexSDKAdapter.meetingsAdapter.meetingControls['switch-camera']
    .display(MEETING_ID).pipe(
      first(display => Array.isArray(display.options)))
    .subscribe((display) => {
      setSelectOptions(switchCameraSelect, display.options);
    });
}

function handleSettings() {
  webexSDKAdapter.meetingsAdapter.meetingControls['settings'].display(MEETING_ID).subscribe((display) => {
    const settings = document.getElementById('settings');

    settings.innerText = display.tooltip;
  });
}

function getMeeting() {
  webexSDKAdapter.meetingsAdapter.getMeeting(MEETING_ID).subscribe(
    (meeting) => {
      console.log('Received meeting update: ', meeting);

      document.getElementById('remote-audio').srcObject = meeting.remoteAudio;
      document.getElementById('remote-video').srcObject = meeting.remoteVideo;
      document.getElementById('local-audio').srcObject = meeting.localAudio;
      document.getElementById('local-video').srcObject = meeting.localVideo;
      document.getElementById('local-share').srcObject = meeting.localShare;
      document.getElementById('remote-share').srcObject = meeting.remoteShare;
      document.getElementById('meeting-title').innerHTML = meeting.title;
    },
    (error) => {
      console.error('Get Meeting error: ', error);
    },
    () => console.log(`Meeting "${MEETING_ID}" has ended.`)
  );
}

document.getElementById('connector').addEventListener('click', async (event) => {
  event.preventDefault();
  const status = document.getElementById('connection-status');
  const credentials = document.getElementById('credentials').value;

  try {
    if (event.target.id === 'connect') {
      const webex = new Webex({
        credentials,
      });

      webexSDKAdapter = new WebexSDKAdapter(webex);
      await webexSDKAdapter.connect();
      status.innerHTML = 'Connected ✅';
    } else if (event.target.id === 'disconnect') {
      await webexSDKAdapter.disconnect();
      status.innerHTML = 'Disconnected ❌';
    }
  } catch (error) {
    console.error('Unable to connect/disconnect:', error);
  }
});

document.getElementById('dialer').addEventListener('click', async (event) => {
  event.preventDefault();

  const destination = document.getElementById('destination').value;

  try {
    switch (event.target.id) {
      case 'create-meeting':
        webexSDKAdapter.meetingsAdapter.createMeeting(destination).pipe(
          tap(meeting => console.log('Creating meeting:', meeting)),
          last()
        ).subscribe((meeting) => {
          MEETING_ID = meeting.ID;
          getMeeting();
          handleAudio();
          handleVideo();
          handleShare();
          handleRoster();
          handleSettings();
          handleCameraSelect();
        });
        break;
      case 'join-meeting':
        await webexSDKAdapter.meetingsAdapter.meetingControls['join-meeting'].action(MEETING_ID);
        break;
      case 'leave-meeting':
        await webexSDKAdapter.meetingsAdapter.meetingControls['leave-meeting'].action(MEETING_ID);
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
        await webexSDKAdapter.meetingsAdapter.meetingControls['settings'].action(MEETING_ID);
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
