import {concat, from, fromEvent} from 'rxjs';
import {filter, finalize, flatMap, publishReplay, refCount} from 'rxjs/operators';
import {RoomsAdapter} from '@webex/component-adapter-interfaces';

export const ROOM_UPDATED_EVENT = 'updated';

/**
 * The `RoomsSDKAdapter` is an implementation of the `RoomsAdapter` interface.
 * This adapter utilizes the Webex JS SDK to fetch data about a room.
 *
 * @export
 * @class RoomsSDKAdapter
 * @extends {RoomsAdapter}
 */
export default class RoomsSDKAdapter extends RoomsAdapter {
  constructor(datasource) {
    super(datasource);

    this.getRoomObservables = {};
    this.listenerCount = 0;
  }

  /**
   * Fetches the room data from the sdk and returns in the shape required by adapter.
   *
   * @private
   * @param {string} ID ID of the room for which to fetch data
   * @returns {Room}
   * @memberof RoomsSDKAdapter
   */
  async fetchRoom(ID) {
    const {id, title, type} = await this.datasource.rooms.get(ID);

    return {
      ID: id,
      title,
      type,
    };
  }

  /**
   * Tells the SDK to start listening to room events and tracks the amount of calls.
   *
   * Note: Since the SDK listens to ALL room events, this function only
   * calls the SDK's `rooms.listen` function on the first room to listen.
   * Repeated calls to `rooms.listen` are not needed afterwards.
   *
   * @private
   * @memberof RoomsSDKAdapter
   */
  startListeningToRoomUpdates() {
    if (this.listenerCount === 0) {
      // Tell the sdk to start listening to room changes
      this.datasource.rooms.listen();
    }
    this.listenerCount = this.listenerCount + 1;
  }

  /**
   * Tells the SDK to stop listening to room events.
   *
   * Note: Since the SDK listens to ALL room events, this function only
   * calls the SDK's `rooms.stopListening` function once all of the listeners are done.
   * If `rooms.stopListening` is called early, existing subscribers won't get any updates.
   *
   * @private
   * @memberof RoomsSDKAdapter
   */
  stopListeningToRoomUpdates() {
    this.listenerCount = this.listenerCount - 1;

    if (this.listenerCount <= 0) {
      // Once all listeners are done, stop listening
      this.datasource.rooms.stopListening();
    }
  }

  /**
   * Returns an observable that emits room data of the given ID.
   *
   * @public
   * @param {string} ID ID of room to get
   * @returns {Observable.<Room>}
   * @memberof RoomsSDKAdapter
   */
  getRoom(ID) {
    if (!(ID in this.getRoomObservables)) {
      this.startListeningToRoomUpdates();

      const room$ = from(this.fetchRoom(ID));

      // subscribes to room update events emitted via websocket and emits the updated room object.
      const roomUpdate$ = fromEvent(this.datasource.rooms, ROOM_UPDATED_EVENT).pipe(
        // Is the room change event for our subscribed room?
        filter((event) => event.data.id === ID),
        // Event data doesn't have the room data in it, so we need to fetch manually
        flatMap(() => room$)
      );

      // The observable flow for fetching room data, then listening for websocket events about room changes.
      const getRoom$ = concat(
        // Fetch Our Room Data
        room$,
        roomUpdate$
      ).pipe(
        finalize(() => {
          // Called once all subscriptions to `ID` are done.
          this.stopListeningToRoomUpdates();
          delete this.getRoomObservables[ID];
        })
      );

      // Convert to a multicast observable
      this.getRoomObservables[ID] = getRoom$.pipe(
        publishReplay(1),
        refCount()
      );
    }

    return this.getRoomObservables[ID];
  }
}
