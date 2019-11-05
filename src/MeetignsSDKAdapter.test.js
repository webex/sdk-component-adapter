import {isObservable} from 'rxjs';

import MeetingSDKAdapter from './MeetingsSDKAdapter';
import createMockSDK, {mockSDKMeeting} from './__mocks__/sdk';

describe('Meetings SDK Adapter', () => {
  let mockSDK, meetingSDKAdapter;

  beforeEach(() => {
    mockSDK = createMockSDK();
    meetingSDKAdapter = new MeetingSDKAdapter(mockSDK);
  });

  describe('getMeeting() functionality', () => {
    test('returns an observable', () => {
      expect(isObservable(meetingSDKAdapter.getMeeting())).toBeTruthy();
    });

    test('returns a meeting in a proper shape', (done) => {
      meetingSDKAdapter.getMeeting('id').subscribe((meeting) => {
        expect(meeting).toEqual(
          expect.objectContaining({
            id: mockSDKMeeting.id,
          })
        );
        done();
      });
    });

    test('listens to meeting events when subscribing', async (done) => {
      await meetingSDKAdapter.connect();
      expect(mockSDK.meetings.on.calls[0][0]).toEqual('meeting:added');
      expect(mockSDK.meetings.register).toHaveBeenCalled();
      expect(mockSDK.meetings.syncMeeting).toHaveBeenCalled();
      done();
    });
  });

  afterEach(() => {
    meetingSDKAdapter = null;
  });
});
