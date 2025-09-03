import { type User, type InsertUser, type VapiAnalyticsQuery, type VapiAnalyticsResponse, type DashboardData, type Company, type InsertCompany, type CompanyMetrics } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Analytics caching
  getCachedAnalytics(cacheKey: string): Promise<DashboardData | undefined>;
  setCachedAnalytics(cacheKey: string, data: DashboardData, ttl?: number): Promise<void>;
  
  // Agency management
  getCompanies(): Promise<Company[]>;
  getCompany(id: number): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  deleteCompany(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private companies: Map<number, Company>;
  private analyticsCache: Map<string, { data: DashboardData; expires: number }>;
  private companyIdCounter: number;

  constructor() {
    this.users = new Map();
    this.companies = new Map();
    this.analyticsCache = new Map();
    this.companyIdCounter = 1;
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

  async getCompanies(): Promise<Company[]> {
    return Array.from(this.companies.values());
  }

  async getCompany(id: number): Promise<Company | undefined> {
    return this.companies.get(id);
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const id = this.companyIdCounter++;
    const company: Company = {
      ...insertCompany,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.companies.set(id, company);
    return company;
  }

  async deleteCompany(id: number): Promise<void> {
    this.companies.delete(id);
  }
}

export const storage = new MemStorage();
