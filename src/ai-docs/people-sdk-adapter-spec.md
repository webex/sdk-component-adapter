<!-- ───────────────────────────────
  Template:     Module Spec
  Template-ID:  module-spec
  Generates:    src/ai-docs/people-sdk-adapter-spec.md
  Library ver:  0.2.1
  Last updated: 2026-08-05
─────────────────────────────── -->

# people-sdk-adapter — SPEC

> [`AGENTS.md`](../../AGENTS.md) · [`SPEC_INDEX.md`](../../ai-docs/SPEC_INDEX.md) · [`ARCHITECTURE.md`](../../ai-docs/ARCHITECTURE.md)

## Metadata

| Field | Value |
|---|---|
| Module id | people-sdk-adapter |
| Source path(s) | `src/PeopleSDKAdapter.js` |
| Doc kind | Module spec |
| Coverage score | 91% assessed 2026-08-05 — getMe/getPerson/searchPeople, presence wiring, error propagation, and per-operation sequences documented |
| Generated from | `module-spec` @ SDLC template library `0.2.1` |
| generated_by / approved_by / updated_at | cursor-agent / Akula Uday / 2026-08-05 |
| Validation status | Pass, validator `codex-agent`, assessed 2026-08-05 at 5926e8e — 0 Blocking, 0 Important, 0 Medium, 0 Minor; unit tests 19/19 suites, 194/194 passed |

## Evidence Rules

Every requirement cites concrete source evidence as `file path` only. Test evidence names `src/*.test.js` files. Unverified behavior is recorded under Assumptions / Gaps.

## Source Material Register

| Source material | Scope | Decision | Detail location or disposition |
|---|---|---|---|
| Implementation | behavior | verified | Requirements, Concurrency, Error Handling, Sequence Diagram(s) |
| `@webex/component-adapter-interfaces` PeopleAdapter | contract | reference-only | Public Surface rows; no inherited unsupported methods on this adapter |

## Overview

`PeopleSDKAdapter` implements `PeopleAdapter`, exposing person profiles and presence status as RxJS observables backed by the Webex JS SDK `people` plugin and internal Apheleia presence service. `getMe` returns a one-shot enriched profile; `getPerson` multicasts a hot stream with live Mercury-driven presence updates; `searchPeople` maps directory list results.

## Purpose / Responsibility

Owns person profile observables (`getMe`, `getPerson`) and people search. Does **not** own membership rosters, meeting participant state, or organization records.

## Stack

JavaScript, RxJS 6, Webex SDK `people` and `internal.presence` plugins, Mercury for `event:apheleia.subscription_update`, `@webex/common` Hydra helpers.

## Folder / Package Structure

```
src/
├── PeopleSDKAdapter.js
├── PeopleSDKAdapter.test.js
├── PeopleSDKAdapter.integration.test.js
└── ai-docs/
```

## Key Files (source of truth)

| File | Holds |
|---|---|
| `src/PeopleSDKAdapter.js` | getMe, getPerson, searchPeople, presence wiring |
| `src/PeopleSDKAdapter.test.js` | Unit tests including error paths |

## Public Surface

| Contract ID | Type | Surface | Purpose | Compatibility / deprecation | Schema / detail link | Root index |
|---|---|---|---|---|---|---|
| people-adapter.class | SDK class | `PeopleSDKAdapter extends PeopleAdapter` | Domain adapter entry | stable; semver via npm bundle | `src/PeopleSDKAdapter.js` | [`CONTRACTS.md`](../../ai-docs/CONTRACTS.md) |
| people-adapter.getMe | SDK method | `getMe(): Observable<Person>` | Current access-token bearer profile + optional status | stable; additive Person fields only | `src/PeopleSDKAdapter.js` | [`CONTRACTS.md`](../../ai-docs/CONTRACTS.md) |
| people-adapter.getPerson | SDK method | `getPerson(ID: string): Observable<Person>` | Profile + live presence for a person ID | stable | `src/PeopleSDKAdapter.js` | [`CONTRACTS.md`](../../ai-docs/CONTRACTS.md) |
| people-adapter.searchPeople | SDK method | `searchPeople(query: string): Observable<Person[]>` | Directory search by display name | stable | `src/PeopleSDKAdapter.js` | [`CONTRACTS.md`](../../ai-docs/CONTRACTS.md) |

