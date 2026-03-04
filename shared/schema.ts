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
  loggedOutAt: timestamp("logged_out_at"), // Tracks last logout time for JWT invalidation
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
  vapiApiKey: text("vapi_api_key"), // Optional - users can set this later
  retellApiKey: text("retell_api_key"), // Optional - users can set this later
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

// Assistant Studio Configuration Schema
export const assistantConfigSchema = z.object({
  // Basic Information
  name: z.string().min(1, "Assistant name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().optional(),
  firstMessage: z.string().min(1, "First message is required").max(500, "First message must be less than 500 characters"),
  systemMessage: z.string().min(1, "System message is required").max(2000, "System message must be less than 2000 characters"),

  // First Message Configuration
  firstMessageMode: z.enum(['assistant-speaks-first', 'assistant-waits-for-user', 'assistant-speaks-first-with-model-generated-message']).default('assistant-speaks-first'),
  firstMessageInterruptionsEnabled: z.boolean().default(true),

  // Call Behavior
  maxDurationSeconds: z.number().min(30).max(3600).default(600),
  backgroundSound: z.enum(['office', 'nature', 'cafe', 'none']).default('office'),
  modelOutputInMessagesEnabled: z.boolean().default(false),

  // End Call Configuration
  voicemailMessage: z.string().max(500).optional(),
  endCallMessage: z.string().max(500).optional(),
  endCallPhrases: z.array(z.string()).default(['goodbye', 'thank you', 'have a great day']),
  voicemailDetection: z.object({
    provider: z.string().optional(),
    voicemailDetectionTypes: z.array(z.string()).optional(),
    enabled: z.boolean().default(false),
    machineDetectionTimeout: z.number().min(5).max(60).default(30),
  }).optional(),

  // Model Configuration
  model: z.object({
    provider: z.enum(['openai', 'anthropic', 'perplexity-ai', 'together-ai', 'anyscale', 'openrouter', 'groq', 'deepinfra', 'custom-llm']).default('openai'),
    model: z.string().min(1, "Model selection is required"),
    temperature: z.number().min(0).max(2).default(0.7),
    maxTokens: z.number().min(50).max(1000).default(150),
    emotionRecognitionEnabled: z.boolean().default(false),
    fallbackModels: z.array(z.object({
      provider: z.string(),
      model: z.string(),
    })).optional(),
  }),

  // Voice Configuration
  voice: z.object({
    provider: z.enum(['11labs', 'playht', 'azure', 'rime-ai', 'deepgram', 'openai', 'lmnt', 'neets']).default('11labs'),
    voiceId: z.string().min(1, "Voice selection is required"),
    stability: z.number().min(0).max(1).default(0.5).optional(),
    similarityBoost: z.number().min(0).max(1).default(0.8).optional(),
    style: z.number().min(0).max(1).default(0.0).optional(),
    useSpeakerBoost: z.boolean().default(true).optional(),
    optimizeStreamingLatency: z.number().min(0).max(4).default(3).optional(),
    inputPreprocessingEnabled: z.boolean().default(true).optional(),
  }),

  // Transcriber Configuration
  transcriber: z.object({
    provider: z.enum(['deepgram', 'assembly-ai', 'gladia', 'talkscriber']).default('deepgram'),
    model: z.string().default('nova-2'),
    language: z.string().default('en-US'),
    smartFormat: z.boolean().default(true),
    keywords: z.array(z.string()).default([]),
    endpointing: z.number().min(0).max(500).default(255).optional(),
  }),

  // Message Types
  clientMessages: z.array(z.string()).optional(),
  serverMessages: z.array(z.string()).optional(),

  // Analysis Configuration
  analysisPlan: z.object({
    summaryPrompt: z.string().max(1000).optional(),
    structuredDataSchema: z.record(z.any()).optional(),
    successEvaluationPrompt: z.string().max(1000).optional(),
    successEvaluationRubric: z.enum(['NumericScale', 'DescriptiveScale', 'Checklist', 'Matrix', 'PercentageScale', 'LikertScale', 'Binary', 'Custom']).optional(),
  }).optional(),

  // Advanced Plans
  startSpeakingPlan: z.object({
    waitSeconds: z.number().min(0).max(5).default(0.4),
    smartEndpointingEnabled: z.boolean().default(true),
    transcriptionEndpointingPlan: z.object({
      onPunctuationSeconds: z.number().min(0).max(3).optional(),
      onNoPunctuationSeconds: z.number().min(0).max(3).optional(),
      onNumberSeconds: z.number().min(0).max(3).optional(),
    }).optional(),
  }).optional(),

  stopSpeakingPlan: z.object({
    numWords: z.number().min(1).max(10).default(2),
    voiceSeconds: z.number().min(0).max(3).default(0.8),
    backoffSeconds: z.number().min(0).max(3).default(1.0),
  }).optional(),

  monitorPlan: z.object({
    listenEnabled: z.boolean().default(false),
    controlEnabled: z.boolean().default(false),
  }).optional(),

  backgroundSpeechDenoisingPlan: z.object({
    enabled: z.boolean().default(false),
    krispEnabled: z.boolean().default(false),
  }).optional(),

  // Function Calling Tools
  tools: z.array(z.object({
    type: z.literal('function'),
    function: z.object({
      name: z.string().min(1, "Function name is required"),
      description: z.string().min(1, "Function description is required"),
      parameters: z.record(z.any()),
    }),
    server: z.object({
      url: z.string().url("Invalid server URL"),
      secret: z.string().optional(),
    }).optional(),
  })).default([]),

  // Knowledge Base
  knowledgeBase: z.object({
    provider: z.string().optional(),
    topK: z.number().min(1).max(50).default(5),
    fileIds: z.array(z.string()).default([]),
  }).optional(),

  // Metadata
  metadata: z.record(z.any()).optional(),
});

// Assistant generation request schema (for AI generation)
export const assistantGenerationRequestSchema = z.object({
  name: z.string().min(1, "Assistant name is required"),
  description: z.string().min(10, "Please provide a detailed description (at least 10 characters)"),
  conversationFlow: z.string().min(10, "Please describe the conversation flow").optional(),
  voiceSettings: z.object({
    provider: z.enum(['11labs', 'playht', 'azure', 'rime-ai', 'deepgram', 'openai', 'lmnt', 'neets']).default('11labs'),
    tone: z.enum(['professional', 'friendly', 'casual', 'authoritative', 'empathetic', 'energetic']).default('professional'),
    gender: z.enum(['male', 'female', 'neutral']).default('neutral'),
  }),
  modelSettings: z.object({
    provider: z.enum(['openai', 'anthropic', 'perplexity-ai', 'together-ai', 'anyscale', 'openrouter', 'groq', 'deepinfra']).default('openai'),
    creativity: z.enum(['low', 'medium', 'high']).default('medium'), // Maps to temperature
    responseLength: z.enum(['concise', 'balanced', 'detailed']).default('balanced'), // Maps to maxTokens
  }),
  advancedFeatures: z.object({
    enableTools: z.boolean().default(false),
    enableKnowledgeBase: z.boolean().default(false),
    enableAnalytics: z.boolean().default(true),
    enableVoicemailDetection: z.boolean().default(false),
  }),
});

// Assistant creation request schema (for Vapi API)
export const assistantCreationRequestSchema = z.object({
  config: assistantConfigSchema,
});

// Export types
export type AssistantConfig = z.infer<typeof assistantConfigSchema>;
export type AssistantGenerationRequest = z.infer<typeof assistantGenerationRequestSchema>;
export type AssistantCreationRequest = z.infer<typeof assistantCreationRequestSchema>;

// Facebook Ads integration tables
export const facebookAdsAccounts = pgTable("facebook_ads_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  adAccountId: text("ad_account_id").notNull(),
  encryptedAccessToken: text("encrypted_access_token").notNull(), // Encrypted access token
  encryptedAppId: text("encrypted_app_id"), // Encrypted Facebook App ID
  encryptedAppSecret: text("encrypted_app_secret"), // Encrypted Facebook App Secret
  accountName: text("account_name"),
  tokenIssuedAt: timestamp("token_issued_at"), // When the token was issued
  tokenExpiresAt: timestamp("token_expires_at"), // When the token expires (if known)
  lastValidatedAt: timestamp("last_validated_at"), // Last time we validated the token
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
}, (table) => ({
  customerAdAccountUnique: unique("customer_ad_account_unique").on(table.customerId, table.adAccountId),
}));

