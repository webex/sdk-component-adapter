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
    it('returns the display data of a meeting control in a proper shape', () => {
      meetingsSDKAdapter.meetingControls.settings.display(meetingID).pipe(first())
        .subscribe((dataDisplay) => {
          expect(dataDisplay).toMatchObject({
            ID: 'settings',
            type: 'BUTTON',
            state: 'inactive',
            icon: 'settings',
            text: 'Settings',
            tooltip: 'Meeting settings',
          });
        });
    });
  });

  describe('action()', () => {
    it('calls toggleSettings() SDK adapter method', async () => {
      meetingsSDKAdapter.toggleSettings = jest.fn();
      await meetingsSDKAdapter.meetingControls.settings.action({meetingID});
      expect(meetingsSDKAdapter.toggleSettings).toHaveBeenCalledTimes(1);
      expect(meetingsSDKAdapter.toggleSettings).toHaveBeenCalledWith(meetingID);
    });
  });
});
