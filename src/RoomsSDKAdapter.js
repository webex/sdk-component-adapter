import {
  Subject,
  concat,
  from,
  fromEvent,
  Observable,
  throwError,
  ReplaySubject,
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
import {fromSDKActivity} from './ActivitiesSDKAdapter';
import logger from './logger';
import cache from './cache';

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
    this.getActivitiesInRealTimeCache = {};
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

    logger.debug('ROOM', ID, 'fetchActivities()', ['called with', earliestActivityDate, activityLimit]);

    if (!FETCHED_CONVERSATIONS) {
      const convos = await this.datasource.internal.conversation.list();

      FETCHED_CONVERSATIONS = true;
      cache.cacheConversations(convos);
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
   * @private
   * @param {string} ID The id of the room
   * @returns null
   */
  fetchPastActivities(ID) {
    const roomActivity = this.roomActivities.get(ID);
    const {earliestActivityDate} = roomActivity;
    const room$ = this.activitiesObservableCache.get(ID);

    logger.debug('ROOM', ID, 'fetchPastActivities()', ['called with', earliestActivityDate]);

    if (!ID) {
      logger.error('ROOM', ID, 'fetchPastActivities()', ['Must provide room ID']);
      room$.error(new Error('fetchPastActivities - Must provide room ID'));
    }

    from(this.fetchActivities(ID, earliestActivityDate))
      .subscribe((data) => {
        if (!data) {
          return room$.complete();
        }
        cache.cachActivities(data);
        roomActivity.hasMore = data.length >= this.activityLimit + 1;
        const {published} = data.shift();
        const activityIds = sortByPublished(data).map((sdkActivity) => {
          const activity = fromSDKActivity(sdkActivity);

          roomActivity.activities.set(activity.ID, activity);

          return activity.ID;
        });

        roomActivity.earliestActivityDate = published;
        roomActivity.activityIds.set(published, activityIds.length);

        this.roomActivities.set(ID, roomActivity);

        return room$.next(activityIds);
      });
  }

  /**
   * Returns an observable that emits an array of the next chunk of past
   * activity data of the given roomID. If `hasMoreActivities` returns false,
   * the observable will complete.
   * **Past activity data must be sorted newest-to-oldest.**
   *
   * @param {string} ID  ID of the room for which to get activities.
   * @param {number} activityLimit The maximum number of activities to return
   * @returns {external:Observable.<Room>} Observable stream that emits activity data
   */
  getPastActivities(ID, activityLimit = 50) {
    this.activityLimit = activityLimit;
    const pastActivities$Cache = this.activitiesObservableCache.get(ID) || new Subject();

    if (!ID) {
      logger.error('ROOM', ID, 'getPastActivities()', ['Must provide room ID']);

      return throwError(new Error('getPastActivities - Must provide room ID'));
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
  getActivitiesInRealTime(ID) {
    logger.debug('ROOM', ID, 'getActivitiesInRealTime()', ['called with', {ID}]);

    if (!ID) {
      logger.error('ROOM', ID, 'getPastActivities()', ['Must provide room ID']);

      return throwError(new Error('getPastActivities - Must provide room ID'));
    }

    if (!(ID in this.getActivitiesInRealTimeCache)) {
      const getActivitiesInRealTime$ = new ReplaySubject();

      this.datasource.internal.mercury.on('event:conversation.activity', ({data}) => {
        const {activity} = data;
        const {id: UUID} = deconstructHydraId(ID);

        if (activity.target && activity.target.id === UUID) {
          logger.debug('ROOM', ID, 'getActivitiesInRealTime()', ['received "event:conversation.activity" event', {activity}]);

          getActivitiesInRealTime$.next(fromSDKActivity(activity).ID);

          logger.info('ROOM', ID, 'getActivitiesInRealTime()', ['emitting activity object', {activity}]);
        }
      });

      this.getActivitiesInRealTimeCache[ID] = getActivitiesInRealTime$;
    }

    return this.getActivitiesInRealTimeCache[ID];
  }
}
