<!-- ───────────────────────────────
  Template:     RULES
  Template-ID:  rules
  Generates:    ai-docs/RULES.md
  Library ver:  0.2.1
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
- Never log credentials, tokens, or full adaptive card payloads with PII.

## Errors

- Use RxJS `observer.error` or `throwError` for caller-recoverable invalid IDs (see manifest `returns_caller_errors`).
- Do not swallow SDK errors silently except where existing tests document intentional fallback (e.g. metrics).

## Testing

- Unit tests: Jest with jsdom (`jest.setup.js`).
- New public methods require unit tests; integration coverage for cross-SDK flows when applicable.
- Run `npm run linter` before commit (husky pre-commit).

## Security

- No secrets in source. See `SECURITY.md`.

## Drift

- Run `spec-drift-changed` on PR diffs when SDD docs exist.
- Independent validation: `spec-validator` on different runtime before claiming SDD-ready.

## Secrets

- `.env*` gitignored. CI uses project env configuration for release tokens (CircleCI contexts — not documented here).
