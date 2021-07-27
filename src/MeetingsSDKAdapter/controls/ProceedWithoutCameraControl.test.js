import {first} from 'rxjs/operators';
import {meetingID, createTestMeetingsSDKAdapter} from '../testHelper';

describe('Proceed Without Camera Control', () => {
  let meetingsSDKAdapter;

  beforeEach(() => {
    meetingsSDKAdapter = createTestMeetingsSDKAdapter();
  });

  afterEach(() => {
    meetingsSDKAdapter = null;
  });

  describe('proceedWithoutCameraControl()', () => {
    test('returns the display data of a meeting control in a proper shape', (done) => {
      meetingsSDKAdapter.meetingControls['proceed-without-camera'].display(meetingID)
        .pipe(first()).subscribe((dataDisplay) => {
          expect(dataDisplay).toMatchObject({
            ID: 'proceed-without-camera',
            text: 'Proceed without camera',
            tooltip: 'Ignore media access prompt and proceed without camera',
          });
          done();
        });
    });

    test('throws errors if sdk meeting object is not defined', (done) => {
      meetingsSDKAdapter.meetingControls['proceed-without-camera'].display('inexistent').subscribe(
        () => {},
        (error) => {
          expect(error.message).toBe('Could not find meeting with ID "inexistent" to add proceed without camera control');
          done();
        },
      );
    });
  });
  describe('action()', () => {
    test('calls ignoreVideoAccessPrompt() SDK adapter method', async () => {
      meetingsSDKAdapter.ignoreVideoAccessPrompt = jest.fn();
      await meetingsSDKAdapter.meetingControls['proceed-without-camera'].action(meetingID);
      expect(meetingsSDKAdapter.ignoreVideoAccessPrompt).toHaveBeenCalledWith(meetingID);
    });
  });
});
