<!-- ───────────────────────────────
  Template:     AGENTS.md
  Template-ID:  agents
  Generates:    AGENTS.md
  Library ver:  0.2.1
  Last updated: 2026-08-05
─────────────────────────────── -->

# AGENTS.md — @webex/sdk-component-adapter

> Read first. Router: [`ai-docs/SPEC_INDEX.md`](ai-docs/SPEC_INDEX.md) · Architecture: [`ai-docs/ARCHITECTURE.md`](ai-docs/ARCHITECTURE.md).

## Repo Overview

**@webex/sdk-component-adapter** is a JavaScript data-layer library that wraps the Webex JS SDK, implements `@webex/component-adapter-interfaces`, and exposes domain data as RxJS observables for `@webex/components`.

**What it is:**
- Adapter facade (`WebexSDKAdapter`) plus domain adapters (activities, meetings, people, rooms, memberships, organizations, metrics)
- Rollup-built npm package with UMD and ESM bundles
- Brownfield library with Jest unit tests and Cypress integration tests

**What it is NOT:**
- ❌ A React UI component library (no components ship from this repo)
- ❌ A standalone Webex client application
- ❌ The Webex JS SDK itself (peer dependency `webex`)

## Tech Stack

- JavaScript (ES modules + Babel), Node 20 (CI)
- Rollup build, RxJS 6 peer, Webex JS SDK peer
- Jest (unit), Cypress (integration), ESLint (airbnb-base), semantic-release

## Architecture

```
Host (@webex/components) → WebexSDKAdapter → domain *SDKAdapter → Webex JS SDK → Webex cloud
```

→ Full architecture: **[ai-docs/ARCHITECTURE.md](ai-docs/ARCHITECTURE.md)**

## Module / Package Structure

```
src/
├── WebexSDKAdapter.js      # Facade: connect/disconnect, sub-adapter wiring
├── *SDKAdapter.js          # Domain adapters (activities, meetings, people, …)
├── MeetingsSDKAdapter/     # Meeting control implementations
├── cache.js, logger.js, utils.js, polyfills.js
└── ai-docs/                # Canonical module specs
```

→ Module registry: **[ai-docs/SPEC_INDEX.md](ai-docs/SPEC_INDEX.md)**

## Critical Rules

1. **Code is the source of truth.** Never invent adapter methods or SDK calls — read `src/`.
2. **Ask before coding.** Present a plan; wait for confirmation before behavior changes.
3. **Connect/disconnect lifecycle** follows `WebexSDKAdapter.connect()` / `disconnect()` (device register → mercury → meetings plugin unregister; reverse on disconnect) — not `@webex/components` `withAdapter` lifecycle.
4. **Peer dependencies** `webex` and `rxjs` must remain external in Rollup — do not bundle them.
5. **Observable errors** — modules with `returns_caller_errors: true` in manifest must document caller recovery in module specs.
6. **Spec-currency** — code + spec update in the same merge when changing public behavior.
7. **Validation status is not-run** until independent `spec-validator` pass (Session B, different runtime).

## Essential Commands

| Task | Command |
|---|---|
| Install | `npm install && npx npm-install-peers` |
| Build | `npm run build` |
| Unit test | `npm run test:unit` |
| Integration test | `npm run test:integration` |
| Lint | `npm run linter` |
| Coverage | `npm run test:coverage` |

## Common Gotchas

- Host must pass an **authenticated** Webex SDK instance to `WebexSDKAdapter` constructor.
- `connect()` must be awaited before relying on live Mercury/meeting updates.
- Meetings adapter holds in-memory meeting state and MediaStream handles while joined — call `leaveMeeting(ID)` (which invokes `removeMedia`) to release media; `disconnect()` unregisters the meetings plugin but does not stop tracks or clear in-memory meeting maps.
- Missing room/meeting/activity IDs surface RxJS errors on observables (see module specs).

## Pre-Commit Checklist

- [ ] `npm run test:unit` passes; changed public behavior has unit tests
- [ ] `npm run linter` passes (husky pre-commit)
- [ ] Canonical module spec updated in the same change as behavior changes (spec-currency)
- [ ] No secrets in diff; peer deps `webex` and `rxjs` remain Rollup externals
- [ ] `Validation status` in specs stays `not-run` until independent `spec-validator` pass at HEAD SHA

## Boundaries

### Always
- Read this file + `SPEC_INDEX.md` before module work.
- Route to `src/ai-docs/<module>-spec.md` for domain behavior.
- Cite evidence as file paths only (no line-suffixed anchors in committed docs).

### Ask first
- New npm/runtime dependency.
- Changes to published bundle exports or peer dependency ranges.
- Modifying observable error semantics.

### Never
- Commit secrets (`.env`, tokens).
- Disable tests/lint to force green CI.
- Claim SDD validation pass before Session B records validator metadata at HEAD SHA.

## Doc Routing

| Need | Load |
|---|---|
| System shape | `ai-docs/ARCHITECTURE.md` |
| Public npm contracts | `ai-docs/CONTRACTS.md` |
| Module behavior | `src/ai-docs/<module>-spec.md` |
| Conventions | `ai-docs/patterns/` |
| Review gates | `ai-docs/REVIEW_CHECKLIST.md` |

Machine contract: `.sdd/manifest.json`
