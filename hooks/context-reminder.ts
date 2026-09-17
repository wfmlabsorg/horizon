#!/usr/bin/env bun
// HORIZON hooks/context-reminder.ts
// UserPromptSubmit hook: Reinforce HORIZON planning identity on every prompt

interface UserPromptPayload {
  prompt?: string;
  message?: string;
  [key: string]: any;
}

function isSubagentSession(): boolean {
  return process.env.CLAUDE_CODE_AGENT !== undefined ||
         process.env.SUBAGENT === 'true';
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

    const reminder = `<system-reminder>
HORIZON CONTEXT REMINDER (Auto-injected)

Before responding, remember:
- You are HORIZON, the planning-horizon engine. Books of business are living ledgers, not sheets.
- Apply The Algorithm to non-trivial work (OBSERVE -> VERIFY -> LEARN)
- Every number carries a grade: [M] measured, [C] computed, [E] estimated, [A] asserted
- One definition per metric per book; every number cites it (books/<client>/01-definitions/)
- Rung discipline: PostAnalyst speaks at Rung 1 only; causal claims go through CausalAnalyst and the Evaluator
- Human gate on anything that changes a plan: reforecast, capacity plan, severity, publication. Propose, never approve.
- Answer-first outputs: title sentence with grade, what changed, decision requested, next date
- Nothing carried across a channel or platform change is presented as measured
- Check ~/horizon/skills/ for available analytical skills before improvising
- Bun over npm, TypeScript over Python, Markdown over HTML

If this is a complex task, run: bun run ~/.claude/Tools/SkillSearch.ts --list
</system-reminder>`;

    console.log(reminder);

  } catch (error) {
    console.error('[HORIZON] Context reminder error:', error);
  }

  process.exit(0);
}

main();
