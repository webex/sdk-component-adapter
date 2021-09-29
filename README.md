<h1 align='center' style='border-bottom: none;'>Webex SDK Component Adapter</h1>
<h3 align='center'>Webex adapter to share SDK data with the <a href="https://github.com/webex/components">components</a></h3>
<p align='center'>
<a href='https://circleci.com/gh/webex/sdk-component-adapter'>
    <img alt='CircleCI' src='https://circleci.com/gh/webex/sdk-component-adapter.svg?style=shield'>
  </a>
  <a href='https://www.npmjs.com/package/@webex/sdk-component-adapter'>
    <img alt='npm latest version' src='https://img.shields.io/npm/v/@webex/sdk-component-adapter?label=npm%40latest'>
  </a>
  <a href='#badge'>
    <img alt='semantic-release' src='https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg'>
  </a>
  <a href='https://github.com/webex/sdk-component-adapter/blob/master/LICENSE'>
    <img src='https://img.shields.io/npm/l/webex.svg' alt='license'>
  </a>
</p>

**Webex SDK Adapter** is a library of adapters to provide live data from [Webex JavaScript SDK](https://github.com/webex/webex-js-sdk) to [Webex Components](https://github.com/webex/components).

## Project Status

The Webex Component System is considered to be in beta stage and it's not a generally available product from Webex at this time.
This means that the Webex Component System is available for everyone to use but breaking changes may occur as we develop it.
We try our best to minimize any breaking changes but they may occur.
While the Webex Component System is not a GA product, we still offer support through all regular channels.
However, bug priority is given to products already generally available.
We would love for you to use the Webex Component System and be part of the feedback process!

## Table of Contents

- [Install](#install)
- [Usage](#usage)
  - [Setup](#setup)
    - [Connect](#connect)
    - [Disconnect](#disconnect)
  - [Components](#components)
    - [React Component With Hooks](#react-component-with-hooks)
    - [React Class Component](#react-class-component)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## Install

```bash
npm install --save @webex/components @webex/sdk-component-adapter
```

## Usage

### Setup

When using the Webex SDK Adapter, it is expected to have a fully authenticated SDK instance passed to it:

```js
const webex = new Webex({
  credentials: `<YOUR WEBEX ACCESS_TOKEN>`,
});

const adapter = new WebexSDKAdapter(webex);
```

#### Connect

The Webex SDK requires different connections to be setup in order for it to be usable.
Some examples of these connections include device registration and web socket connections.

These connections are handled by the SDK Adapter, but require the `connect` function to be manually called.

```js
const webex = new Webex({
  credentials: `<YOUR WEBEX ACCESS_TOKEN>`,
});

const adapter = new WebexSDKAdapter(webex);

await adapter.connect();

// Adapter is now ready to make requests.
```

#### Disconnect

When the adapter is no longer going to be used, the `disconnect` function will do the necessary tear-down of all the connections created in the `connect` function:

```js
await adapter.disconnect();

// Adapter is now disconnected.
```

### Components

The Webex SDK Adapter is meant to be used with Webex Components.

For more information on how to use **Webex Components**, visit [this page](https://github.com/webex/components/blob/master/README.md).

The following examples display how you can utilize the Webex SDK Adapter along with Webex Components to provide a fully connected component:

#### React Component With Hooks

Utilizing the `useEffect` hook, we can connect our adapter in a deferred event after initial render.

```js
import '@webex/components/dist/css/webex-components.css';

import React, {useEffect, useState} from 'react';
import Webex from 'webex';
import WebexSDKAdapter from '@webex/sdk-component-adapter';
import {WebexAvatar, WebexDataProvider} from '@webex/components';

const webex = new Webex({
  credentials: `<YOUR_ACCESS_TOKEN>`,
});
const adapter = new WebexSDKAdapter(webex);

function App() {
  const [adapterConnected, setAdapterConnected] = useState(false);

  useEffect(() => {
    // This is the suggested way to do async hooks.
    // Ref: https://github.com/facebook/react/issues/14326
    async function doConnect() {
      // Wait for the adapter to connect before rendering.
      await adapter.connect();
      setAdapterConnected(true);
    }

    doConnect();

    // On teardown, disconnect the adapter
    return () => {
      adapter.disconnect();
    }
  }, []);


  return (
    <div className="App">
      {
        adapterConnected && (
          <WebexDataProvider adapter={adapter} >
            <WebexAvatar personID="<AVATAR_ID>" />
          </WebexDataProvider>
        )
      }
    </div>
  );
}

export default App;

```

#### React Class Component

For traditional React class components, the adapter should connect once the component mounts.

```js
import '@webex/components/dist/webexComponents.css';

import React, { Component } from 'react'
import Webex from 'webex';
import WebexSDKAdapter from '@webex/sdk-component-adapter';
import {WebexAvatar, WebexDataProvider} from '@webex/components';

const credentials = `<YOUR_ACCESS_TOKEN>`;

const webex = new Webex({
  credentials,
});

export default class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      adapterConnected: false
    };

    this.adapter = new WebexSDKAdapter(webex);
  }

  async componentDidMount() {
    await adapter.connect();
    // Once adapter connects, set our app state to ready.
    this.setState({adapterConnected: true});
  }

  async componentWillUnmount() {
    // On teardown, disconnect the adapter.
    await this.adapter.disconnect();
  }

  render() {
    return (
      <div className="App">
        {
          this.state.adapterConnected && (
            <WebexDataProvider adapter={this.adapter} >
              <WebexAvatar personID="<AVATAR_ID>" />
            </WebexDataProvider>
          )
        }
      </div>
    )
  }
}

```

## Contributing

We'd love for you to contribute to our source code and to make **Webex SDK Adapter** even better than it is today!
Here are some [guidelines](https://github.com/webex/sdk-component-adapter/blob/master/CONTRIBUTING.md)
that we'd like you to follow.

## License

[MIT License](https://opensource.org/licenses/MIT)

## Support

For more developer resources, tutorials and support, visit the Webex developer portal, https://developer.webex.com.
