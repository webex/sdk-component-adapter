<!-- ───────────────────────────────
  Template:     Module Spec
  Template-ID:  module-spec
  Generates:    src/ai-docs/rooms-sdk-adapter-spec.md
  Library ver:  0.2.1
  Last updated: 2026-08-05
─────────────────────────────── -->

# rooms-sdk-adapter — SPEC

> [`AGENTS.md`](../../AGENTS.md) · [`SPEC_INDEX.md`](../../ai-docs/SPEC_INDEX.md) · [`ARCHITECTURE.md`](../../ai-docs/ARCHITECTURE.md)

## Metadata

| Field | Value |
|---|---|
| Module id | rooms-sdk-adapter |
| Source path(s) | `src/RoomsSDKAdapter.js` |
| Doc kind | Module spec |
| Coverage score | 91% assessed 2026-08-05 — room stream, pagination with conversation.list pre-step, realtime activities, hasMoreActivities documented |
| Generated from | `module-spec` @ SDLC template library `0.2.1` |
| generated_by / approved_by / updated_at | cursor-agent / SDLC bootstrap PR #354 review / 2026-08-05 |
| Validation status | not-run |

## Evidence Rules

Every requirement cites concrete source evidence as `file path` only. Test evidence names `src/*.test.js` files.

## Source Material Register

| Source material | Scope | Decision | Detail location or disposition |
|---|---|---|---|
| Implementation | behavior | verified | Requirements, Data Flow, Sequence Diagram(s), Error Handling |
| `@webex/component-adapter-interfaces` RoomsAdapter | contract | reference-only | Public Surface rows |

## Overview

`RoomsSDKAdapter` implements `RoomsAdapter`, exposing room metadata streams, room creation, paginated past activity ID chunks, and real-time activity ID notifications. Past activity pagination first calls `internal.conversation.list()` once to pre-cache conversations before `listActivities`.

## Purpose / Responsibility

Owns room observables, activity ID pagination, and Mercury-backed live activity notifications. Does **not** own full activity body fetch (see `ActivitiesSDKAdapter`) or membership rosters.

## Stack

JavaScript, RxJS 6, Webex SDK `rooms` plugin, `internal.conversation`, Mercury, shared `cache`, `fromSDKActivity` mapper.

## Folder / Package Structure

```
src/
├── RoomsSDKAdapter.js
├── RoomsSDKAdapter.test.js
├── RoomsSDKAdapter.integration.test.js
└── ai-docs/
```

## Key Files (source of truth)

| File | Holds |
|---|---|
| `src/RoomsSDKAdapter.js` | getRoom, createRoom, getPastActivities, hasMoreActivities, getActivitiesInRealTime |
| `src/RoomsSDKAdapter.test.js` | Unit tests |

## Public Surface

| Contract ID | Type | Surface | Purpose | Compatibility / deprecation | Schema / detail link | Root index |
|---|---|---|---|---|---|---|
| rooms-adapter.class | SDK class | `RoomsSDKAdapter extends RoomsAdapter` | Domain adapter entry | stable | `src/RoomsSDKAdapter.js` | [`CONTRACTS.md`](../../ai-docs/CONTRACTS.md) |
| rooms-adapter.getRoom | SDK method | `getRoom(ID: string): Observable<Room>` | Room metadata + websocket updates | stable | `src/RoomsSDKAdapter.js` | [`CONTRACTS.md`](../../ai-docs/CONTRACTS.md) |
| rooms-adapter.createRoom | SDK method | `createRoom(room: Room): Observable<Room>` | Create space | stable | `src/RoomsSDKAdapter.js` | [`CONTRACTS.md`](../../ai-docs/CONTRACTS.md) |
| rooms-adapter.getPastActivities | SDK method | `getPastActivities(ID: string, activityLimit?: number): Observable<string[]>` | Paginated activity ID chunks (newest first) | stable; default limit 50 | `src/RoomsSDKAdapter.js` | [`CONTRACTS.md`](../../ai-docs/CONTRACTS.md) |
| rooms-adapter.hasMoreActivities | SDK method | `hasMoreActivities(ID: string): boolean` | Pagination cursor; triggers fetch when true | stable | `src/RoomsSDKAdapter.js` | [`CONTRACTS.md`](../../ai-docs/CONTRACTS.md) |
| rooms-adapter.getActivitiesInRealTime | SDK method | `getActivitiesInRealTime(ID: string): Observable<string>` | Live activity IDs via Mercury | stable | `src/RoomsSDKAdapter.js` | [`CONTRACTS.md`](../../ai-docs/CONTRACTS.md) |

## Requires (dependencies)

