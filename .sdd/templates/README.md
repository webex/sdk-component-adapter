# SDLC Templates

Shared, stage-agnostic templates for Spec Driven Development. This repository is the source of
truth for reusable document shapes only. Any generator may consume these templates, but the templates
do not depend on a specific runtime or implementation harness. A new reader can understand the whole
library from this README.

## Use This Library

Developers normally do not edit these files during feature work. A repository setup or generation
process copies or seeds them into a target repo, then instantiates them as real docs.

You can consume this library in either mode:

| Mode | How it works | Responsibility |
|---|---|---|
| [Default SDD skills](https://sqbu-github.cisco.com/WebexDevPlatform/SDLC-Skills) | The default SDD setup/generation flow seeds these templates into the target repo and fills them during onboarding or feature work. | Keep this library version pinned in the consuming repo and update the pin when the template snapshot changes. |
| Your own process | A team-owned generator, script, or manual workflow copies the needed template slices and fills them using the conventions below. | Preserve template headers, generated paths, ownership rules, and context-efficiency rules. |

The templates do not require the default SDD skills. They define the document shapes and conventions; any
consumer that preserves those shapes can use them.

## Quick Start

| Need | Go to |
|---|---|
| Understand repo-level docs created during onboarding | `component-repo/standing-docs/` |
| Understand the per-module canonical spec | `component-repo/module-docs/` |
| Understand patterns, rules, and ADR scaffolds | `component-repo/reference-docs/README.md` |
| Understand feature lifecycle artifacts | `feature-package/` |

1. Choose the template slice you need: `component-repo/` for standing repo/module docs,
   `feature-package/` for one change from intake through implementation planning.
2. Copy the selected templates into the target repo's template root, commonly `.sdd/templates/`, or
   into an equivalent location recorded by that repo.
3. Instantiate generated docs into the target repo paths named by each template's `Generates` header.
4. Preserve the metadata header and any rendered `Generated from` row so generated docs can be traced
   back to this library version.
5. Rewrite relative links only when the target repo uses a non-standard generated-doc layout.
6. Keep run records and other temporary generation evidence outside canonical docs, under
   `.generated/` by default.

Edit this library only when changing the reusable document shape for future generated docs. Do not put
repo-specific facts in this repository.

## Direct Module-Spec Generation

For teams using these templates without the default generation flow, module-spec work follows this
minimum path:

1. Identify the module boundary from code, package config, tests, and public entry points.
2. Read any existing module overview, architecture, HLD, LLD, API, test, or AI-agent docs and record
   whether each is current, stale, or conflicting.
3. Instantiate `component-repo/module-docs/module-spec.template.md` at
   `<module-path>/ai-docs/<module-name>-spec.md`.
4. Fill the spec using `component-repo/module-docs/module-spec-quality.md`: requirements with WHAT,
   WHY, evidence, diagrams, use cases, failure paths, relationships, pitfalls, and module test
   strategy.
5. Update `ai-docs/SPEC_INDEX.md` so future agents route to the canonical module spec, and update the
   root contract index plus native schema/API source when public surfaces change.
6. Keep temporary notes, transcripts, metrics, and draft validation reports under `.generated/`.

## Library Rules

- Keep templates reusable: do not name a specific generator, runtime, or implementation harness
  inside template text.
- `component-repo/` templates describe standing documentation for one component repository.
- `feature-package/` templates describe one change — feature, defect, or module-spec work — from
  intake through design, decomposition, and implementation planning.
- Execution assets (run records, process playbooks, hooks, and validation reports) are generator-owned
  and do not live in this shared template library.
- Generated docs **link to canonical docs, never restate them**; each overlapping section names the one
  doc that owns the fact so the same content is not filled in two places.
- Live questions produced from these templates should be developer-facing. Ask about repo state,
  touched areas, public behavior, risk, and ownership; record internal routing, coverage, and manifest
  details after the answer is validated.

## Per-file catalog

### Component Repository Templates

These templates generate standing documentation for one component repository. In multi-repo systems,
"repository" means the local component repo, not the whole product workspace.

| Source area | Generates | Purpose |
|---|---|---|
| `component-repo/standing-docs/` | `AGENTS.md`, `ai-docs/ARCHITECTURE.md`, `ai-docs/SPEC_INDEX.md`, + standing docs under `ai-docs/` | The repo's standing docs written once and maintained forever: the root agent entry contract, the system architecture, the doc router and module registry, ubiquitous-language glossary, standing security posture, as-built contracts catalog and living service-state registry, data model, getting-started loop (with toolchain and artifact registries), enforceable rules, the review-check catalog, and the repo-wide test index — so an agent finds the entry point, router, rules, contracts, commands, tests, and domain language without guessing |
| `component-repo/module-docs/` | `<module-path>/ai-docs/<module-name>-spec.md` by default | Per-module canonical spec combining orientation (purpose, stack, structure, source-of-truth files, public surface, dependencies, coverage score metadata) with detailed behavior (data flow, sequence/class diagrams, use cases, business rules & invariants, concurrency, pitfalls, test approach) for modules/components inside the repository; `module-spec-quality.md` defines the generation acceptance bar |
| `component-repo/reference-docs/` | `ai-docs/patterns/`, `ai-docs/rules/`, `ai-docs/adr/` | Repeatable reference docs: repo conventions taken from real code (patterns — correct vs incorrect form, where they appear), enforceable rules (the rule, why, how to follow, how it's enforced), and standing architecture decisions (ADRs — context, decision, alternatives rejected, consequences; immutable once accepted). Start at `component-repo/reference-docs/README.md`. |

### Feature-Package Templates

These templates are copied into a target repository's `.sdd/templates/` area and instantiated per
change. A change may be a feature, a defect, or module-spec work — the intake templates route each
type into the same lifecycle. They are not filled when creating the repository's standing docs.

The feature lifecycle has three primary stages: **Capture** (intake and feature-spec capture),
**Discovery** (discovery, design, test strategy, and decomposition), and **Development** (implementation
planning and code).

| Source area | Lifecycle stage | Generates | Purpose |
|---|---|---|---|
| `feature-package/intake/` | Capture (intake) | `.generated/sdd/features/<KEY>/run-records/intake-questionnaire.md` | Code-grounded intake question sets by change type (feature / defect / new-module or module-spec); the resulting change class gates the conditional feature-spec sections |
| `feature-package/spec/` | Capture (capture) | `features/<KEY>/spec/feature-spec.md` | Product intent: WHAT, WHY, scope, acceptance criteria, success/guardrail metrics, requirements state, stakeholders, contracts delta, interaction matrix, and change log |
| `feature-package/design/` | Discovery (design) | `features/<KEY>/design/ + contracts/` | Technical solution: feature architecture (system context, decomposition, object model, alternatives, views, toggle), scale, service impact, interfaces, HA/failure handling, rollout, coverage summary, and sign-off; per-interface contracts hold full schema, error catalog, and backward-compat |
| `feature-package/test-strategy/` | Discovery | `features/<KEY>/test-strategy.md` | Feature/system test plan: use-cases→tests across contract, integration, E2E, scale, security, resiliency, and production tiers (unit tests live in the module spec) |
| `feature-package/tasks/` | Discovery (decomposition) | `features/<KEY>/tasks/<epic>/epic.md`, `task-<n>.md` | Epic + task decomposition: a coherent design slice (epic) broken into PR-sized tasks, each with an explicit ownership boundary and verifier-exit criteria |
| `feature-package/implementation/` | Development | `features/<KEY>/tasks/<epic>/implementation-plan-<n>.md` | Per-task implementation plan: current context, approach, changes, rollback, anticipated PR split. Template source: `feature-package/implementation/`; generated output: `features/<KEY>/tasks/<epic>/implementation-plan-<n>.md` |

## Conventions

1. **Metadata header.** Each template opens with a comment block — `Template / Template-ID / Generates
   / Description / Library ver / Last updated` — that does not render in the instantiated doc. Don't
   remove or duplicate it. Companion standards such as `module-spec-quality.md` are reference
   documents, not fill-in templates, and do not need a `Generates` header unless they begin generating
   a canonical document.
2. **Navigation pointer.** A `>` block near the top points to the root `AGENTS.md` (agent entry) →
   `SPEC_INDEX.md` (router) → `ARCHITECTURE.md`, then this doc and its closest siblings. Links are
   relative to the doc's instantiated location and assume the standard layout (see Naming Rules); they
   work multi-repo (the root may be a workspace-level `AGENTS.md`) and single-repo, and must be adjusted
   if a repo instantiates at a different depth.
3. **Context-efficiency.** Generated docs **link to canonical docs, never duplicate** them. Root
   `AGENTS.md` + `ai-docs/SPEC_INDEX.md` load first; everything else loads on demand. Generated docs
   stay context-efficient while module specs retain the detailed design, diagram, flow,
   relationship, use-case, state/error/protocol, and test-strategy sections that apply to that module.
4. **Flat headings + `Include if:` notes.** Concrete headings are baked in; non-universal sections carry
   a plain-English `Include if:` note. Where present, `[condition-id: scope.key]` tags are
   machine-referenceable identifiers whose scope is `repo`, `module`, or `feature`, supporting
   mechanical keep/drop of sections. Generated docs preserve the source-template heading order unless a
   repo-specific extension is explicitly recorded in the generated doc.
5. **Per-section guidance.** Each section carries an inline `Capture` (what to fill) / `Avoid` (the
   anti-pattern) / `Example` (a short generic illustration) comment.
6. **Detail level.** A generated doc is not complete because the file exists. Each retained heading
   must contain concrete, source-grounded content; an evidence-backed `N/A`; or `[NEEDS HUMAN INPUT]`
   only when the relevant condition/profile value is unresolved. Do not replace a standing doc,
   feature doc, or module spec with a compact summary of the template.
7. **Diagram coverage.** When a template asks for sequence diagrams, first identify the major operation
   groups from public surfaces, use cases, events, commands, state transitions, async jobs, or rollout
   steps. Use one diagram per operation group unless the operations share the same actors, ordering,
   transport, state transition, and failure behavior. Include error, timeout, retry, rejected,
   rollback, and recovery paths where the design or code has them.
8. **Ownership pointers.** Where a concern legitimately appears in more than one template, the section
   opens with a one-line ownership note stating which doc owns the fact and which only references it
   (e.g. spec owns the product-level delta; the per-interface contract owns the full schema; the
   standing catalog owns the stable as-built surface).
9. **Rendered metadata and evidence.** Module and feature docs expose provenance in rendered Markdown,
   not only in comments, using an in-body **Metadata table** with a `Generated from` row,
   generator/approver/date fields where applicable, coverage or status fields where applicable, and
   validation status when the doc can be validated. Standing docs keep their source template identity in
   the template header and should include rendered evidence/report links wherever they make
   non-obvious claims; they do not need a separate provenance table unless a repo chooses one.
   Generated requirements and behavioral claims cite concrete `file path` evidence or an approved
   unknown; broad references such as "see source tree" are not enough.

## Naming Rules

- Repository-level standing docs keep their conventional generated names, but only `AGENTS.md` is
  rooted for tool auto-discovery. The default standing-doc root is `ai-docs/`, so generated paths are
  `ai-docs/ARCHITECTURE.md`, `ai-docs/SERVICE_STATE.md`, and so on unless the manifest layout overrides them.
- Per-feature docs use kebab case (`feature-spec.md`). Per-module spec file names use
  `<module-name>-spec.md` under the source-local default path
  `<module-path>/ai-docs/<module-name>-spec.md`.
- Repeatable generated docs use kebab case plus an index/number (`ai-docs/adr/NNNN-<title>.md`,
  `task-<n>.md`).
- Template files use `<name>.template.md`.
- Repeatable examples under `component-repo/reference-docs/` keep the `_*-example.md` form because they
  are example records copied many times, not one fill-once document.
- The standard instantiated layout for a change is `features/<KEY>/{spec,design,tasks,test-strategy}/`;
  template navigation links assume this layout. If a repo instantiates elsewhere, the generator rewrites
  the relative links and records the location in `SPEC_INDEX.md`.

## Versioning

The template library is versioned as **one set**. Each template or example fill-in declares
`Template-ID`, `Generates`, `Library ver`, and `Last updated` in its header so generated docs retain
provenance without inventing generator-specific fields. Companion standards may omit `Generates`
because they are read as guidance rather than instantiated. The per-file header carries the set-level
library version (not an independent per-file semver); `Last updated` tracks staleness of the individual
template/example file and should change whenever that file's reusable shape changes.

Current library version: `0.2.2`.
