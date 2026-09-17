# Source Discovery Workflow

## Purpose
Inventory all sources, identify file types, flag items needing conversion.

## Trigger
- After Intake completion
- User says "research sources" or "discover sources"

## Process

### Step 1: Inventory Project Sources
For each project path in brief:
```bash
# Use Glob to find files by pattern
# Use Bash to list directory contents
```
- Catalog all files found
- Note file types (.md, .pdf, .docx, .xlsx, etc.)
- Record file count per folder

### Step 2: Inventory Local File Sources
For each local path in brief:
```bash
# Use Bash to list files and metadata
```
- Catalog all files found
- Identify files needing DocReader:
  - .docx, .xlsx, .pptx, .pdf → Flag for conversion
- Record file metadata (size, date if available)

### Step 3: Inventory Web Sources
For each URL in brief:
- Test accessibility via `WebFetch` (head request or small fetch)
- Identify type (wiki, article, documentation)
- Note which tool will be used

### Step 4: Generate Source Inventory
Create `sources.md` with:
- Summary table (type, count, processed, pending)
- Detailed list per source type
- Conversion flags for DocReader

### Step 5: Report to User
Present inventory:
- "Found X project files, Y local files, Z web pages"
- "N files need conversion via DocReader"
- "Ready to execute research?"

## Output
- `~/horizon/research/[project-name]/sources.md`
- Project status: Discovering → Ready for Execution

## Next
Proceed to ResearchExecution workflow
