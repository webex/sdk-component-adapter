import {concat, defer, from, fromEvent, of} from 'rxjs';
import {catchError, flatMap, filter, finalize, map, publishReplay, refCount} from 'rxjs/operators';
import {deconstructHydraId} from '@webex/common';
import {PeopleAdapter, PersonStatus} from '@webex/component-adapter-interfaces';

const USER_PRESENCE_UPDATE_EVENT = 'event:apheleia.subscription_update';

/**
 * The `PeopleSDKAdapter` is an implementation of the `PeopleAdapter` interface.
 * This adapter utilizes the Webex JS SDK to fetch data about a person.
 *
 * @class PeopleSDKAdapter
 * @extends {PeopleAdapter}
 */
export default class PeopleSDKAdapter extends PeopleAdapter {
  constructor(datasource) {
    super(datasource);

    this.getPersonObservables = {};
  }

  /**
   * Returns a PersonStatus enum key from the given value.
   * If status does not match an enum key, it returns null.
   *
   * @private
   * @param {string} status  Person status from Apheleia service.
   * @returns {string} PersonStatus
   * @memberof PeopleSDKAdapter
   */
  getStatus(status) {
    const personStatus = Object.keys(PersonStatus).find((key) => PersonStatus[key] === status);

    return personStatus === undefined ? null : personStatus;
  }

  /**
   * Fetches the person data from the sdk and returns in the shape required by adapter.
   *
   * @private
   * @param {string} ID  ID of the person for which to fetch data
   * @returns {Person}
   * @memberof PeopleSDKAdapter
   */
  async fetchPerson(ID) {
    const {id, emails, displayName, firstName, lastName, avatar, orgId} = await this.datasource.people.get(ID);

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
   * @public
   * @returns {Observable.<Person>}
   * @memberof PeopleSDKAdapter
   */
  getMe() {
    return defer(() => this.fetchPerson('me')).pipe(
      flatMap((person) =>
        defer(() => this.datasource.internal.presence.get([person.id])).pipe(
          catchError(() => of({status: null})), // When SDK throws error, don't set a status
          map(({status}) => ({...person, status: this.getStatus(status)}))
        )
      )
    );
  }

  /**
   * Returns an observable that emits person data of the given ID.
   *
   * @public
   * @param {string} ID ID of person to get.
   * @returns {Observable.<Person>}
   * @memberof PeopleSDKAdapter
   */
  getPerson(ID) {
    if (!(ID in this.getPersonObservables)) {
      const personUUID = deconstructHydraId(ID).id;
      const person$ = from(this.fetchPerson(ID));

      // Subscribe to `Apheleia` internal service to listen for status changes
      // And update the person object with status response from the subscription
      const personWithStatus$ = from(this.datasource.internal.presence.subscribe(personUUID)).pipe(
        map((data) => data.responses[0].status.status),
        flatMap((status) => person$.pipe(map((person) => ({...person, status: this.getStatus(status)}))))
      );

      // Listen for status changes for the given person ID after subscription to service
      const statusUpdate$ = fromEvent(this.datasource.internal.mercury, USER_PRESENCE_UPDATE_EVENT).pipe(
        filter((event) => event.data.subject === personUUID),
        map((event) => this.getStatus(event.data.status))
      );

      // Update the person status after each change emitted from the event
      const personUpdate$ = person$.pipe(
        flatMap((person) => statusUpdate$.pipe(map((status) => ({...person, status}))))
      );

      // Fetch the original person data on the first run
      // and updated object after each status change
      const getPerson$ = concat(personWithStatus$, personUpdate$).pipe(
        finalize(() => {
          // Unsubscribe from `Apheleia` internal service
          // when there are no more subscriptions.
          this.datasource.internal.presence.unsubscribe(personUUID);
          delete this.getPersonObservables[ID];
        })
      );

      this.getPersonObservables[ID] = getPerson$.pipe(
        publishReplay(1),
        refCount()
      );
    }

    return this.getPersonObservables[ID];
  }
}
