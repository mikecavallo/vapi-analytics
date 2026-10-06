import type { Express } from "express";
import { authenticateUser } from "../auth-middleware";
import { isDemoMode } from "../providers/source";

/** Which optional integrations this server has configured, so the UI can explain disabled features. */
export function getFeatureFlags() {
  return {
    openai: !!process.env.OPENAI_API_KEY,
    // Facebook credentials can also be entered per workspace; this only reports the server-wide app secret.
    facebookAppSecret: !!process.env.FACEBOOK_APP_SECRET,
    demoMode: isDemoMode(),
  };
}

export function registerFeatureRoutes(app: Express): void {
  app.get("/api/features", authenticateUser, (_req, res) => {
    res.json(getFeatureFlags());
  });
}
