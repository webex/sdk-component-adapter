<!-- ───────────────────────────────
  Template:     Security Baseline
  Template-ID:  security
  Generates:    ai-docs/SECURITY.md
  Library ver:  0.2.1
  Last updated: 2026-08-05
─────────────────────────────── -->

# SECURITY — @webex/sdk-component-adapter

> Entry: [`AGENTS.md`](../AGENTS.md) · Router: [`SPEC_INDEX.md`](SPEC_INDEX.md) · Architecture: [`ARCHITECTURE.md`](ARCHITECTURE.md)

> Read before changing anything that touches input, identity, data, or external calls.

## Trust Boundaries

| Boundary | Untrusted side | Trusted side | What is enforced at the crossing |
|---|---|---|---|
| Host → adapter constructor | Host-supplied SDK instance and caller IDs | Adapter code | Host must provide authenticated SDK; adapter validates Hydra ID shape where implemented |
| Adapter → Webex SDK | Network responses and Mercury events | Adapter mapping layer | Errors mapped to RxJS observable errors; no credential logging |
| Adapter → host observables | Emitted activity/person/meeting data | Host UI | Host must encode output for UI context; adapter does not render HTML |
| Developer → repository | PR diffs, test credentials | CI and reviewers | `.env` gitignored; husky lint; no secrets in source |

## Authentication & Authorization Model

- **Authentication:** Library does not perform login. Host creates the Webex JS SDK with valid credentials/access token before constructing `WebexSDKAdapter` (`src/WebexSDKAdapter.js`).
- **Authorization:** All REST and Mercury calls use the authenticated user's scopes via the SDK — no privilege elevation (`src/*SDKAdapter.js`).
- **Default posture:** Deny-by-default at the cloud API layer; adapter surfaces SDK 403/404 as observable errors where applicable.

## Secret & Credential Handling

- Secrets source: host application and CI secret stores — never source code.
- Injection: Cypress integration tests read `.env` (gitignored); CircleCI contexts for release tokens.
- Rotation: host/SDK token lifecycle is outside this library.
- **Hard rule:** never commit secrets, tokens, keys, or connection strings; never log them (`src/logger.js`).

## Data Classification & Handling

| Data class | Examples | Storage rule | Logging rule | In transit |
|---|---|---|---|---|
| Credentials | Access tokens, refresh tokens | Host/SDK memory only | Never log | TLS via Webex SDK |
| PII | Activity text, display names, emails in people search | Not persisted by adapter | Debug logs may include IDs — avoid full message bodies in production | TLS via SDK |
| Encryption keys | Conversation encryption key URLs | SDK-managed | Never log key material | TLS via SDK |
| Client metrics | App telemetry payloads | Not stored locally | Error paths only | TLS via SDK metrics API |

## Input Validation & Output Encoding Posture

- **IDs:** Domain adapters validate Hydra ID structure where tests document rejection (e.g. invalid room/activity IDs → observable error in `returns_caller_errors` modules).
- **Adaptive cards:** JSON parsed from SDK responses; malformed card JSON falls back to safe TextBlock content in `ActivitiesSDKAdapter` — host still must treat card HTML as untrusted if rendered.
- **User-supplied post content:** Passed through to SDK conversation APIs; host must sanitize displayed activity text in UI.
- **Queries/commands:** No raw SQL or shell — all cloud access via parameterized SDK plugin calls.
- **Output:** Adapter returns structured objects and observables; encoding for HTML/DOM is the host application's responsibility.

## Transport & Headers

- All Webex cloud traffic uses HTTPS/TLS via the Webex JS SDK — adapter does not configure TLS directly.
- This library does not expose HTTP endpoints, CORS, or CSRF surfaces.

## Known Sensitive Areas & Accepted Risks

| Area | Risk | Mitigation / why accepted | Owner |
|---|---|---|---|
| Debug logging | PII in log payloads if log level is debug | Use production log level warn/error; `window.webexSDKAdapterSetLogLevel` for controlled debug | Adapter maintainers |
| In-memory caches | Session-scoped activity/conversation bodies | Process memory only; cleared on page reload | By design for performance |
| Peer dependency drift | Host bundles incompatible `webex`/`rxjs` | Semver peer ranges in `package.json`; integration tests | Host + adapter releases |

## Reporting & Review

- Security-relevant changes require review per `ai-docs/REVIEW_CHECKLIST.md` and module specs for affected domains.
- Suspected vulnerabilities: follow Webex open-source support channels listed in `README.md` (reference-only).
- Cross-reference: module-specific encryption and error behavior in `src/ai-docs/*-spec.md`.
