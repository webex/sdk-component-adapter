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
  ID: 'id',
  title: 'meeting sdk ',
  startTime: '1:00',
  endTime: '2:00',
  localVideo: 'localVideo',
  localAudio: 'localAudio',
  localShare: 'localShare',
  remoteVideo: 'remoteVideo',
  remoteAudio: 'remoteAudio',
  remoteShare: 'remoteShare',
};

/**
 * Creates a mock instance of the Webex SDK used in unit testing
 *
 * @export
 * @returns {Object} mockSDK Instance
 */
export default function createMockSDK() {
  return {
    meetings: {
      syncMeeting: jest.fn(),
      register: jest.fn(),
      registered: true,
      off: jest.fn(),
      on: jest.fn(),
      getMeetingByType: jest.fn(() => Promise.resolve(mockSDKMeeting)),
    },
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
  };
}
