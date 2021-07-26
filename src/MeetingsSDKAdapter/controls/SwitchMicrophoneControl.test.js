import {elementAt} from 'rxjs/operators';
import {meetingID, createTestMeetingsSDKAdapter} from '../testHelper';

describe('Switch Microphone Control', () => {
  let meetingsSDKAdapter;

  beforeEach(() => {
    meetingsSDKAdapter = createTestMeetingsSDKAdapter();
  });

  afterEach(() => {
    meetingsSDKAdapter = null;
  });

  describe('display()', () => {
    test('returns the display data of a meeting control in a proper shape', (done) => {
      meetingsSDKAdapter.meetingControls['switch-microphone'].display(meetingID)
        .pipe(elementAt(1)).subscribe((dataDisplay) => {
          expect(dataDisplay).toMatchObject({
            ID: 'switch-microphone',
            tooltip: 'Audio Devices',
            noOptionsMessage: 'No available microphones',
            options: [
              {
                label: 'Default - Headset Microphone (Jabra EVOLVE 20 SE MS) (0b0e:0300)',
                value: 'default',
              },
              {
                label: 'Communications - Headset Microphone (Jabra EVOLVE 20 SE MS) (0b0e:0300)',
                value: 'communications',
              },
              {
                label: 'Microphone Array (Realtek(R) Audio)',
                value: 'fd8f12fdced8098aaac31836c8b98960727060b57d48148e15cc34ad4ba1394a',
              },
              {
                label: 'Microphone (Realtek USB2.0 Audio) (0bda:402e)',
                value: 'df434123000a75a161b1841b08f7318617b419aae3c93683b0fcb3389470b39a',
              },
              {
                label: 'Headset Microphone (Jabra EVOLVE 20 SE MS) (0b0e:0300)',
                value: '79a2df2a81176acde237e064a9b213cd1bd32608106bd4ee5c30242eee01945f',
              },
              {
                label: 'Microphone (HD Webcam C525) (046d:0826)',
                value: 'f4491e7c9ad16139cc485d99e39234313172be31fc00c086acbdecb21236ccf6',
              },
            ],
            selected: null,
          });
          done();
        });
    });
  });

  describe('action()', () => {
    test('calls switchMicrophone() SDK adapter method', async () => {
      meetingsSDKAdapter.switchMicrophone = jest.fn();
      await meetingsSDKAdapter.meetingControls['switch-microphone'].action(meetingID, 'microphoneID');
      expect(meetingsSDKAdapter.switchMicrophone).toHaveBeenCalledTimes(1);
      expect(meetingsSDKAdapter.switchMicrophone).toHaveBeenCalledWith(meetingID, 'microphoneID');
    });
  });
});
