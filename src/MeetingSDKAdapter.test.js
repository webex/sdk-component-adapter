import {isObservable} from 'rxjs';

import MeetingSDKAdapter from './MeetingsSDKAdapter';
import createMockSDK, {mockSDKMeeting} from './__mocks__/sdk';

describe('Meetings SDK Adapter', () => {
  let mockSDK, meetingSDKAdapter;

  beforeEach(() => {
    mockSDK = createMockSDK();
    meetingSDKAdapter = new MeetingSDKAdapter(mockSDK);
  });

  describe('getMeeting()', () => {
    test('returns an observable', () => {
      expect(isObservable(meetingSDKAdapter.getMeeting())).toBeTruthy();
    });

    test('returns a meeting in a proper shape', (done) => {
      meetingSDKAdapter.getMeeting('id').subscribe((meeting) => {
        expect(meeting).toEqual(
          expect.objectContaining({
            ID: mockSDKMeeting.id,
            title: mockSDKMeeting.title,
            startTime: mockSDKMeeting.startTime,
            endTime: mockSDKMeeting.endTime,
            localVideo: mockSDKMeeting.localVideo,
            localAudio: mockSDKMeeting.remoteVideo,
            localShare: mockSDKMeeting.localShare,
            remoteVideo: mockSDKMeeting.remoteVideo,
            remoteAudio: mockSDKMeeting.remoteAudio,
            remoteShare: mockSDKMeeting.remoteShare,
          })
        );
        done();
      });
    });
  });

  afterEach(() => {
    meetingSDKAdapter = null;
  });
});
