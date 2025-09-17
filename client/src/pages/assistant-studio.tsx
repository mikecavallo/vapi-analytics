import { useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { 
  assistantGenerationRequestSchema,
  assistantConfigSchema,
  type AssistantGenerationRequest,
  type AssistantConfig 
} from "@shared/schema";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  MessageSquare,
  Wand2,
  Download,
  Settings,
  Mic,
  Volume2,
  Brain,
  Activity,
  FileText,
  Copy,
  CheckCircle2,
  Loader2,
  HelpCircle,
  Headphones,
  Zap,
  Shield,
  Database,
  Wrench,
  Eye,
  Phone,
  AlertTriangle,
  Plus,
  X
} from "lucide-react";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { apiRequest } from "@/lib/queryClient";

// Default values for the form
const getDefaultValues = (): AssistantConfig => ({
  name: "",
  description: "",
  firstMessage: "",
  systemMessage: "",
  firstMessageMode: 'assistant-speaks-first',
  firstMessageInterruptionsEnabled: true,
  maxDurationSeconds: 600,
  backgroundSound: 'office',
  modelOutputInMessagesEnabled: false,
  voicemailMessage: "",
  endCallMessage: "",
  endCallPhrases: ['goodbye', 'thank you', 'have a great day'],
  model: {
    provider: 'openai',
    model: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 150,
    emotionRecognitionEnabled: false,
  },
  voice: {
    provider: '11labs',
    voiceId: 'Rachel',
    stability: 0.5,
    similarityBoost: 0.8,
    style: 0.0,
    useSpeakerBoost: true,
    optimizeStreamingLatency: 3,
    inputPreprocessingEnabled: true,
  },
  transcriber: {
    provider: 'deepgram',
    model: 'nova-2',
    language: 'en-US',
    smartFormat: true,
    keywords: [],
    endpointing: 255,
  },
  analysisPlan: {
    summaryPrompt: "Summarize this call focusing on key outcomes and insights",
    structuredDataSchema: {},
    successEvaluationPrompt: "",
    successEvaluationRubric: "NumericScale",
  },
  startSpeakingPlan: {
    waitSeconds: 0.4,
    smartEndpointingEnabled: true,
  },
  stopSpeakingPlan: {
    numWords: 2,
    voiceSeconds: 0.8,
    backoffSeconds: 1.0,
  },
  monitorPlan: {
    listenEnabled: false,
    controlEnabled: false,
  },
  backgroundSpeechDenoisingPlan: {
    enabled: false,
    krispEnabled: false,
  },
  tools: [],
  knowledgeBase: {
    provider: "",
    topK: 5,
    fileIds: [],
  },
  metadata: {},
});

// Helper component for input labels with tooltips
const LabelWithTooltip = ({ label, tooltip }: { label: string, tooltip: string }) => (
  <div className="flex items-center space-x-1">
    <Label className="text-sm font-medium">{label}</Label>
    <Tooltip>
      <TooltipTrigger>
        <HelpCircle className="h-3 w-3 text-muted-foreground hover:text-foreground transition-colors" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </div>
);

