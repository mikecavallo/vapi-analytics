import type { Express } from "express";
import { storage } from "../storage";
import { authenticateUser, requireCustomerAccess, validateCustomerAccess } from "../auth-middleware";
import { auditLog, MAX_PROMPT_LENGTH } from "./shared";
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

      if (provider === 'retell') {
        if (!customer || !customer.retellApiKey) {
          return res.status(500).json({
            error: "Retell API key not configured. Go to Settings to add it."
          });
        }
        calls = await fetchRetellCallsWithFilters(queryParams, customer.retellApiKey);
      } else {
        if (!customer || !customer.vapiApiKey) {
          return res.status(500).json({
            error: "Vapi API key not configured. Go to Settings to add it."
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
      const { query, filters, callIds, calls: providedCalls } = req.body;
      const openaiApiKey = process.env.OPENAI_API_KEY;

      if (!openaiApiKey) {
        return res.status(500).json({ error: "OpenAI API key not configured" });
      }

      const customerId = req.customerId;
      if (!customerId) {
        return res.status(400).json({ error: "Customer ID required" });
      }

      if (query && typeof query === 'string' && query.length > MAX_PROMPT_LENGTH) {
        return res.status(400).json({ error: `Query exceeds maximum length of ${MAX_PROMPT_LENGTH} characters` });
      }

      auditLog('BULK_ANALYSIS_REQUEST', req.user?.id, { customerId, callCount: callIds?.length || providedCalls?.length || 0, query: query?.substring(0, 100) });

      let transcripts: any[];

      const MAX_ANALYSIS_CALLS = 50;

      if (providedCalls && Array.isArray(providedCalls) && providedCalls.length > 0) {
        // Use call data sent directly from the client (works for both Vapi and Retell)
        transcripts = providedCalls.slice(0, MAX_ANALYSIS_CALLS);
      } else if (callIds && Array.isArray(callIds) && callIds.length > 0) {
        // Fallback: fetch from Vapi for backwards compatibility
        const customer = await storage.getCustomer(customerId);
        if (!customer || !customer.vapiApiKey) {
          return res.status(500).json({ error: "API key not configured. Contact support." });
        }

        const transcriptPromises = callIds.slice(0, MAX_ANALYSIS_CALLS).map(async (callId: string) => {
          try {
            const response = await fetch(`https://api.vapi.ai/call/${callId}`, {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${customer.vapiApiKey}`,
                "Content-Type": "application/json",
              },
            });

            if (response.ok) {
              const callData = await response.json();
              return {
                id: callId,
                transcript: callData.transcript || "",
                duration: callData.duration || 0,
                cost: callData.cost || 0,
                endedReason: callData.endedReason,
                status: callData.status
              };
            }
          } catch (error) {
            console.error(`Failed to fetch call ${callId}:`, error);
          }
          return null;
        });

        transcripts = (await Promise.all(transcriptPromises)).filter(Boolean);
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
        console.error("OpenAI API error:", openaiResponse.status, errorData);
        throw new Error(`OpenAI analysis failed: ${openaiResponse.status} - ${errorData}`);
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
      console.error("Analysis error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Analysis failed"
      });
    }
  });
}
