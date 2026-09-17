# Consulting Agent Teams Template

Standard teammate roles, task list templates, and dependency chains for BlackBeltSuite Agent Teams pipelines.

> **Requires:** `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in settings.json

---

## Team Structure

### Standard Consulting Team

```
Lead Agent: HORIZON Coordinator
  |
  +-- Teammate: DataScrub Agent          [GATE - must complete first]
  |     Role: Anonymize client data before any processing
  |     Skills: DataScrub
  |     Output: scrubbed files + mapping file
  |
  +-- Teammate: DataPrep Agent           [depends on: DataScrub]
  |     Role: ETL, profiling, quality assurance
  |     Skills: DataAnalysis (Phases 1-4), DocReader
  |     Output: data_etl.csv, qa_report.md, source_manifest.json
  |
  +-- Teammate: Analyst Agent            [depends on: DataPrep]
  |     Role: Statistical analysis, hypothesis testing, decomposition
  |     Skills: StatisticalAnalysis, VarianceAnalysis, ShapleyDecomposition,
  |             ProcessCapability, RootCauseAnalysis, DOEDesigner
  |     Output: findings.json, phase outputs per workflow
  |
  +-- Teammate: Causal Agent             [depends on: Analyst]
  |     Role: Causal inference if escalated, DAG building
  |     Skills: CausalInference, BookOfWhy
  |     Output: causal_findings.md, DAG specification
  |     Note: Only spawned if causal claims needed
  |
  +-- Teammate: Report Agent             [depends on: Analyst (+ Causal if spawned)]
  |     Role: Compile findings into consulting deliverable
  |     Skills: ReportCompiler
  |     Output: draft report (.md), slide concepts, visual suggestions
  |
  +-- Teammate: Challenger Agent         [depends on: Report]
  |     Role: Adversarial methodology review
  |     Skills: MethodologyChallenger
  |     Output: challenge_report.md with verdict
  |
  +-- Lead: Synthesize results, present to the planner, handle iterations
```

---

## Task List Templates

### FullAnalysis Task List

```
Task 1: [DataScrub] Anonymize client data
  Status: pending
  Blocks: 2
  Output: {project}/scrubbed/

Task 2: [DataPrep] Ingest and transform data
  Status: pending
  BlockedBy: 1
  Blocks: 3, 4
  Output: data_etl.csv, qa_report.md

Task 3: [Analyst] Phase 1-2: Define outcomes + Describe data
  Status: pending
  BlockedBy: 2
  Blocks: 4
  Output: problem_definition.md, descriptive_stats.md

Task 4: [Analyst] Phase 3-4: Hypothesize + Decompose variance
  Status: pending
  BlockedBy: 3
  Blocks: 5
  Output: hypotheses.md, variance_decomposition.md

Task 5: [Analyst] Phase 5-6: Test hypotheses + Assess stability
  Status: pending
  BlockedBy: 4
  Blocks: 6
  Output: hypothesis_tests.md, stability_assessment.md

Task 6: [Analyst] Phase 7-8: Quantify impact + Recommend
  Status: pending
  BlockedBy: 5
  Blocks: 7, 8
  Output: impact_assessment.md, recommendations.md

Task 7: [Causal] Build DAG and estimate effects (if needed)
  Status: pending
  BlockedBy: 6
  Blocks: 8
  Output: causal_findings.md
  Note: Skip if no causal escalation needed

Task 8: [Report] Compile consulting deliverable
  Status: pending
  BlockedBy: 6 (or 7 if causal)
  Blocks: 9
  Output: {client}_report_draft.md

Task 9: [Challenger] Adversarial review
  Status: pending
  BlockedBy: 8
  Output: challenge_report.md
```

### VarianceDeepDive Task List

```
Task 1: [DataScrub] Anonymize client data
  Status: pending
  Blocks: 2

Task 2: [DataPrep] Ingest and prepare variance data
  Status: pending
  BlockedBy: 1
  Blocks: 3

Task 3: [Analyst] Quantify total variance + Shapley decomposition
  Status: pending
  BlockedBy: 2
  Blocks: 4, 5
  Note: Phases 1-2 can run together (no dependency between them)

Task 4: [Analyst] Hypothesize drivers for vital few factors
  Status: pending
  BlockedBy: 3
  Blocks: 5

