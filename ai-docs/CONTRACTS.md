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
| pkg.esm | build | default export | `WebexSDKAdapter` (same as source default) | Semver | Rollup output | `dist/webexSDKComponentAdapter.esm.js` |

## Domain adapter contracts (index)

| Contract ID | Type | Surface | Purpose | Compatibility | Detail link | Module spec |
|---|---|---|---|---|---|---|
| webex-sdk-adapter.default | SDK class | `WebexSDKAdapter` | Facade wiring | stable | `src/index.js` | `src/ai-docs/webex-sdk-adapter-spec.md` |
| webex-sdk-adapter.connect | SDK method | `connect(): Promise<void>` | Device + Mercury + meetings plugin | stable | `src/WebexSDKAdapter.js` | same |
| webex-sdk-adapter.disconnect | SDK method | `disconnect(): Promise<void>` | Reverse connect sequence | stable | `src/WebexSDKAdapter.js` | same |
| activities-adapter.getActivity | SDK method | `getActivity(ID): Observable<Activity>` | Fetch activity by ID | stable | `src/ActivitiesSDKAdapter.js` | `src/ai-docs/activities-sdk-adapter-spec.md` |
| activities-adapter.postActivity | SDK method | `postActivity(activity): Observable<Activity>` | Post message/card | stable | same | same |
| activities-adapter.postAction | SDK method | `postAction(activityID, inputs): Observable<Activity>` | Adaptive card action | stable | same | same |
| activities-adapter.hasAdaptiveCards | SDK method | `hasAdaptiveCards(activity): boolean` | Card presence check | stable | same | same |
| activities-adapter.getAdaptiveCard | SDK method | `getAdaptiveCard(activity, index)` | Read card payload | stable | same | same |
| activities-adapter.fromSDKActivity | SDK export | `fromSDKActivity(sdkActivity): Activity` | SDK→adapter mapper | stable | same | same |
| people-adapter.getMe | SDK method | `getMe(): Observable<Person>` | Current user profile | stable | `src/PeopleSDKAdapter.js` | `src/ai-docs/people-sdk-adapter-spec.md` |
| people-adapter.getPerson | SDK method | `getPerson(ID): Observable<Person>` | Person + presence | stable | same | same |
| people-adapter.searchPeople | SDK method | `searchPeople(query): Observable<Person[]>` | Directory search | stable | same | same |
| rooms-adapter.getRoom | SDK method | `getRoom(ID): Observable<Room>` | Room metadata stream | stable | `src/RoomsSDKAdapter.js` | `src/ai-docs/rooms-sdk-adapter-spec.md` |
| rooms-adapter.createRoom | SDK method | `createRoom(room): Observable<Room>` | Create space | stable | same | same |
| rooms-adapter.getPastActivities | SDK method | `getPastActivities(ID, limit?): Observable<string[]>` | Paginated activity IDs | stable | same | same |
| rooms-adapter.hasMoreActivities | SDK method | `hasMoreActivities(ID): boolean` | Pagination cursor | stable | same | same |
| rooms-adapter.getActivitiesInRealTime | SDK method | `getActivitiesInRealTime(ID): Observable<string>` | Live activity IDs | stable | same | same |
| memberships-adapter.getMembersFromDestination | SDK method | `getMembersFromDestination(id, type)` | Room/meeting roster | stable | `src/MembershipsSDKAdapter.js` | `src/ai-docs/memberships-sdk-adapter-spec.md` |
| memberships-adapter.addRoomMember | SDK method | `addRoomMember(personID, roomID)` | Add member | stable | same | same |
| memberships-adapter.removeRoomMember | SDK inherited | `removeRoomMember(personID, roomID)` | **Not overridden** — base class unsupported error | stable | `@webex/component-adapter-interfaces` | same |
| orgs-adapter.getOrg | SDK method | `getOrg(ID): Observable<Organization>` | Org lookup | stable | `src/OrganizationsSDKAdapter.js` | `src/ai-docs/organizations-sdk-adapter-spec.md` |
| metrics-adapter.submitMetrics | SDK method | `submitMetrics(metric, preLoginID?)` | Client metrics | stable | `src/MetricsSDKAdapter.js` | `src/ai-docs/metrics-sdk-adapter-spec.md` |
| meetings-adapter.createMeeting | SDK method | `createMeeting(destination): Observable<Meeting>` | Schedule/create | stable | `src/MeetingsSDKAdapter.js` | `src/ai-docs/meetings-sdk-adapter-spec.md` |
| meetings-adapter.getMeeting | SDK method | `getMeeting(ID): Observable<Meeting>` | Meeting state stream | stable | same | same |
| meetings-adapter.joinMeeting | SDK method | `joinMeeting(ID, options = {}): Promise<void>` | Join with password/hostKey | stable | same | same |
| meetings-adapter.leaveMeeting | SDK method | `leaveMeeting(ID): Promise<void>` | Leave + removeMedia | stable | same | same |
| meetings-adapter.incomingMeeting | SDK inherited | `incomingMeeting(destination): Observable<Meeting>` | **Not overridden** — base unsupported error | stable | `@webex/component-adapter-interfaces` | same |
| meetings-adapter.getLayoutTypes | SDK method | `getLayoutTypes(): string[]` | Layout enum keys | stable | `src/MeetingsSDKAdapter.js` | same |
| meetings-adapter.clearPasswordRequiredFlag | SDK method | `clearPasswordRequiredFlag(ID): Promise<void>` | Reset password UI flag | stable | same | same |
| meetings-adapter.clearInvalidPasswordFlag | SDK method | `clearInvalidPasswordFlag(ID): Promise<void>` | Reset invalid password flag | stable | same | same |
| meetings-adapter.clearInvalidHostKeyFlag | SDK method | `clearInvalidHostKeyFlag(ID): Promise<void>` | Reset invalid host key flag | stable | same | same |
| meetings-adapter.supportedControls | SDK method | `supportedControls(): string[]` | Control key list | stable | same | same |
| meetings-adapter.meetingControls | SDK property | plain object map | Control instances | stable | same | same |
| meetings-adapter.export.MeetingControl | SDK export | `MeetingControl` class | Control base class | stable | `src/MeetingsSDKAdapter/controls/index.js` | same |

