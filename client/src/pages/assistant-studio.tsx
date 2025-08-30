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
  Volume2
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
}

export default function AssistantStudio() {
  const { theme } = useTheme();
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

  // Mutations
  const generateMutation = useMutation({
    mutationFn: async ({ description, conversationFlow, voiceSettings, targetAudience }: {
      description: string;
      conversationFlow: string;
      voiceSettings: string;
      targetAudience: string;
    }) => {
      const response = await fetch('/api/assistant-studio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, conversationFlow, voiceSettings, targetAudience }),
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
      targetAudience: targetAudience.trim()
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
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" data-testid="button-back-dashboard">
                <ArrowLeft size={16} className="mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center space-x-3">
                <Wand2 size={32} />
                <span>Assistant Studio</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                Create AI-powered voice assistants with natural language descriptions
              </p>
            </div>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            <Sparkles size={14} className="mr-1" />
            AI-Powered
          </Badge>
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
                    onClick={() => setDescription("Create a medical appointment scheduling assistant that helps patients book, reschedule, and confirm appointments. The assistant should verify insurance information, collect symptoms for triage, and provide pre-visit instructions. It should be HIPAA compliant and empathetic.")}
                  >
                    <Heart className="mr-2 flex-shrink-0" size={14} />
                    <span className="text-xs">Medical Appointment Scheduler</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-left justify-start h-auto p-3"
                    onClick={() => setDescription("Create a pharmacy assistant that handles prescription refills, medication inquiries, and insurance verification. The assistant should be able to look up prescription status, explain medication instructions, and schedule pickup times. It should escalate complex medication questions to pharmacists.")}
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
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}