import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import type { TokenPayload, UserRole } from "@shared/schema";

// Configuration
const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') throw new Error('JWT_SECRET environment variable is required in production');
  return 'dev-only-jwt-secret-not-for-production';
})();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";
const EMAIL_TOKEN_EXPIRES_MINUTES = 30;

/**
 * Hash a plain text password using bcrypt
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  try {
    const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);
    return hashedPassword;
  } catch (error) {
    console.error("Error hashing password:", error);
    throw new Error("Failed to hash password");
  }
}

/**
 * Verify a plain text password against a hashed password
 */
export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  try {
    const isValid = await bcrypt.compare(plainPassword, hashedPassword);
    return isValid;
  } catch (error) {
    console.error("Error verifying password:", error);
    return false;
  }
}

/**
 * Generate a JWT token for authenticated users
 */
export function generateToken(payload: TokenPayload): string {
  try {
    const token = jwt.sign(
      payload as Record<string, any>, 
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
        issuer: "invoxa-api", 
        audience: "invoxa-dashboard",
      } as SignOptions
    );
    return token;
  } catch (error) {
    console.error("Error generating JWT token:", error);
    throw new Error("Failed to generate authentication token");
  }
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: "invoxa-api",
      audience: "invoxa-dashboard",
    }) as TokenPayload;
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.log("JWT token expired");
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.log("Invalid JWT token");
    } else {
      console.error("Error verifying JWT token:", error);
    }
    return null;
  }
}

/**
 * Generate a secure random token for email verification
 */
export function generateEmailVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Generate a secure random token with custom length
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Calculate expiration time for email verification tokens
 */
export function getEmailTokenExpiration(): Date {
  const now = new Date();
  return new Date(now.getTime() + EMAIL_TOKEN_EXPIRES_MINUTES * 60 * 1000);
}

/**
 * Validate user role
 */
export function isValidRole(role: string): role is UserRole {
  return role === "customer" || role === "super_admin";
}

/**
 * Check if user has super admin privileges
 */
export function isSuperAdmin(role: UserRole): boolean {
  return role === "super_admin";
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  
  return authHeader.substring(7); // Remove "Bearer " prefix
}

/**
 * Sanitize user object for client response (remove sensitive fields)
 */
export function sanitizeUser(user: any) {
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
}

/**
 * Generate a complete token payload for a user
 */
export function createTokenPayload(
  user: { 
    id: string; 
    email: string; 
    role: UserRole; 
  },
  customerId?: string
): TokenPayload {
  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    ...(customerId && { customerId }),
  };
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (password.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters long" };
  }
  
  if (password.length > 128) {
    return { valid: false, message: "Password must be less than 128 characters" };
  }
  
  // Check for at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  if (!hasLetter || !hasNumber) {
    return { valid: false, message: "Password must contain at least one letter and one number" };
  }
  
  return { valid: true };
}

/**
 * Check if email token has expired
 */
export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}