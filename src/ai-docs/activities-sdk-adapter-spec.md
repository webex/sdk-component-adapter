<!-- ───────────────────────────────
  Template:     Module Spec
  Template-ID:  module-spec
  Description:  Per-module canonical spec — orientation plus requirements, design, invariants, flows, pitfalls, and tests.
  Generates:    src/ai-docs/activities-sdk-adapter-spec.md
  Library ver:  0.2.2
  Last updated: 2026-08-05
─────────────────────────────── -->

# activities-sdk-adapter — SPEC

> [`AGENTS.md`](../../AGENTS.md) · [`SPEC_INDEX.md`](../../ai-docs/SPEC_INDEX.md) · [`ARCHITECTURE.md`](../../ai-docs/ARCHITECTURE.md)

## Metadata

| Field | Value |
|---|---|
| Module id | activities-sdk-adapter |
| Source path(s) | `src/ActivitiesSDKAdapter.js` |
| Parent spec | `src/ai-docs/webex-sdk-adapter-spec.md` |
| Doc kind | Module spec |
| Coverage score | 91% assessed 2026-08-05 — getActivity, postActivity, postAction, adaptive card helpers, and per-group sequences documented |
| Generated from | `module-spec` @ SDLC template library `0.2.2` |
| generated_by / approved_by / updated_at | cursor-agent / Akula Uday / 2026-08-05 |
| Validation status | pass — independent codex-agent Session B (different-runtime), validated 2026-09-02 at 0b7bd84c0ec53004f8640093eb04519930ae31b4; Axis A+B: 0 Blocking, 0 Important, 0 Medium, 0 Minor |

## Evidence Rules

Every requirement cites concrete source evidence as `file path` only. Test evidence names `src/*.test.js` files.

## Source Material Register

| Source material | Scope | Decision | Detail location or disposition |
|---|---|---|---|
| Implementation | behavior | verified | Requirements, Error Handling, Sequence Diagram(s) |
| `@webex/component-adapter-interfaces` ActivitiesAdapter | contract | reference-only | Public Surface rows |

## Overview

`ActivitiesSDKAdapter` implements `ActivitiesAdapter`, fetching and posting conversation activities via the Webex SDK. It maps SDK activity payloads to adapter `Activity` objects, handles adaptive card encryption on post, and supports adaptive card submit actions via `postAction`.

## Purpose / Responsibility

Owns single-activity fetch (`getActivity`), activity post (`postActivity`), card action post (`postAction`), and adaptive card helper methods. Does **not** own room activity pagination or real-time room feeds (see `RoomsSDKAdapter`).

## Stack

JavaScript, RxJS 6, Webex SDK `request`, `internal.conversation`, `internal.encryption`, shared `cache` module.

## Folder / Package Structure

```
src/
├── ActivitiesSDKAdapter.js
├── ActivitiesSDKAdapter.test.js
└── ai-docs/
```

## Key Files (source of truth)

| File | Holds |
|---|---|
| `src/ActivitiesSDKAdapter.js` | getActivity, postActivity, postAction, fromSDKActivity |
| `src/ActivitiesSDKAdapter.test.js` | Unit tests |

## Public Surface

