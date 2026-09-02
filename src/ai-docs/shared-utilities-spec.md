<!-- ───────────────────────────────
  Template:     Module Spec
  Template-ID:  module-spec
  Description:  Per-module canonical spec — orientation plus requirements, design, invariants, flows, pitfalls, and tests.
  Generates:    src/ai-docs/shared-utilities-spec.md
  Library ver:  0.2.2
  Last updated: 2026-08-05
─────────────────────────────── -->

# shared-utilities — SPEC

> [`AGENTS.md`](../../AGENTS.md) · [`SPEC_INDEX.md`](../../ai-docs/SPEC_INDEX.md) · [`ARCHITECTURE.md`](../../ai-docs/ARCHITECTURE.md)

## Metadata

| Field | Value |
|---|---|
| Module id | shared-utilities |
| Source path(s) | `src/cache.js`, `src/logger.js`, `src/logger/`, `src/utils.js`, `src/polyfills.js` |
| Parent spec | — |
| Doc kind | Module spec |
| Coverage score | 91% assessed 2026-08-05 — cache, logger, RxJS utils, polyfills with operation-group sequences documented |
| Generated from | `module-spec` @ SDLC template library `0.2.2` |
| generated_by / approved_by / updated_at | cursor-agent / Akula Uday / 2026-08-05 |
| Validation status | not-run — pending codex-agent Session B at committed HEAD (cursor preflight 2026-09-02: 0 content Blocking; unit 19/19 suites, 194/194 passed) |

## Evidence Rules

Every requirement cites concrete source evidence as `file path` only. Test evidence names `src/*.test.js` files where present.

## Source Material Register

| Source material | Scope | Decision | Detail location or disposition |
|---|---|---|---|
| Implementation | behavior | verified | Requirements, State Model, Sequence Diagram(s) |
| Not a published package surface | scope | N/A | Internal modules consumed by domain adapters |

## Overview

Shared utilities provide cross-cutting support: in-memory cache singleton for activities/conversations, leveled logger with optional console transport and browser hook, RxJS helper operators and meeting ID resolution helpers, and a MediaStream polyfill. This is **not** a trivial composition module — distinct operation groups (cache, logger) warrant separate sequence diagrams.

## Purpose / Responsibility

Owns internal helpers and singleton state used by domain adapters. **Direct npm exports** are limited to the facade default export (`WebexSDKAdapter`); domain modules import cache/logger/utils/polyfills internally. The **shared cache singleton is host-reachable** via `WebexSDKAdapter.cache` (see `webex-sdk-adapter.cache` in facade spec and manifest). Logger, RxJS utils, and polyfills remain internal-only unless another export path is added.

## Stack

JavaScript, RxJS 6 (utils operators), browser globals for logger hook and polyfills.

## Folder / Package Structure

```
src/
├── cache.js
├── logger.js
├── logger/
│   ├── logger.js
│   └── consoleTransport.js
├── utils.js
├── polyfills.js
└── ai-docs/
```

## Key Files (source of truth)

| File | Holds |
|---|---|
| `src/cache.js` | CacheMeOutside singleton — set/get/has/remove, bulk cache helpers |
| `src/logger.js` | Logger singleton wiring, console transport gate, window hook |
| `src/logger/logger.js` | createLogger, setLevel, addTransport |
| `src/logger/consoleTransport.js` | Console output transport factory |
| `src/utils.js` | RxJS operators (chainWith, combineLatestImmediate), meeting ID helpers, deepMerge, safeJsonStringify |
| `src/polyfills.js` | MediaStream.prototype.getTracks shim loaded via `src/index.js` |

## Public Surface

**Reachability:** Cache methods are **host-reachable** through `WebexSDKAdapter.cache` (`webex-sdk-adapter.cache`). Logger, utils, and polyfills are **internal-only** (direct domain imports / package side effect).

