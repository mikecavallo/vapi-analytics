import type { Express } from "express";
import { authenticateUser, requireCustomerAccess, validateCustomerAccess } from "../auth-middleware";
import { HttpError, requireOpenAiKey, sendError } from "../http-error";
import { requireTenantKey } from "../providers/tenant";
import { getOwnedCalls } from "../providers/vapi-api";
import { conversationFlowSchema } from "./validation";

export function registerConversationFlowRoutes(app: Express): void {
  // Conversation Flow Analysis endpoint
  // Analyzes only calls that belong to the signed-in customer's own Vapi account.
  app.post("/api/conversation-flow/analyze", authenticateUser, requireCustomerAccess, validateCustomerAccess, async (req, res) => {
    try {
      const openaiApiKey = requireOpenAiKey();
      const { callIds, analysisType } = conversationFlowSchema.parse(req.body);
      const { key } = await requireTenantKey(req, "vapi");

      const calls = await getOwnedCalls(key, callIds);
      if (calls.length === 0) {
        throw new HttpError(404, "No valid calls found");
      }

      const openai = new (await import("openai")).default({ apiKey: openaiApiKey });
      const flowAnalysis = await analyzeConversationFlows(openai, calls, analysisType || "general");
      res.json(flowAnalysis);
    } catch (error) {
      sendError(res, error, "Failed to analyze conversation flows", "conversation-flow");
    }
  });

  async function analyzeConversationFlows(openai: any, calls: any[], analysisType: string) {
    // Extract conversation patterns and key moments
    const conversationPatterns = [];
    const healthcareKeywords = ['appointment', 'prescription', 'medication', 'symptoms', 'doctor', 'insurance', 'urgent', 'emergency', 'pain', 'schedule'];

    for (const call of calls) {
      if (!call.transcript) continue;

      const transcript = call.transcript.toLowerCase();
      const duration = call.duration || 0;
      const outcome = call.endedReason;

      // Detect healthcare conversation elements
      const detectedTopics = healthcareKeywords.filter(keyword => transcript.includes(keyword));
      const hasPersonalInfo = /\b\d{3}-\d{2}-\d{4}\b|\b\d{3}-\d{3}-\d{4}\b/.test(transcript);
      const conversationTurns = (transcript.match(/\n/g) || []).length + 1;

      // Analyze conversation structure
      const openingDetected = /hello|hi|good\s*(morning|afternoon|evening)|thank\s*you\s*for\s*calling/.test(transcript.slice(0, 200));
      const appointmentFlow = /appointment.*schedule|schedule.*appointment|book.*appointment/.test(transcript);
      const informationGathering = /name|phone|date.*birth|insurance|address/.test(transcript);
      const closingDetected = /goodbye|thank\s*you|have\s*a\s*(good|great|nice)\s*day|anything\s*else/.test(transcript.slice(-200));

      conversationPatterns.push({
        callId: call.id,
        duration,
        outcome,
        detectedTopics,
        hasPersonalInfo,
        conversationTurns,
        structure: {
          hasOpening: openingDetected,
          hasInformationGathering: informationGathering,
          hasAppointmentFlow: appointmentFlow,
          hasClosing: closingDetected
        },
        qualityMetrics: {
          completionScore: calculateCompletionScore(openingDetected, informationGathering, closingDetected),
          topicRelevance: detectedTopics.length / healthcareKeywords.length,
          conversationFlow: conversationTurns > 0 ? Math.min(conversationTurns / 10, 1) : 0
        }
      });
    }

    // Generate AI insights on conversation patterns
    const aiAnalysis = await generateConversationInsights(openai, conversationPatterns, analysisType);

    return {
      summary: {
        totalCallsAnalyzed: calls.length,
        avgConversationTurns: conversationPatterns.reduce((sum, p) => sum + p.conversationTurns, 0) / conversationPatterns.length,
        avgCompletionScore: conversationPatterns.reduce((sum, p) => sum + p.qualityMetrics.completionScore, 0) / conversationPatterns.length,
        healthcareTopicCoverage: conversationPatterns.reduce((sum, p) => sum + p.qualityMetrics.topicRelevance, 0) / conversationPatterns.length,
        structuralIntegrity: calculateStructuralIntegrity(conversationPatterns)
      },
      patterns: conversationPatterns,
      healthcareInsights: {
        appointmentFlowOptimization: analyzeAppointmentFlows(conversationPatterns),
        informationGatheringEfficiency: analyzeInformationGathering(conversationPatterns),
        complianceAdherence: analyzeComplianceAdherence(conversationPatterns),
        urgencyHandling: analyzeUrgencyHandling(conversationPatterns)
      },
      recommendations: aiAnalysis.recommendations,
      flowImprovements: aiAnalysis.flowImprovements,
      complianceFindings: aiAnalysis.complianceFindings
    };
  }

  async function generateConversationInsights(openai: any, patterns: any[], analysisType: string) {
    const summary = {
      totalCalls: patterns.length,
      avgTurns: patterns.reduce((sum, p) => sum + p.conversationTurns, 0) / patterns.length,
      topTopics: getTopTopics(patterns),
      structuralIssues: patterns.filter(p => p.qualityMetrics.completionScore < 0.7).length
    };

    const prompt = `As a healthcare conversation flow expert, analyze these voice AI conversation patterns and provide optimization recommendations.

Analysis Data:
- Total Conversations: ${summary.totalCalls}
- Average Conversation Turns: ${summary.avgTurns.toFixed(1)}
- Top Healthcare Topics: ${summary.topTopics.join(', ')}
- Conversations with Structural Issues: ${summary.structuralIssues}
- Analysis Type: ${analysisType}

Focus Areas:
1. Healthcare-specific conversation flows (appointment scheduling, symptom gathering, insurance verification)
2. HIPAA compliance in conversation handling
3. Efficiency improvements for common healthcare scenarios
4. Patient experience optimization

Generate professional insights in JSON format:
{
  "recommendations": [
    "Specific recommendations for improving conversation flows"
  ],
  "flowImprovements": [
    {
      "scenario": "Healthcare scenario (e.g., appointment booking, prescription refill)",
      "currentIssues": "Issues identified in current flow",
      "suggestedFlow": "Improved conversation flow steps",
      "expectedImpact": "Expected improvement outcome"
    }
  ],
  "complianceFindings": [
    {
      "area": "HIPAA/Privacy compliance area",
      "finding": "What was found in the analysis",
      "risk": "low|medium|high",
      "recommendation": "How to address this finding"
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }

  function calculateCompletionScore(hasOpening: boolean, hasInfoGathering: boolean, hasClosing: boolean): number {
    let score = 0;
    if (hasOpening) score += 0.3;
    if (hasInfoGathering) score += 0.4;
    if (hasClosing) score += 0.3;
    return score;
  }

  function calculateStructuralIntegrity(patterns: any[]): number {
    const wellStructured = patterns.filter(p =>
      p.structure.hasOpening && p.structure.hasClosing && p.qualityMetrics.completionScore > 0.7
    ).length;
    return wellStructured / patterns.length;
  }

  function getTopTopics(calls: any[]) {
    const topicCounts: Record<string, number> = {};
    calls.forEach(call => {
      const p = call.analysis || call.structuredData;
      if (p?.detectedTopics && Array.isArray(p.detectedTopics)) {
        p.detectedTopics.forEach((topic: string) => {
          topicCounts[topic] = (topicCounts[topic] || 0) + 1;
        });
      }
    });

    return Object.entries(topicCounts)
      .sort(([, a]: [string, any], [, b]: [string, any]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([topic]) => topic);
  }

  function analyzeAppointmentFlows(patterns: any[]): any {
    const appointmentCalls = patterns.filter(p => p.structure.hasAppointmentFlow);
    const successfulAppointments = appointmentCalls.filter(p =>
      ['completed', 'customer-ended-call'].includes(p.outcome)
    );

    return {
      totalAppointmentCalls: appointmentCalls.length,
      successRate: appointmentCalls.length > 0 ?
        (successfulAppointments.length / appointmentCalls.length) * 100 : 0,
      avgDuration: appointmentCalls.length > 0 ?
        appointmentCalls.reduce((sum, p) => sum + p.duration, 0) / appointmentCalls.length : 0,
      commonPatterns: appointmentCalls.length > 5 ?
        ["Schedule new appointment", "Reschedule existing", "Insurance verification"] :
        ["Insufficient data for pattern analysis"]
    };
  }

  function analyzeInformationGathering(patterns: any[]): any {
    const infoGatheringCalls = patterns.filter(p => p.structure.hasInformationGathering);

    return {
      efficiency: infoGatheringCalls.length / patterns.length,
      avgTurnsForInfo: infoGatheringCalls.length > 0 ?
        infoGatheringCalls.reduce((sum, p) => sum + p.conversationTurns, 0) / infoGatheringCalls.length : 0,
      privacyCompliance: infoGatheringCalls.filter(p => !p.hasPersonalInfo).length / Math.max(infoGatheringCalls.length, 1)
    };
  }

  function analyzeComplianceAdherence(patterns: any[]): any {
    const callsWithPersonalInfo = patterns.filter(p => p.hasPersonalInfo);
    const structuredCalls = patterns.filter(p => p.qualityMetrics.completionScore > 0.7);

    return {
      privacyScore: (patterns.length - callsWithPersonalInfo.length) / patterns.length * 100,
      structuralComplianceScore: structuredCalls.length / patterns.length * 100,
      riskCalls: patterns.filter(p =>
        p.hasPersonalInfo && p.qualityMetrics.completionScore < 0.5
      ).length
    };
  }

  function analyzeUrgencyHandling(patterns: any[]): any {
    const urgentKeywords = ['urgent', 'emergency', 'pain', 'severe', 'immediately'];
    const urgentCalls = patterns.filter(p =>
      urgentKeywords.some(keyword => p.detectedTopics.includes(keyword))
    );

    return {
      urgentCallsDetected: urgentCalls.length,
      urgentCallPercentage: (urgentCalls.length / patterns.length) * 100,
      avgResponseTime: urgentCalls.length > 0 ?
        urgentCalls.reduce((sum, p) => sum + p.duration, 0) / urgentCalls.length : 0,
      escalationNeeded: urgentCalls.filter(p =>
        p.duration > 300 || !['completed', 'customer-ended-call'].includes(p.outcome)
      ).length
    };
  }
}
