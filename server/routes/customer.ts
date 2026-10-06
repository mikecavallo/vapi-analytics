import type { Express } from "express";
import { storage } from "../storage";
import { authenticateUser, requireCustomerAccess } from "../auth-middleware";
import { auditLog } from "./shared";

export function registerCustomerRoutes(app: Express): void {
  // Customer API key management
  app.get("/api/customer/details", authenticateUser, requireCustomerAccess, async (req, res) => {
    try {
      const customerId = req.customerId;

      if (!customerId) {
        return res.status(400).json({ error: "Customer ID required" });
      }

      const customer = await storage.getCustomer(customerId);

      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      // Don't expose the full API keys in response, just indicate if they're configured
      const customerDetails = {
        ...customer,
        vapiApiKey: customer.vapiApiKey ? true : false,
        retellApiKey: customer.retellApiKey ? true : false,
      };

      res.json(customerDetails);
    } catch (error) {
      console.error("[CUSTOMER DETAILS] Error:", error);
      res.status(500).json({ error: "Failed to fetch customer details" });
    }
  });

  app.patch("/api/customer/api-key", authenticateUser, requireCustomerAccess, async (req, res) => {
    try {
      const customerId = req.customerId;
      const { vapiApiKey, retellApiKey } = req.body;

      if (!customerId) {
        return res.status(400).json({ error: "Customer ID required" });
      }

      // At least one key must be provided
      const hasVapi = vapiApiKey && typeof vapiApiKey === 'string';
      const hasRetell = retellApiKey && typeof retellApiKey === 'string';

      if (!hasVapi && !hasRetell) {
        return res.status(400).json({ error: "At least one valid API key is required" });
      }

      // Build update object with only provided keys
      const updateData: Record<string, string> = {};
      if (hasVapi) updateData.vapiApiKey = vapiApiKey;
      if (hasRetell) updateData.retellApiKey = retellApiKey;

      await storage.updateCustomer(customerId, updateData);

      auditLog('API_KEY_UPDATE', req.user?.id, { customerId, keysUpdated: Object.keys(updateData) });

      res.json({ message: "API key(s) updated successfully" });
    } catch (error) {
      console.error("[UPDATE API KEY] Error:", error);
      res.status(500).json({ error: "Failed to update API key" });
    }
  });
}
