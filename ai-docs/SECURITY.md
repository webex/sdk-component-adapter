<!-- ───────────────────────────────
  Template:     SECURITY
  Template-ID:  security
  Generates:    ai-docs/SECURITY.md
  Library ver:  0.2.1
  Last updated: 2026-08-05
─────────────────────────────── -->

# SECURITY — @webex/sdk-component-adapter

> Entry: [`AGENTS.md`](../AGENTS.md)

## Trust boundaries

| Zone | Trust level | Notes |
|---|---|---|
| Host application | Trusted | Supplies authenticated SDK and tokens |
| This library | Trusted code | Must not exfiltrate or log secrets |
| Webex JS SDK | Trusted dependency | Handles TLS to Webex cloud |
| Webex cloud | External | Authoritative identity and data |

## Authentication

- Library does **not** perform login. Host must create SDK with valid credentials/access token before constructing `WebexSDKAdapter`.
- Token lifecycle is host/SDK responsibility.

## Authorization

- Adapter calls SDK with the authenticated user's scopes. No elevation or bypass.

## Secret handling

- **Never** commit `.env`, tokens, or test user passwords.
- Logger must not print access tokens or encryption keys (`src/logger.js` — avoid logging full request objects).
- Adaptive card encryption uses SDK conversation keys (`ActivitiesSDKAdapter.js`) — keys stay in SDK memory.

## Data classification

- Activity content, person display names, meeting metadata may contain PII — treat logs as sensitive.
- Metrics adapter submits client metrics — no user passwords in metric payloads.

## Dependency security

- `npm audit` / org process for dependency updates.
- Peer `webex` version floor in `package.json`.

## Reporting

- Follow Webex open-source support channels listed in `README.md`.
