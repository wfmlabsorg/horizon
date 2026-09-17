---
name: Research
description: Multi-source research orchestration with parallel agents. Systematically researches local project files and web resources against defined objectives. USE WHEN user mentions research, investigate, find information, gather data, source material, supplement report, scrub files, analyze sources, deep dive, systematic review, research project, find supporting evidence, data gathering.
mcp_optional: [brightdata, jina]
mcp_tier: 2
---

# Research Skill

Orchestrates systematic research across multiple source types using parallel agents.

> **Core Principle:** Define clear objectives first. Research is only as good as the questions you're trying to answer.

---

## Workflow Routing

| User Intent | Workflow |
|-------------|----------|
| Start new research project | `Workflows/Intake.md` |
| Add sources to existing research | `Workflows/SourceDiscovery.md` |
| Execute research against sources | `Workflows/ResearchExecution.md` |
| Combine findings into output | `Workflows/Synthesis.md` |
| Check if objectives are met | `Workflows/Validation.md` |
| Find gaps and recommend sources | `Workflows/Iteration.md` |
| View research project status | `Workflows/Status.md` |

---

## Examples

**Example 1: Start a new research project**
```
User: "Research best practices for WFM maturity assessments"
→ Invokes Intake workflow
→ Captures objectives, identifies sources
→ Creates ~/horizon/research/wfm-maturity/
→ Returns Research Brief for approval
```

**Example 2: Add sources and execute**
```
User: "Add the Halcyon Group scorecard and run the research"
→ Invokes SourceDiscovery workflow (adds scorecard)
→ Invokes ResearchExecution workflow (dispatches agents)
→ Returns findings tagged to objectives
```

**Example 3: Check progress and fill gaps**
```
User: "What's the coverage on my research objectives?"
→ Invokes Validation workflow
→ Shows coverage score per objective
→ Recommends additional sources for gaps
```

---

## Research Phases

```
Phase 1: INTAKE
├── Capture research objectives (specific, measurable)
├── Identify primary deliverable (what are we building?)
├── List initial sources by type
└── Create Research Brief

Phase 2: DISCOVER
├── Inventory project sources (docs, pdfs, xlsx, pptx)
├── Inventory local file sources (markdown, text files)
├── Inventory web sources (URLs, wikis, sites)
├── Flag files needing conversion (→ DocReader)
└── Create Source Inventory

Phase 3: EXECUTE
├── Dispatch DocumentAnalyst agent (local project files)
├── Dispatch WebResearcher agent (external URLs)
├── Parallel processing with progress tracking
├── Collect raw findings per source
└── Tag findings to objectives

Phase 4: SYNTHESIZE
├── Merge agent findings
├── Organize by objective
├── Extract key quotes, data points, insights
├── Generate structured markdown outputs
└── Create citation/source links

Phase 5: VALIDATE
├── Review each objective: Met / Partial / Gap
├── Identify which sources contributed to which objectives
├── Calculate coverage score
└── Present preliminary findings to user

Phase 6: ITERATE (if needed)
├── Analyze gaps in objective coverage
├── Recommend additional source types
├── Suggest search queries for missing info
├── Allow user to add sources and re-run
└── Loop back to Phase 3

Phase 7: OUTPUT
├── Generate final research brief
├── Create supporting markdown files
├── Optionally call ReportCompiler for formal report
└── Archive research project
```

---

## Source Types Supported

| Type | Location Pattern | Handled By |
|------|------------------|------------|
| **Project Files** | `~/horizon/books/<client>/...` | DocumentAnalyst + DocReader |
| **Local Files** | `~/horizon/...`, `~/Downloads/...` | DocumentAnalyst + DocReader |
| **Web URLs** | `https://...` | WebResearcher + web_fetch |
| **Wiki** | `https://wiki.internal.example/...` | WebResearcher + MediaWiki MCP |

### File Types (via DocReader)
- `.docx` — Word documents
- `.xlsx` — Excel spreadsheets
- `.pptx` — PowerPoint presentations
- `.pdf` — PDF documents
- `.md` — Markdown (native)
- `.txt` — Plain text (native)

---

## Data Storage

### Research Project Location
`~/horizon/research/[project-name]/`

### Project Structure
```
research/
└── [project-name]/
    ├── brief.md              # Research objectives and scope
    ├── sources.md            # Source inventory
    ├── findings/
    │   ├── by-objective/
    │   │   ├── objective-1.md
    │   │   ├── objective-2.md
    │   │   └── ...
    │   └── by-source/
    │       ├── source-1.md
    │       ├── source-2.md
    │       └── ...
    ├── synthesis.md          # Combined findings
    ├── validation.md         # Objective coverage assessment
    └── output/
        └── [final deliverables]
```

---

## Integration Points

