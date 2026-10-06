import type { Express } from "express";
import { authenticateUser, requireCustomerAccess, validateCustomerAccess } from "../auth-middleware";
import { HttpError, requireOpenAiKey, sendError } from "../http-error";
import { requireTenantKey } from "../providers/tenant";
import { getOwnedAssistant, getOwnedCalls, listCalls } from "../providers/vapi-api";
import { generateReportSchema, optimizePromptSchema } from "./validation";

// VoiceScope routes act only on the signed-in customer's own Vapi account (tenant key).
const customerOnly = [authenticateUser, requireCustomerAccess, validateCustomerAccess];

export function registerVoicescopeRoutes(app: Express): void {
  // AI prompt optimization over a few of the customer's own calls.
  app.post("/api/voicescope/optimize-prompt", ...customerOnly, async (req, res) => {
    try {
      const openaiApiKey = requireOpenAiKey();
      const { assistantId, currentPrompt, transcriptIds } = optimizePromptSchema.parse(req.body);
      const { key } = await requireTenantKey(req, "vapi");

      // Ownership: the assistant and every call must exist on this customer's Vapi account.
      if (!(await getOwnedAssistant(key, assistantId))) {
        throw new HttpError(404, "Assistant not found");
      }
      const calls = await getOwnedCalls(key, transcriptIds);
      const transcripts = calls.map((callData) => ({
        id: callData.id,
        transcript: callData.transcript || "",
        duration: callData.duration || 0,
        status: callData.status,
        endedReason: callData.endedReason,
      }));

      if (transcripts.length === 0) {
        throw new HttpError(404, "None of the requested calls were found on this workspace's Vapi account");
      }

      const openai = new (await import("openai")).default({ apiKey: openaiApiKey });

      const analysisPrompt = `As an AI conversation optimization expert, analyze these voice agent transcripts and current prompt to suggest improvements.

Current Assistant Prompt:
"""
${currentPrompt}
"""

Transcripts to analyze (${transcripts.length} calls):
${transcripts.map((t) => `
Call ${t.id} (Status: ${t.status}, Ended: ${t.endedReason}):
${t.transcript}
---`).join("\n")}

Please provide optimization suggestions in JSON format:
{
  "overallScore": "1-10 rating of current prompt effectiveness",
  "keyIssues": ["List of main problems identified"],
  "suggestions": [
    {
      "category": "timing|barge_in|transcription|flow|tone|clarity",
      "issue": "Specific problem found",
      "solution": "Concrete improvement suggestion",
      "priority": "high|medium|low",
      "promptUpdate": "Specific text to add/modify in prompt"
    }
  ],
  "improvedPrompt": "Complete rewritten prompt with improvements",
  "expectedImprovements": ["What should improve with these changes"]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: analysisPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const analysis = JSON.parse(response.choices[0].message.content || "{}");
      res.json({
        assistantId,
        analysis,
        transcriptsAnalyzed: transcripts.length,
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      sendError(res, error, "Failed to generate prompt optimization", "voicescope-optimize");
    }
  });

  // Report generation over the customer's own Vapi calls.
  app.post("/api/voicescope/generate-report", ...customerOnly, async (req, res) => {
    try {
      const openaiApiKey = requireOpenAiKey();
      const { reportType, dateRange, includeTranscripts, includeBenchmarks, customFilters } = generateReportSchema.parse(req.body);
      const { key } = await requireTenantKey(req, "vapi");

      const params: Record<string, string> = { limit: "1000" };
      if (dateRange?.from) params.createdAtGe = dateRange.from;
      if (dateRange?.to) params.createdAtLe = dateRange.to;
      if (customFilters?.assistantId) params.assistantId = customFilters.assistantId;
      let calls = await listCalls(key, params);
      if (customFilters?.status) {
        calls = calls.filter((call: any) => call.status === customFilters.status);
      }

      const analytics = await generateAdvancedAnalytics(calls, !!includeTranscripts);

      const openai = new (await import("openai")).default({ apiKey: openaiApiKey });
      const insights = await generateAIInsights(openai, analytics, calls, reportType);

      const report = {
        metadata: {
          title: getReportTitle(reportType),
          generatedAt: new Date().toISOString(),
          reportType,
          dateRange,
          totalCalls: calls.length,
          reportId: `RPT-${Date.now()}`,
          period: calculateReportPeriod(dateRange),
        },
        executiveSummary: insights.executiveSummary,
        keyMetrics: analytics.keyMetrics,
        detailedAnalysis: analytics.detailedAnalysis,
        callQuality: analytics.callQuality,
        performanceTrends: analytics.performanceTrends,
        recommendations: insights.recommendations,
        actionItems: insights.actionItems,
        appendices: {
          rawData: includeTranscripts ? calls.slice(0, 50) : [],
          benchmarkData: includeBenchmarks ? analytics.benchmarks : null,
          methodology: getAnalysisMethodology(),
        },
      };

      res.json(report);
    } catch (error) {
      sendError(res, error, "Failed to generate report", "voicescope-report");
    }
  });

  // Helper functions for report generation
  async function generateAdvancedAnalytics(calls: any[], includeTranscripts: boolean) {
    const totalCalls = calls.length;
    const successfulCalls = calls.filter(call =>
      ['completed', 'customer-ended-call'].includes(call.endedReason)
    ).length;

    const avgDuration = calls.reduce((sum, call) => sum + (call.duration || 0), 0) / totalCalls || 0;
    const totalCost = calls.reduce((sum, call) => sum + (call.cost || 0), 0);
    const avgCost = totalCost / totalCalls || 0;

    // Healthcare-specific metrics
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

    // Call outcome analysis
    const outcomes = calls.reduce((acc, call) => {
      const outcome = call.endedReason || 'unknown';
      acc[outcome] = (acc[outcome] || 0) + 1;
      return acc;
    }, {});

    // Time-based analysis
    const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => {
      const hourCalls = calls.filter(call => {
        const callHour = new Date(call.createdAt).getHours();
        return callHour === hour;
      });
      return {
        hour,
        calls: hourCalls.length,
        successRate: hourCalls.length > 0 ?
          (hourCalls.filter(call => ['completed', 'customer-ended-call'].includes(call.endedReason)).length / hourCalls.length) * 100 : 0
      };
    });

    // Assistant performance comparison
    const assistantPerformance: Record<string, { totalCalls: number; totalDuration: number; totalCost: number; successfulCalls: number; }> = {};

    calls.forEach(call => {
      const assistantId = call.assistantId || 'unknown';
      if (!assistantPerformance[assistantId]) {
        assistantPerformance[assistantId] = {
          totalCalls: 0,
          successfulCalls: 0,
          totalDuration: 0,
          totalCost: 0
        };
      }
      assistantPerformance[assistantId].totalCalls++;
      assistantPerformance[assistantId].totalDuration += call.duration || 0;
      assistantPerformance[assistantId].totalCost += call.cost || 0;
      if (['completed', 'customer-ended-call'].includes(call.endedReason)) {
        assistantPerformance[assistantId].successfulCalls++;
      }
    });

    return {
      keyMetrics: {
        totalCalls,
        successRate: (successfulCalls / totalCalls) * 100,
        avgDuration: Math.round(avgDuration),
        totalCost: totalCost.toFixed(2),
        avgCost: avgCost.toFixed(3),
        appointmentBookingRate: (appointmentCalls.length / totalCalls) * 100,
        urgentCallPercentage: (urgentCalls.length / totalCalls) * 100,
        prescriptionInquiryRate: (prescriptionCalls.length / totalCalls) * 100
      },
      detailedAnalysis: {
        callOutcomes: outcomes,
        hourlyDistribution,
        assistantPerformance: Object.entries(assistantPerformance).map(([id, stats]: [string, any]) => ({
          assistantId: id,
          totalCalls: stats.totalCalls,
          successRate: (stats.successfulCalls / stats.totalCalls) * 100,
          avgDuration: stats.totalDuration / stats.totalCalls,
          avgCost: stats.totalCost / stats.totalCalls,
          efficiency: (stats.successfulCalls / stats.totalCalls) * (60 / (stats.totalDuration / stats.totalCalls))
        }))
      },
      callQuality: {
        privacyMetrics: analyzePrivacyMetrics(calls),
        auditTrail: generateAuditTrail(calls.slice(0, 10)) // Recent calls for audit
      },
      performanceTrends: {
        dailyVolume: calculateDailyVolume(calls),
        successTrends: calculateSuccessTrends(calls),
        costTrends: calculateCostTrends(calls)
      },
      benchmarks: {
        // No external industry baseline is available, so only this account's own figures are reported.
        currentPerformance: {
          successRate: (successfulCalls / totalCalls) * 100,
          avgDuration,
          avgCost
        }
      }
    };
  }

  async function generateAIInsights(openai: any, analytics: any, calls: any[], reportType: string) {
    const prompt = `As a healthcare voice AI analytics expert, analyze this data and provide professional insights for a ${reportType} report.

Analytics Data:
- Total Calls: ${analytics.keyMetrics.totalCalls}
- Success Rate: ${analytics.keyMetrics.successRate.toFixed(1)}%
- Average Duration: ${analytics.keyMetrics.avgDuration} seconds
- Total Cost: $${analytics.keyMetrics.totalCost}
- Healthcare Metrics: ${analytics.keyMetrics.appointmentBookingRate.toFixed(1)}% appointment bookings, ${analytics.keyMetrics.urgentCallPercentage.toFixed(1)}% urgent calls

Generate a professional analysis in JSON format:
{
  "executiveSummary": "2-3 paragraph executive summary highlighting key findings and business impact",
  "recommendations": [
    "Specific, actionable recommendations for improvement"
  ],
  "actionItems": [
    {
      "priority": "high|medium|low",
      "action": "Specific action to take",
      "timeline": "Suggested timeframe",
      "expectedImpact": "What this will achieve"
    }
  ],
  "keyInsights": [
    "Notable patterns or insights from the data"
  ],
  "riskAssessment": "Assessment of any compliance or performance risks"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }

  function analyzePrivacyMetrics(calls: any[]) {
    return {
      callsWithPersonalInfo: calls.filter(call =>
        call.transcript?.match(/\b\d{3}-\d{2}-\d{4}\b|\b\d{3}-\d{3}-\d{4}\b/g)
      ).length,
      averageCallDuration: calls.reduce((sum, call) => sum + (call.duration || 0), 0) / calls.length || 0
    };
  }

  function generateAuditTrail(calls: any[]) {
    return calls.map(call => ({
      callId: call.id,
      timestamp: call.createdAt,
      assistantId: call.assistantId,
      duration: call.duration,
      outcome: call.endedReason,
      complianceFlags: call.status === 'failed' ? ['CALL_FAILED'] : []
    }));
  }

  function calculateDailyVolume(calls: any[]) {
    const dailyData: Record<string, number> = {};
    calls.forEach(call => {
      const date = new Date(call.createdAt).toISOString().split('T')[0];
      dailyData[date] = (dailyData[date] || 0) + 1;
    });
    return Object.entries(dailyData).map(([date, count]) => ({ date, calls: count }));
  }

  function calculateSuccessTrends(calls: any[]) {
    const dailySuccess: Record<string, { total: number; successful: number; }> = {};
    calls.forEach(call => {
      const date = new Date(call.createdAt).toISOString().split('T')[0];
      if (!dailySuccess[date]) {
        dailySuccess[date] = { total: 0, successful: 0 };
      }
      dailySuccess[date].total++;
      if (['completed', 'customer-ended-call'].includes(call.endedReason)) {
        dailySuccess[date].successful++;
      }
    });
    return Object.entries(dailySuccess).map(([date, data]: [string, any]) => ({
      date,
      successRate: (data.successful / data.total) * 100
    }));
  }

  function calculateCostTrends(calls: any[]) {
    const dailyCosts: Record<string, number> = {};
    calls.forEach(call => {
      const date = new Date(call.createdAt).toISOString().split('T')[0];
      dailyCosts[date] = (dailyCosts[date] || 0) + (call.cost || 0);
    });
    return Object.entries(dailyCosts).map(([date, cost]) => ({ date, cost }));
  }

  function getReportTitle(reportType: string): string {
    const titles: Record<string, string> = {
      'executive': 'Executive Analytics Summary',
      'detailed': 'Detailed Analytics Report',
      'compliance': 'Healthcare Compliance Report',
      'performance': 'Performance Benchmarks Report'
    };
    return titles[reportType] || 'Voice Analytics Report';
  }

  function calculateReportPeriod(dateRange: any): string {
    if (!dateRange?.from && !dateRange?.to) return 'All Time';
    if (dateRange.from && dateRange.to) {
      return `${new Date(dateRange.from).toLocaleDateString()} - ${new Date(dateRange.to).toLocaleDateString()}`;
    }
    if (dateRange.from) return `From ${new Date(dateRange.from).toLocaleDateString()}`;
    if (dateRange.to) return `Until ${new Date(dateRange.to).toLocaleDateString()}`;
    return 'Custom Period';
  }

  function getAnalysisMethodology(): any {
    return {
      dataCollection: "Voice call data collected through Vapi platform API",
      analysisFramework: "Aggregates computed from the account's call records; narrative sections generated by OpenAI",
      limitations: "Keyword-based topic detection; AI-generated text is not reviewed by a person and is not a compliance assessment",
      reportingPeriod: "Calls returned by the Vapi API for the requested date range (up to 1,000)"
    };
  }
}
