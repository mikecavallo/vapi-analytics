import type { Express } from "express";
import { storage } from "../storage";
import { randomUUID } from "crypto";
import { authenticateUser, requireSuperAdmin } from "../auth-middleware";

export function registerAdminRoutes(app: Express): void {
  // Super-admin endpoints
  app.get("/api/admin/customers", authenticateUser, requireSuperAdmin, async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      res.json(customers);
    } catch (error) {
      console.error("[ADMIN CUSTOMERS] Error:", error);
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  app.post("/api/admin/customers", authenticateUser, requireSuperAdmin, async (req, res) => {
    try {
      const { name, description, vapiApiKey, retellApiKey } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Name is required" });
      }

      const customerId = randomUUID();
      const customer = await storage.createCustomer({
        name,
        description: description || null,
        createdByUserId: req.user!.id,
        vapiApiKey: process.env.VAPI_API_KEY || vapiApiKey || null,
        retellApiKey: retellApiKey || null
      });

      res.json(customer);
    } catch (error) {
      console.error("[CREATE CUSTOMER] Error:", error);
      res.status(500).json({ error: "Failed to create customer" });
    }
  });

  app.get("/api/admin/users", authenticateUser, requireSuperAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove password hashes from response
      const safeUsers = users.map(user => ({
        ...user,
        password: undefined
      }));
      res.json(safeUsers);
    } catch (error) {
      console.error("[ADMIN USERS] Error:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/email-whitelist", authenticateUser, requireSuperAdmin, async (req, res) => {
    try {
      const whitelist = await storage.getAllEmailWhitelist();
      res.json(whitelist);
    } catch (error) {
      console.error("[ADMIN EMAIL WHITELIST] Error:", error);
      res.status(500).json({ error: "Failed to fetch email whitelist" });
    }
  });

  app.post("/api/admin/email-whitelist", authenticateUser, requireSuperAdmin, async (req, res) => {
    try {
      const { email } = req.body;

      if (!email || !email.includes('@')) {
        return res.status(400).json({ error: "Valid email address is required" });
      }

      const emailId = randomUUID();
      const whitelistEntry = await storage.addEmailToWhitelist({
        email: email.toLowerCase(),
        createdByUserId: req.user!.id
      });

      res.json(whitelistEntry);
    } catch (error) {
      console.error("[ADD EMAIL WHITELIST] Error:", error);
      res.status(500).json({ error: "Failed to add email to whitelist" });
    }
  });
}
