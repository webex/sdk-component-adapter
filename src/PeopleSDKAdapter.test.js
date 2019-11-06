import {isObservable} from 'rxjs';

import PeopleSDKAdapter from './PeopleSDKAdapter';
import createMockSDK from './__mocks__/sdk';

describe('People SDK Adapter', () => {
  let peopleSDKAdapter, mockSDK, personID;

  beforeEach(() => {
    mockSDK = createMockSDK();
    peopleSDKAdapter = new PeopleSDKAdapter(mockSDK);
    personID = 'personID';
  });

  describe('getPerson()', () => {
    test('returns an observable', () => {
      expect(isObservable(peopleSDKAdapter.getPerson(personID))).toBeTruthy();
    });

    test('returns a person in a proper shape', (done) => {
      peopleSDKAdapter.getPerson(personID).subscribe((person) => {
        expect(person).toEqual({
          ID: 'id',
          emails: ['email@cisco.com'],
          displayName: 'Webex Components',
          firstName: 'Webex',
          lastName: 'Components',
          avatar: 'avatar',
          orgID: 'orgID',
          status: 'ACTIVE',
        });
        done();
      });
    });

    test('stops listening to events when unsubscribing', () => {
      const subscription = peopleSDKAdapter.getPerson(personID).subscribe();

      subscription.unsubscribe();
      expect(mockSDK.internal.presence.unsubscribe).toHaveBeenCalled();
    });

    test('throws error on failed person fetch request', (done) => {
      const errorMessage = 'a proper people error message';

      personID = 'invalid personID';
      peopleSDKAdapter.fetchPerson = jest.fn(() => Promise.reject(new Error(errorMessage)));

      peopleSDKAdapter.getPerson(personID).subscribe(
        () => {},
        (error) => {
          expect(error.message).toBe(errorMessage);
          done();
        }
      );
    });

    test('throws error on failed presence update subscription', (done) => {
      const errorMessage = 'a proper subscription error message';

      personID = 'invalid personID';
      mockSDK.internal.presence.subscribe = jest.fn(() => Promise.reject(new Error(errorMessage)));

      peopleSDKAdapter.getPerson(personID).subscribe(
        () => {},
        (error) => {
          expect(error.message).toBe(errorMessage);
          done();
        }
      );
    });
  });

  afterEach(() => {
    mockSDK = null;
    peopleSDKAdapter = null;
    personID = null;
  });
});
