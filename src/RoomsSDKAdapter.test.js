import {isObservable} from 'rxjs';

import RoomsSDKAdapter, {sortByPublished} from './RoomsSDKAdapter';
import mockActivities from './mockActivities';
import createMockSDK, {mockSDKActivity, mockSDKRoom} from './mockSdk';
import {fromSDKActivity} from './ActivitiesSDKAdapter';

describe('Rooms SDK Adapter', () => {
  let mockSDK;
  let roomsSDKAdapter;
  const roomId = mockSDKRoom.id;

  beforeEach(() => {
    mockSDK = createMockSDK();
    mockSDK.internal.conversation.list = jest.fn(() => Promise.resolve([]));
    mockSDK.internal.mercury.on = jest.fn((event, callback) => callback({
      data: {activity: mockSDKActivity},
    }));
    roomsSDKAdapter = new RoomsSDKAdapter(mockSDK);
  });

  describe('sortByPublished', () => {
    it('should sort oldest to newest', () => {
      const input = [
        {published: '2021-06-22T00:00:00.007Z'},
        {published: '2021-06-25T00:00:00.007Z'},
        {published: '2021-06-24T00:00:00.007Z'},
        {published: '2021-06-21T00:00:00.007Z'},
      ];

      const output = [
        {published: '2021-06-21T00:00:00.007Z'},
        {published: '2021-06-22T00:00:00.007Z'},
        {published: '2021-06-24T00:00:00.007Z'},
        {published: '2021-06-25T00:00:00.007Z'},
      ];

      expect(sortByPublished(input)).toStrictEqual(output);
    });
  });

  describe('getRoom() functionality', () => {
    it('returns an observable', () => {
      expect(isObservable(roomsSDKAdapter.getRoom())).toBeTruthy();
    });

    it('returns a room in a proper shape', (done) => {
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

    it('listens to room events when subscribing', (done) => {
      roomsSDKAdapter.getRoom('id').subscribe(() => {
        expect(mockSDK.rooms.listen).toHaveBeenCalled();
        done();
      });
    });

    it('stops listening to events when unsubscribing', () => {
      const subscription = roomsSDKAdapter.getRoom('id').subscribe();

      subscription.unsubscribe();
      expect(mockSDK.rooms.stopListening).toHaveBeenCalled();
    });

    it('throws a proper error message', (done) => {
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

  describe('createRoom()', () => {
    test('returns an observable', () => {
      expect(isObservable(roomsSDKAdapter.createRoom())).toBeTruthy();
    });
    test('returns a room in a proper shape', (done) => {
      roomsSDKAdapter.createRoom(mockSDKRoom).subscribe((room) => {
        expect(room).toEqual({
          ID: mockSDKRoom.id,
          type: mockSDKRoom.type,
          title: mockSDKRoom.title,
        });
        done();
      });
    });
    test('throws a proper error message', (done) => {
      const errorMessage = 'a proper error message';

      mockSDK.rooms.create = jest.fn(() => Promise.reject(new Error(errorMessage)));

      roomsSDKAdapter.createRoom(mockSDKRoom).subscribe(
        () => {},
        (error) => {
          expect(error.message).toBe(errorMessage);
          done();
        },
      );
    });
  });

  describe('getActivitiesInRealTime()', () => {
    it('returns an observable', () => {
      expect(isObservable(roomsSDKAdapter.getActivitiesInRealTime())).toBeTruthy();
    });

    it('returns a activity in a proper shape', (done) => {
      roomsSDKAdapter.getActivitiesInRealTime(mockSDKActivity.target.id).subscribe((activity) => {
        expect(activity).toEqual(fromSDKActivity(mockSDKActivity).ID);
        done();
      });
    });
  });

  describe('getPastActivities() functionality', () => {
    const getPreviousMock = jest.fn();

    beforeAll(() => {
      getPreviousMock
        .mockReturnValueOnce(mockActivities.slice(2))
        .mockReturnValueOnce(mockActivities.slice(4))
        .mockReturnValueOnce(null);
    });

    it('returns an observable', () => {
      expect(isObservable(roomsSDKAdapter.getPastActivities(roomId)))
        .toBeTruthy();
    });

    it('completes when all activities have been emitted', (done) => {
      let itemsCount = 0;

      mockSDK.internal.conversation.listActivities = getPreviousMock;
      roomsSDKAdapter = new RoomsSDKAdapter(mockSDK);

      roomsSDKAdapter.getPastActivities(roomId, 5).subscribe({
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

    it('throws error if no room id is present', (done) => {
      roomsSDKAdapter.getPastActivities().subscribe({
        next() {},
        error(e) {
          expect(e).toEqual(new Error('getPastActivities - Must provide room ID'));
          done();
        },
      });
    });

    it('sets empty roomActivities if no room exists', () => {
      expect(roomsSDKAdapter.roomActivities.has('room-1')).toBe(false);
      roomsSDKAdapter.getPastActivities('room-1');
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
