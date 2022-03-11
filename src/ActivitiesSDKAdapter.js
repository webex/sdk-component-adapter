import {constructHydraId, deconstructHydraId} from '@webex/common';
import {ActivitiesAdapter} from '@webex/component-adapter-interfaces';
import {
  from,
  Observable,
  ReplaySubject,
  defer,
} from 'rxjs';
import {
  catchError,
  concatMap,
  map,
  tap,
} from 'rxjs/operators';

import logger from './logger';
import cache from './cache';

/**
 * An activity a person performs in Webex.
 *
 * @external Activity
 * @see {@link https://github.com/webex/component-adapter-interfaces/blob/master/src/ActivitiesAdapter.js#L6}
 */

/**
 * Extracts JSON card and files from server activity.
 *
 * @private
 * @param {object} sdkActivity  SDK activity object
 * @returns {Array} Array of attachments.
 */
function parseSDKAttachments(sdkActivity) {
  const {attachments = []} = sdkActivity;

  try {
    if (sdkActivity.object && sdkActivity.object.cards) {
      sdkActivity.object.cards.forEach((c) => {
        const card = JSON.parse(c);

        attachments.push({contentType: 'application/vnd.microsoft.card.adaptive', content: card});
      });
    }
  } catch (err) {
    logger.warn('ACTIVITY', undefined, 'parseSDKAttachments()', `Unable parse attachments for activity with id "${sdkActivity.id}"`, err);
  }

  return attachments;
}

/**
 * Maps SDK activity to adapter activity
 *
 * @private
 * @param {object} sdkActivity  SDK activity object
 * @returns {Activity} Adapter activity object
 */
export function fromSDKActivity(sdkActivity) {
  return {
    displayHeader: true,
    ID: sdkActivity.id ? constructHydraId('message', sdkActivity.id) : sdkActivity.ID,
    roomID: sdkActivity.target ? constructHydraId('room', sdkActivity.target.id) : sdkActivity.roomID,
    personID: sdkActivity.actor ? constructHydraId('person', sdkActivity.actor.id) : sdkActivity.personID,
    text: sdkActivity.object ?
      (sdkActivity.object.content || sdkActivity.object.displayName) : sdkActivity.text,
    attachments: parseSDKAttachments(sdkActivity),
    created: sdkActivity.published ? sdkActivity.published : sdkActivity.created,
  };
}

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
  async fetchActivity(activityID) {
    logger.debug('ACTIVITY', 'fetchActivity()', activityID);

    const {id} = deconstructHydraId(activityID);
    const service = 'conversation';
    const resource = `activities/${id}`;

    if (cache.has(id)) {
      return cache.get(id);
    }

    const {body} = await this.datasource.request({service, resource});

    cache.set(id, body);

    return body;
  }

  /**
   * Returns an observable that emits activity data of the given ID.
   *
   * @param {string} ID  Id of activity to get
   * @returns {external:Observable.<Activity>} Observable stream that emits activity data
   */
  getActivity(ID) {
    logger.debug('ACTIVITY', 'getActivity()', ID, []);

    if (!(ID in this.activityObservables)) {
      // use ReplaySubject cause we don't need to set an initial value
      this.activityObservables[ID] = new ReplaySubject();

      defer(() => this.fetchActivity(ID)).pipe(
        map(fromSDKActivity),
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
    logger.debug('ACTION', undefined, 'postAction()', ['called with', {activityID, inputs}]);

    return from(this.fetchActivity(activityID)).pipe(
      concatMap(async (parentActivity) => {
        const encryptedInputs = await this.datasource.internal.encryption
          .encryptText(parentActivity.encryptionKeyUrl, JSON.stringify(inputs));

        return this.datasource.internal.conversation.cardAction(
          parentActivity.target,
          {inputs: encryptedInputs},
          parentActivity,
        );
      }),
      tap((action) => {
        logger.debug('ACTION', action.id, 'postAction()', ['emitting posted action', action]);
      }),
      map(fromSDKActivity),
      catchError((err) => {
        logger.error('ACTION', undefined, 'postAction()', `Unable to create an action for activity with id "${activityID}"`, err);
        throw err;
      }),
    );
  }

  /**
   * Posts an activity and returns an observable to the new activity data
   *
   * @param {object} activity  The activity to post
   * @returns {Observable.<Activity>} Observable that emits the posted activity (including id)
   */
  postActivity(activity) {
    logger.debug('ACTIVITY', undefined, 'postActivity()', ['called with', {activity}]);
    const card = this.getAdaptiveCard(activity);

    const object = card && {
      cards: [JSON.stringify(card)],
      displayName: activity.text,
    };

    const {id, cluster = 'us'} = deconstructHydraId(activity.roomID);

    const activity$ = from(this.datasource.internal.conversation.post(
      {
        id,
        cluster,
      },
      object || activity.text,
    )).pipe(
      map(fromSDKActivity),
      catchError((err) => {
        logger.error('ACTIVITY', undefined, 'postActivity()', ['Unable to post activity', activity], err);
        throw err;
      }),
    );

    return activity$;
  }

  /**
   * A function that checks whether or not an Activity object contains a card attachment.
   *
   * @param {Activity} activity  Activity object
   * @returns {boolean} True if received Activity object contains a card attachment
   */
  // eslint-disable-next-line class-methods-use-this
  hasAdaptiveCard(activity) {
    return !!(activity.attachments && activity.attachments[0] && activity.attachments[0].contentType === 'application/vnd.microsoft.card.adaptive');
  }

  /**
   * A function that returns adaptive card data of an Activity object.
   *
   * @param {Activity} activity  Activity object
   * @returns {object|undefined} Adaptive card data object
   */
  // eslint-disable-next-line class-methods-use-this
  getAdaptiveCard(activity) {
    const hasCard = this.hasAdaptiveCard(activity);

    return hasCard ? activity.attachments[0].content : undefined;
  }

  /**
   * A function that attaches an adaptive card to an Activity object.
   *
   * @param {Activity} activity  The activity to post
   * @param {object} card  The card attachment
   */
  // eslint-disable-next-line class-methods-use-this
  attachAdaptiveCard(activity, card) {
    const mutableActivity = activity;

    mutableActivity.attachments = [{
      contentType: 'application/vnd.microsoft.card.adaptive',
      content: card,
    }];
  }
}
