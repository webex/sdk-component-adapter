import {
  concat,
  defer,
  fromEvent,
  of,
} from 'rxjs';
import {
  catchError,
  flatMap,
  filter,
  finalize,
  map,
  publishReplay,
  refCount,
  tap,
} from 'rxjs/operators';
import {deconstructHydraId} from '@webex/common';
import {PeopleAdapter, PersonStatus} from '@webex/component-adapter-interfaces';
import logger from './logger';

// TODO: Figure out how to import JS Doc definitions and remove duplication.
/**
 * A Webex user.
 *
 * @external Person
 * @see {@link https://github.com/webex/component-adapter-interfaces/blob/master/src/PeopleAdapter.js#L6}
 */

const USER_PRESENCE_UPDATE_EVENT = 'event:apheleia.subscription_update';

/**
 * Returns a PersonStatus enum key from the given value.
 * If status does not match an enum key, it returns null.
 *
 * @private
 * @param {string} status Person status from Apheleia service.
 * @returns {string} PersonStatus
 */
function getStatus(status) {
  const personStatus = Object.keys(PersonStatus).find((key) => PersonStatus[key] === status);

  return personStatus === undefined ? null : personStatus;
}

/**
 * Maps SDK People to adapter people
 *
 * @private
 * @param {object} sdkPeople  SDK people object
 * @returns {Person} Adapter person object
 */
function fromSDKPeople(sdkPeople) {
  const {items} = sdkPeople;

  return items.map((item) => ({
    ID: item.id,
    emails: item.emails,
    displayName: item.displayName,
    firstName: item.firstName,
    lastName: item.lastName,
    nickName: item.nickName,
    avatar: item.avatar,
    orgID: item.orgId,
    status: item.status,
  }));
}

/**
 * The `PeopleSDKAdapter` is an implementation of the `PeopleAdapter` interface.
 * This adapter utilizes the Webex JS SDK to fetch data about a person.
 *
 * @implements {PeopleAdapter}
 */
export default class PeopleSDKAdapter extends PeopleAdapter {
  constructor(datasource) {
    super(datasource);

    this.getPersonObservables = {};
  }

  /**
   * Fetches the person data from the sdk and returns in the shape required by adapter.
   *
   * @private
   * @param {string} ID ID of the person for which to fetch data
   * @returns {Person} Info about the person of the given ID
   */
  async fetchPerson(ID) {
    const {
      id,
      emails,
      displayName,
      firstName,
      lastName,
      avatar,
      orgId,
    } = await this.datasource.people.get(ID);

    logger.debug('PEOPLE', ID, 'fetchPerson()', ['called with', {ID}]);

    return {
      ID: id,
      emails,
      displayName,
      firstName,
      lastName,
      avatar,
      orgID: orgId,
    };
  }

  /**
   * Returns an observable that emits person data of the access token bearer.
   * The observable will emit once and then complete.
   *
   * @returns {external:Observable.<Person>} Observable stream that emits person data of the current user
   */
  getMe() {
    logger.debug('PEOPLE', undefined, 'getMe()', 'called');

    // Get person data of the current access token bearer
    return defer(() => this.fetchPerson('me')).pipe(
      // Get person status information from presence plug-in
      flatMap((person) => defer(
        () => this.datasource.internal.presence.get([person.id]),
      ).pipe(
        // When SDK throws error, don't set a status
        catchError(() => of({status: null})),
        // Combine person data and presence data to send back
        map(({status}) => ({...person, status: getStatus(status)})),
      )),
    );
  }

  /**
   * Returns an observable that emits person data of the given ID.
   *
   * @param {string} ID ID of person to get
   * @returns {external:Observable.<Person>} Observable stream that emits person data of the given ID
   */
  getPerson(ID) {
    logger.debug('PEOPLE', ID, 'getPerson()', ['called with', {ID}]);
    if (!(ID in this.getPersonObservables)) {
      const personUUID = deconstructHydraId(ID).id;
      const person$ = defer(() => this.fetchPerson(ID));

      // Subscribe to 'Apheleia' internal service to listen for status changes
      // Update the Person object with status response from the subscription
      const personWithStatus$ = defer(
        () => this.datasource.internal.presence.subscribe(personUUID),
      ).pipe(
        map((data) => data.responses[0].status.status), // This returns only the status data from subscription
        catchError(() => of(null)), // If subscription fails, don't set a status
        flatMap((status) => person$.pipe(
          map((person) => ({...person, status: getStatus(status)})),
        )),
      );

      // Listen for status changes for the given person ID after subscription to service
      const statusUpdate$ = fromEvent(
        this.datasource.internal.mercury,
        USER_PRESENCE_UPDATE_EVENT,
      ).pipe(
        tap(() => {
          logger.debug(
            'PEOPLE', ID, 'getPerson', ['received', USER_PRESENCE_UPDATE_EVENT, 'event'],
          );
        }),
        filter((event) => event.data.subject === personUUID),
        map((event) => getStatus(event.data.status)),
      );

      // Update the person status after each change emitted from the event
      const personUpdate$ = person$.pipe(
        flatMap((person) => statusUpdate$.pipe(map((status) => ({...person, status})))),
        tap((person) => {
          logger.debug('PEOPLE', ID, 'getPerson()', ['person update', {person}]);
        }),
      );

      // Emit initial person data on the first run and send updates after each status change
      const getPerson$ = concat(personWithStatus$, personUpdate$).pipe(
        tap((person) => {
          logger.debug('PEOPLE', ID, 'getPerson()', ['emit initial person', {person}]);
        }),
        finalize(async () => {
          try {
            logger.debug('PEOPLE', ID, 'getPerson()', ['unsubscribing from internal service', {personUUID}]);
            // Unsubscribe from `Apheleia` internal service when there are no more subscriptions
            await this.datasource.internal.presence.unsubscribe(personUUID);
          } catch (error) {
            // Don't do anything when unsubscribing fails
            // Trying to remove a subscription fails when the user has presence turned off
            logger.warn('Unsubscribing failed, user has presence turned off');
          }

          delete this.getPersonObservables[ID];
        }),
      );

      // Store observable for future subscriptions
      this.getPersonObservables[ID] = getPerson$.pipe(
        publishReplay(1),
        refCount(),
      );
    }

    return this.getPersonObservables[ID];
  }

  /**
   * Returns an observable that emits a list of people that match the given query.
   * An empty array is returned when there are no matches.
   *
   * @param {string} query Search query
   * @returns {external:Observable.<Person[]>} Observable that emits person list based on search query
   */
  searchPeople(query) {
    logger.debug('PEOPLE', undefined, 'searchPeople()', ['called with', {query}]);

    return defer(() => this.datasource.people.list({displayName: query}))
      .pipe(
        map(fromSDKPeople),
        tap((peopleList) => logger.debug('PEOPLE', undefined, 'searchPeople()', ['emit persons list', peopleList])),
        catchError((error) => {
          logger.error('PEOPLE', undefined, 'searchPeople()', 'error fetching person list', error);
          throw error;
        }),
      );
  }
}
