<!-- ───────────────────────────────
  Template:     Review-Check Catalog
  Template-ID:  review-checklist
  Description:  Pre-merge review gates for humans and validators.
  Generates:    ai-docs/REVIEW_CHECKLIST.md
  Library ver:  0.2.2
  Last updated: 2026-08-05
─────────────────────────────── -->

# Review-Check Catalog — @webex/sdk-component-adapter

> Entry: [`AGENTS.md`](../AGENTS.md) · Run by **validator runtime ≠ generator runtime**

## Core checks (always run)

| # | Check | What it verifies | Severity if it fails |
|---|---|---|---|
| C1 | Spec-currency + WHAT/WHY | Spec/docs changed with code; requirements state WHAT and WHY | Blocking |
| C2 | Contract correctness | Provides/Requires delta complete; no undocumented breaking npm/export change | Blocking |
| C3 | Code-vs-spec match | Signatures, connect/disconnect order, public surface match code | Blocking |
| C4 | Test adequacy | Acceptance criteria have positive and negative tests; coverage bar met | Important |
| C5 | Error handling + input validation | Invalid IDs handled; observable errors documented for caller-recoverable cases | Important |
| C6 | Security baseline | No secrets; no credential logging; peer deps unchanged without review | Blocking |

## Coverage-conditional checks

| # | Check | When it applies | What it verifies | Severity |
|---|---|---|---|---|
| K1 | Regression guard | Modifying Partial/Untracked module or REMOVING/MODIFYING requirements | Characterization or unit tests prove unchanged invariants; **positive and negative** cases | **Blocking** |
| K2 | Grounding | Partial module | Claims cite file paths; gaps marked | Important |
| K3 | Drift threshold | Any tracked module | Manifest coverage matches evidence | Important |
| K4 | Coverage-state accuracy | Promotion/demotion proposed | Ratchet rules honored | Medium |

**K1 semantics (template v0.2.1):** When changing a Partial module, reviewers must confirm tests cover both expected success paths and failure paths (e.g. invalid meeting ID → observable error). Absence of negative coverage for modified error behavior is **Blocking**.

## Cross-cutting checks

| # | Check | What it verifies | Severity |
|---|---|---|---|
| X1 | Cross-model review | Validator runtime ≠ generator runtime | Blocking when required |
| X2 | Observability | Logging adequate; no secrets in logs | Medium |
| X3 | Rollout safety | Semver/npm publish impact assessed for contract changes | Important |

## How the set is selected

1. Always run core C1–C6.
2. Add K1–K4 when touching Partial modules (current Stage 0 default for all modules).
3. Add X1 for SDD validation gate; X2–X3 for release/contract changes.

## Output

- Compliance matrix + severity-sorted findings + verdict (Pass / Pass-with-warnings / Blocked).
- Draft only — human posts to PR.
