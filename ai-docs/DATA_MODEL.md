<!-- ───────────────────────────────
  Template:     Data Model
  Template-ID:  data-model
  Description:  In-memory and adapter-shaped entities referenced across modules.
  Generates:    ai-docs/DATA_MODEL.md
  Library ver:  0.2.2
  Last updated: 2026-08-05
─────────────────────────────── -->

# DATA_MODEL — @webex/sdk-component-adapter

> Entry: [`AGENTS.md`](../AGENTS.md) · Router: [`SPEC_INDEX.md`](SPEC_INDEX.md) · Architecture: [`ARCHITECTURE.md`](ARCHITECTURE.md)

> This library does **not** own a persistent database. Webex cloud is the system of record; this document catalogs in-memory adapter shapes and caches.

## Entity Catalog

| Entity | What it represents | System-of-record (owning module) | Stored in (runtime) | Defined at |
|---|---|---|---|---|
| Activity | Room message or adaptive-card payload | Webex cloud / ActivitiesSDKAdapter maps | Observable emissions; optional `cache.js` entry | `src/ActivitiesSDKAdapter.js` |
| Room | Space metadata and activity streams | Webex cloud / RoomsSDKAdapter | Hot observables per room ID | `src/RoomsSDKAdapter.js` |
| Person | User profile and presence | Webex cloud / PeopleSDKAdapter | Hot observables per person ID | `src/PeopleSDKAdapter.js` |
| Organization | Org metadata | Webex cloud / OrganizationsSDKAdapter | ReplaySubject(1) per org ID | `src/OrganizationsSDKAdapter.js` |
| Meeting | Call state, media, roster | SDK meetings plugin / MeetingsSDKAdapter | In-memory maps on adapter instance | `src/MeetingsSDKAdapter.js` |
| Membership | Room or meeting member list | Webex cloud / MembershipsSDKAdapter | Observable list emissions | `src/MembershipsSDKAdapter.js` |
| Conversation (SDK) | Encryption context for a room | Webex cloud | `cache.js` Map entry | `src/cache.js`, `src/RoomsSDKAdapter.js` |

## Relationships

```
Webex cloud (authoritative)
    │
    ├── Room 1:N Activity (conversation thread)
    ├── Room 1:N Membership
    ├── Person 1:N Presence updates (via Apheleia/Mercury)
    ├── Organization 1:N People (org scope)
    └── Meeting 1:N Membership (in-call roster)

Adapter in-memory (derived, session-scoped)
    ├── cache.js: activity id → SDK body; conversation id → SDK conversation
    ├── Activities: activity id → ReplaySubject
    ├── People/Rooms: entity id → publishReplay(1) pipeline
    └── Meetings: meeting id → observable + SDK meeting object
```

## Ownership & Access Rules

| Entity | May write | May read | Access path |
|---|---|---|---|
| Activity (post) | ActivitiesSDKAdapter | Host via observables | `postActivity`, `postAction` |
| Activity (fetch) | Webex via SDK | ActivitiesSDKAdapter, RoomsSDKAdapter | `getActivity`, room history helpers |
| Room metadata | Webex via SDK | RoomsSDKAdapter | `getRoom`, `createRoom` |
| Person/presence | Webex via SDK | PeopleSDKAdapter | `getMe`, `getPerson`, `searchPeople` |
| Meeting state | MeetingsSDKAdapter + SDK plugin | Host via observables and controls | `getMeeting`, control keys |
| cache.js entries | Activities/Rooms adapters on fetch | Same adapters on subsequent fetch | `cache.get/set/remove` |

## Caching

| Cached data | Backend | Key | TTL | Invalidation trigger |
|---|---|---|---|---|
| Activity fetch body | `cache.js` Map | Deconstructed activity id | Process session | `cache.remove`; reload |
| Conversation object | `cache.js` Map | Deconstructed room/conversation id | Process session | `cache.remove`; reload |
| getActivity stream | ReplaySubject per id | Activity Hydra ID | Adapter instance lifetime | New adapter |
| getPerson/getRoom stream | publishReplay(1) | Entity Hydra ID | Until refCount zero | Unsubscribe all; new call |
| getOrg stream | ReplaySubject(1) | Organization Hydra ID | Adapter instance lifetime | New adapter |
| Meeting observables | Plain object map | Meeting id | Until adapter discarded | `disconnect()` unregisters plugin only; maps persist; use `leaveMeeting` for media cleanup |

## Migration Discipline

- **N/A for schema migrations** — no local database. Breaking changes to adapter-shaped objects require semver coordination and module spec updates in the same PR.
- SDK version upgrades: validate via unit and integration tests; update peer range in `package.json` when required.

## Sensitive Data

| Field class | Examples | Handling |
|---|---|---|
| PII | Activity text, display names | Do not log at info/debug in production hosts |
| Credentials | Access tokens | Host/SDK only — never in adapter source or logs |
| Encryption | Conversation encryption key URLs | Used for card encryption; never logged |

## Maintenance

- Update this catalog when adding a new cache, entity mapper, or cross-adapter shared state.
- Cross-reference: [`ARCHITECTURE.md`](ARCHITECTURE.md) Caching Catalog; module specs for per-method semantics.
