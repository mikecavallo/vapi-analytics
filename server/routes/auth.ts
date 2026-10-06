import type { Express } from "express";
import { buildVerificationEmail, getEmailSender } from "../email/sender";
import { storage } from "../storage";
import { signupSchema, loginSchema, emailVerificationSchema, type UserRole } from "@shared/schema";
import { z } from "zod";
import { hashPassword, verifyPassword, isBcryptHash, dummyPasswordCheck, generateToken, generateEmailVerificationToken, getEmailTokenExpiration, validatePasswordStrength, sanitizeUser, createTokenPayload } from "../auth-utils";
import { authenticateUser, authRateLimit } from "../auth-middleware";
import { auditLog } from "./shared";
import { sendError } from "../http-error";
import { changePasswordSchema, profileUpdateSchema } from "./validation";

export function registerAuthRoutes(app: Express): void {
  // Authentication endpoints

  // User registration
  app.post("/api/auth/signup", authRateLimit, async (req, res) => {
    try {
      const validatedData = signupSchema.parse(req.body);
      const { username, email, password } = validatedData;

      // Check if email is whitelisted
      const isWhitelisted = await storage.isEmailWhitelisted(email);
      if (!isWhitelisted) {
        return res.status(403).json({
          error: "Email not whitelisted. Contact support for access."
        });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists with this email" });
      }

      // Validate password strength
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({ error: passwordValidation.message });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user, customer, and assignment atomically using database transaction
      const { user, customer } = await storage.createUserWithCustomerAndAssignment({
        username,
        email,
        password: hashedPassword,
      });

      // Generate email verification token
      const token = generateEmailVerificationToken();
      const expiresAt = getEmailTokenExpiration();

      await storage.createEmailVerificationToken(user.id, token, expiresAt);

      // Send the verification email (Resend when RESEND_API_KEY is set, console log otherwise).
      // APP_URL should be set in production so links never depend on the request Host header.
      const appUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
      try {
        await getEmailSender().send(buildVerificationEmail(user.email, token, appUrl));
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
      }

      res.status(201).json({
        message: "User created successfully. Please verify your email to complete registration.",
        user: sanitizeUser(user),
        // In non-production environments, include the token in the response for testing
        ...(process.env.NODE_ENV !== "production" && { verificationToken: token })
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Invalid input",
          details: error.errors
        });
      }

      console.error("Signup error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // User login
  app.post("/api/auth/login", authRateLimit, async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const { email, password } = validatedData;

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        await dummyPasswordCheck(password);
        auditLog('LOGIN_FAILURE', undefined, { email, reason: 'user_not_found' });
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // bcrypt only. Legacy plaintext rows never match: run `npm run db:security-migrate` once
      // to rehash them (see README "Security").
      if (!isBcryptHash(user.password)) {
        await dummyPasswordCheck(password);
        auditLog('LOGIN_FAILURE', user.id, { email, reason: 'legacy_password_needs_migration' });
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        auditLog('LOGIN_FAILURE', user.id, { email, reason: 'invalid_password' });
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Check if email is verified
      if (!user.emailVerified) {
        return res.status(401).json({
          error: "Please verify your email before logging in"
        });
      }

      // Get user's customer assignments (for multi-tenant access)
      const assignments = await storage.getUserCustomerAssignments(user.id);
      const primaryCustomerId = assignments.length > 0 ? assignments[0].customerId : undefined;

      // Generate JWT token
      const tokenPayload = createTokenPayload({ ...user, role: user.role as UserRole }, primaryCustomerId);
      const token = generateToken(tokenPayload);

      auditLog('LOGIN_SUCCESS', user.id, { email });

      // Return user data and token
      res.json({
        user: { ...sanitizeUser(user), role: user.role as UserRole },
        token,
        customerId: primaryCustomerId,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Invalid input",
          details: error.errors
        });
      }

      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Get current user info
  app.get("/api/auth/me", authenticateUser, async (req, res) => {
    try {
      // User info is already verified and attached by authenticateUser middleware
      const userId = req.user!.id;
      const customerId = req.user!.customerId;

      // Get fresh user data
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get user's customer assignments
      const assignments = await storage.getUserCustomerAssignments(user.id);
      const primaryCustomerId = assignments.length > 0 ? assignments[0].customerId : customerId;

      res.json({
        user: sanitizeUser(user),
        customerId: primaryCustomerId,
        assignments: assignments.length,
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user info" });
    }
  });

  // Email verification
  app.post("/api/auth/verify-email", authRateLimit, async (req, res) => {
    try {
      const { token } = emailVerificationSchema.parse(req.body);

      // Get verification token
      const verificationToken = await storage.getEmailVerificationToken(token);
      if (!verificationToken || verificationToken.used) {
        return res.status(400).json({ error: "Invalid or expired verification token" });
      }

      // Check if token is expired
      if (new Date() > verificationToken.expiresAt) {
        return res.status(400).json({ error: "Verification token has expired" });
      }

      // Get user
      const user = await storage.getUser(verificationToken.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Update user email verification status
      await storage.updateUser(user.id, { emailVerified: true });

      // Mark token as used
      await storage.deleteEmailVerificationToken(token);

      res.json({ message: "Email verified successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Invalid input",
          details: error.errors
        });
      }

      console.error("Email verification error:", error);
      res.status(500).json({ error: "Email verification failed" });
    }
  });

  // User logout (server-side token invalidation via loggedOutAt timestamp)
  app.post("/api/auth/logout", authenticateUser, async (req, res) => {
    try {
      // Set loggedOutAt timestamp so any JWTs issued before this time are rejected
      await storage.updateUser(req.user!.id, { loggedOutAt: new Date() });
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  });

  // Update user profile (username and/or email)
  app.patch("/api/auth/profile", authenticateUser, async (req, res) => {
    try {
      const { username, email } = profileUpdateSchema.parse(req.body);
      const userId = req.user!.id;

      if (username !== undefined) {
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser && existingUser.id !== userId) {
          return res.status(409).json({ error: "Username is already taken" });
        }
      }

      if (email !== undefined) {
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser && existingUser.id !== userId) {
          return res.status(409).json({ error: "Email is already in use" });
        }
      }

      const updates: Record<string, any> = {};
      if (username) updates.username = username;
      if (email) updates.email = email;

      const updatedUser = await storage.updateUser(userId, updates);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      auditLog('PROFILE_UPDATE', userId, { fieldsUpdated: Object.keys(updates) });
      res.json({ user: sanitizeUser(updatedUser) });
    } catch (error) {
      sendError(res, error, "Failed to update profile", "profile-update");
    }
  });

  // Change password
  app.post("/api/auth/change-password", authRateLimit, authenticateUser, async (req, res) => {
    try {
      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
      const userId = req.user!.id;

      // Get the user to verify current password
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Verify current password
      const isValid = await verifyPassword(currentPassword, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      // Validate new password strength
      const strength = validatePasswordStrength(newPassword);
      if (!strength.valid) {
        return res.status(400).json({ error: strength.message });
      }

      // Hash and update
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUser(userId, { password: hashedPassword });

      auditLog('PASSWORD_CHANGE', userId, {});
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      sendError(res, error, "Failed to change password", "change-password");
    }
  });
}
