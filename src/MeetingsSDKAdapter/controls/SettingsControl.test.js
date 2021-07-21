import {first} from 'rxjs/operators';
import MeetingsSDKAdapter from '../../MeetingsSDKAdapter';
import createMockSDK from '../../mockSdk';

describe('Settings Control', () => {
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
      showSettings: false,
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
    test('returns the display data of a meeting control in a proper shape', () => {
      meetingsSDKAdapter.meetingControls.settings.display(meetingID).pipe(first())
        .subscribe((dataDisplay) => {
          expect(dataDisplay).toMatchObject({
            ID: 'settings',
            icon: 'settings_32',
            tooltip: 'Show settings panel',
            state: 'inactive',
            text: 'Settings',
          });
        });
    });
  });

  describe('action()', () => {
    test('calls toggleSettings() SDK adapter method', async () => {
      meetingsSDKAdapter.toggleSettings = jest.fn();
      await meetingsSDKAdapter.meetingControls.settings.action(meetingID);
      expect(meetingsSDKAdapter.toggleSettings).toHaveBeenCalledTimes(1);
      expect(meetingsSDKAdapter.toggleSettings).toHaveBeenCalledWith(meetingID);
    });
  });
});
