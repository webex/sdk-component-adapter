import {first} from 'rxjs/operators';
import {meetingID, createTestMeetingsSDKAdapter} from '../testHelper';

describe('Share Control', () => {
  let meetingsSDKAdapter;

  beforeEach(() => {
    meetingsSDKAdapter = createTestMeetingsSDKAdapter();
  });

  afterEach(() => {
    meetingsSDKAdapter = null;
  });

  describe('display()', () => {
    test('returns the display data in a proper shape', (done) => {
      meetingsSDKAdapter.meetingControls['share-screen'].display(meetingID).pipe(first())
        .subscribe((dataDisplay) => {
          expect(dataDisplay).toMatchObject({
            ID: 'share-screen',
            type: 'TOGGLE',
            icon: 'share-screen-presence-stroke',
            tooltip: 'Start sharing content',
            state: 'inactive',
            text: 'Start sharing',
          });
          done();
        });
    });

    test('emits an error if the meeting does not exist', (done) => {
      meetingsSDKAdapter.meetingControls['share-screen'].display('inexistent').subscribe(
        () => {},
        (error) => {
          expect(error.message).toBe('Could not find meeting with ID "inexistent"');
          done();
        },
      );
    });
  });

  describe('action()', () => {
    test('calls handleLocalShare() SDK adapter method', async () => {
      meetingsSDKAdapter.handleLocalShare = jest.fn();
      await meetingsSDKAdapter.meetingControls['share-screen'].action(meetingID);
      expect(meetingsSDKAdapter.handleLocalShare).toHaveBeenCalledTimes(1);
      expect(meetingsSDKAdapter.handleLocalShare).toHaveBeenCalledWith(meetingID);
    });
  });
});
