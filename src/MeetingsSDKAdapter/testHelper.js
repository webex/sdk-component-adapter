import createMockSDK from '../mockSdk';
import MeetingsSDKAdapter from '../MeetingsSDKAdapter';

export const meetingID = 'meetingID';

/**
 * Creates a new meeting SDK adapter instance based on a mock SDK.
 *
 * @returns {MeetingsSDKAdapter} A new instance of the meeting SDK adapter
 */
export function createTestMeetingsSDKAdapter() {
  const meeting = {
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
    settings: {
      visible: false,
      preview: {
        audio: {},
        video: {},
      },
    },
    title: 'my meeting',
    cameraID: 'cameraID',
    microphoneID: null,
    speakerID: 'speakerID',
  };
  const mockSDK = createMockSDK();
  const meetingsSDKAdapter = new MeetingsSDKAdapter(mockSDK);

  meetingsSDKAdapter.meetings[meetingID] = meeting;

  return meetingsSDKAdapter;
}
