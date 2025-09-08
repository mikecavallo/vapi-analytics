import { 
  type User, 
  type InsertUser, 
  type Customer,
  type InsertCustomer,
  type EmailWhitelist,
  type InsertEmailWhitelist,
  type UserCustomerAssignment,
  type InsertUserCustomerAssignment,
  type EmailVerificationToken,
  type VapiAnalyticsQuery, 
  type VapiAnalyticsResponse, 
  type DashboardData,
  users,
  customers,
  emailWhitelist,
  userCustomerAssignments,
  emailVerificationTokens
} from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Email whitelist
  isEmailWhitelisted(email: string): Promise<boolean>;
  addEmailToWhitelist(email: InsertEmailWhitelist): Promise<EmailWhitelist>;
  removeEmailFromWhitelist(email: string): Promise<boolean>;
  
  // Customer management
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByName(name: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | undefined>;
  getAllCustomers(): Promise<Customer[]>;
  
  // User-customer assignments
  getUserCustomerAssignments(userId: string): Promise<UserCustomerAssignment[]>;
  getCustomerUsers(customerId: string): Promise<UserCustomerAssignment[]>;
  assignUserToCustomer(assignment: InsertUserCustomerAssignment): Promise<UserCustomerAssignment>;
  removeUserFromCustomer(userId: string, customerId: string): Promise<boolean>;
  
  // Email verification tokens
  createEmailVerificationToken(userId: string, token: string, expiresAt: Date): Promise<EmailVerificationToken>;
  getEmailVerificationToken(token: string): Promise<EmailVerificationToken | undefined>;
  deleteEmailVerificationToken(token: string): Promise<boolean>;
  
  // Analytics caching
  getCachedAnalytics(cacheKey: string): Promise<DashboardData | undefined>;
  setCachedAnalytics(cacheKey: string, data: DashboardData, ttl?: number): Promise<void>;
}

// Database connection setup
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export class DbStorage implements IStorage {
  private analyticsCache: Map<string, { data: DashboardData; expires: number }>;

  constructor() {
    this.analyticsCache = new Map();
  }

  // User management
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const userData = {
      ...insertUser,
      emailVerified: false,
      role: "customer" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };
    
    const result = await db.update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    
    return result[0];
  }

  // Email whitelist
  async isEmailWhitelisted(email: string): Promise<boolean> {
    const result = await db.select().from(emailWhitelist).where(eq(emailWhitelist.email, email)).limit(1);
    return result.length > 0;
  }

  async addEmailToWhitelist(emailData: InsertEmailWhitelist & { createdByUserId: string }): Promise<EmailWhitelist> {
    const result = await db.insert(emailWhitelist).values({
      ...emailData,
      createdAt: new Date(),
    }).returning();
    return result[0];
  }

  async removeEmailFromWhitelist(email: string): Promise<boolean> {
    const result = await db.delete(emailWhitelist).where(eq(emailWhitelist.email, email)).returning();
    return result.length > 0;
  }

  // Customer management
  async getCustomer(id: string): Promise<Customer | undefined> {
    const result = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
    return result[0];
  }

  async getCustomerByName(name: string): Promise<Customer | undefined> {
    const result = await db.select().from(customers).where(eq(customers.name, name)).limit(1);
    return result[0];
  }

  async createCustomer(customerData: InsertCustomer & { createdByUserId: string }): Promise<Customer> {
    const result = await db.insert(customers).values({
      ...customerData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return result[0];
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | undefined> {
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };
    
    const result = await db.update(customers)
      .set(updateData)
      .where(eq(customers.id, id))
      .returning();
    
    return result[0];
  }

  async getAllCustomers(): Promise<Customer[]> {
    return db.select().from(customers);
  }

  // User-customer assignments
  async getUserCustomerAssignments(userId: string): Promise<UserCustomerAssignment[]> {
    return db.select().from(userCustomerAssignments).where(eq(userCustomerAssignments.userId, userId));
  }

  async getCustomerUsers(customerId: string): Promise<UserCustomerAssignment[]> {
    return db.select().from(userCustomerAssignments).where(eq(userCustomerAssignments.customerId, customerId));
  }

  async assignUserToCustomer(assignment: InsertUserCustomerAssignment & { assignedByUserId: string }): Promise<UserCustomerAssignment> {
    const result = await db.insert(userCustomerAssignments).values({
      ...assignment,
      createdAt: new Date(),
    }).returning();
    return result[0];
  }

  async removeUserFromCustomer(userId: string, customerId: string): Promise<boolean> {
    const result = await db.delete(userCustomerAssignments)
      .where(and(
        eq(userCustomerAssignments.userId, userId),
        eq(userCustomerAssignments.customerId, customerId)
      ))
      .returning();
    return result.length > 0;
  }

  // Email verification tokens
  async createEmailVerificationToken(userId: string, token: string, expiresAt: Date): Promise<EmailVerificationToken> {
    const result = await db.insert(emailVerificationTokens).values({
      userId,
      token,
      expiresAt,
      used: false,
      createdAt: new Date(),
    }).returning();
    return result[0];
  }

  async getEmailVerificationToken(token: string): Promise<EmailVerificationToken | undefined> {
    const result = await db.select().from(emailVerificationTokens).where(eq(emailVerificationTokens.token, token)).limit(1);
    return result[0];
  }

  async deleteEmailVerificationToken(token: string): Promise<boolean> {
    const result = await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.token, token)).returning();
    return result.length > 0;
  }

  // Analytics caching (in-memory for performance)
  async getCachedAnalytics(cacheKey: string): Promise<DashboardData | undefined> {
    const cached = this.analyticsCache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }
    
    // Remove expired cache
    if (cached) {
      this.analyticsCache.delete(cacheKey);
    }
    
    return undefined;
  }

  async setCachedAnalytics(cacheKey: string, data: DashboardData, ttl = 300000): Promise<void> {
    this.analyticsCache.set(cacheKey, {
      data,
      expires: Date.now() + ttl, // 5 minutes default TTL
    });
  }
}

export const storage = new DbStorage();
