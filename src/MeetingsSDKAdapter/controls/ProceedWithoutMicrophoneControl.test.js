import {first} from 'rxjs/operators';
import {meetingID, createTestMeetingsSDKAdapter} from '../testHelper';

describe('Proceed Without Microphone Control', () => {
  let meetingsSDKAdapter;

  beforeEach(() => {
    meetingsSDKAdapter = createTestMeetingsSDKAdapter();
  });

  afterEach(() => {
    meetingsSDKAdapter = null;
  });

  describe('display()', () => {
    test('returns the display of a meeting control in a proper shape', (done) => {
      meetingsSDKAdapter.meetingControls['proceed-without-microphone'].display(meetingID)
        .pipe(first()).subscribe((display) => {
          expect(display).toMatchObject({
            ID: 'proceed-without-microphone',
            text: 'Proceed without microphone',
            tooltip: 'Ignore media access prompt and proceed without microphone',
            hint: 'This setting cannot be changed once the meeting starts.',
          });
          done();
        });
    });

    test('throws errors if sdk meeting object is not defined', (done) => {
      meetingsSDKAdapter.meetingControls['proceed-without-microphone'].display('inexistent').subscribe(
        () => {},
        (error) => {
          expect(error.message).toBe('Could not find meeting with ID "inexistent" to add proceed without microphone control');
          done();
        },
      );
    });
  });

  describe('action()', () => {
    test('calls ignoreAudioAccessPrompt() SDK adapter method', async () => {
      meetingsSDKAdapter.ignoreAudioAccessPrompt = jest.fn();
      await meetingsSDKAdapter.meetingControls['proceed-without-microphone'].action(meetingID);
      expect(meetingsSDKAdapter.ignoreAudioAccessPrompt).toHaveBeenCalledWith(meetingID);
    });
  });
});
