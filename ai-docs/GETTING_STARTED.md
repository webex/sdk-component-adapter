<!-- ───────────────────────────────
  Template:     Getting Started
  Template-ID:  getting-started
  Generates:    ai-docs/GETTING_STARTED.md
  Library ver:  0.2.1
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
