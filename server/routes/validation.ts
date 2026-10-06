import { z } from "zod";
import { MAX_ANALYSIS_CALLS_FLOW, MAX_PROMPT_LENGTH } from "./shared";

/** zod schemas for request bodies on mutating routes. */

const providerId = z.string().regex(/^[A-Za-z0-9_-]{1,128}$/, "Invalid ID");
const prompt = z.string().trim().min(1).max(MAX_PROMPT_LENGTH);
const apiKey = z.string().trim().min(8, "API key looks too short").max(512);

export const profileUpdateSchema = z
  .object({
    username: z.string().trim().min(2, "Username must be at least 2 characters long").max(64).optional(),
    email: z.string().trim().email("Invalid email format").max(254).optional(),
  })
  .strict()
  .refine((v) => v.username !== undefined || v.email !== undefined, {
    message: "At least one field (username or email) is required",
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1).max(128),
    newPassword: z.string().min(1).max(128),
  })
  .strict();

export const customerApiKeySchema = z
  .object({
    vapiApiKey: apiKey.optional().or(z.literal("")),
    retellApiKey: apiKey.optional().or(z.literal("")),
  })
  .strict()
  .refine((v) => !!v.vapiApiKey || !!v.retellApiKey, { message: "At least one valid API key is required" });

export const adminCreateCustomerSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(200),
    description: z.string().trim().max(1000).optional().nullable(),
    vapiApiKey: apiKey.optional().or(z.literal("")),
    retellApiKey: apiKey.optional().or(z.literal("")),
  })
  .strict();

export const whitelistEmailSchema = z.object({ email: z.string().trim().toLowerCase().email().max(254) }).strict();

// Assistant Studio. The generated config is loose on purpose (the client form owns the full
// shape), but the fields the server reads are typed and size-limited.
const looseObject = z.record(z.unknown());

export const assistantGenerateSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    description: prompt,
    conversationFlow: z.string().max(MAX_PROMPT_LENGTH).optional(),
  })
  .passthrough();

export const assistantConfigInputSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    firstMessage: z.string().min(1).max(1000),
    systemMessage: z.string().max(MAX_PROMPT_LENGTH).optional(),
    firstMessageMode: z.string().max(100).optional(),
    firstMessageInterruptionsEnabled: z.boolean().optional(),
    maxDurationSeconds: z.number().min(10).max(43200).optional(),
    backgroundSound: z.string().max(50).optional(),
    modelOutputInMessagesEnabled: z.boolean().optional(),
    voicemailMessage: z.string().max(1000).optional(),
    endCallMessage: z.string().max(1000).optional(),
    endCallPhrases: z.array(z.string().max(200)).max(50).optional(),
    model: z.object({ provider: z.string().min(1).max(50), model: z.string().min(1).max(100) }).passthrough(),
    voice: z.object({ provider: z.string().min(1).max(50), voiceId: z.string().min(1).max(200) }).passthrough(),
    transcriber: z.object({ provider: z.string().min(1).max(50) }).passthrough(),
    analysisPlan: looseObject.optional(),
    startSpeakingPlan: looseObject.optional(),
    stopSpeakingPlan: looseObject.optional(),
    monitorPlan: looseObject.optional(),
    backgroundSpeechDenoisingPlan: looseObject.optional(),
    metadata: looseObject.optional(),
  })
  .passthrough();

/** PATCH /api/assistants/:id only forwards these top-level Vapi fields. */
export const assistantPatchSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    firstMessage: z.string().max(1000),
    firstMessageMode: z.string().max(100),
    firstMessageInterruptionsEnabled: z.boolean(),
    maxDurationSeconds: z.number().min(10).max(43200),
    backgroundSound: z.string().max(50),
    modelOutputInMessagesEnabled: z.boolean(),
    voicemailMessage: z.string().max(1000),
    endCallMessage: z.string().max(1000),
    endCallPhrases: z.array(z.string().max(200)).max(50),
    model: looseObject,
    voice: looseObject,
    transcriber: looseObject,
    analysisPlan: looseObject,
    startSpeakingPlan: looseObject,
    stopSpeakingPlan: looseObject,
    monitorPlan: looseObject,
    backgroundSpeechDenoisingPlan: looseObject,
    metadata: looseObject,
  })
  .partial()
  .strict()
  .refine((v) => Object.keys(v).length > 0, { message: "No fields to update" });

const callIds = z.array(providerId).min(1).max(MAX_ANALYSIS_CALLS_FLOW);

export const optimizePromptSchema = z.object({
  assistantId: providerId,
  currentPrompt: prompt,
  transcriptIds: z.array(providerId).min(1).max(10),
});

export const generateReportSchema = z.object({
  reportType: z.enum(["executive", "detailed", "compliance", "performance"]).default("executive"),
  dateRange: z.object({ from: z.string().datetime({ offset: true }).optional(), to: z.string().datetime({ offset: true }).optional() }).optional(),
  includeTranscripts: z.boolean().optional(),
  includeBenchmarks: z.boolean().optional(),
  customFilters: z.object({ assistantId: providerId.optional(), status: z.string().max(50).optional() }).optional(),
});

export const conversationFlowSchema = z.object({
  callIds,
  analysisType: z.string().max(MAX_PROMPT_LENGTH).optional(),
});

const analysisCall = z
  .object({
    id: z.string().max(200),
    transcript: z.string().max(100_000).optional().nullable(),
    duration: z.number().optional().nullable(),
    cost: z.number().optional().nullable(),
    endedReason: z.string().max(200).optional().nullable(),
    status: z.string().max(100).optional().nullable(),
  })
  .passthrough();

export const bulkAnalyzeSchema = z
  .object({
    query: z.string().max(MAX_PROMPT_LENGTH).optional(),
    analysisType: z.string().max(MAX_PROMPT_LENGTH).optional(),
    provider: z.enum(["vapi", "retell"]).optional(),
    filters: looseObject.optional(),
    callIds: z.array(z.string().max(200)).max(1000).optional(),
    calls: z.array(analysisCall).max(1000).optional(),
  })
  .refine((v) => (v.query ?? v.analysisType ?? "").trim().length > 0, { message: "A question is required" });

export const chatbotQuerySchema = z.object({
  query: prompt,
  dashboardData: z.unknown().optional(),
});
