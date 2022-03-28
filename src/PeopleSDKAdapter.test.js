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
    it('returns an observable', () => {
      expect(isObservable(peopleSDKAdapter.getMe())).toBeTruthy();
    });

    it('emits a Person object on subscription', (done) => {
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

    it('emits a Person object with null status on presence plug-in error', (done) => {
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

    it('completes after one emission', (done) => {
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
    it('returns an observable', () => {
      expect(isObservable(peopleSDKAdapter.getPerson(personID))).toBeTruthy();
    });

    it('emits a Person object on subscription', (done) => {
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

    it('emits a Person object with null status on presence plug-in error', (done) => {
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

    it('throws error on people plug-in error', (done) => {
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

    it('stops listening to presence updates when unsubscribing', () => {
      const subscription = peopleSDKAdapter.getPerson(personID).subscribe();

      subscription.unsubscribe();
      expect(mockSDK.internal.presence.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('searchPeople', () => {
    test('returns an observable', () => {
      expect(isObservable(peopleSDKAdapter.searchPeople(query))).toBeTruthy();
    });

    test('emits persons list on subscription', (done) => {
      mockSDK.people.list = jest.fn(() => Promise.resolve({
        items: [
          {
            id: 'personIDCurrentUser',
            emails: ['email@cisco.com'],
            displayName: 'Webex Components',
            firstName: 'Webex',
            lastName: 'Components',
            nickName: 'Webex',
            avatar: 'avatar',
            orgId: 'orgID',
            status: 'active',
          },
        ],
      }));

      peopleSDKAdapter.searchPeople(query).subscribe((peopleList) => {
        expect(peopleList).toEqual([{
          ID: 'personIDCurrentUser',
          emails: ['email@cisco.com'],
          displayName: 'Webex Components',
          firstName: 'Webex',
          lastName: 'Components',
          nickName: 'Webex',
          avatar: 'avatar',
          orgID: 'orgID',
          status: 'active',
        }]);
      });
      done();
    });

    test('emits an error if the SDK fails to fetch the person list', (done) => {
      const errorMsg = 'error fetching person list';

      mockSDK.people.list = jest.fn(() => Promise.reject(new Error(errorMsg)));
      peopleSDKAdapter.searchPeople(query).subscribe(
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
  });
});