| Contract ID | Type | Surface | Purpose | Compatibility / deprecation | Schema / detail link | Root index |
|---|---|---|---|---|---|---|
| shared.cache.singleton | facade property + internal | cache singleton | Key/value store default export; also on WebexSDKAdapter.cache | stable via facade | `src/cache.js` | [`CONTRACTS.md`](../../ai-docs/CONTRACTS.md) |
| shared.cache.set | host-reachable method | `set(key, value)` | Store or update entry | stable via facade | `src/cache.js` | [`CONTRACTS.md`](../../ai-docs/CONTRACTS.md) |
| shared.cache.get | host-reachable method | `get(key)` | Retrieve entry or undefined | stable via facade | `src/cache.js` | [`CONTRACTS.md`](../../ai-docs/CONTRACTS.md) |
| shared.cache.has | host-reachable method | `has(key): boolean` | Key existence check | stable via facade | `src/cache.js` | [`CONTRACTS.md`](../../ai-docs/CONTRACTS.md) |
| shared.cache.remove | host-reachable method | `remove(key): boolean` | Delete key from cache | stable via facade | `src/cache.js` | [`CONTRACTS.md`](../../ai-docs/CONTRACTS.md) |
| shared.cache.values | host-reachable method | `values(): Iterator` | Iterate cached values | stable via facade | `src/cache.js` | [`CONTRACTS.md`](../../ai-docs/CONTRACTS.md) |
| shared.cache.size | host-reachable method | `size(): number` | Entry count | stable via facade | `src/cache.js` | [`CONTRACTS.md`](../../ai-docs/CONTRACTS.md) |
| shared.cache.keys | host-reachable method | `keys(): Iterator` | Iterate cache keys | stable via facade | `src/cache.js` | [`CONTRACTS.md`](../../ai-docs/CONTRACTS.md) |
| shared.cache.cacheConversations | host-reachable method | `cacheConversations(conversations[])` | Bulk cache SDK conversations | stable via facade | `src/cache.js` | [`CONTRACTS.md`](../../ai-docs/CONTRACTS.md) |
| shared.cache.cachActivities | host-reachable method | `cachActivities(activities[])` | Bulk cache SDK activities (typo preserved) | stable via facade | `src/cache.js` | [`CONTRACTS.md`](../../ai-docs/CONTRACTS.md) |
| shared.cache.cachSDKActivities | host-reachable method | `cachSDKActivities(sdkActivities[])` | Bulk cache SDK activity objects by id | stable via facade | `src/cache.js` | [`CONTRACTS.md`](../../ai-docs/CONTRACTS.md) |
| shared.logger.default | internal module | logger singleton (default export) | Domain debug/error logging | stable internal | `src/logger.js` | [`CONTRACTS.md`](../../ai-docs/CONTRACTS.md) |
| shared.logger.setLevel | internal method | `setLevel(level)` | Adjust log verbosity | stable internal | `src/logger/logger.js` | [`CONTRACTS.md`](../../ai-docs/CONTRACTS.md) |
| shared.logger.windowHook | internal global | `window.webexSDKAdapterSetLogLevel(level)` | Browser-only level control | stable internal | `src/logger.js` | [`CONTRACTS.md`](../../ai-docs/CONTRACTS.md) |
| shared.utils.chainWith | internal export | RxJS operator | Chain dependent observables | stable internal | `src/utils.js` | [`CONTRACTS.md`](../../ai-docs/CONTRACTS.md) |
| shared.utils.combineLatestImmediate | internal export | RxJS helper | combineLatest with startWith(undefined) per source | stable internal | `src/utils.js` | [`CONTRACTS.md`](../../ai-docs/CONTRACTS.md) |
| shared.utils.deepMerge | internal export | object merge | Meeting state updates | stable internal | `src/utils.js` | [`CONTRACTS.md`](../../ai-docs/CONTRACTS.md) |
| shared.utils.resolveMeetingID | internal export | resolveMeetingID | (meetingContext) => string | stable internal | `src/utils.js` | [`CONTRACTS.md`](../../ai-docs/CONTRACTS.md) |
| shared.utils.resolveDeviceSwitchArgs | internal export | device switch arg resolver | switch-* control compatibility | stable internal | `src/utils.js` | [`CONTRACTS.md`](../../ai-docs/CONTRACTS.md) |
| shared.utils.safeJsonStringify | internal export | circular-safe JSON.stringify | Logger transport | stable internal | `src/utils.js` | [`CONTRACTS.md`](../../ai-docs/CONTRACTS.md) |
| shared.utils.isSpeakerSupported | internal export | boolean | Feature detect setSinkId | stable internal | `src/utils.js` | [`CONTRACTS.md`](../../ai-docs/CONTRACTS.md) |
| shared.polyfills.mediaStream | internal side effect | MediaStream getTracks shim | Legacy browser guard | stable internal | `src/polyfills.js` | [`CONTRACTS.md`](../../ai-docs/CONTRACTS.md) |

## Requires (dependencies)

| Dependency | Purpose |
|---|---|
| `process.env.NODE_ENV` | Gate console transport in logger |
| Browser `window` (optional) | Log level hook |
| RxJS (utils operators) | chainWith, combineLatestImmediate |

## Requirements

