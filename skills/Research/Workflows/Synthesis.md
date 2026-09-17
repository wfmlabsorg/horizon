# Research Synthesis Workflow

## Purpose
Combine findings from all sources, organize by objective, create unified output.

## Trigger
- After ResearchExecution completion
- User says "research synthesize" or "combine findings"

## Process

### Step 1: Load All Findings
Read all files from `findings/by-source/`
Parse each for:
- Objective tags
- Direct quotes
- Data points
- Gap notes

### Step 2: Reorganize by Objective
For each objective in brief:
- Collect all findings tagged to this objective
- Sort by relevance/quality
- Deduplicate similar findings
- Create `findings/by-objective/objective-N.md`

### Step 3: Extract Key Elements
From all findings, compile:
- **Quotes:** Direct quotations with citations
- **Data Points:** Statistics, metrics, numbers
- **Insights:** Analytical observations
- **Examples:** Case studies, illustrations
- **Recommendations:** Actionable suggestions found

### Step 4: Generate Synthesis Document
Create `synthesis.md` with:
- Executive summary (2-3 paragraphs)
- Findings by objective (with coverage assessment)
- Key quotes (with full citations)
- Data points (tabulated)
- Source bibliography

### Step 5: Identify Preliminary Gaps
Note any objectives with:
- Few or no findings
- Low-quality sources only
- Conflicting information

## Output
- `findings/by-objective/*.md`
- `synthesis.md`
- Project status: Synthesizing → Validating

## Next
Proceed to Validation workflow
