import { type DashboardData, type KpiData } from "@shared/schema";

/**
 * Provider-agnostic call shape. Vapi, Retell and demo calls are all normalized
 * into this before any aggregation happens (see server/providers/calls.ts).
 */
export interface NormalizedCall {
  id: string;
  assistantId?: string | null;
  assistantName?: string | null;
  type?: string; // 'inbound' | 'outbound'
  status?: string | null;
  endedReason?: string | null;
  duration?: number; // seconds
  cost?: number; // USD
  createdAt?: string | null; // ISO timestamp
  startedAt?: string | null;
  successEvaluation?: string | null; // 'true' | 'false' | provider-specific value | null
  customerPhoneNumber?: string | null;
  assistantPhoneNumber?: string | null;
  [key: string]: unknown;
}

/** Minimum calls an assistant needs before it can be named "most successful". */
export const MIN_CALLS_FOR_TOP_AGENT = 5;
/** Number of calls returned in the dashboard's recent-calls widget. */
export const RECENT_CALLS_LIMIT = 50;

export const DURATION_DISTRIBUTION_BUCKETS = [
  { range: "0-30s", min: 0, max: 30 },
  { range: "30s-2m", min: 30, max: 120 },
  { range: "2-5m", min: 120, max: 300 },
  { range: "5-10m", min: 300, max: 600 },
  { range: "10m+", min: 600, max: Infinity },
];

