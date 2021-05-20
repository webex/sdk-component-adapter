import {WebexAdapter} from '@webex/component-adapter-interfaces';
import RoomsSDKAdapter from './RoomsSDKAdapter';
import PeopleSDKAdapter from './PeopleSDKAdapter';
import MeetingsSDKAdapter from './MeetingsSDKAdapter';
import MembershipsSDKAdapter from './MembershipsSDKAdapter';
import OrganizationsSDKAdapter from './OrganizationsSDKAdapter';

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
    await this.sdk.internal.device.register();
    await this.sdk.internal.mercury.connect();
    await this.meetingsAdapter.connect();
  }

  /**
   * Disconnect from Webex services, closing any connections SDK may have opened.
   */
  async disconnect() {
    await this.meetingsAdapter.disconnect();
    await this.sdk.internal.mercury.disconnect();
    await this.sdk.internal.device.unregister();
  }
}
