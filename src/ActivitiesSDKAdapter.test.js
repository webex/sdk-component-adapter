import {isObservable} from 'rxjs';
import {last} from 'rxjs/operators';

import ActivitiesSDKAdapter from './ActivitiesSDKAdapter';
import createMockSDK, {mockSDKActivity} from './mockSdk';

describe('Activities SDK Adapter', () => {
  let mockSDK;
  let activitiesSDKAdapter;
  let activityID;

  beforeEach(() => {
    mockSDK = createMockSDK();
    activitiesSDKAdapter = new ActivitiesSDKAdapter(mockSDK);
    activityID = 'activityID';
  });

  afterEach(() => {
    mockSDK = null;
    activitiesSDKAdapter = null;
    activityID = null;
  });

  describe('getActivity()', () => {
    beforeEach(() => {
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
                  $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
                  type: 'AdaptiveCard',
                  version: '1.2',
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
              $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
              type: 'AdaptiveCard',
              version: '1.2',
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
            created: '2022-02-02T14:38:16+00:00',
          });
          done();
        },
      );
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

  describe('postActivity()', () => {
    test('emits the posted Activity object', (done) => {
      const activityData = {
        roomID: 'roomID',
        text: 'text',
        card: {
          $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
          type: 'AdaptiveCard',
          version: '1.2',
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
      };

      activitiesSDKAdapter.postActivity(activityData).pipe(last()).subscribe((activity) => {
        expect(activity).toMatchObject({
          ID: 'activityID',
          roomID: 'roomID',
          text: 'text',
          personID: 'personID',
          created: '2022-02-02T14:38:16+00:00',
          attachments: [
            {
              contentType: 'application/vnd.microsoft.card.adaptive',
              content: {
                $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
                type: 'AdaptiveCard',
                version: '1.2',
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
        });
        done();
      });
    });

    test('emits the sdk error when messages.create returns a rejected promise', (done) => {
      const sdkError = new Error('sdk-error');

      activitiesSDKAdapter.datasource.messages.create = jest.fn(() => Promise.reject(sdkError));

      activitiesSDKAdapter.postActivity({}).subscribe(
        () => {
          done.fail('Posted an activity instead of returning error');
        },
        (error) => {
          expect(error).toBe(sdkError);
          done();
        },
      );
    });
  });

  describe('postAction()', () => {
    test('emits the posted action object', (done) => {
      const inputs = {
        firstName: 'My first name',
        lastname: 'My last name',
      };

      activitiesSDKAdapter.postAction(activityID, inputs).pipe(last()).subscribe((action) => {
        expect(action).toMatchObject({
          actionID: 'actionID',
          activityID: 'activityID',
          inputs: {
            firstName: 'My first name',
            lastName: 'My last name',
          },
          roomID: 'roomID',
          type: 'submit',
        });
        done();
      });
    });

    test('emits the sdk error when attachmentActions.create returns a rejected promise', (done) => {
      const sdkError = new Error('sdk-error');

      activitiesSDKAdapter.datasource.attachmentActions.create = jest.fn(
        () => Promise.reject(sdkError),
      );

      activitiesSDKAdapter.postAction({}).subscribe(
        () => {
          done.fail('Created attachment action instead of returning error');
        },
        (error) => {
          expect(error).toBe(sdkError);
          done();
        },
      );
    });
  });
});
