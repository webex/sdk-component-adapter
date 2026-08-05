<!-- ───────────────────────────────
  Template:     Contracts Catalog
  Template-ID:  contracts
  Generates:    ai-docs/CONTRACTS.md
  Library ver:  0.2.1
  Last updated: 2026-08-05
─────────────────────────────── -->

# Contracts Catalog — @webex/sdk-component-adapter

> Entry: [`AGENTS.md`](../AGENTS.md) · Router: [`SPEC_INDEX.md`](SPEC_INDEX.md) · Machine source: `.sdd/manifest.json`

Strategy: **root-index-module-detail** — this file indexes all public contract IDs; full signatures and behavior live in module specs.

## Exported API & Types (package)

| Contract ID | Owner module | Symbol | Signature / type | Stability | Schema / detail link | Defined at |
|---|---|---|---|---|---|---|
| pkg.default | src/ | `WebexSDKAdapter` | `export default WebexSDKAdapter` | Semver via npm | `src/ai-docs/webex-sdk-adapter-spec.md` | `src/index.js` |
| pkg.umd | build | UMD global | `UMDWebexSDKComponentAdapter` (Rollup `name`) | Semver | Rollup output | `dist/webexSDKComponentAdapter.umd.js` |
| pkg.esm | build | default export | `WebexSDKAdapter` (same as source default; file `webexSDKComponentAdapter.esm.js`) | Semver | Rollup output | `dist/webexSDKComponentAdapter.esm.js` |

Package entry points (`package.json`): `main` → UMD file, `module` → ESM file. Source default export is always `WebexSDKAdapter` (`src/index.js`). Rollup ESM `output.name` (`ESMWebexSDKComponentAdapter`) is an internal bundle identifier — not a separate public binding.

## Domain adapter contracts (index)

| Contract ID | Module | Symbol / surface | Detail spec |
|---|---|---|---|
| webex-sdk-adapter.default | Facade | `WebexSDKAdapter`, `connect`, `disconnect`, sub-adapter properties | `src/ai-docs/webex-sdk-adapter-spec.md` |
| activities-adapter.* | Activities | `getActivity`, `postActivity`, `postAction`, `fromSDKActivity` | `src/ai-docs/activities-sdk-adapter-spec.md` |
| people-adapter.* | People | `getMe`, `getPerson`, `searchPeople` | `src/ai-docs/people-sdk-adapter-spec.md` |
| rooms-adapter.* | Rooms | `getRoom`, `createRoom`, `getPastActivities`, `getActivitiesInRealTime`, `ROOM_UPDATED_EVENT` | `src/ai-docs/rooms-sdk-adapter-spec.md` |
| memberships-adapter.* | Memberships | `getMembersFromDestination`, `addRoomMember` | `src/ai-docs/memberships-sdk-adapter-spec.md` |
| orgs-adapter.* | Organizations | `getOrg` | `src/ai-docs/organizations-sdk-adapter-spec.md` |
| metrics-adapter.* | Metrics | `submitMetrics` | `src/ai-docs/metrics-sdk-adapter-spec.md` |
| meetings-adapter.* | Meetings | `createMeeting`, `getMeeting`, `joinMeeting`, `leaveMeeting`, `supportedControls`, `meetingControls`, `MeetingControl` export | `src/ai-docs/meetings-sdk-adapter-spec.md` |
| shared.* | Shared utilities | `cache`, `logger`, `utils`, `polyfills` | `src/ai-docs/shared-utilities-spec.md` |

## Events & realtime identifiers

| Contract ID | Transport | Event / constant | Used by | Detail spec |
|---|---|---|---|---|
| rooms.event.updated | SDK rooms plugin | `ROOM_UPDATED_EVENT` (`updated`) | `getRoom` pipeline | `src/ai-docs/rooms-sdk-adapter-spec.md` |
| mercury.event.conversation.activity | Mercury | `event:conversation.activity` | `getActivitiesInRealTime` | `src/ai-docs/rooms-sdk-adapter-spec.md` |
| mercury.event.apheleia | Mercury | `event:apheleia.subscription_update` | `getPerson` presence | `src/ai-docs/people-sdk-adapter-spec.md` |
| sdk.event.memberships.created | SDK rooms | `CREATED` | room membership list | `src/ai-docs/memberships-sdk-adapter-spec.md` |
| sdk.event.memberships.deleted | SDK rooms | `DELETED` | room membership list | `src/ai-docs/memberships-sdk-adapter-spec.md` |
| sdk.event.meeting.members | SDK meetings | `members:update` (`payload.full`) | meeting roster | `src/ai-docs/memberships-sdk-adapter-spec.md` |

## Meeting control keys (runtime)

| Control ID | Runtime key in `meetingControls` | Control class | Detail spec |
|---|---|---|---|
| meetings-adapter.control.join | `join` | JoinControl | `src/ai-docs/meetings-sdk-adapter-spec.md` |
| meetings-adapter.control.audio | `audio` | AudioControl | same |
| meetings-adapter.control.video | `video` | VideoControl | same |
| meetings-adapter.control.share-screen | `share-screen` | ShareControl | same |
| meetings-adapter.control.exit | `exit` | ExitControl | same |
| meetings-adapter.control.roster | `roster` | RosterControl | same |
| meetings-adapter.control.settings | `settings` | SettingsControl | same |
| meetings-adapter.control.switch-camera | `switch-camera` | SwitchCameraControl | same |
| meetings-adapter.control.switch-speaker | `switch-speaker` | SwitchSpeakerControl | same |
| meetings-adapter.control.switch-microphone | `switch-microphone` | SwitchMicrophoneControl | same |

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

- Update this catalog, module Public Surface tables, and `.sdd/manifest.json` when adding/changing public surfaces, events, control keys, or peer dependencies.
- Rollup `external` list must stay aligned with peer dependencies (`rollup.config.js`).