| ID | WHAT | WHY | Source Evidence | Test / Example Evidence | Assumptions / Gaps | Confidence |
|---|---|---|---|---|---|---|
| SHU-R-001 | Cache is process-wide singleton Map | Share activity/conversation bodies across adapters | `src/cache.js` | `src/cache.test.js` set/get/has/remove/keys/values/size; cacheConversations/cachActivities | singleton identity across imports; WebexSDKAdapter.cache same reference; cachSDKActivities; empty bulk | PRESENT |
| SHU-R-002 | Logger defaults to level `error`; console transport added when NODE_ENV !== production | Reduce noise in production builds | `src/logger.js` | none found | none | PRESENT |
| SHU-R-003 | Browser exposes `window.webexSDKAdapterSetLogLevel` when window defined | Runtime debug control in demos | `src/logger.js` | none found | none | PRESENT |
| SHU-R-004 | `polyfills.js` imported from `src/index.js` — patches missing getTracks to empty array | Prevent throws on legacy browsers | `src/polyfills.js`, `src/index.js` | none found | none | PRESENT |
| SHU-R-005 | `resolveMeetingID` / `resolveDeviceSwitchArgs` support string ID and PR #346 context objects | Meeting control compatibility | `src/utils.js` | MeetingsSDKAdapter tests indirect | Direct unit tests sparse | PRESENT |

## Design Overview

Cache and logger are singletons imported directly. Utils exports pure functions and RxJS operators consumed heavily by MeetingsSDKAdapter. Polyfills run once at package load via index side effect.

## Data Flow

```mermaid
flowchart TD
  Activities["ActivitiesSDKAdapter"] --> Cache
  Rooms["RoomsSDKAdapter"] --> Cache
  Domain["*SDKAdapter"] --> Logger
  Meetings["MeetingsSDKAdapter"] --> Utils
  Index["src/index.js"] --> Polyfills
```

## Sequence Diagram(s)

Sequence coverage:

| Operation group | Diagram | Failure / recovery coverage |
|---|---|---|
| cache get/set/has | Cache read-through | miss → undefined; set overwrites |
| cache bulk helpers | Bulk conversation/activity cache | empty array → no-op loops |
| cache remove/iteration | remove, keys, values, size | remove missing key → false |
| logger level hook | Browser setLogLevel | N/A in Node without window |
| polyfill load | Package import side effect | no-op when getTracks exists |
| utils resolveMeetingID | Control arg resolution | bad context → undefined ID |
| utils resolveDeviceSwitchArgs | Device switch arg resolution | PR #346 context object |
| utils RxJS helpers | chainWith / combineLatestImmediate | inner subscription teardown on unsubscribe |
| utils misc | deepMerge, safeJsonStringify, isSpeakerSupported | circular JSON → placeholder string |

### cache get / set / has

```mermaid
sequenceDiagram
  participant Adapter as Domain adapter
  participant Cache as cache singleton

  Adapter->>Cache: has(key)
  alt cache hit
    Adapter->>Cache: get(key)
    Cache-->>Adapter: value
  else miss
    Adapter->>Adapter: network fetch
    Adapter->>Cache: set(key, body)
  end
```

### cache bulk helpers

```mermaid
sequenceDiagram
  participant Adapter as Rooms/Activities adapter
  participant Cache as cache singleton

  Adapter->>Cache: cacheConversations(conversations[])
  Note over Cache: each conversation.id → set(id, conv)
  Adapter->>Cache: cachActivities(activities[])
  Note over Cache: each activity.id → set(id, activity)
  Adapter->>Cache: cachSDKActivities(sdkActivities[])
  Note over Cache: each sdkActivity.id → set(id, sdkActivity)
```

### cache remove / iteration

```mermaid
sequenceDiagram
  participant Host as Host via adapter.cache
  participant Cache as cache singleton

  Host->>Cache: remove(key)
  alt key existed
    Cache-->>Host: true
  else missing
    Cache-->>Host: false
  end
  Host->>Cache: size()
  Host->>Cache: keys() / values()
```

### logger hook flow

```mermaid
sequenceDiagram
  participant Dev as Developer / host page
  participant Window as window
  participant Logger as logger singleton

  Note over Logger: init level error; console transport if non-production
  Dev->>Window: webexSDKAdapterSetLogLevel('debug')
  Window->>Logger: setLevel('debug')
  Note over Logger: subsequent domain logger.debug calls emit
```

### polyfill load

```mermaid
sequenceDiagram
  participant Host as Host bundle import
  participant Index as src/index.js
  participant Poly as polyfills.js

  Host->>Index: import WebexSDKAdapter
  Index->>Poly: side-effect import
  alt MediaStream.getTracks missing
    Poly->>Poly: assign getTracks → empty array
  else already defined
    Note over Poly: no patch applied
  end
```

