import {BehaviorSubject, throwError} from 'rxjs';
import {DestinationType, MembershipsAdapter} from '@webex/component-adapter-interfaces';

// TODO: Figure out how to import JS Doc definitions and remove duplication.
/**
 * A Member object that is part of a membership
 *
 * @external Member
 * @see {@link https://github.com/webex/component-adapter-interfaces/blob/master/src/MembershipsAdapter.js#L6}
 */

/**
 * Gets the active members in a meeting
 *
 * @private
 * @param {object} members Members object from meeting, keyed by ID
 * @returns {Array} List of active users in a meeting
 */
function getMembers(members) {
  return members ? Object.values(members)
    .filter((member) => member.isUser)
    .map((member) => ({
      id: member.id,
      inMeeting: member.isInMeeting,
      muted: member.isAudioMuted,
      sharing: member.isContentSharing,
    })) : [];
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
      if (destinationType !== DestinationType.MEETING) {
        members$ = throwError(new Error(`getMembersFromDestination for ${destinationType} is not currently supported.`));
      } else {
        const meeting = this.datasource.meetings.getMeetingByType('id', destinationID);

        if (!meeting) {
          members$ = throwError(new Error(`Meeting ${destinationID} not found.`));
        } else {
          const members = meeting.members
            && meeting.members.membersCollection
            && meeting.members.membersCollection.members;

          // Behavior subject will keep the last emitted object for new subscribers
          // https://rxjs.dev/guide/subject#behaviorsubject
          members$ = new BehaviorSubject(getMembers(members));

          this.members$[membershipID] = members$; // save for future calls

          // Emit on membership updates
          meeting.members.on('members:update', (payload) => {
            if (payload && payload.full) {
              members$.next(getMembers(payload.full));
            }
          });
        }
      }
    }

    return members$;
  }
}
