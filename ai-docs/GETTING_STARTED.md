<!-- ───────────────────────────────
  Template:     Getting Started
  Template-ID:  getting-started
  Description:  Developer and agent onboarding — install, build, test, and SDD gate rerun.
  Generates:    ai-docs/GETTING_STARTED.md
  Library ver:  0.2.2
  Last updated: 2026-08-05
─────────────────────────────── -->

# Getting Started — @webex/sdk-component-adapter

> Entry: [`AGENTS.md`](../AGENTS.md) · Router: [`SPEC_INDEX.md`](SPEC_INDEX.md)

## Prerequisites

- Node.js 20.x (matches CircleCI `cimg/node:20.13.1-browsers`)
- npm
- Peer packages: `webex`, `rxjs` (install via `npx npm-install-peers`)
- For integration tests: Chrome (Cypress), Webex test user credentials in `.env`

## Clone & Install

```bash
git clone git@github.com:webex/sdk-component-adapter.git
cd sdk-component-adapter
npm install
npx npm-install-peers
```

## Build / Run / Test

| Task | Command |
|---|---|
| Build | `npm run build` |
| Unit test | `npm run test:unit` |
| Unit coverage | `npm run test:coverage` |
| Integration test | `npm run test:integration` |
| Lint | `npm run linter` |
| Local demo | `npm run serve` (Parcel demo in scripts/) |

## First-Run Verification

1. `npm run build` produces `dist/webexSDKComponentAdapter.umd.js` and `.esm.js`.
2. `npm run test:unit -- --silent` exits 0.
3. `npm run linter` exits 0.

## Configuration & Secrets

- `.env` / `.env.*` gitignored — used for Cypress integration tests and local SDK tokens.
- Never commit access tokens. See `ai-docs/SECURITY.md`.

## Troubleshooting

- **Missing peer deps:** Run `npx npm-install-peers` after `npm install`.
- **Cypress failures:** Ensure `.env` has valid Webex test credentials; run `npx cypress install`.
- **Build externals:** Peers `webex` and `rxjs` must resolve in host app — not bundled in dist.

## SDD bootstrap evidence (local)

SDD Stage 0 gate reports live under `.generated/sdd/` and are **gitignored**. Reviewers can reproduce them after installing SDD bootstrap skills locally (`.cursor/`, `.agents/`, or `.claude/` — not committed to this repo).

Committed summary: [`SDD_BOOTSTRAP_EVIDENCE.md`](SDD_BOOTSTRAP_EVIDENCE.md).

| Step | Skill / action | Expected output |
|---|---|---|
| 1 | `brownfield-questionnaire` (rigorous mode) | `.generated/sdd/bootstrap-questionnaire.md` — all CRITICAL fields verified, nine-module map confirmed |
| 2 | `generated-doc-conformance` on bootstrap doc set | `.generated/sdd/conformance/bootstrap-*-cursor.md` — **0 Blocking** findings |
| 3 | `coverage-review` | `.generated/sdd/coverage/bootstrap-*-cursor.md` — ≥90% aggregate field score recorded |
| 4 | `spec-validator` from a runtime **different** from `cursor-agent` | `.generated/sdd/validation/*-codex-*/validation-report.md` — 0 Blocking at HEAD SHA |

Prerequisites: read `.sdd/manifest.json`, `AGENTS.md`, `ai-docs/`, and `src/ai-docs/` before judging. Run `npm run test:unit -- --runInBand` as part of validation.

## Where to Go Next

- Agent entry: [`AGENTS.md`](../AGENTS.md) · System shape: [`ARCHITECTURE.md`](ARCHITECTURE.md) · Routing: [`SPEC_INDEX.md`](SPEC_INDEX.md)
- Public contracts: [`CONTRACTS.md`](CONTRACTS.md) · Conventions: [`patterns/`](patterns/) and [`RULES.md`](RULES.md)
- Module behavior: `src/ai-docs/<module>-spec.md` per [`SPEC_INDEX.md`](SPEC_INDEX.md)
- Bootstrap evidence summary: [`SDD_BOOTSTRAP_EVIDENCE.md`](SDD_BOOTSTRAP_EVIDENCE.md)
