import { describe, expect, it } from "vitest";
import {
  aggregateCallsLikeVapi,
  buildDashboardFromRawCalls,
  computeKpisFromCalls,
  createEmptyDashboardData,
  filterCallsByRange,
  formatDuration,
  getPreviousPeriodRange,
  getTimeRangeForQuery,
  percentChange,
  type NormalizedCall,
} from "../server/analytics/dashboard";

function call(overrides: Partial<NormalizedCall>): NormalizedCall {
  return {
    id: overrides.id ?? Math.random().toString(36).slice(2),
    assistantId: "a1",
    assistantName: "Agent One",
    type: "inbound",
    endedReason: "customer-ended-call",
    duration: 60,
    cost: 0.1,
    createdAt: "2026-03-02T15:00:00.000Z", // Monday 15:00 UTC
    successEvaluation: "true",
    ...overrides,
  };
}

describe("computeKpisFromCalls", () => {
  it("returns zeros for no calls", () => {
    expect(computeKpisFromCalls([])).toEqual({
      totalCalls: 0, avgDuration: 0, successRate: 0, inboundSuccessRate: 0, outboundSuccessRate: 0, totalCost: 0,
    });
  });

  it("computes totals, averages and per-direction success rates", () => {
    const kpis = computeKpisFromCalls([
      call({ type: "inbound", duration: 30, cost: 0.5, successEvaluation: "true" }),
      call({ type: "inbound", duration: 90, cost: 0.25, successEvaluation: "false" }),
      call({ type: "outbound", duration: 120, cost: 0.25, successEvaluation: "TRUE" }),
      call({ type: "outbound", duration: 0, cost: 0, successEvaluation: null }),
    ]);
    expect(kpis.totalCalls).toBe(4);
    expect(kpis.avgDuration).toBe(60);
    expect(kpis.totalCost).toBeCloseTo(1.0);
    expect(kpis.successRate).toBe(50);
    expect(kpis.inboundSuccessRate).toBe(50);
    expect(kpis.outboundSuccessRate).toBe(50);
  });
});

describe("period helpers", () => {
  it("previous period has the same length and ends where the current one starts", () => {
    const prev = getPreviousPeriodRange("2026-03-08T00:00:00.000Z", "2026-03-15T00:00:00.000Z");
    expect(prev).toEqual({ start: "2026-03-01T00:00:00.000Z", end: "2026-03-08T00:00:00.000Z" });
  });

  it("resolves named ranges relative to an injected clock", () => {
    const now = new Date("2026-03-15T12:00:00.000Z");
    expect(getTimeRangeForQuery("last-7-days", undefined, undefined, now)).toEqual({
      start: "2026-03-08T12:00:00.000Z",
      end: "2026-03-15T12:00:00.000Z",
    });
    expect(getTimeRangeForQuery("custom-range", "2026-01-01", "2026-01-31").start).toBe("2026-01-01T00:00:00.000Z");
    expect(getTimeRangeForQuery("all-time", undefined, undefined, now).start).toBe("2024-01-01T00:00:00.000Z");
  });

  it("filters calls by inclusive or end-exclusive range", () => {
    const calls = [
      call({ id: "a", createdAt: "2026-03-01T00:00:00.000Z" }),
      call({ id: "b", createdAt: "2026-03-08T00:00:00.000Z" }),
      call({ id: "c", createdAt: null, startedAt: null }),
    ];
    expect(filterCallsByRange(calls, "2026-03-01T00:00:00.000Z", "2026-03-08T00:00:00.000Z").map(c => c.id)).toEqual(["a", "b"]);
    expect(filterCallsByRange(calls, "2026-03-01T00:00:00.000Z", "2026-03-08T00:00:00.000Z", true).map(c => c.id)).toEqual(["a"]);
  });

  it("percentChange returns null without a baseline", () => {
    expect(percentChange(10, 0)).toBeNull();
    expect(percentChange(15, 10)).toBe(50);
  });

  it("formats durations as m:ss", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(125.4)).toBe("2:05");
  });
});

