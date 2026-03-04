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
  type FacebookAdsAccount,
  type InsertFacebookAdsAccount,
  type FacebookAdsCampaign,
  type InsertFacebookAdsCampaign,
  type VapiAnalyticsQuery,
  type VapiAnalyticsResponse,
  type DashboardData,
  users,
  customers,
  emailWhitelist,
  userCustomerAssignments,
  emailVerificationTokens,
  facebookAdsAccounts,
  facebookAdsCampaigns
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { encrypt, decrypt } from './utils/encryption';

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
  getAllEmailWhitelist(): Promise<EmailWhitelist[]>;

  // Admin methods
  getAllUsers(): Promise<User[]>;

  // Customer management
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByName(name: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | undefined>;
  getAllCustomers(): Promise<Customer[]>;

  // User-customer assignments
  getUserCustomerAssignments(userId: string): Promise<UserCustomerAssignment[]>;
  getCustomerUsers(customerId: string): Promise<UserCustomerAssignment[]>;
  assignUserToCustomer(assignment: InsertUserCustomerAssignment & { assignedByUserId: string }): Promise<UserCustomerAssignment>;
  removeUserFromCustomer(userId: string, customerId: string): Promise<boolean>;

  // Atomic operations
  createUserWithCustomerAndAssignment(userData: { username: string; email: string; password: string }): Promise<{ user: User; customer: Customer; assignment: UserCustomerAssignment }>;
  ensureUserHasCustomerAssignment(userId: string): Promise<{ customer: Customer; assignment: UserCustomerAssignment } | null>;

  // Email verification tokens
  createEmailVerificationToken(userId: string, token: string, expiresAt: Date): Promise<EmailVerificationToken>;
  getEmailVerificationToken(token: string): Promise<EmailVerificationToken | undefined>;
  deleteEmailVerificationToken(token: string): Promise<boolean>;

  // Analytics caching
  getCachedAnalytics(cacheKey: string): Promise<DashboardData | undefined>;
  setCachedAnalytics(cacheKey: string, data: DashboardData, ttl?: number): Promise<void>;

  // Facebook Ads management
  getFacebookAdsAccount(customerId: string): Promise<FacebookAdsAccount | undefined>;
  getFacebookAdsAccountByAdAccountId(adAccountId: string): Promise<FacebookAdsAccount | undefined>;
  createFacebookAdsAccount(account: InsertFacebookAdsAccount): Promise<FacebookAdsAccount>;
  updateFacebookAdsAccount(id: string, updates: Partial<FacebookAdsAccount>): Promise<FacebookAdsAccount | undefined>;
  deleteFacebookAdsAccount(id: string): Promise<boolean>;

  // Facebook Ads campaigns cache
  getFacebookAdsCampaigns(facebookAdsAccountId: string): Promise<FacebookAdsCampaign[]>;
  createOrUpdateFacebookAdsCampaign(campaign: InsertFacebookAdsCampaign): Promise<FacebookAdsCampaign>;
  deleteFacebookAdsCampaign(facebookAdsAccountId: string, campaignId: string): Promise<boolean>;
}

