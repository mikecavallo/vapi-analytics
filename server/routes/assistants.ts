import type { Express } from "express";
import { authenticateUser, requireCustomerAccess, validateCustomerAccess } from "../auth-middleware";
import { requireOpenAiKey, sendError, HttpError } from "../http-error";
import { getTenantContext, requireTenantKey } from "../providers/tenant";
import {
  assertProviderId,
  createAssistant,
  deleteAssistant,
  getOwnedAssistant,
  listAssistants,
  updateAssistant,
} from "../providers/vapi-api";
import { DEMO_ASSISTANTS } from "../demo/sample-calls";
import { auditLog } from "./shared";
import { assistantConfigInputSchema, assistantGenerateSchema, assistantPatchSchema } from "./validation";

// Every Assistant Studio route runs as the signed-in customer and talks to Vapi with that
// customer's own stored key (see providers/tenant.ts). The platform VAPI_API_KEY is never used.
const customerOnly = [authenticateUser, requireCustomerAccess, validateCustomerAccess];

/** Read-only sample assistants shown to demo workspaces (no Vapi key connected). */
function demoAssistants() {
  return DEMO_ASSISTANTS.map((a) => ({
    id: a.id,
    name: a.name,
    demo: true,
    model: { provider: "openai", model: "sample" },
    voice: { provider: "sample", voiceId: "sample" },
    createdAt: null,
  }));
}

/** Maps the Studio form config to the Vapi create-assistant payload. */
export function buildVapiAssistantPayload(config: any): Record<string, unknown> {
  return {
    name: config.name,
    firstMessage: config.firstMessage,
    firstMessageMode: config.firstMessageMode || "assistant-speaks-first",
    firstMessageInterruptionsEnabled: config.firstMessageInterruptionsEnabled || false,
    maxDurationSeconds: config.maxDurationSeconds || 600,
    backgroundSound: config.backgroundSound || "office",
    modelOutputInMessagesEnabled: config.modelOutputInMessagesEnabled || false,
    ...(config.voicemailMessage && { voicemailMessage: config.voicemailMessage }),
    ...(config.endCallMessage && { endCallMessage: config.endCallMessage }),
    ...(config.endCallPhrases?.length > 0 && { endCallPhrases: config.endCallPhrases }),
    model: {
      provider: config.model.provider,
      model: config.model.model,
      temperature: config.model.temperature,
      maxTokens: config.model.maxTokens,
      emotionRecognitionEnabled: config.model.emotionRecognitionEnabled,
      ...(config.systemMessage && { messages: [{ role: "system", content: config.systemMessage }] }),
    },
    voice: {
      provider: config.voice.provider,
      voiceId: config.voice.voiceId,
      stability: config.voice.stability,
      similarityBoost: config.voice.similarityBoost,
      style: config.voice.style,
      useSpeakerBoost: config.voice.useSpeakerBoost,
    },
    transcriber: {
      provider: config.transcriber.provider,
      model: config.transcriber.model,
      language: config.transcriber.language,
      smartFormat: config.transcriber.smartFormat,
      keywords: config.transcriber.keywords,
    },
    ...(config.analysisPlan && {
      analysisPlan: {
        summaryPrompt: config.analysisPlan.summaryPrompt,
        structuredDataSchema: config.analysisPlan.structuredDataSchema,
      },
    }),
    ...(config.startSpeakingPlan && {
      startSpeakingPlan: {
        waitSeconds: config.startSpeakingPlan.waitSeconds,
        smartEndpointingEnabled: config.startSpeakingPlan.smartEndpointingEnabled,
      },
    }),
    ...(config.stopSpeakingPlan && {
      stopSpeakingPlan: {
        numWords: config.stopSpeakingPlan.numWords,
        voiceSeconds: Math.min(config.stopSpeakingPlan.voiceSeconds || 0.4, 0.5),
        backoffSeconds: config.stopSpeakingPlan.backoffSeconds,
      },
    }),
    ...(config.monitorPlan && {
      monitorPlan: {
        listenEnabled: config.monitorPlan.listenEnabled,
        controlEnabled: config.monitorPlan.controlEnabled,
      },
    }),
    ...(config.backgroundSpeechDenoisingPlan && { backgroundSpeechDenoisingPlan: {} }),
    ...(config.metadata && { metadata: config.metadata }),
  };
}

