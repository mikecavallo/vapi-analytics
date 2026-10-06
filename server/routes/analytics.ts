import type { Express } from "express";
import { storage } from "../storage";
import { authenticateUser, requireCustomerAccess, validateCustomerAccess } from "../auth-middleware";
import {
  aggregateCallsLikeVapi,
  buildDashboardFromRawCalls,
  createEmptyDashboardData,
  getPreviousPeriodRange,
  getTimeRangeForQuery,
} from "../analytics/dashboard";
import { buildAnalyticsQueries } from "../analytics/vapi-aggregate";
import { loadCallsForPeriods, normalizeProvider, usesDemoData } from "../providers/source";

export function registerAnalyticsRoutes(app: Express): void {
  // Aggregated analytics in Vapi Analytics API format (kpis / call_outcomes / assistant_performance).
  // Vapi: proxied to Vapi's aggregation API. Retell and demo data: computed from the raw calls,
  // since neither has an aggregation endpoint.
  app.post("/api/analytics", authenticateUser, requireCustomerAccess, validateCustomerAccess, async (req, res) => {
    try {
      const { timeRange, queries, startDate, endDate } = req.body;
      const provider = normalizeProvider(req.body.provider);
      const customerId = req.customerId;

      if (!customerId) {
        return res.status(400).json({ error: "Customer ID required" });
      }

      const cacheKey = `analytics_${provider}_${customerId}_${JSON.stringify({ timeRange, queries, startDate, endDate })}`;
      const cached = await storage.getCachedAnalytics(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const customer = await storage.getCustomer(customerId);

      if (provider === "retell" || usesDemoData(customer, provider)) {
        const range = getTimeRangeForQuery(timeRange, startDate, endDate);
        const periods = await loadCallsForPeriods(customer, provider, range, getPreviousPeriodRange(range.start, range.end));
        if (!periods) {
          return res.status(500).json({
            error: `Customer ${provider === "retell" ? "Retell" : "Vapi"} API key not configured. Contact support.`
          });
        }
        const result = aggregateCallsLikeVapi(periods.current, range);
        await storage.setCachedAnalytics(cacheKey, result as any);
        return res.json(result);
      }

      // Default Vapi logic
      if (!customer || !customer.vapiApiKey) {
        return res.status(500).json({
          error: "Customer Vapi API key not configured. Contact support."
        });
      }

      const analyticsQueries = await buildAnalyticsQueries(timeRange, startDate, endDate);

      const vapiResponse = await fetch("https://api.vapi.ai/analytics", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${customer.vapiApiKey}`,
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
      await storage.setCachedAnalytics(cacheKey, vapiData);
      res.json(vapiData);
    } catch (error) {
      console.error("Analytics API error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Internal server error"
      });
    }
  });

  // Dashboard summary. Every figure is computed from the provider's raw call records
  // (or seeded demo calls) for the requested period; see buildDashboardFromRawCalls.
  app.get("/api/analytics/summary", authenticateUser, requireCustomerAccess, validateCustomerAccess, async (req, res) => {
    try {
      const timeRange = req.query.timeRange as string || "last-7-days";
      const provider = normalizeProvider(req.query.provider);
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;
      const customerId = req.customerId;

      if (!customerId) {
        return res.status(400).json({ error: "Customer ID required" });
      }

      const cacheKey = timeRange === "custom-range" && startDate && endDate
        ? `summary_${provider}_${customerId}_custom_${startDate}_${endDate}`
        : `summary_${provider}_${customerId}_${timeRange}`;

      const cached = await storage.getCachedAnalytics(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const customer = await storage.getCustomer(customerId);
      const current = getTimeRangeForQuery(timeRange, startDate, endDate);
      const previous = getPreviousPeriodRange(current.start, current.end);

      try {
        const periods = await loadCallsForPeriods(customer, provider, current, previous);
        if (!periods) {
          // No key for this provider: empty state
          return res.json(createEmptyDashboardData());
        }

        const dashboardData = buildDashboardFromRawCalls(periods.current, timeRange, periods.previous);
        dashboardData.meta = { source: periods.source, callLimitReached: periods.callLimitReached };
        await storage.setCachedAnalytics(cacheKey, dashboardData);
        return res.json(dashboardData);
      } catch (error) {
        console.error(`Failed to fetch/build ${provider} summary:`, error);
        return res.json(createEmptyDashboardData());
      }
    } catch (error) {
      console.error("Summary API error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Internal server error"
      });
    }
  });
}
