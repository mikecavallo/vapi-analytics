import { type DashboardData, type KpiData } from "@shared/schema";

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
    costAnalysis: { avgCostPerCall: 0, costPerMinute: 0, monthlyCostTrend: 0 },
    durationDistribution: [],
    hourlyPatterns: [],
    conversationFlow: { stages: [], successPaths: [], dropOffPoints: [] },
    durationHistogram: { histogram: [], stats: { average: "0:00", median: "0:00", mostCommon: "0s", longest: "0:00" } },
    peakUsageHeatmap: { heatmapData: [], insights: { peakHours: "N/A", busiestDay: "N/A", quietHours: "N/A" } },
    conversationOutcomes: { summary: { totalConversations: 0, successRate: 0, avgDuration: "0:00", avgSatisfaction: 0 }, outcomes: [] }
  };
}

/**
 * Compute KPI values from an array of raw (normalized) calls.
 * Reused for both the current and previous period calculations.
 */
export function computeKpisFromCalls(calls: any[]): KpiData {
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

  calls.forEach(call => {
    totalDuration += (call.duration || 0);
    totalCost += (call.cost || 0);

    const isSuccess = call.successEvaluation === 'true';
    if (isSuccess) successfulCalls++;

    if (call.type === 'inbound') {
      inboundCalls++;
      if (isSuccess) inboundSuccess++;
    } else {
      outboundCalls++;
      if (isSuccess) outboundSuccess++;
    }
  });

  return {
    totalCalls: calls.length,
    avgDuration: calls.length > 0 ? totalDuration / calls.length : 0,
    successRate: calls.length > 0 ? (successfulCalls / calls.length) * 100 : 0,
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

export function buildDashboardFromRawCalls(calls: any[], timeRange: string): DashboardData {
  const dashboard = createEmptyDashboardData();
  if (!calls || calls.length === 0) return dashboard;

  let totalDuration = 0;
  let successfulCalls = 0;
  let inboundCalls = 0;
  let outboundCalls = 0;
  let inboundSuccess = 0;
  let outboundSuccess = 0;
  let totalCost = 0;
  const assistantStats: Record<string, { calls: number, success: number, name: string }> = {};

  calls.forEach(call => {
    totalDuration += (call.duration || 0);
    totalCost += (call.cost || 0);

    const isSuccess = call.successEvaluation === 'true';
    if (isSuccess) successfulCalls++;

    if (call.type === 'inbound') {
      inboundCalls++;
      if (isSuccess) inboundSuccess++;
    } else {
      outboundCalls++;
      if (isSuccess) outboundSuccess++;
    }

    const astId = call.assistantId || 'Unknown';
    if (!assistantStats[astId]) assistantStats[astId] = { calls: 0, success: 0, name: call.assistantName || astId };
    assistantStats[astId].calls++;
    if (isSuccess) assistantStats[astId].success++;
  });

  dashboard.kpis.totalCalls = calls.length;
  dashboard.kpis.avgDuration = calls.length > 0 ? (totalDuration / calls.length) : 0;
  dashboard.kpis.successRate = calls.length > 0 ? (successfulCalls / calls.length) * 100 : 0;
  dashboard.kpis.inboundSuccessRate = inboundCalls > 0 ? (inboundSuccess / inboundCalls) * 100 : 0;
  dashboard.kpis.outboundSuccessRate = outboundCalls > 0 ? (outboundSuccess / outboundCalls) * 100 : 0;
  dashboard.kpis.totalCost = totalCost;

  let topAgent = null;
  let highSuccess = -1;
  dashboard.assistantPerformance = Object.keys(assistantStats).map(id => {
    const stat = assistantStats[id];
    const rate = (stat.success / stat.calls) * 100;
    if (rate > highSuccess && stat.calls >= 5) { // min 5 calls logic
      highSuccess = rate;
      topAgent = { name: stat.name, successRate: rate, totalCalls: stat.calls };
    }
    return { assistantId: id, name: stat.name, calls: stat.calls, successRate: rate, totalCost: 0, avgDuration: 0 };
  });

  if (topAgent) dashboard.mostSuccessfulAgent = topAgent;

  // Recent calls (limit to 10 for dashboard widget)
  dashboard.recentCalls = calls.slice(0, 10).map((call: any) => ({
    id: call.id || '',
    assistantName: call.assistantName || call.assistantId || 'Unknown',
    duration: call.duration || 0,
    cost: call.cost || 0,
    status: call.status || 'unknown',
    endedReason: call.endedReason || '',
    createdAt: call.createdAt || new Date().toISOString(),
    type: call.type || 'outbound',
    assistantPhoneNumber: call.assistantPhoneNumber || '',
    customerPhoneNumber: call.customerPhoneNumber || '',
    successEvaluation: call.successEvaluation,
  }));

  // --- Call Volume Trends (daily aggregation) ---
  const volumeByDate: Record<string, number> = {};
  calls.forEach((call: any) => {
    const date = call.createdAt ? call.createdAt.split('T')[0] : null;
    if (date) {
      volumeByDate[date] = (volumeByDate[date] || 0) + 1;
    }
  });
  dashboard.callVolumeTrends = Object.keys(volumeByDate).sort().map(date => ({
    date,
    calls: volumeByDate[date],
  }));

  // --- Call Outcomes ---
  const outcomeMap: Record<string, number> = {};
  calls.forEach((call: any) => {
    const reason = call.endedReason || call.status || 'unknown';
    outcomeMap[reason] = (outcomeMap[reason] || 0) + 1;
  });
  dashboard.callOutcomes = Object.entries(outcomeMap).map(([outcome, count]) => ({
    outcome,
    count,
    percentage: calls.length > 0 ? (count / calls.length) * 100 : 0,
  }));

  // --- Daily Metrics ---
  const dailyMap: Record<string, { calls: number; success: number; failed: number; duration: number; cost: number }> = {};
  calls.forEach((call: any) => {
    const date = call.createdAt ? call.createdAt.split('T')[0] : null;
    if (!date) return;
    if (!dailyMap[date]) dailyMap[date] = { calls: 0, success: 0, failed: 0, duration: 0, cost: 0 };
    dailyMap[date].calls++;
    dailyMap[date].duration += (call.duration || 0);
    dailyMap[date].cost += (call.cost || 0);
    if (call.successEvaluation === 'true') dailyMap[date].success++;
    else dailyMap[date].failed++;
  });
  dashboard.dailyMetrics = Object.keys(dailyMap).sort().map(date => {
    const d = dailyMap[date];
    return {
      date,
      calls: d.calls,
      successfulCalls: d.success,
      failedCalls: d.failed,
      avgDuration: d.calls > 0 ? d.duration / d.calls : 0,
      totalCost: d.cost,
      avgCost: d.calls > 0 ? d.cost / d.calls : 0,
      successRate: d.calls > 0 ? (d.success / d.calls) * 100 : 0,
    };
  });

  // --- Duration Histogram ---
  const buckets = [
    { range: '0-30s', min: 0, max: 30 },
    { range: '30s-1m', min: 30, max: 60 },
    { range: '1-2m', min: 60, max: 120 },
    { range: '2-5m', min: 120, max: 300 },
    { range: '5-10m', min: 300, max: 600 },
    { range: '10m+', min: 600, max: Infinity },
  ];
  const histCounts = buckets.map(b => ({ range: b.range, count: 0 }));
  const durations: number[] = [];
  calls.forEach((call: any) => {
    const dur = call.duration || 0;
    durations.push(dur);
    for (let i = 0; i < buckets.length; i++) {
      if (dur >= buckets[i].min && dur < buckets[i].max) {
        histCounts[i].count++;
        break;
      }
    }
  });
  durations.sort((a, b) => a - b);
  const fmtDur = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
  const avgDur = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
  const medDur = durations.length > 0 ? durations[Math.floor(durations.length / 2)] : 0;
  const maxDur = durations.length > 0 ? durations[durations.length - 1] : 0;
  let mostCommonBucket = histCounts.reduce((a, b) => b.count > a.count ? b : a, histCounts[0]);
  dashboard.durationHistogram = {
    histogram: histCounts.map(h => ({ ...h, percentage: calls.length > 0 ? (h.count / calls.length) * 100 : 0 })),
    stats: {
      average: fmtDur(avgDur),
      median: fmtDur(medDur),
      mostCommon: mostCommonBucket.range,
      longest: fmtDur(maxDur),
    },
  };

  // --- Peak Usage Heatmap ---
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const heatmap: Record<string, number> = {};
  const hourCounts: Record<number, number> = {};
  const dayCounts: Record<string, number> = {};
  calls.forEach((call: any) => {
    if (!call.createdAt) return;
    const d = new Date(call.createdAt);
    const hour = d.getHours();
    const day = dayNames[d.getDay()];
    const key = `${hour}-${day}`;
    heatmap[key] = (heatmap[key] || 0) + 1;
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  });
  const heatmapData: { hour: string; day: string; calls: number; intensity: number }[] = [];
  const maxHeat = Math.max(...Object.values(heatmap), 1);
  for (let h = 0; h < 24; h++) {
    for (const day of dayNames) {
      const key = `${h}-${day}`;
      const c = heatmap[key] || 0;
      heatmapData.push({ hour: `${h}:00`, day, calls: c, intensity: c / maxHeat });
    }
  }
  dashboard.peakUsageHeatmap = {
    heatmapData,
    insights: {
      peakHours: Object.entries(hourCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([h]) => `${h}:00`).join(', ') || 'N/A',
      busiestDay: Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A',
      quietHours: Object.entries(hourCounts).sort((a, b) => a[1] - b[1]).slice(0, 3).map(([h]) => `${h}:00`).join(', ') || 'N/A',
    },
  };

  // --- Hourly Patterns ---
  dashboard.hourlyPatterns = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    calls: hourCounts[i] || 0,
  }));

  // --- Conversation Outcomes ---
  dashboard.conversationOutcomes = {
    summary: {
      totalConversations: calls.length,
      successRate: dashboard.kpis.successRate,
      avgDuration: fmtDur(avgDur),
      avgSatisfaction: dashboard.kpis.successRate / 20, // rough 0-5 scale
    },
    outcomes: dashboard.callOutcomes.map(o => ({
      outcome: o.outcome,
      volume: o.count,
      percentage: o.percentage,
      avgDuration: fmtDur(avgDur),
      satisfaction: dashboard.kpis.successRate / 20,
      trend: 0,
    })),
  };

  return dashboard;
}

export function getTimeRangeForQuery(timeRange: string, startDate?: string, endDate?: string): { start: string; end: string } {
  // Handle custom-range with explicit dates
  if (timeRange === "custom-range" && startDate && endDate) {
    return { start: new Date(startDate).toISOString(), end: new Date(endDate).toISOString() };
  }

  const end = new Date().toISOString();
  let start: string;

  switch (timeRange) {
    case "today":
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      start = today.toISOString();
      break;
    case "last-7-days":
      start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      break;
    case "last-30-days":
      start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      break;
    case "last-90-days":
      start = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
      break;
    case "all-time":
      start = new Date("2024-01-01T00:00:00Z").toISOString();
      break;
    default:
      // Default to all-time to capture historic data
      start = new Date("2024-01-01T00:00:00Z").toISOString();
  }

  return { start, end };
}
