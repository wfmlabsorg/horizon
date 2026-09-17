# Research Intake Workflow

## Purpose
Capture research objectives and initial sources to create a Research Brief.

## Trigger
- User says "research start [name]" or "new research project"
- User provides research objectives and sources in natural language

## Process

### Step 1: Create Project Directory
```bash
mkdir -p ~/horizon/research/[project-name]/{findings/by-objective,findings/by-source,output}
```

### Step 2: Capture Objectives
Ask user (or parse from their message):
1. What is the primary deliverable? (Report, slides, analysis, etc.)
2. What specific questions need answering?
3. What does "success" look like for each question?

Transform into structured objectives:
- Each objective has: Title, Question, Success Criteria
- Objectives should be specific and measurable
- Aim for 3-7 objectives per project

### Step 3: Capture Sources
Ask user (or parse from their message):
1. Project file paths (folders or specific files in ~/horizon/books/<client>/)
2. Local file system paths
3. Web URLs

Validate each source:
- Check project paths exist via Glob/Bash
- Check local paths exist via Bash
- Test web URLs are accessible

### Step 4: Generate Research Brief
Create `brief.md` using template with:
- Project metadata
- Objectives with status checkboxes
- Categorized source list
- Constraints and timeline

### Step 5: Confirm with User
Present the brief and ask:
- "Does this capture your research goals?"
- "Any sources to add?"
- "Ready to proceed to source discovery?"

## Output
- `~/horizon/research/[project-name]/brief.md`
- Project status: Intake → Discovering

## Next
Proceed to SourceDiscovery workflow
