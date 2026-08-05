<!-- ───────────────────────────────
  Template:     Contracts Catalog
  Template-ID:  contracts
  Generates:    ai-docs/CONTRACTS.md
  Library ver:  0.2.1
  Last updated: 2026-08-05
─────────────────────────────── -->

# Contracts Catalog — @webex/sdk-component-adapter

> Entry: [`AGENTS.md`](../AGENTS.md) · Router: [`SPEC_INDEX.md`](SPEC_INDEX.md) · Machine source: `.sdd/manifest.json`

One-for-one index of every `Contract ID` in module Public Surface tables. Detail behavior lives in `src/ai-docs/<module>-spec.md`.

### Exported API & Types (npm + domain adapters)

| Contract ID | Owner module | Symbol / surface | Signature / return (compact) | Stability | Schema / detail link | Defined at |
|---|---|---|---|---|---|---|

| activities-adapter.class | activities-sdk-adapter | `ActivitiesSDKAdapter extends ActivitiesAdapter` | `ActivitiesSDKAdapter extends ActivitiesAdapter` | stable | `src/ActivitiesSDKAdapter.js` | `src/ActivitiesSDKAdapter.js` |
| activities-adapter.fromSDKActivity | activities-sdk-adapter | `fromSDKActivity` | `fromSDKActivity(sdkActivity): Activity` | stable | `src/ActivitiesSDKAdapter.js` | `src/ActivitiesSDKAdapter.js` |
| activities-adapter.getActivity | activities-sdk-adapter | `getActivity` | `getActivity(ID: string): Observable<Activity>` | stable | `src/ActivitiesSDKAdapter.js` | `src/ActivitiesSDKAdapter.js` |
| activities-adapter.getAdaptiveCard | activities-sdk-adapter | `getAdaptiveCard` | `getAdaptiveCard(activity: Activity, cardIndex: number): object \| undefined` | stable | `src/ActivitiesSDKAdapter.js` | `src/ActivitiesSDKAdapter.js` |
| activities-adapter.hasAdaptiveCards | activities-sdk-adapter | `hasAdaptiveCards` | `hasAdaptiveCards(activity: Activity): boolean` | stable | `src/ActivitiesSDKAdapter.js` | `src/ActivitiesSDKAdapter.js` |
| activities-adapter.postAction | activities-sdk-adapter | `postAction` | `postAction(activityID: string, inputs: object): Observable<Activity>` | stable | `src/ActivitiesSDKAdapter.js` | `src/ActivitiesSDKAdapter.js` |
| activities-adapter.postActivity | activities-sdk-adapter | `postActivity` | `postActivity(activity: Activity): Observable<Activity>` | stable | `src/ActivitiesSDKAdapter.js` | `src/ActivitiesSDKAdapter.js` |
| meetings-adapter.class | meetings-sdk-adapter | `MeetingsSDKAdapter extends MeetingsAdapter` | `MeetingsSDKAdapter extends MeetingsAdapter` | stable | `src/MeetingsSDKAdapter.js` | `src/MeetingsSDKAdapter.js` |
| meetings-adapter.clearInvalidHostKeyFlag | meetings-sdk-adapter | `clearInvalidHostKeyFlag` | `clearInvalidHostKeyFlag(ID: string): Promise<void>` | stable | `src/MeetingsSDKAdapter.js` | `src/MeetingsSDKAdapter.js` |
| meetings-adapter.clearInvalidPasswordFlag | meetings-sdk-adapter | `clearInvalidPasswordFlag` | `clearInvalidPasswordFlag(ID: string): Promise<void>` | stable | `src/MeetingsSDKAdapter.js` | `src/MeetingsSDKAdapter.js` |
| meetings-adapter.clearPasswordRequiredFlag | meetings-sdk-adapter | `clearPasswordRequiredFlag` | `clearPasswordRequiredFlag(ID: string): Promise<void>` | stable | `src/MeetingsSDKAdapter.js` | `src/MeetingsSDKAdapter.js` |
| meetings-adapter.connect | meetings-sdk-adapter | `connect` | `connect(): Promise<void>` | stable | `src/MeetingsSDKAdapter.js` | `src/MeetingsSDKAdapter.js` |
| meetings-adapter.control.join-meeting | meetings-sdk-adapter | `join-meeting` | `join-meeting` → JoinControl` | stable | `src/MeetingsSDKAdapter/controls/JoinControl.js` | `src/MeetingsSDKAdapter/controls/JoinControl.js` |
| meetings-adapter.control.leave-meeting | meetings-sdk-adapter | `leave-meeting` | `leave-meeting` → ExitControl` | stable | `src/MeetingsSDKAdapter/controls/ExitControl.js` | `src/MeetingsSDKAdapter/controls/ExitControl.js` |
| meetings-adapter.control.member-roster | meetings-sdk-adapter | `member-roster` | `member-roster` → RosterControl` | stable | `src/MeetingsSDKAdapter/controls/RosterControl.js` | `src/MeetingsSDKAdapter/controls/RosterControl.js` |
| meetings-adapter.control.mute-audio | meetings-sdk-adapter | `mute-audio` | `mute-audio` → AudioControl` | stable | `src/MeetingsSDKAdapter/controls/AudioControl.js` | `src/MeetingsSDKAdapter/controls/AudioControl.js` |
| meetings-adapter.control.mute-video | meetings-sdk-adapter | `mute-video` | `mute-video` → VideoControl` | stable | `src/MeetingsSDKAdapter/controls/VideoControl.js` | `src/MeetingsSDKAdapter/controls/VideoControl.js` |
| meetings-adapter.control.settings | meetings-sdk-adapter | `settings` | `settings` → SettingsControl` | stable | `src/MeetingsSDKAdapter/controls/SettingsControl.js` | `src/MeetingsSDKAdapter/controls/SettingsControl.js` |
| meetings-adapter.control.share-screen | meetings-sdk-adapter | `share-screen` | `share-screen` → ShareControl` | stable | `src/MeetingsSDKAdapter/controls/ShareControl.js` | `src/MeetingsSDKAdapter/controls/ShareControl.js` |
| meetings-adapter.control.switch-camera | meetings-sdk-adapter | `switch-camera` | `switch-camera` → SwitchCameraControl` | stable | `src/MeetingsSDKAdapter/controls/SwitchCameraControl.js` | `src/MeetingsSDKAdapter/controls/SwitchCameraControl.js` |
| meetings-adapter.control.switch-microphone | meetings-sdk-adapter | `switch-microphone` | `switch-microphone` → SwitchMicrophoneControl` | stable | `src/MeetingsSDKAdapter/controls/SwitchMicrophoneControl.js` | `src/MeetingsSDKAdapter/controls/SwitchMicrophoneControl.js` |
| meetings-adapter.control.switch-speaker | meetings-sdk-adapter | `switch-speaker` | `switch-speaker` → SwitchSpeakerControl` | stable | `src/MeetingsSDKAdapter/controls/SwitchSpeakerControl.js` | `src/MeetingsSDKAdapter/controls/SwitchSpeakerControl.js` |
| meetings-adapter.controls-barrel.AudioControl | meetings-sdk-adapter | `MeetingsSDKAdapter/controls/index.js` | `MeetingsSDKAdapter/controls/index.js` | stable | `src/MeetingsSDKAdapter/controls/index.js` | `src/MeetingsSDKAdapter/controls/index.js` |
| meetings-adapter.controls-barrel.ExitControl | meetings-sdk-adapter | `MeetingsSDKAdapter/controls/index.js` | `MeetingsSDKAdapter/controls/index.js` | stable | `src/MeetingsSDKAdapter/controls/index.js` | `src/MeetingsSDKAdapter/controls/index.js` |
| meetings-adapter.controls-barrel.JoinControl | meetings-sdk-adapter | `MeetingsSDKAdapter/controls/index.js` | `MeetingsSDKAdapter/controls/index.js` | stable | `src/MeetingsSDKAdapter/controls/index.js` | `src/MeetingsSDKAdapter/controls/index.js` |
| meetings-adapter.controls-barrel.MeetingControl | meetings-sdk-adapter | `MeetingsSDKAdapter/controls/index.js` | `MeetingsSDKAdapter/controls/index.js` | stable | `src/MeetingsSDKAdapter/controls/index.js` | `src/MeetingsSDKAdapter/controls/index.js` |
| meetings-adapter.controls-barrel.RosterControl | meetings-sdk-adapter | `MeetingsSDKAdapter/controls/index.js` | `MeetingsSDKAdapter/controls/index.js` | stable | `src/MeetingsSDKAdapter/controls/index.js` | `src/MeetingsSDKAdapter/controls/index.js` |
| meetings-adapter.controls-barrel.SettingsControl | meetings-sdk-adapter | `MeetingsSDKAdapter/controls/index.js` | `MeetingsSDKAdapter/controls/index.js` | stable | `src/MeetingsSDKAdapter/controls/index.js` | `src/MeetingsSDKAdapter/controls/index.js` |
| meetings-adapter.controls-barrel.SwitchCameraControl | meetings-sdk-adapter | `MeetingsSDKAdapter/controls/index.js` | `MeetingsSDKAdapter/controls/index.js` | stable | `src/MeetingsSDKAdapter/controls/index.js` | `src/MeetingsSDKAdapter/controls/index.js` |
| meetings-adapter.controls-barrel.SwitchMicrophoneControl | meetings-sdk-adapter | `MeetingsSDKAdapter/controls/index.js` | `MeetingsSDKAdapter/controls/index.js` | stable | `src/MeetingsSDKAdapter/controls/index.js` | `src/MeetingsSDKAdapter/controls/index.js` |
| meetings-adapter.controls-barrel.SwitchSpeakerControl | meetings-sdk-adapter | `MeetingsSDKAdapter/controls/index.js` | `MeetingsSDKAdapter/controls/index.js` | stable | `src/MeetingsSDKAdapter/controls/index.js` | `src/MeetingsSDKAdapter/controls/index.js` |
| meetings-adapter.controls-barrel.VideoControl | meetings-sdk-adapter | `MeetingsSDKAdapter/controls/index.js` | `MeetingsSDKAdapter/controls/index.js` | stable | `src/MeetingsSDKAdapter/controls/index.js` | `src/MeetingsSDKAdapter/controls/index.js` |
| meetings-adapter.createMeeting | meetings-sdk-adapter | `createMeeting` | `createMeeting(destination: string): Observable<Meeting>` | stable | `src/MeetingsSDKAdapter.js` | `src/MeetingsSDKAdapter.js` |
| meetings-adapter.disconnect | meetings-sdk-adapter | `disconnect` | `disconnect(): Promise<void>` | stable | `src/MeetingsSDKAdapter.js` | `src/MeetingsSDKAdapter.js` |
| meetings-adapter.getLayoutTypes | meetings-sdk-adapter | `getLayoutTypes` | `getLayoutTypes(): string[]` | stable | `src/MeetingsSDKAdapter.js` | `src/MeetingsSDKAdapter.js` |
| meetings-adapter.getMeeting | meetings-sdk-adapter | `getMeeting` | `getMeeting(ID: string): Observable<Meeting>` | stable | `src/MeetingsSDKAdapter.js` | `src/MeetingsSDKAdapter.js` |
| meetings-adapter.incomingMeeting | meetings-sdk-adapter | `incomingMeeting` | `incomingMeeting(destination): Observable<Meeting>` | stable; inherited from interface | `@webex/component-adapter-interfaces` | `@webex/component-adapter-interfaces` |
| meetings-adapter.joinMeeting | meetings-sdk-adapter | `joinMeeting` | `joinMeeting(ID: string, options?: { password?, hostKey?, name?, captcha? }): Promise<void>` | stable | `src/MeetingsSDKAdapter.js` | `src/MeetingsSDKAdapter.js` |
| meetings-adapter.leaveMeeting | meetings-sdk-adapter | `leaveMeeting` | `leaveMeeting(ID: string): Promise<void>` | stable | `src/MeetingsSDKAdapter.js` | `src/MeetingsSDKAdapter.js` |
| meetings-adapter.meetingControls | meetings-sdk-adapter | `plain object map` | `plain object map` | stable | `src/MeetingsSDKAdapter.js` | `src/MeetingsSDKAdapter.js` |
| meetings-adapter.refreshCaptcha | meetings-sdk-adapter | `refreshCaptcha` | `refreshCaptcha(ID: string): Promise<void>` | stable | `src/MeetingsSDKAdapter.js` | `src/MeetingsSDKAdapter.js` |
| meetings-adapter.supportedControls | meetings-sdk-adapter | `supportedControls` | `supportedControls(): string[]` | stable | `src/MeetingsSDKAdapter.js` | `src/MeetingsSDKAdapter.js` |
| memberships-adapter.addRoomMember | memberships-sdk-adapter | `addRoomMember` | `addRoomMember(personID: string, roomID: string): Observable<Member>` | stable | `src/MembershipsSDKAdapter.js` | `src/MembershipsSDKAdapter.js` |
| memberships-adapter.class | memberships-sdk-adapter | `MembershipsSDKAdapter extends MembershipsAdapter` | `MembershipsSDKAdapter extends MembershipsAdapter` | stable | `src/MembershipsSDKAdapter.js` | `src/MembershipsSDKAdapter.js` |
| memberships-adapter.getMembersFromDestination | memberships-sdk-adapter | `getMembersFromDestination` | `getMembersFromDestination(destinationID: string, destinationType: DestinationType): Observable<Member[]>` | stable | `src/MembershipsSDKAdapter.js` | `src/MembershipsSDKAdapter.js` |
| memberships-adapter.removeRoomMember | memberships-sdk-adapter | `removeRoomMember` | `removeRoomMember(personID: string, roomID: string): Observable<Member>` | stable; inherited from interface | `@webex/component-adapter-interfaces` | `@webex/component-adapter-interfaces` |
| metrics-adapter.class | metrics-sdk-adapter | `MetricsSDKAdapter extends MetricsAdapter` | `MetricsSDKAdapter extends MetricsAdapter` | stable | `src/MetricsSDKAdapter.js` | `src/MetricsSDKAdapter.js` |
| metrics-adapter.submitMetrics | metrics-sdk-adapter | `submitMetrics` | `submitMetrics(metric: Metric, preLoginID?: string): Observable<Metric>` | stable | `src/MetricsSDKAdapter.js` | `src/MetricsSDKAdapter.js` |
| orgs-adapter.class | organizations-sdk-adapter | `OrganizationsSDKAdapter extends OrganizationsAdapter` | `OrganizationsSDKAdapter extends OrganizationsAdapter` | stable | `src/OrganizationsSDKAdapter.js` | `src/OrganizationsSDKAdapter.js` |
| orgs-adapter.getOrg | organizations-sdk-adapter | `getOrg` | `getOrg(ID: string): Observable<Organization>` | stable | `src/OrganizationsSDKAdapter.js` | `src/OrganizationsSDKAdapter.js` |
| people-adapter.class | people-sdk-adapter | `PeopleSDKAdapter extends PeopleAdapter` | `PeopleSDKAdapter extends PeopleAdapter` | stable; semver via npm bundle | `src/PeopleSDKAdapter.js` | `src/PeopleSDKAdapter.js` |
| people-adapter.getMe | people-sdk-adapter | `getMe` | `getMe(): Observable<Person>` | stable; additive Person fields only | `src/PeopleSDKAdapter.js` | `src/PeopleSDKAdapter.js` |
| people-adapter.getPerson | people-sdk-adapter | `getPerson` | `getPerson(ID: string): Observable<Person>` | stable | `src/PeopleSDKAdapter.js` | `src/PeopleSDKAdapter.js` |
| people-adapter.searchPeople | people-sdk-adapter | `searchPeople` | `searchPeople(query: string): Observable<Person[]>` | stable | `src/PeopleSDKAdapter.js` | `src/PeopleSDKAdapter.js` |
| pkg.default | build | `export default WebexSDKAdapter` from `src/index.js` | `export default WebexSDKAdapter` from `src/index.js` | semver via semantic-release | `src/index.js` | `src/index.js` |
| rooms-adapter.class | rooms-sdk-adapter | `RoomsSDKAdapter extends RoomsAdapter` | `RoomsSDKAdapter extends RoomsAdapter` | stable | `src/RoomsSDKAdapter.js` | `src/RoomsSDKAdapter.js` |
| rooms-adapter.createRoom | rooms-sdk-adapter | `createRoom` | `createRoom(room: Room): Observable<Room>` | stable | `src/RoomsSDKAdapter.js` | `src/RoomsSDKAdapter.js` |
| rooms-adapter.getActivitiesInRealTime | rooms-sdk-adapter | `getActivitiesInRealTime` | `getActivitiesInRealTime(ID: string): Observable<string>` | stable | `src/RoomsSDKAdapter.js` | `src/RoomsSDKAdapter.js` |
| rooms-adapter.getPastActivities | rooms-sdk-adapter | `getPastActivities` | `getPastActivities(ID: string, activityLimit?: number): Observable<string[]>` | stable; default limit 50 | `src/RoomsSDKAdapter.js` | `src/RoomsSDKAdapter.js` |
| rooms-adapter.getRoom | rooms-sdk-adapter | `getRoom` | `getRoom(ID: string): Observable<Room>` | stable | `src/RoomsSDKAdapter.js` | `src/RoomsSDKAdapter.js` |
| rooms-adapter.hasMoreActivities | rooms-sdk-adapter | `hasMoreActivities` | `hasMoreActivities(ID: string): boolean` | stable | `src/RoomsSDKAdapter.js` | `src/RoomsSDKAdapter.js` |
| shared.cache.cachActivities | shared-utilities | `cachActivities` | `cachActivities(activities[])` | stable via facade | `src/cache.js` | `src/cache.js` |
| shared.cache.cachSDKActivities | shared-utilities | `cachSDKActivities` | `cachSDKActivities(sdkActivities[])` | stable via facade | `src/cache.js` | `src/cache.js` |
| shared.cache.cacheConversations | shared-utilities | `cacheConversations` | `cacheConversations(conversations[])` | stable via facade | `src/cache.js` | `src/cache.js` |
| shared.cache.get | shared-utilities | `get` | `get(key)` | stable via facade | `src/cache.js` | `src/cache.js` |
| shared.cache.has | shared-utilities | `has` | `has(key): boolean` | stable via facade | `src/cache.js` | `src/cache.js` |
| shared.cache.keys | shared-utilities | `keys` | `keys(): Iterator` | stable via facade | `src/cache.js` | `src/cache.js` |
| shared.cache.remove | shared-utilities | `remove` | `remove(key): boolean` | stable via facade | `src/cache.js` | `src/cache.js` |
| shared.cache.set | shared-utilities | `set` | `set(key, value)` | stable via facade | `src/cache.js` | `src/cache.js` |
| shared.cache.singleton | shared-utilities | `default export` CacheMeOutside singleton` | `default export` CacheMeOutside singleton` | stable via facade | `src/cache.js` | `src/cache.js` |
| shared.cache.size | shared-utilities | `size` | `size(): number` | stable via facade | `src/cache.js` | `src/cache.js` |
| shared.cache.values | shared-utilities | `values` | `values(): Iterator` | stable via facade | `src/cache.js` | `src/cache.js` |
| shared.logger.default | shared-utilities | `default export` logger instance` | `default export` logger instance` | stable internal | `src/logger.js` | `src/logger.js` |
| shared.logger.setLevel | shared-utilities | `setLevel` | `setLevel(level)` | stable internal | `src/logger/logger.js` | `src/logger/logger.js` |
| shared.logger.windowHook | shared-utilities | `window.webexSDKAdapterSetLogLevel` | `window.webexSDKAdapterSetLogLevel(level)` | stable internal | `src/logger.js` | `src/logger.js` |
| shared.polyfills.mediaStream | shared-utilities | `MediaStream.prototype.getTracks` shim` | `MediaStream.prototype.getTracks` shim` | stable internal | `src/polyfills.js` | `src/polyfills.js` |
| shared.utils.chainWith | shared-utilities | `RxJS operator` | `RxJS operator` | stable internal | `src/utils.js` | `src/utils.js` |
| shared.utils.combineLatestImmediate | shared-utilities | `RxJS helper` | `RxJS helper` | stable internal | `src/utils.js` | `src/utils.js` |
| shared.utils.deepMerge | shared-utilities | `object merge` | `object merge` | stable internal | `src/utils.js` | `src/utils.js` |
| shared.utils.isSpeakerSupported | shared-utilities | `boolean` | `boolean` | stable internal | `src/utils.js` | `src/utils.js` |
| shared.utils.resolveDeviceSwitchArgs | shared-utilities | `device switch arg resolver` | `device switch arg resolver` | stable internal | `src/utils.js` | `src/utils.js` |
| shared.utils.resolveMeetingID | shared-utilities | `` | `(meetingContext) => string` | stable internal | `src/utils.js` | `src/utils.js` |
| shared.utils.safeJsonStringify | shared-utilities | `circular-safe JSON.stringify` | `circular-safe JSON.stringify` | stable internal | `src/utils.js` | `src/utils.js` |
| webex-sdk-adapter.activitiesAdapter | facade | `ActivitiesSDKAdapter` instance` | `ActivitiesSDKAdapter` instance` | stable | `src/ai-docs/activities-sdk-adapter-spec.md` | `src/ai-docs/activities-sdk-adapter-spec.md` |
| webex-sdk-adapter.cache | facade | `shared cache singleton` | `shared cache singleton` | stable | `src/ai-docs/shared-utilities-spec.md` | `src/ai-docs/shared-utilities-spec.md` |
| webex-sdk-adapter.connect | facade | `connect` | `connect(): Promise<void>` | stable | `src/WebexSDKAdapter.js` | `src/WebexSDKAdapter.js` |
| webex-sdk-adapter.default | facade | `WebexSDKAdapter extends WebexAdapter` | `WebexSDKAdapter extends WebexAdapter` | stable | `src/WebexSDKAdapter.js` | `src/WebexSDKAdapter.js` |
| webex-sdk-adapter.disconnect | facade | `disconnect` | `disconnect(): Promise<void>` | stable | `src/WebexSDKAdapter.js` | `src/WebexSDKAdapter.js` |
| webex-sdk-adapter.meetingsAdapter | facade | `MeetingsSDKAdapter` instance` | `MeetingsSDKAdapter` instance` | stable | `src/ai-docs/meetings-sdk-adapter-spec.md` | `src/ai-docs/meetings-sdk-adapter-spec.md` |
| webex-sdk-adapter.membershipsAdapter | facade | `MembershipsSDKAdapter` instance` | `MembershipsSDKAdapter` instance` | stable | `src/ai-docs/memberships-sdk-adapter-spec.md` | `src/ai-docs/memberships-sdk-adapter-spec.md` |
| webex-sdk-adapter.metricsAdapter | facade | `MetricsSDKAdapter` instance` | `MetricsSDKAdapter` instance` | stable | `src/ai-docs/metrics-sdk-adapter-spec.md` | `src/ai-docs/metrics-sdk-adapter-spec.md` |
| webex-sdk-adapter.organizationsAdapter | facade | `OrganizationsSDKAdapter` instance` | `OrganizationsSDKAdapter` instance` | stable | `src/ai-docs/organizations-sdk-adapter-spec.md` | `src/ai-docs/organizations-sdk-adapter-spec.md` |
| webex-sdk-adapter.peopleAdapter | facade | `PeopleSDKAdapter` instance` | `PeopleSDKAdapter` instance` | stable | `src/ai-docs/people-sdk-adapter-spec.md` | `src/ai-docs/people-sdk-adapter-spec.md` |
| webex-sdk-adapter.roomsAdapter | facade | `RoomsSDKAdapter` instance` | `RoomsSDKAdapter` instance` | stable | `src/ai-docs/rooms-sdk-adapter-spec.md` | `src/ai-docs/rooms-sdk-adapter-spec.md` |

