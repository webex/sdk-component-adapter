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
    this.roomsAdapter = new RoomsSDKAdapter(sdk);
  }
}
