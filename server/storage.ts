import { type User, type InsertUser, type VapiAnalyticsQuery, type VapiAnalyticsResponse, type DashboardData } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Analytics caching
  getCachedAnalytics(cacheKey: string): Promise<DashboardData | undefined>;
  setCachedAnalytics(cacheKey: string, data: DashboardData, ttl?: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private analyticsCache: Map<string, { data: DashboardData; expires: number }>;

  constructor() {
    this.users = new Map();
    this.analyticsCache = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

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

export const storage = new MemStorage();
