# Research Status Workflow

## Purpose
Display current state of research project.

## Trigger
- User says "research status" or "where are we"

## Process

### Step 1: Load Project State
Read from project directory:
- `brief.md` for objectives
- `sources.md` for source counts
- `validation.md` for coverage (if exists)
- Check which phase files exist

### Step 2: Determine Current Phase
Based on files present:
- Only `brief.md` → Intake complete, ready for Discovery
- `brief.md` + `sources.md` → Discovery complete, ready for Execution
- `findings/` populated → Execution complete, ready for Synthesis
- `synthesis.md` exists → Synthesis complete, ready for Validation
- `validation.md` exists → Validation complete, ready for Output

### Step 3: Display Status
```
## Research Project: [Name]

**Phase:** [Current Phase]
**Created:** [Date]
**Last Updated:** [Date]

### Objectives
| # | Title | Status |
|---|-------|--------|
| 1 | [Title] | [Status] |
| 2 | [Title] | [Status] |

### Sources
| Type | Total | Processed |
|------|-------|-----------|
| Project Files | X | X |
| Local | X | X |
| Web | X | X |

### Coverage
[If validation complete: show coverage summary]

### Next Step
[What action is needed to proceed]
```

## Output
Status display (no file changes)
