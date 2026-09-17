#!/usr/bin/env bun
// HORIZON hooks/load-core-context.ts
// SessionStart hook: Inject HORIZON identity and planning context

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

interface SessionStartPayload {
  session_id: string;
  [key: string]: any;
}

function isSubagentSession(): boolean {
  return process.env.CLAUDE_CODE_AGENT !== undefined ||
         process.env.SUBAGENT === 'true';
}

function getLocalTimestamp(): string {
  const date = new Date();
  const tz = process.env.TIME_ZONE || Intl.DateTimeFormat().resolvedOptions().timeZone;

  try {
    const localDate = new Date(date.toLocaleString('en-US', { timeZone: tz }));
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const hours = String(localDate.getHours()).padStart(2, '0');
    const minutes = String(localDate.getMinutes()).padStart(2, '0');
    const seconds = String(localDate.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`;
  } catch {
    return new Date().toISOString();
  }
}

async function main() {
  try {
    if (isSubagentSession()) {
      process.exit(0);
    }

    const stdinData = await Bun.stdin.text();
    if (!stdinData.trim()) {
      process.exit(0);
    }

    const payload: SessionStartPayload = JSON.parse(stdinData);
    const paiDir = process.env.PAI_DIR || join(homedir(), '.claude');

    // Load CORE skill (HORIZON identity and planning context)
    const coreSkillPath = join(paiDir, 'skills', 'CORE', 'SKILL.md');

    // Load TELOS summary (planning mission context)
    const horizonDir = join(homedir(), 'horizon');
    const telosSummaryPath = join(horizonDir, 'TELOS', 'SUMMARY.md');

    if (!existsSync(coreSkillPath)) {
      console.error('[HORIZON] No CORE skill found - skipping context injection');
      process.exit(0);
    }

    const skillContent = readFileSync(coreSkillPath, 'utf-8');

    let telosContent = '';
    if (existsSync(telosSummaryPath)) {
      telosContent = readFileSync(telosSummaryPath, 'utf-8');
    }

    let output = `<system-reminder>
HORIZON CORE CONTEXT (Auto-loaded at Session Start)

CURRENT DATE/TIME: ${getLocalTimestamp()}

The following context has been loaded from ${coreSkillPath}:

${skillContent}
`;

    if (telosContent) {
      output += `
---

## TELOS (Planning Mission Context)

${telosContent}
`;
    }

    output += `
This context is now active for this session. Follow all instructions, preferences, and guidelines contained above.
</system-reminder>

HORIZON Context successfully loaded...`;

    console.log(output);

  } catch (error) {
    console.error('Context loading error:', error);
  }

  process.exit(0);
}

main();
