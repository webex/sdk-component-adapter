import {isObservable} from 'rxjs';
import {last} from 'rxjs/operators';
import {constructHydraId} from '@webex/common';

import ActivitiesSDKAdapter, {fromSDKActivity} from './ActivitiesSDKAdapter';
import createMockSDK, {
  created,
  sdkActivity,
  sdkConversation,
  activityID,
  roomID,
  personID,
  ID,
  actorID,
  targetID,
} from './mockSdk';

describe('Activities SDK Adapter', () => {
  let mockSDK;
  let activitiesSDKAdapter;

  const activityWithoutCards = {
    ID,
    roomID,
    text: 'text1',
    personID,
    cards: [],
    attachments: [],
    created,
  };

  const activityWithCards = {
    ID,
    roomID,
    text: 'text1',
    personID,
    cards: [JSON.parse(sdkActivity.object.cards[0])],
    attachments: [],
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
        () => Promise.resolve(sdkActivity),
      );
    });

    it('returns an observable', () => {
      expect(isObservable(activitiesSDKAdapter.getActivity(activityID))).toBeTruthy();
    });

    it('emits activity details on subscription', (done) => {
      activitiesSDKAdapter.getActivity(activityID).subscribe(
        (activity) => {
          expect(activity).toMatchObject({
            ID,
            roomID,
            text: 'text',
            personID,
            cards: [{
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
            }],
            attachments: [],
            created,
          });
          done();
        },
      );
    });

    it('throws an error on invalid activity ID', (done) => {
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

    it('card with prototype-polluting keys is sanitized', () => {
      // Built as a raw JSON string (not an object literal) because `__proto__`
      // in object-literal syntax sets the prototype instead of creating an own
      // property, which JSON.stringify would then silently drop.
      const maliciousCard = '{'
        + '"type":"AdaptiveCard",'
        + '"version":"1.2",'
        + '"__proto__":{"polluted":true},'
        + '"body":[{"type":"TextBlock","text":"hi","constructor":{"prototype":{"polluted":true}}}],'
        + '"actions":[{"type":"Action.OpenUrl","url":"http://adaptivecards.io","title":"Learn More"}]'
        + '}';

      const activity = fromSDKActivity({
        ...sdkActivity,
        object: {...sdkActivity.object, cards: [maliciousCard]},
      });

      expect(({}).polluted).toBeUndefined();
      expect(Object.prototype.hasOwnProperty.call(activity.cards[0], '__proto__')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(activity.cards[0].body[0], 'constructor')).toBe(false);
      expect(activity.cards[0]).toMatchObject({
        type: 'AdaptiveCard',
        version: '1.2',
        actions: [{type: 'Action.OpenUrl', url: 'http://adaptivecards.io', title: 'Learn More'}],
      });
    });

    it('disallowed card type/version rejected', () => {
      const disallowedCard = JSON.stringify({
        type: 'AdaptiveCard',
        version: '3.0',
        actions: [{type: 'Action.Execute', verb: 'doAdminThing'}],
      });

      const activity = fromSDKActivity({
        ...sdkActivity,
        object: {...sdkActivity.object, cards: [disallowedCard]},
      });

      expect(activity.cards[0]).toEqual({
        type: 'AdaptiveCard',
        version: '1.0',
        body: [{
          type: 'TextBlock',
          text: 'This card could not be parsed.',
        }],
      });
    });

    it('valid adaptive card passes through', () => {
      const activity = fromSDKActivity(sdkActivity);

      expect(activity.cards[0]).toMatchObject({
        $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
        type: 'AdaptiveCard',
        version: '1.2',
        body: [{type: 'TextBlock', text: 'Adaptive Cards', size: 'large'}],
        actions: [{type: 'Action.OpenUrl', url: 'http://adaptivecards.io', title: 'Learn More'}],
      });
    });
  });

  describe('fetchActivity()', () => {
    it('same-token cache reuse preserved', async () => {
      const uniqueID = constructHydraId('message', 'fetch-activity-reuse');
      const request = jest.fn(() => Promise.resolve({body: sdkActivity}));
      const scopedMockSDK = createMockSDK({request});
      const scopedAdapter = new ActivitiesSDKAdapter(scopedMockSDK);

      await scopedAdapter.fetchActivity(uniqueID);
      await scopedAdapter.fetchActivity(uniqueID);

      expect(request).toHaveBeenCalledTimes(1);
    });

    it('cross-instance cache isolation prevents a cached hit from bypassing datasource.request()', async () => {
      const uniqueID = constructHydraId('message', 'fetch-activity-isolation');
      const requestA = jest.fn(() => Promise.resolve({body: sdkActivity}));
      const requestB = jest.fn(() => Promise.resolve({body: sdkActivity}));
      const adapterA = new ActivitiesSDKAdapter(createMockSDK({request: requestA}));
      const adapterB = new ActivitiesSDKAdapter(createMockSDK({request: requestB}));

      await adapterA.fetchActivity(uniqueID);
      await adapterB.fetchActivity(uniqueID);

      expect(requestA).toHaveBeenCalledTimes(1);
      expect(requestB).toHaveBeenCalledTimes(1);
    });
  });

  describe('postActivity()', () => {
    beforeEach(() => {
      activitiesSDKAdapter.fetchConversation = jest.fn(
        () => Promise.resolve(sdkConversation),
      );
    });

    it('emits the posted Activity object', (done) => {
      const activityData = {
        roomID,
        personID,
        text: 'text',
        cards: [{
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
        }],
        attachments: [],
      };

      activitiesSDKAdapter.datasource.internal.conversation.post = jest.fn(
        () => Promise.resolve({
          ID,
          actor: {
            id: actorID,
          },
          object: {
            displayName: 'text',
            cards: [JSON.stringify(activityData.cards[0])],
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
          cards: [{
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
          }],
          attachments: [],
        });
        done();
      });
    });

    it('emits the sdk error when messages.create returns a rejected promise', (done) => {
      const sdkError = new Error('sdk-error');

      activitiesSDKAdapter.datasource.internal.conversation.post = jest.fn(
        () => Promise.reject(sdkError),
      );

      activitiesSDKAdapter.postActivity({roomID: '', cards: [], attachments: []}).subscribe(
        () => {
          done.fail('Posted an activity instead of returning error');
        },
        (error) => {
          expect(error).toBe(sdkError);
          done();
        },
      );
    });

    it('encryptCards rejects non-allowlisted key URL', (done) => {
      const {encryptText} = activitiesSDKAdapter.datasource.internal.encryption;

      activitiesSDKAdapter.fetchConversation = jest.fn(
        () => Promise.resolve({...sdkConversation, encryptionKeyUrl: 'https://evil.example.com/keys/abc'}),
      );

      const activityData = {
        roomID,
        personID,
        text: 'text',
        cards: [{
          type: 'AdaptiveCard',
          version: '1.2',
          body: [],
          actions: [],
        }],
        attachments: [],
      };

      activitiesSDKAdapter.postActivity(activityData).subscribe(
        () => {
          done.fail('Posted an activity instead of returning error');
        },
        (error) => {
          expect(error).toBeInstanceOf(Error);
          expect(encryptText).not.toHaveBeenCalled();
          done();
        },
      );
    });

    it('encryptCards accepts allow-listed KMS key URL', (done) => {
      const {encryptText} = activitiesSDKAdapter.datasource.internal.encryption;
      const activityData = {
        roomID,
        personID,
        text: 'text',
        cards: [{
          type: 'AdaptiveCard',
          version: '1.2',
          body: [],
          actions: [],
        }],
        attachments: [],
      };

      activitiesSDKAdapter.datasource.internal.conversation.post = jest.fn(
        () => Promise.resolve({
          ID,
          actor: {id: actorID},
          object: {displayName: 'text', cards: [JSON.stringify(activityData.cards[0])]},
          target: {id: targetID},
          published: created,
        }),
      );

      activitiesSDKAdapter.postActivity(activityData).pipe(last()).subscribe(() => {
        expect(encryptText).toHaveBeenCalledWith(
          sdkConversation.encryptionKeyUrl,
          expect.any(String),
        );
        done();
      });
    });
  });

  describe('postAction()', () => {
    const allowListedEncryptionKeyUrl = 'kms://kms-cisco.wbx2.com/keys/abc-123';

    beforeEach(() => {
      activitiesSDKAdapter.fetchActivity = jest.fn(
        () => Promise.resolve({...sdkActivity, encryptionKeyUrl: allowListedEncryptionKeyUrl}),
      );
    });
    it('emits the posted action object', (done) => {
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

    it('emits the sdk error when internal.conversation.cardAction returns a rejected promise', (done) => {
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

    it('postAction rejects non-allowlisted key URL', (done) => {
      const {encryptText} = activitiesSDKAdapter.datasource.internal.encryption;

      activitiesSDKAdapter.fetchActivity = jest.fn(
        () => Promise.resolve({...sdkActivity, encryptionKeyUrl: 'https://evil.example.com/keys/abc'}),
      );

      activitiesSDKAdapter.postAction(activityID, {x: 1, y: 2}).subscribe(
        () => {
          done.fail('Posted an action instead of returning error');
        },
        (error) => {
          expect(error).toBeInstanceOf(Error);
          expect(encryptText).not.toHaveBeenCalled();
          done();
        },
      );
    });

    it('postAction accepts allow-listed KMS key URL', (done) => {
      const {encryptText} = activitiesSDKAdapter.datasource.internal.encryption;

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

      activitiesSDKAdapter.postAction(activityID, {x: 1, y: 2}).subscribe((action) => {
        expect(encryptText).toHaveBeenCalledWith(
          allowListedEncryptionKeyUrl,
          expect.any(String),
        );
        expect(action).toMatchObject({ID, roomID, personID});
        done();
      });
    });
  });

  describe('hasAdaptiveCards()', () => {
    it('returns true if activity object has at least one adaptive card', () => {
      const hasCards = activitiesSDKAdapter.hasAdaptiveCards(activityWithCards);

      expect(hasCards).toBeTruthy();
    });

    it('returns false if activity object does not have at least one adaptive card', () => {
      const hasCard = activitiesSDKAdapter.hasAdaptiveCards(activityWithoutCards);

      expect(hasCard).toBeFalsy();
    });
  });

  describe('getAdaptiveCard()', () => {
    it('returns the first card object if the activity object has at least one adaptive card', () => {
      const card = activitiesSDKAdapter.getAdaptiveCard(activityWithCards, 0);

      expect(card).toMatchObject({
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

    it('returns undefined if Activity object does not have at least one card', () => {
      const card = activitiesSDKAdapter.getAdaptiveCard(activityWithoutCards, 0);

      expect(card).toBeUndefined();
    });
  });
});
