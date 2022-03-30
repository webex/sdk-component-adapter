import {WebexAdapter} from '@webex/component-adapter-interfaces';
import ActivitiesSDKAdapter from './ActivitiesSDKAdapter';
import RoomsSDKAdapter from './RoomsSDKAdapter';
import PeopleSDKAdapter from './PeopleSDKAdapter';
import MeetingsSDKAdapter from './MeetingsSDKAdapter';
import MembershipsSDKAdapter from './MembershipsSDKAdapter';
import OrganizationsSDKAdapter from './OrganizationsSDKAdapter';
import logger from './logger';
import cache from './cache';
import {name, version} from '../package.json';

const LOG_ARGS = ['SDK', `${name}-${version}`];

export default class WebexSDKAdapter extends WebexAdapter {
  /**
   * Creates a new instance of the WebexSDKAdapter.
   * The data source for this adapter comes from an authenticated instance of the SDK.
   * More information about the Webex JS SDK: https://github.com/webex/webex-js-sdk
   *
   * @param {object} sdk The primary sdk the adapter will be using.
   */
  constructor(sdk) {
    super(sdk);

    logger.debug(...LOG_ARGS, 'constructor()', 'instantiating sdk component adapter');

    this.activitiesAdapter = new ActivitiesSDKAdapter(sdk);
    this.peopleAdapter = new PeopleSDKAdapter(sdk);
    this.roomsAdapter = new RoomsSDKAdapter(sdk);
    this.meetingsAdapter = new MeetingsSDKAdapter(sdk);
    this.membershipsAdapter = new MembershipsSDKAdapter(sdk);
    this.organizationsAdapter = new OrganizationsSDKAdapter(sdk);
    this.sdk = sdk;
    this.cache = cache;
  }

  /**
   * Connect to Webex services so SDK can listen for data updates.
   */
  async connect() {
    logger.debug(...LOG_ARGS, 'connect()', 'called');
    logger.debug(...LOG_ARGS, 'connect()', 'calling sdk.internal.device.register()');
    await this.sdk.internal.device.register();
    logger.debug(...LOG_ARGS, 'connect()', 'calling sdk.internal.mercury.connect()');
    await this.sdk.internal.mercury.connect();
    logger.debug(...LOG_ARGS, 'connect()', 'calling meetingsAdapter.connect()');
    await this.meetingsAdapter.connect();
  }

  /**
   * Disconnect from Webex services, closing any connections SDK may have opened.
   */
  async disconnect() {
    logger.debug(...LOG_ARGS, 'disconnect()', 'called');
    logger.debug(...LOG_ARGS, 'disconnect()', 'calling meetingsAdapter.disconnect()');
    await this.meetingsAdapter.disconnect();
    logger.debug(...LOG_ARGS, 'disconnect()', 'calling sdk.internal.mercury.disconnect()');
    await this.sdk.internal.mercury.disconnect();
    logger.debug(...LOG_ARGS, 'disconnect()', 'calling sdk.internal.device.unregister()');
    await this.sdk.internal.device.unregister();
  }
}
