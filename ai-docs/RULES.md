<!-- ───────────────────────────────
  Template:     RULES
  Template-ID:  rules
  Description:  Enforceable coding and documentation conventions for this repo.
  Generates:    ai-docs/RULES.md
  Library ver:  0.2.2
  Last updated: 2026-08-05
─────────────────────────────── -->

# RULES — @webex/sdk-component-adapter

> Entry: [`AGENTS.md`](../AGENTS.md) · Patterns: [`patterns/`](patterns/)

## Coverage & trust

- Module **coverage status** in `.sdd/manifest.json` governs trust: `Specced` > `Partial` > `Untracked`.
- Do not modify `Partial` modules without checking characterization tests where they exist.
- Update canonical module spec in the **same PR** as behavior changes.

## Autonomy

- Agents may refactor internals when specs and tests remain green.
- Public adapter method signatures and observable error semantics require explicit approval.

## Naming & structure

- Domain adapters: `*SDKAdapter.js` implementing matching `*Adapter` from `@webex/component-adapter-interfaces`.
- Tests: `*.test.js` (unit), `*.integration.test.js` (Cypress).
- Module specs: `src/ai-docs/<module-name>-spec.md`.

## Logging

- Use `src/logger.js` — do not `console.log` in library code.
- **Must not log:** credentials, tokens, or refresh tokens.
- **Current brownfield behavior (accepted gap):** debug/error paths may log full activity or person objects and malformed adaptive-card payloads at `warn`/`debug`/`error` (see `src/ActivitiesSDKAdapter.js`, `src/PeopleSDKAdapter.js`). Treat production log level accordingly; redaction hardening is a future improvement — not enforced by lint today.
- See [`patterns/structured-adapter-logging.md`](patterns/structured-adapter-logging.md) for intended structured logging shape.

## Errors

- Use RxJS `observer.error` or `throwError` for caller-recoverable invalid IDs (see manifest `returns_caller_errors`).
- Do not swallow SDK errors silently except where existing tests document intentional fallback (e.g. metrics).

## Imports / Dependencies

- Domain adapters import `@webex/component-adapter-interfaces` base classes and `rxjs` only at their public boundary; internal SDK calls go through `this.datasource`.
- Shared utilities (`cache.js`, `logger.js`, `utils.js`) must not import domain adapters (no upward dependency).
- New npm dependencies require maintainer approval; peers `webex` and `rxjs` must stay external in `rollup.config.js`.
- Import order: external packages → interfaces → local modules → relative paths (match existing files).

## Testing

- Unit tests: Jest with jsdom (`jest.setup.js`).
- New public methods require unit tests; integration coverage for cross-SDK flows when applicable.
- Run `npm run linter` before commit (husky pre-commit).

## Security

- No secrets in source. See `SECURITY.md`.

## Drift

- Run `spec-drift-changed` on PR diffs when SDD docs exist.
- Independent validation: `spec-validator` on different runtime before claiming SDD-ready.

## Concurrency & Async

- Adapter methods return RxJS observables — callers subscribe; do not assume synchronous return values.
- Facade `connect()` / `disconnect()` are async; await before relying on Mercury or meetings state.
- Hot observables (`publishReplay`/`ReplaySubject` caches) may start network I/O on first method call, not on subscribe — document per module spec.
- Meeting media and control actions may race; follow existing MeetingsSDKAdapter ordering in tests.

## Secrets

- `.env*` gitignored. CI uses project env configuration for release tokens (CircleCI contexts — not documented here).

## Maintenance

- Add a rule when a review correction recurs; remove it when a lint rule starts enforcing it.
- Cross-reference: patterns → `patterns/`; per-language → `rules/` when added.
