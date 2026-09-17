#!/usr/bin/env bun
// HORIZON hooks/initialize-session.ts
// SessionStart hook: Initialize session state and ensure directories exist

import { existsSync, writeFileSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

interface SessionStartPayload {
  session_id: string;
  cwd?: string;
  [key: string]: any;
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

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch {
    return new Date().toISOString();
  }
}

function setTabTitle(title: string): void {
  const tabEscape = `\x1b]1;${title}\x07`;
  const windowEscape = `\x1b]2;${title}\x07`;

  process.stderr.write(tabEscape);
  process.stderr.write(windowEscape);
}

function getBookName(cwd: string | undefined): string {
  if (!cwd) return 'HORIZON';

  const parts = cwd.split('/').filter(p => p);
  const bookIndicators = ['books', 'projects', 'src', 'repos', 'code'];

  for (let i = parts.length - 1; i >= 0; i--) {
    if (bookIndicators.includes(parts[i]) && parts[i + 1]) {
      return parts[i + 1];
    }
  }

  return parts[parts.length - 1] || 'HORIZON';
}

async function main() {
  try {
    const stdinData = await Bun.stdin.text();
    if (!stdinData.trim()) {
      process.exit(0);
    }

    const payload: SessionStartPayload = JSON.parse(stdinData);
    const paiDir = process.env.PAI_DIR || join(homedir(), '.claude');
    const horizonDir = join(homedir(), 'horizon');

    // 1. Set tab title
    const bookName = getBookName(payload.cwd);
    setTabTitle(`HORIZON: ${bookName}`);

    // 2. Ensure required directories exist
    const requiredDirs = [
      join(paiDir, 'hooks', 'lib'),
      join(horizonDir, 'MEMORY', 'Learning'),
      join(horizonDir, 'MEMORY', 'Signals'),
      join(horizonDir, 'MEMORY', 'State'),
      join(horizonDir, 'books'),
    ];

    for (const dir of requiredDirs) {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    }

    // 3. Create session marker file
    const sessionFile = join(paiDir, '.current-session');
    writeFileSync(sessionFile, JSON.stringify({
      session_id: payload.session_id,
      started: getLocalTimestamp(),
      cwd: payload.cwd,
      book: bookName,
      engine: 'HORIZON'
    }, null, 2));

    // 4. Update session count in MEMORY stats
    const statsPath = join(horizonDir, 'MEMORY', 'State', 'stats.json');
    try {
      let stats = { sessions: 0, daily_runs: 0, weekly_runs: 0, monthly_runs: 0, questions_answered: 0 };
      if (existsSync(statsPath)) {
        stats = { ...stats, ...JSON.parse(readFileSync(statsPath, 'utf-8')) };
      }
      stats.sessions = (stats.sessions || 0) + 1;
      writeFileSync(statsPath, JSON.stringify(stats, null, 2));
    } catch {
      // Don't fail on stats update
    }

    // Output session info
    console.error(`[HORIZON] Session initialized: ${bookName}`);
    console.error(`[HORIZON] Time: ${getLocalTimestamp()}`);

  } catch (error) {
    console.error('Session initialization error:', error);
  }

  process.exit(0);
}

main();
