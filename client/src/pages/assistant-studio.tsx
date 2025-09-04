import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Wand2,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Settings,
  Mic,
  MessageSquare,
  Brain,
  Play,
  Download,
  Copy,
  Eye,
  EyeOff,
  Sparkles,
  Heart,
  Shield,
  Volume2,
  ChartLine,
  Activity,
  FileText,
  User,
  Sun,
  Moon,
  Zap,
  BarChart3,
  MessageCircle,
  Sliders,
  PlusCircle,
  TrendingUp,
  Target,
  Lightbulb
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/theme-context";

interface AssistantConfig {
  name: string;
  firstMessage: string;
  systemMessage: string;
  model: {
    provider: string;
    model: string;
    temperature: number;
    maxTokens: number;
    emotionRecognitionEnabled: boolean;
  };
  voice: {
    provider: string;
    voiceId: string;
    stability: number;
    similarityBoost: number;
    style: number;
    useSpeakerBoost: boolean;
  };
  transcriber: {
    provider: string;
    model: string;
    language: string;
    smartFormat: boolean;
    keywords: string[];
  };
  conversationConfig: {
    maxDurationSeconds: number;
    backgroundSound: string;
    backgroundDenoising: boolean;
    modelOutputInMessagesEnabled: boolean;
  };
  analysisSettings: {
    summaryPrompt: string;
    structuredDataSchema: any;
  };
  expectedOutcomes: string[];
  complianceNotes: string[];
  addons?: {
    promptOptimization: boolean;
    conversationAnalysis: boolean;
    advancedReporting: boolean;
    aiChatbot: boolean;
  };
}