describe("buildDashboardFromRawCalls", () => {
  it("returns the empty shape with null trend fields for no calls", () => {
    const d = buildDashboardFromRawCalls([]);
    expect(d).toEqual(createEmptyDashboardData());
    expect(d.costAnalysis.monthlyCostTrend).toBeNull();
    expect(d.conversationOutcomes.summary.avgSatisfaction).toBeNull();
  });

  const current = [
    call({ id: "1", assistantId: "a1", assistantName: "Agent One", duration: 20, cost: 0.1, createdAt: "2026-03-02T15:10:00.000Z", endedReason: "voicemail", successEvaluation: "false" }),
    call({ id: "2", assistantId: "a1", assistantName: "Agent One", duration: 100, cost: 0.2, createdAt: "2026-03-02T15:30:00.000Z" }),
    call({ id: "3", assistantId: "a2", assistantName: "Agent Two", duration: 400, cost: 0.6, createdAt: "2026-03-03T09:00:00.000Z", type: "outbound" }),
    call({ id: "4", assistantId: "a2", assistantName: "Agent Two", duration: 700, cost: 1.1, createdAt: "2026-03-04T18:45:00.000Z", endedReason: "assistant-ended-call" }),
  ];
  const previous = [
    call({ id: "p1", cost: 1.0, endedReason: "customer-ended-call", createdAt: "2026-02-24T10:00:00.000Z" }),
    call({ id: "p2", cost: 0.0, endedReason: "voicemail", createdAt: "2026-02-25T10:00:00.000Z" }),
  ];

  it("derives KPIs, cost analysis and trends only from the supplied calls", () => {
    const d = buildDashboardFromRawCalls(current, "last-7-days", previous);
    expect(d.kpis.totalCalls).toBe(4);
    expect(d.kpis.totalCost).toBeCloseTo(2.0);
    expect(d.kpis.successRate).toBe(75);
    expect(d.previousKpis?.totalCalls).toBe(2);

    expect(d.costAnalysis.avgCostPerCall).toBeCloseTo(0.5);
    // 2.0 USD over (20+100+400+700)/60 minutes
    expect(d.costAnalysis.costPerMinute).toBeCloseTo(2.0 / (1220 / 60));
    // previous total cost 1.0 -> current 2.0 = +100%
    expect(d.costAnalysis.monthlyCostTrend).toBeCloseTo(100);
  });

  it("leaves monthlyCostTrend and outcome trends null without a previous period", () => {
    const d = buildDashboardFromRawCalls(current);
    expect(d.costAnalysis.monthlyCostTrend).toBeNull();
    expect(d.previousKpis).toBeNull();
    expect(d.conversationOutcomes.outcomes.every(o => o.trend === null && o.satisfaction === null)).toBe(true);
  });

  it("computes outcome shares, per-outcome durations and share trend in points", () => {
    const d = buildDashboardFromRawCalls(current, "last-7-days", previous);
    const byOutcome = Object.fromEntries(d.conversationOutcomes.outcomes.map(o => [o.outcome, o]));
    expect(byOutcome["customer-ended-call"].volume).toBe(2);
    expect(byOutcome["customer-ended-call"].percentage).toBe(50);
    expect(byOutcome["customer-ended-call"].avgDuration).toBe("4:10"); // (100+400)/2 = 250s
    expect(byOutcome["customer-ended-call"].trend).toBe(0); // 50% -> 50%
    expect(byOutcome["voicemail"].trend).toBe(-25); // 50% -> 25%
    expect(byOutcome["assistant-ended-call"].trend).toBe(25); // 0% -> 25%
    expect(d.callOutcomes.reduce((s, o) => s + o.count, 0)).toBe(4);
  });

  it("buckets durations into the distribution and histogram", () => {
    const d = buildDashboardFromRawCalls(current);
    expect(d.durationDistribution).toEqual([
      { range: "0-30s", count: 1 },
      { range: "30s-2m", count: 1 },
      { range: "2-5m", count: 0 },
      { range: "5-10m", count: 1 },
      { range: "10m+", count: 1 },
    ]);
    expect(d.durationHistogram.histogram.reduce((s, h) => s + h.count, 0)).toBe(4);
    expect(d.durationHistogram.stats.median).toBe("4:10"); // (100+400)/2
    expect(d.durationHistogram.stats.longest).toBe("11:40");
  });

  it("aggregates daily metrics and volume by UTC date", () => {
    const d = buildDashboardFromRawCalls(current);
    expect(d.callVolumeTrends).toEqual([
      { date: "2026-03-02", calls: 2 },
      { date: "2026-03-03", calls: 1 },
      { date: "2026-03-04", calls: 1 },
    ]);
    const mar2 = d.dailyMetrics.find(m => m.date === "2026-03-02")!;
    expect(mar2).toMatchObject({ calls: 2, successfulCalls: 1, failedCalls: 1, avgDuration: 60, successRate: 50 });
  });

  it("builds the heatmap and hourly pattern in UTC", () => {
    const d = buildDashboardFromRawCalls(current);
    expect(d.peakUsageHeatmap.heatmapData).toHaveLength(24 * 7);
    const mon15 = d.peakUsageHeatmap.heatmapData.find(c => c.day === "Mon" && c.hour === "15:00")!;
    expect(mon15.calls).toBe(2);
    expect(mon15.intensity).toBe(1);
    expect(d.hourlyPatterns[15].calls).toBe(2);
    expect(d.peakUsageHeatmap.insights.busiestDay).toBe("Mon");
    expect(d.peakUsageHeatmap.insights.peakHours.startsWith("15:00 UTC")).toBe(true);
  });

  it("reports real per-assistant stats and requires 5 calls for the top agent", () => {
    const d = buildDashboardFromRawCalls(current);
    const a2 = d.assistantPerformance.find(a => a.assistantId === "a2")!;
    expect(a2).toMatchObject({ name: "Agent Two", calls: 2, successRate: 100, avgDuration: 550 });
    expect(a2.totalCost).toBeCloseTo(1.7);
    expect(d.mostSuccessfulAgent).toBeNull();

    const many = Array.from({ length: 5 }, (_, i) => call({ id: `m${i}`, assistantId: "a3", assistantName: "Agent Three" }));
    expect(buildDashboardFromRawCalls([...current, ...many]).mostSuccessfulAgent).toEqual({
      name: "Agent Three", successRate: 100, totalCalls: 5,
    });
  });

  it("lists recent calls newest first", () => {
    const d = buildDashboardFromRawCalls(current);
    expect(d.recentCalls.map(c => c.id)).toEqual(["4", "3", "2", "1"]);
  });
});