| Contract ID | Type | Surface | Purpose | Compatibility / deprecation | Schema / detail link | Root index |
|---|---|---|---|---|---|---|
| activities-adapter.class | SDK class | `ActivitiesSDKAdapter extends ActivitiesAdapter` | Domain adapter entry | stable | `src/ActivitiesSDKAdapter.js` | [`CONTRACTS.md`](../../ai-docs/CONTRACTS.md) |
| activities-adapter.getActivity | SDK method | `getActivity(ID: string): Observable<Activity>` | Fetch activity by Hydra message ID | stable | `src/ActivitiesSDKAdapter.js` | [`CONTRACTS.md`](../../ai-docs/CONTRACTS.md) |
| activities-adapter.postActivity | SDK method | `postActivity(activity: Activity): Observable<Activity>` | Post text or encrypted adaptive cards | stable | `src/ActivitiesSDKAdapter.js` | [`CONTRACTS.md`](../../ai-docs/CONTRACTS.md) |
| activities-adapter.postAction | SDK method | `postAction(activityID: string, inputs: object): Observable<Activity>` | Submit adaptive card action | stable | `src/ActivitiesSDKAdapter.js` | [`CONTRACTS.md`](../../ai-docs/CONTRACTS.md) |
| activities-adapter.hasAdaptiveCards | SDK method | `hasAdaptiveCards(activity: Activity): boolean` | True when `activity.cards.length > 0` | stable | `src/ActivitiesSDKAdapter.js` | [`CONTRACTS.md`](../../ai-docs/CONTRACTS.md) |
| activities-adapter.getAdaptiveCard | SDK method | `getAdaptiveCard(activity: Activity, cardIndex: number): object \| undefined` | Read card payload by index | stable | `src/ActivitiesSDKAdapter.js` | [`CONTRACTS.md`](../../ai-docs/CONTRACTS.md) |
| activities-adapter.fromSDKActivity | SDK export | `fromSDKActivity(sdkActivity): Activity` | SDK→adapter mapper (also used by Rooms) | stable | `src/ActivitiesSDKAdapter.js` | [`CONTRACTS.md`](../../ai-docs/CONTRACTS.md) |

## Requires (dependencies)

| Dependency | Purpose |
|---|---|
| `datasource.request` | GET activity by conversation service |
| `datasource.internal.conversation.post` / `cardAction` | Post message and card actions |
| `datasource.internal.encryption.encryptText` | Encrypt cards and action inputs |
| `src/cache.js` | Activity fetch cache, scoped per adapter instance via `cache.scope(...)` (`this.activityCache`) |

## Requirements

