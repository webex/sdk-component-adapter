import mockDevices from './mockDevices';
import mockActivities from './mockActivities';

export const mockSDKRoom = {
  id: 'Y2lzY29zcGFyazovL3VzL1JPT00vYmMyMjY2YjAtZDZjMy0xMWViLWFlZjUtNmQ3NzkwOGJmY2Ji',
  type: 'group',
  title: 'mock room',
};

export const mockSDKPerson = {
  id: 'personIDCurrentUser',
  emails: ['email@cisco.com'],
  displayName: 'Webex Components',
  firstName: 'Webex',
  lastName: 'Components',
  avatar: 'avatar',
  orgId: 'orgID',
};

export const mockSDKActivity = {
  id: '123-456-789',
  target: {
    id: '123',
  },
  object: {
    objectType: 'comment',
    displayName: 'Webex Components',
  },
  actor: {
    id: '789',
  },
  verb: 'post',
  published: '2020-01-01T00:00:00.000Z',
};

export const createMockSDKMediaStreams = () => {
  const localAudio = new MediaStream([{kind: 'audio'}]);
  const localVideo = new MediaStream([{kind: 'video'}]);

  return {
    localAudio,
    localVideo,
    localAudioVideo: new MediaStream([...localAudio.getTracks(), ...localVideo.getTracks()]),
  };
};

/**
 * Creates a mock instance of the Webex SDK Meeting used in unit testing
 *
 * @returns {object} mockSDKMeeting Instance
 */
export const createMockSDKMeeting = () => ({
  id: 'meetingID',
  sipuri: 'my meeting',
  meetingInfo: {
    isWebexScheduled: true,
  },
  members: {
    membersCollection: {
      members: {
        person1: {
          name: 'Barbara German',
          isInMeeting: true,
          isUser: true,
          isAudioMuted: false,
          isContentSharing: false,
          isModerator: false,
          isGuest: false,
          isSelf: true,
          participant: {
            person: {
              ...mockSDKPerson,
              id: 'id',
            },
          },
        },
        person2: {
          name: 'Brenda Song',
          isInMeeting: true,
          isUser: true,
          isAudioMuted: true,
          isContentSharing: true,
          isModerator: true,
          isGuest: true,
          participant: {
            person: {
              ...mockSDKPerson,
              id: 'mutedPerson',
            },
          },
        },
        notJoinedPerson: {
          name: 'Giacomo Edwards',
          isInMeeting: false,
          isUser: true,
          isAudioMuted: false,
          isContentSharing: false,
          isModerator: false,
          isGuest: true,
          participant: {
            person: {
              ...mockSDKPerson,
              id: 'notJoinedPerson',
            },
          },
        },
        device: {
          isInMeeting: true,
          isUser: false,
          isAudioMuted: false,
          isContentSharing: false,
          isModerator: false,
          isGuest: false,
          participant: {
            person: {
              ...mockSDKPerson,
              id: 'device',
            },
          },
        },
      },
    },
    on: jest.fn(),
  },
  addMedia: jest.fn(() => Promise.resolve()),
  emit: jest.fn(() => Promise.resolve()),
  getDevices: jest.fn(() => Promise.resolve(mockDevices)),
  getMediaStreams: jest.fn((constraint) => {
    const mockSDKMediaStreams = createMockSDKMediaStreams();

    return Promise.resolve([
      constraint.sendAudio
        ? mockSDKMediaStreams.localAudio
        : mockSDKMediaStreams.localVideo,
    ]);
  }),
  leave: jest.fn(() => Promise.resolve()),
  muteAudio: jest.fn(() => Promise.resolve()),
  muteVideo: jest.fn(() => Promise.resolve()),
  register: jest.fn(() => Promise.resolve()),
  syncMeetings: jest.fn(() => Promise.resolve()),
  unregister: jest.fn(() => Promise.resolve()),
  join: jest.fn(() => Promise.resolve()),
  unmuteAudio: jest.fn(() => Promise.resolve()),
  unmuteVideo: jest.fn(() => Promise.resolve()),
  canUpdateMedia: jest.fn(() => true),
  updateShare: jest.fn(() => Promise.resolve()),
  changeVideoLayout: jest.fn(() => Promise.resolve()),
});

