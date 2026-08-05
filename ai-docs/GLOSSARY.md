<!-- ───────────────────────────────
  Template:     Glossary
  Template-ID:  glossary
  Generates:    ai-docs/GLOSSARY.md
  Library ver:  0.2.1
  Last updated: 2026-08-05
─────────────────────────────── -->

# GLOSSARY — @webex/sdk-component-adapter

> Entry: [`AGENTS.md`](../AGENTS.md) · Router: [`SPEC_INDEX.md`](SPEC_INDEX.md) · Data: [`DATA_MODEL.md`](DATA_MODEL.md) · Contracts: [`CONTRACTS.md`](CONTRACTS.md)

> Read this before naming anything. Use the canonical name exactly; never introduce a synonym.

## Domain Terms

| Term | Definition (one or two sentences) | Authoritative location (file/type) | Notes / synonyms to avoid |
|---|---|---|---|
| Adapter | Class implementing a `@webex/component-adapter-interfaces` contract for one Webex domain | `src/*SDKAdapter.js` | Not "wrapper" in specs — use Adapter |
| WebexSDKAdapter | Facade wiring domain adapters; owns connect/disconnect lifecycle | `src/WebexSDKAdapter.js` | Default npm export |
| Datasource / SDK | Authenticated Webex JS SDK instance injected by the host | Host application | Not stored credentials in this repo |
| Observable | RxJS stream returned by adapter query methods | `rxjs` peer; adapter methods | Not Promise unless documented |
| Activity | Message or card payload in a room conversation | `ActivitiesSDKAdapter`, `RoomsSDKAdapter` | Mapped via `fromSDKActivity` |
| Meeting control | UI action helper (join, mute, share, etc.) delegating to MeetingsSDKAdapter | `src/MeetingsSDKAdapter/controls/` | Runtime keys like `share-screen` |
| Hydra ID | Webex resource identifier string (type + UUID) | `@webex/common` helpers | Used in adapter public IDs |
| cache.js | Process-wide in-memory Map for activity/conversation fetch deduplication | `src/cache.js` | Only Activities and Rooms adapters use it |
| Mercury | Webex websocket event channel via SDK `internal.mercury` | `src/WebexSDKAdapter.js` | Real-time events (presence, activities) |
| Apheleia | Presence subscription service used by People adapter | `src/PeopleSDKAdapter.js` | Not generic "presence plugin" in specs |
| keep-separate | SDD policy: legacy README/CHANGELOG remain reference-only | `.sdd/manifest.json` | Canonical specs live under `ai-docs/` and `src/ai-docs/` |

## Abbreviations & Acronyms

| Abbreviation | Expansion | Meaning in this repo |
|---|---|---|
| SDK | Software Development Kit | Webex JS SDK (`webex` peer) |
| UMD | Universal Module Definition | Browser global bundle format |
| ESM | ECMAScript Modules | `dist/webexSDKComponentAdapter.esm.js` |
| CI | Continuous Integration | CircleCI workflow `setup_test_release` |
| SDD | Spec-Driven Development | Canonical docs + manifest in `.sdd/` |
| PII | Personally Identifiable Information | Activity text, display names — treat logs as sensitive |
| RxJS | Reactive Extensions for JavaScript | Observable streams for all adapter queries |

## Context-Specific Meanings

| Term | Context / module | Meaning here |
|---|---|---|
| ReplaySubject | Activities adapter | Unbounded per-activity-id multicast cache for `getActivity` |
| publishReplay(1)/refCount | People, Rooms adapters | Shared hot observable for entity-by-ID with one replayed value |
| listen / updated | Rooms adapter | SDK rooms plugin listener for room metadata changes (not Mercury) |
| members:update | Memberships adapter (meetings) | SDK meeting event with `payload.full` member list |

## Maintenance

- When a new domain concept is introduced (entity, event, control key, cache), add it here in the same change.
- Cross-reference: in-memory entities and caches → `DATA_MODEL.md`; exported symbols → `CONTRACTS.md`.
- Deprecated or renamed terms: add to **Deprecated / Renamed Terms** when old names remain in code comments.