describe("aggregateCallsLikeVapi", () => {
  it("returns Vapi-shaped kpis, outcomes and assistant results (durations in minutes)", () => {
    const range = { start: "2026-03-01T00:00:00.000Z", end: "2026-03-08T00:00:00.000Z" };
    const result = aggregateCallsLikeVapi([
      call({ assistantId: "a1", duration: 60, cost: 0.2 }),
      call({ assistantId: "a1", duration: 180, cost: 0.4, endedReason: "voicemail" }),
      call({ assistantId: "a2", duration: 120, cost: 0.3 }),
    ], range);

    const kpis = result.find(r => r.name === "kpis")!;
    expect(kpis.timeRange).toEqual(range);
    expect(kpis.result[0]).toMatchObject({ totalCalls: 3, avgDuration: 2 });
    expect((kpis.result[0] as any).totalCost).toBeCloseTo(0.9);

    const outcomes = result.find(r => r.name === "call_outcomes")!.result;
    expect(outcomes).toEqual(expect.arrayContaining([
      { endedReason: "customer-ended-call", count: 2 },
      { endedReason: "voicemail", count: 1 },
    ]));

    const a1 = result.find(r => r.name === "assistant_performance")!.result.find((r: any) => r.assistantId === "a1") as any;
    expect(a1).toMatchObject({ calls: 2, avgDuration: 2 });
    expect(a1.totalCost).toBeCloseTo(0.6);
  });

  it("handles no calls without dividing by zero", () => {
    const result = aggregateCallsLikeVapi([], { start: "a", end: "b" });
    expect(result[0].result[0]).toEqual({ totalCalls: 0, avgDuration: 0, totalCost: 0 });
    expect(result[1].result).toEqual([]);
  });
});
