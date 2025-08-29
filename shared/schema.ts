import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

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
    totalCost: z.number(),
  }),
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
});

export type DashboardData = z.infer<typeof dashboardDataSchema>;
