import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ChartLine,
  MessageSquare,
  Wand2,
  Download,
  Settings,
  Phone,
  MessageCircle,
  Loader2,
  Brain,
  Activity,
  FileText,
  Copy,
  CheckCircle2,
  Mic,
  Volume2,
  CheckCircle,
  Calendar,
  User,
  Sun,
  Moon,
  HelpCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/theme-context";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AssistantConfig {
  // Basic Information
  name: string;
  firstMessage: string;
  systemMessage: string;
  
  // First Message Configuration
  firstMessageMode?: 'assistant-speaks-first' | 'assistant-waits-for-user' | 'assistant-speaks-first-with-model-generated-message';
  firstMessageInterruptionsEnabled?: boolean;
  
  // Call Behavior
  maxDurationSeconds?: number;
  backgroundSound?: string;
  modelOutputInMessagesEnabled?: boolean;
  
  // End Call Configuration
  voicemailMessage?: string;
  endCallMessage?: string;
  endCallPhrases?: string[];
  
  // Model Configuration
  model: {
    provider: string;
    model: string;
    temperature: number;
    maxTokens: number;
    emotionRecognitionEnabled: boolean;
  };
  
  // Voice Configuration
  voice: {
    provider: string;
    voiceId: string;
    stability: number;
    similarityBoost: number;
    style: number;
    useSpeakerBoost: boolean;
  };
  
  // Transcriber Configuration
  transcriber: {
    provider: string;
    model: string;
    language: string;
    smartFormat: boolean;
    keywords: string[];
  };
  
  // Message Types
  clientMessages?: string[];
  serverMessages?: string[];
  
  // Analysis Configuration
  analysisPlan?: {
    summaryPrompt?: string;
    structuredDataSchema?: any;
  };
  
  // Advanced Plans
  startSpeakingPlan?: {
    waitSeconds?: number;
    smartEndpointingEnabled?: boolean;
  };
  stopSpeakingPlan?: {
    numWords?: number;
    voiceSeconds?: number;
    backoffSeconds?: number;
  };
  monitorPlan?: {
    listenEnabled?: boolean;
    controlEnabled?: boolean;
  };
  backgroundSpeechDenoisingPlan?: {
    enabled?: boolean;
    krispEnabled?: boolean;
  };
  
  // Metadata
  metadata?: any;
  
  // Legacy fields for backward compatibility
  conversationConfig?: {
    maxDurationSeconds: number;
    backgroundSound: string;
    backgroundDenoising: boolean;
    modelOutputInMessagesEnabled: boolean;
  };
  analysisSettings?: {
    summaryPrompt: string;
    structuredDataSchema: any;
  };
  expectedOutcomes?: string[];
  complianceNotes?: string[];
}

// Helper component for input labels with tooltips
const LabelWithTooltip = ({ label, tooltip }: { label: string, tooltip: string }) => (
  <div className="flex items-center space-x-1">
    <Label className="text-sm font-medium">{label}</Label>
    <Tooltip>
      <TooltipTrigger>
        <HelpCircle className="h-3 w-3 text-muted-foreground" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </div>
);

