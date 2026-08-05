<!-- ───────────────────────────────
  Template:     Module Spec
  Template-ID:  module-spec
  Generates:    src/ai-docs/metrics-sdk-adapter-spec.md
  Library ver:  0.2.1
  Last updated: 2026-08-05
─────────────────────────────── -->

# metrics-sdk-adapter — SPEC

> [`AGENTS.md`](../../AGENTS.md) · [`SPEC_INDEX.md`](../../ai-docs/SPEC_INDEX.md)

## Metadata

| Field | Value |
|---|---|
| Module id | metrics-sdk-adapter |
| Source path(s) | `src/MetricsSDKAdapter.js` |
| Doc kind | Module spec |
| Coverage score | 88% assessed 2026-08-05 |
| Generated from | `module-spec` @ SDLC template library `0.2.1` |
| generated_by / approved_by / updated_at | cursor-agent / pending PR approval / 2026-08-05 |
| Validation status | not-run |

## Evidence Rules

File path evidence only.

## Source Material Register

| Source material | Scope | Decision | Detail location |
|---|---|---|---|
| Code | behavior | verified | `src/MetricsSDKAdapter.js` |

## Overview

Submits client metrics to Webex via SDK metrics API.

## Purpose / Responsibility

Wrap `submitMetrics` as Observable with normalized response type.

## Stack

JavaScript, RxJS, Webex SDK metrics.

## Folder / Package Structure

```
src/MetricsSDKAdapter.js
src/MetricsSDKAdapter.test.js
```

## Key Files (source of truth)

| File | Role |
|---|---|
| `src/MetricsSDKAdapter.js` | Implementation |

## Public Surface

| Symbol | Kind | Description |
|---|---|---|
| `MetricsSDKAdapter` | class | Metrics adapter |
| `submitMetrics(metric, preLoginID?)` | Observable | Submit metric payload |

## Requires (dependencies)

| Dependency | Purpose |
|---|---|
| webex SDK metrics | Upload |

## Requirements

| ID | WHAT | WHY | Evidence |
|---|---|---|---|
| R-X1 | SDK errors swallowed to `{type: null}` | Avoid breaking UI on telemetry failure | `src/MetricsSDKAdapter.js` |

## Design Overview

Single-shot observable from SDK promise; catchError returns benign object.

## Data Flow

submitMetrics → SDK → map type → of() emit.

## Sequence Diagram(s)

Single trivial pass-through — one operation group (submit metric).

## Class / Component Relationships

Extends `MetricsAdapter`.

## Use Cases

Host sends usage telemetry without blocking UX.

## Concurrency & Reactive Flow

Cold observable per call.

## Pitfalls

Callers cannot distinguish SDK failure from empty type — intentional degradation.

## Test-Case Strategy (module)

`MetricsSDKAdapter.test.js`

## Traceability

| Requirement | Test |
|---|---|
| R-X1 | `MetricsSDKAdapter.test.js` |
