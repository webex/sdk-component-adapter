<!-- ───────────────────────────────
  Template:     GLOSSARY
  Template-ID:  glossary
  Generates:    ai-docs/GLOSSARY.md
  Library ver:  0.2.1
  Last updated: 2026-08-05
─────────────────────────────── -->

# GLOSSARY — @webex/sdk-component-adapter

| Term | Definition | Authoritative location |
|---|---|---|
| Adapter | Class implementing `@webex/component-adapter-interfaces` for a Webex domain | `src/*SDKAdapter.js` |
| WebexSDKAdapter | Facade wiring all domain adapters; owns connect/disconnect | `src/WebexSDKAdapter.js` |
| SDK / datasource | Authenticated Webex JS SDK instance passed to constructors | Host application |
| Observable | RxJS stream returned by adapter query methods | `rxjs` peer |
| Mercury | Webex websocket channel for real-time events | SDK `internal.mercury` |
| Meeting control | UI-action helper (join, mute, etc.) delegating to MeetingsSDKAdapter | `src/MeetingsSDKAdapter/controls/` |
| Component adapter interfaces | Shared TypeScript/JS contracts for `@webex/components` | npm `@webex/component-adapter-interfaces` |
| ReplaySubject | Multicast observable cache for entity-by-ID streams | Used in rooms, activities, people adapters |
| keep-separate | SDD policy: legacy README/CONTRIBUTING unchanged; new specs canonical | `.sdd/manifest.json` |
