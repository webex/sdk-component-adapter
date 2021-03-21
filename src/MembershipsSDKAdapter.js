import {BehaviorSubject, throwError} from 'rxjs';
import {DestinationType, MembershipsAdapter} from '@webex/component-adapter-interfaces';

// TODO: Figure out how to import JS Doc definitions and remove duplication.
/**
 * A relationship between a destination (e.g. room, meeting) in Webex and people.
 *
 * @external Membership
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
  return Object.values(members)
    .filter((member) => member.isUser)
    .map((member) => ({
      id: member.id,
      inMeeting: member.inMeeting,
      muted: member.isAudioMuted,
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

    this.membershipSubjects = {};
  }

  /**
   * Returns an observable that emits a Membership object.
   * Whenever there is an update to the membership, the observable
   * will emit a new updated Membership object, if datasource permits.
   *
   * @param {string} destinationID  ID of the destination for which to get members
   * @param {DestinationType} destinationType Type of the membership destination
   * @returns {external:Observable.<Membership>} Observable stream that emits membership data
   */
  getMembersFromDestination(destinationID, destinationType) {
    if (destinationType !== DestinationType.MEETING) {
      return throwError(new Error(`getMembersFromDestination for ${destinationType} is not currently supported.`));
    }

    const meeting = this.datasource.meetings.getMeetingByType('id', destinationID);

    if (!meeting) {
      return throwError(new Error(`Meeting ${destinationID} not found.`));
    }

    const membershipID = `${destinationType}-${destinationID}`;

    if (!this.membershipSubjects[membershipID]) {
      // Behavior subject will keep the last emitted object for new subscribers
      // https://rxjs.dev/guide/subject#behaviorsubject
      this.membershipSubjects[membershipID] = new BehaviorSubject({
        ID: membershipID,
        destinationID,
        destinationType,
        members: [],
      });
    }

    const membershipSubject = this.membershipSubjects[membershipID];

    if (meeting.members
      && meeting.members.membersCollection
      && meeting.members.membersCollection.members
    ) {
      const members = getMembers(meeting.members.membersCollection.members);

      // First, emit the current collection
      membershipSubject.next({
        ID: membershipID,
        destinationID,
        destinationType,
        members,
      });
    }

    // Emit on membership updates
    meeting.members.on('members:update', (payload) => {
      if (payload && payload.full) {
        const updatedMembers = getMembers(payload.full);

        membershipSubject.next({
          ID: membershipID,
          destinationID,
          destinationType,
          members: updatedMembers,
        });
      }
    });

    return membershipSubject;
  }
}
