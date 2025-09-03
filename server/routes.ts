import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { vapiAnalyticsQuerySchema, type VapiAnalyticsQuery, type DashboardData, insertCompanySchema, type CompanyMetrics } from "@shared/schema";
import { z } from "zod";
import { VapiClient } from "@vapi-ai/server-sdk";

// Function to fetch calls from Vapi API with proper query parameters
async function fetchCallsWithFilters(queryParams: Record<string, string>): Promise<any[]> {
  const vapiApiKey = process.env.VAPI_API_KEY || process.env.VAPI_TOKEN || "";
  
  if (!vapiApiKey) {
    throw new Error("Vapi API key not configured");
  }

  try {
    console.log(`[${new Date().toLocaleTimeString()}] Fetching calls with filters:`, queryParams);
    
    // Create an abort controller for timeout - 30 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const requestHeaders = {
      "Authorization": `Bearer ${vapiApiKey}`,
      "Content-Type": "application/json",
    };

    // Build URL with the provided query parameters
    const url = new URL("https://api.vapi.ai/call");
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value) {
        url.searchParams.append(key, value);
      }
    });

    console.log(`Making API request to: ${url.toString()}`);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: requestHeaders,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Failed to fetch calls: ${response.status} ${response.statusText}`);
      if (response.status === 401 || response.status === 403) {
        throw new Error("Invalid API key or insufficient permissions");
      }
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    const callsData = await response.json();
    const calls = Array.isArray(callsData) ? callsData : (callsData.data || []);
    
    // Process calls and add missing fields for filtering compatibility
    const processedCalls = calls.map(call => ({
      ...call,
      assistantName: call.assistant?.name || null,
      customerPhoneNumber: call.customer?.number || call.phoneNumberE164 || null,
      assistantPhoneNumber: call.assistant?.phoneNumber || call.phoneNumber || null,
      // Ensure duration is in seconds (Vapi provides in minutes)
      duration: call.duration ? Math.round(call.duration * 60) : 
               (call.endedAt && call.startedAt) 
                 ? Math.round((new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime()) / 1000)
                 : 0,
      // Normalize type field for filtering
      type: call.type === 'inboundPhoneCall' ? 'inbound' : 'outbound',
      // Ensure we have the transcript field
      transcript: call.transcript || "",
      // Add any missing cost field
      cost: call.cost || 0,
      // Ensure createdAt field exists
      createdAt: call.createdAt || call.startedAt,
    }));
    
    console.log(`Successfully fetched ${processedCalls.length} calls`);
    return processedCalls;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error("Request timeout - Vapi API took too long to respond");
    } else if (error.cause?.code === 'UND_ERR_SOCKET') {
      throw new Error("Network connection error with Vapi API");
    } else {
      throw error;
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Agency management endpoints
  app.get("/api/agency/companies", async (req, res) => {
    try {
      const companies = await storage.getCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ error: "Failed to fetch companies" });
    }
  });

  app.post("/api/agency/companies", async (req, res) => {
    try {
      const validatedData = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(validatedData);
      res.status(201).json(company);
    } catch (error) {
      console.error("Error creating company:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid company data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create company" });
    }
  });

  app.delete("/api/agency/companies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid company ID" });
      }

      const company = await storage.getCompany(id);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }

      await storage.deleteCompany(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting company:", error);
      res.status(500).json({ error: "Failed to delete company" });
    }
  });

  app.get("/api/agency/metrics", async (req, res) => {
    try {
      const companies = await storage.getCompanies();

      // Fetch metrics for each company in parallel
      const metricsPromises = companies.map(async (company) => {
        try {
          const companyMetrics = await fetchCompanyMetrics(company.apiKey);
          return {
            companyId: company.id,
            ...companyMetrics,
          };
        } catch (error) {
          console.error(`Error fetching metrics for company ${company.id}:`, error);
          // Return default metrics for failed companies
          return {
            companyId: company.id,
            totalCalls: 0,
            totalCost: 0,
            callOutcomes: [],
            callVolumeData: [],
          };
        }
      });

      const allMetrics = await Promise.all(metricsPromises);
      res.json(allMetrics);
    } catch (error) {
      console.error("Error fetching agency metrics:", error);
      res.status(500).json({ error: "Failed to fetch agency metrics" });
    }
  });

  app.get("/api/agency/export", async (req, res) => {
    try {
      const companies = await storage.getCompanies();
      
      // Generate CSV data for all companies
      const csvHeader = "Company Name,Total Calls,Total Cost,Success Rate,API Key\n";
      const csvRows = await Promise.all(
        companies.map(async (company) => {
          try {
            const metrics = await fetchCompanyMetrics(company.apiKey);
            const successRate = metrics.callOutcomes.find(o => o.outcome === 'completed')?.percentage || 0;
            const maskedApiKey = company.apiKey.slice(0, 8) + "...";
            return `"${company.name}",${metrics.totalCalls},${metrics.totalCost},${successRate}%,"${maskedApiKey}"`;
          } catch (error) {
            return `"${company.name}",0,0,0%,"Error fetching data"`;
          }
        })
      );

      const csvContent = csvHeader + csvRows.join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=agency-report-${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csvContent);
    } catch (error) {
      console.error("Error generating export:", error);
      res.status(500).json({ error: "Failed to generate export" });
    }
  });

  // Helper function to fetch metrics for a company using their API key
  async function fetchCompanyMetrics(apiKey: string): Promise<Omit<CompanyMetrics, 'companyId'>> {
    try {
      // Get last 30 days data
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      // Fetch calls from Vapi API for this company
      const queryParams = {
        createdAtGt: startDate.toISOString(),
        createdAtLt: endDate.toISOString(),
        limit: "1000",
      };

      const response = await fetch(`https://api.vapi.ai/call?${new URLSearchParams(queryParams)}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      const callsData = await response.json();
      const calls = Array.isArray(callsData) ? callsData : (callsData.data || []);

      // Calculate metrics
      const totalCalls = calls.length;
      const totalCost = calls.reduce((sum: number, call: any) => sum + (call.cost || 0), 0);

      // Call outcomes
      const outcomeCount = calls.reduce((acc: Record<string, number>, call: any) => {
        const outcome = call.status || 'unknown';
        acc[outcome] = (acc[outcome] || 0) + 1;
        return acc;
      }, {});

      const callOutcomes = Object.entries(outcomeCount).map(([outcome, count]) => ({
        outcome,
        count: count as number,
        percentage: Math.round(((count as number) / totalCalls) * 100),
      }));

      // Call volume data for last 30 days
      const callVolumeData = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        const dayCallsCount = calls.filter((call: any) => {
          const callDate = new Date(call.createdAt || call.startedAt).toISOString().split('T')[0];
          return callDate === dateString;
        }).length;

        callVolumeData.push({
          date: dateString,
          calls: dayCallsCount,
        });
      }

      return {
        totalCalls,
        totalCost: Math.round(totalCost * 100) / 100,
        callOutcomes,
        callVolumeData,
      };
    } catch (error) {
      console.error("Error fetching company metrics:", error);
      // Return default metrics on error
      return {
        totalCalls: 0,
        totalCost: 0,
        callOutcomes: [],
        callVolumeData: [],
      };
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}