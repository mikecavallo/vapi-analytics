import type { Express } from "express";
import { authenticateUser } from "../auth-middleware";
import { auditLog, MAX_PROMPT_LENGTH } from "./shared";

export function registerChatbotRoutes(app: Express): void {
  // AI Chatbot endpoint
  app.post("/api/chatbot/query", authenticateUser, async (req, res) => {
    try {
      const { query, dashboardData } = req.body;
      const openaiApiKey = process.env.OPENAI_API_KEY;

      if (!openaiApiKey) {
        return res.status(500).json({ error: "OpenAI API key not configured" });
      }

      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        return res.status(400).json({ error: "Query is required" });
      }

      if (query.length > MAX_PROMPT_LENGTH) {
        return res.status(400).json({ error: `Query exceeds maximum length of ${MAX_PROMPT_LENGTH} characters` });
      }

      auditLog('CHATBOT_QUERY', req.user?.id, { query: query.substring(0, 100) });

      // Truncate dashboard data to a reasonable size for context
      const truncatedData = dashboardData ? JSON.stringify(dashboardData).substring(0, 8000) : '{}';

      const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `You are an expert dashboard analytics assistant for a voice AI call analytics platform.

You help users understand their call data by answering questions about:
- Call volumes, success rates, and trends
- Cost analysis and optimization opportunities
- Call duration patterns and distributions
- Outcome breakdowns and end reasons
- Assistant/agent performance comparisons
- Peak usage times and hourly patterns
- Sentiment analysis and customer satisfaction

You have access to the user's current dashboard data. Provide specific, data-driven answers based on what you see.
Be concise but helpful. Use actual numbers from the data when available.
If the data doesn't contain the information needed to answer, say so honestly and suggest what data might help.`
            },
            {
              role: "user",
              content: `Dashboard data context: ${truncatedData}

User question: ${query}`
            }
          ],
          max_tokens: 500,
          temperature: 0.3,
        }),
      });

      if (!openaiResponse.ok) {
        const errorData = await openaiResponse.text();
        console.error("OpenAI API error:", openaiResponse.status, errorData);
        throw new Error(`OpenAI request failed`);
      }

      const openaiResult = await openaiResponse.json();
      const response = openaiResult.choices[0].message.content;

      res.json({ response });

    } catch (error) {
      console.error("Chatbot query error:", error);
      res.status(500).json({
        error: "Failed to generate response. Please try again."
      });
    }
  });

  // Facebook Ads API Routes
}
