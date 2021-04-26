import {
  BehaviorSubject,
  combineLatest,
  concat,
  defer,
  from,
  fromEvent,
  merge,
  throwError,
} from 'rxjs';
import {
  filter,
  finalize,
  map,
  mergeMap,
  publishReplay,
  refCount,
} from 'rxjs/operators';
import {SDK_EVENT, deconstructHydraId} from '@webex/common';
import {
  DestinationType,
  MembershipsAdapter,
} from '@webex/component-adapter-interfaces';

// max parameter value must be greater than 0 and less than or equal to 1000
const MAX_MEMBERSHIPS = 1000;

// TODO: Figure out how to import JS Doc definitions and remove duplication.
/**
 * A Member object that is part of a membership
 *
 * @external Member
 * @see {@link https://github.com/webex/component-adapter-interfaces/blob/master/src/MembershipsAdapter.js#L6}
 */

/**
 * Sort the members alphabetically, with the current user first
 *
 * @param {Array} members List of sdk meeting members
 * @returns {Array} Sorted list of sdk meeting members
 */
function sortMeetingMembers(members) {
  return members.sort((member1, member2) => (
    /* eslint-disable no-nested-ternary, indent */
    member1.isSelf ? -1 // current user comes first
    : member2.isSelf ? +1
    : !member1.name ? +1 // empty names come last
    : !member2.name ? -1
    : member1.name.localeCompare(member2.name))); // alphabetical order
    /* eslint-enable no-nested-ternary, indent */
}

/**
 * A Webex user.
 *
 * @external Person
 * @see {@link https://github.com/webex/component-adapter-interfaces/blob/master/src/PeopleAdapter.js#L6}
 */

/**
 * Sort a memberships list alphabetically, with the current user first
 *
 * @param {Array} memberships List of sdk memberships
 * @param {string} myID Id of the current user
 * @returns {Array} Sorted list of sdk memberships
 */
function sortRoomMembers(memberships, myID) {
  return memberships.sort((m1, m2) => (
    /* eslint-disable no-nested-ternary, indent */
    m1.personId === myID ? -1 // current user comes first
    : m2.personId === myID ? 1
    : !m2.personDisplayName ? -1 // empty names come last
    : !m1.personDisplayName ? 1
    : m1.personDisplayName.localeCompare(m2.personDisplayName))); // alphabetical order
    /* eslint-enable no-nested-ternary, indent */
}

/**
 * Gets the active members in a meeting
 *
 * @private
 * @param {object} sdkMembers Members object from sdk meeting, keyed by ID
 * @returns {Array.<Member>} List of meeting members
 */
function getMembers(sdkMembers) {
  let members = Object.values(sdkMembers || {});

  members = members.filter((member) => member.isUser);
  members = sortMeetingMembers(members);

  return members.map((member) => ({
    ID: member.id,
    orgID: member.participant && member.participant.person && member.participant.person.orgId,
    inMeeting: member.isInMeeting,
    muted: member.isAudioMuted,
    sharing: member.isContentSharing,
    host: member.isHost,
    guest: member.isGuest,
  }));
}

/**
 * The `MembershipsSDKAdapter` is an implementation of the `MembershipsAdapter` interface.
 * This adapter utilizes the Webex JS SDK to fetch data about a memberships.
 *
 * @implements {MembershipsAdapter}
 */
export default class MembershipsSDKAdapter extends MembershipsAdapter {
  constructor(datasource) {
    super(datasource);

    this.members$ = {}; // cache membership observables based on membership id
    this.listenerCount = 0;
  }

  /**
   * Tells the SDK to start listening to memberships events and tracks the amount of calls.
   *
   * Note: Since the SDK listens to ALL memberships events, this function only
   * calls the SDK's `memberships.listen` function on the first membership to listen.
   * Repeated calls to `memberships.listen` are not needed afterwards.
   *
   * @private
   */
  startListeningToMembershipsUpdates() {
    if (this.listenerCount === 0) {
      // Tell the sdk to start listening to membership changes
      this.datasource.memberships.listen();
    }
    this.listenerCount += 1;
  }

