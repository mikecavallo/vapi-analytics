import type { Express } from "express";
import { storage } from "../storage";
import { facebookAdsService } from "../services/facebook-ads";
import { authenticateUser } from "../auth-middleware";

/** Public view of a stored Facebook Ads account: no tokens, app IDs or secrets (encrypted or not). */
function toPublicFacebookAccount(account: any) {
  if (!account) return account;
  return {
    id: account.id,
    adAccountId: account.adAccountId,
    accountName: account.accountName,
    isActive: account.isActive,
    lastValidatedAt: account.lastValidatedAt,
  };
}

export function registerFacebookAdsRoutes(app: Express): void {
  // Validate and save Facebook credentials (access token, app ID, app secret)
  app.post("/api/facebook-ads/setup", authenticateUser, async (req, res) => {
    try {
      const { accessToken, appId, appSecret, adAccountId, accountName } = req.body;

      if (!accessToken) {
        return res.status(400).json({ error: "Access token is required" });
      }

      // Validate the access token with Facebook (pass appSecret for appsecret_proof)
      const validation = await facebookAdsService.validateAccessToken(accessToken, appSecret);

      if (!validation.isValid) {
        return res.status(400).json({
          error: validation.error || "Invalid access token",
          accounts: validation.accounts
        });
      }

      // Get customer ID from authenticated user
      const userId = req.user!.id;
      const userCustomerAssignments = await storage.getUserCustomerAssignments(userId);

      if (userCustomerAssignments.length === 0) {
        return res.status(403).json({ error: "No customer assigned to user" });
      }

      const customerId = userCustomerAssignments[0].customerId;

      // Check if Facebook Ads account already exists for this customer
      const existingAccount = await storage.getFacebookAdsAccount(customerId);

      if (existingAccount) {
        // Update existing account
        const updatedAccount = await storage.updateFacebookAdsAccount(existingAccount.id, {
          accessToken,
          appId: appId || undefined,
          appSecret: appSecret || undefined,
          adAccountId: adAccountId || validation.adAccountId!,
          accountName: accountName || validation.accountName!,
          isActive: true,
        });

        res.json({
          success: true,
          account: toPublicFacebookAccount(updatedAccount),
          message: "Facebook Ads account updated successfully"
        });
      } else {
        // Create new account
        const newAccount = await storage.createFacebookAdsAccount({
          customerId,
          accessToken,
          appId: appId || undefined,
          appSecret: appSecret || undefined,
          encryptedAccessToken: '', // Will be set by storage layer
          adAccountId: adAccountId || validation.adAccountId!,
          accountName: accountName || validation.accountName!,
        });

        res.json({
          success: true,
          account: toPublicFacebookAccount(newAccount),
          message: "Facebook Ads account connected successfully"
        });
      }

    } catch (error) {
      console.error("Facebook Ads setup error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to setup Facebook Ads integration"
      });
    }
  });

  // Get Facebook Ads account status
  app.get("/api/facebook-ads/status", authenticateUser, async (req, res) => {
    try {
      const userId = req.user!.id;
      let userCustomerAssignments = await storage.getUserCustomerAssignments(userId);

      // If user has no customer assignments, create one automatically (for existing users)
      if (userCustomerAssignments.length === 0) {
        console.log(`User ${userId} has no customer assignments, creating one automatically...`);
        const result = await storage.ensureUserHasCustomerAssignment(userId);
        if (result) {
          console.log(`Created customer ${result.customer.id} and assignment for user ${userId}`);
          // Refetch assignments after creating
          userCustomerAssignments = await storage.getUserCustomerAssignments(userId);
        } else {
          return res.status(500).json({ error: "Failed to create customer assignment" });
        }
      }

      const customerId = userCustomerAssignments[0].customerId;
      const account = await storage.getFacebookAdsAccount(customerId);

      if (!account) {
        return res.json({
          connected: false,
          message: "No Facebook Ads account connected"
        });
      }

      res.json({
        connected: true,
        account: {
          id: account.id,
          adAccountId: account.adAccountId,
          accountName: account.accountName,
          isActive: account.isActive,
          lastValidatedAt: account.lastValidatedAt,
        }
      });

    } catch (error) {
      console.error("Facebook Ads status error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to get Facebook Ads status"
      });
    }
  });

  // Get Facebook Ads campaigns
  app.get("/api/facebook-ads/campaigns", authenticateUser, async (req, res) => {
    try {
      const userId = req.user!.id;
      const userCustomerAssignments = await storage.getUserCustomerAssignments(userId);

      if (userCustomerAssignments.length === 0) {
        return res.status(403).json({ error: "No customer assigned to user" });
      }

      const customerId = userCustomerAssignments[0].customerId;
      const account = await storage.getFacebookAdsAccount(customerId);

      if (!account || !account.isActive) {
        return res.status(400).json({ error: "No active Facebook Ads account found" });
      }

      const campaigns = await facebookAdsService.getCampaigns(
        account.accessToken,
        account.adAccountId,
        account.appSecret
      );

      res.json({ campaigns });

    } catch (error) {
      console.error("Facebook Ads campaigns error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to fetch campaigns"
      });
    }
  });

  // Get Facebook Ads ad sets for a campaign
  app.get("/api/facebook-ads/campaigns/:campaignId/adsets", authenticateUser, async (req, res) => {
    try {
      const { campaignId } = req.params;
      if (!/^\d{1,32}$/.test(campaignId)) {
        return res.status(400).json({ error: "Invalid campaign ID" });
      }
      const userId = req.user!.id;
      const userCustomerAssignments = await storage.getUserCustomerAssignments(userId);

      if (userCustomerAssignments.length === 0) {
        return res.status(403).json({ error: "No customer assigned to user" });
      }

      const customerId = userCustomerAssignments[0].customerId;
      const account = await storage.getFacebookAdsAccount(customerId);

      if (!account || !account.isActive) {
        return res.status(400).json({ error: "No active Facebook Ads account found" });
      }

      const adSets = await facebookAdsService.getAdSets(
        account.accessToken,
        campaignId,
        account.appSecret
      );

      res.json({ adSets });

    } catch (error) {
      console.error("Facebook Ads adsets error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to fetch ad sets"
      });
    }
  });

  // Get Facebook Ads ads for an ad set
  app.get("/api/facebook-ads/adsets/:adSetId/ads", authenticateUser, async (req, res) => {
    try {
      const { adSetId } = req.params;
      if (!/^\d{1,32}$/.test(adSetId)) {
        return res.status(400).json({ error: "Invalid ad set ID" });
      }
      const userId = req.user!.id;
      const userCustomerAssignments = await storage.getUserCustomerAssignments(userId);

      if (userCustomerAssignments.length === 0) {
        return res.status(403).json({ error: "No customer assigned to user" });
      }

      const customerId = userCustomerAssignments[0].customerId;
      const account = await storage.getFacebookAdsAccount(customerId);

      if (!account || !account.isActive) {
        return res.status(400).json({ error: "No active Facebook Ads account found" });
      }

      const ads = await facebookAdsService.getAds(
        account.accessToken,
        adSetId,
        account.appSecret
      );

      res.json({ ads });

    } catch (error) {
      console.error("Facebook Ads ads error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to fetch ads"
      });
    }
  });

  // Get Facebook Ads insights/metrics
  app.get("/api/facebook-ads/insights", authenticateUser, async (req, res) => {
    try {
      const {
        objectId,
        level = 'campaign',
        since,
        until = new Date().toISOString().split('T')[0] // Default to today
      } = req.query;

      if (!objectId) {
        return res.status(400).json({ error: "Object ID is required" });
      }

      if (!since) {
        return res.status(400).json({ error: "Since date is required" });
      }

      const validLevels = ['campaign', 'adset', 'ad'];
      if (!validLevels.includes(level as string)) {
        return res.status(400).json({ error: "Invalid level. Must be campaign, adset, or ad" });
      }

      const userId = req.user!.id;
      const userCustomerAssignments = await storage.getUserCustomerAssignments(userId);

      if (userCustomerAssignments.length === 0) {
        return res.status(403).json({ error: "No customer assigned to user" });
      }

      const customerId = userCustomerAssignments[0].customerId;
      const account = await storage.getFacebookAdsAccount(customerId);

      if (!account || !account.isActive) {
        return res.status(400).json({ error: "No active Facebook Ads account found" });
      }

      const insights = await facebookAdsService.getInsights(
        account.accessToken,
        objectId as string,
        level as 'campaign' | 'adset' | 'ad',
        {
          since: since as string,
          until: until as string,
        },
        undefined,
        account.appSecret
      );

      const processedMetrics = facebookAdsService.processInsights(insights.data);

      res.json({
        insights: processedMetrics,
        dateRange: insights.dateRange
      });

    } catch (error) {
      console.error("Facebook Ads insights error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to fetch insights"
      });
    }
  });

  // Get daily Facebook Ads insights for charting
  app.get("/api/facebook-ads/insights/daily", authenticateUser, async (req, res) => {
    try {
      const {
        objectId,
        level = 'campaign',
        since,
        until = new Date().toISOString().split('T')[0]
      } = req.query;

      if (!objectId) {
        return res.status(400).json({ error: "Object ID is required" });
      }

      if (!since) {
        return res.status(400).json({ error: "Since date is required" });
      }

      const validLevels = ['campaign', 'adset', 'ad'];
      if (!validLevels.includes(level as string)) {
        return res.status(400).json({ error: "Invalid level. Must be campaign, adset, or ad" });
      }

      const userId = req.user!.id;
      const userCustomerAssignments = await storage.getUserCustomerAssignments(userId);

      if (userCustomerAssignments.length === 0) {
        return res.status(403).json({ error: "No customer assigned to user" });
      }

      const customerId = userCustomerAssignments[0].customerId;
      const account = await storage.getFacebookAdsAccount(customerId);

      if (!account || !account.isActive) {
        return res.status(400).json({ error: "No active Facebook Ads account found" });
      }

      const insights = await facebookAdsService.getInsights(
        account.accessToken,
        objectId as string,
        level as 'campaign' | 'adset' | 'ad',
        {
          since: since as string,
          until: until as string,
        },
        undefined,
        account.appSecret,
        '1' // Daily breakdown
      );

      const dailyData = insights.data.map((day: any) => ({
        date: day.date_start,
        spend: Number(day.spend) || 0,
        impressions: Number(day.impressions) || 0,
        clicks: Number(day.clicks) || 0,
        reach: Number(day.reach) || 0,
        cpm: Number(day.cpm) || 0,
        cpc: Number(day.cpc) || 0,
        ctr: Number(day.ctr) || 0,
      }));

      res.json({
        daily: dailyData,
        dateRange: insights.dateRange
      });

    } catch (error) {
      console.error("Facebook Ads daily insights error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to fetch daily insights"
      });
    }
  });

  // Get hierarchical Facebook Ads data (campaigns -> adsets -> ads with metrics)
  app.get("/api/facebook-ads/hierarchy", authenticateUser, async (req, res) => {
    try {
      const {
        since,
        until = new Date().toISOString().split('T')[0] // Default to today
      } = req.query;

      if (!since) {
        return res.status(400).json({ error: "Since date is required" });
      }

      const userId = req.user!.id;
      const userCustomerAssignments = await storage.getUserCustomerAssignments(userId);

      if (userCustomerAssignments.length === 0) {
        return res.status(403).json({ error: "No customer assigned to user" });
      }

      const customerId = userCustomerAssignments[0].customerId;
      const account = await storage.getFacebookAdsAccount(customerId);

      if (!account || !account.isActive) {
        return res.status(400).json({ error: "No active Facebook Ads account found" });
      }

      const hierarchy = await facebookAdsService.getCampaignHierarchy(
        account.accessToken,
        account.adAccountId,
        {
          since: since as string,
          until: until as string,
        },
        account.appSecret
      );

      res.json(hierarchy);

    } catch (error) {
      console.error("Facebook Ads hierarchy error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to fetch campaign hierarchy"
      });
    }
  });

  // Delete Facebook Ads account
  app.delete("/api/facebook-ads/disconnect", authenticateUser, async (req, res) => {
    try {
      const userId = req.user!.id;
      const userCustomerAssignments = await storage.getUserCustomerAssignments(userId);

      if (userCustomerAssignments.length === 0) {
        return res.status(403).json({ error: "No customer assigned to user" });
      }

      const customerId = userCustomerAssignments[0].customerId;
      const account = await storage.getFacebookAdsAccount(customerId);

      if (!account) {
        return res.status(404).json({ error: "No Facebook Ads account found" });
      }

      const deleted = await storage.deleteFacebookAdsAccount(account.id);

      if (deleted) {
        res.json({
          success: true,
          message: "Facebook Ads account disconnected successfully"
        });
      } else {
        res.status(500).json({ error: "Failed to disconnect Facebook Ads account" });
      }

    } catch (error) {
      console.error("Facebook Ads disconnect error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to disconnect Facebook Ads account"
      });
    }
  });

  // One-time startup check: warn if any users have plain text passwords (not bcrypt-hashed)
  storage.getAllUsers().then((allUsers) => {
    const plainTextUsers = allUsers.filter(u => u.password && !/^\$2[aby]\$/.test(u.password));
    if (plainTextUsers.length > 0) {
      console.warn(`[SECURITY WARNING] ${plainTextUsers.length} user(s) have passwords that are not bcrypt-hashed. ` +
        `Affected emails: ${plainTextUsers.map(u => u.email).join(', ')}. ` +
        `These passwords should be re-hashed immediately.`);
    }
  }).catch((err) => {
    console.error("Failed to run plain text password check:", err);
  });
}
