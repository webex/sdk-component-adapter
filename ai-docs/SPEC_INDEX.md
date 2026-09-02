<!-- ───────────────────────────────
  Template:     Spec Index
  Template-ID:  spec-index
  Description:  Router — which docs to load for which task and the canonical module registry.
  Generates:    ai-docs/SPEC_INDEX.md
  Library ver:  0.2.2
  Last updated: 2026-08-05
─────────────────────────────── -->

# Spec Index — @webex/sdk-component-adapter

> Entry: [`AGENTS.md`](../AGENTS.md) · Source of truth: `.sdd/manifest.json`

## Module Registry

| Module | Responsibility | Manifest coverage state | Start here |
|---|---|---|---|
| `src/` (facade) | WebexSDKAdapter connect/disconnect, sub-adapter wiring | Partial | `src/ai-docs/webex-sdk-adapter-spec.md` |
| `src/MeetingsSDKAdapter.js` | Meetings, media, UI controls | Partial | `src/ai-docs/meetings-sdk-adapter-spec.md` |
| `src/ActivitiesSDKAdapter.js` | Activities CRUD streams | Partial | `src/ai-docs/activities-sdk-adapter-spec.md` |
| `src/PeopleSDKAdapter.js` | People and presence | Partial | `src/ai-docs/people-sdk-adapter-spec.md` |
| `src/RoomsSDKAdapter.js` | Rooms and activity feeds | Partial | `src/ai-docs/rooms-sdk-adapter-spec.md` |
| `src/MembershipsSDKAdapter.js` | Membership lists | Partial | `src/ai-docs/memberships-sdk-adapter-spec.md` |
| `src/OrganizationsSDKAdapter.js` | Organization lookup | Partial | `src/ai-docs/organizations-sdk-adapter-spec.md` |
| `src/MetricsSDKAdapter.js` | Metrics submission | Partial | `src/ai-docs/metrics-sdk-adapter-spec.md` |
| shared utilities | cache, logger, utils, polyfills | Partial | `src/ai-docs/shared-utilities-spec.md` |

## Task Routing

| If the task is… | Load |
|---|---|
| Understanding the system | `ARCHITECTURE.md` |
| Changing connect/disconnect | `src/ai-docs/webex-sdk-adapter-spec.md` |
| Meetings/media/controls | `src/ai-docs/meetings-sdk-adapter-spec.md` |
| Rooms or activities | `src/ai-docs/rooms-sdk-adapter-spec.md`, `src/ai-docs/activities-sdk-adapter-spec.md` |
| npm/peer contract change | `CONTRACTS.md` + affected module spec |
| Running or changing tests | `TEST_INDEX.md` + affected module spec |
| Updating docs after code change | affected `src/ai-docs/*-spec.md` + `SPEC_INDEX.md` |

## Incident History

| INC id | Date | Module | One-line | Link |
|---|---|---|---|---|
| — | — | — | No incidents recorded in SDD bootstrap | — |

## Spec Registry

| Doc | Location | Purpose |
|---|---|---|
| Patterns | `ai-docs/patterns/` | RxJS and adapter conventions |
| Rules | `ai-docs/RULES.md` | Enforceable do/don't |
| Glossary | `ai-docs/GLOSSARY.md` | Domain terms |
| Data model | `ai-docs/DATA_MODEL.md` | In-memory entities and caches |
| Security | `ai-docs/SECURITY.md` | Trust boundaries |
| Contracts | `ai-docs/CONTRACTS.md` | npm public surface index |
| Test index | `ai-docs/TEST_INDEX.md` | Repo-wide test tiers and routing |
| Getting started | `ai-docs/GETTING_STARTED.md` | Build/test loop |
| Review catalog | `ai-docs/REVIEW_CHECKLIST.md` | Review checks |

Validation status: **not-run** — pending codex-agent Session B at `f7dd319` (cursor preflight 2026-09-02: 0 content Blocking; unit 19/19 suites, 194/194 passed).
