#!/usr/bin/env bun
/**
 * Email adapter (mock). Phase 0: typed interfaces + --dry-run validation of an intake JSONL file.
 *
 *   bun adapters/email/email.ts --dry-run <file.jsonl>
 */

export type Classification = "planning-request" | "performance-question" | "data-pull" | "event" | "update" | "noise";
export type Route = "planning-request" | "performance-question" | "data-pull" | "event";
export type EventType = "go-live" | "outage" | "weather" | "holiday" | "client-event" | "product-change" | "business-ask" | "other";
export type SenderRole = "client" | "vendor" | "home-team" | "leadership" | "planning" | "unknown";

export interface ExtractedAsk {
  question: string;
  decision_it_feeds: string | null;   // null => route must be data-pull
  who_decides: string | null;
  when_needed: string | null;         // ISO date
  what_data_exists: string | null;
  what_done_looks_like: string | null;
  route: Route;
  supporting_quote: string;
}

export interface Figure {
  text: string;
  value: number;
  unit: string;                       // "[unit?]" when unreadable
  period: string | null;
}

export interface IntakeMessage {
  id: string;
  thread_id?: string;
  from: { name: string; role: SenderRole };
  to?: string[];
  date: string;                       // ISO 8601
  subject: string;
  body: string;
  classification: Classification;
  xr_ref?: string;                    // XR-###
  event_type?: EventType;
  extracted_asks: ExtractedAsk[];
  figures?: Figure[];
  severity_proposed?: 1 | 2 | 3 | 4;
  grade: "A";
  attachments?: string[];
}

const CLASSIFICATIONS = ["planning-request", "performance-question", "data-pull", "event", "update", "noise"];
const ROUTES = ["planning-request", "performance-question", "data-pull", "event"];
const EVENT_TYPES = ["go-live", "outage", "weather", "holiday", "client-event", "product-change", "business-ask", "other"];
const ROLES = ["client", "vendor", "home-team", "leadership", "planning", "unknown"];
const XR = /^XR-\d{3,}$/;
const SUBJECT_XR = /\[(XR-\d{3,})\]/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function validateMessage(m: any, line: number): string[] {
  const e: string[] = [];
  const at = (s: string) => `line ${line}: ${s}`;
  if (typeof m !== "object" || m === null) return [at("not a JSON object")];
  if (!m.id) e.push(at("id missing"));
  if (!m.from || typeof m.from.name !== "string" || !ROLES.includes(m.from.role)) e.push(at("from must be {name, role} with a known role"));
  if (typeof m.date !== "string" || Number.isNaN(Date.parse(m.date))) e.push(at("date missing or unparseable; the session date is never a proxy"));
  if (typeof m.subject !== "string") e.push(at("subject missing"));
  if (typeof m.body !== "string") e.push(at("body missing"));
  if (!CLASSIFICATIONS.includes(m.classification)) e.push(at(`bad classification "${m.classification}"`));
  if (m.classification === "event" && !EVENT_TYPES.includes(m.event_type)) e.push(at("classification=event requires a valid event_type"));
  if (m.grade !== "A") e.push(at(`grade must be "A" at the email boundary, got "${m.grade}"`));
  if (m.xr_ref !== undefined) {
    if (!XR.test(m.xr_ref)) e.push(at(`bad xr_ref "${m.xr_ref}"`));
    const s = typeof m.subject === "string" ? m.subject.match(SUBJECT_XR) : null;
    if (s && s[1] !== m.xr_ref) e.push(at(`xr_ref ${m.xr_ref} disagrees with subject tag ${s[1]}`));
  }
  if (m.severity_proposed !== undefined && ![1, 2, 3, 4].includes(m.severity_proposed)) e.push(at("severity_proposed must be 1-4"));
  if (!Array.isArray(m.extracted_asks)) { e.push(at("extracted_asks must be an array (may be empty)")); return e; }
  m.extracted_asks.forEach((a: any, i: number) => {
    const p = `ask[${i}]`;
    if (typeof a.question !== "string" || !a.question) e.push(at(`${p}.question missing`));
    if (!ROUTES.includes(a.route)) e.push(at(`${p}.route bad "${a.route}"`));
    if (typeof a.supporting_quote !== "string" || !a.supporting_quote) e.push(at(`${p}.supporting_quote missing; nothing applies without a quote`));
    for (const k of ["decision_it_feeds", "who_decides", "when_needed", "what_data_exists", "what_done_looks_like"]) {
      if (!(k in a)) e.push(at(`${p}.${k} missing (use null when unknown)`));
    }
    if (a.decision_it_feeds === null && a.route !== "data-pull") e.push(at(`${p}: decision_it_feeds is null so route must be data-pull`));
    if (a.when_needed !== null && a.when_needed !== undefined && !DATE.test(a.when_needed)) e.push(at(`${p}.when_needed must be an ISO date or null`));
  });
  if (m.figures !== undefined) {
    if (!Array.isArray(m.figures)) e.push(at("figures must be an array"));
    else m.figures.forEach((f: any, i: number) => {
      if (typeof f.text !== "string" || typeof f.value !== "number" || typeof f.unit !== "string" || !("period" in f)) e.push(at(`figure[${i}] must be {text, value, unit, period}`));
    });
  }
  return e;
}

export function validateIntake(text: string): { errors: string[]; count: number } {
  const errors: string[] = [];
  const lines = text.split(/\r?\n/);
  let count = 0, lastDate = -Infinity;
  lines.forEach((l, i) => {
    const line = i + 1;
    if (l.trim() === "") { if (i < lines.length - 1) errors.push(`line ${line}: blank line inside JSONL`); return; }
    let m: any;
    try { m = JSON.parse(l); } catch { errors.push(`line ${line}: invalid JSON`); return; }
    count++;
    errors.push(...validateMessage(m, line));
    const d = Date.parse(m?.date);
    if (!Number.isNaN(d)) { if (d < lastDate) errors.push(`line ${line}: out of date order (oldest first)`); lastDate = d; }
  });
  return { errors, count };
}

/** Phase 2: hand validated messages to the Librarian intake */
export function ingestIntake(_bookDir: string, _file: string): never {
  throw new Error("not implemented in phase 0");
}

// Entry guard: Bun.main is the absolute path of the script bun was started with, so importing this module does not run the CLI.
if (Bun.main.endsWith("/email.ts")) {
  const args = process.argv.slice(2);
  const dry = args.indexOf("--dry-run");
  if (dry === -1 || !args[dry + 1]) {
    console.error("usage: bun adapters/email/email.ts --dry-run <file.jsonl>");
    process.exit(2);
  }
  const file = args[dry + 1];
  const { errors, count } = validateIntake(await Bun.file(file).text());
  if (errors.length) {
    console.error(`intake: ${file} FAILED (${errors.length} issue${errors.length === 1 ? "" : "s"})`);
    errors.forEach((x) => console.error("  " + x));
    process.exit(1);
  }
  console.log(`intake: ${file} OK (${count} messages)`);
}
