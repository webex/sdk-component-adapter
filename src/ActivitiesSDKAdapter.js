import {constructHydraId, deconstructHydraId} from '@webex/common';
import {ActivitiesAdapter} from '@webex/component-adapter-interfaces';
import {
  from,
  defer,
  Observable,
  ReplaySubject,
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
 * Extracts JSON cards from server activity.
 *
 * @private
 * @param {object} sdkActivity  SDK activity object
 * @returns {Array} Array of cards.
 */
function parseSDKCards(sdkActivity) {
  let cards = [];

  if (sdkActivity.object && sdkActivity.object.cards) {
    cards = sdkActivity.object.cards.map((c) => {
      let card;

      try {
        card = JSON.parse(c);
      } catch (err) {
        logger.warn('ACTIVITY', sdkActivity.id, 'parseSDKCards()', ['Unable parse card', c], err);

        card = {
          type: 'AdaptiveCard',
          version: '1.0',
          body: [{
            type: 'TextBlock',
            text: 'This card could not be parsed.',
          }],
        };
      }

      return card;
    });
  }

  return cards;
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
    ID: sdkActivity.id ? constructHydraId('MESSAGE', sdkActivity.id) : sdkActivity.ID,
    roomID: sdkActivity.target ? constructHydraId('ROOM', sdkActivity.target.id) : sdkActivity.roomID,
    personID: sdkActivity.actor ? constructHydraId('PEOPLE', sdkActivity.actor.id) : sdkActivity.personID,
    text: sdkActivity.object ?
      (sdkActivity.object.content || sdkActivity.object.displayName) : sdkActivity.text,
    cards: parseSDKCards(sdkActivity),
    attachments: sdkActivity.attachments || [],
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
    const resource = `activities/${encodeURIComponent(id)}`;

    if (cache.has(id)) {
      return cache.get(id);
    }

    const {body} = await this.datasource.request({service, resource});

    cache.set(id, body);

    return body;
  }

  /**
   * Fetches a conversation from the API
   *
   * @param {string} conversationID  Id of the conversation for which to fetch data
   * @returns {Promise} Information about the conversation of the given ID
   *
   * @private
   */
  async fetchConversation(conversationID) {
    const {id} = deconstructHydraId(conversationID);
    const method = 'GET';
    const api = 'conversation';
    const resource = `conversations/${encodeURIComponent(id)}`;
    const {body} = await this.datasource.request({method, api, resource});

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
   * Encrypts the cards of an activity and returns a promise to the array of encrypted cards
   *
   * @private
   * @param {Activity} activity  The activity that contains an array of adaptive cards
   * @returns {Promise.<Array.<string>>} Promise that resolves to the array of encrypted cards or rejects if cards cannot be encrypted
   */
  async encryptCards(activity) {
    logger.debug('ACTIVITY', activity.ID, 'encryptCards()', ['called with', {activity}]);

    const conversation = await this.fetchConversation(activity.roomID);

    return Promise.all(activity.cards.map((card) => (
      this.datasource.internal.encryption.encryptText(
        conversation.encryptionKeyUrl,
        JSON.stringify(card),
      )
    ))).catch((err) => {
      logger.error('ACTIVITY', activity.ID, 'encryptCards()', 'Unable to encrypt card', err);
      throw err;
    });
  }

  /**
   * Posts an activity and returns an observable to the new activity data
   *
   * @param {Activity} activity  The activity to post
   * @returns {Observable.<Activity>} Observable that emits the posted activity (including id)
   */
  postActivity(activity) {
    logger.debug('ACTIVITY', undefined, 'postActivity()', ['called with', {activity}]);

    const doPost = async () => {
      const {id, cluster = 'us'} = deconstructHydraId(activity.roomID);
      const hasCards = this.hasAdaptiveCards(activity);
      const object = hasCards
        ? ({cards: await this.encryptCards(activity), displayName: activity.text})
        : activity.text;

      return this.datasource.internal.conversation.post({id, cluster}, object);
    };

    return defer(doPost).pipe(
      map(fromSDKActivity),
      catchError((err) => {
        logger.error('ACTIVITY', undefined, 'postActivity()', ['Unable to post activity', activity], err);
        throw err;
      }),
    );
  }

  /**
   * A function that checks whether or not an Activity object contains at least one adaptive card.
   *
   * @param {Activity} activity  Activity object
   * @returns {boolean} True if received Activity object contains at least one adaptive card
   */
  // eslint-disable-next-line class-methods-use-this
  hasAdaptiveCards(activity) {
    return activity.cards.length > 0;
  }

  /**
   * A function that returns adaptive card data of an Activity object.
   *
   * @param {Activity} activity  Activity object
   * @param {number} cardIndex  Index of the card to get
   * @returns {object|undefined} Adaptive card data object
   */
  // eslint-disable-next-line class-methods-use-this
  getAdaptiveCard(activity, cardIndex) {
    return activity.cards[cardIndex];
  }
}
