import createMockSDK from '../mockSdk';
import MeetingsSDKAdapter from '../MeetingsSDKAdapter';

export const meetingID = 'meetingID';

/**
 * Shape of meeting with SIP
 */
export const mockMeeting = {
  ID: 'mockMeeting1',
  title: '5535@ucdemolab.com',
  localAudio: {
    stream: {},
    permission: 'ALLOWED',
  },
  localVideo: {
    stream: {},
    permission: 'ALLOWED',
  },
  localShare: null,
  remoteAudio: {},
  remoteVideo: null,
  remoteShare: null,
  state: 'JOINED',
};

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
    showSettings: false,
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
