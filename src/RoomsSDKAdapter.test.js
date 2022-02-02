import {isObservable} from 'rxjs';

import RoomsSDKAdapter from './RoomsSDKAdapter';
import createMockSDK, {mockSDKActivity, mockSDKRoom} from './mockSdk';

describe('Rooms SDK Adapter', () => {
  let mockSDK;
  let roomsSDKAdapter;

  beforeEach(() => {
    mockSDK = createMockSDK();
    roomsSDKAdapter = new RoomsSDKAdapter(mockSDK);
  });

  describe('getRoom() functionality', () => {
    test('returns an observable', () => {
      expect(isObservable(roomsSDKAdapter.getRoom())).toBeTruthy();
    });

    test('returns a room in a proper shape', (done) => {
      roomsSDKAdapter.getRoom('id').subscribe((room) => {
        expect(room).toEqual(
          expect.objectContaining({
            ID: mockSDKRoom.id,
            type: mockSDKRoom.type,
            title: mockSDKRoom.title,
          }),
        );
        done();
      });
    });

    test('listens to room events when subscribing', (done) => {
      roomsSDKAdapter.getRoom('id').subscribe(() => {
        expect(mockSDK.rooms.listen).toHaveBeenCalled();
        done();
      });
    });

    test('stops listening to events when unsubscribing', () => {
      const subscription = roomsSDKAdapter.getRoom('id').subscribe();

      subscription.unsubscribe();
      expect(mockSDK.rooms.stopListening).toHaveBeenCalled();
    });

    test('throws a proper error message', (done) => {
      const errorMessage = 'a proper error message';

      mockSDK.rooms.get = jest.fn(() => Promise.reject(new Error(errorMessage)));

      roomsSDKAdapter.getRoom('id').subscribe(
        () => {},
        (error) => {
          expect(error.message).toBe(errorMessage);
          done();
        },
      );
    });
  });

  describe('getRoomActivities()', () => {
    test('returns an observable', () => {
      expect(isObservable(roomsSDKAdapter.getRoomActivities())).toBeTruthy();
    });

    test('returns a activity in a proper shape', (done) => {
      mockSDK.internal.mercury.on = jest.fn((event, callback) => callback(mockSDKActivity));

      roomsSDKAdapter.getRoomActivities(mockSDKActivity.target.id).subscribe((activity) => {
        expect(activity).toEqual({
          ID: mockSDKActivity.id,
          roomID: mockSDKActivity.target.id,
          content: mockSDKActivity.object,
          contentType: mockSDKActivity.object.objectType,
          personID: mockSDKActivity.actor.id,
          displayAuthor: false,
          created: mockSDKActivity.published,
        });
        done();
      });
    });
  });

  afterEach(() => {
    roomsSDKAdapter = null;
  });
});
