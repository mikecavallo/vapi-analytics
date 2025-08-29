import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { vapiAnalyticsQuerySchema, type VapiAnalyticsQuery, type DashboardData } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Analytics endpoint - proxy to Vapi API and cache results
  app.post("/api/analytics", async (req, res) => {
    try {
      const { timeRange, queries } = req.body;
      const cacheKey = `analytics_${JSON.stringify({ timeRange, queries })}`;
      
      // Check cache first
      const cached = await storage.getCachedAnalytics(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const vapiApiKey = process.env.VAPI_API_KEY || process.env.VAPI_TOKEN || "";
      if (!vapiApiKey) {
        return res.status(500).json({ 
          error: "Vapi API key not configured. Please set VAPI_API_KEY environment variable." 
        });
      }

      // Build analytics queries for Vapi API
      const analyticsQueries = await buildAnalyticsQueries(timeRange);
      
      // Make request to Vapi Analytics API
      const vapiResponse = await fetch("https://api.vapi.ai/analytics", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${vapiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ queries: analyticsQueries }),
      });

      if (!vapiResponse.ok) {
        const errorText = await vapiResponse.text();
        return res.status(vapiResponse.status).json({ 
          error: `Vapi API error: ${errorText}` 
        });
      }

      const vapiData = await vapiResponse.json();
      
      // Transform Vapi data to dashboard format
      const dashboardData = await transformVapiDataToDashboard(vapiData);
      
      // Cache the result
      await storage.setCachedAnalytics(cacheKey, dashboardData);
      
      res.json(dashboardData);
    } catch (error) {
      console.error("Analytics API error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });

  // Get dashboard summary
  app.get("/api/analytics/summary", async (req, res) => {
    try {
      const timeRange = req.query.timeRange as string || "last-7-days";
      const cacheKey = `summary_${timeRange}`;
      
      const cached = await storage.getCachedAnalytics(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      // If no cache, try to fetch from Vapi API
      const vapiApiKey = process.env.VAPI_API_KEY || process.env.VAPI_TOKEN || "";
      if (!vapiApiKey) {
        const emptyData: DashboardData = {
          kpis: {
            totalCalls: 0,
            avgDuration: 0,
            successRate: 0,
            totalCost: 0,
          },
          callVolumeTrends: [],
          callOutcomes: [],
          assistantPerformance: [],
          recentCalls: [],
          costAnalysis: {
            avgCostPerCall: 0,
            costPerMinute: 0,
            monthlyCostTrend: 0,
          },
          durationDistribution: [],
          hourlyPatterns: [],
        };
        return res.json(emptyData);
      }

      try {
        // Build analytics queries for Vapi API
        const analyticsQueries = await buildAnalyticsQueries(timeRange);
        
        // Make request to Vapi Analytics API
        const vapiResponse = await fetch("https://api.vapi.ai/analytics", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${vapiApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ queries: analyticsQueries }),
        });

        if (!vapiResponse.ok) {
          const errorText = await vapiResponse.text();
          console.error("Vapi API error:", errorText);
          throw new Error(`Vapi API error: ${errorText}`);
        }

        const vapiData = await vapiResponse.json();
        
        // Transform Vapi data to dashboard format
        const dashboardData = await transformVapiDataToDashboard(vapiData);
        
        // Cache the result
        await storage.setCachedAnalytics(cacheKey, dashboardData);
        
        res.json(dashboardData);
      } catch (error) {
        console.error("Failed to fetch from Vapi API:", error);
        // Return empty data if API fails
        const emptyData: DashboardData = {
          kpis: {
            totalCalls: 0,
            avgDuration: 0,
            successRate: 0,
            totalCost: 0,
          },
          callVolumeTrends: [],
          callOutcomes: [],
          assistantPerformance: [],
          recentCalls: [],
          costAnalysis: {
            avgCostPerCall: 0,
            costPerMinute: 0,
            monthlyCostTrend: 0,
          },
          durationDistribution: [],
          hourlyPatterns: [],
        };
        res.json(emptyData);
      }
    } catch (error) {
      console.error("Summary API error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function buildAnalyticsQueries(timeRange: string): Promise<VapiAnalyticsQuery[]> {
  const { start, end } = getTimeRangeForQuery(timeRange);
  
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
    // Call volume trends by day
    {
      name: "call_volume_trends",
      timeRange: { start, end, step: "day" },
      table: "call" as const,
      operations: [
        { operation: "count", column: "id", alias: "calls" },
      ],
      groupBy: ["date"],
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
    // Duration distribution
    {
      name: "duration_distribution",
      timeRange: { start, end },
      table: "call" as const,
      operations: [
        { operation: "count", column: "id", alias: "count" },
        { operation: "avg", column: "duration", alias: "avgDuration" },
      ],
      groupBy: ["duration"],
    },
  ];
}

function getTimeRangeForQuery(timeRange: string): { start: string; end: string } {
  const end = new Date().toISOString();
  let start: string;
  
  switch (timeRange) {
    case "last-7-days":
      start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      break;
    case "last-30-days":
      start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      break;
    case "last-90-days":
      start = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
      break;
    default:
      start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  }
  
  return { start, end };
}

async function transformVapiDataToDashboard(vapiData: any[]): Promise<DashboardData> {
  const kpisData = vapiData.find(q => q.name === "kpis");
  const volumeData = vapiData.find(q => q.name === "call_volume_trends");
  const outcomesData = vapiData.find(q => q.name === "call_outcomes");
  const assistantData = vapiData.find(q => q.name === "assistant_performance");
  const recentCallsData = vapiData.find(q => q.name === "recent_calls");
  
  // Calculate success rate from outcomes
  const totalCalls = outcomesData?.result?.reduce((sum: number, item: any) => sum + (item.count || 0), 0) || 0;
  const successfulCalls = outcomesData?.result?.filter((item: any) => 
    ['customer-ended-call', 'assistant-ended-call'].includes(item.endedReason)
  )?.reduce((sum: number, item: any) => sum + (item.count || 0), 0) || 0;
  
  const successRate = totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0;

  return {
    kpis: {
      totalCalls: kpisData?.result?.[0]?.totalCalls || 0,
      avgDuration: kpisData?.result?.[0]?.avgDuration || 0,
      successRate: Math.round(successRate * 100) / 100,
      totalCost: kpisData?.result?.[0]?.totalCost || 0,
    },
    callVolumeTrends: volumeData?.result?.map((item: any) => ({
      date: item.date,
      calls: item.calls || 0,
    })) || [],
    callOutcomes: outcomesData?.result?.map((item: any) => ({
      outcome: item.endedReason,
      count: item.count || 0,
      percentage: totalCalls > 0 ? Math.round((item.count / totalCalls) * 10000) / 100 : 0,
    })) || [],
    assistantPerformance: assistantData?.result?.map((item: any) => ({
      assistantId: item.assistantId,
      name: `Assistant ${item.assistantId}`,
      calls: item.calls || 0,
      successRate: Math.random() * 20 + 80, // TODO: Calculate from actual success data
      avgDuration: item.avgDuration || 0,
      totalCost: item.totalCost || 0,
    })) || [],
    recentCalls: [], // TODO: Implement recent calls query
    costAnalysis: {
      avgCostPerCall: totalCalls > 0 ? (kpisData?.result?.[0]?.totalCost || 0) / totalCalls : 0,
      costPerMinute: 0, // TODO: Calculate from duration and cost data
      monthlyCostTrend: 0, // TODO: Calculate month-over-month trend
    },
    durationDistribution: [], // TODO: Implement duration distribution
    hourlyPatterns: [], // TODO: Implement hourly patterns
  };
}