export function registerAssistantRoutes(app: Express): void {
  // Generate an assistant config with OpenAI. Does not touch Vapi.
  app.post("/api/assistant-studio/generate", ...customerOnly, async (req, res) => {
    try {
      const openaiApiKey = requireOpenAiKey();
      const { name, description, conversationFlow } = assistantGenerateSchema.parse(req.body);
      const {
        voiceSettings,
        firstMessageMode,
        firstMessageInterruptionsEnabled,
        maxDurationSeconds,
        backgroundSound,
        modelOutputInMessagesEnabled,
        voicemailMessage,
        endCallMessage,
        endCallPhrases,
        enableAnalysis,
        enableMonitoring,
        enableDenoising,
        startSpeakingWait,
        stopSpeakingWords,
        metadata,
      } = req.body;

      const openai = new (await import("openai")).default({ apiKey: openaiApiKey });

      const systemPrompt = `You are an expert AI assistant configuration specialist for voice AI systems using the Vapi platform. Your job is to create comprehensive assistant configurations based on user descriptions and preferences.

Key Requirements:
1. Generate professional and context-appropriate conversation scripts
2. Create natural conversation flows with proper error handling  
3. Optimize for voice interaction (clear, concise responses)
4. Apply user-specified call behavior and advanced features
5. Configure technical settings appropriately for the use case

IMPORTANT: You must respond with ONLY a valid JSON object that follows this exact structure (no additional text before or after the JSON):
{
  "name": "Assistant name from user input",
  "firstMessage": "Initial greeting message",
  "systemMessage": "The full system prompt that defines the assistant's role, tone, and conversation flow",
  "firstMessageMode": "assistant-speaks-first",
  "firstMessageInterruptionsEnabled": false, 
  "maxDurationSeconds": 600,
  "backgroundSound": "office",
  "modelOutputInMessagesEnabled": false,
  "voicemailMessage": "Optional voicemail message",
  "endCallMessage": "Optional end call message", 
  "endCallPhrases": ["goodbye", "thank you", "have a great day"],
  "model": {
    "provider": "openai",
    "model": "gpt-4",
    "temperature": 0.7,
    "maxTokens": 150,
    "emotionRecognitionEnabled": true
  },
  "voice": {
    "provider": "11labs", 
    "voiceId": "recommended voice ID based on use case",
    "stability": 0.5,
    "similarityBoost": 0.8,
    "style": 0.0,
    "useSpeakerBoost": true
  },
  "transcriber": {
    "provider": "deepgram",
    "model": "nova-2", 
    "language": "en-US",
    "smartFormat": true,
    "keywords": ["relevant", "keywords", "for", "use case"]
  },
  "analysisPlan": {
    "summaryPrompt": "Summarize this call focusing on key outcomes and insights",
    "structuredDataSchema": {
      "type": "object", 
      "properties": {
        "callOutcome": {"type": "string"},
        "satisfaction": {"type": "number", "minimum": 1, "maximum": 5},
        "followUpRequired": {"type": "boolean"}
      }
    }
  },
  "startSpeakingPlan": {
    "waitSeconds": 0.5,
    "smartEndpointingEnabled": true  
  },
  "stopSpeakingPlan": {
    "numWords": 2,
    "voiceSeconds": 0.4,
    "backoffSeconds": 0.5
  },
  "monitorPlan": {
    "listenEnabled": false,
    "controlEnabled": false
  },
  "backgroundSpeechDenoisingPlan": {},
  "metadata": {},
  "expectedOutcomes": ["What this assistant should accomplish"],
  "complianceNotes": ["Any compliance or operational considerations"]
}`;

      const userPrompt = `Create a voice assistant configuration with the following requirements:

REQUIRED FIELDS:
- Assistant Name: ${name}
- Description: ${description}

ADDITIONAL CONTEXT:
${conversationFlow ? `Conversation Flow: ${conversationFlow}` : ''}
${voiceSettings ? `Voice Settings: ${JSON.stringify(voiceSettings)}` : ''}

CALL BEHAVIOR SETTINGS:
- First Message Mode: ${firstMessageMode || 'assistant-speaks-first'}
- Allow First Message Interruptions: ${firstMessageInterruptionsEnabled || false}
- Max Call Duration: ${maxDurationSeconds || 600} seconds
- Background Sound: ${backgroundSound || 'office'}
- Use Model Output in Messages: ${modelOutputInMessagesEnabled || false}

MESSAGE CONFIGURATION:
${voicemailMessage ? `- Voicemail Message: ${voicemailMessage}` : ''}
${endCallMessage ? `- End Call Message: ${endCallMessage}` : ''}
${Array.isArray(endCallPhrases) && endCallPhrases.length ? `- Auto-Hangup Phrases: ${endCallPhrases.join(', ')}` : ''}

ADVANCED FEATURES:
- Enable Call Analysis: ${enableAnalysis || false}
- Enable Call Monitoring: ${enableMonitoring || false}  
- Enable Background Noise Reduction: ${enableDenoising || true}
- Start Speaking Delay: ${startSpeakingWait || 0.5} seconds
- Stop on Interruption: ${stopSpeakingWords || 2} words
${metadata ? `- Custom Metadata: ${JSON.stringify(metadata)}` : ''}

Apply these specific settings and create a comprehensive assistant configuration that matches the user's requirements. Use the exact name provided and configure all the advanced features as specified.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
      });

      const responseContent = response.choices[0].message.content || "";
      let assistantConfig;
      try {
        const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
        assistantConfig = JSON.parse(jsonMatch ? jsonMatch[0] : responseContent);
      } catch {
        throw new HttpError(502, "The AI response could not be parsed. Please try again.");
      }

      if (!assistantConfig.name || !assistantConfig.firstMessage || !assistantConfig.systemMessage) {
        throw new HttpError(502, "The AI returned an incomplete configuration. Please try again.");
      }

      res.json({ config: assistantConfig, generatedAt: new Date().toISOString() });
    } catch (error) {
      sendError(res, error, "Failed to generate assistant configuration", "assistant-generate");
    }
  });

  // Create an assistant on the customer's own Vapi account.
  app.post("/api/assistant-studio/create", ...customerOnly, async (req, res) => {
    try {
      const { key } = await requireTenantKey(req, "vapi");
      // Accept both { config } and the bare config object the Studio form posts.
      const config = assistantConfigInputSchema.parse(req.body?.config ?? req.body);
      const createdAssistant = await createAssistant(key, buildVapiAssistantPayload(config));

      auditLog("ASSISTANT_CREATED", req.user?.id, { customerId: req.customerId, assistantId: createdAssistant.id });
      res.json({ assistant: createdAssistant, createdAt: new Date().toISOString() });
    } catch (error) {
      sendError(res, error, "Failed to create assistant via Vapi API", "assistant-create");
    }
  });

  // List the assistants on the customer's own Vapi account (sample assistants in demo mode).
  app.get("/api/assistants", ...customerOnly, async (req, res) => {
    try {
      const ctx = await getTenantContext(req, "vapi");
      if (ctx.demo) return res.json(demoAssistants());
      res.json(await listAssistants(ctx.key!));
    } catch (error) {
      sendError(res, error, "Failed to fetch assistants from Vapi API", "assistant-list");
    }
  });

  app.get("/api/assistants/:id", ...customerOnly, async (req, res) => {
    try {
      const id = assertProviderId(req.params.id, "assistant ID");
      const ctx = await getTenantContext(req, "vapi");
      const assistant = ctx.demo
        ? demoAssistants().find((a) => a.id === id) ?? null
        : await getOwnedAssistant(ctx.key!, id);
      if (!assistant) return res.status(404).json({ error: "Assistant not found" });
      res.json(assistant);
    } catch (error) {
      sendError(res, error, "Failed to fetch assistant from Vapi API", "assistant-get");
    }
  });

  app.delete("/api/assistants/:id", ...customerOnly, async (req, res) => {
    try {
      const id = assertProviderId(req.params.id, "assistant ID");
      const { key } = await requireTenantKey(req, "vapi");
      await deleteAssistant(key, id);
      auditLog("ASSISTANT_DELETED", req.user?.id, { customerId: req.customerId, assistantId: id });
      res.json({ success: true, deletedId: id });
    } catch (error) {
      sendError(res, error, "Failed to delete assistant from Vapi API", "assistant-delete");
    }
  });

  app.patch("/api/assistants/:id", ...customerOnly, async (req, res) => {
    try {
      const id = assertProviderId(req.params.id, "assistant ID");
      const patch = assistantPatchSchema.parse(req.body);
      const { key } = await requireTenantKey(req, "vapi");
      const updated = await updateAssistant(key, id, patch);
      auditLog("ASSISTANT_UPDATED", req.user?.id, { customerId: req.customerId, assistantId: id });
      res.json(updated);
    } catch (error) {
      sendError(res, error, "Failed to update assistant via Vapi API", "assistant-update");
    }
  });
}