### Events

| Contract ID | Owner module | Event / topic | Direction | Payload schema link | Delivery guarantees | Compatibility / deprecation | Defined at |
|---|---|---|---|---|---|---|---|
| rooms.event.updated | rooms-sdk-adapter | `updated` (rooms plugin) | consume | `src/ai-docs/rooms-sdk-adapter-spec.md` | SDK plugin dispatch | stable | `src/RoomsSDKAdapter.js` |
| mercury.event.conversation.activity | rooms-sdk-adapter | `event:conversation.activity` | consume | `src/ai-docs/rooms-sdk-adapter-spec.md` | Mercury push | stable | `src/RoomsSDKAdapter.js` |
| mercury.event.apheleia | people-sdk-adapter | `event:apheleia.subscription_update` | consume | `src/ai-docs/people-sdk-adapter-spec.md` | Mercury push | stable | `src/PeopleSDKAdapter.js` |
| sdk.event.memberships.created | memberships-sdk-adapter | `CREATED` | consume | `src/ai-docs/memberships-sdk-adapter-spec.md` | SDK memberships plugin | stable | `src/MembershipsSDKAdapter.js` |
| sdk.event.memberships.deleted | memberships-sdk-adapter | `DELETED` | consume | `src/ai-docs/memberships-sdk-adapter-spec.md` | SDK memberships plugin | stable | `src/MembershipsSDKAdapter.js` |
| sdk.event.meeting.members | memberships-sdk-adapter | `members:update` (`payload.full`) | consume | `src/ai-docs/memberships-sdk-adapter-spec.md` | Meeting roster | stable | `src/MembershipsSDKAdapter.js` |