| ID | WHAT | WHY | Source Evidence | Test / Example Evidence | Assumptions / Gaps | Confidence |
|---|---|---|---|---|---|---|
| ACT-R-001 | `getActivity` caches observables per ID in `ReplaySubject` | Avoid duplicate fetch pipelines for same activity | `src/ActivitiesSDKAdapter.js` | `src/ActivitiesSDKAdapter.test.js` | none | PRESENT |
| ACT-R-002 | `fetchActivity` uses a cache hit before making a network request, scoped per adapter instance (`this.activityCache = cache.scope(...)` created in the constructor) so a different adapter instance/token can never read another instance's cached activity body and bypass its own authorization on `datasource.request` (SPARK-843495 / UF-001) | Reduce duplicate REST calls within one token/instance while preventing cross-tenant cache bypass | `src/ActivitiesSDKAdapter.js` | `src/ActivitiesSDKAdapter.test.js` `fetchActivity()` same-token reuse and cross-instance isolation cases | none | PRESENT |
| ACT-R-003 | Fetch failure maps to `Error: Could not find activity with ID "…"` | Consistent caller-facing not-found signal | `src/ActivitiesSDKAdapter.js` | `src/ActivitiesSDKAdapter.test.js` | none | PRESENT |
| ACT-R-004 | `postActivity` encrypts cards when `hasAdaptiveCards(activity)`; `encryptCards` validates `conversation.encryptionKeyUrl` with the shared `assertValidEncryptionKeyUrl` validator (ACT-R-006) before encrypting any card, rejecting when the URL is not an allow-listed `kms://` Webex KMS host (SPARK-843495 / UF-003) | Conversation encryption requirement for cards; never trust a server/Mercury-sourced key URL verbatim | `src/ActivitiesSDKAdapter.js` | `src/ActivitiesSDKAdapter.test.js` `postActivity()` `encryptCards` allow-list accept/reject cases | Allow-list currently seeded with `wbx2.com`; external validation required to confirm it covers every genuine Webex KMS host | PRESENT |
| ACT-R-005 | Malformed card JSON in fetch maps to fallback AdaptiveCard body; parsed card JSON is recursively sanitized to strip `__proto__`/`constructor`/`prototype` keys, then validated against an accepted type (`AdaptiveCard`) / version (`1.0`, `1.2`) / action-type (`Action.OpenUrl`, `Action.Submit`, `Action.ShowCard`) allow-list before being forwarded — a card that fails validation is replaced with the same safe fallback used for parse failures rather than forwarded verbatim (SPARK-843495 / UF-004) | UI still renders parse failure message; server/Mercury-sourced card JSON is untrusted content and must not reach the host renderer unsanitized/unvalidated (`ai-docs/SECURITY.md:50`) | `src/ActivitiesSDKAdapter.js` | `src/ActivitiesSDKAdapter.test.js` `getActivity()` prototype-pollution sanitization, disallowed type/version rejection, and valid-card-passthrough cases | Accepted type/version/action list seeded from currently-supported fixtures; external validation required to confirm it admits every currently-supported host card shape | PRESENT |
| ACT-R-006 | `postAction` validates `parentActivity.encryptionKeyUrl` against a shared `kms://` + allow-listed Webex KMS host validator (`assertValidEncryptionKeyUrl`, seeded from `wbx2.com` host evidence) before encrypting inputs with it; a non-conforming URL throws and is mapped to an observable error via the existing `catchError` (SPARK-843495 / UF-002) | Secure card action submission; never trust a server/Mercury-sourced key URL verbatim | `src/ActivitiesSDKAdapter.js` | `src/ActivitiesSDKAdapter.test.js` `postAction()` allow-list accept/reject cases | Allow-list currently seeded with `wbx2.com`; external validation required to confirm it covers every genuine Webex KMS host | PRESENT |
| ACT-R-007 | `hasAdaptiveCards` returns true iff `activity.cards.length > 0` | Gate encryption path | `src/ActivitiesSDKAdapter.js` | none found | Trivial helper | PRESENT |
| ACT-R-008 | `postAction` uses `from(this.fetchActivity(activityID))` — parent fetch starts when constructing the observable on method call, not on subscribe | Eager parent-activity load before external subscription | `src/ActivitiesSDKAdapter.js` | none found | Unsubscribed return value may still trigger fetch | PRESENT |

## Design Overview

Activities are loaded via REST `conversation/activities/{id}`, cached in module-level cache and per-ID `ReplaySubject`. Posts route through internal conversation API with optional card encryption keyed by room conversation. `fromSDKActivity` normalizes Hydra IDs and parses embedded card JSON. **`postAction` eagerly invokes `fetchActivity` when the method returns** because `from(this.fetchActivity(...))` evaluates the promise at construction time — network work may begin before any subscriber attaches.

## Data Flow

```mermaid
flowchart TD
  get["getActivity(ID)"] --> fetch["fetchActivity → request"]
  fetch --> cache["cache get/set"]
  fetch --> map["fromSDKActivity"]
  post["postActivity"] --> enc["encryptCards if hasAdaptiveCards"]
  enc --> convPost["internal.conversation.post"]
  action["postAction"] --> parent["fetchActivity parent"]
  parent --> encIn["encrypt inputs"]
  encIn --> cardAction["internal.conversation.cardAction"]
```

## Sequence Diagram(s)

Sequence coverage:

| Operation group | Diagram | Failure / recovery coverage |
|---|---|---|
| getActivity | Fetch by ID | alt: network/404 → observable error |
| postActivity | Post text or encrypted cards | alt: encrypt/post failure → rethrow |
| postAction | Card action submit | alt: parent fetch fail; encrypt fail; cardAction fail → rethrow |
| adaptive card helpers | hasAdaptiveCards / getAdaptiveCard | undefined cards → throw; index out of range → undefined |
| fromSDKActivity | SDK→adapter mapper | malformed card JSON → fallback AdaptiveCard body |

### getActivity

