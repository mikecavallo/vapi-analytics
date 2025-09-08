import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, integer, boolean, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enhanced Users table for authentication system
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  emailVerified: boolean("email_verified").notNull().default(false),
  role: text("role").notNull().default("customer"), // 'customer' | 'super_admin'
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Email whitelist for controlled signup access
export const emailWhitelist = pgTable("email_whitelist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  createdByUserId: varchar("created_by_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Customers table for storing client companies and their Vapi API keys
export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  vapiApiKey: text("vapi_api_key").notNull(),
  description: text("description"),
  createdByUserId: varchar("created_by_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// User-Customer assignments for multi-tenant access
export const userCustomerAssignments = pgTable("user_customer_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  customerId: varchar("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  assignedByUserId: varchar("assigned_by_user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
}, (table) => ({
  userCustomerUnique: unique("user_customer_unique").on(table.userId, table.customerId),
}));

// Email verification tokens
export const emailVerificationTokens = pgTable("email_verification_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Authentication schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Customer management schemas
export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdByUserId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmailWhitelistSchema = createInsertSchema(emailWhitelist).omit({
  id: true,
  createdByUserId: true,
  createdAt: true,
});

export const insertUserCustomerAssignmentSchema = createInsertSchema(userCustomerAssignments).omit({
  id: true,
  assignedByUserId: true,
  createdAt: true,
});

// Email verification schema
export const emailVerificationSchema = z.object({
  token: z.string(),
});

// Authentication types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginRequest = z.infer<typeof loginSchema>;
export type SignupRequest = z.infer<typeof signupSchema>;

// Customer management types
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertEmailWhitelist = z.infer<typeof insertEmailWhitelistSchema>;
export type EmailWhitelist = typeof emailWhitelist.$inferSelect;
export type InsertUserCustomerAssignment = z.infer<typeof insertUserCustomerAssignmentSchema>;
export type UserCustomerAssignment = typeof userCustomerAssignments.$inferSelect;
export type EmailVerificationToken = typeof emailVerificationTokens.$inferSelect;

// User roles
export type UserRole = "customer" | "super_admin";

// Enhanced user type with customer assignments
export type UserWithCustomers = User & {
  customers: (UserCustomerAssignment & {
    customer: Customer;
  })[];
};

// JWT token payload
export type TokenPayload = {
  userId: string;
  email: string;
  role: UserRole;
  customerId?: string; // For customer users
};

// Vapi Analytics Types
export const vapiAnalyticsQuerySchema = z.object({
  name: z.string(),
  timeRange: z.object({
    start: z.string(),
    end: z.string(),
    timezone: z.string().optional(),
    step: z.enum(['hour', 'day', 'week', 'month']).optional(),
  }),
  table: z.enum(['call']).default('call'),
  operations: z.array(z.object({
    operation: z.enum(['sum', 'avg', 'count', 'min', 'max']),
    column: z.string(),
    alias: z.string().optional(),
  })),
  groupBy: z.array(z.string()).optional(),
  where: z.array(z.object({
    column: z.string(),
    operator: z.enum(['=', '!=', '>', '<', '>=', '<=', 'in', 'not_in']),
    value: z.union([z.string(), z.number(), z.array(z.string())]),
  })).optional(),
});

export type VapiAnalyticsQuery = z.infer<typeof vapiAnalyticsQuerySchema>;

export const vapiAnalyticsResponseSchema = z.object({
  name: z.string(),
  timeRange: z.object({
    start: z.string(),
    end: z.string(),
    timezone: z.string().optional(),
    step: z.string().optional(),
  }),
  result: z.array(z.record(z.any())),
});

export type VapiAnalyticsResponse = z.infer<typeof vapiAnalyticsResponseSchema>;

// Dashboard Data Types
export const dashboardDataSchema = z.object({
  kpis: z.object({
    totalCalls: z.number(),
    avgDuration: z.number(), // in seconds
    successRate: z.number(), // percentage
    inboundSuccessRate: z.number(), // percentage for inbound calls
    outboundSuccessRate: z.number(), // percentage for outbound calls
    totalCost: z.number(),
  }),
  mostSuccessfulAgent: z.object({
    name: z.string(),
    successRate: z.number(),
    totalCalls: z.number(),
  }).nullable(),
  callVolumeTrends: z.array(z.object({
    date: z.string(),
    calls: z.number(),
  })),
  callOutcomes: z.array(z.object({
    outcome: z.string(),
    count: z.number(),
    percentage: z.number(),
  })),
  assistantPerformance: z.array(z.object({
    assistantId: z.string(),
    name: z.string(),
    calls: z.number(),
    successRate: z.number(),
    avgDuration: z.number(),
    totalCost: z.number(),
  })),
  recentCalls: z.array(z.object({
    id: z.string(),
    assistantName: z.string(),
    duration: z.number(),
    cost: z.number(),
    status: z.string(),
    endedReason: z.string(),
    createdAt: z.string(),
    type: z.string(),
    assistantPhoneNumber: z.string(),
    customerPhoneNumber: z.string(),
    successEvaluation: z.string().optional(),
  })),
  costAnalysis: z.object({
    avgCostPerCall: z.number(),
    costPerMinute: z.number(),
    monthlyCostTrend: z.number(),
  }),
  durationDistribution: z.array(z.object({
    range: z.string(),
    count: z.number(),
  })),
  hourlyPatterns: z.array(z.object({
    hour: z.number(),
    calls: z.number(),
  })),
  // Advanced Analytics
  conversationFlow: z.object({
    stages: z.array(z.object({
      name: z.string(),
      performance: z.number(),
      avgDuration: z.string(),
      dropRate: z.number(),
    })),
    successPaths: z.array(z.object({
      name: z.string(),
      percentage: z.number(),
    })),
    dropOffPoints: z.array(z.object({
      name: z.string(),
      percentage: z.number(),
    })),
  }),
  durationHistogram: z.object({
    histogram: z.array(z.object({
      range: z.string(),
      count: z.number(),
      percentage: z.number(),
    })),
    stats: z.object({
      average: z.string(),
      median: z.string(),
      mostCommon: z.string(),
      longest: z.string(),
    }),
  }),
  peakUsageHeatmap: z.object({
    heatmapData: z.array(z.object({
      hour: z.string(),
      day: z.string(),
      calls: z.number(),
      intensity: z.number(),
    })),
    insights: z.object({
      peakHours: z.string(),
      busiestDay: z.string(),
      quietHours: z.string(),
    }),
  }),
  conversationOutcomes: z.object({
    summary: z.object({
      totalConversations: z.number(),
      successRate: z.number(),
      avgDuration: z.string(),
      avgSatisfaction: z.number(),
    }),
    outcomes: z.array(z.object({
      outcome: z.string(),
      volume: z.number(),
      percentage: z.number(),
      avgDuration: z.string(),
      satisfaction: z.number(),
      trend: z.number(),
    })),
  }),
  dailyMetrics: z.array(z.object({
    date: z.string(),
    calls: z.number(),
    successfulCalls: z.number(),
    failedCalls: z.number(),
    avgDuration: z.number(),
    totalCost: z.number(),
    avgCost: z.number(),
    successRate: z.number(),
  })),
});

export type DashboardData = z.infer<typeof dashboardDataSchema>;

// Authentication response types
export type AuthResponse = {
  user: {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    emailVerified: boolean;
  };
  token: string;
  customer?: {
    id: string;
    name: string;
  };
};