Compatibility notes:

- Person shape follows `@webex/component-adapter-interfaces` `Person`; adapter maps `orgId` → `orgID`.
- Presence `status` uses `PersonStatus` enum keys or `null` when unavailable.

## Requires (dependencies)

| Dependency | Purpose |
|---|---|
| `datasource.people.get` / `list` | Profile fetch and search |
| `datasource.internal.presence.get` | One-shot status for `getMe` |
| `datasource.internal.presence.subscribe` / `unsubscribe` | Apheleia subscription for `getPerson` |
| `datasource.internal.mercury` event `event:apheleia.subscription_update` | Live presence push updates |
| Facade `connect()` (Mercury) | Required for live `getPerson` status updates after initial emission |

## Requirements

| ID | WHAT | WHY | Source Evidence | Test / Example Evidence | Assumptions / Gaps | Confidence |
|---|---|---|---|---|---|---|
| PPL-R-001 | `getPerson` multicasts via `publishReplay(1)` + `refCount()` per person ID | Share one hot pipeline; replay last person snapshot to late subscribers | `src/PeopleSDKAdapter.js` | none found | publishReplay semantics not directly asserted | PRESENT |
| PPL-R-002 | Initial presence for `getPerson` uses `internal.presence.subscribe(personUUID)` | SDK internal Apheleia API for subscription-based presence | `src/PeopleSDKAdapter.js` | `src/PeopleSDKAdapter.test.js` | Subscribe API shape not mocked explicitly | PRESENT |
| PPL-R-003 | Live presence updates listen to Mercury `event:apheleia.subscription_update` filtered by person UUID | Push updates without polling people API | `src/PeopleSDKAdapter.js` | none found | Mercury event path untested in unit tests | PRESENT |
| PPL-R-004 | `getMe` calls `internal.presence.get([person.id])` but `fetchPerson` returns `{ ID, … }` (no lowercase `id`) — effective argument is `[undefined]` | Implementation/spec mismatch; status path depends on catch/null fallback | `src/PeopleSDKAdapter.js` | `src/PeopleSDKAdapter.test.js` | Unit mock ignores presence.get argument | PRESENT |
| PPL-R-005 | Presence subscribe/get failures yield `status: null` without failing the person observable on initial enrichment | Profile still usable when presence disabled | `src/PeopleSDKAdapter.js` | `src/PeopleSDKAdapter.test.js` | none | PRESENT |
| PPL-R-006 | `people.get` failure in `getMe`/`getPerson` propagates as observable error | Caller must handle unknown or inaccessible person | `src/PeopleSDKAdapter.js` | `src/PeopleSDKAdapter.test.js` | none | PRESENT |
| PPL-R-007 | `people.list` failure in `searchPeople` propagates via `catchError` rethrow | Search errors must not silently return empty | `src/PeopleSDKAdapter.js` | `src/PeopleSDKAdapter.test.js` | none | PRESENT |
| PPL-R-008 | Finalize on `getPerson` calls `presence.unsubscribe(personUUID)`; failure logged as warn only | Cleanup when refCount reaches zero | `src/PeopleSDKAdapter.js` | `src/PeopleSDKAdapter.test.js` | Unsubscribe failure path untested | PRESENT |
| PPL-R-009 | Normal `getPerson` subscription performs **two** `people.get` calls — `person$` is subscribed in `personWithStatus$` flatMap and again when `concat` advances to `personUpdate$` flatMap | Duplicate network work on every new subscriber pipeline | `src/PeopleSDKAdapter.js` | none found | Characterization gap — not asserted in tests | PRESENT |

## Design Overview

`getPerson` builds a pipeline: `defer(() => fetchPerson)` as shared `person$`, merge initial Apheleia subscription status via `personWithStatus$` (which flatMaps over `person$`), then `concat` to `personUpdate$` (which flatMaps over `person$` again for Mercury-driven status). Because `person$` is a cold defer, **each flatMap subscription triggers a separate `people.get` call** — a normal subscription performs two fetches before live updates. The composed stream is multicasted via `publishReplay(1)` + `refCount()`. `getMe` is a cold `defer` chain that completes after one enriched emission. `searchPeople` maps SDK list pages through `fromSDKPeople`.

