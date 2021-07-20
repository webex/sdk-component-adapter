import {first} from 'rxjs/operators';
import MeetingsSDKAdapter from '../../MeetingsSDKAdapter';
import createMockSDK from '../../mockSdk';

describe('Roster Control', () => {
  let meeting;
  let meetingID;
  let meetingsSDKAdapter;
  let mockSDK;

  beforeEach(() => {
    mockSDK = createMockSDK();
    meetingID = 'meetingID';
    meetingsSDKAdapter = new MeetingsSDKAdapter(mockSDK);
    meeting = {
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
      title: 'my meeting',
      cameraID: null,
      microphoneID: null,
      speakerID: null,
    };
    meetingsSDKAdapter.meetings[meetingID] = meeting;
  });

  afterEach(() => {
    meeting = null;
    mockSDK = null;
    meetingsSDKAdapter = null;
    meetingID = null;
  });

  describe('display()', () => {
    test('returns the display of a meeting control in a proper shape', () => {
      meetingsSDKAdapter.meetingControls['member-roster'].display(meetingID).pipe(first())
        .subscribe((dataDisplay) => {
          expect(dataDisplay).toMatchObject({
            ID: 'member-roster',
            icon: 'participant-list_28',
            tooltip: 'Show participants panel',
            state: 'inactive',
            text: 'Participants',
          });
        });
    });
  });

  describe('action()', () => {
    test('calls toggleRoster() SDK adapter method', async () => {
      meetingsSDKAdapter.toggleRoster = jest.fn();
      await meetingsSDKAdapter.meetingControls['member-roster'].action(meetingID);
      expect(meetingsSDKAdapter.toggleRoster).toHaveBeenCalledTimes(1);
      expect(meetingsSDKAdapter.toggleRoster).toHaveBeenCalledWith(meetingID);
    });
  });
});