### Skills Called
| Skill | When | Purpose |
|-------|------|---------|
| **DocReader** | Phase 3 (Execute) | Convert Office/PDF files for analysis |
| **Agents** | Phase 3 (Execute) | Spawn and manage research agents |
| **ReportCompiler** | Phase 7 (Output) | Generate formal reports from findings |

### Tools Used
| Tool | Purpose |
|------|---------|
| `Read` | Read local markdown/text files |
| `Bash` | File system operations, listing directories |
| `WebFetch` | Retrieve web page content |
| `WebSearch` | Find additional sources |
| `mediawiki-mcp:get-page` | Read wiki content |
| `mediawiki-mcp:search-page` | Search wiki |
| `Glob` | Find files by pattern |
| `Grep` | Search file contents |

---

## Quick Commands

```
research start [name]        → Begin new research project (Intake)
research objectives          → View/edit current objectives
research sources             → View/add sources to inventory
research run                 → Execute research agents
research status              → View progress and coverage
research findings            → View synthesized findings
research gaps                → Analyze gaps and get recommendations
research add [source]        → Add source to current project
research compile             → Generate final output / call ReportCompiler
research list                → List all research projects
research resume [name]       → Continue existing project
```

---

## Hierarchy Analysis

| Capability | Layer | Implementation | Justification |
|------------|-------|----------------|---------------|
| Create project directory structure | CODE | Could be `Tools/InitProject.ts` | Deterministic file operations |
| Parse objectives from user input | PROMPT | `Workflows/Intake.md` | Needs AI to understand intent |
| Inventory files in directory | CODE | Uses `bash_tool`, `filesystem` | Deterministic listing |
| Read document content | CODE | Uses DocReader skill | Deterministic extraction |
| Analyze document for objectives | SKILL | `Workflows/ResearchExecution.md` | Needs AI reasoning |
| Search web for sources | CODE | Uses `web_search` | Deterministic API call |
| Synthesize findings | SKILL | `Workflows/Synthesis.md` | Needs AI to merge/summarize |
| Calculate coverage score | CODE | Could be `Tools/Coverage.ts` | Deterministic counting |
| Generate recommendations | PROMPT | `Workflows/Iteration.md` | Needs AI reasoning |

**Layer Distribution:**
- CODE: 4 capabilities (40%) — file ops, listings, API calls
- PROMPT: 2 capabilities (20%) — structured AI tasks
- SKILL: 3 capabilities (30%) — full AI orchestration

**Future Tools (CODE layer):**
- `Tools/InitProject.ts` — Create project directory structure
- `Tools/Coverage.ts` — Calculate objective coverage score
- `Tools/SourceInventory.ts` — List and categorize sources

---

## Agent Teams Integration (Opus 4.6)

### True Parallel Research Execution

Phase 3 (Execute) currently dispatches DocumentAnalyst and WebResearcher as sequential subagents. With Agent Teams, these become truly parallel teammates:

```
Lead Agent: Research Coordinator
  |
  +-- Teammates 1-N: document-analyst-[N]   [parallel]
  |     Model: sonnet
  |     Skills: DocReader, Research
  |     Task: Analyze assigned source document(s) against research objectives
  |     Output: findings/by-source/source-[N].md
  |
  +-- Teammates N+1-M: web-researcher-[M]   [parallel]
  |     Model: sonnet
  |     Skills: Research (web_search, web_fetch)
  |     Task: Research assigned URL cluster against objectives
  |     Output: findings/by-source/web-[M].md
  |
  +-- Lead: Synthesize all teammate findings into unified output
```

### Agent Allocation Strategy

| Source Count | Teammate Strategy |
|-------------|-------------------|
| 1-3 sources | Sequential (no Agent Teams overhead) |
| 4-10 sources | 1 teammate per 2-3 sources |
| 10+ sources | 1 teammate per source, max 8 teammates |

### Parallelism Benefits

- All DocumentAnalyst teammates run simultaneously (independent source analysis)
- All WebResearcher teammates run simultaneously (independent URL clusters)
- DocumentAnalysts and WebResearchers run in parallel with each other
- Lead synthesis runs after all teammates complete

### Shared Task List Structure

```
Task 1: [document-analyst-1] Analyze source-1.pdf against objectives
Task 2: [document-analyst-2] Analyze source-2.xlsx against objectives
Task 3: [web-researcher-1] Research URLs [url1, url2, url3]
Task 4: [web-researcher-2] Research URLs [url4, url5]
Task 5: [Lead] Synthesize all findings (blocked by 1-4)
```

### File Handoff

Each teammate writes to the project's standard structure:
```
~/horizon/research/[project-name]/findings/by-source/
├── doc-analyst-1-source-1.md
├── doc-analyst-2-source-2.md
├── web-researcher-1-urls.md
├── web-researcher-2-urls.md
└── ...
```

Lead reads all files in `by-source/` during synthesis.
