import Webex from 'webex';

import WebexSDKAdapter from '../src/WebexSDKAdapter';

if (!process.env.WEBEX_ACCESS_TOKEN) {
  // eslint-disable-next-line no-console
  console.error('Please set a valid WEBEX_ACCESS_TOKEN in `.env` file at the root level.');

  process.exit(1);
}

const webex = new Webex({
  credentials: process.env.WEBEX_ACCESS_TOKEN,
});

// eslint-disable-next-line no-unused-vars
const webexSDKAdapter = new WebexSDKAdapter(webex);

export default webexSDKAdapter;
// --------------------------------------------------------------------------------
// Add your test/development code here
