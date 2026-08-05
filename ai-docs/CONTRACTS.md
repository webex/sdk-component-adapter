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

| activities-adapter.class | activities-sdk-adapter | `ActivitiesSDKAdapter extends ActivitiesAdapter` | see module spec | stable | `src/ActivitiesSDKAdapter.js` | `src/ActivitiesSDKAdapter.js` |
| activities-adapter.fromSDKActivity | activities-sdk-adapter | `fromSDKActivity(sdkActivity): Activity` | see module spec | stable | `src/ActivitiesSDKAdapter.js` | `src/ActivitiesSDKAdapter.js` |
| activities-adapter.getActivity | activities-sdk-adapter | `getActivity(ID: string): Observable<Activity>` | see module spec | stable | `src/ActivitiesSDKAdapter.js` | `src/ActivitiesSDKAdapter.js` |
| activities-adapter.getAdaptiveCard | activities-sdk-adapter | `getAdaptiveCard(activity: Activity, cardIndex: number): object \ | see module spec | Read card payload by index | `src/ai-docs/activities-sdk-adapter-spec.md` | `src/ai-docs/activities-sdk-adapter-spec.md` |
| activities-adapter.hasAdaptiveCards | activities-sdk-adapter | `hasAdaptiveCards(activity: Activity): boolean` | see module spec | stable | `src/ActivitiesSDKAdapter.js` | `src/ActivitiesSDKAdapter.js` |
| activities-adapter.postAction | activities-sdk-adapter | `postAction(activityID: string, inputs: object): Observable<Activity>` | see module spec | stable | `src/ActivitiesSDKAdapter.js` | `src/ActivitiesSDKAdapter.js` |
| activities-adapter.postActivity | activities-sdk-adapter | `postActivity(activity: Activity): Observable<Activity>` | see module spec | stable | `src/ActivitiesSDKAdapter.js` | `src/ActivitiesSDKAdapter.js` |
| meetings-adapter.class | meetings-sdk-adapter | `MeetingsSDKAdapter extends MeetingsAdapter` | see module spec | stable | `src/MeetingsSDKAdapter.js` | `src/MeetingsSDKAdapter.js` |
| meetings-adapter.clearInvalidHostKeyFlag | meetings-sdk-adapter | `clearInvalidHostKeyFlag(ID: string): Promise<void>` | see module spec | stable | `src/MeetingsSDKAdapter.js` | `src/MeetingsSDKAdapter.js` |
| meetings-adapter.clearInvalidPasswordFlag | meetings-sdk-adapter | `clearInvalidPasswordFlag(ID: string): Promise<void>` | see module spec | stable | `src/MeetingsSDKAdapter.js` | `src/MeetingsSDKAdapter.js` |
| meetings-adapter.clearPasswordRequiredFlag | meetings-sdk-adapter | `clearPasswordRequiredFlag(ID: string): Promise<void>` | see module spec | stable | `src/MeetingsSDKAdapter.js` | `src/MeetingsSDKAdapter.js` |
| meetings-adapter.connect | meetings-sdk-adapter | `connect(): Promise<void>` | see module spec | stable | `src/MeetingsSDKAdapter.js` | `src/MeetingsSDKAdapter.js` |
| meetings-adapter.control.join-meeting | meetings-sdk-adapter | `join-meeting` → JoinControl | see module spec | stable | `src/MeetingsSDKAdapter/controls/JoinControl.js` | `src/MeetingsSDKAdapter/controls/JoinControl.js` |
| meetings-adapter.control.leave-meeting | meetings-sdk-adapter | `leave-meeting` → ExitControl | see module spec | stable | `src/MeetingsSDKAdapter/controls/ExitControl.js` | `src/MeetingsSDKAdapter/controls/ExitControl.js` |
| meetings-adapter.control.member-roster | meetings-sdk-adapter | `member-roster` → RosterControl | see module spec | stable | `src/MeetingsSDKAdapter/controls/RosterControl.js` | `src/MeetingsSDKAdapter/controls/RosterControl.js` |
| meetings-adapter.control.mute-audio | meetings-sdk-adapter | `mute-audio` → AudioControl | see module spec | stable | `src/MeetingsSDKAdapter/controls/AudioControl.js` | `src/MeetingsSDKAdapter/controls/AudioControl.js` |
| meetings-adapter.control.mute-video | meetings-sdk-adapter | `mute-video` → VideoControl | see module spec | stable | `src/MeetingsSDKAdapter/controls/VideoControl.js` | `src/MeetingsSDKAdapter/controls/VideoControl.js` |
| meetings-adapter.control.settings | meetings-sdk-adapter | `settings` → SettingsControl | see module spec | stable | `src/MeetingsSDKAdapter/controls/SettingsControl.js` | `src/MeetingsSDKAdapter/controls/SettingsControl.js` |
| meetings-adapter.control.share-screen | meetings-sdk-adapter | `share-screen` → ShareControl | see module spec | stable | `src/MeetingsSDKAdapter/controls/ShareControl.js` | `src/MeetingsSDKAdapter/controls/ShareControl.js` |
| meetings-adapter.control.switch-camera | meetings-sdk-adapter | `switch-camera` → SwitchCameraControl | see module spec | stable | `src/MeetingsSDKAdapter/controls/SwitchCameraControl.js` | `src/MeetingsSDKAdapter/controls/SwitchCameraControl.js` |
| meetings-adapter.control.switch-microphone | meetings-sdk-adapter | `switch-microphone` → SwitchMicrophoneControl | see module spec | stable | `src/MeetingsSDKAdapter/controls/SwitchMicrophoneControl.js` | `src/MeetingsSDKAdapter/controls/SwitchMicrophoneControl.js` |
| meetings-adapter.control.switch-speaker | meetings-sdk-adapter | `switch-speaker` → SwitchSpeakerControl | see module spec | stable | `src/MeetingsSDKAdapter/controls/SwitchSpeakerControl.js` | `src/MeetingsSDKAdapter/controls/SwitchSpeakerControl.js` |
| meetings-adapter.controls-barrel.AudioControl | meetings-sdk-adapter | `MeetingsSDKAdapter/controls/index.js` | see module spec | stable | `src/MeetingsSDKAdapter/controls/index.js` | `src/MeetingsSDKAdapter/controls/index.js` |
| meetings-adapter.controls-barrel.ExitControl | meetings-sdk-adapter | `MeetingsSDKAdapter/controls/index.js` | see module spec | stable | `src/MeetingsSDKAdapter/controls/index.js` | `src/MeetingsSDKAdapter/controls/index.js` |
| meetings-adapter.controls-barrel.JoinControl | meetings-sdk-adapter | `MeetingsSDKAdapter/controls/index.js` | see module spec | stable | `src/MeetingsSDKAdapter/controls/index.js` | `src/MeetingsSDKAdapter/controls/index.js` |
| meetings-adapter.controls-barrel.MeetingControl | meetings-sdk-adapter | `MeetingsSDKAdapter/controls/index.js` | see module spec | stable | `src/MeetingsSDKAdapter/controls/index.js` | `src/MeetingsSDKAdapter/controls/index.js` |
| meetings-adapter.controls-barrel.RosterControl | meetings-sdk-adapter | `MeetingsSDKAdapter/controls/index.js` | see module spec | stable | `src/MeetingsSDKAdapter/controls/index.js` | `src/MeetingsSDKAdapter/controls/index.js` |
| meetings-adapter.controls-barrel.SettingsControl | meetings-sdk-adapter | `MeetingsSDKAdapter/controls/index.js` | see module spec | stable | `src/MeetingsSDKAdapter/controls/index.js` | `src/MeetingsSDKAdapter/controls/index.js` |
| meetings-adapter.controls-barrel.SwitchCameraControl | meetings-sdk-adapter | `MeetingsSDKAdapter/controls/index.js` | see module spec | stable | `src/MeetingsSDKAdapter/controls/index.js` | `src/MeetingsSDKAdapter/controls/index.js` |
| meetings-adapter.controls-barrel.SwitchMicrophoneControl | meetings-sdk-adapter | `MeetingsSDKAdapter/controls/index.js` | see module spec | stable | `src/MeetingsSDKAdapter/controls/index.js` | `src/MeetingsSDKAdapter/controls/index.js` |
| meetings-adapter.controls-barrel.SwitchSpeakerControl | meetings-sdk-adapter | `MeetingsSDKAdapter/controls/index.js` | see module spec | stable | `src/MeetingsSDKAdapter/controls/index.js` | `src/MeetingsSDKAdapter/controls/index.js` |
| meetings-adapter.controls-barrel.VideoControl | meetings-sdk-adapter | `MeetingsSDKAdapter/controls/index.js` | see module spec | stable | `src/MeetingsSDKAdapter/controls/index.js` | `src/MeetingsSDKAdapter/controls/index.js` |
| meetings-adapter.createMeeting | meetings-sdk-adapter | `createMeeting(destination: string): Observable<Meeting>` | see module spec | stable | `src/MeetingsSDKAdapter.js` | `src/MeetingsSDKAdapter.js` |
| meetings-adapter.disconnect | meetings-sdk-adapter | `disconnect(): Promise<void>` | see module spec | stable | `src/MeetingsSDKAdapter.js` | `src/MeetingsSDKAdapter.js` |
| meetings-adapter.getLayoutTypes | meetings-sdk-adapter | `getLayoutTypes(): string[]` | see module spec | stable | `src/MeetingsSDKAdapter.js` | `src/MeetingsSDKAdapter.js` |
| meetings-adapter.getMeeting | meetings-sdk-adapter | `getMeeting(ID: string): Observable<Meeting>` | see module spec | stable | `src/MeetingsSDKAdapter.js` | `src/MeetingsSDKAdapter.js` |
| meetings-adapter.incomingMeeting | meetings-sdk-adapter | `incomingMeeting(destination): Observable<Meeting>` | see module spec | stable; inherited from interface | `@webex/component-adapter-interfaces` | `@webex/component-adapter-interfaces` |
| meetings-adapter.joinMeeting | meetings-sdk-adapter | `joinMeeting(ID: string, options?: { password?, hostKey?, name?, captcha? }): Promise<void>` | see module spec | stable | `src/MeetingsSDKAdapter.js` | `src/MeetingsSDKAdapter.js` |
| meetings-adapter.leaveMeeting | meetings-sdk-adapter | `leaveMeeting(ID: string): Promise<void>` | see module spec | stable | `src/MeetingsSDKAdapter.js` | `src/MeetingsSDKAdapter.js` |
| meetings-adapter.meetingControls | meetings-sdk-adapter | plain object map | see module spec | stable | `src/MeetingsSDKAdapter.js` | `src/MeetingsSDKAdapter.js` |
| meetings-adapter.refreshCaptcha | meetings-sdk-adapter | `refreshCaptcha(ID: string): Promise<void>` | see module spec | stable | `src/MeetingsSDKAdapter.js` | `src/MeetingsSDKAdapter.js` |
| meetings-adapter.supportedControls | meetings-sdk-adapter | `supportedControls(): string[]` | see module spec | stable | `src/MeetingsSDKAdapter.js` | `src/MeetingsSDKAdapter.js` |
| memberships-adapter.addRoomMember | memberships-sdk-adapter | `addRoomMember(personID: string, roomID: string): Observable<Member>` | see module spec | stable | `src/MembershipsSDKAdapter.js` | `src/MembershipsSDKAdapter.js` |
| memberships-adapter.class | memberships-sdk-adapter | `MembershipsSDKAdapter extends MembershipsAdapter` | see module spec | stable | `src/MembershipsSDKAdapter.js` | `src/MembershipsSDKAdapter.js` |
| memberships-adapter.getMembersFromDestination | memberships-sdk-adapter | `getMembersFromDestination(destinationID: string, destinationType: DestinationType): Observable<Member[]>` | see module spec | stable | `src/MembershipsSDKAdapter.js` | `src/MembershipsSDKAdapter.js` |
| memberships-adapter.removeRoomMember | memberships-sdk-adapter | `removeRoomMember(personID: string, roomID: string): Observable<Member>` | see module spec | stable; inherited from interface | `@webex/component-adapter-interfaces` | `@webex/component-adapter-interfaces` |
| metrics-adapter.class | metrics-sdk-adapter | `MetricsSDKAdapter extends MetricsAdapter` | see module spec | stable | `src/MetricsSDKAdapter.js` | `src/MetricsSDKAdapter.js` |
| metrics-adapter.submitMetrics | metrics-sdk-adapter | `submitMetrics(metric: Metric, preLoginID?: string): Observable<Metric>` | see module spec | stable | `src/MetricsSDKAdapter.js` | `src/MetricsSDKAdapter.js` |
| orgs-adapter.class | organizations-sdk-adapter | `OrganizationsSDKAdapter extends OrganizationsAdapter` | see module spec | stable | `src/OrganizationsSDKAdapter.js` | `src/OrganizationsSDKAdapter.js` |
| orgs-adapter.getOrg | organizations-sdk-adapter | `getOrg(ID: string): Observable<Organization>` | see module spec | stable | `src/OrganizationsSDKAdapter.js` | `src/OrganizationsSDKAdapter.js` |
| people-adapter.class | people-sdk-adapter | `PeopleSDKAdapter extends PeopleAdapter` | see module spec | stable; semver via npm bundle | `src/PeopleSDKAdapter.js` | `src/PeopleSDKAdapter.js` |
| people-adapter.getMe | people-sdk-adapter | `getMe(): Observable<Person>` | see module spec | stable; additive Person fields only | `src/PeopleSDKAdapter.js` | `src/PeopleSDKAdapter.js` |
| people-adapter.getPerson | people-sdk-adapter | `getPerson(ID: string): Observable<Person>` | see module spec | stable | `src/PeopleSDKAdapter.js` | `src/PeopleSDKAdapter.js` |
| people-adapter.searchPeople | people-sdk-adapter | `searchPeople(query: string): Observable<Person[]>` | see module spec | stable | `src/PeopleSDKAdapter.js` | `src/PeopleSDKAdapter.js` |
| pkg.default | src/ | `export default WebexSDKAdapter` from `src/index.js` | see module spec | semver via semantic-release | `src/index.js` | `src/index.js` |
| rooms-adapter.class | rooms-sdk-adapter | `RoomsSDKAdapter extends RoomsAdapter` | see module spec | stable | `src/RoomsSDKAdapter.js` | `src/RoomsSDKAdapter.js` |
| rooms-adapter.createRoom | rooms-sdk-adapter | `createRoom(room: Room): Observable<Room>` | see module spec | stable | `src/RoomsSDKAdapter.js` | `src/RoomsSDKAdapter.js` |
| rooms-adapter.getActivitiesInRealTime | rooms-sdk-adapter | `getActivitiesInRealTime(ID: string): Observable<string>` | see module spec | stable | `src/RoomsSDKAdapter.js` | `src/RoomsSDKAdapter.js` |
| rooms-adapter.getPastActivities | rooms-sdk-adapter | `getPastActivities(ID: string, activityLimit?: number): Observable<string[]>` | see module spec | stable; default limit 50 | `src/RoomsSDKAdapter.js` | `src/RoomsSDKAdapter.js` |
| rooms-adapter.getRoom | rooms-sdk-adapter | `getRoom(ID: string): Observable<Room>` | see module spec | stable | `src/RoomsSDKAdapter.js` | `src/RoomsSDKAdapter.js` |
| rooms-adapter.hasMoreActivities | rooms-sdk-adapter | `hasMoreActivities(ID: string): boolean` | see module spec | stable | `src/RoomsSDKAdapter.js` | `src/RoomsSDKAdapter.js` |
| shared.cache.cachActivities | shared-utilities | `cachActivities(activities[])` | see module spec | stable internal | `src/cache.js` | `src/cache.js` |
| shared.cache.cachSDKActivities | shared-utilities | `cachSDKActivities(sdkActivities[])` | see module spec | stable internal | `src/cache.js` | `src/cache.js` |
| shared.cache.cacheConversations | shared-utilities | `cacheConversations(conversations[])` | see module spec | stable internal | `src/cache.js` | `src/cache.js` |
| shared.cache.get | shared-utilities | `get(key)` | see module spec | stable internal | `src/cache.js` | `src/cache.js` |
| shared.cache.has | shared-utilities | `has(key): boolean` | see module spec | stable internal | `src/cache.js` | `src/cache.js` |
| shared.cache.keys | shared-utilities | `keys(): Iterator` | see module spec | stable internal | `src/cache.js` | `src/cache.js` |
| shared.cache.remove | shared-utilities | `remove(key): boolean` | see module spec | stable internal | `src/cache.js` | `src/cache.js` |
| shared.cache.set | shared-utilities | `set(key, value)` | see module spec | stable internal | `src/cache.js` | `src/cache.js` |
| shared.cache.singleton | shared-utilities | `default export` CacheMeOutside singleton | see module spec | stable internal | `src/cache.js` | `src/cache.js` |
| shared.cache.size | shared-utilities | `size(): number` | see module spec | stable internal | `src/cache.js` | `src/cache.js` |
| shared.cache.values | shared-utilities | `values(): Iterator` | see module spec | stable internal | `src/cache.js` | `src/cache.js` |
| shared.logger.default | shared-utilities | `default export` logger instance | see module spec | stable internal | `src/logger.js` | `src/logger.js` |
| shared.logger.setLevel | shared-utilities | `setLevel(level)` | see module spec | stable internal | `src/logger/logger.js` | `src/logger/logger.js` |
| shared.logger.windowHook | shared-utilities | `window.webexSDKAdapterSetLogLevel(level)` | see module spec | stable internal | `src/logger.js` | `src/logger.js` |
| shared.polyfills.mediaStream | shared-utilities | `MediaStream.prototype.getTracks` shim | see module spec | stable internal | `src/polyfills.js` | `src/polyfills.js` |
| shared.utils.chainWith | shared-utilities | RxJS operator | see module spec | stable internal | `src/utils.js` | `src/utils.js` |
| shared.utils.combineLatestImmediate | shared-utilities | RxJS helper | see module spec | stable internal | `src/utils.js` | `src/utils.js` |
| shared.utils.deepMerge | shared-utilities | object merge | see module spec | stable internal | `src/utils.js` | `src/utils.js` |
| shared.utils.isSpeakerSupported | shared-utilities | boolean | see module spec | stable internal | `src/utils.js` | `src/utils.js` |
| shared.utils.resolveDeviceSwitchArgs | shared-utilities | device switch arg resolver | see module spec | stable internal | `src/utils.js` | `src/utils.js` |
| shared.utils.resolveMeetingID | shared-utilities | `(meetingContext) => string` | see module spec | stable internal | `src/utils.js` | `src/utils.js` |
| shared.utils.safeJsonStringify | shared-utilities | circular-safe JSON.stringify | see module spec | stable internal | `src/utils.js` | `src/utils.js` |
| webex-sdk-adapter.activitiesAdapter | facade | `ActivitiesSDKAdapter` instance | see module spec | stable | `src/ai-docs/activities-sdk-adapter-spec.md` | `src/ai-docs/activities-sdk-adapter-spec.md` |
| webex-sdk-adapter.cache | facade | shared cache singleton | see module spec | stable | `src/ai-docs/shared-utilities-spec.md` | `src/ai-docs/shared-utilities-spec.md` |
| webex-sdk-adapter.connect | facade | `connect(): Promise<void>` | see module spec | stable | `src/WebexSDKAdapter.js` | `src/WebexSDKAdapter.js` |
| webex-sdk-adapter.default | facade | `WebexSDKAdapter extends WebexAdapter` | see module spec | stable | `src/WebexSDKAdapter.js` | `src/WebexSDKAdapter.js` |
| webex-sdk-adapter.disconnect | facade | `disconnect(): Promise<void>` | see module spec | stable | `src/WebexSDKAdapter.js` | `src/WebexSDKAdapter.js` |
| webex-sdk-adapter.meetingsAdapter | facade | `MeetingsSDKAdapter` instance | see module spec | stable | `src/ai-docs/meetings-sdk-adapter-spec.md` | `src/ai-docs/meetings-sdk-adapter-spec.md` |
| webex-sdk-adapter.membershipsAdapter | facade | `MembershipsSDKAdapter` instance | see module spec | stable | `src/ai-docs/memberships-sdk-adapter-spec.md` | `src/ai-docs/memberships-sdk-adapter-spec.md` |
| webex-sdk-adapter.metricsAdapter | facade | `MetricsSDKAdapter` instance | see module spec | stable | `src/ai-docs/metrics-sdk-adapter-spec.md` | `src/ai-docs/metrics-sdk-adapter-spec.md` |
| webex-sdk-adapter.organizationsAdapter | facade | `OrganizationsSDKAdapter` instance | see module spec | stable | `src/ai-docs/organizations-sdk-adapter-spec.md` | `src/ai-docs/organizations-sdk-adapter-spec.md` |
| webex-sdk-adapter.peopleAdapter | facade | `PeopleSDKAdapter` instance | see module spec | stable | `src/ai-docs/people-sdk-adapter-spec.md` | `src/ai-docs/people-sdk-adapter-spec.md` |
| webex-sdk-adapter.roomsAdapter | facade | `RoomsSDKAdapter` instance | see module spec | stable | `src/ai-docs/rooms-sdk-adapter-spec.md` | `src/ai-docs/rooms-sdk-adapter-spec.md` |

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

| Contract ID | Owner | Symbol | Signature | Stability | Detail | Defined at |
|---|---|---|---|---|---|---|
| pkg.umd | build | `UMDWebexSDKComponentAdapter` | Rollup UMD global name | semver | `rollup.config.js` | `dist/webexSDKComponentAdapter.umd.js` |
| pkg.esm | build | `WebexSDKAdapter` default export | same as `src/index.js` | semver | `rollup.config.js` | `dist/webexSDKComponentAdapter.esm.js` |

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
