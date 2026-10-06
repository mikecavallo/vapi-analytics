import type { Express } from "express";
import type { Customer } from "@shared/schema";
import { storage } from "../storage";
import { authenticateUser, requireCustomerAccess, validateCustomerAccess } from "../auth-middleware";
import { maskSecret } from "../security/secrets";
import { sendError } from "../http-error";
import { auditLog } from "./shared";
import { customerApiKeySchema } from "./validation";

/**
 * Customer record as sent to the browser: provider keys are replaced by a mask showing only
 * the last four characters. Stored keys are never returned in full by any route.
 */
export function toPublicCustomer(customer: Customer) {
  const { vapiApiKey, retellApiKey, ...rest } = customer;
  return {
    ...rest,
    vapiApiKey: maskSecret(vapiApiKey),
    retellApiKey: maskSecret(retellApiKey),
    hasVapiApiKey: !!vapiApiKey,
    hasRetellApiKey: !!retellApiKey,
  };
}

export function registerCustomerRoutes(app: Express): void {
  app.get("/api/customer/details", authenticateUser, requireCustomerAccess, validateCustomerAccess, async (req, res) => {
    try {
      const customerId = req.customerId;
      if (!customerId) {
        return res.status(400).json({ error: "Customer ID required" });
      }

      const customer = await storage.getCustomer(customerId);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      res.json(toPublicCustomer(customer));
    } catch (error) {
      sendError(res, error, "Failed to fetch customer details", "customer-details");
    }
  });

  app.patch("/api/customer/api-key", authenticateUser, requireCustomerAccess, validateCustomerAccess, async (req, res) => {
    try {
      const customerId = req.customerId;
      if (!customerId) {
        return res.status(400).json({ error: "Customer ID required" });
      }

      const { vapiApiKey, retellApiKey } = customerApiKeySchema.parse(req.body);

      const updateData: Record<string, string> = {};
      if (vapiApiKey) updateData.vapiApiKey = vapiApiKey;
      if (retellApiKey) updateData.retellApiKey = retellApiKey;

      // Encrypted at rest by the storage layer (AES-256-GCM, see server/security/secrets.ts).
      const updated = await storage.updateCustomer(customerId, updateData);

      auditLog("API_KEY_UPDATE", req.user?.id, { customerId, keysUpdated: Object.keys(updateData) });

      res.json({
        message: "API key(s) updated successfully",
        ...(updated && { customer: toPublicCustomer(updated) }),
      });
    } catch (error) {
      sendError(res, error, "Failed to update API key", "customer-api-key");
    }
  });
}
