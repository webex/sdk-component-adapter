import {createIntegrationTestUser, removeIntegrationTestUser} from './testHelper';

import WebexSDKAdapter from './';

describe('Meeting SDK Adapter', () => {
  let meeting, getMeeting$, webexSDKAdapter, subscription, user;

  // Since these are integration tests with live data,
  // increase the async "idle" timeout so jest doesn't error early.
  jest.setTimeout(30000);

  beforeAll(async () => {
    user = await createIntegrationTestUser();
    webexSDKAdapter = new WebexSDKAdapter(user.sdk);
    await webexSDKAdapter.connect();
  });

  afterAll(async () => {
    try {
      await removeIntegrationTestUser(user);
      await webexSDKAdapter.disconnect();
    } catch (reason) {
      // eslint-disable-next-line no-console
      console.warn('Failed to delete test user for Meeting SDK Adapter integration tests.', reason);
    }
  });

  describe('getMeeting() returns', () => {
    beforeEach(async () => {
      meeting = await user.sdk.meetings.create('test@cisco.com');
      getMeeting$ = webexSDKAdapter.meetingAdapter.getMeeting(meeting.id);
    });

    afterEach(async () => {
      try {
        subscription.unsubscribe();
        getMeeting$ = null;
        meeting = null;
      } catch (reason) {
        // eslint-disable-next-line no-console
        console.warn(`Failed to clean up meeting "${meeting.id}" in Meeting SDK Adapter integration tests.`, reason);
      }
    });

    test('a meeting in a proper shape', (done) => {
      subscription = getMeeting$.subscribe((meetinglocal) => {
        expect(meetinglocal).toMatchObject({
          ID: meeting.id,
        });
        done();
      });
    });
  });
});
