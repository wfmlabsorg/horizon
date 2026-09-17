# Research Iteration Workflow

## Purpose
Analyze gaps in detail, recommend additional sources, allow user to add and re-run.

## Trigger
- User indicates gaps need filling after Validation
- User says "research gaps" or "find more sources"

## Process

### Step 1: Deep Gap Analysis
For each objective rated Partial or Gap:
- What specific questions remain unanswered?
- What type of source would likely have this info?
- What search terms might find it?

### Step 2: Generate Recommendations
For each gap, suggest:

**Source Type Recommendations:**
| Gap | Likely Source Type | Example |
|-----|-------------------|---------|
| Industry benchmarks | Industry reports, research firms | Gartner, Forrester |
| Technical details | Vendor documentation, whitepapers | Official docs |
| Best practices | Professional communities, books | internal wiki |
| Case studies | Company blogs, conference presentations | LinkedIn, SlideShare |
| Data points | Government stats, industry surveys | BLS, ICMI |

**Search Queries:**
- "[topic] best practices 2025"
- "[company] case study [topic]"
- "[metric] industry benchmark"

### Step 3: Present to User
```
## Gap Analysis: [Objective Title]

**Current Coverage:** X%
**Missing:** [Specific information needed]

### Recommended Sources

1. **[Source Type]:** [Where to look]
   - Search: "[suggested query]"

2. **[Source Type]:** [Where to look]
   - Search: "[suggested query]"

### Would you like to:
- [ ] Add these sources and re-run research
- [ ] Manually provide a source URL/path
- [ ] Accept current coverage and proceed
```

### Step 4: Process New Sources
If user adds sources:
- Add to sources.md
- Return to SourceDiscovery for new sources only
- Then ResearchExecution for new sources only
- Merge new findings into existing synthesis

### Step 5: Re-validate
After new sources processed:
- Return to Validation workflow
- Present updated coverage

## Output
- Updated `sources.md`
- Updated findings
- Updated `validation.md`

## Loop
Repeat until user satisfied or all gaps addressed
