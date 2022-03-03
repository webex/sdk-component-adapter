import {isObservable} from 'rxjs';

import PeopleSDKAdapter from './PeopleSDKAdapter';
import createMockSDK from './mockSdk';

describe('People SDK Adapter', () => {
  let mockSDK;
  let peopleSDKAdapter;
  let personID;
  let query;

  beforeEach(() => {
    mockSDK = createMockSDK();
    peopleSDKAdapter = new PeopleSDKAdapter(mockSDK);
    personID = 'personID';
    query = 'query';
  });

  describe('getMe()', () => {
    test('returns an observable', () => {
      expect(isObservable(peopleSDKAdapter.getMe())).toBeTruthy();
    });

    test('emits a Person object on subscription', (done) => {
      peopleSDKAdapter.getMe().subscribe((person) => {
        expect(person).toMatchObject({
          ID: 'personIDCurrentUser',
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

    test('emits a Person object with null status on presence plug-in error', (done) => {
      const errorMessage = 'Presence not enabled for user';

      // SDK presence plug-in fails to return a status
      mockSDK.internal.presence.get = jest.fn(() => Promise.reject(new Error(errorMessage)));

      peopleSDKAdapter.getMe().subscribe((person) => {
        expect(person).toMatchObject({
          status: null,
        });
        done();
      });
    });

    test('completes after one emission', (done) => {
      peopleSDKAdapter.getMe().subscribe(
        () => {},
        () => {},
        () => {
          expect(true).toBeTruthy();
          done();
        },
      );
    });
  });

  describe('getPerson()', () => {
    test('returns an observable', () => {
      expect(isObservable(peopleSDKAdapter.getPerson(personID))).toBeTruthy();
    });

    test('emits a Person object on subscription', (done) => {
      peopleSDKAdapter.getPerson(personID).subscribe((person) => {
        expect(person).toEqual({
          ID: 'personIDCurrentUser',
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

    test('emits a Person object with null status on presence plug-in error', (done) => {
      const errorMessage = 'error while subscribing to presence updates';

      // SDK presence plug-in fails to subscribe to person status updates
      mockSDK.internal.presence.subscribe = jest.fn(() => Promise.reject(new Error(errorMessage)));

      peopleSDKAdapter.getPerson(personID).subscribe((person) => {
        expect(person).toMatchObject({
          status: null,
        });
        done();
      });
    });

    test('throws error on people plug-in error', (done) => {
      const errorMessage = 'Could not find person with given ID';

      // SDK people plug-in fails to find person
      peopleSDKAdapter.fetchPerson = jest.fn(() => Promise.reject(new Error(errorMessage)));

      peopleSDKAdapter.getPerson(personID).subscribe(
        () => {},
        (error) => {
          expect(error.message).toBe(errorMessage);
          done();
        },
      );
    });

    test('stops listening to presence updates when unsubscribing', () => {
      const subscription = peopleSDKAdapter.getPerson(personID).subscribe();

      subscription.unsubscribe();
      expect(mockSDK.internal.presence.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('getPersonList', () => {
    test('returns an observable', () => {
      expect(isObservable(peopleSDKAdapter.getPeopleList(query))).toBeTruthy();
    });

    test('emits persons list on subscription', (done) => {
      peopleSDKAdapter.getPeopleList(query).subscribe((peopleList) => {
        expect(peopleList).toEqual([{
          id: 'personIDCurrentUser',
          emails: ['email@cisco.com'],
          displayName: 'sipUri',
          firstName: 'Webex',
          lastName: 'Components',
          avatar: 'avatar',
          orgId: 'orgID',
        }]);
      });
      done();
    });

    test('throws error on fetching data', (done) => {
      const errorMsg = 'error in fetching data';

      mockSDK.people.list = jest.fn(() => Promise.reject(new Error(errorMsg)));
      peopleSDKAdapter.getPeopleList(query).subscribe(
        () => {},
        (error) => {
          expect(error.message).toBe(errorMsg);
          done();
        },
      );
    });
  });

  afterEach(() => {
    mockSDK = null;
    peopleSDKAdapter = null;
    personID = null;
    query = null;
  });
});