### Package bundles (build output)

| Contract ID | Owner | Symbol | Signature / return (compact) | Stability | Detail | Defined at |
|---|---|---|---|---|---|---|
| pkg.umd | build | `UMDWebexSDKComponentAdapter` | `Rollup UMD global name` | semver | `rollup.config.js` | `dist/webexSDKComponentAdapter.umd.js` |
| pkg.esm | build | `WebexSDKAdapter` | `default export (same as src/index.js)` | semver | `rollup.config.js` | `dist/webexSDKComponentAdapter.esm.js` |

## Requires — what this repo depends on

| Dependency | What is consumed | Schema / detail link | Availability assumption | Fallback on failure | Version floor |
|---|---|---|---|---|---|
| `webex` (peer) | Authenticated SDK, device, mercury, domain plugins | Webex JS SDK docs | Host provides session | No adapter without SDK | `^2.60.4` |
| `rxjs` (peer) | Observable primitives | rxjs docs | Host bundles rxjs 6 | Runtime failure if missing | `^6.5.4` |
| `@webex/component-adapter-interfaces` | Adapter bases | npm package | Required | Hard dependency | `^1.28.0` |
| `@webex/common` | Hydra helpers | npm package | With SDK | External in bundle | `^2.60.4` |

## Compatibility & Deprecation Policy

- **Breaking-change rule:** semver major for published default export or peer range changes.
- **Deprecation:** module specs + JSDoc before removal; one release window minimum.

## Maintenance

- Add/change/remove a Public Surface row → update this catalog and `.sdd/manifest.json` `contracts.provides` in the same change.
