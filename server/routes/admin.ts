import type { Express } from "express";
import { storage } from "../storage";
import { authenticateUser, requireSuperAdmin } from "../auth-middleware";
import { sendError } from "../http-error";
import { sanitizeUser } from "../auth-utils";
import { toPublicCustomer } from "./customer";
import { auditLog } from "./shared";
import { adminCreateCustomerSchema, whitelistEmailSchema } from "./validation";

export function registerAdminRoutes(app: Express): void {
  // Super-admin endpoints. Provider keys are masked in every response.
  app.get("/api/admin/customers", authenticateUser, requireSuperAdmin, async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      res.json(customers.map(toPublicCustomer));
    } catch (error) {
      sendError(res, error, "Failed to fetch customers", "admin-customers");
    }
  });

  app.post("/api/admin/customers", authenticateUser, requireSuperAdmin, async (req, res) => {
    try {
      const { name, description, vapiApiKey, retellApiKey } = adminCreateCustomerSchema.parse(req.body);

      // Only the keys the admin entered for this customer are stored. The platform's own
      // VAPI_API_KEY is never copied into a customer workspace.
      const customer = await storage.createCustomer({
        name,
        description: description || null,
        createdByUserId: req.user!.id,
        vapiApiKey: vapiApiKey || null,
        retellApiKey: retellApiKey || null,
      });

      auditLog("CUSTOMER_CREATED", req.user!.id, { customerId: customer.id });
      res.json(toPublicCustomer(customer));
    } catch (error) {
      sendError(res, error, "Failed to create customer", "admin-create-customer");
    }
  });

  app.get("/api/admin/users", authenticateUser, requireSuperAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users.map(sanitizeUser));
    } catch (error) {
      sendError(res, error, "Failed to fetch users", "admin-users");
    }
  });

  app.get("/api/admin/email-whitelist", authenticateUser, requireSuperAdmin, async (req, res) => {
    try {
      const whitelist = await storage.getAllEmailWhitelist();
      res.json(whitelist);
    } catch (error) {
      sendError(res, error, "Failed to fetch email whitelist", "admin-whitelist");
    }
  });

  app.post("/api/admin/email-whitelist", authenticateUser, requireSuperAdmin, async (req, res) => {
    try {
      const { email } = whitelistEmailSchema.parse(req.body);
      const whitelistEntry = await storage.addEmailToWhitelist({
        email,
        createdByUserId: req.user!.id,
      });
      auditLog("WHITELIST_ADD", req.user!.id, {});
      res.json(whitelistEntry);
    } catch (error) {
      sendError(res, error, "Failed to add email to whitelist", "admin-whitelist-add");
    }
  });
}
