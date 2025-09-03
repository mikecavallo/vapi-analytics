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

// Agency Management Schema
export const companies = pgTable("companies", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  apiKey: varchar("api_key", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCompanySchema = createInsertSchema(companies).pick({
  name: true,
  apiKey: true,
});

export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;

// Company Metrics Schema
export const companyMetricsSchema = z.object({
  companyId: z.number(),
  totalCalls: z.number(),
  totalCost: z.number(),
  callOutcomes: z.array(z.object({
    outcome: z.string(),
    count: z.number(),
    percentage: z.number(),
  })),
  callVolumeData: z.array(z.object({
    date: z.string(),
    calls: z.number(),
  })),
});

export type CompanyMetrics = z.infer<typeof companyMetricsSchema>;
