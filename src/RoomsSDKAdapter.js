import {
  Subject,
  concat,
  from,
  fromEvent,
  BehaviorSubject,
  Observable,
  throwError,
} from 'rxjs';
import {
  filter,
  finalize,
  flatMap,
  publishReplay,
  refCount,
  tap,
} from 'rxjs/operators';
import {RoomsAdapter} from '@webex/component-adapter-interfaces';
import {deconstructHydraId} from '@webex/common';
import logger from './logger';

// TODO: Figure out how to import JS Doc definitions and remove duplication.
/**
 * A virtual space where people can collaborate in Webex.
 *
 * @external Room
 * @see {@link https://github.com/webex/component-adapter-interfaces/blob/master/src/RoomsAdapter.js#L7}
 */

export const ROOM_UPDATED_EVENT = 'updated';
export const CONVERSATION_ACTIVITY_EVENT = 'event:conversation.activity';

const sortByPublished = (arr) => arr.sort((a, b) => new Date(b.published) - new Date(a.published));

// TODO: Need to remove this once we figure out why we need to pre-cache conversations
let FETCHED_CONVERSATIONS = false;

/**
 * The `RoomsSDKAdapter` is an implementation of the `RoomsAdapter` interface.
 * This adapter utilizes the Webex JS SDK to fetch data about a room.
 *
 * @implements {RoomsAdapter}
 */
export default class RoomsSDKAdapter extends RoomsAdapter {
  constructor(datasource) {
    super(datasource);

    this.getRoomObservables = {};
    this.getRoomActivitiesCache = {};
    this.listenerCount = 0;

    this.activityLimit = 50;
    this.activitiesObservableCache = new Map();
    this.roomActivities = new Map();
  }