// Database connected via shared module


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
    // Check exact email match
    const exact = await db.select().from(emailWhitelist).where(eq(emailWhitelist.email, email)).limit(1);
    if (exact.length > 0) return true;

    // Check domain wildcard match (entries like @invoxa.ai)
    const domain = '@' + email.split('@')[1];
    const wildcard = await db.select().from(emailWhitelist).where(eq(emailWhitelist.email, domain)).limit(1);
    return wildcard.length > 0;
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

  // Idempotent signup with customer creation and assignment (no transactions)
  async createUserWithCustomerAndAssignment(userData: {
    username: string;
    email: string;
    password: string;
  }): Promise<{ user: User; customer: Customer; assignment: UserCustomerAssignment }> {
    try {
      // Step 1: Create user
      const userInsertData = {
        ...userData,
        emailVerified: false,
        role: "customer" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const userResult = await db.insert(users).values(userInsertData).returning();
      const user = userResult[0];

      try {
        // Step 2: Create customer for this user
        const customerResult = await db.insert(customers).values({
          name: `${userData.username}'s Account`,
          description: `Customer account for ${userData.username}`,
          createdByUserId: user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        }).returning();
        const customer = customerResult[0];

        try {
          // Step 3: Assign user to customer
          const assignmentResult = await db.insert(userCustomerAssignments).values({
            userId: user.id,
            customerId: customer.id,
            assignedByUserId: user.id,
            createdAt: new Date(),
          }).returning();
          const assignment = assignmentResult[0];

          return { user, customer, assignment };
        } catch (assignmentError) {
          // Cleanup: Remove customer if assignment fails
          await db.delete(customers).where(eq(customers.id, customer.id));
          throw assignmentError;
        }
      } catch (customerError) {
        // Cleanup: Remove user if customer creation fails  
        await db.delete(users).where(eq(users.id, user.id));
        throw customerError;
      }
    } catch (error) {
      console.error("Signup operation failed:", error);
      throw error;
    }
  }

  // Ensure existing user has a customer assignment - for fixing existing users
  async ensureUserHasCustomerAssignment(userId: string): Promise<{ customer: Customer; assignment: UserCustomerAssignment } | null> {
    // Check if user already has assignments
    const existingAssignments = await this.getUserCustomerAssignments(userId);
    if (existingAssignments.length > 0) {
      return null; // User already has assignments
    }

    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    try {
      // Create customer for this existing user
      const customerResult = await db.insert(customers).values({
        name: `${user.username}'s Account`,
        description: `Customer account for ${user.username}`,
        createdByUserId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      const customer = customerResult[0];

      try {
        // Assign user to customer
        const assignmentResult = await db.insert(userCustomerAssignments).values({
          userId: user.id,
          customerId: customer.id,
          assignedByUserId: user.id,
          createdAt: new Date(),
        }).returning();
        const assignment = assignmentResult[0];

        return { customer, assignment };
      } catch (assignmentError) {
        // Cleanup: Remove customer if assignment fails
        await db.delete(customers).where(eq(customers.id, customer.id));
        throw assignmentError;
      }
    } catch (error) {
      console.error("Failed to ensure user has customer assignment:", error);
      throw error;
    }
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

  // Additional admin methods
  async getAllUsers(): Promise<User[]> {
    const result = await db.select().from(users);
    return result;
  }

  async getAllEmailWhitelist(): Promise<EmailWhitelist[]> {
    const result = await db.select().from(emailWhitelist);
    return result;
  }

  // Facebook Ads management with secure token handling
  async getFacebookAdsAccount(customerId: string): Promise<FacebookAdsAccount | undefined> {
    const result = await db.select().from(facebookAdsAccounts)
      .where(and(eq(facebookAdsAccounts.customerId, customerId), eq(facebookAdsAccounts.isActive, true)))
      .limit(1);

    if (result[0]) {
      // Decrypt the access token and optional credentials before returning
      try {
        const decryptedToken = decrypt(result[0].encryptedAccessToken);
        const decrypted: any = {
          ...result[0],
          accessToken: decryptedToken,
        };
        if (result[0].encryptedAppId) {
          decrypted.appId = decrypt(result[0].encryptedAppId);
        }
        if (result[0].encryptedAppSecret) {
          decrypted.appSecret = decrypt(result[0].encryptedAppSecret);
        }
        return decrypted as FacebookAdsAccount;
      } catch (error) {
        console.error('Failed to decrypt credentials for account:', result[0].id);
        return undefined;
      }
    }
    return undefined;
  }

  async getFacebookAdsAccountByAdAccountId(adAccountId: string): Promise<FacebookAdsAccount | undefined> {
    const result = await db.select().from(facebookAdsAccounts)
      .where(eq(facebookAdsAccounts.adAccountId, adAccountId))
      .limit(1);

    if (result[0]) {
      try {
        const decryptedToken = decrypt(result[0].encryptedAccessToken);
        const decrypted: any = {
          ...result[0],
          accessToken: decryptedToken,
        };
        if (result[0].encryptedAppId) {
          decrypted.appId = decrypt(result[0].encryptedAppId);
        }
        if (result[0].encryptedAppSecret) {
          decrypted.appSecret = decrypt(result[0].encryptedAppSecret);
        }
        return decrypted as FacebookAdsAccount;
      } catch (error) {
        console.error('Failed to decrypt credentials for account:', result[0].id);
        return undefined;
      }
    }
    return undefined;
  }

  async createFacebookAdsAccount(account: InsertFacebookAdsAccount & { accessToken: string; appId?: string; appSecret?: string }): Promise<FacebookAdsAccount> {
    // Encrypt credentials before storing
    const encryptedToken = encrypt(account.accessToken);
    const values: any = {
      ...account,
      encryptedAccessToken: encryptedToken,
      tokenIssuedAt: new Date(),
      lastValidatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    if (account.appId) {
      values.encryptedAppId = encrypt(account.appId);
    }
    if (account.appSecret) {
      values.encryptedAppSecret = encrypt(account.appSecret);
    }
    // Remove plain text fields before insert
    delete values.accessToken;
    delete values.appId;
    delete values.appSecret;

    const result = await db.insert(facebookAdsAccounts).values(values).returning();

    // Return with decrypted credentials for immediate use
    const returned: any = { ...result[0], accessToken: account.accessToken };
    if (account.appId) returned.appId = account.appId;
    if (account.appSecret) returned.appSecret = account.appSecret;
    return returned as FacebookAdsAccount;
  }

  async updateFacebookAdsAccount(id: string, updates: Partial<FacebookAdsAccount & { accessToken?: string; appId?: string; appSecret?: string }>): Promise<FacebookAdsAccount | undefined> {
    const updateData: any = {
      ...updates,
      updatedAt: new Date(),
    };

    // Encrypt credentials if being updated
    if (updates.accessToken) {
      updateData.encryptedAccessToken = encrypt(updates.accessToken);
      updateData.lastValidatedAt = new Date();
      delete updateData.accessToken;
    }
    if (updates.appId) {
      updateData.encryptedAppId = encrypt(updates.appId);
      delete updateData.appId;
    }
    if (updates.appSecret) {
      updateData.encryptedAppSecret = encrypt(updates.appSecret);
      delete updateData.appSecret;
    }

    const result = await db.update(facebookAdsAccounts)
      .set(updateData)
      .where(eq(facebookAdsAccounts.id, id))
      .returning();

    if (result[0]) {
      const returned: any = { ...result[0] };
      if (updates.accessToken) returned.accessToken = updates.accessToken;
      if (updates.appId) returned.appId = updates.appId;
      if (updates.appSecret) returned.appSecret = updates.appSecret;
      return returned as FacebookAdsAccount;
    }

    return result[0] as any;
  }

  async deleteFacebookAdsAccount(id: string): Promise<boolean> {
    const result = await db.delete(facebookAdsAccounts)
      .where(eq(facebookAdsAccounts.id, id))
      .returning();
    return result.length > 0;
  }

  // Facebook Ads campaigns cache
  async getFacebookAdsCampaigns(facebookAdsAccountId: string): Promise<FacebookAdsCampaign[]> {
    return db.select().from(facebookAdsCampaigns)
      .where(eq(facebookAdsCampaigns.facebookAdsAccountId, facebookAdsAccountId));
  }

  async createOrUpdateFacebookAdsCampaign(campaign: InsertFacebookAdsCampaign): Promise<FacebookAdsCampaign> {
    // Try to find existing campaign first
    const existing = await db.select().from(facebookAdsCampaigns)
      .where(and(
        eq(facebookAdsCampaigns.facebookAdsAccountId, campaign.facebookAdsAccountId),
        eq(facebookAdsCampaigns.campaignId, campaign.campaignId)
      ))
      .limit(1);

    if (existing.length > 0) {
      // Update existing campaign
      const result = await db.update(facebookAdsCampaigns)
        .set({
          ...campaign,
          lastUpdated: new Date(),
        })
        .where(eq(facebookAdsCampaigns.id, existing[0].id))
        .returning();
      return result[0];
    } else {
      // Create new campaign
      const result = await db.insert(facebookAdsCampaigns).values({
        ...campaign,
        lastUpdated: new Date(),
      }).returning();
      return result[0];
    }
  }

  async deleteFacebookAdsCampaign(facebookAdsAccountId: string, campaignId: string): Promise<boolean> {
    const result = await db.delete(facebookAdsCampaigns)
      .where(and(
        eq(facebookAdsCampaigns.facebookAdsAccountId, facebookAdsAccountId),
        eq(facebookAdsCampaigns.campaignId, campaignId)
      ))
      .returning();
    return result.length > 0;
  }
}

export const storage = new DbStorage();