| Dependency | Purpose |
|---|---|
| `datasource.rooms.get` / `create` / `listen` / `stopListening` | Room CRUD and update events |
| `datasource.internal.conversation.list()` | One-time conversation pre-cache before first activity pagination |
| `datasource.internal.conversation.listActivities` | Paginated activity fetch per room |
| `datasource.internal.mercury` `event:conversation.activity` | Real-time activity notifications |
| `src/cache.js` | Conversation and activity body cache |
| Facade `connect()` (Mercury) | Required for `getActivitiesInRealTime` |

## Requirements

| ID | WHAT | WHY | Source Evidence | Test / Example Evidence | Assumptions / Gaps | Confidence |
|---|---|---|---|---|---|---|
| ROM-R-001 | First `fetchActivities` calls `internal.conversation.list()` once, then `cache.cacheConversations` | Pre-cache conversations before listActivities (legacy SDK requirement) | `src/RoomsSDKAdapter.js` | none found | conversation.list failure path untested | PRESENT |
| ROM-R-002 | `fetchActivities` requests `activityLimit + 1` items to detect more pages | Enables hasMore without extra guesswork | `src/RoomsSDKAdapter.js` | `src/RoomsSDKAdapter.test.js` | none | PRESENT |
| ROM-R-003 | Missing room ID on getPastActivities returns throwError | Fail fast on invalid input | `src/RoomsSDKAdapter.js` | none found | none | PRESENT |
| ROM-R-004 | `getRoom` uses refCounted listen/stopListening with listenerCount | SDK rooms.listen is global — ref-count shared listener | `src/RoomsSDKAdapter.js` | `src/RoomsSDKAdapter.test.js` | Multi-subscriber stopListening edge similar to memberships | WEAK |
| ROM-R-005 | `hasMoreActivities` triggers `fetchPastActivities` when hasMore true | Pull-based pagination driver | `src/RoomsSDKAdapter.js` | none found | none | PRESENT |
| ROM-R-006 | Real-time handler filters Mercury events by deconstructed room UUID | Only emit activities for subscribed room | `src/RoomsSDKAdapter.js` | none found | Mercury path untested in unit tests | PRESENT |

## Design Overview

Room metadata streams concat initial REST fetch with `rooms` plugin `updated` events. Past activities use a Subject per room ID with side-effecting fetch triggered by `hasMoreActivities`. Module-level `FETCHED_CONVERSATIONS` flag ensures conversation list runs once per page load.

## Data Flow

```mermaid
flowchart TD
  getRoom["getRoom(ID)"] --> fetch["rooms.get"]
  fetch --> listen["rooms.listen + updated events"]
  past["getPastActivities"] --> subject["Subject per room"]
  hasMore["hasMoreActivities"] --> fetchPast["fetchPastActivities"]
  fetchPast --> convList["internal.conversation.list (once)"]
  convList --> cacheConv["cache.cacheConversations"]
  cacheConv --> listAct["internal.conversation.listActivities"]
  realtime["getActivitiesInRealTime"] --> mercury["Mercury event:conversation.activity"]
```

## Sequence Diagram(s)

Sequence coverage:

| Operation group | Diagram | Failure / recovery coverage |
|---|---|---|
| getRoom | Fetch + websocket updates | finalize stops listening when refCount zero |
| getPastActivities | Pagination with conversation.list pre-step | alt: missing ID → throwError; empty data → complete |
| getActivitiesInRealTime | Mercury subscription | alt: missing ID → throwError |
| createRoom | Create space | alt: create error → rethrow |

### getRoom

```mermaid
sequenceDiagram
  participant Caller
  participant Adapter as RoomsSDKAdapter
  participant Rooms as rooms.get / listen
  participant WS as rooms updated event

  Caller->>Adapter: getRoom(ID)
  Adapter->>Adapter: startListeningToRoomUpdates (listenerCount++)
  Adapter->>Rooms: get(ID)
  Rooms-->>Adapter: room
  Adapter-->>Caller: Room
  WS-->>Adapter: updated (matching ID)
  Adapter->>Rooms: get(ID) refetch
  Adapter-->>Caller: updated Room
  Note over Adapter: finalize on last unsubscribe decrements listenerCount, may stopListening
```

### getPastActivities (includes conversation.list pre-step)

```mermaid
sequenceDiagram
  participant Caller
  participant Adapter as RoomsSDKAdapter
  participant ConvList as internal.conversation.list
  participant Cache as cache
  participant ListAct as internal.conversation.listActivities

  Caller->>Adapter: getPastActivities(ID, limit)
  Caller->>Adapter: hasMoreActivities(ID)
  alt first pagination ever and not FETCHED_CONVERSATIONS
    Adapter->>ConvList: list()
    alt conversation.list fails
      ConvList-->>Adapter: rejected promise
      Note over Adapter: error propagates to fetchPastActivities subscriber
    else success
      ConvList-->>Adapter: conversations[]
      Adapter->>Cache: cacheConversations
    end
  end
  Adapter->>ListAct: listActivities({conversationId, limit+1, ...})
  ListAct-->>Adapter: activities[]
  Adapter->>Adapter: update hasMore, earliestActivityDate
  Adapter-->>Caller: activity ID chunk (newest first)
```