Task 5: [Analyst] Test hypotheses + Map to CX/COST/EX outcomes
  Status: pending
  BlockedBy: 4
  Blocks: 6

Task 6: [Report] Compile variance analysis report
  Status: pending
  BlockedBy: 5
  Blocks: 7

Task 7: [Challenger] Review methodology and conclusions
  Status: pending
  BlockedBy: 6
```

### QuickDiagnostics Task List

```
Task 1: [DataScrub] Anonymize (if client data)
  Status: pending
  Blocks: 2

Task 2: [Analyst] Descriptive stats + Correlations + Stability + Outcome mapping
  Status: pending
  BlockedBy: 1
  Note: All 4 phases run sequentially within one agent (fast workflow)

Task 3: [Lead] Present findings to the planner
  Status: pending
  BlockedBy: 2
```

### ProcessImprovement Task List

```
Task 1: [DataScrub] Anonymize client data
  Status: pending
  Blocks: 2

Task 2: [DataPrep] Ingest baseline data
  Status: pending
  BlockedBy: 1
  Blocks: 3

Task 3: [Analyst] Baseline process capability
  Status: pending
  BlockedBy: 2
  Blocks: 4

Task 4: [Analyst] Root cause analysis + Shapley decomposition
  Status: pending
  BlockedBy: 3
  Blocks: 5

Task 5: [Analyst] Design experiment (DOE)
  Status: pending
  BlockedBy: 4
  Blocks: 6

Task 6: [HUMAN] Execute experiment
  Status: pending
  BlockedBy: 5
  Blocks: 7
  Note: Pauses pipeline — human runs the experiment

Task 7: [Analyst] Analyze experimental results
  Status: pending
  BlockedBy: 6
  Blocks: 8

Task 8: [Analyst] Confirm improvement + Set control charts
  Status: pending
  BlockedBy: 7
  Blocks: 9

Task 9: [Report] Compile improvement report
  Status: pending
  BlockedBy: 8
  Blocks: 10

Task 10: [Challenger] Final review
  Status: pending
  BlockedBy: 9
```

---

## Teammate Specifications

### DataScrub Agent
```
Name: data-scrubber
Subagent Type: general-purpose
Model: haiku (fast, low-cost — scrubbing is local Python)
Skills Loaded: DataScrub
Instruction: "Anonymize all files in {input_dir} using DataScrub skill.
  Ask for encryption password. Output to {output_dir}/scrubbed/.
  Report what was scrubbed and where the mapping file is saved."
```

### DataPrep Agent
```
Name: data-prep
Subagent Type: general-purpose
Model: sonnet (balanced — needs data understanding)
Skills Loaded: DataAnalysis (Phases 1-4 only), DocReader
Instruction: "Run DataAnalysis Phases 1-4 on the scrubbed data in {scrubbed_dir}.
  Profile sources, run ETL, execute analysis, validate quality.
  Stop after QA — do NOT generate reports.
  Save all outputs to {working_dir}/data-prep/."
```

### Analyst Agent
```
Name: analyst
Subagent Type: general-purpose
Model: opus (maximum reasoning for analytical work)
Skills Loaded: StatisticalAnalysis, VarianceAnalysis, ShapleyDecomposition,
              ProcessCapability, RootCauseAnalysis, DOEDesigner, OutcomeFramework
Instruction: "Execute the analytical phases assigned to you in the task list.
  Use the prepared data from {working_dir}/data-prep/.
  Follow the BlackBeltSuite workflow phases exactly.
  Every finding MUST include: effect size, uncertainty bounds, CX/COST/EX mapping,
  and a causal caveat noting this is Rung 1 (association).
  Save structured outputs to {working_dir}/analysis/."
```

### Causal Agent
```
Name: causal-analyst
Subagent Type: general-purpose
Model: opus (deep reasoning required for causal inference)
Skills Loaded: CausalInference, BookOfWhy
Instruction: "Build a causal DAG for the analysis findings in {working_dir}/analysis/.
  Load BookOfWhy context using: bun run Tools/LoadCausalContext.ts --all
  Check identifiability, estimate effects if possible.
  Document all assumptions explicitly.
  Save to {working_dir}/causal/."