export default function AssistantStudio() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State for generated assistant and UI
  const [createdAssistant, setCreatedAssistant] = useState<any>(null);
  const [generationStep, setGenerationStep] = useState<'form' | 'generating' | 'ready'>('form');
  
  // Form setup with proper validation
  const form = useForm<AssistantConfig>({
    resolver: zodResolver(assistantConfigSchema),
    defaultValues: getDefaultValues(),
    mode: 'onChange',
  });

  // Generation form for AI assistant generation
  const generationForm = useForm<AssistantGenerationRequest>({
    resolver: zodResolver(assistantGenerationRequestSchema),
    defaultValues: {
      name: "",
      description: "",
      conversationFlow: "",
      voiceSettings: {
        provider: '11labs',
        tone: 'professional',
        gender: 'neutral',
      },
      modelSettings: {
        provider: 'openai',
        creativity: 'medium',
        responseLength: 'balanced',
      },
      advancedFeatures: {
        enableTools: false,
        enableKnowledgeBase: false,
        enableAnalytics: true,
        enableVoicemailDetection: false,
      },
    },
    mode: 'onChange',
  });

  // React Query mutations for API calls
  const generateMutation = useMutation({
    mutationFn: async (data: AssistantGenerationRequest): Promise<AssistantConfig> => {
      const response = await apiRequest('POST', '/api/assistant-studio/generate', data);
      return response.json();
    },
    onSuccess: (generatedConfig) => {
      // Populate the main form with generated configuration
      form.reset(generatedConfig);
      setGenerationStep('ready');
      toast({
        title: "Assistant Generated",
        description: "Your assistant configuration has been generated successfully. Review and customize it below.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error.message || "Failed to generate assistant configuration. Please try again.",
      });
      console.error('Generation error:', error);
    },
  });

  const createMutation = useMutation({
    mutationFn: async (config: AssistantConfig) => {
      const response = await apiRequest('POST', '/api/assistant-studio/create', config);
      return response.json();
    },
    onSuccess: (response) => {
      setCreatedAssistant(response.assistant);
      toast({
        title: "Assistant Created",
        description: "Your assistant has been successfully created and deployed to Vapi.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: error.message || "Failed to create assistant. Please check your configuration and try again.",
      });
      console.error('Creation error:', error);
    },
  });

  // Computed values
  const currentConfig = form.watch();
  
  // JSON preview with useMemo for performance
  const configPreview = useMemo(() => {
    return JSON.stringify(currentConfig, null, 2);
  }, [currentConfig]);

  // Event handlers
  const handleGenerate = (data: AssistantGenerationRequest) => {
    setGenerationStep('generating');
    generateMutation.mutate(data);
  };

  const handleCreate = (data: AssistantConfig) => {
    createMutation.mutate(data);
  };

  const copyConfigToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(configPreview);
      toast({
        title: "Copied to Clipboard",
        description: "Assistant configuration has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Failed to copy configuration to clipboard.",
      });
    }
  }, [configPreview, toast]);

  const exportConfig = useCallback(() => {
    const blob = new Blob([configPreview], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentConfig.name || 'assistant'}-config.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Configuration Exported",
      description: "Assistant configuration has been downloaded as JSON file.",
    });
  }, [configPreview, currentConfig.name, toast]);

  const resetAssistant = () => {
    setCreatedAssistant(null);
    setGenerationStep('form');
    form.reset(getDefaultValues());
    generationForm.reset();
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        
        <main className="container mx-auto px-4 py-6 space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Assistant Studio
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Create intelligent voice assistants with advanced AI capabilities. Configure models, voices, 
              and conversation flows with professional-grade tools.
            </p>
          </div>

          <Tabs defaultValue="generate" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="generate" data-testid="tab-generate">
                <Wand2 size={16} className="mr-2" />
                Generate
              </TabsTrigger>
              <TabsTrigger value="configure" data-testid="tab-configure">
                <Settings size={16} className="mr-2" />
                Configure
              </TabsTrigger>
              <TabsTrigger value="advanced" data-testid="tab-advanced">
                <Wrench size={16} className="mr-2" />
                Advanced
              </TabsTrigger>
              <TabsTrigger value="preview" data-testid="tab-preview">
                <Eye size={16} className="mr-2" />
                Preview & Deploy
              </TabsTrigger>
            </TabsList>

            {/* AI Generation Tab */}
            <TabsContent value="generate" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Wand2 size={20} />
                    <span>AI-Powered Assistant Generation</span>
                  </CardTitle>
                  <CardDescription>
                    Describe your assistant and let AI generate the optimal configuration for you
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...generationForm}>
                    <form onSubmit={generationForm.handleSubmit(handleGenerate)} className="space-y-6">
                      {/* Basic Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={generationForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Assistant Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Customer Support Assistant"
                                  data-testid="input-generation-name"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={generationForm.control}
                          name="voiceSettings.provider"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Voice Provider</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-voice-provider">
                                    <SelectValue placeholder="Select voice provider" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="11labs">ElevenLabs</SelectItem>
                                  <SelectItem value="openai">OpenAI</SelectItem>
                                  <SelectItem value="playht">PlayHT</SelectItem>
                                  <SelectItem value="azure">Azure</SelectItem>
                                  <SelectItem value="deepgram">Deepgram</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={generationForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description & Use Case</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe your assistant's purpose, target audience, and primary functions..."
                                className="min-h-[100px]"
                                data-testid="textarea-description"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Be specific about your assistant's role and the types of conversations it will handle.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={generationForm.control}
                        name="conversationFlow"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Conversation Flow (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe the typical conversation structure..."
                                className="min-h-[80px]"
                                data-testid="textarea-conversation-flow"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Outline how conversations should typically flow from greeting to conclusion.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Voice & Model Settings */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center space-x-2">
                              <Headphones size={18} />
                              <span>Voice Preferences</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <FormField
                              control={generationForm.control}
                              name="voiceSettings.tone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tone</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger data-testid="select-voice-tone">
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="professional">Professional</SelectItem>
                                      <SelectItem value="friendly">Friendly</SelectItem>
                                      <SelectItem value="casual">Casual</SelectItem>
                                      <SelectItem value="authoritative">Authoritative</SelectItem>
                                      <SelectItem value="empathetic">Empathetic</SelectItem>
                                      <SelectItem value="energetic">Energetic</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={generationForm.control}
                              name="voiceSettings.gender"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Gender Preference</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger data-testid="select-voice-gender">
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="neutral">No Preference</SelectItem>
                                      <SelectItem value="female">Female</SelectItem>
                                      <SelectItem value="male">Male</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center space-x-2">
                              <Brain size={18} />
                              <span>AI Model Settings</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <FormField
                              control={generationForm.control}
                              name="modelSettings.provider"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Model Provider</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger data-testid="select-model-provider">
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="openai">OpenAI</SelectItem>
                                      <SelectItem value="anthropic">Anthropic</SelectItem>
                                      <SelectItem value="groq">Groq</SelectItem>
                                      <SelectItem value="perplexity-ai">Perplexity AI</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={generationForm.control}
                              name="modelSettings.creativity"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Creativity Level</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger data-testid="select-creativity">
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="low">Low (Conservative)</SelectItem>
                                      <SelectItem value="medium">Medium (Balanced)</SelectItem>
                                      <SelectItem value="high">High (Creative)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={generationForm.control}
                              name="modelSettings.responseLength"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Response Length</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger data-testid="select-response-length">
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="concise">Concise</SelectItem>
                                      <SelectItem value="balanced">Balanced</SelectItem>
                                      <SelectItem value="detailed">Detailed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </CardContent>
                        </Card>
                      </div>

                      {/* Advanced Features */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <Zap size={18} />
                            <span>Advanced Features</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormField
                              control={generationForm.control}
                              name="advancedFeatures.enableAnalytics"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                  <div className="space-y-0.5">
                                    <FormLabel>Analytics</FormLabel>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                      data-testid="switch-analytics"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={generationForm.control}
                              name="advancedFeatures.enableTools"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                  <div className="space-y-0.5">
                                    <FormLabel>Function Tools</FormLabel>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                      data-testid="switch-tools"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={generationForm.control}
                              name="advancedFeatures.enableKnowledgeBase"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                  <div className="space-y-0.5">
                                    <FormLabel>Knowledge Base</FormLabel>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                      data-testid="switch-knowledge-base"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={generationForm.control}
                              name="advancedFeatures.enableVoicemailDetection"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                  <div className="space-y-0.5">
                                    <FormLabel>Voicemail Detection</FormLabel>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                      data-testid="switch-voicemail-detection"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <div className="flex justify-center">
                        <Button 
                          type="submit" 
                          size="lg"
                          disabled={generateMutation.isPending || generationStep === 'generating'}
                          data-testid="button-generate-assistant"
                          className="px-8"
                        >
                          {generateMutation.isPending || generationStep === 'generating' ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Generating Configuration...
                            </>
                          ) : (
                            <>
                              <Wand2 className="h-4 w-4 mr-2" />
                              Generate Assistant Configuration
                            </>
                          )}
                        </Button>
                      </div>

                      {generationStep === 'ready' && (
                        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                          <div className="flex items-center space-x-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <h4 className="text-sm font-medium text-green-800 dark:text-green-200">
                              Configuration Generated Successfully!
                            </h4>
                          </div>
                          <p className="mt-2 text-xs text-green-700 dark:text-green-300">
                            Your assistant configuration has been generated. Switch to the Configure tab to review and customize it.
                          </p>
                        </div>
                      )}
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Configuration Tab */}
            <TabsContent value="configure" className="space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-6">
                  {/* Basic Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <MessageSquare size={20} />
                        <span>Basic Information</span>
                      </CardTitle>
                      <CardDescription>
                        Core settings that define your assistant's identity and initial behavior
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Assistant Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter assistant name"
                                  data-testid="input-assistant-name"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="firstMessageMode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Message Mode</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-first-message-mode">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="assistant-speaks-first">Assistant Speaks First</SelectItem>
                                  <SelectItem value="assistant-waits-for-user">Wait for User</SelectItem>
                                  <SelectItem value="assistant-speaks-first-with-model-generated-message">Auto-Generate First Message</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="firstMessage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Message</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Hello! How can I help you today?"
                                data-testid="textarea-first-message"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              The initial greeting message your assistant will use to start conversations.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="systemMessage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>System Message</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="You are a helpful assistant that..."
                                className="min-h-[120px]"
                                data-testid="textarea-system-message"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Instructions that define your assistant's behavior, personality, and knowledge.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="firstMessageInterruptionsEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel>Allow First Message Interruptions</FormLabel>
                              <FormDescription>
                                Allow users to interrupt the assistant during the first message
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="switch-first-message-interruptions"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Model Configuration */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Brain size={20} />
                        <span>AI Model Configuration</span>
                      </CardTitle>
                      <CardDescription>
                        Configure the language model that powers your assistant's intelligence
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="model.provider"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Model Provider</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-model-provider-config">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="openai">OpenAI</SelectItem>
                                  <SelectItem value="anthropic">Anthropic</SelectItem>
                                  <SelectItem value="groq">Groq</SelectItem>
                                  <SelectItem value="perplexity-ai">Perplexity AI</SelectItem>
                                  <SelectItem value="together-ai">Together AI</SelectItem>
                                  <SelectItem value="deepinfra">DeepInfra</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="model.model"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Model</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-model">
                                    <SelectValue placeholder="Select model" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                                  <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                                  <SelectItem value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</SelectItem>
                                  <SelectItem value="claude-3-haiku-20240307">Claude 3 Haiku</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="model.temperature"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center justify-between">
                                <FormLabel>Temperature</FormLabel>
                                <span className="text-sm text-muted-foreground" data-testid="text-temperature-value">
                                  {field.value}
                                </span>
                              </div>
                              <FormControl>
                                <Slider
                                  min={0}
                                  max={2}
                                  step={0.1}
                                  value={[field.value]}
                                  onValueChange={(value) => field.onChange(value[0])}
                                  data-testid="slider-temperature"
                                  className="w-full"
                                />
                              </FormControl>
                              <FormDescription>
                                Controls randomness. Lower = more focused, higher = more creative
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="model.maxTokens"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center justify-between">
                                <FormLabel>Max Tokens</FormLabel>
                                <span className="text-sm text-muted-foreground" data-testid="text-max-tokens-value">
                                  {field.value}
                                </span>
                              </div>
                              <FormControl>
                                <Slider
                                  min={50}
                                  max={1000}
                                  step={25}
                                  value={[field.value]}
                                  onValueChange={(value) => field.onChange(value[0])}
                                  data-testid="slider-max-tokens"
                                  className="w-full"
                                />
                              </FormControl>
                              <FormDescription>
                                Maximum response length in tokens
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="model.emotionRecognitionEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel>Emotion Recognition</FormLabel>
                              <FormDescription>
                                Enable the model to detect and respond to emotional cues in conversations
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="switch-emotion-recognition"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Voice Configuration */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Volume2 size={20} />
                        <span>Voice Configuration</span>
                      </CardTitle>
                      <CardDescription>
                        Configure the voice synthesis settings for natural-sounding speech
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="voice.provider"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Voice Provider</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-voice-provider-config">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="11labs">ElevenLabs</SelectItem>
                                  <SelectItem value="openai">OpenAI</SelectItem>
                                  <SelectItem value="playht">PlayHT</SelectItem>
                                  <SelectItem value="azure">Azure</SelectItem>
                                  <SelectItem value="deepgram">Deepgram</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="voice.voiceId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Voice</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-voice-id">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Rachel">Rachel (Female)</SelectItem>
                                  <SelectItem value="Drew">Drew (Male)</SelectItem>
                                  <SelectItem value="Clyde">Clyde (Male)</SelectItem>
                                  <SelectItem value="Paul">Paul (Male)</SelectItem>
                                  <SelectItem value="Domi">Domi (Female)</SelectItem>
                                  <SelectItem value="Dave">Dave (Male)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="voice.stability"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center justify-between">
                                <FormLabel>Stability</FormLabel>
                                <span className="text-sm text-muted-foreground" data-testid="text-stability-value">
                                  {field.value}
                                </span>
                              </div>
                              <FormControl>
                                <Slider
                                  min={0}
                                  max={1}
                                  step={0.1}
                                  value={[field.value || 0.5]}
                                  onValueChange={(value) => field.onChange(value[0])}
                                  data-testid="slider-stability"
                                  className="w-full"
                                />
                              </FormControl>
                              <FormDescription>
                                Voice consistency and predictability
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="voice.similarityBoost"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center justify-between">
                                <FormLabel>Similarity Boost</FormLabel>
                                <span className="text-sm text-muted-foreground" data-testid="text-similarity-boost-value">
                                  {field.value}
                                </span>
                              </div>
                              <FormControl>
                                <Slider
                                  min={0}
                                  max={1}
                                  step={0.1}
                                  value={[field.value || 0.8]}
                                  onValueChange={(value) => field.onChange(value[0])}
                                  data-testid="slider-similarity-boost"
                                  className="w-full"
                                />
                              </FormControl>
                              <FormDescription>
                                How closely to match the original voice
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="voice.useSpeakerBoost"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Speaker Boost</FormLabel>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-speaker-boost"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="voice.inputPreprocessingEnabled"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Input Preprocessing</FormLabel>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-input-preprocessing"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="voice.optimizeStreamingLatency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Optimize Latency</FormLabel>
                              <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-optimize-latency">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="0">Level 0</SelectItem>
                                  <SelectItem value="1">Level 1</SelectItem>
                                  <SelectItem value="2">Level 2</SelectItem>
                                  <SelectItem value="3">Level 3</SelectItem>
                                  <SelectItem value="4">Level 4 (Max)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Speech Recognition Configuration */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Mic size={20} />
                        <span>Speech Recognition</span>
                      </CardTitle>
                      <CardDescription>
                        Configure speech-to-text settings for accurate conversation transcription
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="transcriber.provider"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Transcriber Provider</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-transcriber-provider">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="deepgram">Deepgram</SelectItem>
                                  <SelectItem value="assembly-ai">AssemblyAI</SelectItem>
                                  <SelectItem value="gladia">Gladia</SelectItem>
                                  <SelectItem value="talkscriber">TalkScriber</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="transcriber.model"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Model</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-transcriber-model">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="nova-2">Nova 2</SelectItem>
                                  <SelectItem value="nova">Nova</SelectItem>
                                  <SelectItem value="whisper">Whisper</SelectItem>
                                  <SelectItem value="enhanced">Enhanced</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="transcriber.language"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Language</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-transcriber-language">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="en-US">English (US)</SelectItem>
                                  <SelectItem value="en-GB">English (UK)</SelectItem>
                                  <SelectItem value="es-ES">Spanish (Spain)</SelectItem>
                                  <SelectItem value="fr-FR">French</SelectItem>
                                  <SelectItem value="de-DE">German</SelectItem>
                                  <SelectItem value="it-IT">Italian</SelectItem>
                                  <SelectItem value="pt-BR">Portuguese (Brazil)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="transcriber.smartFormat"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel>Smart Formatting</FormLabel>
                              <FormDescription>
                                Automatically format numbers, dates, and other entities in transcriptions
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="switch-smart-format"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Call Behavior */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Phone size={20} />
                        <span>Call Behavior</span>
                      </CardTitle>
                      <CardDescription>
                        Configure call duration, background sounds, and termination settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="maxDurationSeconds"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center justify-between">
                                <FormLabel>Max Duration (seconds)</FormLabel>
                                <span className="text-sm text-muted-foreground" data-testid="text-max-duration-value">
                                  {field.value}s ({Math.floor(field.value / 60)}:{(field.value % 60).toString().padStart(2, '0')})
                                </span>
                              </div>
                              <FormControl>
                                <Slider
                                  min={30}
                                  max={3600}
                                  step={30}
                                  value={[field.value]}
                                  onValueChange={(value) => field.onChange(value[0])}
                                  data-testid="slider-max-duration"
                                  className="w-full"
                                />
                              </FormControl>
                              <FormDescription>
                                Maximum call duration before automatic termination
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="backgroundSound"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Background Sound</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-background-sound">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="office">Office</SelectItem>
                                  <SelectItem value="nature">Nature</SelectItem>
                                  <SelectItem value="cafe">Cafe</SelectItem>
                                  <SelectItem value="none">None</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="endCallMessage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Call Message (Optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Thank you for calling. Have a great day!"
                                  data-testid="input-end-call-message"
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Message played before ending the call
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="voicemailMessage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Voicemail Message (Optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Please leave a message after the beep"
                                  data-testid="input-voicemail-message"
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Message for voicemail detection scenarios
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="modelOutputInMessagesEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel>Include Model Output in Messages</FormLabel>
                              <FormDescription>
                                Include the AI model's reasoning and output in message logs
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="switch-model-output-in-messages"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </form>
              </Form>
            </TabsContent>

            {/* Advanced Configuration Tab */}
            <TabsContent value="advanced" className="space-y-6">
              <Form {...form}>
                <form className="space-y-6">
                  {/* Analysis Configuration */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Activity size={20} />
                        <span>Call Analysis & Insights</span>
                      </CardTitle>
                      <CardDescription>
                        Configure post-call analysis, summaries, and success evaluation metrics
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="analysisPlan.summaryPrompt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Summary Prompt</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Summarize this call focusing on key outcomes, customer satisfaction, and next steps..."
                                className="min-h-[100px]"
                                data-testid="textarea-summary-prompt"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Instructions for generating call summaries
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="analysisPlan.successEvaluationPrompt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Success Evaluation Prompt</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Evaluate if this call achieved its objectives based on..."
                                className="min-h-[80px]"
                                data-testid="textarea-success-evaluation-prompt"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Criteria for measuring call success
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="analysisPlan.successEvaluationRubric"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Success Evaluation Rubric</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-success-rubric">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="NumericScale">Numeric Scale (1-10)</SelectItem>
                                <SelectItem value="DescriptiveScale">Descriptive Scale</SelectItem>
                                <SelectItem value="Checklist">Checklist</SelectItem>
                                <SelectItem value="Binary">Binary (Success/Failure)</SelectItem>
                                <SelectItem value="PercentageScale">Percentage Scale</SelectItem>
                                <SelectItem value="LikertScale">Likert Scale</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Flow Control Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Zap size={20} />
                        <span>Conversation Flow Control</span>
                      </CardTitle>
                      <CardDescription>
                        Fine-tune timing and interruption handling for natural conversations
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">Start Speaking Settings</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="startSpeakingPlan.waitSeconds"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center justify-between">
                                  <FormLabel>Wait Time (seconds)</FormLabel>
                                  <span className="text-sm text-muted-foreground" data-testid="text-wait-seconds-value">
                                    {field.value}s
                                  </span>
                                </div>
                                <FormControl>
                                  <Slider
                                    min={0}
                                    max={5}
                                    step={0.1}
                                    value={[field.value || 0.4]}
                                    onValueChange={(value) => field.onChange(value[0])}
                                    data-testid="slider-wait-seconds"
                                    className="w-full"
                                  />
                                </FormControl>
                                <FormDescription>
                                  Time to wait before starting to speak
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="startSpeakingPlan.smartEndpointingEnabled"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                  <FormLabel>Smart Endpointing</FormLabel>
                                  <FormDescription>
                                    Intelligently detect when user stops speaking
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    data-testid="switch-smart-endpointing"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">Stop Speaking Settings</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="stopSpeakingPlan.numWords"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center justify-between">
                                  <FormLabel>Trigger Words</FormLabel>
                                  <span className="text-sm text-muted-foreground" data-testid="text-num-words-value">
                                    {field.value}
                                  </span>
                                </div>
                                <FormControl>
                                  <Slider
                                    min={1}
                                    max={10}
                                    step={1}
                                    value={[field.value || 2]}
                                    onValueChange={(value) => field.onChange(value[0])}
                                    data-testid="slider-num-words"
                                    className="w-full"
                                  />
                                </FormControl>
                                <FormDescription>
                                  Words needed to trigger interruption
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="stopSpeakingPlan.voiceSeconds"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center justify-between">
                                  <FormLabel>Voice Detection (s)</FormLabel>
                                  <span className="text-sm text-muted-foreground" data-testid="text-voice-seconds-value">
                                    {field.value}s
                                  </span>
                                </div>
                                <FormControl>
                                  <Slider
                                    min={0}
                                    max={3}
                                    step={0.1}
                                    value={[field.value || 0.8]}
                                    onValueChange={(value) => field.onChange(value[0])}
                                    data-testid="slider-voice-seconds"
                                    className="w-full"
                                  />
                                </FormControl>
                                <FormDescription>
                                  Voice detection threshold
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="stopSpeakingPlan.backoffSeconds"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center justify-between">
                                  <FormLabel>Backoff Time (s)</FormLabel>
                                  <span className="text-sm text-muted-foreground" data-testid="text-backoff-seconds-value">
                                    {field.value}s
                                  </span>
                                </div>
                                <FormControl>
                                  <Slider
                                    min={0}
                                    max={3}
                                    step={0.1}
                                    value={[field.value || 1.0]}
                                    onValueChange={(value) => field.onChange(value[0])}
                                    data-testid="slider-backoff-seconds"
                                    className="w-full"
                                  />
                                </FormControl>
                                <FormDescription>
                                  Pause after stopping
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Audio Enhancement */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Headphones size={20} />
                        <span>Audio Enhancement</span>
                      </CardTitle>
                      <CardDescription>
                        Configure audio processing and noise reduction settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="backgroundSpeechDenoisingPlan.enabled"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel>Background Speech Denoising</FormLabel>
                                <FormDescription>
                                  Remove background speech and conversations
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-background-denoising"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="backgroundSpeechDenoisingPlan.krispEnabled"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel>Krisp Noise Cancellation</FormLabel>
                                <FormDescription>
                                  Advanced AI-powered noise cancellation
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-krisp-enabled"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Monitoring & Control */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Shield size={20} />
                        <span>Monitoring & Control</span>
                      </CardTitle>
                      <CardDescription>
                        Configure call monitoring and manual control options
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="monitorPlan.listenEnabled"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel>Enable Call Listening</FormLabel>
                                <FormDescription>
                                  Allow supervisors to listen to live calls
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-listen-enabled"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="monitorPlan.controlEnabled"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel>Enable Call Control</FormLabel>
                                <FormDescription>
                                  Allow manual intervention and control during calls
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-control-enabled"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </form>
              </Form>
            </TabsContent>

            {/* Preview & Export Tab */}
            <TabsContent value="preview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Eye size={20} />
                      <span>Configuration Preview</span>
                    </CardTitle>
                    <CardDescription>
                      Real-time preview of the Vapi API payload that will be sent
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96 w-full">
                      <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto" data-testid="text-config-preview">
                        {configPreview}
                      </pre>
                    </ScrollArea>
                    
                    <div className="flex gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={copyConfigToClipboard}
                        data-testid="button-copy-config"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy to Clipboard
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={exportConfig}
                        data-testid="button-export-config"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export JSON
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Wand2 size={20} />
                      <span>Deploy Assistant</span>
                    </CardTitle>
                    <CardDescription>
                      Create and deploy your assistant to the Vapi platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                          Configuration Summary
                        </h4>
                        <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1" data-testid="text-configuration-summary">
                          <p>• <strong>Name:</strong> {currentConfig.name || 'Unnamed Assistant'}</p>
                          <p>• <strong>Model:</strong> {currentConfig.model.provider}/{currentConfig.model.model}</p>
                          <p>• <strong>Voice:</strong> {currentConfig.voice.provider}/{currentConfig.voice.voiceId}</p>
                          <p>• <strong>Language:</strong> {currentConfig.transcriber.language}</p>
                          <p>• <strong>Analysis:</strong> {currentConfig.analysisPlan ? 'Enabled' : 'Disabled'}</p>
                          <p>• <strong>Tools:</strong> {currentConfig.tools?.length || 0} configured</p>
                          <p>• <strong>Knowledge Base:</strong> {currentConfig.knowledgeBase ? 'Enabled' : 'Disabled'}</p>
                        </div>
                      </div>

                      {createdAssistant ? (
                        <div className="space-y-4">
                          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                            <div className="flex items-center space-x-2">
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                              <h4 className="text-sm font-medium text-green-800 dark:text-green-200">
                                Assistant Created Successfully!
                              </h4>
                            </div>
                            <div className="mt-2 text-xs text-green-700 dark:text-green-300" data-testid="text-created-assistant">
                              <p><strong>Assistant ID:</strong> {createdAssistant.id}</p>
                              <p><strong>Name:</strong> {createdAssistant.name}</p>
                              <p><strong>Created:</strong> {new Date(createdAssistant.createdAt).toLocaleString()}</p>
                            </div>
                          </div>
                          
                          <Button 
                            className="w-full" 
                            onClick={resetAssistant}
                            data-testid="button-create-another"
                          >
                            Create Another Assistant
                          </Button>
                        </div>
                      ) : (
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(handleCreate)}>
                            <Button 
                              type="submit"
                              className="w-full" 
                              disabled={createMutation.isPending || !form.getValues('name')?.trim()}
                              data-testid="button-create-assistant"
                            >
                              {createMutation.isPending ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Creating Assistant...
                                </>
                              ) : (
                                <>
                                  <Wand2 className="h-4 w-4 mr-2" />
                                  Create Assistant
                                </>
                              )}
                            </Button>
                          </form>
                        </Form>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </TooltipProvider>
  );
}