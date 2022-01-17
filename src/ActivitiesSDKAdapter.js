import {ActivitiesAdapter} from '@webex/component-adapter-interfaces';
import {ReplaySubject, defer} from 'rxjs';
import {map} from 'rxjs/operators';

import logger from './logger';

/**
 * An activity a person performs in Webex.
 *
 * @external Activity
 * @see {@link https://github.com/webex/component-adapter-interfaces/blob/master/src/ActivitiesAdapter.js#L6}
 */

/**
 * The `ActivitiesSDKAdapter` is an implementation of the `ActivitiesAdapter` interface.
 * This implementation utilizes the Webex JS SDK as its source of activity data.
 *
 * @see {@link ActivitiesJSON}
 * @implements {ActivitiesAdapter}
 */
/* eslint-disable no-useless-constructor */
export default class ActivitiesSDKAdapter extends ActivitiesAdapter {
  constructor(datasource) {
    super(datasource);

    this.activityObservables = {};
  }

  /**
   * Loads activity data from Webex and returns a promise that resolves to an Activity object
   *
   * @param {string} activityID  Id of the activity for which to fetch data
   * @returns {Promise.<Activity>} Information about the activity of the given ID
   *
   * @private
   */
  fetchActivity(activityID) {
    logger.debug('ACTIVITY', activityID, 'fetchActivity()', ['called with', {activityID}]);

    return this.datasource.messages.get(activityID);
  }

  /**
   * Returns an observable that emits activity data of the given ID.
   *
   * @param {string} ID  Id of activity to get
   * @returns {external:Observable.<Activity>} Observable stream that emits activity data
   */
  getActivity(ID) {
    logger.debug('ACTIVITY', ID, 'getActivity()', ['called with', {ID}]);

    if (!(ID in this.activityObservables)) {
      // use ReplaySubject cause we don't need to set an initial value
      this.activityObservables[ID] = new ReplaySubject(1);

      defer(() => this.fetchActivity(ID)).pipe(
        map(({
          id,
          roomId,
          text,
          personId,
          attachments,
          created,
        }) => ({
          ID: id,
          roomID: roomId,
          text,
          personID: personId,
          attachments,
          card: attachments && attachments[0] && attachments[0].contentType === 'application/vnd.microsoft.card.adaptive' ? attachments[0].content : undefined,
          created,
        })),
      ).subscribe(
        (activity) => {
          logger.debug('ACTIVITY', ID, 'getActivity()', ['emitting activity object', activity]);
          this.activityObservables[ID].next(activity);
        },
        (error) => {
          logger.error('ACTIVITY', ID, 'getActivity()', 'Error fetching activity', error);
          this.activityObservables[ID].error(new Error(`Could not find activity with ID "${ID}"`));
        },
      );
    }

    return this.activityObservables[ID];
  }
}
