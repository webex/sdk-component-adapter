import {isObservable} from 'rxjs';
import {DestinationType} from '@webex/component-adapter-interfaces';

import MembershipsSDKAdapter from './MembershipsSDKAdapter';
import createMockSDK from './mockSdk';

describe('Memberships SDK Adapter', () => {
  let membershipSDKAdapter;
  let mockSDK;

  beforeEach(() => {
    mockSDK = createMockSDK();
    membershipSDKAdapter = new MembershipsSDKAdapter(mockSDK);
  });

  afterEach(() => {
    mockSDK = null;
    membershipSDKAdapter = null;
  });

  describe('getMembersFromDestination()', () => {
    it('returns an observable', () => {
      expect(isObservable(membershipSDKAdapter.getMembersFromDestination())).toBeTruthy();
    });

    describe('when destination type is MEETING', () => {
      let meetingID;

      beforeEach(() => {
        meetingID = 'meetingID';
      });
      afterEach(() => {
        meetingID = null;
      });
      it('emits a sorted member list on subscription', (done) => {
        membershipSDKAdapter.getMembersFromDestination(meetingID, DestinationType.MEETING)
          .subscribe((members) => {
            expect(members).toMatchObject([
              {
                ID: 'id',
                orgID: 'orgID',
                inMeeting: true,
                muted: false,
                sharing: false,
                host: false,
                guest: false,
                name: 'John Doe',
              },
              {
                ID: 'mutedPerson',
                orgID: 'orgID',
                inMeeting: true,
                muted: true,
                sharing: true,
                host: true,
                guest: true,
                name: 'Brenda Song',
              },
              {
                ID: 'notJoinedPerson',
                orgID: 'orgID',
                inMeeting: false,
                muted: false,
                sharing: false,
                host: false,
                guest: true,
                name: 'Giacomo Edwards',
              },
              {
                ID: 'device',
                orgID: 'orgID',
                inMeeting: true,
                muted: false,
                sharing: false,
                host: false,
                guest: false,
                name: undefined,
              },
            ]);
            done();
          });
      });

      it('throws an error on invalid meeting ID', (done) => {
        membershipSDKAdapter.getMembersFromDestination('badID', DestinationType.MEETING).subscribe(
          () => {},
          (error) => {
            expect(error.message).toBe('Meeting badID not found.');
            done();
          },
        );
      });
    });

    describe('when destination type is ROOM', () => {
      let roomID;

      beforeEach(() => {
        roomID = 'roomID';
      });
      afterEach(() => {
        roomID = null;
      });

      it('emits a sorted member list on subscription', (done) => {
        membershipSDKAdapter.getMembersFromDestination(roomID, DestinationType.ROOM)
          .subscribe((members) => {
            expect(members).toMatchObject([
              {
                ID: 'personIDCurrentUser',
                orgID: 'organizationID1',
                muted: null,
                sharing: null,
                inMeeting: null,
              },
              {
                ID: 'personID2',
                orgID: 'organizationID2',
                muted: null,
                sharing: null,
                inMeeting: null,
                host: null,
              },
              {
                ID: 'personID',
                orgID: 'organizationID',
                muted: null,
                sharing: null,
                inMeeting: null,
                host: null,
              },
              {
                ID: 'personID3',
                orgID: 'organizationID3',
                muted: null,
                sharing: null,
                inMeeting: null,
                host: null,
              },
            ]);
            done();
          });
      });
    });

    describe('when destination type is not MEETING or ROOM', () => {
      it('throws an error on subscription', (done) => {
        membershipSDKAdapter.getMembersFromDestination('roomID', 'team').subscribe(
          () => {},
          (error) => {
            expect(error.message).toBe('getMembersFromDestination for team is not currently supported.');
            done();
          },
        );
      });
    });
  });

  describe('addRoomMember()', () => {
    let roomID;
    let personID;

    beforeEach(() => {
      roomID = 'roomID';
      personID = 'personID';
    });
    afterEach(() => {
      roomID = null;
      personID = null;
    });

    test('returns an observable', (done) => {
      expect(isObservable(membershipSDKAdapter.addRoomMember(personID, roomID)))
        .toBeTruthy();
      done();
    });

    test('emits success when member is added to room', (done) => {
      membershipSDKAdapter.addRoomMember(personID, roomID).subscribe((membership) => {
        expect(membership).toEqual({
          ID: 'id',
          roomID: 'roomID',
          personID: 'personID',
          personOrgID: 'organizationID',
          personEmail: 'email@cisco.com',
          personDisplayName: 'Simon Damiano',
          isModerator: false,
          isMonitor: false,
          created: '',
        });
      });
      done();
    });

    test('emits error when sdk fails to add member to room', (done) => {
      const errorMsg = 'Error adding member to room';

      mockSDK.memberships.create = jest.fn(() => Promise.reject(new Error(errorMsg)));

      membershipSDKAdapter.addRoomMember(personID, roomID).subscribe(
        () => {},
        (error) => {
          expect(error.message).toBe(errorMsg);
          done();
        },
      );
    });
  });
});
