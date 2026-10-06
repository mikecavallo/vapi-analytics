import type { Express } from "express";
import { storage } from "../storage";
import { VapiClient } from "@vapi-ai/server-sdk";
import { normalizeProvider, usesDemoData } from "../providers/source";
import { authenticateUser, requireCustomerAccess, validateCustomerAccess } from "../auth-middleware";
import { fetchRetellCallsWithFilters } from "../providers/calls";

export function registerCallRoutes(app: Express): void {
  // Get recent calls
  app.get("/api/calls/recent", authenticateUser, requireCustomerAccess, validateCustomerAccess, async (req, res) => {
    try {
      const customerId = req.customerId;
      const provider = req.query.provider as string || "vapi";

      if (!customerId) {
        return res.status(400).json({ error: "Customer ID required" });
      }

      const customer = await storage.getCustomer(customerId);

      if (usesDemoData(customer, normalizeProvider(provider))) {
        return res.json(await storage.getDemoCalls(customerId, normalizeProvider(provider), { limit: 20 }));
      }

      if (provider === 'retell') {
        if (!customer || !customer.retellApiKey) {
          return res.status(500).json({
            error: "Customer Retell API key not configured. Contact support."
          });
        }

        try {
          const retellCalls = await fetchRetellCallsWithFilters({ limit: "20" }, customer.retellApiKey);
          return res.json(retellCalls);
        } catch (error: any) {
          return res.status(500).json({ error: `Retell API error: ${error.message}` });
        }
      } else {

        if (!customer || !customer.vapiApiKey) {
          return res.status(500).json({
            error: "Customer Vapi API key not configured. Contact support."
          });
        }

        const response = await fetch("https://api.vapi.ai/call?limit=20", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${customer.vapiApiKey}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          return res.status(response.status).json({
            error: `Vapi API error: ${errorText}`
          });
        }

        const callsData = await response.json();
        res.json(callsData);
      }
    } catch (error) {
      console.error("Recent calls API error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Internal server error"
      });
    }
  });

  // Get individual call details
  app.get("/api/calls/:id", authenticateUser, requireCustomerAccess, validateCustomerAccess, async (req, res) => {
    try {
      const { id } = req.params;
      const customerId = req.customerId;

      if (!customerId) {
        return res.status(400).json({ error: "Customer ID required" });
      }

      // Get customer data to retrieve their specific Vapi API key
      const customer = await storage.getCustomer(customerId);

      if (usesDemoData(customer, "vapi")) {
        const demoCall = await storage.getDemoCall(customerId, id);
        if (!demoCall) {
          return res.status(404).json({ error: "Call not found" });
        }
        return res.json(demoCall);
      }
      if (!customer || !customer.vapiApiKey) {
        return res.status(500).json({
          error: "Customer Vapi API key not configured. Contact support."
        });
      }

      // Use Vapi SDK to get call details including recording URL
      const client = new VapiClient({ token: customer.vapiApiKey });
      const callData = await client.calls.get(id);

      // Calculate duration in seconds and return enriched response
      const rawCallData = callData as Record<string, unknown>;
      let duration: number | undefined;
      if (callData.endedAt && callData.startedAt) {
        duration = Math.round(
          (new Date(callData.endedAt).getTime() - new Date(callData.startedAt).getTime()) / 1000
        );
      } else if (typeof rawCallData.duration === 'number') {
        // Convert Vapi duration from minutes to seconds
        duration = Math.round(rawCallData.duration * 60 * 100) / 100;
      }

      res.json({ ...callData, duration });
    } catch (error) {
      console.error("Call details API error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Internal server error"
      });
    }
  });
}
