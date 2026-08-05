<!-- ───────────────────────────────
  Template:     Pattern
  Template-ID:  pattern-structured-logger
  Generates:    ai-docs/patterns/structured-adapter-logging.md
  Library ver:  0.2.1
  Last updated: 2026-08-05
─────────────────────────────── -->

# Pattern: Structured adapter logging

Observed in: `src/WebexSDKAdapter.js`, `src/MeetingsSDKAdapter.js`, `src/RoomsSDKAdapter.js`, `src/ActivitiesSDKAdapter.js`

## Intent

Consistent debug/error logs with domain tag and entity ID for support without logging secrets.

## Correct

```javascript
import logger from './logger';

const LOG_ARGS = ['SDK', `${name}-${version}`];
logger.debug(...LOG_ARGS, 'connect()', 'calling sdk.internal.mercury.connect()');
logger.error('ROOM', ID, 'createRoom()', ['Unable to create room', {room}], err);
```

Evidence: `src/WebexSDKAdapter.js`, `src/logger.js`, `src/RoomsSDKAdapter.js`

## Incorrect

```javascript
console.log('connecting', sdk.credentials); // Leaks secrets, no level control
console.error(err); // No domain context
```

## Verification

- Logger level configurable via `window.webexSDKAdapterSetLogLevel` in browser builds.
