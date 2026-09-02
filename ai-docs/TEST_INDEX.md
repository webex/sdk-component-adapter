<!-- ───────────────────────────────
  Template:     Test Index
  Template-ID:  test-index
  Generates:    ai-docs/TEST_INDEX.md
  Description:  Repo-wide test surface — tiers, commands (by role), directories, frameworks, and coverage gate — routing to where cases live.
  Library ver:  0.2.2
  Last updated: 2026-09-02
─────────────────────────────── -->

# Test Index — @webex/sdk-component-adapter

> Start here → root [`AGENTS.md`](../AGENTS.md) · router [`SPEC_INDEX.md`](SPEC_INDEX.md) · system [`ARCHITECTURE.md`](ARCHITECTURE.md). This doc is the repo-wide map of the test surface.

## Test Surface

| Tier | Command (role) | Test directory | Framework | External deps |
|---|---|---|---|---|
| Unit | `npm run test:unit` | `src/**/*.test.js` | Jest 24 | Mock Webex SDK (`src/mockSdk.js`) |
| Integration | `npm run test:integration` | `src/**/*.integration.test.js` | Cypress 3 | Authenticated Webex SDK + network (see `CONTRIBUTING.md`) |
| Coverage | `npm run test:coverage` | `src/` | Jest + istanbul | Same as unit |

## Where the Cases Live

- **Unit test cases** → each module's spec, **Test-Case Strategy (module)** section (see [`SPEC_INDEX.md`](SPEC_INDEX.md) module registry).
- **Integration / E2E cases** → Cypress specs under `src/`; no per-feature `features/<KEY>/test-strategy.md` in this library repo.

## Coverage / Quality Gate

- Minimum: not enforced as repo gate in CI for this brownfield bootstrap · Measures: Jest coverage available via `npm run test:coverage` · Applies to: local/optional · Enforced in: maintainer discretion (husky runs unit + lint on push, not coverage threshold).

## QA Dependencies & Environments

- Integration tests require Webex credentials and network access per `CONTRIBUTING.md`.
- Unit tests use in-memory mocks — no external services.

## Where to Go Next

- Agent entry: [`AGENTS.md`](../AGENTS.md) · System shape: [`ARCHITECTURE.md`](ARCHITECTURE.md) · Routing: [`SPEC_INDEX.md`](SPEC_INDEX.md)
- Machine source of truth: `.sdd/manifest.json` (`commands`, `tests`, `quality_gates`).
