import {isObservable} from 'rxjs';
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
              },
              {
                id: 'mutedPerson',
                muted: true,
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
      test('throws an error on subscription', (done) => {
        membershipSDKAdapter.getMembersFromDestination('roomID', DestinationType.ROOM).subscribe(
          () => {},
          (error) => {
            expect(error.message).toBe('getMembersFromDestination for room is not currently supported.');
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