### getActivitiesInRealTime

```mermaid
sequenceDiagram
  participant Caller
  participant Adapter as RoomsSDKAdapter
  participant Mercury as mercury event:conversation.activity

  Caller->>Adapter: getActivitiesInRealTime(ID)
  alt missing ID
    Adapter-->>Caller: throwError
  else success
    Mercury-->>Adapter: activity (target matches room UUID)
    Adapter-->>Caller: activity ID string
  end
```

### createRoom

```mermaid
sequenceDiagram
  participant Caller
  participant Adapter as RoomsSDKAdapter
  participant Rooms as rooms.create

  Caller->>Adapter: createRoom(room)
  Adapter->>Rooms: create(room)
  alt failure
    Rooms-->>Adapter: error
    Adapter-->>Caller: observable error
  else success
    Rooms-->>Adapter: sdkRoom
    Adapter-->>Caller: Room via fromSDKroom
  end
```

## Class / Component Relationships

```mermaid
classDiagram
  RoomsAdapter <|-- RoomsSDKAdapter
  RoomsSDKAdapter --> RoomsPlugin : get/create/listen
  RoomsSDKAdapter --> ConversationAPI : list / listActivities
  RoomsSDKAdapter --> Mercury : conversation.activity
  RoomsSDKAdapter --> Cache : cacheConversations / cachActivities
```

## Use Cases

- **UC-1 Room header:** `getRoom(id)` → initial room + live title/type updates. Evidence: `src/RoomsSDKAdapter.test.js`.
- **UC-2 Message history:** `getPastActivities` + repeated `hasMoreActivities` → ID chunks. Evidence: `src/RoomsSDKAdapter.js`.
- **UC-3 Live timeline:** `getActivitiesInRealTime` → new activity IDs. Evidence: `src/RoomsSDKAdapter.js`.
- **UC-4 Create space:** `createRoom({title})` → single emission. Evidence: `src/RoomsSDKAdapter.test.js`.

## Concurrency & Reactive Flow

- `getRoom` observables per ID use `publishReplay(1)` + `refCount()`; finalize decrements global `listenerCount` for rooms.listen.
- `getPastActivities` Subject is shared per room; concurrent `hasMoreActivities` calls may overlap fetches — no explicit in-flight guard.
- `FETCHED_CONVERSATIONS` module flag is process-wide singleton state.

## Error Handling & Failure Modes

| Condition | Signal (error/code/result) | Caller recovery |
|---|---|---|
| Missing ID on `getPastActivities` / `getActivitiesInRealTime` | `throwError` with message containing Must provide room ID | Validate ID before subscribe |
| Missing ID on `fetchPastActivities` internal | Subject error `fetchPastActivities - Must provide room ID` | Same as above |
| `createRoom` SDK failure | Observable error (logged, rethrown) | Show create failure to user |
| `internal.conversation.list()` failure on first pagination | Unhandled rejection in fetchPastActivities subscription | Retry pagination; ensure SDK conversation plugin healthy |
| `listActivities` returns falsy | Past activities Subject completes | End of history |
| No more activities (`hasMore` false) | `hasMoreActivities` completes Subject | Stop requesting pages |

## Pitfalls

- **Conversation list pre-step is global once per page** — failure blocks all first-time pagination until reload.
- **`hasMoreActivities` side-effects fetch** — not a pure predicate; calling it drives network I/O.
- **Real-time cache never removes Mercury listener** — long-lived handler per room ID subscribed.

## Test-Case Strategy (module)

| Behavior / Requirement | Existing test evidence | Gap |
|---|---|---|
| ROM-R-002 | `src/RoomsSDKAdapter.test.js` pagination | conversation.list pre-step ROM-R-001 |
| ROM-R-004 | getRoom listen tests | Multi-subscriber listenerCount |
| ROM-R-003 | none found | Missing ID negative tests |
| ROM-R-006 | none found | Mercury realtime unit test |

## Traceability

- Repo architecture: [`ai-docs/ARCHITECTURE.md`](../../ai-docs/ARCHITECTURE.md) · Registry: [`ai-docs/SPEC_INDEX.md`](../../ai-docs/SPEC_INDEX.md)
- Coverage state & contracts baseline: `.sdd/manifest.json`
