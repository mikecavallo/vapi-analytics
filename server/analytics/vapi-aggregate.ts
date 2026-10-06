import { type VapiAnalyticsQuery } from "@shared/schema";
import { getTimeRangeForQuery } from "./dashboard";

/** Queries sent to the Vapi Analytics API by POST /api/analytics. */
export async function buildAnalyticsQueries(timeRange: string, startDate?: string, endDate?: string): Promise<VapiAnalyticsQuery[]> {
  const { start, end } = getTimeRangeForQuery(timeRange, startDate, endDate);

  return [
    // Total calls and basic metrics
    {
      name: "kpis",
      timeRange: { start, end },
      table: "call" as const,
      operations: [
        { operation: "count", column: "id", alias: "totalCalls" },
        { operation: "avg", column: "duration", alias: "avgDuration" },
        { operation: "sum", column: "cost", alias: "totalCost" },
      ],
    },
    // Call outcomes
    {
      name: "call_outcomes",
      timeRange: { start, end },
      table: "call" as const,
      operations: [
        { operation: "count", column: "id", alias: "count" },
      ],
      groupBy: ["endedReason"],
    },
    // Assistant performance
    {
      name: "assistant_performance",
      timeRange: { start, end },
      table: "call" as const,
      operations: [
        { operation: "count", column: "id", alias: "calls" },
        { operation: "avg", column: "duration", alias: "avgDuration" },
        { operation: "sum", column: "cost", alias: "totalCost" },
      ],
      groupBy: ["assistantId"],
    },
  ];
}