### utils resolveMeetingID

```mermaid
sequenceDiagram
  participant Control as Meeting control action
  participant Utils as resolveMeetingID

  Control->>Utils: resolveMeetingID(meetingContext)
  alt string meetingID
    Utils-->>Control: meetingContext
  else context object with meetingID
    Utils-->>Control: meetingContext.meetingID
  else invalid
    Utils-->>Control: undefined
  end
```

### utils resolveDeviceSwitchArgs

```mermaid
sequenceDiagram
  participant Control as switch-* control
  participant Utils as resolveDeviceSwitchArgs

  Control->>Utils: resolveDeviceSwitchArgs(meetingContext, deviceId)
  alt string meetingID + deviceId
    Utils-->>Control: {meetingID, deviceId}
  else PR346 context object
    Utils-->>Control: normalized meetingID + deviceId
  end
```

### utils RxJS helpers (chainWith / combineLatestImmediate)

```mermaid
sequenceDiagram
  participant Meetings as MeetingsSDKAdapter
  participant Utils as chainWith / combineLatestImmediate
  participant Inner as inner Observable

  Meetings->>Utils: pipe(chainWith(fn))
  Utils->>Inner: subscribe on outer emission
  Note over Utils: on outer unsubscribe, inner torn down
  Meetings->>Utils: combineLatestImmediate(sources)
  Note over Utils: each source startWith(undefined) for immediate combine
```

### utils misc (deepMerge, safeJsonStringify, isSpeakerSupported)

```mermaid
sequenceDiagram
  participant Adapter as MeetingsSDKAdapter
  participant Utils as utils.js

  Adapter->>Utils: deepMerge(target, patch)
  Utils-->>Adapter: merged meeting state object
  Adapter->>Utils: safeJsonStringify(circularObject)
  Utils-->>Adapter: JSON string or fallback for cycles
  Note over Utils: isSpeakerSupported evaluated at module load
```

## Class / Component Relationships

```mermaid
classDiagram
  class CacheMeOutside {
    Map store
    set/get/has
    cacheConversations
    cachActivities
  }
  WebexSDKAdapter --> CacheMeOutside : cache property
  ActivitiesSDKAdapter --> CacheMeOutside
  RoomsSDKAdapter --> CacheMeOutside
  MeetingsSDKAdapter --> utils : deepMerge chainWith
```

## Use Cases

- **UC-1 Activity cache:** Activities fetch stores body by id; subsequent fetch hits cache. Evidence: `src/ActivitiesSDKAdapter.js`.
- **UC-2 Room pagination cache:** Rooms pre-cache conversations and activity bodies. Evidence: `src/RoomsSDKAdapter.js`.
- **UC-3 Debug in browser:** Call `window.webexSDKAdapterSetLogLevel('debug')`. Evidence: `src/logger.js`.

## State Model

- `CacheMeOutside.store` — unbounded in-memory Map keyed by SDK object id strings; no TTL or eviction.
- Logger holds level and transport list on singleton instance.

## Concurrency & Reactive Flow

- Cache Map mutations are synchronous; no locking — assumes single-threaded JS.
- `chainWith` operator manages nested subscription teardown on unsubscribe.

## Module Do's / Don'ts

- DO import cache singleton — do not instantiate second CacheMeOutside.
- DO use `resolveMeetingID` in meeting controls for host compatibility.
- DON'T rely on cache invalidation — stale entries persist for session lifetime.

## Pitfalls

- **Unbounded cache growth** during long sessions with many activities.
- **`cachActivities` typo** is public method name on cache — do not rename without adapter updates.
- **`isSpeakerSupported` evaluates at module load** — may be wrong if polyfills change later.

## Test-Case Strategy (module)

| Behavior / Requirement | Existing test evidence | Gap |
|---|---|---|
| SHU-R-005 | indirect via `src/MeetingsSDKAdapter.test.js` | Direct utils unit tests |
| SHU-R-001 | `src/cache.test.js` method/bulk coverage | singleton identity; facade.cache reference; cachSDKActivities |
| SHU-R-003 | none found | window hook manual/browser test |

## Traceability

- Repo architecture: [`ai-docs/ARCHITECTURE.md`](../../ai-docs/ARCHITECTURE.md) · Registry: [`ai-docs/SPEC_INDEX.md`](../../ai-docs/SPEC_INDEX.md)
- Coverage state & contracts baseline: `.sdd/manifest.json`
