import {isObservable} from 'rxjs';
import {DestinationType} from '@webex/component-adapter-interfaces';

import MembershipsSDKAdapter from './MembershipsSDKAdapter';
import createMockSDK from './__mocks__/sdk';

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
      test('emits a membership object on subscription', (done) => {
        membershipSDKAdapter.getMembersFromDestination(meetingID, DestinationType.MEETING)
          .subscribe((membership) => {
            expect(membership).toMatchObject({
              ID: 'meeting-meetingID',
              destinationID: meetingID,
              destinationType: DestinationType.MEETING,
              members: [
                {
                  id: 'id',
                },
              ],
            });
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