```mermaid
sequenceDiagram
  participant Caller
  participant Adapter as ActivitiesSDKAdapter
  participant Cache as cache
  participant API as datasource.request

  Caller->>Adapter: getActivity(ID)
  Adapter->>Cache: has(deconstructed id)
  alt cache hit
    Cache-->>Adapter: body
  else cache miss
    Adapter->>API: GET conversation/activities/{id}
    alt failure
      API-->>Adapter: error
      Adapter-->>Caller: Error Could not find activity
    else success
      API-->>Adapter: body
      Adapter->>Cache: set(id, body)
    end
  end
  Adapter-->>Caller: Activity via fromSDKActivity
```

### postActivity

```mermaid
sequenceDiagram
  participant Caller
  participant Adapter as ActivitiesSDKAdapter
  participant Enc as internal.encryption
  participant Conv as internal.conversation

  Caller->>Adapter: postActivity(activity)
  alt hasAdaptiveCards
    Adapter->>Adapter: fetchConversation(roomID)
    Adapter->>Enc: encryptText per card
    Adapter->>Conv: post({id, cluster}, {cards, displayName})
  else text only
    Adapter->>Conv: post({id, cluster}, text)
  end
  alt post fails
    Conv-->>Adapter: error
    Adapter-->>Caller: observable error
  else success
    Adapter-->>Caller: Activity
  end
```

### postAction

```mermaid
sequenceDiagram
  participant Caller
  participant Adapter as ActivitiesSDKAdapter
  participant Enc as internal.encryption
  participant Conv as internal.conversation

  Caller->>Adapter: postAction(activityID, inputs)
  Note over Adapter: fetchActivity starts eagerly (from() evaluates promise at construction)
  Adapter->>Adapter: fetchActivity(activityID)
  alt parent fetch fails
    Adapter-->>Caller: observable error
  else parent fetch success
    Adapter->>Enc: encryptText(inputs JSON)
    alt encrypt fails
      Adapter-->>Caller: observable error
    else encrypt success
      Adapter->>Conv: cardAction(target, {inputs}, parent)
      alt cardAction fails
        Conv-->>Adapter: error
        Adapter-->>Caller: observable error
      else success
        Adapter-->>Caller: Activity fromSDKActivity
      end
    end
  end
```

### adaptive card helpers

```mermaid
sequenceDiagram
  participant Caller
  participant Adapter as ActivitiesSDKAdapter

  Caller->>Adapter: hasAdaptiveCards(activity)
  alt activity.cards undefined
    Adapter-->>Caller: throws (length access)
  else cards.length > 0
    Adapter-->>Caller: true
  else empty
    Adapter-->>Caller: false
  end
  Caller->>Adapter: getAdaptiveCard(activity, cardIndex)
  alt index valid
    Adapter-->>Caller: cards[cardIndex] object
  else out of range
    Adapter-->>Caller: undefined
  end
```

### fromSDKActivity mapper

```mermaid
sequenceDiagram
  participant Caller
  participant Adapter as ActivitiesSDKAdapter

  Caller->>Adapter: fromSDKActivity(sdkActivity)
  alt card JSON parse fails
    Adapter-->>Caller: Activity with fallback AdaptiveCard error body
  else success
    Adapter-->>Caller: normalized Activity (Hydra IDs, parsed cards)
  end
```

## Class / Component Relationships

```mermaid
classDiagram
  ActivitiesAdapter <|-- ActivitiesSDKAdapter
  ActivitiesSDKAdapter --> Cache : fetchActivity
  ActivitiesSDKAdapter --> ConversationAPI : post/cardAction
  RoomsSDKAdapter ..> ActivitiesSDKAdapter : fromSDKActivity import
```

## Use Cases

- **UC-1 Read message:** `getActivity(messageID)` → single Activity emission. Evidence: `src/ActivitiesSDKAdapter.test.js`.
- **UC-2 Send message/cards:** `postActivity({roomID, text, cards})` → encrypted post when cards present. Evidence: `src/ActivitiesSDKAdapter.test.js`.
- **UC-3 Card submit:** `postAction(activityID, inputs)` → encrypted action. Evidence: `src/ActivitiesSDKAdapter.test.js`.

