import MeetingSDKAdapter from './MeetingsSDKAdapter';
import PeopleSDKAdapter from './PeopleSDKAdapter';
import RoomsSDKAdapter from './RoomsSDKAdapter';

export default class WebexSDKAdapter {
  /**
   * Creates a new instance of the WebexSDKAdapter.
   * The data source for this adapter comes from an authenticated instance of the SDK.
   * More information about the Webex JS SDK: https://github.com/webex/webex-js-sdk
   *
   * @param {Object} sdk The primary sdk the adapter will be using.
   */
  constructor(sdk) {
    this.meetingAdapter = new MeetingSDKAdapter(sdk);
    this.peopleAdapter = new PeopleSDKAdapter(sdk);
    this.roomsAdapter = new RoomsSDKAdapter(sdk);
    this.sdk = sdk;
  }

  /**
   * Connect to Webex services so SDK can listen for data updates.
   */
  async connect() {
    await this.sdk.internal.device.register();
    await this.sdk.internal.mercury.connect();
    await this.meetingAdapter.connect();
  }

  /**
   * Disconnect from Webex services, closing any connections SDK may have opened.
   */
  async disconnect() {
    await this.sdk.internal.mercury.disconnect();
    await this.sdk.internal.device.unregister();
    await this.meetingAdapter.disconnect();
  }
}