## Data Flow

```mermaid
flowchart TD
  getPerson["getPerson(ID)"] --> aph["presence.subscribe UUID"]
  aph --> fetch1["first people.get via personWithStatus$ flatMap"]
  fetch1 --> emit1["initial Person emission"]
  emit1 --> fetch2["second people.get via personUpdate$ flatMap"]
  fetch2 --> mercury["Mercury apheleia updates"]
  mercury --> pr["publishReplay(1) + refCount"]
  getMe["getMe()"] --> meFetch["fetchPerson('me')"]
  meFetch --> presGet["presence.get([undefined]) — person.id missing"]
  search["searchPeople"] --> list["people.list"]
```

## Sequence Diagram(s)

Sequence coverage:

| Operation group | Diagram | Failure / recovery coverage |
|---|---|---|
| getMe | getMe — one-shot profile | alt: people.get error; presence.get with undefined ID → catch → null status |
| getPerson | getPerson — subscribe + Mercury | alt: `people.get` error → propagate; presence subscribe error → null status |
| searchPeople | searchPeople — directory list | alt: `people.list` error → rethrow |

### getMe

```mermaid
sequenceDiagram
  participant Caller
  participant Adapter as PeopleSDKAdapter
  participant People as people.get
  participant Presence as internal.presence.get

  Caller->>Adapter: getMe()
  Adapter->>People: get('me')
  alt people.get fails
    People-->>Adapter: error
    Adapter-->>Caller: observable error
  else success
    People-->>Adapter: profile with ID field
    Note over Adapter: code reads person.id (undefined); calls presence.get([undefined])
    Adapter->>Presence: get([undefined])
    alt presence.get fails or returns empty
      Presence-->>Adapter: error (caught)
      Adapter-->>Caller: Person, status null
    else success
      Presence-->>Adapter: status
      Adapter-->>Caller: Person with status
    end
  end
```

### getPerson

```mermaid
sequenceDiagram
  participant Caller
  participant Adapter as PeopleSDKAdapter
  participant Apheleia as presence.subscribe
  participant People as people.get
  participant Mercury as mercury event:apheleia.subscription_update

  Caller->>Adapter: getPerson(ID)
  Note over Adapter: person$ = defer(fetchPerson) — cold; each flatMap subscribes anew
  Adapter->>Apheleia: subscribe(personUUID) — personWithStatus$ runs first
  alt subscribe fails
    Apheleia-->>Adapter: error (caught → status null)
  else success
    Apheleia-->>Adapter: initial status
  end
  Note over Adapter: both presence outcomes share flatMap path
  Adapter->>People: get(ID) — first fetch via personWithStatus$ flatMap
  alt people.get fails
    People-->>Adapter: error
    Adapter-->>Caller: observable error
  else success
    People-->>Adapter: profile (first fetch)
    Adapter-->>Caller: Person with status (or null if presence failed)
    Note over Adapter: concat advances to personUpdate$
    Adapter->>People: get(ID) — second fetch via personUpdate$ flatMap
    People-->>Adapter: profile (second fetch)
    Mercury-->>Adapter: subscription_update (matching UUID)
    Adapter-->>Caller: updated Person status
  end
```

### searchPeople

```mermaid
sequenceDiagram
  participant Caller
  participant Adapter as PeopleSDKAdapter
  participant People as people.list

  Caller->>Adapter: searchPeople(query)
  Adapter->>People: list({displayName: query})
  alt people.list fails
    People-->>Adapter: error
    Adapter-->>Caller: observable error (rethrown)
  else success
    People-->>Adapter: items page
    Adapter-->>Caller: Person[]
  end
```

## Class / Component Relationships

```mermaid
classDiagram
  PeopleAdapter <|-- PeopleSDKAdapter
  PeopleSDKAdapter --> PeoplePlugin : people.get/list
  PeopleSDKAdapter --> PresencePlugin : subscribe/get/unsubscribe
  PeopleSDKAdapter --> Mercury : apheleia events
```

## Use Cases

