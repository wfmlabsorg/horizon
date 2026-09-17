---
project: [Project Name]
last_updated: [YYYY-MM-DD HH:MM]
total_sources: [N]
---

# Source Inventory: [Project Name]

## Summary

| Type | Count | Processed | Pending |
|------|-------|-----------|---------|
| Project Files | X | X | X |
| Local Files | X | X | X |
| Web URLs | X | X | X |
| **Total** | **X** | **X** | **X** |

## Project File Sources

| # | Path | Type | Status | Notes |
|---|------|------|--------|-------|
| 1 | `~/horizon/books/<client>/file.md` | Markdown | ✅ Processed | [notes] |
| 2 | `~/horizon/books/<client>/folder/` | Folder (5 files) | ⏳ Pending | [notes] |

## Local File Sources

| # | Path | Type | Status | Needs Conversion |
|---|------|------|--------|------------------|
| 1 | `~/Downloads/report.docx` | Word | ✅ Processed | Yes → DocReader |
| 2 | `~/Downloads/data.xlsx` | Excel | ⏳ Pending | Yes → DocReader |

## Web Sources

| # | URL | Type | Status | Notes |
|---|-----|------|--------|-------|
| 1 | `https://wiki.internal.example/...` | Wiki | ✅ Processed | MediaWiki MCP |
| 2 | `https://example.com/article` | Web | ⏳ Pending | web_fetch |
