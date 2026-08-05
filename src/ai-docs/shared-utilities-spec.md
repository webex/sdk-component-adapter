<!-- ───────────────────────────────
  Template:     Module Spec
  Template-ID:  module-spec
  Generates:    src/ai-docs/shared-utilities-spec.md
  Library ver:  0.2.1
  Last updated: 2026-08-05
─────────────────────────────── -->

# shared-utilities — SPEC

> [`AGENTS.md`](../../AGENTS.md) · [`SPEC_INDEX.md`](../../ai-docs/SPEC_INDEX.md)

## Metadata

| Field | Value |
|---|---|
| Module id | shared-utilities |
| Source path(s) | `src/cache.js`, `src/logger.js`, `src/utils.js`, `src/polyfills.js` |
| Doc kind | Module spec |
| Coverage score | 91% assessed 2026-08-05 |
| Generated from | `module-spec` @ SDLC template library `0.2.1` |
| generated_by / approved_by / updated_at | cursor-agent / pending PR approval / 2026-08-05 |
| Validation status | not-run |

## Evidence Rules

File path evidence only.

## Source Material Register

| Source material | Scope | Decision | Detail location |
|---|---|---|---|
| Code | behavior | verified | utility source files |

## Overview

Cross-cutting helpers: in-memory cache, structured logging, RxJS operators, environment polyfills.

## Purpose / Responsibility

Support domain adapters — not imported by package consumers directly (except via facade.cache).

## Stack

JavaScript, RxJS (utils), logform-inspired logger.

## Folder / Package Structure

```
src/cache.js
src/logger.js
src/logger/logger.js
src/utils.js
src/polyfills.js
src/cache.test.js
```

## Key Files (source of truth)

| File | Role |
|---|---|
| `src/cache.js` | Singleton entity cache |
| `src/logger.js` | Default logger export |
| `src/utils.js` | RxJS helpers, deepMerge, safeJsonStringify |
| `src/polyfills.js` | MediaStream.getTracks shim |

## Public Surface

### cache.js (default export singleton)

| Method | Description |
|---|---|
| set, get, has, remove, values, keys, size | Map-like API |
| cacheConversations, cachActivities, cachSDKActivities | Bulk SDK entity cache |

### logger.js

| Method | Description |
|---|---|
| debug, info, warn, error, setLevel, addTransport | Logging |

### utils.js exports

| Symbol | Description |
|---|---|
| chainWith, combineLatestImmediate | RxJS operators |
| resolveMeetingID, resolveDeviceSwitchArgs | Meeting control helpers |
| deepMerge, safeJsonStringify | Object utilities |
| isSpeakerSupported | Feature detect |

### polyfills.js

Side-effect: adds `MediaStream.prototype.getTracks` when missing.

## Requires (dependencies)

| Dependency | Purpose |
|---|---|
| rxjs | utils operators |
| Browser MediaStream | polyfill target |

## Requirements

| ID | WHAT | WHY | Evidence |
|---|---|---|---|
| R-U1 | cache singleton shared on WebexSDKAdapter.cache | Dedupe SDK entities across adapters | `src/cache.js`, `src/WebexSDKAdapter.js` |
| R-U2 | polyfills imported first from index | Ensure MediaStream API before adapters | `src/index.js` |
| R-U3 | chainWith forwards subscriber errors | RxJS contract | `src/utils.js` |

## Design Overview

Minimal utilities — no domain logic.

## Data Flow

Adapters read/write cache during fetch; logger called on errors; utils used in meetings controls.

## Sequence Diagram(s)

Trivial pass-through module — utilities invoked synchronously from adapters.

## Class / Component Relationships

`CacheMeOutside` internal class; logger factory in `logger/logger.js`.

## Use Cases

Cache conversation for activity encryption; log meeting errors; resolve meeting ID in controls.

## State Model

In-memory cache Map lives for adapter lifetime (process/session).

## Module Do's / Don'ts

- Do use logger instead of console.
- Don't export cache mutators on public npm surface.

## Pitfalls

Typo method names `cachActivities` preserved for compatibility.

## Test-Case Strategy (module)

`src/cache.test.js` for cache API.

## Traceability

| Requirement | Test |
|---|---|
| R-U1 | `cache.test.js`, `WebexSDKAdapter.test.js` |
