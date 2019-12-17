import {from} from 'rxjs';
import {delayWhen, skip} from 'rxjs/operators';

import {createIntegrationTestUser, removeIntegrationTestUser, getPersonHydraID} from './testHelper';

import WebexSDKAdapter from './';

describe('People SDK Adapter', () => {
  let getPerson$, webexSDKAdapter, subscription, user, userID;

  // Since these are integration tests with live data,
  // increase the async "idle" timeout so jest doesn't error early.
  jest.setTimeout(30000);
  beforeAll(async () => {
    user = await createIntegrationTestUser();
    userID = getPersonHydraID(user.id);
    webexSDKAdapter = new WebexSDKAdapter(user.sdk);
    await webexSDKAdapter.connect();
  });

  afterAll(async () => {
    try {
      await removeIntegrationTestUser(user);
      await webexSDKAdapter.disconnect();
    } catch (reason) {
      // eslint-disable-next-line no-console
      console.warn('Failed to delete test user for People SDK Adapter integration tests.', reason);
    }
  });

  describe('getMe()', () => {
    test('returns person data of the access token bearer in a proper shape', (done) => {
      subscription = webexSDKAdapter.peopleAdapter.getMe().subscribe((person) => {
        expect(person).toMatchObject({
          ID: userID,
          emails: [user.emailAddress],
          displayName: user.displayName,
        });
        done();
      });
    });
  });

  describe('getPerson() returns', () => {
    beforeEach(() => {
      getPerson$ = webexSDKAdapter.peopleAdapter.getPerson(userID);
    });

    afterEach(() => {
      getPerson$ = null;
      subscription.unsubscribe();
    });

    test('a person in a proper shape', (done) => {
      subscription = getPerson$.subscribe((person) => {
        expect(person).toMatchObject({
          ID: userID,
          emails: [user.emailAddress],
          displayName: user.displayName,
        });
        done();
      });
    });

    test('an updated person status after subscribing', (done) => {
      subscription = getPerson$
        .pipe(
          delayWhen(() => from(user.sdk.internal.presence.setStatus('active', 1500))),
          skip(1)
        )
        .subscribe((person) => {
          expect(person.status).toEqual('ACTIVE');
          done();
        });
    });

    test('support for multiple subscriptions', (done) => {
      subscription = getPerson$.subscribe();

      const secondSubscription = getPerson$.subscribe((room) => {
        expect(room).toMatchObject({
          ID: userID,
          emails: [user.emailAddress],
          displayName: user.displayName,
        });
        done();
      });

      subscription.add(secondSubscription);
    });
  });
});
