import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import logoTransparent from "@assets/logo_transparent_1757373755849.png";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/theme-context";
import { useAuth } from "@/contexts/auth-context";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";

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
  const { user, isSuperAdmin } = useAuth();
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
  const [selectedModel, setSelectedModel] = useState('gpt-5');
  const [temperature, setTemperature] = useState(0.7);
  
  // Voice provider and voice states
  const [voiceProvider, setVoiceProvider] = useState('11labs');
  const [selectedVoice, setSelectedVoice] = useState('Rachel');

  
  // Provider data
  const modelProviders = {
    'openai': ['gpt-5', 'gpt-5 mini', 'gpt-5 nano', 'gpt-4.1', 'gpt-4.1 mini', 'gpt-4.1 nano', 'gpt-4o cluster', 'gpt-4o mini-cluster'],
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

    // Build configuration exactly matching Vapi API structure
    const assistantConfig = {
      // Basic required fields
      name: assistantName.trim(),
      
      // First message configuration
      firstMessage: `Hello! I'm ${assistantName.trim()}. ${description.trim()}`,
      firstMessageMode: firstMessageMode,
      firstMessageInterruptionsEnabled: firstMessageInterruptions,
      
      // Call behavior
      maxDurationSeconds: maxDuration,
      backgroundSound: backgroundSound,
      modelOutputInMessagesEnabled: modelOutputInMessages,
      
      // Optional messages
      ...(voicemailMessage.trim() && { voicemailMessage: voicemailMessage.trim() }),
      ...(endCallMessage.trim() && { endCallMessage: endCallMessage.trim() }),
      ...(endCallPhrases.trim() && { 
        endCallPhrases: endCallPhrases.split(',').map(p => p.trim()).filter(p => p)
      }),
      
      // Model configuration - exactly matching API structure
      model: {
        provider: modelProvider,
        model: selectedModel,
        temperature: temperature,
        maxTokens: 150
      },
      
      // Voice configuration - exactly matching API structure  
      voice: {
        provider: voiceProvider,
        voiceId: selectedVoice
      },
      
      // Transcriber configuration - exactly matching API structure
      transcriber: {
        provider: 'deepgram',
        model: 'nova-2',
        language: 'en-US'
      },
      
      // Optional plans
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
      
      // Speaking plans with correct field names
      startSpeakingPlan: {
        waitSeconds: startSpeakingWait
      },
      
      stopSpeakingPlan: {
        numWords: stopSpeakingWords
      },
      
      // Optional background denoising
      ...(enableDenoising && {
        backgroundSpeechDenoisingPlan: {
          enabled: true
        }
      }),
      
      // Optional monitoring
      ...(enableMonitoring && {
        monitorPlan: {
          listenEnabled: true,
          controlEnabled: false
        }
      }),
      
      // Custom metadata
      ...(parsedMetadata && { metadata: parsedMetadata })
    };

    // Directly create the assistant via API
    createMutation.mutate(assistantConfig);
  };

  const exportConfig = () => {
    if (!generatedConfig) {
      toast({
        title: "No configuration to export",
        description: "Please generate an assistant configuration first",
        variant: "destructive"
      });
      return;
    }

    const configBlob = new Blob([JSON.stringify(generatedConfig, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(configBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${assistantName || 'assistant'}-config.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Configuration exported",
      description: "Assistant configuration has been downloaded as JSON"
    });
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
      <DashboardHeader />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground">
            Assistant Studio
          </h2>
          <div className="mt-4 space-y-2">
            <p className="text-muted-foreground text-lg">
              Create AI-powered voice assistants with advanced configuration options
            </p>
            <p className="text-sm text-muted-foreground max-w-4xl">
              Design custom voice assistants tailored to your needs. Configure conversation flow, AI model settings, voice preferences, and advanced features like function calling and knowledge base integration. Use the form below to set up your assistant's personality, behavior, and capabilities.
            </p>
          </div>
        </div>

        {/* Assistant Configuration Form */}
        <div className="space-y-6">
          {/* Assistant Name Section - Own Row */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare size={20} />
                <span>Assistant Name</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-md space-y-2">
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
            </CardContent>
          </Card>

          {/* Model Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain size={20} />
                <span>Model Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Model Provider */}
              <div className="space-y-2">
                <LabelWithTooltip 
                  label="Provider" 
                  tooltip="The AI model provider to use for generating responses." 
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
                  tooltip="The specific AI model to use." 
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

              {/* Temperature Slider */}
              <div className="space-y-2">
                <LabelWithTooltip 
                  label="Temperature" 
                  tooltip="Controls the randomness of responses. 0 = focused, 2 = creative." 
                />
                <div className="space-y-3">
                  <Slider
                    value={[temperature]}
                    onValueChange={(value) => setTemperature(value[0])}
                    max={2}
                    min={0}
                    step={0.1}
                    className="w-full"
                    data-testid="slider-temperature"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0</span>
                    <span className="font-medium">{temperature}</span>
                    <span>2</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Voice Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mic size={20} />
                <span>Voice Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Voice Provider */}
              <div className="space-y-2">
                <LabelWithTooltip 
                  label="Provider" 
                  tooltip="The voice synthesis provider to use." 
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
                  tooltip="The specific voice character to use." 
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
            </CardContent>
          </Card>
        </div>
      </main>
      </div>
    </TooltipProvider>
  );
}