## State Model

| State | Shape | Create / update trigger | Retention / teardown | Error behavior |
|---|---|---|---|---|
| `activityObservables` | activity Hydra ID → `ReplaySubject` pipeline | First `getActivity(ID)` creates pipeline and internal subscribe | Entry persists for adapter instance; never completes | Fetch failure → observable error on subject |
| Instance-scoped `activityCache` (via `fetchActivity`) | deconstructed activity id → SDK body, namespaced per adapter instance via `cache.scope(...)` | `activityCache.set` after successful GET; `activityCache.get` on hit before network | Backed by the process-wide `cache.js` singleton, but keys are namespaced per adapter instance so no TTL and no cross-instance/cross-token visibility (SPARK-843495 / UF-001) | Cache miss proceeds to network; 404 maps to not-found error |

- `fetchActivity` reads/writes a per-instance scoped view of shared `cache.js` (`this.activityCache = cache.scope(...)`), keyed by deconstructed activity id (`src/ActivitiesSDKAdapter.js`, `src/cache.js`).
- ReplaySubject entries are not removed when external subscribers unsubscribe.

## Concurrency & Reactive Flow

- Per-activity `ReplaySubject` created once; internal subscribe drives emissions — late subscribers receive replayed value.
- `postActivity` returns cold defer observables per call.
- **`postAction` parent fetch is eager** — `from(this.fetchActivity(activityID))` starts fetch on method call when building the returned observable, not on first subscribe.

## Error Handling & Failure Modes

| Condition | Signal (error/code/result) | Caller recovery |
|---|---|---|
| Activity fetch fails | `Error: Could not find activity with ID "…"` on observable | Verify ID; handle not found in UI |
| `postActivity` encrypt or post fails | Observable error (logged, rethrown) | Retry post; validate room/card payload |
| `postAction` parent fetch or encrypt fails | Observable error (logged, rethrown) | Ensure parent activity exists and is card message |
| Unparseable card JSON on read | Fallback AdaptiveCard in `cards` array | Display parse error text to user |

## Host Integration & Theming

Host application is `@webex/components`. Construct `WebexSDKAdapter` with an **authenticated** Webex JS SDK instance. Activity read/post methods do not require facade `connect()` / Mercury for basic REST flows. Subscribe to returned observables (`getActivity`, `postActivity`, `postAction`) in host message components; note `postAction` may start parent fetch before subscribe attaches.

## Pitfalls

- **`getActivity` ReplaySubject never completes** — long-lived cache entry for ID.
- **`hasAdaptiveCards` assumes `activity.cards` exists** — caller must supply array (may throw if undefined).
- **Card encryption requires conversation fetch** — extra round trip on every card post.
- **`postAction` fetch is eager** — calling the method without subscribing still starts `fetchActivity`.

## Test-Case Strategy (module)

| Behavior / Requirement | Existing test evidence | Gap |
|---|---|---|
| ACT-R-001, ACT-R-003 | `src/ActivitiesSDKAdapter.test.js` getActivity | none |
| ACT-R-002 | `src/ActivitiesSDKAdapter.test.js` `fetchActivity()` same-token reuse and cross-instance isolation | none |
| ACT-R-004 | postActivity with cards; `encryptCards` allow-list accept/reject cases | none |
| ACT-R-005 | Malformed card parse; sanitization/schema-allow-list cases in `getActivity()` | none |
| ACT-R-006 | postAction; `postAction()` allow-list accept/reject cases | none |
| ACT-R-007 | none found | hasAdaptiveCards edge cases |

## Traceability

- Repo architecture: [`ai-docs/ARCHITECTURE.md`](../../ai-docs/ARCHITECTURE.md) · Registry: [`ai-docs/SPEC_INDEX.md`](../../ai-docs/SPEC_INDEX.md)
- Coverage state & contracts baseline: `.sdd/manifest.json`
