import {isObservable} from 'rxjs';

import RoomsSDKAdapter, {ROOM_UPDATED_EVENT} from './RoomsSDKAdapter';
import createMockSDK from './__mocks__/sdk';

describe('Rooms SDK Adapter', () => {
  let roomsSDKAdapter;
  let mockSDK, mockSDKRoom;

  beforeEach(() => {
    mockSDK = createMockSDK();
    roomsSDKAdapter = new RoomsSDKAdapter(mockSDK);

    mockSDKRoom = {
      id: 'abc',
      type: 'group',
      title: 'mock room',
    };
  });

  describe('getRoom() functionality', () => {
    test('returns an observable', () => {
      expect(isObservable(roomsSDKAdapter.getRoom())).toBeTruthy();
    });

    test('returns a room in a proper shape', (done) => {
      mockSDK.rooms.get = jest.fn(() => Promise.resolve(mockSDKRoom));

      roomsSDKAdapter.getRoom('id').subscribe((room) => {
        expect(room).toEqual(
          expect.objectContaining({
            ID: mockSDKRoom.id,
            type: mockSDKRoom.type,
            title: mockSDKRoom.title,
          })
        );
        done();
      });
    });

    test('listens to room events when subscribing', (done) => {
      mockSDK.rooms.get = jest.fn(() => Promise.resolve(mockSDKRoom));

      roomsSDKAdapter.getRoom('id').subscribe(() => {
        expect(mockSDK.rooms.on).toHaveBeenCalledWith(ROOM_UPDATED_EVENT, expect.any(Function));
        done();
      });
    });

    test('stops listening to events when unsubscribing', () => {
      mockSDK.rooms.get = jest.fn(() => Promise.resolve(mockSDKRoom));

      const subscription = roomsSDKAdapter.getRoom('id').subscribe();

      subscription.unsubscribe();
      expect(mockSDK.rooms.off).toHaveBeenCalledWith(ROOM_UPDATED_EVENT);
    });

    test('throws a proper error message', (done) => {
      const errorMessage = 'a proper error message';

      mockSDK.rooms.get = jest.fn(() => Promise.reject(new Error(errorMessage)));

      roomsSDKAdapter.getRoom('id').subscribe(
        () => {},
        (error) => {
          expect(error.message).toBe(errorMessage);
          done();
        }
      );
    });
  });

  afterEach(() => {
    roomsSDKAdapter = null;
  });
});
