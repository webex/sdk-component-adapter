import {elementAt} from 'rxjs/operators';
import {meetingID, createTestMeetingsSDKAdapter} from '../testHelper';

describe('Switch Camera Control', () => {
  let meetingsSDKAdapter;

  beforeEach(() => {
    meetingsSDKAdapter = createTestMeetingsSDKAdapter();
  });

  afterEach(() => {
    meetingsSDKAdapter = null;
  });

  describe('display()', () => {
    test('returns the display data in a proper shape', (done) => {
      meetingsSDKAdapter.meetingControls['switch-camera'].display(meetingID)
        .pipe(elementAt(1)).subscribe((display) => {
          expect(display).toMatchObject({
            ID: 'switch-camera',
            type: 'MULTISELECT',
            tooltip: 'Video Devices',
            noOptionsMessage: 'No available cameras',
            options: [
              {
                label: 'Logitech HD Webcam C525 (046d:0826)',
                value: '2a9f83242466302e2130134a57162f3562c59bd9ea34daa7f6fc2ad43a29265b',
              },
              {
                label: 'Integrated Camera (04f2:b6d9)',
                value: 'c2fcaf0c6b0bc7adc1192ba0b2dd236f7926e2ae163c56f80fa51613f9b9ec77',
              },
            ],
            selected: 'cameraID',
          });
          done();
        });
    });
  });

  describe('action()', () => {
    test('calls switchCamera() SDK adapter method', async () => {
      meetingsSDKAdapter.switchCamera = jest.fn();
      await meetingsSDKAdapter.meetingControls['switch-camera'].action(meetingID, 'cameraID');
      expect(meetingsSDKAdapter.switchCamera).toHaveBeenCalledTimes(1);
      expect(meetingsSDKAdapter.switchCamera).toHaveBeenCalledWith(meetingID, 'cameraID');
    });
  });
});