## Events & realtime identifiers

| Contract ID | Transport | Event / constant | Used by | Detail spec |
|---|---|---|---|---|
| rooms.event.updated | SDK rooms plugin | `ROOM_UPDATED_EVENT` (`updated`) | `getRoom` | `src/ai-docs/rooms-sdk-adapter-spec.md` |
| mercury.event.conversation.activity | Mercury | `event:conversation.activity` | `getActivitiesInRealTime` | same |
| mercury.event.apheleia | Mercury | `event:apheleia.subscription_update` | `getPerson` presence | `src/ai-docs/people-sdk-adapter-spec.md` |
| sdk.event.memberships.created | SDK rooms | `CREATED` | room membership | `src/ai-docs/memberships-sdk-adapter-spec.md` |
| sdk.event.memberships.deleted | SDK rooms | `DELETED` | room membership | same |
| sdk.event.meeting.members | SDK meetings | `members:update` (`payload.full`) | meeting roster | same |

## Meeting control keys (runtime)

All keys match `MeetingsSDKAdapter.js` constants and `supportedControls()`:

| Contract ID | Runtime key | Control class |
|---|---|---|
| meetings-adapter.control.join-meeting | `join-meeting` | JoinControl |
| meetings-adapter.control.mute-audio | `mute-audio` | AudioControl |
| meetings-adapter.control.mute-video | `mute-video` | VideoControl |
| meetings-adapter.control.share-screen | `share-screen` | ShareControl |
| meetings-adapter.control.leave-meeting | `leave-meeting` | ExitControl |
| meetings-adapter.control.member-roster | `member-roster` | RosterControl |
| meetings-adapter.control.settings | `settings` | SettingsControl |
| meetings-adapter.control.switch-camera | `switch-camera` | SwitchCameraControl |
| meetings-adapter.control.switch-speaker | `switch-speaker` | SwitchSpeakerControl |
| meetings-adapter.control.switch-microphone | `switch-microphone` | SwitchMicrophoneControl |

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
