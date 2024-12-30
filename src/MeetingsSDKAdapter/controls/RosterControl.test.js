import {first} from 'rxjs/operators';
import {meetingID, createTestMeetingsSDKAdapter} from '../testHelper';

describe('Roster Control', () => {
  let meetingsSDKAdapter;

  beforeEach(() => {
    meetingsSDKAdapter = createTestMeetingsSDKAdapter();
  });

  afterEach(() => {
    meetingsSDKAdapter = null;
  });

  describe('display()', () => {
    it('returns the display of a meeting control in a proper shape', () => {
      meetingsSDKAdapter.meetingControls['member-roster'].display(meetingID).pipe(first())
        .subscribe((dataDisplay) => {
          expect(dataDisplay).toMatchObject({
            ID: 'member-roster',
            type: 'TOGGLE',
            state: 'inactive',
            icon: 'participant-list',
            text: 'Show participants',
            tooltip: 'Show participants panel',
          });
        });
    });
  });

  describe('action()', () => {
    it('calls toggleRoster() SDK adapter method', async () => {
      meetingsSDKAdapter.toggleRoster = jest.fn();
      await meetingsSDKAdapter.meetingControls['member-roster'].action({meetingID});
      expect(meetingsSDKAdapter.toggleRoster).toHaveBeenCalledTimes(1);
      expect(meetingsSDKAdapter.toggleRoster).toHaveBeenCalledWith(meetingID);
    });
  });
});
