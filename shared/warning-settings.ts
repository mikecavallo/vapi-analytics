import { z } from "zod";

/**
 * Warning Settings Configuration
 * Defines customizable thresholds and levels for all system warnings
 */

// Individual warning configuration schema
const warningConfigSchema = z.object({
  enabled: z.boolean(),
  threshold: z.number(),
  level: z.enum(['info', 'warning', 'critical']),
});

// Complete warning settings schema
export const warningSettingsSchema = z.object({
  successRate: z.object({
    critical: warningConfigSchema, // Default: < 70%
    warning: warningConfigSchema,  // Default: < 85%
  }),
  costPerCall: z.object({
    warning: warningConfigSchema,  // Default: > $2.00
  }),
  callDuration: z.object({
    shortCalls: warningConfigSchema, // Default: < 30s
    longCalls: warningConfigSchema,  // Default: > 600s
  }),
  errorRate: z.object({
    critical: warningConfigSchema,  // Default: > 15%
    warning: warningConfigSchema,   // Default: > 5%
  }),
  assistantPerformance: z.object({
    threshold: warningConfigSchema, // Default: < 80% with > 10 calls
    minCallsRequired: z.number(),   // Default: 10
  }),
  callVolume: z.object({
    highVolume: warningConfigSchema, // Default: > 1000 calls
  }),
  quickHangups: z.object({
    threshold: warningConfigSchema,  // Default: > 30% of calls < 30s
  }),
});

export type WarningConfig = z.infer<typeof warningConfigSchema>;
export type WarningSettings = z.infer<typeof warningSettingsSchema>;

// Default warning settings
export const defaultWarningSettings: WarningSettings = {
  successRate: {
    critical: {
      enabled: true,
      threshold: 70,
      level: 'critical',
    },
    warning: {
      enabled: true,
      threshold: 85,
      level: 'warning',
    },
  },
  costPerCall: {
    warning: {
      enabled: true,
      threshold: 2.0,
      level: 'warning',
    },
  },
  callDuration: {
    shortCalls: {
      enabled: true,
      threshold: 30,
      level: 'warning',
    },
    longCalls: {
      enabled: true,
      threshold: 600,
      level: 'info',
    },
  },
  errorRate: {
    critical: {
      enabled: true,
      threshold: 15,
      level: 'critical',
    },
    warning: {
      enabled: true,
      threshold: 5,
      level: 'warning',
    },
  },
  assistantPerformance: {
    threshold: {
      enabled: true,
      threshold: 80,
      level: 'warning',
    },
    minCallsRequired: 10,
  },
  callVolume: {
    highVolume: {
      enabled: true,
      threshold: 1000,
      level: 'info',
    },
  },
  quickHangups: {
    threshold: {
      enabled: true,
      threshold: 30,
      level: 'warning',
    },
  },
};

// Warning descriptions for UI
export const warningDescriptions = {
  successRate: {
    critical: "Alert when overall success rate falls below this threshold",
    warning: "Warn when success rate is below target but not critical",
  },
  costPerCall: {
    warning: "Warn when average cost per call exceeds this amount (USD)",
  },
  callDuration: {
    shortCalls: "Warn when average call duration is unusually short (seconds)",
    longCalls: "Info alert for calls that are unusually long (seconds)",
  },
  errorRate: {
    critical: "Critical alert when error rate exceeds this percentage",
    warning: "Warning when error rate is elevated but manageable",
  },
  assistantPerformance: {
    threshold: "Warn when assistant success rate falls below this percentage",
    minCallsRequired: "Minimum number of calls before evaluating assistant performance",
  },
  callVolume: {
    highVolume: "Info alert when total calls exceed this number",
  },
  quickHangups: {
    threshold: "Warn when this percentage of calls end within 30 seconds",
  },
} as const;