import {first} from 'rxjs/operators';
import {meetingID, createTestMeetingsSDKAdapter} from '../testHelper';

describe('Video Control', () => {
  let meetingsSDKAdapter;

  beforeEach(() => {
    meetingsSDKAdapter = createTestMeetingsSDKAdapter();
  });

  afterEach(() => {
    meetingsSDKAdapter = null;
  });

  describe('display()', () => {
    it('returns the display data in a proper shape', (done) => {
      meetingsSDKAdapter.meetingControls['mute-video'].display(meetingID).pipe(first())
        .subscribe((dataDisplay) => {
          expect(dataDisplay).toMatchObject({
            ID: 'mute-video',
            type: 'BUTTON',
            icon: 'camera-muted',
            state: 'disabled',
            text: 'No camera',
          });
          done();
        });
    });

    it('emits an error if the meeting does not exist', (done) => {
      meetingsSDKAdapter.meetingControls['mute-video'].display('inexistent').subscribe(
        () => {},
        (error) => {
          expect(error.message).toBe('Could not find meeting with ID "inexistent"');
          done();
        },
      );
    });
  });

  describe('action()', () => {
    it('calls handleLocalVideo() SDK adapter method', async () => {
      meetingsSDKAdapter.handleLocalVideo = jest.fn();
      await meetingsSDKAdapter.meetingControls['mute-video'].action({meetingID});
      expect(meetingsSDKAdapter.handleLocalVideo).toHaveBeenCalledTimes(1);
      expect(meetingsSDKAdapter.handleLocalVideo).toHaveBeenCalledWith(meetingID);
    });
  });
});