export const DURATION_HISTOGRAM_BUCKETS = [
  { range: "0-30s", min: 0, max: 30 },
  { range: "30s-1m", min: 30, max: 60 },
  { range: "1-2m", min: 60, max: 120 },
  { range: "2-5m", min: 120, max: 300 },
  { range: "5-10m", min: 300, max: 600 },
  { range: "10m+", min: 600, max: Infinity },
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function createEmptyDashboardData(): DashboardData {
  return {
    kpis: { totalCalls: 0, avgDuration: 0, successRate: 0, inboundSuccessRate: 0, outboundSuccessRate: 0, totalCost: 0 },
    previousKpis: null,
    mostSuccessfulAgent: null,
    dailyMetrics: [],
    callVolumeTrends: [],
    callOutcomes: [],
    assistantPerformance: [],
    recentCalls: [],
    costAnalysis: { avgCostPerCall: 0, costPerMinute: 0, monthlyCostTrend: null },
    durationDistribution: [],
    hourlyPatterns: [],
    conversationFlow: { stages: [], successPaths: [], dropOffPoints: [] },
    durationHistogram: { histogram: [], stats: { average: "0:00", median: "0:00", mostCommon: "0s", longest: "0:00" } },
    peakUsageHeatmap: { heatmapData: [], insights: { peakHours: "N/A", busiestDay: "N/A", quietHours: "N/A" } },
    conversationOutcomes: { summary: { totalConversations: 0, successRate: 0, avgDuration: "0:00", avgSatisfaction: null }, outcomes: [] },
  };
}

export function isSuccessfulCall(call: NormalizedCall): boolean {
  return String(call.successEvaluation ?? "").toLowerCase() === "true";
}

/** Format seconds as m:ss. */
export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

/** Percentage change from previous to current, or null when there is no baseline. */
export function percentChange(current: number, previous: number): number | null {
  if (!Number.isFinite(previous) || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

function median(sorted: number[]): number {
  if (sorted.length === 0) return 0;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function outcomeKey(call: NormalizedCall): string {
  return call.endedReason || call.status || "unknown";
}

function callTimestamp(call: NormalizedCall): string | null {
  return call.createdAt || call.startedAt || null;
}

/**
 * Compute KPI values from an array of normalized calls.
 * Reused for both the current and previous period calculations.
 */
export function computeKpisFromCalls(calls: NormalizedCall[]): KpiData {
  if (!calls || calls.length === 0) {
    return { totalCalls: 0, avgDuration: 0, successRate: 0, inboundSuccessRate: 0, outboundSuccessRate: 0, totalCost: 0 };
  }

  let totalDuration = 0;
  let successfulCalls = 0;
  let inboundCalls = 0;
  let outboundCalls = 0;
  let inboundSuccess = 0;
  let outboundSuccess = 0;
  let totalCost = 0;

  for (const call of calls) {
    totalDuration += call.duration || 0;
    totalCost += call.cost || 0;

    const isSuccess = isSuccessfulCall(call);
    if (isSuccess) successfulCalls++;

    if (call.type === "inbound") {
      inboundCalls++;
      if (isSuccess) inboundSuccess++;
    } else {
      outboundCalls++;
      if (isSuccess) outboundSuccess++;
    }
  }

  return {
    totalCalls: calls.length,
    avgDuration: totalDuration / calls.length,
    successRate: (successfulCalls / calls.length) * 100,
    inboundSuccessRate: inboundCalls > 0 ? (inboundSuccess / inboundCalls) * 100 : 0,
    outboundSuccessRate: outboundCalls > 0 ? (outboundSuccess / outboundCalls) * 100 : 0,
    totalCost,
  };
}

/**
 * Given a current period (start, end), return the previous period of the same duration.
 * e.g. if current is 7 days, previous is the 7 days before that.
 */
export function getPreviousPeriodRange(currentStart: string, currentEnd: string): { start: string; end: string } {
  const startMs = new Date(currentStart).getTime();
  const endMs = new Date(currentEnd).getTime();
  const durationMs = endMs - startMs;

  return {
    start: new Date(startMs - durationMs).toISOString(),
    end: new Date(startMs).toISOString(),
  };
}

/** Keep calls whose timestamp falls in [start, end] (or [start, end) when endExclusive). */
export function filterCallsByRange(calls: NormalizedCall[], start: string, end: string, endExclusive = false): NormalizedCall[] {
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  return calls.filter(call => {
    const ts = callTimestamp(call);
    if (!ts) return false;
    const t = new Date(ts).getTime();
    return t >= startMs && (endExclusive ? t < endMs : t <= endMs);
  });
}

/**
 * Build the full dashboard payload from normalized calls. Every number is derived
 * from the calls passed in; nothing is estimated or randomized.
 *
 * `previousCalls` (the same-length period before the current one) is optional. When
 * provided it fills `previousKpis`, `costAnalysis.monthlyCostTrend` (period-over-period
 * cost change, %) and each outcome's `trend` (change in share, percentage points).
 * Without it those fields are null. Customer satisfaction is not captured by either
 * provider, so satisfaction fields are always null.
 *
 * Hour/day bucketing uses UTC.
 */
export function buildDashboardFromRawCalls(
  calls: NormalizedCall[],
  _timeRange?: string,
  previousCalls?: NormalizedCall[],
): DashboardData {
  const dashboard = createEmptyDashboardData();
  if (previousCalls) dashboard.previousKpis = computeKpisFromCalls(previousCalls);
  if (!calls || calls.length === 0) return dashboard;

  const kpis = computeKpisFromCalls(calls);
  dashboard.kpis = kpis;

  // --- Assistant performance + most successful agent ---
  const assistantStats: Record<string, { calls: number; success: number; name: string; duration: number; cost: number }> = {};
  for (const call of calls) {
    const astId = call.assistantId || "Unknown";
    if (!assistantStats[astId]) {
      assistantStats[astId] = { calls: 0, success: 0, name: call.assistantName || astId, duration: 0, cost: 0 };
    }
    const s = assistantStats[astId];
    s.calls++;
    s.duration += call.duration || 0;
    s.cost += call.cost || 0;
    if (isSuccessfulCall(call)) s.success++;
    if (call.assistantName) s.name = call.assistantName;
  }

  let topAgent: DashboardData["mostSuccessfulAgent"] = null;
  dashboard.assistantPerformance = Object.entries(assistantStats).map(([id, stat]) => {
    const rate = (stat.success / stat.calls) * 100;
    if (stat.calls >= MIN_CALLS_FOR_TOP_AGENT && (!topAgent || rate > topAgent.successRate)) {
      topAgent = { name: stat.name, successRate: rate, totalCalls: stat.calls };
    }
    return {
      assistantId: id,
      name: stat.name,
      calls: stat.calls,
      successRate: rate,
      avgDuration: stat.duration / stat.calls,
      totalCost: stat.cost,
    };
  }).sort((a, b) => b.calls - a.calls);
  dashboard.mostSuccessfulAgent = topAgent;

  // --- Recent calls (newest first) ---
  const sortedByTime = [...calls].sort((a, b) => {
    const ta = new Date(callTimestamp(a) || 0).getTime();
    const tb = new Date(callTimestamp(b) || 0).getTime();
    return tb - ta;
  });
  dashboard.recentCalls = sortedByTime.slice(0, RECENT_CALLS_LIMIT).map(call => ({
    id: call.id || "",
    assistantName: call.assistantName || call.assistantId || "Unknown",
    duration: call.duration || 0,
    cost: call.cost || 0,
    status: call.status || "unknown",
    endedReason: call.endedReason || "",
    createdAt: callTimestamp(call) || "",
    type: call.type || "outbound",
    assistantPhoneNumber: call.assistantPhoneNumber || "",
    customerPhoneNumber: call.customerPhoneNumber || "",
    successEvaluation: call.successEvaluation ?? undefined,
  }));

  // --- Daily aggregation (volume trends + daily metrics) ---
  const dailyMap: Record<string, { calls: number; success: number; duration: number; cost: number }> = {};
  for (const call of calls) {
    const ts = callTimestamp(call);
    if (!ts) continue;
    const date = new Date(ts).toISOString().split("T")[0];
    if (!dailyMap[date]) dailyMap[date] = { calls: 0, success: 0, duration: 0, cost: 0 };
    const d = dailyMap[date];
    d.calls++;
    d.duration += call.duration || 0;
    d.cost += call.cost || 0;
    if (isSuccessfulCall(call)) d.success++;
  }
  const dates = Object.keys(dailyMap).sort();
  dashboard.callVolumeTrends = dates.map(date => ({ date, calls: dailyMap[date].calls }));
  dashboard.dailyMetrics = dates.map(date => {
    const d = dailyMap[date];
    return {
      date,
      calls: d.calls,
      successfulCalls: d.success,
      failedCalls: d.calls - d.success,
      avgDuration: d.duration / d.calls,
      totalCost: d.cost,
      avgCost: d.cost / d.calls,
      successRate: (d.success / d.calls) * 100,
    };
  });

  // --- Call outcomes ---
  const outcomeMap: Record<string, { count: number; duration: number }> = {};
  for (const call of calls) {
    const key = outcomeKey(call);
    if (!outcomeMap[key]) outcomeMap[key] = { count: 0, duration: 0 };
    outcomeMap[key].count++;
    outcomeMap[key].duration += call.duration || 0;
  }
  dashboard.callOutcomes = Object.entries(outcomeMap)
    .map(([outcome, o]) => ({ outcome, count: o.count, percentage: (o.count / calls.length) * 100 }))
    .sort((a, b) => b.count - a.count);

  // --- Cost analysis ---
  const totalMinutes = calls.reduce((sum, c) => sum + (c.duration || 0), 0) / 60;
  dashboard.costAnalysis = {
    avgCostPerCall: kpis.totalCost / calls.length,
    costPerMinute: totalMinutes > 0 ? kpis.totalCost / totalMinutes : 0,
    monthlyCostTrend: previousCalls ? percentChange(kpis.totalCost, dashboard.previousKpis!.totalCost) : null,
  };

  // --- Duration distribution + histogram ---
  const durations = calls.map(c => c.duration || 0).sort((a, b) => a - b);
  const bucketCounts = (buckets: typeof DURATION_HISTOGRAM_BUCKETS) =>
    buckets.map(b => ({ range: b.range, count: durations.filter(d => d >= b.min && d < b.max).length }));

  dashboard.durationDistribution = bucketCounts(DURATION_DISTRIBUTION_BUCKETS);

  const histCounts = bucketCounts(DURATION_HISTOGRAM_BUCKETS);
  const mostCommonBucket = histCounts.reduce((a, b) => (b.count > a.count ? b : a), histCounts[0]);
  dashboard.durationHistogram = {
    histogram: histCounts.map(h => ({ ...h, percentage: (h.count / calls.length) * 100 })),
    stats: {
      average: formatDuration(kpis.avgDuration),
      median: formatDuration(median(durations)),
      mostCommon: mostCommonBucket.range,
      longest: formatDuration(durations[durations.length - 1]),
    },
  };

  // --- Peak usage heatmap + hourly patterns (UTC) ---
  const heatmap: Record<string, number> = {};
  const hourCounts: Record<number, number> = {};
  const dayCounts: Record<string, number> = {};
  for (const call of calls) {
    const ts = callTimestamp(call);
    if (!ts) continue;
    const d = new Date(ts);
    const hour = d.getUTCHours();
    const day = DAY_NAMES[d.getUTCDay()];
    heatmap[`${hour}-${day}`] = (heatmap[`${hour}-${day}`] || 0) + 1;
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  }
  const maxHeat = Math.max(...Object.values(heatmap), 1);
  const heatmapData: DashboardData["peakUsageHeatmap"]["heatmapData"] = [];
  for (let h = 0; h < 24; h++) {
    for (const day of DAY_NAMES) {
      const c = heatmap[`${h}-${day}`] || 0;
      heatmapData.push({ hour: `${String(h).padStart(2, "0")}:00`, day, calls: c, intensity: c / maxHeat });
    }
  }
  const hourEntries = Object.entries(hourCounts).map(([h, c]) => [Number(h), c] as const);
  const fmtHour = (h: number) => `${String(h).padStart(2, "0")}:00 UTC`;
  dashboard.peakUsageHeatmap = {
    heatmapData,
    insights: {
      peakHours: [...hourEntries].sort((a, b) => b[1] - a[1] || a[0] - b[0]).slice(0, 3).map(([h]) => fmtHour(h)).join(", ") || "N/A",
      busiestDay: Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A",
      quietHours: [...hourEntries].sort((a, b) => a[1] - b[1] || a[0] - b[0]).slice(0, 3).map(([h]) => fmtHour(h)).join(", ") || "N/A",
    },
  };
  dashboard.hourlyPatterns = Array.from({ length: 24 }, (_, i) => ({ hour: i, calls: hourCounts[i] || 0 }));

  // --- Conversation outcomes (per-outcome duration, share trend vs previous period) ---
  const prevShare: Record<string, number> = {};
  if (previousCalls && previousCalls.length > 0) {
    for (const call of previousCalls) prevShare[outcomeKey(call)] = (prevShare[outcomeKey(call)] || 0) + 1;
    for (const k of Object.keys(prevShare)) prevShare[k] = (prevShare[k] / previousCalls.length) * 100;
  }
  const hasPrev = !!previousCalls && previousCalls.length > 0;
  dashboard.conversationOutcomes = {
    summary: {
      totalConversations: calls.length,
      successRate: Math.round(kpis.successRate * 100) / 100,
      avgDuration: formatDuration(kpis.avgDuration),
      avgSatisfaction: null,
    },
    outcomes: dashboard.callOutcomes.map(o => ({
      outcome: o.outcome,
      volume: o.count,
      percentage: o.percentage,
      avgDuration: formatDuration(outcomeMap[o.outcome].duration / o.count),
      satisfaction: null,
      trend: hasPrev ? o.percentage - (prevShare[o.outcome] || 0) : null,
    })),
  };

  return dashboard;
}

export function getTimeRangeForQuery(timeRange: string, startDate?: string, endDate?: string, now: Date = new Date()): { start: string; end: string } {
  // Handle custom-range with explicit dates
  if (timeRange === "custom-range" && startDate && endDate) {
    return { start: new Date(startDate).toISOString(), end: new Date(endDate).toISOString() };
  }

  const nowMs = now.getTime();
  const end = new Date(nowMs).toISOString();
  const DAY = 24 * 60 * 60 * 1000;
  let start: string;

  switch (timeRange) {
    case "today": {
      const today = new Date(nowMs);
      today.setHours(0, 0, 0, 0);
      start = today.toISOString();
      break;
    }
    case "last-7-days":
      start = new Date(nowMs - 7 * DAY).toISOString();
      break;
    case "last-30-days":
      start = new Date(nowMs - 30 * DAY).toISOString();
      break;
    case "last-90-days":
      start = new Date(nowMs - 90 * DAY).toISOString();
      break;
    default:
      // "all-time" and unknown values: capture historic data
      start = new Date("2024-01-01T00:00:00Z").toISOString();
  }

  return { start, end };
}

/**
 * Aggregate normalized calls into the same shape the Vapi Analytics API returns for
 * the queries built by buildAnalyticsQueries(): `kpis`, `call_outcomes` and
 * `assistant_performance`. Used for providers (Retell, demo) that have no
 * aggregation endpoint. Durations are in minutes to match Vapi.
 */
export function aggregateCallsLikeVapi(calls: NormalizedCall[], range: { start: string; end: string }) {
  const totalCalls = calls.length;
  const totalDurationMin = calls.reduce((s, c) => s + (c.duration || 0), 0) / 60;
  const totalCost = calls.reduce((s, c) => s + (c.cost || 0), 0);

  const outcomes: Record<string, number> = {};
  const assistants: Record<string, { calls: number; durationMin: number; cost: number }> = {};
  for (const call of calls) {
    const reason = outcomeKey(call);
    outcomes[reason] = (outcomes[reason] || 0) + 1;
    const id = call.assistantId || "Unknown";
    if (!assistants[id]) assistants[id] = { calls: 0, durationMin: 0, cost: 0 };
    assistants[id].calls++;
    assistants[id].durationMin += (call.duration || 0) / 60;
    assistants[id].cost += call.cost || 0;
  }

  const timeRange = { start: range.start, end: range.end };
  return [
    {
      name: "kpis",
      timeRange,
      result: [{
        totalCalls,
        avgDuration: totalCalls > 0 ? totalDurationMin / totalCalls : 0,
        totalCost,
      }],
    },
    {
      name: "call_outcomes",
      timeRange,
      result: Object.entries(outcomes).map(([endedReason, count]) => ({ endedReason, count })),
    },
    {
      name: "assistant_performance",
      timeRange,
      result: Object.entries(assistants).map(([assistantId, a]) => ({
        assistantId,
        calls: a.calls,
        avgDuration: a.durationMin / a.calls,
        totalCost: a.cost,
      })),
    },
  ];
}
