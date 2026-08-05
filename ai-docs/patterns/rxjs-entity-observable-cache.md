<!-- ───────────────────────────────
  Template:     Pattern
  Template-ID:  pattern-rxjs-entity-cache
  Generates:    ai-docs/patterns/rxjs-entity-observable-cache.md
  Library ver:  0.2.1
  Last updated: 2026-08-05
─────────────────────────────── -->

# Pattern: RxJS entity observable cache

Observed in: `src/ActivitiesSDKAdapter.js`, `src/RoomsSDKAdapter.js`, `src/PeopleSDKAdapter.js`, `src/OrganizationsSDKAdapter.js`

## Intent

Reuse one hot observable per entity ID so multiple subscribers share SDK fetch + live updates.

## Correct

```javascript
// Create ReplaySubject(1) on first getActivity(ID) call; store in this.activityObservables[ID]
// Subsequent callers subscribe to the same subject
getActivity(ID) {
  if (!this.activityObservables[ID]) {
    this.activityObservables[ID] = new ReplaySubject(1);
    this.fetchActivity(ID).then(/* next */, /* error on subject */);
  }
  return this.activityObservables[ID].asObservable();
}
```

Evidence: `src/ActivitiesSDKAdapter.js`, `src/RoomsSDKAdapter.js`, `src/PeopleSDKAdapter.js`

## Incorrect

```javascript
// Anti-pattern: new Observable per call — duplicate SDK fetches and divergent state
getActivity(ID) {
  return new Observable((subscriber) => {
    this.fetchActivity(ID).then(subscriber.next);
  });
}
```

## Verification

- Unit tests assert single fetch for duplicate subscriptions (`ActivitiesSDKAdapter.test.js`).
