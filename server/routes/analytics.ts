import type { Express } from "express";
import { storage } from "../storage";
import { authenticateUser, requireCustomerAccess, validateCustomerAccess } from "../auth-middleware";
import { createEmptyDashboardData, computeKpisFromCalls, getPreviousPeriodRange, buildDashboardFromRawCalls, getTimeRangeForQuery } from "../analytics/dashboard";
import { fetchRetellCallsWithFilters } from "../providers/calls";
import { buildAnalyticsQueries, extractKpisFromVapiData, transformVapiDataToDashboard } from "../analytics/vapi-aggregate";

export function registerAnalyticsRoutes(app: Express): void {
  // Analytics endpoint - proxy to Vapi API and cache results
  app.post("/api/analytics", authenticateUser, requireCustomerAccess, validateCustomerAccess, async (req, res) => {
    try {
      const { timeRange, queries, provider } = req.body;
      const customerId = req.customerId;

      if (!customerId) {
        return res.status(400).json({ error: "Customer ID required" });
      }

      // Get customer-specific cache key
      const cacheKey = `analytics_${provider || 'vapi'}_${customerId}_${JSON.stringify({ timeRange, queries })}`;

      // Check cache first
      const cached = await storage.getCachedAnalytics(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const customer = await storage.getCustomer(customerId);

      if (provider === 'retell') {
        if (!customer || !customer.retellApiKey) {
          return res.status(500).json({
            error: "Customer Retell API key not configured. Contact support."
          });
        }

        // Fetch all raw Retell calls
        const rawCalls = await fetchRetellCallsWithFilters({
          limit: "1000" // Simple limit for now
        }, customer.retellApiKey);

        // Fallback or empty structure matching DashboardData
        // Since Retell lacks an aggregation endpoint, we return empty aggregations for the 'queries' specific logic,
        // but the rest of the app heavily relies on raw calls via `/api/analytics/summary` instead anyway.
        // If this endpoint is specifically required to return Vapi formatted aggregations, we must manually build it.
        // For now, we'll return a stub as this endpoint is mostly used by `useQuery` for specific graphs.
        const mockAggregations = {
          result: [{}]
        };

        return res.json({
          name: "Retell Analytics",
          result: mockAggregations.result
        });

      } else {
        // Default VAPI logic
        if (!customer || !customer.vapiApiKey) {
          return res.status(500).json({
            error: "Customer Vapi API key not configured. Contact support."
          });
        }

        // Build analytics queries for Vapi API
        const analyticsQueries = await buildAnalyticsQueries(timeRange);

        // Make request to Vapi Analytics API with customer-specific key
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

        // Cache the response
        await storage.setCachedAnalytics(cacheKey, vapiData);

        res.json(vapiData);
      }
    } catch (error) {
      console.error("Analytics API error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Internal server error"
      });
    }
  });

  // Get dashboard summary
  app.get("/api/analytics/summary", authenticateUser, requireCustomerAccess, validateCustomerAccess, async (req, res) => {
    try {
      const timeRange = req.query.timeRange as string || "last-7-days";
      const provider = req.query.provider as string || "vapi";
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;
      const customerId = req.customerId;

      if (!customerId) {
        return res.status(400).json({ error: "Customer ID required" });
      }

      // Get customer-specific cache key (include custom dates when present)
      const cacheKey = timeRange === "custom-range" && startDate && endDate
        ? `summary_${provider}_${customerId}_custom_${startDate}_${endDate}`
        : `summary_${provider}_${customerId}_${timeRange}`;

      const cached = await storage.getCachedAnalytics(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const customer = await storage.getCustomer(customerId);

      // --- RETELL LOGIC BLOCK ---
      if (provider === 'retell') {
        if (!customer || !customer.retellApiKey) {
          // Empty state placeholder for missing config
          return res.json(createEmptyDashboardData());
        }

        try {
          // 1. Fetch RAW retell calls to construct aggregates since Retell has no aggregation API yet
          // Compute date bounds from timeRange (or custom dates)
          const { start: retellStart, end: retellEnd } = getTimeRangeForQuery(timeRange, startDate, endDate);

          const retellCalls = await fetchRetellCallsWithFilters({
            limit: "1000" // We bring in large subset of calls to perform accurate in-memory aggregates
          }, customer.retellApiKey);

          // Filter calls to the requested time range
          const filteredRetellCalls = retellCalls.filter(call => {
            if (!call.startedAt) return false;
            const callDate = new Date(call.startedAt).getTime();
            return callDate >= new Date(retellStart).getTime() && callDate <= new Date(retellEnd).getTime();
          });

          // Compute previous period KPIs for trend comparison
          const { start: prevStart, end: prevEnd } = getPreviousPeriodRange(retellStart, retellEnd);
          const previousRetellCalls = retellCalls.filter(call => {
            if (!call.startedAt) return false;
            const callDate = new Date(call.startedAt).getTime();
            return callDate >= new Date(prevStart).getTime() && callDate < new Date(prevEnd).getTime();
          });

          // Build our Dashboard Data manually from the normalized raw calls
          const dashboardData = buildDashboardFromRawCalls(filteredRetellCalls, timeRange);
          dashboardData.previousKpis = computeKpisFromCalls(previousRetellCalls);
          await storage.setCachedAnalytics(cacheKey, dashboardData);
          return res.json(dashboardData);

        } catch (error) {
          console.error("Failed to fetch/build Retell summary:", error);
          return res.json(createEmptyDashboardData());
        }
      }

      // --- DEFAULT VAPI LOGIC ---
      if (!customer || !customer.vapiApiKey) {
        return res.json(createEmptyDashboardData());
      }

      try {
        // Build analytics queries for Vapi API (pass custom dates if provided)
        const analyticsQueries = await buildAnalyticsQueries(timeRange, startDate, endDate);

        // Also build queries for the previous period to compute trend comparisons
        const { start: currentStart, end: currentEnd } = getTimeRangeForQuery(timeRange, startDate, endDate);
        const { start: prevStart, end: prevEnd } = getPreviousPeriodRange(currentStart, currentEnd);
        const previousQueries = await buildAnalyticsQueries("custom-range", prevStart, prevEnd);

        // Make requests to Vapi Analytics API for both periods in parallel
        const [vapiResponse, vapiPrevResponse] = await Promise.all([
          fetch("https://api.vapi.ai/analytics", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${customer.vapiApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ queries: analyticsQueries }),
          }),
          fetch("https://api.vapi.ai/analytics", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${customer.vapiApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ queries: previousQueries }),
          }),
        ]);

        if (!vapiResponse.ok) {
          const errorText = await vapiResponse.text();
          console.error("Vapi API error:", errorText);
          throw new Error(`Vapi API error: ${errorText}`);
        }

        const vapiData = await vapiResponse.json();

        // Transform Vapi data to dashboard format and fetch recent calls
        const dashboardData = await transformVapiDataToDashboard(vapiData, customer.vapiApiKey);

        // Compute previous period KPIs if the previous-period request succeeded
        if (vapiPrevResponse.ok) {
          const vapiPrevData = await vapiPrevResponse.json();
          dashboardData.previousKpis = extractKpisFromVapiData(vapiPrevData);
        } else {
          dashboardData.previousKpis = null;
        }

        // Cache the result
        await storage.setCachedAnalytics(cacheKey, dashboardData);

        res.json(dashboardData);
      } catch (error) {
        console.error("Failed to fetch from Vapi API:", error);
        // Return empty data if API fails
        res.json(createEmptyDashboardData());
      }
    } catch (error) {
      console.error("Summary API error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Internal server error"
      });
    }
  });
}