  /**
   * Tells the SDK to stop listening to memberships events.
   *
   * Note: Since the SDK listens to ALL memberships events, this function only
   * calls the SDK's `memberships.stopListening` function once all of the listeners are done.
   * If `memberships.stopListening` is called early, existing subscribers won't get any updates.
   *
   * @private
   */
  stopListeningToMembershipsUpdates() {
    this.listenerCount -= 1;

    if (this.listenerCount <= 0) {
      // Once all listeners are done, stop listening
      this.datasource.memberships.stopListening();
    }
  }

  /**
   * Returns an observable that emits room members list of the given roomID.
   *
   * @private
   * @param {string} roomID ID of the room
   * @returns {external:Observable.<Array.<Member>>} Observable stream that emits a list of current members in a room
   */
  getRoomMembers(roomID) {
    this.startListeningToMembershipsUpdates();

    const membershipToMember = (membership) => ({
      ID: deconstructHydraId(membership.personId).id,
      orgID: deconstructHydraId(membership.personOrgId).id,
      muted: null,
      sharing: null,
      inMeeting: null,
      host: null,
      guest: null,
    });

    const me$ = from(this.datasource.people.get('me'));

    const memberships$ = defer(() => this.datasource.memberships.list({
      roomId: roomID,
      max: MAX_MEMBERSHIPS,
    })).pipe(
      map((page) => page.items),
    );

    const members$ = combineLatest([me$, memberships$]).pipe(
      map(([me, memberships]) => sortRoomMembers(memberships, me.id).map(membershipToMember)),
    );

    const createdEvent$ = fromEvent(
      this.datasource.memberships,
      SDK_EVENT.EXTERNAL.EVENT_TYPE.CREATED,
    );

    const deletedEvent$ = fromEvent(
      this.datasource.memberships,
      SDK_EVENT.EXTERNAL.EVENT_TYPE.DELETED,
    );

    const event$ = merge(createdEvent$, deletedEvent$)
      .pipe(
        filter((event) => event.data.roomId === roomID),
        mergeMap(() => members$),
      );

    return concat(members$, event$).pipe(
      publishReplay(1),
      refCount(),
      finalize(() => {
        this.stopListeningToMembershipsUpdates();
      }),
    );
  }

  /**
   * Returns an observable that emits meeting members list of the given meetingID.
   *
   * @private
   * @param {string} meetingID ID of the meeting
   * @returns {external:Observable.<Array.<Member>>} Observable stream that emits a list of current members in a meeting
   */
  getMeetingMembers(meetingID) {
    const meeting = this.datasource.meetings.getMeetingByType('id', meetingID);
    let members$;

    if (!meeting) {
      members$ = throwError(new Error(`Meeting ${meetingID} not found.`));
    } else {
      const members = meeting.members
        && meeting.members.membersCollection
        && meeting.members.membersCollection.members;

      // Behavior subject will keep the last emitted object for new subscribers
      // https://rxjs.dev/guide/subject#behaviorsubject
      members$ = new BehaviorSubject(getMembers(members));

      // Emit on membership updates
      meeting.members.on('members:update', (payload) => {
        if (payload && payload.full) {
          members$.next(getMembers(payload.full));
        }
      });
    }

    return members$;
  }

  /**
   * Returns an observable that emits a list of Member objects.
   * Whenever there is an update to the membership, the observable
   * will emit a new updated Member list, if datasource permits.
   *
   * @param {string} destinationID  ID of the destination for which to get members
   * @param {DestinationType} destinationType Type of the membership destination
   * @returns {external:Observable.<Array.<Member>>} Observable stream that emits member lists
   */
  getMembersFromDestination(destinationID, destinationType) {
    const membershipID = `${destinationType}-${destinationID}`;
    let members$ = this.members$[membershipID];

    if (!members$) {
      switch (destinationType) {
        case DestinationType.ROOM:
          members$ = this.getRoomMembers(destinationID);
          break;
        case DestinationType.MEETING:
          members$ = this.getMeetingMembers(destinationID);
          break;
        default:
          members$ = throwError(new Error(`getMembersFromDestination for ${destinationType} is not currently supported.`));
      }

      // save for future calls
      this.members$[membershipID] = members$;
    }

    return members$;
  }
}
