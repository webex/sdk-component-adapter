import {first} from 'rxjs/operators';
import {meetingID, createTestMeetingsSDKAdapter} from '../testHelper';

describe('Settings Control', () => {
  let meetingsSDKAdapter;

  beforeEach(() => {
    meetingsSDKAdapter = createTestMeetingsSDKAdapter();
  });

  afterEach(() => {
    meetingsSDKAdapter = null;
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
