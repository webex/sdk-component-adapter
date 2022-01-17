import {isObservable} from 'rxjs';

import ActivitiesSDKAdapter from './ActivitiesSDKAdapter';
import createMockSDK, {mockSDKActivity} from './mockSdk';

describe('Activities SDK Adapter', () => {
  let mockSDK;
  let activitiesSDKAdapter;
  let activityID;

  beforeEach(() => {
    mockSDK = createMockSDK();
    activitiesSDKAdapter = new ActivitiesSDKAdapter(mockSDK);
  });

  afterEach(() => {
    mockSDK = null;
    activitiesSDKAdapter = null;
  });

  describe('getActivity()', () => {
    beforeEach(() => {
      activityID = 'activityID';
      activitiesSDKAdapter.fetchActivity = jest.fn(
        () => Promise.resolve(mockSDKActivity),
      );
    });

    test('returns an observable', () => {
      expect(isObservable(activitiesSDKAdapter.getActivity(activityID))).toBeTruthy();
    });

    test('emits activity details on subscription', (done) => {
      activitiesSDKAdapter.getActivity(activityID).subscribe(
        (activity) => {
          expect(activity).toMatchObject({
            ID: 'activityID',
            roomID: 'roomID',
            text: 'text',
            personID: 'personID',
            attachments: [
              {
                contentType: 'application/vnd.microsoft.card.adaptive',
                content: {
                  type: 'AdaptiveCard',
                  version: '1.0',
                  body: [
                    {
                      type: 'TextBlock',
                      text: 'Adaptive Cards',
                      size: 'large',
                    },
                  ],
                  actions: [
                    {
                      type: 'Action.OpenUrl',
                      url: 'http://adaptivecards.io',
                      title: 'Learn More',
                    },
                  ],
                },
              },
            ],
            card: {
              type: 'AdaptiveCard',
              version: '1.0',
              body: [
                {
                  type: 'TextBlock',
                  text: 'Adaptive Cards',
                  size: 'large',
                },
              ],
              actions: [
                {
                  type: 'Action.OpenUrl',
                  url: 'http://adaptivecards.io',
                  title: 'Learn More',
                },
              ],
            },
            created: '2015-10-18T14:26:16+00:00',
          });
          done();
        },
      );
    });
  });

  test('throws an error on invalid activity ID', (done) => {
    const sdkError = new Error('Could not find activity with ID "badActivityID"');

    activitiesSDKAdapter.fetchActivity = jest.fn(() => Promise.reject(sdkError));

    activitiesSDKAdapter.getActivity('badActivityID').subscribe(
      () => {},
      (error) => {
        expect(error.message).toBe(sdkError.message);
        done();
      },
    );
  });
});