// Facebook Ads campaigns cache table for better performance
export const facebookAdsCampaigns = pgTable("facebook_ads_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  facebookAdsAccountId: varchar("facebook_ads_account_id").notNull().references(() => facebookAdsAccounts.id, { onDelete: "cascade" }),
  campaignId: text("campaign_id").notNull(),
  campaignName: text("campaign_name").notNull(),
  status: text("status").notNull(),
  objective: text("objective"),
  lastUpdated: timestamp("last_updated").notNull().default(sql`now()`),
}, (table) => ({
  accountCampaignUnique: unique("account_campaign_unique").on(table.facebookAdsAccountId, table.campaignId),
}));

// Facebook Ads schemas
export const insertFacebookAdsAccountSchema = createInsertSchema(facebookAdsAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFacebookAdsCampaignSchema = createInsertSchema(facebookAdsCampaigns).omit({
  id: true,
  lastUpdated: true,
});

// Facebook Ads types
export type InsertFacebookAdsAccount = z.infer<typeof insertFacebookAdsAccountSchema>;
export type FacebookAdsAccount = typeof facebookAdsAccounts.$inferSelect;

// Extended type returned by storage after decrypting credentials
export type DecryptedFacebookAdsAccount = FacebookAdsAccount & {
  accessToken: string;
  appId?: string;
  appSecret?: string;
};

export type InsertFacebookAdsCampaign = z.infer<typeof insertFacebookAdsCampaignSchema>;
export type FacebookAdsCampaign = typeof facebookAdsCampaigns.$inferSelect;

// Facebook Ads API response types
export const facebookAdsInsightsSchema = z.object({
  campaign_id: z.string().optional(),
  campaign_name: z.string().optional(),
  adset_id: z.string().optional(),
  adset_name: z.string().optional(),
  ad_id: z.string().optional(),
  ad_name: z.string().optional(),
  impressions: z.string().optional(),
  reach: z.string().optional(),
  clicks: z.string().optional(),
  unique_clicks: z.string().optional(),
  spend: z.string().optional(),
  cpm: z.string().optional(),
  cpc: z.string().optional(),
  ctr: z.string().optional(),
  unique_ctr: z.string().optional(),
  unique_link_clicks_ctr: z.string().optional(),
  outbound_clicks: z.string().optional(),
  outbound_clicks_ctr: z.string().optional(),
  unique_outbound_clicks: z.string().optional(),
  unique_outbound_clicks_ctr: z.string().optional(),
  actions: z.array(z.object({
    action_type: z.string(),
    value: z.string(),
  })).optional(),
  cost_per_action_type: z.array(z.object({
    action_type: z.string(),
    value: z.string(),
  })).optional(),
  action_values: z.array(z.object({
    action_type: z.string(),
    value: z.string(),
  })).optional(),
  date_start: z.string(),
  date_stop: z.string(),
});

export const facebookAdsMetricsSchema = z.object({
  adAccountId: z.string(),
  level: z.enum(['campaign', 'adset', 'ad']),
  data: z.array(facebookAdsInsightsSchema),
  dateRange: z.object({
    since: z.string(),
    until: z.string(),
  }),
});

// Processed Facebook Ads metrics for frontend
export const processedFacebookAdsMetricsSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: z.enum(['campaign', 'adset', 'ad']),
  parentId: z.string().optional(),
  amountSpent: z.number(),
  reach: z.number(),
  impressions: z.number(),
  cpm: z.number(),
  uniqueClicks: z.number(),
  costPerUniqueClick: z.number(),
  uniqueCtr: z.number(),
  uniqueLinkClicks: z.number(),
  costPerUniqueLinkClick: z.number(),
  uniqueLinkClicksCtr: z.number(),
  uniqueOutboundClicks: z.number(),
  costPerUniqueOutboundClick: z.number(),
  outboundCtr: z.number(),
  results: z.number(),
  costPerResult: z.number(),
  resultRate: z.number(),
  roas: z.number(),
  dateRange: z.object({
    since: z.string(),
    until: z.string(),
  }),
});

export type FacebookAdsInsights = z.infer<typeof facebookAdsInsightsSchema>;
export type FacebookAdsMetrics = z.infer<typeof facebookAdsMetricsSchema>;
export type ProcessedFacebookAdsMetrics = z.infer<typeof processedFacebookAdsMetricsSchema>;

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
