import {ActivitiesAdapter} from '@webex/component-adapter-interfaces';
import {
  from,
  Observable,
  ReplaySubject,
  defer,
} from 'rxjs';
import {
  catchError,
  map,
  tap,
} from 'rxjs/operators';

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

  /**
   * Posts an attachment action, returns an observable that emits the created action
   *
   * @param {string} activityID  ID of the activity corresponding to this submit action
   * @param {object} inputs  The message content
   * @returns {Observable.<object>} Observable stream that emits data of the newly created action
   */
  postAction(activityID, inputs) {
    logger.debug('ATTACHMENT-ACTION', undefined, 'postAction()', ['called with', {activityID, inputs}]);

    const action$ = from(this.datasource.attachmentActions.create({
      type: 'submit',
      messageId: activityID,
      inputs,
    })).pipe(
      map((action) => ({
        actionID: action.id,
        activityID: action.messageId,
        inputs: action.inputs,
        roomID: action.roomId,
        type: action.type,
      })),
      tap((action) => {
        logger.debug('ATTACHMENT-ACTION', action.actionID, 'postAction()', ['emitting posted attachment action', action]);
      }),
      catchError((err) => {
        logger.error('ATTACHMENT-ACTION', undefined, 'postAction()', `Unable to create an attachment for activity with id "${activityID}"`, err);
        throw err;
      }),
    );

    return action$;
  }

  /**
   * Posts an activity and returns an observable to the new activity data
   *
   * @param {object} activity  The activity to post
   * @returns {Observable.<Activity>} Observable that emits the posted activity (including id)
   */
  postActivity(activity) {
    const activity$ = from(this.datasource.messages.create({
      roomId: activity.roomID,
      text: activity.text,
      attachments: activity.card ? [{
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: activity.card,
      }] : activity.attachments,
    })).pipe(
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
        created,
      })),
      catchError((err) => {
        logger.error('ACTIVITY', undefined, 'postActivity()', ['Unable to post activity', activity], err);
        throw err;
      }),
    );

    return activity$;
  }
}
