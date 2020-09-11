import {BehaviorSubject, throwError} from 'rxjs';
import {DestinationType, MembershipsAdapter} from '@webex/component-adapter-interfaces';

/**
 * Gets the active members in a meeting
 *
 * @private
 * @param {object} members Members object from meeting, keyed by ID
 * @returns {Array}
 * @memberof MembershipsSDKAdapter
 */
function getActiveMembers(members) {
  return Object.values(members)
    .filter((member) => !member.isInMeeting)
    .map((member) => ({
      id: member.id,
    }));
}

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
   * @param {DestinationType} destinationType  type of the membership destination
   * @returns {external:Observable.<Membership>} Observable stream that emits membership data
   * @memberof MembershipAdapter
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

    if (meeting.members && meeting.members.membersCollection && meeting.members.membersCollection.members) {
      const members = getActiveMembers(meeting.members.membersCollection.members);

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
        const updatedMembers = getActiveMembers(payload.full);

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
