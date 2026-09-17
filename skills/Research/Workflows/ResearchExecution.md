# Research Execution Workflow

## Purpose
Dispatch research agents to analyze sources and collect findings.

## Trigger
- After SourceDiscovery completion
- User says "research run" or "execute research"

## Process

### Step 1: Prepare Sources
For sources needing conversion:
```
Call DocReader skill to convert:
- .docx → extracted text
- .xlsx → extracted data/tables
- .pptx → extracted text/notes
- .pdf → extracted text
```
Store converted content in `findings/converted/`

### Step 2: Dispatch DocumentAnalyst
Via Agents skill, spawn DocumentAnalyst with:
- Research objectives from brief
- List of project file sources
- List of local file sources (including converted)

Agent processes each source and outputs:
- `findings/by-source/[source-name].md`

### Step 3: Dispatch WebResearcher
Via Agents skill, spawn WebResearcher with:
- Research objectives from brief
- List of web URLs
- Tool guidance (MediaWiki MCP for wikis, WebFetch for others)

Agent processes each URL and outputs:
- `findings/by-source/[url-slug].md`

### Step 4: Track Progress
Update project status as agents complete:
- Sources processed: X/Y
- Estimated completion: Z%

### Step 5: Collect Results
When all agents complete:
- Verify all source findings are captured
- Note any failures (inaccessible URLs, corrupt files)
- Aggregate raw findings

## Output
- `findings/by-source/*.md` (one per source)
- Project status: Researching → Synthesizing

## Notes on Parallelism
- DocumentAnalyst and WebResearcher can run in parallel
- Within each agent, sources are processed sequentially
- For large source sets (>20), consider batching

## Next
Proceed to Synthesis workflow
