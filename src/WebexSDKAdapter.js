import {WebexAdapter} from '@webex/component-adapter-interfaces';
import RoomsSDKAdapter from './RoomsSDKAdapter';
import PeopleSDKAdapter from './PeopleSDKAdapter';
import MeetingsSDKAdapter from './MeetingsSDKAdapter';
import MembershipsSDKAdapter from './MembershipsSDKAdapter';
import OrganizationsSDKAdapter from './OrganizationsSDKAdapter';
import logger from './logger';
import {name, version} from '../package.json';

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
    this.activitiesAdapter = {};
    this.peopleAdapter = new PeopleSDKAdapter(sdk);
    this.roomsAdapter = new RoomsSDKAdapter(sdk);
    this.meetingsAdapter = new MeetingsSDKAdapter(sdk);
    this.membershipsAdapter = new MembershipsSDKAdapter(sdk);
    this.organizationsAdapter = new OrganizationsSDKAdapter(sdk);
    this.sdk = sdk;
  }

  /**
   * Connect to Webex services so SDK can listen for data updates.
   */
  async connect() {
    logger.debug('SDK', `${name} ${version}`, 'connect()', 'calling sdk.internal.mercury.connect()');
    await this.sdk.internal.device.register();
    logger.debug('SDK', `${name} ${version}`, 'connect()', 'calling sdk.internal.mercury.connect()');
    await this.sdk.internal.mercury.connect();
    logger.debug('SDK', `${name} ${version}`, 'connect()', 'calling metingsAdapter.connect()');
    await this.meetingsAdapter.connect();
  }

  /**
   * Disconnect from Webex services, closing any connections SDK may have opened.
   */
  async disconnect() {
    logger.debug('SDK', `${name} ${version}`, 'disconnect()', 'calling metingsAdapter.disconnect()');
    await this.meetingsAdapter.disconnect();
    logger.debug('SDK', `${name} ${version}`, 'disconnect()', 'calling sdk.internal.mercury.disconnect()');
    await this.sdk.internal.mercury.disconnect();
    logger.debug('SDK', `${name} ${version}`, 'disconnect()', 'calling metingsAdapter.unregister()');
    await this.sdk.internal.device.unregister();
  }
}
