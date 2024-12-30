import {first} from 'rxjs/operators';
import {meetingID, createTestMeetingsSDKAdapter} from '../testHelper';

describe('Exit Control', () => {
  let meetingsSDKAdapter;

  beforeEach(() => {
    meetingsSDKAdapter = createTestMeetingsSDKAdapter();
  });

  afterEach(() => {
    meetingsSDKAdapter = null;
  });

  describe('display()', () => {
    it('returns the display in a proper shape', (done) => {
      meetingsSDKAdapter.meetingControls['leave-meeting'].display().pipe(first()).subscribe((display) => {
        expect(display).toMatchObject({
          ID: 'leave-meeting',
          type: 'CANCEL',
          icon: 'cancel',
          tooltip: 'Leave meeting',
        });
        done();
      });
    });
  });

  describe('action()', () => {
    it('calls leaveMeeting() SDK adapter method', async () => {
      meetingsSDKAdapter.leaveMeeting = jest.fn();
      await meetingsSDKAdapter.meetingControls['leave-meeting'].action({meetingID});
      expect(meetingsSDKAdapter.leaveMeeting).toHaveBeenCalledWith(meetingID);
    });
  });
});
