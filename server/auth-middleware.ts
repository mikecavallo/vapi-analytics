import type { Request, Response, NextFunction } from "express";
import { verifyToken, extractTokenFromHeader } from "./auth-utils";
import { storage } from "./storage";
import type { TokenPayload, UserRole } from "@shared/schema";

// Extend Express Request interface to include user data
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        customerId?: string;
        emailVerified: boolean;
      };
      customerId?: string;
    }
  }
}

/**
 * Middleware to authenticate users with JWT tokens
 */
export async function authenticateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Get fresh user data from database
    const user = await storage.getUser(payload.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Check if the token was issued before the user's last logout
    // JWT iat is in seconds, loggedOutAt is a Date
    if (user.loggedOutAt) {
      const tokenIssuedAt = (payload as any).iat; // JWT standard claim (seconds since epoch)
      const loggedOutAtSeconds = Math.floor(user.loggedOutAt.getTime() / 1000);
      if (tokenIssuedAt && tokenIssuedAt <= loggedOutAtSeconds) {
        return res.status(401).json({ error: "Token has been invalidated. Please log in again." });
      }
    }

    // Check if user's email is still verified
    if (!user.emailVerified) {
      return res.status(401).json({ error: "Email verification required" });
    }

    // Attach user information to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      customerId: payload.customerId,
      emailVerified: user.emailVerified,
    };

    // For multi-tenant access, set the customer ID
    if (payload.customerId) {
      req.customerId = payload.customerId;
    }

    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
}

/**
 * Middleware to require super admin role
 */
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (req.user.role !== "super_admin") {
    return res.status(403).json({ error: "Super admin access required" });
  }

  next();
}

/**
 * Middleware to require customer role (or super admin)
 */
export function requireCustomerAccess(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (req.user.role !== "customer" && req.user.role !== "super_admin") {
    return res.status(403).json({ error: "Customer access required" });
  }

  next();
}

/**
 * Middleware to validate multi-tenant access
 * Ensures users can only access data from their assigned customers
 */
export async function validateCustomerAccess(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Super admins can access all customer data
    if (req.user.role === "super_admin") {
      return next();
    }

    // For regular customers, check if they have access to the requested customer
    const requestedCustomerId = req.params.customerId || req.query.customerId || req.customerId;
    
    if (!requestedCustomerId) {
      // If no specific customer is requested, use their primary customer
      const assignments = await storage.getUserCustomerAssignments(req.user.id);
      if (assignments.length === 0) {
        return res.status(403).json({ error: "No customer access assigned" });
      }
      
      // Use the first assigned customer as default
      req.customerId = assignments[0].customerId;
      return next();
    }

    // Check if user has access to the requested customer
    const assignments = await storage.getUserCustomerAssignments(req.user.id);
    const hasAccess = assignments.some(assignment => assignment.customerId === requestedCustomerId);
    
    if (!hasAccess) {
      return res.status(403).json({ 
        error: "Access denied to this customer data" 
      });
    }

    req.customerId = requestedCustomerId as string;
    next();
  } catch (error) {
    console.error("Customer access validation error:", error);
    res.status(500).json({ error: "Access validation failed" });
  }
}

/**
 * Optional authentication middleware - adds user info if token is present but doesn't require it
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        const user = await storage.getUser(payload.userId);
        if (user && user.emailVerified) {
          req.user = {
            id: user.id,
            email: user.email,
            role: user.role as UserRole,
            customerId: payload.customerId,
            emailVerified: user.emailVerified,
          };
          
          if (payload.customerId) {
            req.customerId = payload.customerId;
          }
        }
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token parsing fails
    next();
  }
}

// Rate limiting storage
interface RateLimitCounter {
  count: number;
  windowStart: number;
}

const rateLimitCounters = new Map<string, RateLimitCounter>();

/**
 * Rate limiting middleware for authentication endpoints
 */
export function authRateLimit(req: Request, res: Response, next: NextFunction) {
  // Simple in-memory rate limiting (in production, use Redis or similar)
  const clientIP = req.ip || req.socket.remoteAddress || 'unknown';
  const endpoint = req.path;
  const key = `${clientIP}:${endpoint}`;
  
  const now = Date.now();
  const windowSize = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = endpoint.includes('login') ? 5 : 10; // Stricter limits for login
  
  const counter: RateLimitCounter = rateLimitCounters.get(key) || { count: 0, windowStart: now };
  
  // Reset counter if window has expired
  if (now - counter.windowStart > windowSize) {
    counter.count = 0;
    counter.windowStart = now;
  }
  
  counter.count++;
  rateLimitCounters.set(key, counter);
  
  if (counter.count > maxAttempts) {
    return res.status(429).json({
      error: "Too many attempts. Please try again later.",
      retryAfter: Math.ceil((windowSize - (now - counter.windowStart)) / 1000)
    });
  }

  next();
}

/**
 * Rate limiting middleware for protected API endpoints
 * More permissive than auth rate limiting: 100 requests per 15 minutes per IP
 */
const apiRateLimitCounters = new Map<string, RateLimitCounter>();

export function apiRateLimit(req: Request, res: Response, next: NextFunction) {
  const clientIP = req.ip || req.socket.remoteAddress || 'unknown';
  const key = `api:${clientIP}`;

  const now = Date.now();
  const windowSize = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100;

  const counter: RateLimitCounter = apiRateLimitCounters.get(key) || { count: 0, windowStart: now };

  // Reset counter if window has expired
  if (now - counter.windowStart > windowSize) {
    counter.count = 0;
    counter.windowStart = now;
  }

  counter.count++;
  apiRateLimitCounters.set(key, counter);

  if (counter.count > maxRequests) {
    return res.status(429).json({
      error: "Too many API requests. Please try again later.",
      retryAfter: Math.ceil((windowSize - (now - counter.windowStart)) / 1000)
    });
  }

  next();
}