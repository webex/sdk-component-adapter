import {elementAt} from 'rxjs/operators';
import {meetingID, createTestMeetingsSDKAdapter} from '../testHelper';

describe('Switch Speaker Control', () => {
  let meetingsSDKAdapter;

  beforeEach(() => {
    meetingsSDKAdapter = createTestMeetingsSDKAdapter();
  });

  afterEach(() => {
    meetingsSDKAdapter = null;
  });

  describe('display()', () => {
    test('return the display data in a proper shape', (done) => {
      meetingsSDKAdapter.meetingControls['switch-speaker'].display(meetingID)
        .pipe(elementAt(1)).subscribe((display) => {
          expect(display).toMatchObject({
            ID: 'switch-speaker',
            tooltip: 'Speaker Devices',
            noOptionsMessage: 'No available speakers',
            options: [
              {
                value: 'default',
                label: 'Default - Headset Earphone (Jabra EVOLVE 20 SE MS) (0b0e:0300)',
              },
              {
                value: 'communications',
                label: 'Communications - Headset Earphone (Jabra EVOLVE 20 SE MS) (0b0e:0300)',
              },
              {
                value: '5e2cade11fab305ca3773e507b06e60d0a65ed8d6a19da2927a287c70e713dc7',
                label: 'Line (Realtek USB2.0 Audio) (0bda:402e)',
              },
              {
                value: '91e9c4b27e0b7bc8f41f3076a66e2968d4e229a5f388c2fe9f251bf8d54d7a34',
                label: 'Headphones (Realtek USB2.0 Audio) (0bda:402e)',
              },
              {
                value: 'a2f1a439c64a73b712a54c16f77716fb6040d87de312d211ef886944877ecea2',
                label: 'Speakers (Realtek(R) Audio)',
              },
              {
                value: '85e52fb55424206524719fab873ea7c3419c496ce1f691a009066ada5feaf813',
                label: 'Headset Earphone (Jabra EVOLVE 20 SE MS) (0b0e:0300)',
              },
            ],
            selected: 'speakerID',
          });
          done();
        });
    });
  });

  describe('action()', () => {
    test('calls switchSpeaker() SDK adapter method', async () => {
      meetingsSDKAdapter.switchSpeaker = jest.fn();
      await meetingsSDKAdapter.meetingControls['switch-speaker'].action(meetingID, 'speakerID');
      expect(meetingsSDKAdapter.switchSpeaker).toHaveBeenCalledWith(meetingID, 'speakerID');
    });
  });
});
