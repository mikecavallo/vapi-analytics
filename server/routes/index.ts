import type { Express } from "express";
import { createServer, type Server } from "http";
import { apiRateLimit } from "../auth-middleware";
import { registerAuthRoutes } from "./auth";
import { registerCustomerRoutes } from "./customer";
import { registerAdminRoutes } from "./admin";
import { registerAnalyticsRoutes } from "./analytics";
import { registerCallRoutes } from "./calls";
import { registerBulkAnalysisRoutes } from "./bulk-analysis";
import { registerVoicescopeRoutes } from "./voicescope";
import { registerBenchmarkRoutes } from "./benchmarks";
import { registerAssistantRoutes } from "./assistants";
import { registerConversationFlowRoutes } from "./conversation-flow";
import { registerChatbotRoutes } from "./chatbot";
import { registerFacebookAdsRoutes } from "./facebook-ads";
import { registerFeatureRoutes } from "./features";

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply general API rate limiting to protected endpoint groups
  app.use('/api/analytics', apiRateLimit);
  app.use('/api/bulk-analysis', apiRateLimit);
  app.use('/api/voicescope', apiRateLimit);
  app.use('/api/assistant-studio', apiRateLimit);
  app.use('/api/conversation-flow', apiRateLimit);
  app.use('/api/assistants', apiRateLimit);
  app.use('/api/chatbot', apiRateLimit);
  app.use('/api/performance-benchmarks', apiRateLimit);
  app.use('/api/facebook-ads', apiRateLimit);

  registerFeatureRoutes(app);
  registerAuthRoutes(app);
  registerCustomerRoutes(app);
  registerAdminRoutes(app);
  registerAnalyticsRoutes(app);
  registerCallRoutes(app);
  registerBulkAnalysisRoutes(app);
  registerVoicescopeRoutes(app);
  registerBenchmarkRoutes(app);
  registerAssistantRoutes(app);
  registerConversationFlowRoutes(app);
  registerChatbotRoutes(app);
  registerFacebookAdsRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
