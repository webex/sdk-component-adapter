import {isObservable} from 'rxjs';

import RoomsSDKAdapter from './RoomsSDKAdapter';
import mockActivities from './mockActivities';
import createMockSDK, {mockSDKActivity, mockSDKRoom} from './mockSdk';

describe('Rooms SDK Adapter', () => {
  let mockSDK;
  let roomsSDKAdapter;
  const roomId = mockSDKRoom.id;

  beforeEach(() => {
    mockSDK = createMockSDK();
    mockSDK.internal.conversation.list = jest.fn(() => Promise.resolve([]));
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

  describe('create rooms ()', () => {
    test('returns an observable', (done) => {
      expect(isObservable(roomsSDKAdapter.createRoom())).toBeTruthy();
      done();
    });

    test('emits success response on room create', (done) => {
      roomsSDKAdapter.createRoom({title: 'mock-room'}).subscribe((roomData) => {
        expect(roomData).toEqual({
          id: 'Y2lzY29zcGFyazovL3VzL1JPT00vYmMyMjY2YjAtZDZjMy0xMWViLWFlZjUtNmQ3NzkwOGJmY2Ji',
          type: 'group',
          title: 'mock room',
        });
      });
      done();
    });

    test('throws error on creating room', (done) => {
      const errorMsg = 'error in creating room';

      mockSDK.rooms.create = jest.fn(() => Promise.reject(new Error(errorMsg)));
      roomsSDKAdapter.createRoom({title: 'mock-room'}).subscribe(
        () => {},
        (error) => {
          expect(error.message).toBe(errorMsg);
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

  describe('getPreviousActivities() functionality', () => {
    const getPreviousMock = jest.fn();

    beforeAll(() => {
      getPreviousMock
        .mockReturnValueOnce(mockActivities.slice(2))
        .mockReturnValueOnce(mockActivities.slice(4))
        .mockReturnValueOnce(null);
    });

    test('returns an observable', () => {
      expect(isObservable(roomsSDKAdapter.getPreviousActivities(roomId)))
        .toBeTruthy();
    });

    test('completes when all activities have been emitted', (done) => {
      let itemsCount = 0;

      mockSDK.internal.conversation.listActivities = getPreviousMock;
      roomsSDKAdapter = new RoomsSDKAdapter(mockSDK);

      roomsSDKAdapter.getPreviousActivities(roomId, 5).subscribe({
        next(activities) {
          itemsCount += activities.length;
        },
        complete() {
          expect(itemsCount).toBe(8);
          done();
        },
      });

      roomsSDKAdapter.hasMoreActivities(roomId); // 5
      roomsSDKAdapter.hasMoreActivities(roomId); // 3
      roomsSDKAdapter.hasMoreActivities(roomId); // no more
    });

    test('throws error if no room id is present', (done) => {
      roomsSDKAdapter.getPreviousActivities().subscribe({
        next() {},
        error(e) {
          expect(e).toEqual(new Error('getPreviousActivities - Must provide room ID'));
          done();
        },
      });
    });

    test('sets empty roomActivities if no room exists', () => {
      expect(roomsSDKAdapter.roomActivities.has('room-1')).toBe(false);
      roomsSDKAdapter.getPreviousActivities('room-1');
      expect(roomsSDKAdapter.roomActivities.has('room-1')).toBe(true);
      expect(roomsSDKAdapter.roomActivities.get('room-1')).toStrictEqual({
        activities: new Map(),
        earliestActivityDate: null,
        activityIds: new Map(),
      });
    });
  });

  afterEach(() => {
    roomsSDKAdapter = null;
  });
});
