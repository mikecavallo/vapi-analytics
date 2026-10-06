import type { Express } from "express";
import { authenticateUser } from "../auth-middleware";
import { auditLog, MAX_PROMPT_LENGTH } from "./shared";

export function registerAssistantRoutes(app: Express): void {
  // Assistant Studio endpoints
  app.post("/api/assistant-studio/generate", authenticateUser, async (req, res) => {
    try {
      const {
        name,
        description,
        conversationFlow,
        voiceSettings,
        // Call behavior
        firstMessageMode,
        firstMessageInterruptionsEnabled,
        maxDurationSeconds,
        backgroundSound,
        modelOutputInMessagesEnabled,
        // Messages
        voicemailMessage,
        endCallMessage,
        endCallPhrases,
        // Advanced features
        enableAnalysis,
        enableMonitoring,
        enableDenoising,
        startSpeakingWait,
        stopSpeakingWords,
        metadata
      } = req.body;
      const openaiApiKey = process.env.OPENAI_API_KEY;

      if (!openaiApiKey) {
        return res.status(500).json({ error: "OpenAI API key not configured" });
      }

      if (!name || !description) {
        return res.status(400).json({ error: "Assistant name and description are required" });
      }

      if (typeof description === 'string' && description.length > MAX_PROMPT_LENGTH) {
        return res.status(400).json({ error: `Description exceeds maximum length of ${MAX_PROMPT_LENGTH} characters` });
      }

      if (conversationFlow && typeof conversationFlow === 'string' && conversationFlow.length > MAX_PROMPT_LENGTH) {
        return res.status(400).json({ error: `Conversation flow exceeds maximum length of ${MAX_PROMPT_LENGTH} characters` });
      }

      const openai = new (await import('openai')).default({ apiKey: openaiApiKey });

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
${voiceSettings ? `Voice Settings: ${voiceSettings}` : ''}

CALL BEHAVIOR SETTINGS:
- First Message Mode: ${firstMessageMode || 'assistant-speaks-first'}
- Allow First Message Interruptions: ${firstMessageInterruptionsEnabled || false}
- Max Call Duration: ${maxDurationSeconds || 600} seconds
- Background Sound: ${backgroundSound || 'office'}
- Use Model Output in Messages: ${modelOutputInMessagesEnabled || false}

MESSAGE CONFIGURATION:
${voicemailMessage ? `- Voicemail Message: ${voicemailMessage}` : ''}
${endCallMessage ? `- End Call Message: ${endCallMessage}` : ''}
${endCallPhrases?.length ? `- Auto-Hangup Phrases: ${endCallPhrases.join(', ')}` : ''}

ADVANCED FEATURES:
- Enable Call Analysis: ${enableAnalysis || false}
- Enable Call Monitoring: ${enableMonitoring || false}  
- Enable Background Noise Reduction: ${enableDenoising || true}
- Start Speaking Delay: ${startSpeakingWait || 0.5} seconds
- Stop on Interruption: ${stopSpeakingWords || 2} words
${metadata ? `- Custom Metadata: ${JSON.stringify(metadata)}` : ''}

Apply these specific settings and create a comprehensive assistant configuration that matches the user's requirements. Use the exact name provided and configure all the advanced features as specified.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
      });

      const responseContent = response.choices[0].message.content || '';

      let assistantConfig;
      try {
        // Try to find JSON in the response if it's wrapped in other text
        const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : responseContent;
        assistantConfig = JSON.parse(jsonString);
      } catch (parseError) {
        console.error("JSON parsing error:", parseError);
        console.error("Response content:", responseContent);
        return res.status(500).json({ error: "Failed to parse assistant configuration from AI response" });
      }

      if (!assistantConfig.name || !assistantConfig.firstMessage || !assistantConfig.systemMessage) {
        return res.status(500).json({ error: "Invalid assistant configuration generated" });
      }

      console.log(`[${new Date().toLocaleTimeString()}] Generated assistant configuration: ${assistantConfig.name}`);
      res.json({
        config: assistantConfig,
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Assistant generation error:", error);
      res.status(500).json({ error: "Failed to generate assistant configuration" });
    }
  });

  app.post("/api/assistant-studio/create", authenticateUser, async (req, res) => {
    try {
      const { config } = req.body;
      const vapiApiKey = process.env.VAPI_API_KEY || "";

      if (!vapiApiKey) {
        return res.status(500).json({ error: "Vapi API key not configured" });
      }

      if (!config) {
        return res.status(400).json({ error: "Assistant configuration is required" });
      }

      // Create assistant through Vapi API with comprehensive configuration
      const vapiPayload = {
        name: config.name,
        firstMessage: config.firstMessage,
        firstMessageMode: config.firstMessageMode || 'assistant-speaks-first',
        firstMessageInterruptionsEnabled: config.firstMessageInterruptionsEnabled || false,
        maxDurationSeconds: config.maxDurationSeconds || config.conversationConfig?.maxDurationSeconds || 600,
        backgroundSound: config.backgroundSound || config.conversationConfig?.backgroundSound || 'office',
        modelOutputInMessagesEnabled: config.modelOutputInMessagesEnabled || config.conversationConfig?.modelOutputInMessagesEnabled || false,
        ...(config.voicemailMessage && { voicemailMessage: config.voicemailMessage }),
        ...(config.endCallMessage && { endCallMessage: config.endCallMessage }),
        ...(config.endCallPhrases && config.endCallPhrases.length > 0 && { endCallPhrases: config.endCallPhrases }),
        model: {
          provider: config.model.provider,
          model: config.model.model,
          temperature: config.model.temperature,
          maxTokens: config.model.maxTokens,
          emotionRecognitionEnabled: config.model.emotionRecognitionEnabled
        },
        voice: {
          provider: config.voice.provider,
          voiceId: config.voice.voiceId,
          stability: config.voice.stability,
          similarityBoost: config.voice.similarityBoost,
          style: config.voice.style,
          useSpeakerBoost: config.voice.useSpeakerBoost
        },
        transcriber: {
          provider: config.transcriber.provider,
          model: config.transcriber.model,
          language: config.transcriber.language,
          smartFormat: config.transcriber.smartFormat,
          keywords: config.transcriber.keywords
        },
        ...(config.analysisPlan && {
          analysisPlan: {
            summaryPrompt: config.analysisPlan.summaryPrompt,
            structuredDataSchema: config.analysisPlan.structuredDataSchema
          }
        }),
        ...(config.analysisSettings && {
          analysisPlan: {
            summaryPrompt: config.analysisSettings.summaryPrompt,
            structuredDataSchema: config.analysisSettings.structuredDataSchema
          }
        }),
        ...(config.startSpeakingPlan && {
          startSpeakingPlan: {
            waitSeconds: config.startSpeakingPlan.waitSeconds,
            smartEndpointingEnabled: config.startSpeakingPlan.smartEndpointingEnabled
          }
        }),
        ...(config.stopSpeakingPlan && {
          stopSpeakingPlan: {
            numWords: config.stopSpeakingPlan.numWords,
            voiceSeconds: Math.min(config.stopSpeakingPlan.voiceSeconds || 0.4, 0.5),
            backoffSeconds: config.stopSpeakingPlan.backoffSeconds
          }
        }),
        ...(config.monitorPlan && {
          monitorPlan: {
            listenEnabled: config.monitorPlan.listenEnabled,
            controlEnabled: config.monitorPlan.controlEnabled
          }
        }),
        ...(config.backgroundSpeechDenoisingPlan && {
          backgroundSpeechDenoisingPlan: {}
        }),
        ...(config.metadata && { metadata: config.metadata })
      };

      const response = await fetch("https://api.vapi.ai/assistant", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${vapiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vapiPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Vapi API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const createdAssistant = await response.json();

      auditLog('ASSISTANT_CREATED', req.user?.id, { assistantId: createdAssistant.id, assistantName: config.name });

      console.log(`[${new Date().toLocaleTimeString()}] Created assistant: ${createdAssistant.id}`);
      res.json({
        assistant: createdAssistant,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Assistant creation error:", error);
      res.status(500).json({ error: "Failed to create assistant via Vapi API" });
    }
  });

  // Assistant CRUD endpoints
  app.get("/api/assistants", authenticateUser, async (req, res) => {
    try {
      const vapiApiKey = process.env.VAPI_API_KEY || "";
      if (!vapiApiKey) {
        return res.status(500).json({ error: "Vapi API key not configured" });
      }

      const response = await fetch("https://api.vapi.ai/assistant", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${vapiApiKey}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Vapi API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const assistants = await response.json();
      res.json(assistants);
    } catch (error) {
      console.error("List assistants error:", error);
      res.status(500).json({ error: "Failed to fetch assistants from Vapi API" });
    }
  });

  app.get("/api/assistants/:id", authenticateUser, async (req, res) => {
    try {
      const vapiApiKey = process.env.VAPI_API_KEY || "";
      if (!vapiApiKey) {
        return res.status(500).json({ error: "Vapi API key not configured" });
      }

      const { id } = req.params;
      const response = await fetch(`https://api.vapi.ai/assistant/${id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${vapiApiKey}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Vapi API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const assistant = await response.json();
      res.json(assistant);
    } catch (error) {
      console.error("Get assistant error:", error);
      res.status(500).json({ error: "Failed to fetch assistant from Vapi API" });
    }
  });

  app.delete("/api/assistants/:id", authenticateUser, async (req, res) => {
    try {
      const vapiApiKey = process.env.VAPI_API_KEY || "";
      if (!vapiApiKey) {
        return res.status(500).json({ error: "Vapi API key not configured" });
      }

      const { id } = req.params;
      const response = await fetch(`https://api.vapi.ai/assistant/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${vapiApiKey}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Vapi API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      auditLog('ASSISTANT_DELETED', req.user?.id, { assistantId: id });
      res.json({ success: true, deletedId: id });
    } catch (error) {
      console.error("Delete assistant error:", error);
      res.status(500).json({ error: "Failed to delete assistant from Vapi API" });
    }
  });

  app.patch("/api/assistants/:id", authenticateUser, async (req, res) => {
    try {
      const vapiApiKey = process.env.VAPI_API_KEY || "";
      if (!vapiApiKey) {
        return res.status(500).json({ error: "Vapi API key not configured" });
      }

      const { id } = req.params;
      const response = await fetch(`https://api.vapi.ai/assistant/${id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${vapiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Vapi API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const updatedAssistant = await response.json();
      auditLog('ASSISTANT_UPDATED', req.user?.id, { assistantId: id });
      res.json(updatedAssistant);
    } catch (error) {
      console.error("Update assistant error:", error);
      res.status(500).json({ error: "Failed to update assistant via Vapi API" });
    }
  });
}