  /**
   * Fetches the room data from the sdk and returns in the shape required by adapter.
   *
   * @private
   * @param {string} ID ID of the room for which to fetch data
   * @returns {Room} Information about the room of the given ID
   */
  async fetchRoom(ID) {
    const {
      id,
      title,
      type,
      lastActivity,
    } = await this.datasource.rooms.get(ID);

    return {
      ID: id,
      title,
      type,
      lastActivity,
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
   */
  startListeningToRoomUpdates() {
    if (this.listenerCount === 0) {
      // Tell the sdk to start listening to room changes
      this.datasource.rooms.listen();
    }
    this.listenerCount += 1;
  }

  /**
   * Tells the SDK to stop listening to room events.
   *
   * Note: Since the SDK listens to ALL room events, this function only
   * calls the SDK's `rooms.stopListening` function once all of the listeners are done.
   * If `rooms.stopListening` is called early, existing subscribers won't get any updates.
   *
   * @private
   */
  stopListeningToRoomUpdates() {
    this.listenerCount -= 1;

    if (this.listenerCount <= 0) {
      // Once all listeners are done, stop listening
      this.datasource.rooms.stopListening();
    }
  }

  /**
   * Returns an observable that emits room data of the given ID.
   *
   * @param {string} ID ID of room to get
   * @returns {external:Observable.<Room>} Observable stream that emits room data of the given ID
   */
  getRoom(ID) {
    logger.debug('ROOM', ID, 'getRoom()', ['called with', {ID}]);
    if (!(ID in this.getRoomObservables)) {
      this.startListeningToRoomUpdates();

      const room$ = from(this.fetchRoom(ID));

      // subscribes to room update events emitted via websocket and emits the updated room object.
      const roomUpdate$ = fromEvent(this.datasource.rooms, ROOM_UPDATED_EVENT).pipe(
        // Is the room change event for our subscribed room?
        filter((event) => event.data.id === ID),
        // Event data doesn't have the room data in it, so we need to fetch manually
        flatMap(() => from(this.fetchRoom(ID))),
      );

      // The observable flow for fetching room data, then listening for websocket events about room changes.
      const getRoom$ = concat(
        // Fetch Our Room Data
        room$,
        roomUpdate$,
      ).pipe(
        tap((room) => logger.debug('ROOM', ID, 'getRoom()', ['emitting room object', room])),
        finalize(() => {
          // Called once all subscriptions to `ID` are done.
          this.stopListeningToRoomUpdates();
          delete this.getRoomObservables[ID];
        }),
      );

      // Convert to a multicast observable
      this.getRoomObservables[ID] = getRoom$.pipe(
        publishReplay(1),
        refCount(),
      );
    }

    return this.getRoomObservables[ID];
  }

  /**
   * Creates a room and returns room id
   *
   * @param {string} title title of the room to be created
   * @returns {Observable.<Room>} Observable that emits created room data
   */
  createRoom(title) {
    return new Observable(async (observer) => {
      try {
        const roomsData = await this.datasource.rooms.create({title});

        observer.next(roomsData);
        observer.complete();
      } catch (err) {
        observer.error(new Error('error in creating room'));
      }
    });
  }

  /*
   * Returns an array of IDs of the most recent activities in a conversation up to the specified limit.
   *
   * @param {string} ID ID for the room
   * @param {string} earliestActivityDate  Get all child activities before this date
   * @returns {Promise} Resolves with array of activities
   * @private
   */
  async fetchActivities(ID, earliestActivityDate) {
    const {activityLimit} = this;
    const conversationId = deconstructHydraId(ID).id;

    logger.debug('ROOM', ID, 'fetchActivities()', ['called with', {
      earliestActivityDate,
      activityLimit,
    }]);

    if (!FETCHED_CONVERSATIONS) {
      await this.datasource.internal.conversation.list();
      FETCHED_CONVERSATIONS = true;
    }

    return this.datasource.internal.conversation.listActivities({
      conversationId,
      limit: activityLimit + 1, // Fetch one extra activity to determine if there are more activities to fetch later
      lastActivityFirst: true,
      maxDate: earliestActivityDate === null ? undefined : earliestActivityDate,
    });
  }

  /**
   * Returns `true` if there are more activities to load from the room of the given ID.
   * Otherwise, it returns `false`.
   *
   * @param {string} ID ID of the room for which to verify activities.
   * @returns {boolean} `true` if room has more activities to load, `false` otherwise
   */
  hasMoreActivities(ID) {
    const pastActivities$Cache = this.activitiesObservableCache.get(ID);
    const {
      hasMore = true,
    } = this.roomActivities.get(ID);

    if (!hasMore) {
      pastActivities$Cache.complete();
    } else {
      this.fetchPastActivities(ID);
    }

    return hasMore;
  }

  /**
   * Fetches past activities and returns array of (id, published) objects. Performs side effects
   *
   * @param {string} ID The id of the room
   * @returns null
   */
  fetchPastActivities(ID) {
    const roomActivity = this.roomActivities.get(ID);
    const {earliestActivityDate} = roomActivity;
    const room$ = this.activitiesObservableCache.get(ID);

    logger.debug('ROOM', ID, 'fetchPastActivities()', ['called with', {
      earliestActivityDate,
    }]);

    if (!ID) {
      logger.error('ROOM', ID, 'fetchPastActivities()', ['Must provide room ID']);
      room$.error(new Error('fetchPastActivities - Must provide room ID'));
    }

    from(this.fetchActivities(ID, earliestActivityDate))
      .subscribe((data) => {
        if (!data) {
          return room$.complete();
        }
        roomActivity.hasMore = data.length >= this.activityLimit + 1;
        const {published} = data.shift();
        const activityIds = sortByPublished(data).map((activity) => {
          const {id} = activity;

          roomActivity.activities.set(id, activity);

          return [id, activity.published];
        });

        roomActivity.earliestActivityDate = published;
        roomActivity.activityIds.set(published, activityIds.length);

        this.roomActivities.set(ID, roomActivity);

        return room$.next(activityIds);
      });
  }

  /**
   * Returns an observable that emits an array of the next chunk of previous
   * activity data of the given roomID. If `hasMoreActivities` returns false,
   * the observable will complete.
   * **Previous activity data must be sorted newest-to-oldest.**
   *
   * @param {string} ID  ID of the room for which to get activities.
   * @param {number} activityLimit The maximum number of activities to return
   * @returns {external:Observable.<Room>} Observable stream that emits activity data
   */
  getPreviousActivities(ID, activityLimit = 50) {
    this.activityLimit = activityLimit;
    const pastActivities$Cache = this.activitiesObservableCache.get(ID) || new Subject();

    if (!ID) {
      logger.error('ROOM', ID, 'getPreviousActivities()', ['Must provide room ID']);

      return throwError(new Error('getPreviousActivities - Must provide room ID'));
    }

    if (!this.roomActivities.has(ID)) {
      this.roomActivities.set(ID, {
        earliestActivityDate: null,
        activities: new Map(),
        activityIds: new Map(),
      });
    }

    this.activitiesObservableCache.set(ID, pastActivities$Cache);

    return pastActivities$Cache;
  }

  /**
   * Returns an observable that emits current and future activities from the specified room.
   *
   * @param {string} ID ID of room to get
   * @returns {Observable.<Activity>} Observable stream that emits current and future activities from the specified room
   */
  getRoomActivities(ID) {
    logger.debug('ROOM', ID, 'getRoomActivities()', ['called with', {ID}]);
    if (!(ID in this.getRoomActivitiesCache)) {
      const getRoomActivities$ = new BehaviorSubject({});

      this.datasource.internal.mercury.on('event:conversation.activity', (sdkActivity) => {
        const {id: UUID} = deconstructHydraId(ID);

        if (sdkActivity.target && sdkActivity.target.id === UUID) {
          logger.debug('ROOM', ID, 'getRoomActivities()', ['received "event:conversation.activity" event', {sdkActivity}]);

          const activity = {
            ID: sdkActivity.id,
            roomID: sdkActivity.target.id,
            content: sdkActivity.object,
            contentType: sdkActivity.object.objectType,
            personID: sdkActivity.actor.id,
            displayAuthor: false,
            created: sdkActivity.published,
          };

          getRoomActivities$.next(activity);

          logger.info('ROOM', ID, 'getRoomActivities()', ['emitting activity object', {activity}]);
        }
      });

      this.getRoomActivitiesCache[ID] = getRoomActivities$;
    }

    return this.getRoomActivitiesCache[ID];
  }
}