export default function AssistantStudio() {
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  const { toast } = useToast();

  // Form states
  const [description, setDescription] = useState('');
  const [conversationFlow, setConversationFlow] = useState('');
  const [voiceSettings, setVoiceSettings] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  
  // Generated config state
  const [generatedConfig, setGeneratedConfig] = useState<AssistantConfig | null>(null);
  const [createdAssistant, setCreatedAssistant] = useState<any>(null);
  const [showConfigDetails, setShowConfigDetails] = useState(false);
  
  // Addon states
  const [selectedAddons, setSelectedAddons] = useState({
    promptOptimization: true,
    conversationAnalysis: true,
    advancedReporting: true,
    aiChatbot: true
  });
  const [showAddonTools, setShowAddonTools] = useState(false);

  // Mutations
  const generateMutation = useMutation({
    mutationFn: async ({ description, conversationFlow, voiceSettings, targetAudience, addons }: {
      description: string;
      conversationFlow: string;
      voiceSettings: string;
      targetAudience: string;
      addons?: any;
    }) => {
      const response = await fetch('/api/assistant-studio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, conversationFlow, voiceSettings, targetAudience, addons }),
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
        description: `Created configuration for "${data.config.name}"`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
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
        description: `Successfully deployed assistant with ID: ${data.assistant.id}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!description.trim()) {
      toast({
        title: "Description Required",
        description: "Please provide a description of the assistant you want to create",
        variant: "destructive",
      });
      return;
    }

    generateMutation.mutate({
      description: description.trim(),
      conversationFlow: conversationFlow.trim(),
      voiceSettings: voiceSettings.trim(),
      targetAudience: targetAudience.trim(),
      addons: selectedAddons
    });
  };

  const handleCreate = () => {
    if (!generatedConfig) return;
    createMutation.mutate(generatedConfig);
  };

  const exportConfig = () => {
    if (!generatedConfig) return;
    
    const blob = new Blob([JSON.stringify(generatedConfig, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedConfig.name.toLowerCase().replace(/\s+/g, '-')}-config.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Config Exported",
      description: "Assistant configuration downloaded successfully",
    });
  };

  return (
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
                <Link href="/reports" className="text-muted-foreground hover:text-foreground pb-4 px-1 text-sm font-medium transition-colors flex items-center space-x-1">
                  <FileText size={16} />
                  <span>Reports</span>
                </Link>
                <a href="#" className="text-muted-foreground hover:text-foreground pb-4 px-1 text-sm font-medium transition-colors">
                  Settings
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="px-3 py-1">
                <Sparkles size={14} className="mr-1" />
                AI-Powered
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleTheme}
                className="w-8 h-8 rounded-full p-0"
                data-testid="button-toggle-theme"
              >
                {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
              </Button>
              <div className="relative">
                <Button variant="secondary" size="sm" className="w-8 h-8 rounded-full p-0" data-testid="button-user">
                  <User size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Page Title */}
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-3">
              <Wand2 size={32} />
              <span>Assistant Studio</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Create AI-powered voice assistants with natural language descriptions
            </p>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare size={20} />
                <span>Describe Your Assistant</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Tell us what kind of voice assistant you want to create and we'll generate the complete configuration
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Description */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Assistant Description *
                </Label>
                <Textarea 
                  placeholder="Describe what your assistant should do. For example: 'Create a healthcare assistant that helps patients schedule appointments, answers questions about services, and can escalate urgent calls to medical staff. The assistant should be empathetic and professional.'"
                  className="min-h-20"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  data-testid="textarea-assistant-description"
                />
                <div className="text-xs text-muted-foreground">
                  Be specific about the assistant's purpose, capabilities, and tone
                </div>
              </div>

              {/* Conversation Flow */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Conversation Flow (Optional)
                </Label>
                <Textarea 
                  placeholder="Describe how conversations should flow. For example: 'Start with warm greeting → Identify caller needs → Route to appropriate service → Collect required information → Confirm details → Provide next steps'"
                  className="min-h-16"
                  value={conversationFlow}
                  onChange={(e) => setConversationFlow(e.target.value)}
                  data-testid="textarea-conversation-flow"
                />
              </div>

              {/* Voice Settings */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Voice & Tone Preferences (Optional)
                </Label>
                <Select value={voiceSettings} onValueChange={setVoiceSettings}>
                  <SelectTrigger data-testid="select-voice-settings">
                    <SelectValue placeholder="Choose voice characteristics" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional-caring">Professional & Caring</SelectItem>
                    <SelectItem value="warm-friendly">Warm & Friendly</SelectItem>
                    <SelectItem value="authoritative-confident">Authoritative & Confident</SelectItem>
                    <SelectItem value="calm-reassuring">Calm & Reassuring</SelectItem>
                    <SelectItem value="energetic-upbeat">Energetic & Upbeat</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Target Audience */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Target Audience (Optional)
                </Label>
                <Select value={targetAudience} onValueChange={setTargetAudience}>
                  <SelectTrigger data-testid="select-target-audience">
                    <SelectValue placeholder="Who will be calling?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patients-general">Healthcare Patients (General)</SelectItem>
                    <SelectItem value="patients-elderly">Elderly Patients</SelectItem>
                    <SelectItem value="patients-pediatric">Pediatric Patients/Parents</SelectItem>
                    <SelectItem value="healthcare-professionals">Healthcare Professionals</SelectItem>
                    <SelectItem value="business-customers">Business Customers</SelectItem>
                    <SelectItem value="general-public">General Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Advanced Addons */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Zap className="text-yellow-500" size={16} />
                  <Label className="text-sm font-medium">Advanced AI Addons</Label>
                  <Badge variant="secondary" className="text-xs">Powered by AI</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enable powerful AI-driven features to enhance your assistant's capabilities and analytics
                </p>
                
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Lightbulb className="text-blue-500" size={16} />
                      <div>
                        <p className="text-sm font-medium">AI Prompt Optimization</p>
                        <p className="text-xs text-muted-foreground">Analyzes call transcripts to continuously improve assistant prompts</p>
                      </div>
                    </div>
                    <Button
                      variant={selectedAddons.promptOptimization ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedAddons(prev => ({ ...prev, promptOptimization: !prev.promptOptimization }))}
                      data-testid="toggle-prompt-optimization"
                    >
                      {selectedAddons.promptOptimization ? 'Enabled' : 'Enable'}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="text-green-500" size={16} />
                      <div>
                        <p className="text-sm font-medium">Conversation Flow Analysis</p>
                        <p className="text-xs text-muted-foreground">Identifies patterns and provides insights to optimize conversation flows</p>
                      </div>
                    </div>
                    <Button
                      variant={selectedAddons.conversationAnalysis ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedAddons(prev => ({ ...prev, conversationAnalysis: !prev.conversationAnalysis }))}
                      data-testid="toggle-conversation-analysis"
                    >
                      {selectedAddons.conversationAnalysis ? 'Enabled' : 'Enable'}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="text-purple-500" size={16} />
                      <div>
                        <p className="text-sm font-medium">Advanced AI Reporting</p>
                        <p className="text-xs text-muted-foreground">Generates comprehensive reports with AI-driven insights and recommendations</p>
                      </div>
                    </div>
                    <Button
                      variant={selectedAddons.advancedReporting ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedAddons(prev => ({ ...prev, advancedReporting: !prev.advancedReporting }))}
                      data-testid="toggle-advanced-reporting"
                    >
                      {selectedAddons.advancedReporting ? 'Enabled' : 'Enable'}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <MessageCircle className="text-orange-500" size={16} />
                      <div>
                        <p className="text-sm font-medium">AI Analytics Chatbot</p>
                        <p className="text-xs text-muted-foreground">Interactive AI assistant for analyzing call data and metrics</p>
                      </div>
                    </div>
                    <Button
                      variant={selectedAddons.aiChatbot ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedAddons(prev => ({ ...prev, aiChatbot: !prev.aiChatbot }))}
                      data-testid="toggle-ai-chatbot"
                    >
                      {selectedAddons.aiChatbot ? 'Enabled' : 'Enable'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleGenerate}
                disabled={!description.trim() || generateMutation.isPending}
                data-testid="button-generate-assistant"
              >
                {generateMutation.isPending ? (
                  <Loader2 className="mr-2 animate-spin" size={20} />
                ) : (
                  <Wand2 className="mr-2" size={20} />
                )}
                {generateMutation.isPending ? 'Generating Assistant...' : 'Generate Assistant'}
              </Button>

              {/* Quick Examples */}
              <div className="space-y-3 pt-4 border-t">
                <p className="text-sm font-medium text-muted-foreground">Quick Examples:</p>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-left justify-start h-auto p-3"
                    onClick={() => setDescription(`[Role]
You're Sarah, an AI assistant for ABC Medical Center. Your primary task is to interact with patients, gather information, and schedule medical appointments.

[Context]
You're engaged with the patient to book a medical appointment. Stay focused on this context and provide relevant healthcare information. Once connected to a patient, proceed to the Conversation Flow section. Do not invent medical information not drawn from the context. Answer only questions related to appointment scheduling and basic practice information.

[Response Handling]
When asking any question from the 'Conversation Flow' section, evaluate the patient's response to determine if it qualifies as a valid answer. Use context awareness to assess relevance and appropriateness. If the response is valid, proceed to the next relevant question. Avoid infinite loops by moving forward when a clear answer cannot be obtained.

[Warning]
Do not modify or attempt to correct patient input parameters. Pass them directly into the function or tool as given. Follow HIPAA compliance guidelines at all times.

[Response Guidelines]
Keep responses brief and empathetic.
Ask one question at a time, but combine related questions where appropriate.
Maintain a calm, caring, and professional tone.
Answer only the question posed by the patient.
Begin responses with direct answers, without introducing additional data.
If unsure or data is unavailable, ask specific clarifying questions.
Present dates in a clear format (e.g., January Twenty Fourth) and do not mention years in dates.
Present time in a clear format (e.g. Two Thirty PM).
Speak dates gently using English words instead of numbers.
Never say the word 'function' nor 'tools' nor the name of available functions.
Never say ending the call.
If transferring the call, do not send any text response. Simply trigger the tool silently.

[Error Handling]
If the patient's response is unclear, ask clarifying questions. If you encounter any issues, inform the patient politely and ask them to repeat.

[Conversation Flow]
1. Ask: "Thank you for calling ABC Medical Center. Are you looking to schedule a new appointment or manage an existing one?"
- If new appointment: Proceed to step 2.
- If existing appointment: Proceed to 'Manage Existing Appointment'.
2. Ask: "To ensure I schedule you with the right provider, what type of appointment do you need today?"
- Proceed to step 3.
3. Ask: "Have you been seen at our practice before, or would this be your first visit?"
- If existing patient: Proceed to step 4.
- If new patient: Proceed to 'New Patient Registration'.
4. Ask: "For verification purposes, could you please provide your full name and date of birth?"
- Proceed to step 5.
5. Ask: "What is the reason for your visit today? This helps us allocate the appropriate time."
- Proceed to step 6.
6. Ask: "Do you have any scheduling preferences, such as morning or afternoon appointments?"
- Proceed to 'Book Appointment'.

[Book Appointment]
1. Trigger the 'fetchSlots' tool and map the result to {{available_slots}}.
2. Ask: "I have several appointments available: {{available_slots}}. Which time works best for you?"
3. <wait for patient response>
4. Set the {{selectedSlot}} variable to the patient's response.
5. If {{selectedSlot}} is one of the available slots:
   - Trigger the 'bookSlot' tool with the {{selectedSlot}}.
   - Inform the patient of the confirmation and provide pre-visit instructions.
   - Proceed to 'Call Closing'.
6. If {{selectedSlot}} is not available: Proceed to 'Suggest Alternate Slot'.

[New Patient Registration]
1. Ask: "As a new patient, I'll need to collect some basic information. Could you provide your full name?"
2. Ask: "What's your date of birth?"
3. Ask: "What's the best phone number to reach you?"
4. Ask: "Do you have insurance coverage?"
5. Proceed to step 5 in 'Conversation Flow'.

[Call Closing]
- Say: "Your appointment has been scheduled. You'll receive a confirmation text with all the details. Is there anything else I can help you with today?"
- Trigger the endCall function.`)}
                  >
                    <Heart className="mr-2 flex-shrink-0" size={14} />
                    <span className="text-xs">Medical Appointment Scheduler</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-left justify-start h-auto p-3"
                    onClick={() => setDescription(`[Identity]
You are a knowledgeable pharmacy assistant helping customers with prescriptions and medication inquiries.

[Style]
- Be helpful and informative about medications.
- Maintain a professional and caring tone.
- Be clear and concise for voice conversations.
- Always prioritize patient safety.

[Response Guideline]
- Present pickup times in a clear format (e.g., ready by 3:00 PM today).
- Always verify patient identity before discussing prescriptions.
- Escalate complex medication questions to licensed pharmacists.

[Task]
1. Greet the customer and verify their identity using name and date of birth.
2. Ask about their pharmacy needs (refill, new prescription, or inquiry).
3. Look up prescription status in the system.
4. Verify insurance coverage and copay information.
5. Explain medication instructions clearly if requested.
6. Schedule pickup times and provide waiting estimates.
7. Escalate complex medication interactions or side effect questions to pharmacists.`)}
                  >
                    <Shield className="mr-2 flex-shrink-0" size={14} />
                    <span className="text-xs">Pharmacy Assistant</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings size={20} />
                <span>Generated Configuration</span>
                {generatedConfig && (
                  <Badge variant="default" className="ml-auto">
                    <CheckCircle size={12} className="mr-1" />
                    Ready
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!generatedConfig ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                  <Brain className="text-muted-foreground" size={48} />
                  <div>
                    <h3 className="font-medium text-foreground">No Assistant Generated Yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Fill out the form and click "Generate Assistant" to create your AI configuration
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Assistant Overview */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{generatedConfig.name}</h3>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowConfigDetails(!showConfigDetails)}
                          data-testid="button-toggle-details"
                        >
                          {showConfigDetails ? <EyeOff size={14} /> : <Eye size={14} />}
                          {showConfigDetails ? 'Hide' : 'View'} Details
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={exportConfig}
                          data-testid="button-export-config"
                        >
                          <Download size={14} className="mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm font-medium mb-2">First Message:</p>
                      <p className="text-sm text-muted-foreground italic">
                        "{generatedConfig.firstMessage}"
                      </p>
                    </div>

                    {/* Key Features */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <Mic className="text-blue-500" size={16} />
                        <span>{generatedConfig.voice.provider} Voice</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Brain className="text-purple-500" size={16} />
                        <span>{generatedConfig.model.model}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Volume2 className="text-green-500" size={16} />
                        <span>{generatedConfig.transcriber.provider}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Shield className="text-amber-500" size={16} />
                        <span>HIPAA Compliant</span>
                      </div>
                    </div>

                    {/* Expected Outcomes */}
                    {generatedConfig.expectedOutcomes?.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Expected Outcomes:</p>
                        <div className="space-y-1">
                          {generatedConfig.expectedOutcomes.map((outcome, index) => (
                            <div key={index} className="flex items-start space-x-2 text-sm">
                              <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{outcome}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Compliance Notes */}
                    {generatedConfig.complianceNotes?.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Compliance Features:</p>
                        <div className="space-y-1">
                          {generatedConfig.complianceNotes.map((note, index) => (
                            <div key={index} className="flex items-start space-x-2 text-sm">
                              <Shield size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                              <span>{note}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Configuration Details */}
                  {showConfigDetails && (
                    <div className="space-y-4 pt-4 border-t">
                      <ScrollArea className="h-64 w-full border rounded-lg p-4 bg-muted/20">
                        <pre className="text-xs font-mono whitespace-pre-wrap">
                          {JSON.stringify(generatedConfig, null, 2)}
                        </pre>
                      </ScrollArea>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(generatedConfig, null, 2));
                          toast({ title: "Copied to clipboard", description: "Configuration copied successfully" });
                        }}
                        data-testid="button-copy-config"
                      >
                        <Copy size={14} className="mr-1" />
                        Copy Configuration
                      </Button>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4 border-t">
                    <Button 
                      className="flex-1"
                      onClick={handleCreate}
                      disabled={createMutation.isPending}
                      data-testid="button-create-assistant"
                    >
                      {createMutation.isPending ? (
                        <Loader2 className="mr-2 animate-spin" size={16} />
                      ) : (
                        <Play className="mr-2" size={16} />
                      )}
                      {createMutation.isPending ? 'Creating...' : 'Deploy Assistant'}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setGeneratedConfig(null);
                        setCreatedAssistant(null);
                      }}
                      data-testid="button-reset"
                    >
                      Generate New
                    </Button>
                  </div>

                  {/* Success Message */}
                  {createdAssistant && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="text-green-500" size={16} />
                        <span className="text-sm font-medium text-green-700 dark:text-green-400">
                          Assistant Successfully Deployed!
                        </span>
                      </div>
                      <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                        Assistant ID: {createdAssistant.id}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-500">
                        Your assistant is now live and ready to handle calls
                      </p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                        <span className="text-xs text-green-600 dark:text-green-500">
                          Access advanced AI tools for your assistant
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/30"
                          onClick={() => setShowAddonTools(!showAddonTools)}
                          data-testid="button-toggle-addon-tools"
                        >
                          <Zap size={14} className="mr-1" />
                          {showAddonTools ? 'Hide' : 'Show'} AI Tools
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* AI Addon Tools */}
                  {createdAssistant && showAddonTools && generatedConfig?.addons && (
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                      <div className="flex items-center space-x-2">
                        <Sliders className="text-blue-500" size={16} />
                        <h4 className="font-medium">AI Assistant Management Tools</h4>
                        <Badge variant="secondary" className="text-xs">
                          <Sparkles size={10} className="mr-1" />
                          AI-Powered
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {generatedConfig.addons.promptOptimization && (
                          <div className="p-4 border rounded-lg bg-background">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <Lightbulb className="text-blue-500" size={16} />
                                <span className="text-sm font-medium">Prompt Optimizer</span>
                              </div>
                              <Button size="sm" data-testid="button-optimize-prompt">
                                <Target size={14} className="mr-1" />
                                Optimize
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              Analyze call transcripts to improve prompts
                            </p>
                            <div className="text-xs text-green-600">
                              ✓ Ready to analyze up to 10 recent calls
                            </div>
                          </div>
                        )}
                        
                        {generatedConfig.addons.conversationAnalysis && (
                          <div className="p-4 border rounded-lg bg-background">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <TrendingUp className="text-green-500" size={16} />
                                <span className="text-sm font-medium">Flow Analyzer</span>
                              </div>
                              <Button size="sm" data-testid="button-analyze-flows">
                                <BarChart3 size={14} className="mr-1" />
                                Analyze
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              Identify conversation patterns and insights
                            </p>
                            <div className="text-xs text-green-600">
                              ✓ Healthcare compliance tracking enabled
                            </div>
                          </div>
                        )}
                        
                        {generatedConfig.addons.advancedReporting && (
                          <div className="p-4 border rounded-lg bg-background">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <FileText className="text-purple-500" size={16} />
                                <span className="text-sm font-medium">AI Reports</span>
                              </div>
                              <Button size="sm" data-testid="button-generate-report">
                                <Download size={14} className="mr-1" />
                                Generate
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              Create comprehensive performance reports
                            </p>
                            <div className="text-xs text-green-600">
                              ✓ Executive, detailed & compliance reports
                            </div>
                          </div>
                        )}
                        
                        {generatedConfig.addons.aiChatbot && (
                          <div className="p-4 border rounded-lg bg-background">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <MessageCircle className="text-orange-500" size={16} />
                                <span className="text-sm font-medium">Analytics Chat</span>
                              </div>
                              <Button size="sm" data-testid="button-open-chatbot">
                                <MessageSquare size={14} className="mr-1" />
                                Open Chat
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              Ask questions about your call analytics
                            </p>
                            <div className="text-xs text-green-600">
                              ✓ Interactive AI assistant ready
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-center pt-3 border-t">
                        <span className="text-xs text-muted-foreground">
                          All AI tools are configured for assistant: {createdAssistant.id}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        </div>
      </main>
    </div>
  );
}