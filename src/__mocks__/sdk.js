export const mockSDKRoom = {
  id: 'abc',
  type: 'group',
  title: 'mock room',
};

export const mockSDKPerson = {
  id: 'id',
  emails: ['email@cisco.com'],
  displayName: 'Webex Components',
  firstName: 'Webex',
  lastName: 'Components',
  avatar: 'avatar',
  orgId: 'orgID',
};

export const mockSDKMeeting = {
  id: 'meetingID',
  sipuri: 'my meeting',
  addMedia: jest.fn(() => Promise.resolve()),
  emit: jest.fn(),
  getMediaStreams: jest.fn(() => Promise.resolve(['localStream', 'localShare'])),
  muteAudio: jest.fn(() => Promise.resolve()),
  muteVideo: jest.fn(() => Promise.resolve()),
  register: jest.fn(() => Promise.resolve()),
  syncMeetings: jest.fn(() => Promise.resolve()),
  unregister: jest.fn(() => Promise.resolve()),
  unmuteAudio: jest.fn(() => Promise.resolve()),
  unmuteVideo: jest.fn(() => Promise.resolve()),
  join: jest.fn(() => Promise.resolve()),
};

/**
 * Creates a mock instance of the Webex SDK used in unit testing
 *
 * @export
 * @returns {Object} mockSDK Instance
 */
export default function createMockSDK() {
  return {
    rooms: {
      get: jest.fn(() => Promise.resolve(mockSDKRoom)),
      listen: jest.fn(() => Promise.resolve()),
      off: jest.fn(),
      on: jest.fn(),
      stopListening: jest.fn(() => Promise.resolve()),
      trigger: jest.fn(),
    },
    internal: {
      mercury: {
        on: jest.fn(),
        off: jest.fn(),
      },
      presence: {
        get: jest.fn(),
        subscribe: jest.fn(() => Promise.resolve({responses: [{status: {status: 'active'}}]})),
        unsubscribe: jest.fn(() => Promise.resolve()),
      },
    },
    people: {
      get: jest.fn(() => Promise.resolve(mockSDKPerson)),
    },
    meetings: {
      create: jest.fn(() => Promise.resolve(mockSDKMeeting)),
      getMeetingByType: jest.fn((_, ID) => (ID === 'meetingID' ? mockSDKMeeting : undefined)),
    },
  };
}
