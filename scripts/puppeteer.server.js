import webexSDKAdapter from './start';

let MEETING_ID = null;

function handleAudio() {
  webexSDKAdapter.meetingsAdapter.meetingControls.audio.display(MEETING_ID).subscribe((data) => {
    const muteAudio = document.getElementById('mute-audio');

    muteAudio.innerHTML = `${data.tooltip} audio`;
  });
}

function handleVideo() {
  webexSDKAdapter.meetingsAdapter.meetingControls.video.display(MEETING_ID).subscribe((data) => {
    const muteVideo = document.getElementById('mute-video');

    muteVideo.innerHTML = data.tooltip;
  });
}

function getMeeting() {
  webexSDKAdapter.meetingsAdapter.getMeeting(MEETING_ID).subscribe((meeting) => {
    document.getElementById('remote-audio').srcObject = meeting.remoteAudio;
    document.getElementById('remote-video').srcObject = meeting.remoteVideo;
    document.getElementById('local-audio').srcObject = meeting.localAudio;
    document.getElementById('local-video').srcObject = meeting.localVideo;
    document.getElementById('meeting-title').innerHTML = meeting.title;
  });
}

document.getElementById('connector').addEventListener('click', async (event) => {
  event.preventDefault();
  const status = document.getElementById('connection-status');

  try {
    if (event.target.id === 'connect') {
      await webexSDKAdapter.connect();
      status.innerHTML = 'Connected ✅';
    } else {
      await webexSDKAdapter.disconnect();
      status.innerHTML = 'Disconnected ❌';
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Unable to connect/disconnect:', error);
  }
});

document.getElementById('dialer').addEventListener('click', async (event) => {
  event.preventDefault();

  const destination = document.getElementById('destination').value;

  try {
    switch (event.target.id) {
      case 'create-meeting':
        webexSDKAdapter.meetingsAdapter.createMeeting(destination).subscribe(({ID}) => {
          MEETING_ID = ID;
          getMeeting();
          handleAudio();
          handleVideo();
        });
        break;
      case 'add-local-media':
        webexSDKAdapter.meetingsAdapter.addLocalMedia(MEETING_ID);
        break;
      case 'join-meeting':
        await webexSDKAdapter.meetingsAdapter.meetingControls['join-meeting'].action(MEETING_ID);
        break;
      case 'leave-meeting':
        await webexSDKAdapter.meetingsAdapter.meetingControls['leave-meeting'].action(MEETING_ID);
        break;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Unable to perform any dialing actions:', error);
  }
});

document.getElementById('actions').addEventListener('click', async (event) => {
  event.preventDefault();

  try {
    switch (event.target.id) {
      case 'mute-audio':
        await webexSDKAdapter.meetingsAdapter.meetingControls.audio.action(MEETING_ID);
        break;
      case 'mute-video':
        await webexSDKAdapter.meetingsAdapter.handleLocalVideo(MEETING_ID);
        break;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Unable to perform an action:', error);
  }
});
