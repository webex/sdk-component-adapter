<!-- ───────────────────────────────
  Template:     Contracts Catalog
  Template-ID:  contracts
  Generates:    ai-docs/CONTRACTS.md
  Library ver:  0.2.1
  Last updated: 2026-08-05
─────────────────────────────── -->

# Contracts Catalog — @webex/sdk-component-adapter

> Entry: [`AGENTS.md`](../AGENTS.md) · Router: [`SPEC_INDEX.md`](SPEC_INDEX.md) · Machine source: `.sdd/manifest.json`

## Exported API & Types

| Contract ID | Owner module | Symbol | Signature | Stability / deprecation | Schema / detail link | Defined at |
|---|---|---|---|---|---|---|
| pkg.default | src/ | `WebexSDKAdapter` (default export) | `class WebexSDKAdapter extends WebexAdapter` | Semver via npm | `src/ai-docs/webex-sdk-adapter-spec.md` | `src/index.js` |
| pkg.umd | build | UMD bundle global | `UMDWebexSDKComponentAdapter` | Semver | Rollup output | `dist/webexSDKComponentAdapter.umd.js` |
| pkg.esm | build | ESM bundle | `ESMWebexSDKComponentAdapter` default | Semver | Rollup output | `dist/webexSDKComponentAdapter.esm.js` |

Package entry points (`package.json`): `main` → UMD, `module` → ESM.

## Requires — what this repo depends on

| Dependency (service / package / datastore) | What is consumed | Schema / detail link | Availability assumption | Fallback on failure | Version floor |
|---|---|---|---|---|---|
| `webex` (peer) | Authenticated SDK instance, internal.device, internal.mercury, domain plugins | Webex JS SDK docs | Host provides working SDK session | No adapter function without SDK | `^2.60.4` |
| `rxjs` (peer) | Observable, Subject, operators | rxjs docs | Host bundles compatible rxjs | Observable methods fail at runtime if missing | `^6.5.4` |
| `@webex/component-adapter-interfaces` | Adapter base types and contracts | npm package | Required at build/runtime | N/A — hard dependency | `^1.28.0` |
| `@webex/common` | Shared utilities | npm package | Available when SDK used | External import in bundle | `^2.60.4` |
| Webex cloud APIs | REST/Mercury via SDK | SDK abstraction | Network reachable | Per-adapter error mapping / observable errors | SDK-defined |

## Compatibility & Deprecation Policy

- **Breaking-change rule:** No breaking change to published default export or peer ranges without semver major (or documented exception with `@webex/components` coordination).
- **Deprecation:** Mark deprecated adapter methods in module specs and JSDoc before removal; maintain at least one release window when consumers exist.

## Maintenance

- Update this catalog, `CONTRACTS` sections in module specs, and `.sdd/manifest.json` when adding/changing public surfaces or peer dependencies.
- Rollup `external` list must stay aligned with peer dependencies.