export default function AssistantStudio() {
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  const { toast } = useToast();

  // Basic form states
  const [assistantName, setAssistantName] = useState('');
  const [description, setDescription] = useState('');
  const [conversationFlow, setConversationFlow] = useState('');
  const [voiceSettings, setVoiceSettings] = useState('');
  
  // Advanced configuration states
  const [firstMessageMode, setFirstMessageMode] = useState<'assistant-speaks-first' | 'assistant-waits-for-user' | 'assistant-speaks-first-with-model-generated-message'>('assistant-speaks-first');
  const [firstMessageInterruptions, setFirstMessageInterruptions] = useState(false);
  const [maxDuration, setMaxDuration] = useState(600);
  const [backgroundSound, setBackgroundSound] = useState('office');
  const [modelOutputInMessages, setModelOutputInMessages] = useState(false);
  const [voicemailMessage, setVoicemailMessage] = useState('');
  const [endCallMessage, setEndCallMessage] = useState('');
  const [endCallPhrases, setEndCallPhrases] = useState('');
  const [customMetadata, setCustomMetadata] = useState('');
  
  // Advanced plans
  const [enableAnalysis, setEnableAnalysis] = useState(true);
  const [enableMonitoring, setEnableMonitoring] = useState(false);
  const [enableDenoising, setEnableDenoising] = useState(true);
  const [startSpeakingWait, setStartSpeakingWait] = useState(0.5);
  const [stopSpeakingWords, setStopSpeakingWords] = useState(2);
  
  // Model provider and model states
  const [modelProvider, setModelProvider] = useState('openai');
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  
  // Voice provider and voice states
  const [voiceProvider, setVoiceProvider] = useState('11labs');
  const [selectedVoice, setSelectedVoice] = useState('Rachel');
  
  // Provider data
  const modelProviders = {
    'openai': ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    'anthropic': ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307', 'claude-3-opus-20240229'],
    'google': ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'],
    'meta': ['llama-3.1-8b-instruct', 'llama-3.1-70b-instruct', 'llama-3.1-405b-instruct'],
    'mistral': ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest'],
    'cohere': ['command-r-plus', 'command-r', 'command'],
    'perplexity': ['llama-3.1-sonar-small-128k-online', 'llama-3.1-sonar-large-128k-online']
  };
  
  const voiceProviders = {
    '11labs': ['Rachel', 'Drew', 'Clyde', 'Paul', 'Domi', 'Dave', 'Fin', 'Sarah', 'Antoni', 'Thomas'],
    'openai': ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
    'playht': ['jennifer', 'melissa', 'will', 'chris', 'matt', 'jack', 'ruby', 'davis'],
    'deepgram': ['aura-asteria-en', 'aura-luna-en', 'aura-stella-en', 'aura-athena-en', 'aura-hera-en', 'aura-orion-en'],
    'azure': ['en-US-JennyNeural', 'en-US-GuyNeural', 'en-US-AriaNeural', 'en-US-DavisNeural', 'en-US-AmberNeural'],
    'cartesia': ['british-lady', 'conversational', 'childlike', 'barbershop-man']
  };
  
  // Handle provider changes
  const handleModelProviderChange = (provider: string) => {
    setModelProvider(provider);
    const firstModel = modelProviders[provider as keyof typeof modelProviders]?.[0] || '';
    setSelectedModel(firstModel);
  };
  
  const handleVoiceProviderChange = (provider: string) => {
    setVoiceProvider(provider);
    const firstVoice = voiceProviders[provider as keyof typeof voiceProviders]?.[0] || '';
    setSelectedVoice(firstVoice);
  };
  
  // Generated config state
  const [generatedConfig, setGeneratedConfig] = useState<AssistantConfig | null>(null);
  const [createdAssistant, setCreatedAssistant] = useState<any>(null);

  const generateMutation = useMutation({
    mutationFn: async (formData: any) => {
      const response = await fetch('/api/assistant-studio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate assistant');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedConfig(data.config);
      toast({
        title: "Assistant Generated!",
        description: "Your assistant configuration has been created successfully",
      });
    },
    onError: (error: any) => {
      console.error("Generation error:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Unable to generate assistant configuration",
        variant: "destructive",
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (config: AssistantConfig) => {
      const response = await fetch('/api/assistant-studio/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create assistant');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setCreatedAssistant(data.assistant);
      toast({
        title: "Assistant Created!",
        description: `Your assistant "${data.assistant.name}" has been deployed successfully`,
      });
    },
    onError: (error: any) => {
      console.error("Creation error:", error);
      toast({
        title: "Creation Failed",
        description: error.message || "Unable to create assistant",
        variant: "destructive",
      });
    },
  });

  const handleCreateAssistant = () => {
    if (!assistantName.trim()) {
      toast({
        title: "Assistant Name Required",
        description: "Please provide a name for your assistant",
        variant: "destructive",
      });
      return;
    }
    
    if (!description.trim()) {
      toast({
        title: "Description Required",
        description: "Please provide a description of the assistant you want to create",
        variant: "destructive",
      });
      return;
    }

    // Parse metadata if provided
    let parsedMetadata = null;
    if (customMetadata.trim()) {
      try {
        parsedMetadata = JSON.parse(customMetadata);
      } catch (e) {
        toast({
          title: "Invalid Metadata",
          description: "Custom metadata must be valid JSON format",
          variant: "destructive",
        });
        return;
      }
    }

    // Build configuration directly without OpenAI generation
    const assistantConfig = {
      name: assistantName.trim(),
      firstMessage: `Hello! I'm ${assistantName.trim()}. ${description.trim()}`,
      firstMessageMode: firstMessageMode || 'assistant-speaks-first',
      firstMessageInterruptionsEnabled: firstMessageInterruptions || false,
      maxDurationSeconds: maxDuration || 600,
      backgroundSound: backgroundSound || 'office',
      modelOutputInMessagesEnabled: modelOutputInMessages || false,
      ...(voicemailMessage.trim() && { voicemailMessage: voicemailMessage.trim() }),
      ...(endCallMessage.trim() && { endCallMessage: endCallMessage.trim() }),
      ...(endCallPhrases.trim() && { endCallPhrases: endCallPhrases.split(',').map(p => p.trim()) }),
      model: {
        provider: modelProvider || 'openai',
        model: selectedModel || 'gpt-4',
        temperature: 0.7,
        maxTokens: 150,
        emotionRecognitionEnabled: true
      },
      voice: {
        provider: voiceProvider || '11labs',
        voiceId: selectedVoice || 'burt',
        stability: 0.5,
        similarityBoost: 0.8,
        style: 0.0,
        useSpeakerBoost: true
      },
      transcriber: {
        provider: 'deepgram',
        model: 'nova-2',
        language: 'en-US',
        smartFormat: true,
        keywords: []
      },
      ...(enableAnalysis && {
        analysisPlan: {
          summaryPrompt: "Summarize this call focusing on key outcomes and insights",
          structuredDataSchema: {
            type: "object",
            properties: {
              callOutcome: { type: "string" },
              satisfaction: { type: "number", minimum: 1, maximum: 5 },
              followUpRequired: { type: "boolean" }
            }
          }
        }
      }),
      startSpeakingPlan: {
        waitSeconds: startSpeakingWait || 0.5,
        smartEndpointingEnabled: true
      },
      stopSpeakingPlan: {
        numWords: stopSpeakingWords || 2,
        voiceSeconds: 0.4,
        backoffSeconds: 0.5
      },
      ...(enableMonitoring && {
        monitorPlan: {
          listenEnabled: true,
          controlEnabled: false
        }
      }),
      ...(enableDenoising && {
        backgroundSpeechDenoisingPlan: {}
      }),
      ...(parsedMetadata && { metadata: parsedMetadata })
    };

    // Directly create the assistant via API
    createMutation.mutate(assistantConfig);
  };


  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary flex items-center">
                  <ChartLine className="mr-2" size={24} />
                  Vapi Analytics
                </h1>
              </div>
              <nav className="hidden md:flex space-x-8">
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground pb-4 px-1 text-sm font-medium transition-colors">
                  Dashboard
                </Link>
                <Link href="/bulk-analysis" className="text-muted-foreground hover:text-foreground pb-4 px-1 text-sm font-medium transition-colors flex items-center space-x-1">
                  <Brain size={16} />
                  <span>VoiceScope</span>
                </Link>
                <Link href="/performance-benchmarks" className="text-muted-foreground hover:text-foreground pb-4 px-1 text-sm font-medium transition-colors flex items-center space-x-1">
                  <Activity size={16} />
                  <span>Benchmarks</span>
                </Link>
                <Link href="/assistant-studio" className="text-primary border-b-2 border-primary pb-4 px-1 text-sm font-medium flex items-center space-x-1">
                  <Wand2 size={16} />
                  <span>Studio</span>
                </Link>
                <Link href="/settings" className="text-muted-foreground hover:text-foreground pb-4 px-1 text-sm font-medium transition-colors">
                  Settings
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground">
            Assistant Studio
          </h2>
          <p className="text-muted-foreground mt-1">
            Create AI-powered voice assistants with comprehensive customization options
          </p>
        </div>

        {/* Configuration Form - Horizontal Sections */}
        <div className="space-y-6">
          {/* Basic Information Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare size={20} />
                <span>Basic Information</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Essential details and description for your voice assistant
              </p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {/* Assistant Name */}
              <div className="space-y-2">
                <LabelWithTooltip 
                  label="Assistant Name *" 
                  tooltip="A unique name for your voice assistant. This will be used to identify the assistant in your dashboard and API calls." 
                />
                <Input 
                  placeholder="Enter assistant name"
                  value={assistantName}
                  onChange={(e) => setAssistantName(e.target.value.slice(0, 40))}
                  data-testid="input-assistant-name"
                  maxLength={40}
                />
                <div className="text-xs text-muted-foreground">
                  {assistantName.length}/40 characters
                </div>
              </div>

              {/* Model Provider */}
              <div className="space-y-2">
                <LabelWithTooltip 
                  label="Model Provider" 
                  tooltip="The AI model provider to use for generating responses. Different providers offer different capabilities and pricing." 
                />
                <Select value={modelProvider} onValueChange={handleModelProviderChange}>
                  <SelectTrigger data-testid="select-model-provider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="meta">Meta</SelectItem>
                    <SelectItem value="mistral">Mistral</SelectItem>
                    <SelectItem value="cohere">Cohere</SelectItem>
                    <SelectItem value="perplexity">Perplexity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Model Selection */}
              <div className="space-y-2">
                <LabelWithTooltip 
                  label="Model" 
                  tooltip="The specific AI model to use. More advanced models provide better responses but may cost more." 
                />
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger data-testid="select-model">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {modelProviders[modelProvider as keyof typeof modelProviders]?.map(model => (
                      <SelectItem key={model} value={model}>{model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Voice Provider */}
              <div className="space-y-2">
                <LabelWithTooltip 
                  label="Voice Provider" 
                  tooltip="The voice synthesis provider to use. Each provider offers different voice styles and quality levels." 
                />
                <Select value={voiceProvider} onValueChange={handleVoiceProviderChange}>
                  <SelectTrigger data-testid="select-voice-provider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="11labs">ElevenLabs</SelectItem>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="playht">PlayHT</SelectItem>
                    <SelectItem value="deepgram">Deepgram</SelectItem>
                    <SelectItem value="azure">Azure</SelectItem>
                    <SelectItem value="cartesia">Cartesia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Voice Selection */}
              <div className="space-y-2">
                <LabelWithTooltip 
                  label="Voice" 
                  tooltip="The specific voice character to use. Each voice has unique tone, accent, and personality characteristics." 
                />
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger data-testid="select-voice">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {voiceProviders[voiceProvider as keyof typeof voiceProviders]?.map(voice => (
                      <SelectItem key={voice} value={voice}>{voice}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* First Message Mode */}
              <div className="space-y-2">
                <LabelWithTooltip 
                  label="First Message Mode" 
                  tooltip="How the assistant should behave when the call starts. Choose whether the assistant speaks first, waits for the user, or generates a dynamic opening." 
                />
                <Select value={firstMessageMode} onValueChange={setFirstMessageMode}>
                  <SelectTrigger data-testid="select-first-message-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assistant-speaks-first">Assistant Speaks First</SelectItem>
                    <SelectItem value="assistant-waits-for-user">Wait for User</SelectItem>
                    <SelectItem value="assistant-speaks-first-with-model-generated-message">AI Generated Opening</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Main Description - Full Width */}
              <div className="col-span-full space-y-2">
                <LabelWithTooltip 
                  label="Assistant Description *" 
                  tooltip="Detailed description of what your assistant should do, its purpose, capabilities, and communication style. This forms the core personality of your assistant." 
                />
                <Textarea 
                  placeholder="Describe what your assistant should do, its purpose, capabilities, and tone"
                  className="min-h-20"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  data-testid="textarea-assistant-description"
                />
              </div>

              {/* Conversation Flow - Full Width */}
              <div className="col-span-full space-y-2">
                <LabelWithTooltip 
                  label="Conversation Flow (Optional)" 
                  tooltip="Define the structure and flow of conversations. Specify how the assistant should guide users through interactions and handle different scenarios." 
                />
                <Textarea 
                  placeholder="Describe the conversation flow and structure"
                  className="min-h-16"
                  value={conversationFlow}
                  onChange={(e) => setConversationFlow(e.target.value)}
                  data-testid="textarea-conversation-flow"
                />
              </div>
            </CardContent>
          </Card>

          {/* Call Behavior Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone size={20} />
                <span>Call Behavior</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure how your assistant handles calls and interactions
              </p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <LabelWithTooltip 
                  label="Max Call Duration (seconds)" 
                  tooltip="Maximum length of time a call can last before being automatically ended. Set between 10 seconds and 12 hours." 
                />
                <Input 
                  type="number"
                  min="10"
                  max="43200"
                  value={maxDuration}
                  onChange={(e) => setMaxDuration(Number(e.target.value))}
                  data-testid="input-max-duration"
                />
                <div className="text-xs text-muted-foreground">10 sec - 12 hours</div>
              </div>

              <div className="space-y-2">
                <LabelWithTooltip 
                  label="Background Sound" 
                  tooltip="Background audio to play during calls. Can help mask ambient noise and provide a professional atmosphere." 
                />
                <Select value={backgroundSound} onValueChange={setBackgroundSound}>
                  <SelectTrigger data-testid="select-background-sound">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="off">None</SelectItem>
                    <SelectItem value="office">Office</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <LabelWithTooltip 
                  label="Start Speaking Delay (seconds)" 
                  tooltip="How long the assistant waits before speaking after user stops talking. Prevents interrupting users who pause mid-sentence." 
                />
                <Input 
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={startSpeakingWait}
                  onChange={(e) => setStartSpeakingWait(Number(e.target.value))}
                  data-testid="input-start-speaking-wait"
                />
              </div>
              
              <div className="space-y-2">
                <LabelWithTooltip 
                  label="Stop on Interruption (words)" 
                  tooltip="Number of words the user needs to speak to interrupt the assistant. Lower values make the assistant more responsive to interruptions." 
                />
                <Input 
                  type="number"
                  min="1"
                  max="10"
                  value={stopSpeakingWords}
                  onChange={(e) => setStopSpeakingWords(Number(e.target.value))}
                  data-testid="input-stop-speaking-words"
                />
              </div>

              <div className="flex items-center justify-between col-span-full">
                <div className="space-y-0.5">
                  <LabelWithTooltip 
                    label="Allow First Message Interruptions" 
                    tooltip="Whether users can interrupt the assistant's opening message. Useful for users who want to skip introductions." 
                  />
                  <div className="text-xs text-muted-foreground">Users can interrupt opening message</div>
                </div>
                <Switch 
                  checked={firstMessageInterruptions}
                  onCheckedChange={setFirstMessageInterruptions}
                  data-testid="switch-first-message-interruptions"
                />
              </div>

              <div className="flex items-center justify-between col-span-full">
                <div className="space-y-0.5">
                  <LabelWithTooltip 
                    label="Use Model Output in Messages" 
                    tooltip="Use the AI model's exact output instead of the speech transcription in message logs. Provides cleaner text for analysis." 
                  />
                  <div className="text-xs text-muted-foreground">Use AI model output instead of speech transcription</div>
                </div>
                <Switch 
                  checked={modelOutputInMessages}
                  onCheckedChange={setModelOutputInMessages}
                  data-testid="switch-model-output-messages"
                />
              </div>
            </CardContent>
          </Card>

          {/* Messages Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle size={20} />
                <span>Messages & Scripts</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure voicemail, end call messages, and auto-hangup phrases
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <LabelWithTooltip 
                    label="Voicemail Message (Optional)" 
                    tooltip="Message to play when the call goes to voicemail. Leave empty to simply hang up without leaving a message." 
                  />
                  <Textarea 
                    placeholder="Message for voicemail (leave empty to hang up)"
                    value={voicemailMessage}
                    onChange={(e) => setVoicemailMessage(e.target.value.slice(0, 1000))}
                    data-testid="textarea-voicemail-message"
                    maxLength={1000}
                  />
                  <div className="text-xs text-muted-foreground">{voicemailMessage.length}/1000 characters</div>
                </div>
                
                <div className="space-y-2">
                  <LabelWithTooltip 
                    label="End Call Message (Optional)" 
                    tooltip="Message to play before ending the call. Leave empty to hang up silently without a goodbye message." 
                  />
                  <Textarea 
                    placeholder="Message when ending the call (leave empty to hang up silently)"
                    value={endCallMessage}
                    onChange={(e) => setEndCallMessage(e.target.value.slice(0, 1000))}
                    data-testid="textarea-end-call-message"
                    maxLength={1000}
                  />
                  <div className="text-xs text-muted-foreground">{endCallMessage.length}/1000 characters</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <LabelWithTooltip 
                  label="Auto-Hangup Phrases (Optional)" 
                  tooltip="Phrases that automatically end the call when spoken by the user or assistant. Separate multiple phrases with commas." 
                />
                <Input 
                  placeholder="Enter phrases separated by commas (e.g., goodbye, thank you, have a great day)"
                  value={endCallPhrases}
                  onChange={(e) => setEndCallPhrases(e.target.value)}
                  data-testid="input-end-call-phrases"
                />
                <div className="text-xs text-muted-foreground">Phrases that automatically end the call when spoken</div>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Features Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings size={20} />
                <span>Advanced Features</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Enable advanced analysis, monitoring, and optimization features
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <LabelWithTooltip 
                      label="Enable Call Analysis" 
                      tooltip="Generate detailed insights, summaries, and performance metrics from call data for optimization and reporting." 
                    />
                    <div className="text-xs text-muted-foreground">Generate insights and summaries</div>
                  </div>
                  <Switch 
                    checked={enableAnalysis}
                    onCheckedChange={setEnableAnalysis}
                    data-testid="switch-enable-analysis"
                  />
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <LabelWithTooltip 
                      label="Enable Background Noise Reduction" 
                      tooltip="Automatically filter out background noise from calls to improve speech recognition and call quality." 
                    />
                    <div className="text-xs text-muted-foreground">Filter out background noise</div>
                  </div>
                  <Switch 
                    checked={enableDenoising}
                    onCheckedChange={setEnableDenoising}
                    data-testid="switch-enable-denoising"
                  />
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <LabelWithTooltip 
                      label="Enable Call Monitoring" 
                      tooltip="Allow real-time listening and control capabilities for live call supervision and quality assurance." 
                    />
                    <div className="text-xs text-muted-foreground">Allow real-time listening and control</div>
                  </div>
                  <Switch 
                    checked={enableMonitoring}
                    onCheckedChange={setEnableMonitoring}
                    data-testid="switch-enable-monitoring"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <LabelWithTooltip 
                  label="Custom Metadata (JSON)" 
                  tooltip="Additional data to store with the assistant in JSON format. Useful for custom tags, department info, or integration data." 
                />
                <Textarea 
                  placeholder='{"department": "support", "priority": "high"}'
                  value={customMetadata}
                  onChange={(e) => setCustomMetadata(e.target.value)}
                  data-testid="textarea-custom-metadata"
                />
                <div className="text-xs text-muted-foreground">Custom data to store with the assistant (JSON format)</div>
              </div>
            </CardContent>
          </Card>

          {/* Generate Button Section */}
          <div className="flex justify-center">
            <Button 
              className="px-8 py-3 text-lg" 
              size="lg"
              onClick={handleCreateAssistant}
              disabled={!assistantName.trim() || !description.trim() || createMutation.isPending}
              data-testid="button-generate-assistant"
            >
              {createMutation.isPending ? (
                <Loader2 className="mr-2 animate-spin" size={20} />
              ) : (
                <Wand2 className="mr-2" size={20} />
              )}
              {createMutation.isPending ? 'Creating Assistant...' : 'Create Assistant'}
            </Button>
          </div>
        </div>

        {/* Created Assistant Panel - Full Width at Bottom */}
        {createdAssistant && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings size={20} />
                <span>Created Assistant</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Your voice assistant has been successfully created and deployed
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary Info */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">{createdAssistant.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  ID: {createdAssistant.id}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Created: {new Date(createdAssistant.createdAt).toLocaleString()}
                </p>
                
                {/* Assistant Info */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="text-green-500" size={16} />
                    <span>Successfully Created</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="text-blue-500" size={16} />
                    <span>{new Date(createdAssistant.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Settings className="text-purple-500" size={16} />
                    <span>Assistant ID: {createdAssistant.id.slice(0, 8)}...</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Activity className="text-orange-500" size={16} />
                    <span>{generatedConfig.maxDurationSeconds || generatedConfig.conversationConfig?.maxDurationSeconds}s Max</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                  className="flex-1 min-w-0"
                  data-testid="button-create-assistant"
                >
                  {createMutation.isPending ? (
                    <Loader2 className="mr-2 animate-spin" size={16} />
                  ) : (
                    <CheckCircle2 className="mr-2" size={16} />
                  )}
                  {createMutation.isPending ? 'Creating...' : 'Deploy Assistant'}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={exportConfig}
                  data-testid="button-export-config"
                >
                  <Download className="mr-2" size={16} />
                  Export Config
                </Button>
              </div>

              {createdAssistant && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="text-green-600 flex-shrink-0" size={20} />
                    <div>
                      <h4 className="font-medium text-green-800">Assistant Created Successfully!</h4>
                      <p className="text-green-700 text-sm mt-1">
                        Your assistant "{createdAssistant.name}" (ID: {createdAssistant.id}) is now live and ready to use.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
      </div>
    </TooltipProvider>
  );
}