import {isObservable} from 'rxjs';
import * as rxjs from 'rxjs';
import {DestinationType} from '@webex/component-adapter-interfaces';

import MembershipsSDKAdapter from './MembershipsSDKAdapter';
import createMockSDK from './mockSdk';

describe('Memberships SDK Adapter', () => {
  let meetingID;
  let membershipSDKAdapter;
  let mockSDK;

  beforeEach(() => {
    mockSDK = createMockSDK();
    membershipSDKAdapter = new MembershipsSDKAdapter(mockSDK);
    meetingID = 'meetingID';
  });

  describe('getMembersFromDestination()', () => {
    test('returns an observable', () => {
      expect(isObservable(membershipSDKAdapter.getMembersFromDestination())).toBeTruthy();
    });

    describe('when destination type is MEETING', () => {
      test('emits a member list on subscription', (done) => {
        membershipSDKAdapter.getMembersFromDestination(meetingID, DestinationType.MEETING)
          .subscribe((members) => {
            expect(members).toMatchObject([
              {
                id: 'id',
                muted: false,
                sharing: false,
              },
              {
                id: 'mutedPerson',
                muted: true,
                sharing: true,
              },
              {
                id: 'notJoinedPerson',
                inMeeting: false,
                muted: false,
              },
            ]);
            done();
          });
      });

      test('throws an error on invalid meeting ID', (done) => {
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
      beforeEach(() => {
        rxjs.fromEvent = jest.fn(() => rxjs.of({
          data: {
            roomId: 'roomID',
          },
        }));
      });

      afterEach(() => {
        rxjs.fromEvent = null;
      });

      test('emits a member list on subscription', (done) => {
        membershipSDKAdapter.getMembersFromDestination(meetingID, DestinationType.ROOM)
          .subscribe((members) => {
            expect(members).toMatchObject([
              {
                id: 'personID',
                orgID: 'organizationID',
                muted: null,
                sharing: null,
                inMeeting: null,
              },
              {
                id: 'personID1',
                orgID: 'organizationID1',
                muted: null,
                sharing: null,
                inMeeting: null,
              },
            ]);
            done();
          });
      });
    });

    describe('when destination type is not MEETING or ROOM', () => {
      test('throws an error on subscription', (done) => {
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

  afterEach(() => {
    mockSDK = null;
    membershipSDKAdapter = null;
    meetingID = null;
  });
});