Condition: Only spawn if analyst flags causal escalation
```

### Report Agent
```
Name: report-writer
Subagent Type: general-purpose
Model: sonnet (good writing quality, faster than opus for prose)
Skills Loaded: ReportCompiler, DocReader
Instruction: "Compile a consulting report from the analysis outputs in {working_dir}/.
  Ingest: data-prep outputs, analysis findings, causal findings (if any).
  Use the ReportCompiler CompileReport workflow.
  Generate: draft report (.md), slide concepts, source inventory.
  Save to {output_dir}/."
```

### Challenger Agent
```
Name: methodology-challenger
Subagent Type: general-purpose
Model: opus (needs deep reasoning to find weaknesses)
Skills Loaded: MethodologyChallenger
Instruction: "Perform a full adversarial review of the consulting report at {output_dir}/.
  Read the pipeline-state.json to identify which skills were used.
  Read each skill's SKILL.md to understand intended methodology.
  Check CX/COST/EX outcome mapping is present on every finding.
  Produce a challenge_report.md with verdict.
  Save to {output_dir}/."
```

---

## File-Based Handoff Convention

All Agent Teams teammates communicate through files in the project working directory:

```
{project}/02-working/
├── pipeline-state.json       # Pipeline state (see schema below)
├── scrubbed/                 # DataScrub output
│   ├── *.md                  # Scrubbed documents
│   ├── *.xlsx                # Scrubbed spreadsheets
│   └── mapping_*.enc         # Encrypted mapping
├── data-prep/                # DataPrep output
│   ├── source_manifest.json  # Source catalog
│   ├── data_etl.csv          # Transformed data
│   ├── qa_report.md          # Quality report
│   └── qa_flags.json         # Quality flags
├── analysis/                 # Analyst output
│   ├── phase_1_define.md
│   ├── phase_2_describe.md
│   ├── phase_3_hypothesize.md
│   ├── phase_4_decompose.md
│   ├── phase_5_test.md
│   ├── phase_6_stability.md
│   ├── phase_7_impact.md
│   ├── phase_8_recommend.md
│   └── findings.json         # Structured findings
├── causal/                   # Causal Agent output (if spawned)
│   ├── dag.mermaid
│   ├── causal_findings.md
│   └── assumptions.md
└── report/                   # Report Agent output
    ├── {client}_report_draft.md
    ├── slide_concepts.md
    ├── sources_used.md
    └── challenge_report.md   # Challenger output
```

---

## Invocation Pattern

When the planner says "bb analyze" or invokes a BlackBeltSuite workflow:

```
1. HORIZON (Lead) identifies the workflow (FullAnalysis, VarianceDeepDive, etc.)
2. Creates the project directory structure
3. Initializes pipeline-state.json
4. Spawns DataScrub Agent with Task 1
5. On Task 1 completion, spawns DataPrep Agent
6. On DataPrep completion, spawns Analyst Agent
7. Analyst works through assigned phases
8. If causal escalation flagged, spawns Causal Agent
9. Spawns Report Agent when analysis complete
10. Spawns Challenger Agent when report complete
11. Presents findings + challenge report to the planner
12. Handles iteration if needed
```

---

## Parallelism Opportunities

### Within FullAnalysis
- Phases 3 (Hypothesize) and 4 (Decompose) can run in parallel — neither depends on the other
- Phase 7 (Impact) can start as soon as Phase 5 (Test) completes, without waiting for Phase 6 (Stability)

### Within VarianceDeepDive
- Phase 1 (Quantify) and Phase 2 (Decompose) can run together if Shapley is pre-configured

### Across Workflows
- DataScrub always runs first (security gate)
- Report always runs last (needs all analysis)
- Challenger always runs after Report

---

## DataScrub as Mandatory Gate

**RULE:** No consulting Agent Teams pipeline runs without DataScrub completing first.

When client data is involved:
1. DataScrub MUST be Task 1 in every pipeline
2. All subsequent tasks MUST be BlockedBy Task 1
3. If DataScrub fails, the entire pipeline halts
4. If data is already scrubbed (e.g., internal/synthetic data), Task 1 can be marked completed immediately with a note

This ensures client confidentiality is maintained across all agent teammates, each of which operates in its own context window and could potentially expose data through API calls.
