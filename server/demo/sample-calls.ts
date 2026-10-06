import type { NormalizedCall } from "../analytics/dashboard";

/**
 * Deterministic generator for clearly fake demo calls. Every record is labeled as
 * sample data, uses reserved fictional 555-01xx phone numbers, and refers to a
 * made-up business ("Example Dental"). Nothing here represents a real customer.
 */

export const DEMO_ASSISTANTS = [
  { id: "demo-assistant-scheduler", name: "Sample: Appointment Scheduler" },
  { id: "demo-assistant-reminders", name: "Sample: Reminder Caller" },
  { id: "demo-assistant-faq", name: "Sample: Front Desk FAQ" },
];

const ENDED_REASONS: { reason: string; weight: number; success: number }[] = [
  { reason: "customer-ended-call", weight: 45, success: 0.8 },
  { reason: "assistant-ended-call", weight: 30, success: 0.9 },
  { reason: "silence-timed-out", weight: 8, success: 0.05 },
  { reason: "voicemail", weight: 9, success: 0 },
  { reason: "customer-did-not-answer", weight: 5, success: 0 },
  { reason: "pipeline-error-openai-llm-failed", weight: 3, success: 0 },
];

const SUMMARIES = [
  "Caller booked a cleaning appointment for next Tuesday morning.",
  "Caller asked about office hours and parking; question answered.",
  "Reminder delivered; patient confirmed their appointment.",
  "Caller asked to reschedule; new time offered and accepted.",
  "Caller asked about insurance; transferred request to front desk.",
];

/** Small seeded PRNG (mulberry32) so seeds are reproducible. */
export function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickWeighted<T extends { weight: number }>(items: T[], r: number): T {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let x = r * total;
  for (const item of items) {
    if ((x -= item.weight) < 0) return item;
  }
  return items[items.length - 1];
}

export interface DemoCallOptions {
  provider: "vapi" | "retell";
  count?: number;
  days?: number;
  now?: Date;
  seed?: number;
}

export function generateDemoCalls({ provider, count = 400, days = 60, now = new Date(), seed = 42 }: DemoCallOptions): NormalizedCall[] {
  const rng = createRng(seed + (provider === "retell" ? 1000 : 0));
  const calls: NormalizedCall[] = [];
  const DAY = 24 * 60 * 60 * 1000;

  for (let i = 0; i < count; i++) {
    // Spread across the window, weighted toward weekdays and business hours (UTC 13:00-22:00).
    const dayOffset = Math.floor(rng() * days);
    const date = new Date(now.getTime() - dayOffset * DAY);
    const weekend = date.getUTCDay() === 0 || date.getUTCDay() === 6;
    if (weekend && rng() < 0.6) {
      date.setUTCDate(date.getUTCDate() - (date.getUTCDay() === 0 ? 2 : 1));
    }
    date.setUTCHours(13 + Math.floor(rng() * 9), Math.floor(rng() * 60), Math.floor(rng() * 60), 0);
    if (date.getTime() > now.getTime()) date.setTime(now.getTime() - Math.floor(rng() * 3600_000));

    const assistant = DEMO_ASSISTANTS[Math.floor(rng() * DEMO_ASSISTANTS.length)];
    const ended = pickWeighted(ENDED_REASONS, rng());
    const connected = !["voicemail", "customer-did-not-answer"].includes(ended.reason);
    const duration = connected ? Math.round(20 + rng() * rng() * 600) : Math.round(5 + rng() * 25);
    const cost = Math.round(duration / 60 * 0.11 * 10000) / 10000;
    const success = rng() < ended.success;
    const inbound = assistant.id !== "demo-assistant-reminders" && rng() < 0.85;
    const startedAt = date.toISOString();
    const endedAt = new Date(date.getTime() + duration * 1000).toISOString();
    const n = String(i + 1).padStart(4, "0");
    const summary = connected ? SUMMARIES[Math.floor(rng() * SUMMARIES.length)] : "No conversation (sample).";

    calls.push({
      id: `demo-${provider}-call-${n}`,
      assistantId: assistant.id,
      assistantName: assistant.name,
      type: inbound ? "inbound" : "outbound",
      status: "ended",
      endedReason: ended.reason,
      duration,
      cost,
      createdAt: startedAt,
      startedAt,
      endedAt,
      successEvaluation: success ? "true" : "false",
      customerPhoneNumber: `+1555010${String(Math.floor(rng() * 100)).padStart(2, "0")}`,
      assistantPhoneNumber: "+15550199",
      transcript: connected
        ? `AI: Thanks for calling Example Dental. This is sample demo data.\nUser: Hi, I'd like some help with an appointment.\nAI: Of course. ${summary}`
        : "",
      summary,
      analysis: { summary, successEvaluation: success ? "true" : "false" },
      recordingUrl: null,
      demo: true,
    });
  }

  return calls.sort((a, b) => (b.createdAt as string).localeCompare(a.createdAt as string));
}
