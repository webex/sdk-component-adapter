import {constructHydraId} from '@webex/common';
import mockDevices from './mockDevices';
import mockActivities from './mockActivities';

export const created = '2022-02-15T21:38:25.806Z';

// This is actor.id === personID
export const actorID = '1234';
export const personID = constructHydraId('person', actorID);

// This is target.id === roomID
export const targetID = '5678';
export const roomID = constructHydraId('room', targetID);

// This is activity.id === ID
export const activityID = '91011';
export const ID = constructHydraId('message', activityID);

export const mockSDKRoom = {
  id: roomID,
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

export const mockSDKMetric = {
  fields: {
    testField: 123,
  },
  tags: {
    testTag: 'tag value',
  },
  metricName: 'testMetric',
  type: 'behavioral',
  eventPayload: {value: 'splunk business metric payload'},
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
  published: created,
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
  passwordStatus: 'REQUIRED',
  meetingInfo: {
    isWebexScheduled: true,
  },
  meetingFiniteStateMachine: {
    reset: jest.fn(),
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
  refreshCaptcha: jest.fn(),
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
  created,
};

export const mockSDKOrganization = {
  id: 'organizationID',
  displayName: 'Cisco Systems, Inc.',
};

const mockInternalConversationAPI = {
  listActivities: jest.fn(() => Promise.resolve(mockActivities)),
};

export const mockSDKCardActivity = {
  id: ID,
  roomId: roomID,
  text: 'text',
  personId: personID,
  created,
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
  created,
};

export const activityWithCard = {
  object: {
    cards: [
      '{"$schema":"http://adaptivecards.io/schemas/adaptive-card.json","type":"AdaptiveCard","version":"1.2","body":[{"type":"TextBlock","text":"Adaptive Cards","size":"large"}],"actions":[{"type":"Action.OpenUrl","url":"http://adaptivecards.io","title":"Learn More"}]}',
    ],
  },
};

export const sdkActivity = {
  id: activityID,
  objectType: 'activity',
  published: created,
  actor: {
    id: actorID,
  },
  object: {
    objectType: 'comment',
    content: 'text',
    displayName: 'text',
    cards: activityWithCard.object.cards,
  },
  target: {
    id: targetID,
    objectType: 'conversation',
  },
};

export const sdkConversation = {
  id: roomID,
  objectType: 'conversation',
  url: `https://conv-a.wbx2.com/conversation/api/v1/conversations/${roomID}`,
  participants: {
    items: [],
  },
  activities: {
    items: [],
  },
  deletedActivityIds: [],
  tags: [
    'OPEN',
  ],
  defaultActivityEncryptionKeyUrl: `kms://kms-cisco.wbx2.com/keys/${roomID}`,
  encryptionKeyUrl: `kms://kms-cisco.wbx2.com/keys/${roomID}`,
  kmsResourceObjectUrl: `kms://kms-cisco.wbx2.com/resources/${roomID}`,
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
      create: jest.fn(() => Promise.resolve(mockSDKRoom)),
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
      encryption: {
        encryptText: jest.fn(() => Promise.resolve('encrypted text')),
      },
      metrics: {
        submitClientMetrics: jest.fn(() => Promise.resolve(mockSDKMetric)),
      },
    },
    people: {
      get: jest.fn(() => Promise.resolve(mockSDKPerson)),
    },
    meetings: {
      create: jest.fn(() => Promise.resolve(mockSDKMeeting)),
      getMeetingByType: jest.fn((_, id) => (id === 'meetingID' ? mockSDKMeeting : undefined)),
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
      create: jest.fn(() => Promise.resolve(mockSDKMembership)),
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