export const mockSDKMembership = {
  id: 'id',
  roomId: 'roomID',
  personId: 'personID',
  personOrgId: 'organizationID',
  personEmail: 'email@cisco.com',
  personDisplayName: 'Simon Damiano',
  isModerator: false,
  isMonitor: false,
  created: '',
};

export const mockSDKOrganization = {
  id: 'organizationID',
  displayName: 'Cisco Systems, Inc.',
};

const mockInternalConversationAPI = {
  listActivities: jest.fn(() => Promise.resolve(mockActivities)),
};

export const mockSDKCardActivity = {
  id: 'activityID',
  roomId: 'roomID',
  text: 'text',
  personId: 'personID',
  created: '2022-02-02T14:38:16+00:00',
  attachments: [
    {
      contentType: 'application/vnd.microsoft.card.adaptive',
      content: {
        $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
        type: 'AdaptiveCard',
        version: '1.2',
        body: [
          {
            type: 'TextBlock',
            text: 'Adaptive Cards',
            size: 'large',
          },
        ],
        actions: [
          {
            type: 'Action.OpenUrl',
            url: 'http://adaptivecards.io',
            title: 'Learn More',
          },
        ],
      },
    },
  ],
};

export const mockSDKAttachmentAction = {
  id: 'actionID',
  type: 'submit',
  messageId: 'activityID',
  roomId: 'roomID',
  personId: 'personID',
  inputs: {
    firstName: 'My first name',
    lastName: 'My last name',
  },
  created: '2022-02-03T14:26:16+00:00',
};

/**
 * Creates a mock instance of the Webex SDK used in unit testing
 *
 * @param api
 * @returns {object} mockSDK Instance
 */
export default function createMockSDK(api = {}) {
  const mockSDKMeeting = createMockSDKMeeting();

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
        get: jest.fn(() => Promise.resolve({status: 'active'})),
        subscribe: jest.fn(() => Promise.resolve({responses: [{status: {status: 'active'}}]})),
        unsubscribe: jest.fn(() => Promise.resolve()),
      },
      conversation: mockInternalConversationAPI,
    },
    people: {
      get: jest.fn(() => Promise.resolve(mockSDKPerson)),
    },
    meetings: {
      create: jest.fn(() => Promise.resolve(mockSDKMeeting)),
      getMeetingByType: jest.fn((_, ID) => (ID === 'meetingID' ? mockSDKMeeting : undefined)),
      members: {
        on: jest.fn(),
      },
    },
    memberships: {
      listen: jest.fn(() => Promise.resolve()),
      list: jest.fn(() => Promise.resolve({
        items: [
          mockSDKMembership,
          {
            ...mockSDKMembership,
            personOrgId: 'organizationID3',
            personId: 'personID3',
            personDisplayName: '',
          },
          {
            ...mockSDKMembership,
            personOrgId: 'organizationID1',
            personId: 'personIDCurrentUser',
            personDisplayName: 'Zlatan The Current User',
          },
          {
            ...mockSDKMembership,
            personOrgId: 'organizationID2',
            personId: 'personID2',
            personDisplayName: 'Maria Rossi',
          },
        ],
      })),
      stopListening: jest.fn(() => Promise.resolve()),
      on: jest.fn(),
      off: jest.fn(),
    },
    attachmentActions: {
      create: jest.fn(() => Promise.resolve(mockSDKAttachmentAction)),
    },
    messages: {
      create: jest.fn(() => Promise.resolve(mockSDKCardActivity)),
    },
    ...api,
  };
}
