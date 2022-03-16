import {isObservable} from 'rxjs';
import {last} from 'rxjs/operators';

import ActivitiesSDKAdapter from './ActivitiesSDKAdapter';
import createMockSDK, {
  mockSDKCardActivity, created, serverActivity, activityID, roomID, personID, ID, actorID, targetID,
} from './mockSdk';

describe('Activities SDK Adapter', () => {
  let mockSDK;
  let activitiesSDKAdapter;

  const activityWithoutCard = {
    ID,
    roomID,
    text: 'text1',
    personID,
    created,
  };

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
      activitiesSDKAdapter.fetchActivity = jest.fn(
        () => Promise.resolve(serverActivity),
      );
    });

    test('returns an observable', () => {
      expect(isObservable(activitiesSDKAdapter.getActivity(activityID))).toBeTruthy();
    });

    test('emits activity details on subscription', (done) => {
      activitiesSDKAdapter.getActivity(activityID).subscribe(
        (activity) => {
          expect(activity).toMatchObject({
            ID,
            roomID,
            text: 'text',
            personID,
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
            created,
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
        roomID,
        personID,
        text: 'text',
      };

      activitiesSDKAdapter.datasource.internal.conversation.post = jest.fn(
        () => Promise.resolve({
          ID,
          actor: {
            id: actorID,
          },
          object: {
            displayName: 'text',
          },
          target: {
            id: targetID,
          },
          published: created,
        }),
      );

      activitiesSDKAdapter.postActivity(activityData).pipe(last()).subscribe((activity) => {
        expect(activity).toMatchObject({
          ID,
          text: 'text',
          roomID,
          personID,
          created,
        });
        done();
      });
    });

    test('emits the sdk error when messages.create returns a rejected promise', (done) => {
      const sdkError = new Error('sdk-error');

      activitiesSDKAdapter.datasource.internal.conversation.post = jest.fn(
        () => Promise.reject(sdkError),
      );

      activitiesSDKAdapter.postActivity({roomID: ''}).subscribe(
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
    beforeEach(() => {
      activitiesSDKAdapter.fetchActivity = jest.fn(
        () => Promise.resolve(serverActivity),
      );
    });
    test('emits the posted action object', (done) => {
      const inputs = {
        firstName: 'My first name',
        lastname: 'My last name',
      };

      activitiesSDKAdapter.datasource.internal.conversation.cardAction = jest.fn(
        () => Promise.resolve({
          ID,
          actor: {
            id: actorID,
          },
          object: {
            displayName: 'text',
          },
          target: {
            id: targetID,
          },
          published: created,
        }),
      );

      activitiesSDKAdapter.postAction(activityID, inputs).subscribe((action) => {
        expect(action).toMatchObject({
          ID,
          text: 'text',
          roomID,
          personID,
          created,
        });
        done();
      });
    });

    test('emits the sdk error when internal.conversation.cardAction returns a rejected promise', (done) => {
      const sdkError = new Error('sdk-error');

      activitiesSDKAdapter.datasource.internal.conversation.cardAction = jest.fn(
        () => Promise.reject(sdkError),
      );

      activitiesSDKAdapter.postAction(activityID, {x: 1, y: 2}).subscribe(
        () => {
          done.fail('Created card action instead of returning error');
        },
        (error) => {
          expect(error).toBe(sdkError);
          done();
        },
      );
    });
  });

  describe('hasAdaptiveCard()', () => {
    test('returns true if activity object has a card attachment', () => {
      const hasCard = activitiesSDKAdapter.hasAdaptiveCard(mockSDKCardActivity);

      expect(hasCard).toBeTruthy();
    });

    test('returns false if activity object does not have a card attachment', () => {
      const hasCard = activitiesSDKAdapter.hasAdaptiveCard(activityWithoutCard);

      expect(hasCard).toBeFalsy();
    });
  });

  describe('getAdaptiveCard()', () => {
    test('returns the card object if the activity object has a card attachment', () => {
      const cardAttachment = activitiesSDKAdapter.getAdaptiveCard(mockSDKCardActivity);

      expect(cardAttachment).toMatchObject({
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
      });
    });

    test('returns undefined if Activity object has a card attachment', () => {
      const cardAttachment = activitiesSDKAdapter.getAdaptiveCard(activityWithoutCard);

      expect(cardAttachment).toBeUndefined();
    });
  });

  describe('attachAdaptiveCard()', () => {
    test('add an adaptive card attachment to the activity', () => {
      const activity = {
        roomID: 'roomID3',
        text: 'text3',
      };
      const cardToAttach = {
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
      };

      activitiesSDKAdapter.attachAdaptiveCard(activity, cardToAttach);

      expect(activity).toMatchObject({
        roomID: 'roomID3',
        text: 'text3',
        attachments: [{
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
        }],
      });
    });
  });
});