- **UC-1 Current user:** `getMe()` → profile + optional status → completes. Evidence: `src/PeopleSDKAdapter.test.js`.
- **UC-2 Contact card:** `getPerson(id)` → initial profile + live presence until unsubscribe. Evidence: `src/PeopleSDKAdapter.js`, `src/PeopleSDKAdapter.test.js`.
- **UC-3 Typeahead search:** `searchPeople(query)` → array or propagated SDK error. Evidence: `src/PeopleSDKAdapter.test.js`.

## State Model

- `getPersonObservables` — map of person Hydra ID → cached `publishReplay(1)` + `refCount()` pipeline per ID; entry deleted on finalize after last unsubscribe.
- Presence subscription state is tied to each cached pipeline lifetime (subscribe on first pipeline build, unsubscribe on finalize).

## Concurrency & Reactive Flow

- `getPerson` per-ID cache stores refCounted hot observable; last unsubscribe triggers `finalize` cleanup and deletes cache entry.
- **`person$` is cold defer** — subscribed twice per normal pipeline (`personWithStatus$` then `personUpdate$`), producing two `people.get` calls before Mercury updates.
- Mercury events filtered by `event.data.subject === personUUID` — ordering follows SDK event delivery.
- `getMe` and `searchPeople` are cold per subscription.

## Error Handling & Failure Modes

| Condition | Signal (error/code/result) | Caller recovery |
|---|---|---|
| `people.get` fails in `getMe` or `getPerson` | Observable error from underlying SDK rejection | Handle in subscriber `error` callback; do not assume person exists |
| `people.list` fails in `searchPeople` | Observable error (logged then rethrown) | Surface search failure to user; retry or adjust query |
| `internal.presence.get` fails in `getMe` | Emits Person with `status: null` | Treat as presence unavailable; profile still valid |
| `getMe` passes undefined to `presence.get` | Effective `[undefined]` because `fetchPerson` sets `ID` not `id` | Do not assume valid presence lookup; status may be null even when presence works for other paths |
| `internal.presence.subscribe` fails in `getPerson` initial path | Emits Person with `status: null` then continues Mercury path if connected | Same as above; live updates may still arrive via Mercury |
| `presence.unsubscribe` fails on finalize | Warn logged; cache entry still deleted | No caller action; may leave orphan Apheleia subscription if presence disabled |

## Host Integration & Theming

Host application is `@webex/components`. Pass an **authenticated** Webex JS SDK instance to `WebexSDKAdapter`. Await facade `connect()` before relying on live `getPerson` presence updates — Mercury must be connected (`device.register` → `mercury.connect`). Subscribe to `getPerson(id)` / `getMe()` observables in host components; unsubscribe on unmount to trigger presence cleanup. `searchPeople(query)` is cold per subscription and does not require Mercury.

## Pitfalls

- **Mercury must be connected** (facade `connect()`) for live `getPerson` status updates after initial emission.
- **`getPerson` performs two `people.get` calls** on a normal subscription — duplicate fetch is current behavior, not a single-shot cache.
- **`getMe` uses `person.id` but adapter Person uses `ID`** — presence lookup receives `undefined` unless SDK/mock masks it; likely bug vs intended `person.ID`.
- **`getMe` uses `presence.get`, not subscribe** — status will not live-update for current user via this method.
- **Presence unsubscribe failures are swallowed** when user has presence disabled — cache entry still deleted on finalize.

## Test-Case Strategy (module)

| Behavior / Requirement | Existing test evidence | Gap |
|---|---|---|
| PPL-R-004, PPL-R-005 | `src/PeopleSDKAdapter.test.js` getMe — positive emit; negative presence error → null status | Assert actual argument to presence.get (should be person ID, not undefined) |
| PPL-R-006 | `src/PeopleSDKAdapter.test.js` getPerson — negative people plug-in error | none |
| PPL-R-007 | `src/PeopleSDKAdapter.test.js` searchPeople — negative SDK failure | none |
| PPL-R-008 | `src/PeopleSDKAdapter.test.js` — stops listening on unsubscribe | Negative unsubscribe failure |
| PPL-R-001 | none found | Assert shared subscription across two subscribers |

## Traceability

- Repo architecture: [`ai-docs/ARCHITECTURE.md`](../../ai-docs/ARCHITECTURE.md) · Registry: [`ai-docs/SPEC_INDEX.md`](../../ai-docs/SPEC_INDEX.md)
- Coverage state & contracts baseline: `.sdd/manifest.json`
