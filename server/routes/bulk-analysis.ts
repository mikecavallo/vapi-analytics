import type { Express } from "express";
import { storage } from "../storage";
import { normalizeProvider, usesDemoData } from "../providers/source";
import { authenticateUser, requireCustomerAccess, validateCustomerAccess } from "../auth-middleware";
import { auditLog } from "./shared";
import { HttpError, requireOpenAiKey, sendError } from "../http-error";
import { requireTenantKey } from "../providers/tenant";
import { getOwnedCalls } from "../providers/vapi-api";
import { bulkAnalyzeSchema } from "./validation";
import { fetchCallsWithFilters, fetchRetellCallsWithFilters } from "../providers/calls";

export function registerBulkAnalysisRoutes(app: Express): void {
  // Bulk analysis endpoint - fetch calls with query parameter filters
  app.get("/api/bulk-analysis/calls", authenticateUser, requireCustomerAccess, validateCustomerAccess, async (req, res) => {
    try {
      const customerId = req.customerId;
      if (!customerId) {
        return res.status(400).json({ error: "Customer ID required" });
      }

      const provider = (req.query.provider as string) || 'vapi';

      // Get customer data to retrieve their API key
      const customer = await storage.getCustomer(customerId);

      // Extract query parameters - only use supported API parameters
      const allowedParams = ['id', 'assistantId', 'phoneNumberId', 'squadId', 'limit', 'createdAtGt', 'createdAtLt', 'createdAtGe', 'createdAtLe', 'updatedAtGt', 'updatedAtLt', 'updatedAtGe', 'updatedAtLe'];
      const queryParams: Record<string, string> = {};

      allowedParams.forEach(param => {
        if (req.query[param]) {
          queryParams[param] = req.query[param] as string;
        }
      });

      // Ensure a reasonable default limit if not provided
      if (!queryParams.limit) {
        queryParams.limit = '500';
      }

      // Validate limit is within allowed range
      const limit = parseInt(queryParams.limit);
      if (limit > 1000) {
        return res.status(400).json({
          error: "Limit too high",
          message: "Maximum limit is 1000 calls per request"
        });
      }

      let calls: any[];

      if (usesDemoData(customer, normalizeProvider(provider))) {
        calls = await storage.getDemoCalls(customerId, normalizeProvider(provider), {
          start: queryParams.createdAtGe || queryParams.createdAtGt,
          end: queryParams.createdAtLe || queryParams.createdAtLt,
          limit,
        });
        if (queryParams.assistantId) {
          calls = calls.filter(call => call.assistantId === queryParams.assistantId);
        }
      } else if (provider === 'retell') {
        if (!customer || !customer.retellApiKey) {
          return res.status(400).json({
            error: "Retell API key not configured. Go to Settings to add it.", code: "PROVIDER_KEY_MISSING"
          });
        }
        calls = await fetchRetellCallsWithFilters(queryParams, customer.retellApiKey);
      } else {
        if (!customer || !customer.vapiApiKey) {
          return res.status(400).json({
            error: "Vapi API key not configured. Go to Settings to add it.", code: "PROVIDER_KEY_MISSING"
          });
        }
        // Map squadId to phoneNumberId for Vapi API compatibility
        if (req.query.squadId) {
          queryParams['phoneNumberId'] = req.query.squadId as string;
          delete queryParams['squadId'];
        }
        calls = await fetchCallsWithFilters(queryParams, customer.vapiApiKey);
      }

      console.log(`[${new Date().toLocaleTimeString()}] Serving ${calls.length} calls with filters:`, queryParams);
      res.json(calls);
    } catch (error: any) {
      console.error("Error fetching calls with filters:", error);
      res.status(500).json({ error: error.message || "Failed to fetch calls" });
    }
  });

  app.post("/api/bulk-analysis/analyze", authenticateUser, requireCustomerAccess, validateCustomerAccess, async (req, res) => {
    try {
      const openaiApiKey = requireOpenAiKey();
      const body = bulkAnalyzeSchema.parse(req.body);
      const filters = body.filters;
      // The Studio UI sends the question as `analysisType`; older clients send `query`.
      const query = (body.query ?? body.analysisType ?? "").trim();

      const customerId = req.customerId;
      if (!customerId) {
        return res.status(400).json({ error: "Customer ID required" });
      }

      auditLog('BULK_ANALYSIS_REQUEST', req.user?.id, { customerId, callCount: body.calls?.length || body.callIds?.length || 0, query: query.substring(0, 100) });

      let transcripts: any[];
      const MAX_ANALYSIS_CALLS = 50;

      if (body.calls && body.calls.length > 0) {
        // Call data the client already loaded through /api/bulk-analysis/calls (Vapi, Retell or demo).
        transcripts = body.calls.slice(0, MAX_ANALYSIS_CALLS);
      } else if (body.callIds && body.callIds.length > 0) {
        // Fetch by ID with the customer's own Vapi key; IDs not on that account are dropped.
        const { key } = await requireTenantKey(req, "vapi");
        const calls = await getOwnedCalls(key, body.callIds.slice(0, MAX_ANALYSIS_CALLS));
        transcripts = calls.map((callData: any) => ({
          id: callData.id,
          transcript: callData.transcript || "",
          duration: callData.duration || 0,
          cost: callData.cost || 0,
          endedReason: callData.endedReason,
          status: callData.status,
        }));
        if (transcripts.length === 0) {
          throw new HttpError(404, "None of the requested calls were found on this workspace's Vapi account");
        }
      } else {
        return res.status(400).json({ error: "No call data or call IDs provided" });
      }

      // Prepare data for OpenAI analysis
      const analysisContext = {
        totalCalls: transcripts.length,
        transcripts: transcripts.map((t: any) => ({
          id: t.id,
          text: (t.transcript || "").substring(0, 2000),
          duration: t.duration || 0,
          cost: t.cost || 0,
          outcome: t.endedReason || t.status
        })),
        filters: filters
      };

      // Call OpenAI for analysis
      const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4", // Using GPT-4 for analysis
          messages: [
            {
              role: "system",
              content: `You are an expert call analytics assistant analyzing voice AI call transcripts. 
              
              Analyze the provided call transcripts data and answer questions about:
              - Agent performance patterns and behaviors
              - Customer satisfaction and sentiment
              - Conversation flow and bottlenecks  
              - Transcription quality issues
              - Success/failure patterns
              - Common topics and themes
              
              Provide specific, actionable insights based on the actual transcript data. 
              Be concise but thorough, and support findings with specific examples when possible.`
            },
            {
              role: "user",
              content: `Analyze this call transcript dataset and answer: "${query}"
              
              Dataset: ${JSON.stringify(analysisContext, null, 2)}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.1,
        }),
      });

      if (!openaiResponse.ok) {
        const errorData = await openaiResponse.text();
        console.error("OpenAI API error:", openaiResponse.status, errorData.slice(0, 500));
        throw new HttpError(502, "The AI analysis request failed. Please try again.");
      }

      const openaiResult = await openaiResponse.json();
      const analysis = openaiResult.choices[0].message.content;

      res.json({
        analysis,
        analysisType: "transcript_analysis",
        datasetSize: transcripts.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      sendError(res, error, "Analysis failed", "bulk-analysis");
    }
  });
}
