import * as dotenv from 'dotenv';
import Webex from 'webex';

import WebexSDKAdapter from '../src/WebexSDKAdapter';

// Allows the scripts to read the corresponding configuration
dotenv.config({path: `${__dirname}/../.env.development`});

if (!process.env.WEBEX_ACCESS_TOKEN) {
  // eslint-disable-next-line no-console
  console.error('Please set a valid WEBEX_ACCESS_TOKEN environment in `env.development` file at the root level.');

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
