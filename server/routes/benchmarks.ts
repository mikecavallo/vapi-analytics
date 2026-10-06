import type { Express } from "express";
import { authenticateUser, requireCustomerAccess, validateCustomerAccess } from "../auth-middleware";
import { fetchCallsWithFilters } from "../providers/calls";
import { getTenantContext } from "../providers/tenant";
import { sendError } from "../http-error";
import { storage } from "../storage";

export function registerBenchmarkRoutes(app: Express): void {
  // Performance Benchmarks endpoint
  // Uses the signed-in customer's own Vapi key (or their demo calls); never the platform key.
  app.get("/api/performance-benchmarks", authenticateUser, requireCustomerAccess, validateCustomerAccess, async (req: any, res: any) => {
    try {
      const ctx = await getTenantContext(req, "vapi");

      // Generate realistic benchmark data safely without pulling excessive data
      const now = new Date();
      // ... using 7 days for benchmarks calculation
      const fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const toDate = now.toISOString();

      const queryParams = {
        limit: "100", // Just a sample for benchmarks
        createdAtGt: fromDate,
        createdAtLt: toDate
      };

      const calls = ctx.demo
        ? await storage.getDemoCalls(ctx.customer.id, "vapi", { start: fromDate, end: toDate, limit: 100 })
        : await fetchCallsWithFilters(queryParams, ctx.key!);

      const performanceMetrics = {
        callTimingDistribution: analyzeTiming(calls),
        anomalyDetection: detectAnomalies(calls),
        assistantPerformance: analyzeAssistantPerformance(calls),
        healthcareSpecificMetrics: analyzeHealthcareMetrics(calls),
        benchmarkComparisons: generateBenchmarks(calls)
      };

      console.log(`[${new Date().toLocaleTimeString()}] Generated performance benchmarks for ${calls.length} calls`);
      res.json(performanceMetrics);
    } catch (error) {
      sendError(res, error, "Failed to generate performance benchmarks", "benchmarks");
    }
  });

  // Helper functions for performance analysis
  function analyzeTiming(calls: any[]) {
    const durations = calls.map(call => call.duration || 0).filter(d => d > 0);
    const sorted = durations.sort((a, b) => a - b);

    return {
      distribution: {
        p25: sorted[Math.floor(sorted.length * 0.25)] || 0,
        p50: sorted[Math.floor(sorted.length * 0.5)] || 0,
        p75: sorted[Math.floor(sorted.length * 0.75)] || 0,
        p90: sorted[Math.floor(sorted.length * 0.9)] || 0,
        p95: sorted[Math.floor(sorted.length * 0.95)] || 0
      },
      average: durations.reduce((a, b) => a + b, 0) / durations.length || 0,
      totalCalls: calls.length,
      hourlyPatterns: analyzeHourlyPatterns(calls)
    };
  }

  function detectAnomalies(calls: any[]) {
    const durations = calls.map(call => call.duration || 0).filter(d => d > 0);
    const costs = calls.map(call => call.cost || 0).filter(c => c > 0);

    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length || 0;
    const avgCost = costs.reduce((a, b) => a + b, 0) / costs.length || 0;

    const anomalies = calls.filter(call => {
      const durationAnomaly = Math.abs(call.duration - avgDuration) > (avgDuration * 2);
      const costAnomaly = Math.abs(call.cost - avgCost) > (avgCost * 2);
      const statusAnomaly = ['failed', 'error'].includes(call.status);
      return durationAnomaly || costAnomaly || statusAnomaly;
    });

    return {
      totalAnomalies: anomalies.length,
      types: {
        duration: anomalies.filter(call => Math.abs(call.duration - avgDuration) > (avgDuration * 2)).length,
        cost: anomalies.filter(call => Math.abs(call.cost - avgCost) > (avgCost * 2)).length,
        status: anomalies.filter(call => ['failed', 'error'].includes(call.status)).length
      },
      recentAnomalies: anomalies.slice(0, 10).map(call => ({
        id: call.id,
        type: 'performance',
        severity: call.status === 'failed' ? 'high' : 'medium',
        description: `Call ${call.id} had unusual ${call.duration > avgDuration * 2 ? 'duration' : 'performance'}`,
        timestamp: call.createdAt
      }))
    };
  }

  function analyzeAssistantPerformance(calls: any[]) {
    const assistantStats: Record<string, {
      totalCalls: number;
      totalDuration: number;
      totalCost: number;
      successfulCalls: number;
      avgResponseTime: number;
    }> = {};

    calls.forEach(call => {
      const assistantId = call.assistantId || 'unknown';
      if (!assistantStats[assistantId]) {
        assistantStats[assistantId] = {
          totalCalls: 0,
          totalDuration: 0,
          totalCost: 0,
          successfulCalls: 0,
          avgResponseTime: 0
        };
      }

      assistantStats[assistantId].totalCalls++;
      assistantStats[assistantId].totalDuration += call.duration || 0;
      assistantStats[assistantId].totalCost += call.cost || 0;

      if (['completed', 'customer-ended-call'].includes(call.endedReason)) {
        assistantStats[assistantId].successfulCalls++;
      }
    });

    return Object.entries(assistantStats).map(([assistantId, stats]: [string, any]) => ({
      assistantId,
      avgDuration: stats.totalDuration / stats.totalCalls,
      avgCost: stats.totalCost / stats.totalCalls,
      successRate: (stats.successfulCalls / stats.totalCalls) * 100,
      totalCalls: stats.totalCalls,
      efficiency: (stats.successfulCalls / stats.totalCalls) * (60 / (stats.totalDuration / stats.totalCalls)) // calls per hour weighted by success
    }));
  }

  function analyzeHealthcareMetrics(calls: any[]) {
    const appointmentCalls = calls.filter(call =>
      call.transcript?.toLowerCase().includes('appointment') ||
      call.transcript?.toLowerCase().includes('schedule')
    );

    const urgentCalls = calls.filter(call =>
      call.transcript?.toLowerCase().includes('urgent') ||
      call.transcript?.toLowerCase().includes('emergency')
    );

    const prescriptionCalls = calls.filter(call =>
      call.transcript?.toLowerCase().includes('prescription') ||
      call.transcript?.toLowerCase().includes('medication')
    );

    return {
      appointmentBookingRate: (appointmentCalls.length / calls.length) * 100,
      urgentCallPercentage: (urgentCalls.length / calls.length) * 100,
      prescriptionInquiries: (prescriptionCalls.length / calls.length) * 100,
      avgAppointmentCallDuration: appointmentCalls.reduce((sum, call) => sum + (call.duration || 0), 0) / appointmentCalls.length || 0
    };
  }

  function analyzeHourlyPatterns(calls: any[]) {
    const hourlyData = Array.from({ length: 24 }, () => ({ hour: 0, calls: 0, avgDuration: 0, successRate: 0 }));

    calls.forEach(call => {
      const hour = new Date(call.createdAt).getHours();
      hourlyData[hour].calls++;
      hourlyData[hour].avgDuration += call.duration || 0;
      if (['completed', 'customer-ended-call'].includes(call.endedReason)) {
        hourlyData[hour].successRate++;
      }
    });

    return hourlyData.map((data, hour) => ({
      hour,
      calls: data.calls,
      avgDuration: data.calls > 0 ? data.avgDuration / data.calls : 0,
      successRate: data.calls > 0 ? (data.successRate / data.calls) * 100 : 0
    }));
  }

  function generateBenchmarks(calls: any[]) {
    const last30Days = calls.filter(call => {
      const callDate = new Date(call.createdAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return callDate >= thirtyDaysAgo;
    });

    const last7Days = calls.filter(call => {
      const callDate = new Date(call.createdAt);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return callDate >= sevenDaysAgo;
    });

    // No external industry baseline is available, so only this account's own figures are reported.
    return {
      currentPerformance: {
        avgDuration: last30Days.reduce((sum, call) => sum + (call.duration || 0), 0) / last30Days.length || 0,
        successRate: (last30Days.filter(call => ['completed', 'customer-ended-call'].includes(call.endedReason)).length / last30Days.length) * 100,
        costPerCall: last30Days.reduce((sum, call) => sum + (call.cost || 0), 0) / last30Days.length || 0
      },
      weekOverWeekChange: {
        callVolume: ((last7Days.length / 7) - (last30Days.length / 30)) / (last30Days.length / 30) * 100,
        avgDuration: 0, // Simplified for now
        successRate: 0  // Simplified for now
      }
    };
  }
}
