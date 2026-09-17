---
name: ProcessCapability
description: Statistical process control, control charting, and capability analysis. Assesses process stability and capability to meet specifications. USE WHEN user mentions SPC, control chart, capability analysis, Cp, Cpk, process stability, out of control, special cause, run rules, X-bar R, I-MR chart, process variation.
dependencies:
  - StatisticalAnalysis
  - OutcomeFramework
---

# ProcessCapability Skill

Statistical Process Control (SPC), control charting, and capability analysis for assessing process stability and performance against specifications.

**Key Principle:** A process must be stable (in statistical control) before capability metrics are meaningful.

## Workflow Routing

| Intent | Workflow | Triggers |
|--------|----------|----------|
| Build and interpret control charts | `ControlChart.md` | control chart, I-MR, X-bar, p-chart, c-chart |
| Calculate Cp, Cpk, Pp, Ppk | `CapabilityAnalysis.md` | capability, Cp, Cpk, Pp, Ppk, sigma level |
| Assess process stability over time | `StabilityAssessment.md` | stability, in control, special cause |
| Detect patterns indicating special causes | `RunRulesAnalysis.md` | run rules, Western Electric, pattern |

## Quick Commands

```
spc chart [data] [type]             → Create control chart
spc capability [data] [usl] [lsl]   → Calculate Cp, Cpk
spc stability [data]                → Assess process stability
spc rules [data]                    → Check run rules violations
```

## Control Chart Selection Logic

```
What type of data?
├─► Continuous (measured)
│   ├─► Subgroups of size 1 → I-MR chart
│   ├─► Subgroups 2-10 → X-bar R chart
│   └─► Subgroups >10 → X-bar S chart
└─► Attribute (counted)
    ├─► Defectives (pass/fail)
    │   ├─► Constant sample size → np chart
    │   └─► Variable sample size → p chart
    └─► Defects (count per unit)
        ├─► Constant opportunity → c chart
        └─► Variable opportunity → u chart
```

## Capability Metrics Quick Reference

| Metric | Formula | Use |
|--------|---------|-----|
| Cp | (USL - LSL) / 6σ_within | Potential (if centered) |
| Cpk | min[(USL - μ)/3σ, (μ - LSL)/3σ] | Actual capability |
| Pp | (USL - LSL) / 6σ_overall | Long-term potential |
| Ppk | min[(USL - μ)/3s, (μ - LSL)/3s] | Long-term actual |

**Interpretation:**
- < 0.67: Not capable
- 0.67-1.0: Poor
- 1.0-1.33: Marginally capable
- 1.33-1.67: Capable
- > 1.67: Highly capable

## Tools

- `Tools/control_charts.py` — Chart generation and run rules
- `Tools/capability_analysis.py` — Capability calculations

## Context Files

- `Context/ControlConstants.md` — A2, D3, D4 lookup tables

## Dependencies

- **StatisticalAnalysis** — For normality checks before capability
- **OutcomeFramework** — Map findings to CX/COST/EX impact
- **Python:** scipy, numpy, pandas, matplotlib
