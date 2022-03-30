/// <reference types="cypress" />
import {from} from 'rxjs';
import {delayWhen, skip} from 'rxjs/operators';

import WebexSDKAdapter from '.';
import {
  createIntegrationTestUser,
  removeIntegrationTestUser,
  getPersonHydraID,
} from './testHelper';

describe('People SDK Adapter', () => {
  let getPerson$;
  let subscription;
  let user;
  let userID;
  let webexSDKAdapter;

  before(async () => {
    // work around for testHelpers+node_modules to access ENV variables
    process.env = Cypress.env();
    user = await createIntegrationTestUser();
    userID = getPersonHydraID(user.id);
    webexSDKAdapter = new WebexSDKAdapter(user.sdk);
    await webexSDKAdapter.connect();
  });

  after(async () => {
    try {
      await removeIntegrationTestUser(user);
      await webexSDKAdapter.disconnect();
    } catch (reason) {
      // eslint-disable-next-line no-console
      console.warn('Failed to delete test user for People SDK Adapter integration tests.', reason);
    }
  });

  describe('getMe()', () => {
    it('returns person data of the access token bearer in a proper shape', () => {
      subscription = webexSDKAdapter.peopleAdapter.getMe().subscribe((person) => {
        expect(person).to.deep.include({
          ID: userID,
          emails: [user.emailAddress],
          displayName: user.displayName,
        });
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

    it('a person in a proper shape', () => {
      subscription = getPerson$.subscribe((person) => {
        expect(person).to.deep.include({
          ID: userID,
          emails: [user.emailAddress],
          displayName: user.displayName,
        });
      });
    });

    it('an updated person status after subscribing', () => {
      subscription = getPerson$
        .pipe(
          delayWhen(() => from(user.sdk.internal.presence.setStatus('active', 1500))),
          skip(1),
        )
        .subscribe((person) => {
          expect(person.status).to.equal('ACTIVE');
        });
    });

    it('support for multiple subscriptions', () => {
      subscription = getPerson$.subscribe();

      const secondSubscription = getPerson$.subscribe((room) => {
        expect(room).to.deep.include({
          ID: userID,
          emails: [user.emailAddress],
          displayName: user.displayName,
        });
      });

      subscription.add(secondSubscription);
    });
  });
});
