import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Brain, 
  Filter, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  Clock,
  Search,
  Loader2,
  X,
  Plus,
  ChartLine,
  User,
  Sun,
  Moon,
  Download,
  CalendarDays,
  Phone,
  Eye,
  AlertTriangle,
  CheckCircle,
  Copy,
  Activity,
  Wand2,
  FileText
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/theme-context";

interface FilterCriteria {
  id: string;
  type: 'dateRange' | 'callType' | 'assistant' | 'assistantPhone' | 'customerPhone' | 'callId' | 'successEvaluation' | 'endedReason' | 'cost' | 'duration';
  value: string;
  value2?: string;
  label: string;
}

interface AnalysisMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  analysisType?: string;
}

export default function BulkAnalysis() {
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  const [filters, setFilters] = useState<FilterCriteria[]>([]);
  const [analysisQuery, setAnalysisQuery] = useState('');
  const [conversationHistory, setConversationHistory] = useState<AnalysisMessage[]>([]);
  
  // Prompt optimization states
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [optimizationResults, setOptimizationResults] = useState<any>(null);
  
  // Conversation flow analysis states
  const [activeTab, setActiveTab] = useState<'analysis' | 'optimization' | 'flows'>('analysis');
  const [flowAnalysisResults, setFlowAnalysisResults] = useState<any>(null);
  
  // Filter states
  const [selectedDateRange, setSelectedDateRange] = useState<{from?: Date; to?: Date}>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedCallType, setSelectedCallType] = useState<string>('all');
  const [selectedAssistant, setSelectedAssistant] = useState<string>('all');
  const [assistantPhoneFilter, setAssistantPhoneFilter] = useState<string>('');
  const [customerPhoneFilter, setCustomerPhoneFilter] = useState<string>('');
  const [callIdFilter, setCallIdFilter] = useState<string>('');
  const [selectedSuccessEvaluation, setSelectedSuccessEvaluation] = useState<string>('all');
  const [selectedEndedReason, setSelectedEndedReason] = useState<string>('all');
  const [costRange, setCostRange] = useState<{min?: string; max?: string}>({});
  const [durationRange, setDurationRange] = useState<{min?: string; max?: string}>({});

  // Fetch all calls first, then filter on frontend
  const { data: allCalls, isLoading: isLoadingCalls } = useQuery<any[]>({
    queryKey: ['/api/bulk-analysis/calls'],
    enabled: true,
  });
  
  // Get unique assistants with preference for names over IDs
  const assistants = allCalls ? Array.from(new Set(allCalls.map(call => {
    if (call.assistantName && call.assistantName.trim()) {
      return call.assistantName;
    }
    return call.assistantId;
  }).filter(Boolean))) : [];
  const endedReasons = allCalls ? Array.from(new Set(allCalls.map(call => call.endedReason).filter(Boolean))) : [];
  
  // Filter calls based on current filter criteria
  const filteredCalls = allCalls?.filter(call => {
    // Date range filter
    if (selectedDateRange.from || selectedDateRange.to) {
      const callDate = new Date(call.createdAt);
      if (selectedDateRange.from) {
        const fromDate = new Date(selectedDateRange.from);
        fromDate.setHours(0, 0, 0, 0);
        if (callDate < fromDate) return false;
      }
      if (selectedDateRange.to) {
        const toDate = new Date(selectedDateRange.to);
        toDate.setHours(23, 59, 59, 999);
        if (callDate > toDate) return false;
      }
    }
    
    // Call type filter
    if (selectedCallType && selectedCallType !== 'all' && call.type !== selectedCallType) return false;
    
    // Assistant filter
    if (selectedAssistant && selectedAssistant !== 'all') {
      const callAssistantDisplay = call.assistantName && call.assistantName.trim() ? call.assistantName : call.assistantId;
      if (callAssistantDisplay !== selectedAssistant) return false;
    }
    
    // Phone number filters
    if (assistantPhoneFilter && !call.assistantPhoneNumber?.includes(assistantPhoneFilter)) return false;
    if (customerPhoneFilter && !call.customerPhoneNumber?.includes(customerPhoneFilter)) return false;
    
    // Call ID filter
    if (callIdFilter && !call.id.toLowerCase().includes(callIdFilter.toLowerCase())) return false;
    
    // Success evaluation filter
    if (selectedSuccessEvaluation && selectedSuccessEvaluation !== 'all') {
      const isSuccess = ['customer-ended-call', 'assistant-ended-call', 'completed'].includes(call.endedReason) && 
                       ['ended', 'completed'].includes(call.status) && 
                       call.duration > 30;
      const evaluation = isSuccess ? 'pass' : 'fail';
      if (evaluation !== selectedSuccessEvaluation) return false;
    }
    
    // Ended reason filter
    if (selectedEndedReason && selectedEndedReason !== 'all' && call.endedReason !== selectedEndedReason) return false;
    
    // Cost range filter
    if (costRange.min && call.cost < parseFloat(costRange.min)) return false;
    if (costRange.max && call.cost > parseFloat(costRange.max)) return false;
    
    // Duration range filter
    if (durationRange.min && call.duration < parseInt(durationRange.min)) return false;
    if (durationRange.max && call.duration > parseInt(durationRange.max)) return false;
    
    return true;
  }) || [];

  // AI Analysis mutation
  const analysisMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await fetch('/api/bulk-analysis/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          filters: [], // Not using old filter format anymore
          callIds: (filteredCalls as any[])?.map((call: any) => call.id) || []
        }),
      });
      if (!response.ok) throw new Error('Analysis failed');
      return response.json();
    },
    onSuccess: (result) => {
      const userMessage: AnalysisMessage = {
        id: Date.now() + '-user',
        role: 'user',
        content: analysisQuery,
        timestamp: new Date(),
      };
      
      const assistantMessage: AnalysisMessage = {
        id: Date.now() + '-assistant',
        role: 'assistant',
        content: result.analysis,
        timestamp: new Date(),
        analysisType: result.analysisType,
      };

      setConversationHistory(prev => [...prev, userMessage, assistantMessage]);
      setAnalysisQuery('');
      
      toast({
        title: "Analysis Complete",
        description: "Your transcript analysis is ready",
      });
    },
    onError: () => {
      toast({
        title: "Analysis Failed",
        description: "Could not analyze transcripts. Please try again.",
        variant: "destructive",
      });
    },
  });

  // AI Prompt Optimization mutation
  const optimizationMutation = useMutation({
    mutationFn: async ({ assistantId, currentPrompt, transcriptIds }: { 
      assistantId: string; 
      currentPrompt: string; 
      transcriptIds: string[] 
    }) => {
      const response = await fetch('/api/voicescope/optimize-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assistantId, currentPrompt, transcriptIds }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Optimization failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setOptimizationResults(data);
      toast({
        title: "Optimization Complete",
        description: `Generated ${data.analysis.suggestions?.length || 0} improvement suggestions`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Optimization Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Conversation Flow Analysis mutation
  const flowAnalysisMutation = useMutation({
    mutationFn: async (analysisType: string) => {
      const response = await fetch('/api/conversation-flow/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callIds: (filteredCalls as any[])?.map((call: any) => call.id) || [],
          analysisType
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Flow analysis failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setFlowAnalysisResults(data);
      toast({
        title: "Flow Analysis Complete",
        description: `Analyzed conversation patterns for ${data.summary.totalCallsAnalyzed} calls`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Flow Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const clearAllFilters = () => {
    setSelectedDateRange({});
    setSelectedCallType('all');
    setSelectedAssistant('all');
    setAssistantPhoneFilter('');
    setCustomerPhoneFilter('');
    setCallIdFilter('');
    setSelectedSuccessEvaluation('all');
    setSelectedEndedReason('all');
    setCostRange({});
    setDurationRange({});
  };
  
  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedDateRange.from || selectedDateRange.to) count++;
    if (selectedCallType && selectedCallType !== 'all') count++;
    if (selectedAssistant && selectedAssistant !== 'all') count++;
    if (assistantPhoneFilter && assistantPhoneFilter.trim()) count++;
    if (customerPhoneFilter && customerPhoneFilter.trim()) count++;
    if (callIdFilter && callIdFilter.trim()) count++;
    if (selectedSuccessEvaluation && selectedSuccessEvaluation !== 'all') count++;
    if (selectedEndedReason && selectedEndedReason !== 'all') count++;
    if (costRange.min || costRange.max) count++;
    if (durationRange.min || durationRange.max) count++;
    return count;
  };
  
  const addFilter = () => {
    // This function is no longer needed as filters are now applied directly
    return;
  };
  
  // Remove old filter logic
  const removeFilter = () => {
    return;
  };
  


  const handleAnalysis = () => {
    if (!analysisQuery.trim()) return;
    if (!filteredCalls || filteredCalls.length === 0) {
      toast({
        title: "No Data",
        description: "Please ensure you have calls data matching your filters",
        variant: "destructive",
      });
      return;
    }
    
    analysisMutation.mutate(analysisQuery);
  };

  const clearConversation = () => {
    setConversationHistory([]);
  };

  const handlePromptOptimization = () => {
    if (!selectedAssistant || selectedAssistant === 'all' || !currentPrompt.trim() || !filteredCalls?.length) {
      toast({
        title: "Missing Information",
        description: "Please select an assistant, enter a prompt, and ensure you have filtered calls for analysis.",
        variant: "destructive",
      });
      return;
    }

    const assistantCalls = filteredCalls.filter(call => call.assistantId === selectedAssistant);
    const transcriptIds = assistantCalls.slice(0, 10).map(call => call.id); // Limit to 10 calls for analysis

    optimizationMutation.mutate({
      assistantId: selectedAssistant,
      currentPrompt: currentPrompt.trim(),
      transcriptIds
    });
  };

  const exportConversation = () => {
    const conversationText = conversationHistory.map(msg => 
      `[${msg.timestamp.toLocaleString()}] ${msg.role.toUpperCase()}: ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk-analysis-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Suggested questions for users
  const suggestedQuestions = [
    "What are the most common reasons for call failures?",
    "How do call durations vary by time of day?",
    "What sentiment patterns appear in successful vs failed calls?",
    "Which assistants perform best for different conversation types?",
    "Are there common topics or keywords in high-cost calls?",
    "What are the conversation flow patterns for quick hangups?",
    "Are there transcription quality issues or errors?",
    "What are the peak conversation flow bottlenecks?"
  ];

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
                <Link href="/bulk-analysis" className="text-primary border-b-2 border-primary pb-4 px-1 text-sm font-medium flex items-center space-x-1">
                  <Brain size={16} />
                  <span>VoiceScope</span>
                </Link>
                <Link href="/performance-benchmarks" className="text-muted-foreground hover:text-foreground pb-4 px-1 text-sm font-medium transition-colors flex items-center space-x-1">
                  <Activity size={16} />
                  <span>Benchmarks</span>
                </Link>
                <Link href="/assistant-studio" className="text-muted-foreground hover:text-foreground pb-4 px-1 text-sm font-medium transition-colors flex items-center space-x-1">
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
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Brain className="text-primary" size={40} />
            <h1 className="text-4xl font-bold text-foreground">VoiceScope</h1>
          </div>
          <p className="text-center text-lg text-muted-foreground mb-4">Advanced AI-powered voice analytics and transcript intelligence</p>
          <div className="text-center text-sm text-muted-foreground">
            {allCalls ? (
              <div className="flex justify-center items-center space-x-4">
                <span className="inline-flex items-center space-x-2">
                  <span>Total Dataset:</span>
                  <Badge variant="secondary" className="text-sm font-medium">
                    {allCalls.length.toLocaleString()} calls
                  </Badge>
                </span>
                {filteredCalls && filteredCalls.length !== allCalls.length && (
                  <span className="inline-flex items-center space-x-2">
                    <span>Filtered:</span>
                    <Badge variant="default" className="text-sm font-medium">
                      {filteredCalls.length.toLocaleString()} calls
                    </Badge>
                  </span>
                )}
              </div>
            ) : (
              <span>Loading dataset...</span>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-border">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('analysis')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'analysis'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                data-testid="tab-analysis"
              >
                <MessageSquare size={16} className="inline mr-2" />
                Transcript Analysis
              </button>
              <button
                onClick={() => setActiveTab('optimization')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'optimization'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                data-testid="tab-optimization"
              >
                <Brain size={16} className="inline mr-2" />
                Prompt Optimization
              </button>
              <button
                onClick={() => setActiveTab('flows')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'flows'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                data-testid="tab-flows"
              >
                <Activity size={16} className="inline mr-2" />
                Conversation Flows
              </button>
            </nav>
          </div>
        </div>

        {/* AI Prompt Optimization Section */}
        {activeTab === 'optimization' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain size={20} />
              <span>AI Prompt Optimizer</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Upload your assistant prompts and get AI-powered optimization suggestions based on call transcript analysis
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Assistant Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Select Assistant</Label>
                <Select value={selectedAssistant} onValueChange={setSelectedAssistant}>
                  <SelectTrigger data-testid="select-assistant-optimize">
                    <SelectValue placeholder="Choose assistant to optimize" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Assistants</SelectItem>
                    {assistants.map((assistant) => (
                      <SelectItem key={assistant} value={assistant}>{assistant}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Optimization Button */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Analyze & Optimize</Label>
                <Button 
                  className="w-full" 
                  disabled={!selectedAssistant || selectedAssistant === 'all' || !filteredCalls?.length || !currentPrompt.trim() || optimizationMutation.isPending}
                  onClick={handlePromptOptimization}
                  data-testid="button-optimize-prompt"
                >
                  {optimizationMutation.isPending ? (
                    <Loader2 className="mr-2 animate-spin" size={16} />
                  ) : (
                    <Brain className="mr-2" size={16} />
                  )}
                  {optimizationMutation.isPending ? 'Analyzing...' : 'Generate Optimizations'}
                </Button>
              </div>
            </div>

            {/* Current Prompt Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Current Assistant Prompt</Label>
              <Textarea 
                placeholder="Paste your current assistant prompt here for analysis..."
                className="min-h-24"
                value={currentPrompt}
                onChange={(e) => setCurrentPrompt(e.target.value)}
                data-testid="textarea-current-prompt"
              />
              <div className="text-xs text-muted-foreground">
                Upload your current prompt to get specific improvement suggestions
              </div>
            </div>

            {/* Optimization Results */}
            {optimizationResults && (
              <div className="space-y-4 mt-6 pt-6 border-t">
                <h3 className="font-semibold text-lg flex items-center space-x-2">
                  <Brain size={18} />
                  <span>Optimization Results</span>
                  <Badge variant="outline" className="ml-2">
                    Score: {optimizationResults.analysis.overallScore}/10
                  </Badge>
                </h3>

                {/* Key Issues */}
                {optimizationResults.analysis.keyIssues?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">Key Issues Identified:</h4>
                    <div className="space-y-1">
                      {optimizationResults.analysis.keyIssues.map((issue: string, index: number) => (
                        <div key={index} className="flex items-start space-x-2 text-sm">
                          <AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                          <span>{issue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {optimizationResults.analysis.suggestions?.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground">Improvement Suggestions:</h4>
                    <div className="space-y-3">
                      {optimizationResults.analysis.suggestions.map((suggestion: any, index: number) => (
                        <Card key={index} className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Badge variant={
                                suggestion.priority === 'high' ? 'destructive' : 
                                suggestion.priority === 'medium' ? 'default' : 'secondary'
                              }>
                                {suggestion.priority} priority
                              </Badge>
                              <Badge variant="outline">{suggestion.category}</Badge>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{suggestion.issue}</p>
                              <p className="text-sm text-muted-foreground mt-1">{suggestion.solution}</p>
                            </div>
                            {suggestion.promptUpdate && (
                              <div className="mt-2 p-2 bg-muted rounded text-xs font-mono">
                                {suggestion.promptUpdate}
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Improved Prompt */}
                {optimizationResults.analysis.improvedPrompt && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">Optimized Prompt:</h4>
                    <div className="p-4 bg-muted rounded-lg">
                      <pre className="text-sm whitespace-pre-wrap font-mono">
                        {optimizationResults.analysis.improvedPrompt}
                      </pre>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(optimizationResults.analysis.improvedPrompt);
                        toast({ title: "Copied to clipboard", description: "Optimized prompt copied successfully" });
                      }}
                      data-testid="button-copy-prompt"
                    >
                      <Copy size={14} className="mr-1" />
                      Copy Optimized Prompt
                    </Button>
                  </div>
                )}

                {/* Expected Improvements */}
                {optimizationResults.analysis.expectedImprovements?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">Expected Improvements:</h4>
                    <div className="space-y-1">
                      {optimizationResults.analysis.expectedImprovements.map((improvement: string, index: number) => (
                        <div key={index} className="flex items-start space-x-2 text-sm">
                          <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{improvement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => setOptimizationResults(null)}
                    data-testid="button-clear-results"
                  >
                    Clear Results
                  </Button>
                  <Button 
                    onClick={() => {
                      const reportData = {
                        assistant: selectedAssistant,
                        originalPrompt: currentPrompt,
                        analysis: optimizationResults.analysis,
                        generatedAt: optimizationResults.generatedAt,
                        transcriptsAnalyzed: optimizationResults.transcriptsAnalyzed
                      };
                      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `prompt-optimization-${selectedAssistant}-${new Date().toISOString().split('T')[0]}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    data-testid="button-export-report"
                  >
                    <Download size={14} className="mr-1" />
                    Export Report
                  </Button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {optimizationMutation.isPending && (
              <div className="flex items-center justify-center py-8 space-x-3">
                <Loader2 className="animate-spin" size={20} />
                <span className="text-sm text-muted-foreground">Analyzing transcripts and generating optimizations...</span>
              </div>
            )}
          </CardContent>
        </Card>
        )}

        {/* Transcript Analysis Section */}
        {activeTab === 'analysis' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Filters Section */}
          <Card className="xl:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter size={20} />
                <span>Data Filters</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Add filters to focus your analysis on specific call segments
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date Range Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Date Range</Label>
                <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal" data-testid="button-date-range">
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {selectedDateRange.from ? (
                        selectedDateRange.to ? (
                          `${selectedDateRange.from.toLocaleDateString()} - ${selectedDateRange.to.toLocaleDateString()}`
                        ) : (
                          selectedDateRange.from.toLocaleDateString()
                        )
                      ) : (
                        "Pick date range"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      selected={selectedDateRange}
                      onSelect={(range) => setSelectedDateRange(range || {})}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Call Type Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Call Type</Label>
                <Select value={selectedCallType} onValueChange={setSelectedCallType}>
                  <SelectTrigger data-testid="select-call-type">
                    <SelectValue placeholder="All call types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="inbound">Inbound</SelectItem>
                    <SelectItem value="outbound">Outbound</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Assistant Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Assistant</Label>
                <Select value={selectedAssistant} onValueChange={setSelectedAssistant}>
                  <SelectTrigger data-testid="select-assistant">
                    <SelectValue placeholder="All assistants" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Assistants</SelectItem>
                    {assistants.map((assistant) => (
                      <SelectItem key={assistant} value={assistant}>{assistant}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Phone Number Filters */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Assistant Phone</Label>
                <Input
                  type="tel"
                  placeholder="Assistant phone number"
                  value={assistantPhoneFilter}
                  onChange={(e) => setAssistantPhoneFilter(e.target.value)}
                  data-testid="input-assistant-phone"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Customer Phone</Label>
                <Input
                  type="tel"
                  placeholder="Customer phone number"
                  value={customerPhoneFilter}
                  onChange={(e) => setCustomerPhoneFilter(e.target.value)}
                  data-testid="input-customer-phone"
                />
              </div>

              {/* Call ID Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Call ID</Label>
                <Input
                  placeholder="Search by call ID"
                  value={callIdFilter}
                  onChange={(e) => setCallIdFilter(e.target.value)}
                  data-testid="input-call-id"
                />
              </div>

              {/* Success Evaluation Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Success Evaluation</Label>
                <Select value={selectedSuccessEvaluation} onValueChange={setSelectedSuccessEvaluation}>
                  <SelectTrigger data-testid="select-success-evaluation">
                    <SelectValue placeholder="All evaluations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Evaluations</SelectItem>
                    <SelectItem value="pass">Pass</SelectItem>
                    <SelectItem value="fail">Fail</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Ended Reason Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Ended Reason</Label>
                <Select value={selectedEndedReason} onValueChange={setSelectedEndedReason}>
                  <SelectTrigger data-testid="select-ended-reason">
                    <SelectValue placeholder="All end reasons" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reasons</SelectItem>
                    {endedReasons.map((reason) => (
                      <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Cost Range Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Cost Range ($)</Label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Min cost"
                    value={costRange.min || ''}
                    onChange={(e) => setCostRange(prev => ({...prev, min: e.target.value}))}
                    data-testid="input-cost-min"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Max cost"
                    value={costRange.max || ''}
                    onChange={(e) => setCostRange(prev => ({...prev, max: e.target.value}))}
                    data-testid="input-cost-max"
                  />
                </div>
              </div>

              {/* Duration Range Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Duration Range (seconds)</Label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    placeholder="Min seconds"
                    value={durationRange.min || ''}
                    onChange={(e) => setDurationRange(prev => ({...prev, min: e.target.value}))}
                    data-testid="input-duration-min"
                  />
                  <Input
                    type="number"
                    placeholder="Max seconds"
                    value={durationRange.max || ''}
                    onChange={(e) => setDurationRange(prev => ({...prev, max: e.target.value}))}
                    data-testid="input-duration-max"
                  />
                </div>
              </div>

              {/* Clear All Filters Button */}
              <Button 
                onClick={clearAllFilters}
                variant="outline" 
                size="sm" 
                className="w-full"
                disabled={getActiveFilterCount() === 0}
                data-testid="button-clear-filters"
              >
                Clear All Filters
              </Button>

              {/* Filtered Dataset Info */}
              <Card className="bg-muted/30">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Dataset Size:</span>
                    <Badge variant="outline" data-testid="badge-dataset-size">
                      {isLoadingCalls ? (
                        <Loader2 className="animate-spin" size={12} />
                      ) : (
                        `${filteredCalls?.length || 0} calls`
                      )}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Active Filters:</span>
                      <span>{getActiveFilterCount()}</span>
                    </div>
                    {getActiveFilterCount() > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Filtered from {allCalls?.length || 0} total calls
                      </div>
                    )}
                  </div>
                  {filteredCalls && filteredCalls.length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Ready for AI analysis
                    </div>
                  )}
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* Analysis Interface */}
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare size={20} />
                <span>AI Analysis Chat</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Ask questions about your filtered call transcripts in natural language
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Conversation History */}
              <ScrollArea className="h-96 w-full border rounded-lg p-4 bg-muted/20">
                {conversationHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                    <Brain className="text-muted-foreground" size={48} />
                    <div>
                      <h3 className="font-medium text-foreground">Start Your Analysis</h3>
                      <p className="text-sm text-muted-foreground">
                        Ask questions about your call transcripts below
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conversationHistory.map((message) => (
                      <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === 'user' 
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background border'
                        }`}>
                          <div className="text-sm">{message.content}</div>
                          <div className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    {analysisMutation.isPending && (
                      <div className="flex justify-start">
                        <div className="bg-background border rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <Loader2 className="animate-spin" size={16} />
                            <span className="text-sm">Analyzing transcripts...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>

              {/* Analysis Input */}
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <Textarea
                    placeholder="Ask questions about your call transcripts: 'What are the main reasons for call failures?' or 'What topics appear in high-cost conversations?'"
                    value={analysisQuery}
                    onChange={(e) => setAnalysisQuery(e.target.value)}
                    className="flex-1 min-h-[80px]"
                    data-testid="textarea-analysis-query"
                  />
                  <Button 
                    onClick={handleAnalysis}
                    disabled={!analysisQuery.trim() || analysisMutation.isPending || !filteredCalls || filteredCalls.length === 0}
                    className="self-end"
                    data-testid="button-analyze"
                  >
                    {analysisMutation.isPending ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Search size={16} />
                    )}
                  </Button>
                </div>

                {/* Suggested Questions */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Suggested Questions</Label>
                  <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.slice(0, 4).map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => setAnalysisQuery(question)}
                        data-testid={`button-suggested-${index}`}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Chat Actions */}
                {conversationHistory.length > 0 && (
                  <div className="flex space-x-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={exportConversation}
                      data-testid="button-export-conversation"
                    >
                      <Download size={16} className="mr-1" />
                      Export Chat
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearConversation}
                      data-testid="button-clear-conversation"
                    >
                      <X size={16} className="mr-1" />
                      Clear Chat
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Summary Statistics */}
          {filteredCalls && filteredCalls.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp size={20} />
                  <span>Filtered Dataset Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="text-chart-1 mr-1" size={16} />
                    <span className="text-xs text-muted-foreground">Total Calls</span>
                  </div>
                  <p className="text-lg font-bold text-chart-1" data-testid="stat-total-calls">
                    {filteredCalls?.length || 0}
                  </p>
                </div>
                
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <Clock className="text-chart-2 mr-1" size={16} />
                    <span className="text-xs text-muted-foreground">Avg Duration</span>
                  </div>
                  <p className="text-lg font-bold text-chart-2" data-testid="stat-avg-duration">
                    {filteredCalls?.length ? 
                      `${Math.round(filteredCalls.reduce((sum: number, call: any) => sum + (call.duration || 0), 0) / filteredCalls.length / 60)}m` 
                      : '0m'
                    }
                  </p>
                </div>
                
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <TrendingUp className="text-chart-3 mr-1" size={16} />
                    <span className="text-xs text-muted-foreground">Total Cost</span>
                  </div>
                  <p className="text-lg font-bold text-chart-3" data-testid="stat-total-cost">
                    ${filteredCalls?.length ? 
                      filteredCalls.reduce((sum: number, call: any) => sum + (call.cost || 0), 0).toFixed(2)
                      : '0.00'
                    }
                  </p>
                </div>

                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <MessageSquare className="text-chart-4 mr-1" size={16} />
                    <span className="text-xs text-muted-foreground">With Transcripts</span>
                  </div>
                  <p className="text-lg font-bold text-chart-4" data-testid="stat-with-transcripts">
                    {filteredCalls?.filter((call: any) => call.transcript).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          )}
        </div>
        )}

        {/* Conversation Flow Analysis Section */}
        {activeTab === 'flows' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity size={20} />
                  <span>Conversation Flow Analysis</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Analyze conversation patterns, healthcare-specific flows, and compliance adherence across your calls
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => flowAnalysisMutation.mutate('healthcare')}
                    disabled={!filteredCalls?.length || flowAnalysisMutation.isPending}
                    className="h-24 flex flex-col items-center justify-center space-y-2"
                    data-testid="button-analyze-healthcare"
                  >
                    {flowAnalysisMutation.isPending ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <Users size={20} />
                    )}
                    <div className="text-center">
                      <div className="font-medium">Healthcare Flows</div>
                      <div className="text-xs opacity-80">Appointment booking, prescriptions</div>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => flowAnalysisMutation.mutate('compliance')}
                    disabled={!filteredCalls?.length || flowAnalysisMutation.isPending}
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center space-y-2"
                    data-testid="button-analyze-compliance"
                  >
                    {flowAnalysisMutation.isPending ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <CheckCircle size={20} />
                    )}
                    <div className="text-center">
                      <div className="font-medium">Compliance Check</div>
                      <div className="text-xs opacity-80">HIPAA, privacy patterns</div>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => flowAnalysisMutation.mutate('efficiency')}
                    disabled={!filteredCalls?.length || flowAnalysisMutation.isPending}
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center space-y-2"
                    data-testid="button-analyze-efficiency"
                  >
                    {flowAnalysisMutation.isPending ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <TrendingUp size={20} />
                    )}
                    <div className="text-center">
                      <div className="font-medium">Flow Efficiency</div>
                      <div className="text-xs opacity-80">Conversation structure, timing</div>
                    </div>
                  </Button>
                </div>

                {flowAnalysisResults && (
                  <div className="space-y-4 mt-6 pt-6 border-t">
                    <h3 className="font-semibold text-lg">Flow Analysis Results</h3>
                    
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="p-4">
                        <div className="text-2xl font-bold">{flowAnalysisResults.summary.totalCallsAnalyzed}</div>
                        <div className="text-xs text-muted-foreground">Calls Analyzed</div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-2xl font-bold">{flowAnalysisResults.summary.avgConversationTurns.toFixed(1)}</div>
                        <div className="text-xs text-muted-foreground">Avg Turns</div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-2xl font-bold">{(flowAnalysisResults.summary.avgCompletionScore * 100).toFixed(0)}%</div>
                        <div className="text-xs text-muted-foreground">Completion Score</div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-2xl font-bold">{(flowAnalysisResults.summary.structuralIntegrity * 100).toFixed(0)}%</div>
                        <div className="text-xs text-muted-foreground">Structure Quality</div>
                      </Card>
                    </div>

                    {/* Healthcare Insights */}
                    {flowAnalysisResults.healthcareInsights && (
                      <div className="space-y-4">
                        <h4 className="font-medium">Healthcare Flow Insights</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="p-4">
                            <h5 className="font-medium mb-2">Appointment Flow</h5>
                            <div className="text-sm space-y-1">
                              <div>Success Rate: {flowAnalysisResults.healthcareInsights.appointmentFlowOptimization.successRate.toFixed(1)}%</div>
                              <div>Avg Duration: {flowAnalysisResults.healthcareInsights.appointmentFlowOptimization.avgDuration.toFixed(0)}s</div>
                            </div>
                          </Card>
                          <Card className="p-4">
                            <h5 className="font-medium mb-2">Compliance Adherence</h5>
                            <div className="text-sm space-y-1">
                              <div>Privacy Score: {flowAnalysisResults.healthcareInsights.complianceAdherence.privacyScore.toFixed(0)}%</div>
                              <div>Risk Calls: {flowAnalysisResults.healthcareInsights.complianceAdherence.riskCalls}</div>
                            </div>
                          </Card>
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {flowAnalysisResults.recommendations?.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium">Flow Improvement Recommendations</h4>
                        <div className="space-y-2">
                          {flowAnalysisResults.recommendations.map((rec: string, index: number) => (
                            <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                              <CheckCircle size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Flow Improvements */}
                    {flowAnalysisResults.flowImprovements?.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium">Specific Flow Improvements</h4>
                        <div className="space-y-3">
                          {flowAnalysisResults.flowImprovements.map((improvement: any, index: number) => (
                            <Card key={index} className="p-4">
                              <div className="space-y-2">
                                <div className="font-medium">{improvement.scenario}</div>
                                <div className="text-sm text-muted-foreground">
                                  <strong>Current Issues:</strong> {improvement.currentIssues}
                                </div>
                                <div className="text-sm">
                                  <strong>Suggested Flow:</strong> {improvement.suggestedFlow}
                                </div>
                                <div className="text-sm text-green-600 dark:text-green-400">
                                  <strong>Expected Impact:</strong> {improvement.expectedImpact}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

      </main>

      {/* Dataset Preview - Full width spanning below all content */}
      {allCalls && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye size={20} />
                  <span>Dataset Preview</span>
                  <Badge variant="outline" className="ml-2">
                    {(filteredCalls || allCalls)?.length || 0} calls
                  </Badge>
                  {filteredCalls && filteredCalls.length !== allCalls?.length && (
                    <Badge variant="secondary" className="text-xs">
                      Filtered
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Scroll to explore • Click rows for details
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {filteredCalls ? 
                  `Preview of ${filteredCalls.length} filtered calls for AI analysis` : 
                  `All ${allCalls?.length || 0} calls from your dataset`
                }
              </p>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-auto border rounded-lg" data-testid="dataset-preview">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10 border-b">
                    <TableRow>
                      <TableHead className="w-28">Call ID</TableHead>
                      <TableHead className="w-16">Type</TableHead>
                      <TableHead className="w-20">Duration</TableHead>
                      <TableHead className="w-18">Cost</TableHead>
                      <TableHead className="w-28">Date</TableHead>
                      <TableHead className="w-24">Status</TableHead>
                      <TableHead className="w-32">Assistant</TableHead>
                      <TableHead className="w-20">Transcript</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(filteredCalls || allCalls || []).slice(0, 100).map((call: any) => {
                      const hasTranscript = call.transcript && call.transcript.length > 0;
                      const isRecent = new Date().getTime() - new Date(call.createdAt).getTime() < 24 * 60 * 60 * 1000;
                      
                      return (
                        <TableRow 
                          key={call.id} 
                          className="text-xs hover:bg-muted/50 cursor-pointer transition-colors"
                          data-testid={`call-row-${call.id}`}
                        >
                          <TableCell className="font-mono">
                            <div className="flex items-center space-x-1">
                              <span>{call.id.substring(0, 8)}...</span>
                              {isRecent && <div className="w-1 h-1 bg-green-500 rounded-full" title="Recent call"></div>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={call.type === 'inbound' ? 'default' : 'secondary'} 
                              className="text-xs px-1 py-0"
                            >
                              {call.type === 'inbound' ? 'In' : 'Out'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono">
                            {call.duration ? 
                              `${Math.floor(call.duration / 60)}:${(call.duration % 60).toString().padStart(2, '0')}` : 
                              '--'
                            }
                          </TableCell>
                          <TableCell className="font-mono">
                            ${call.cost?.toFixed(2) || '0.00'}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{new Date(call.createdAt).toLocaleDateString()}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(call.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col space-y-1">
                              <Badge 
                                variant={
                                  call.status === 'ended' ? 'default' : 
                                  call.status === 'in-progress' ? 'secondary' : 
                                  'outline'
                                } 
                                className="text-xs px-1 py-0 w-fit"
                              >
                                {call.status || 'unknown'}
                              </Badge>
                              {call.endedReason && (
                                <span className="text-xs text-muted-foreground truncate max-w-20" title={call.endedReason}>
                                  {call.endedReason}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-32 truncate" title={call.assistantName || call.assistantId}>
                              {call.assistantName || call.assistantId?.substring(0, 8) + '...' || '--'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              {hasTranscript ? (
                                <>
                                  <div className="w-2 h-2 bg-green-500 rounded-full" title="Has transcript"></div>
                                  <span className="text-xs text-muted-foreground">
                                    {call.transcript.length > 100 ? `${Math.floor(call.transcript.length / 100)}k` : call.transcript.length} chars
                                  </span>
                                </>
                              ) : (
                                <>
                                  <div className="w-2 h-2 bg-gray-300 rounded-full" title="No transcript"></div>
                                  <span className="text-xs text-muted-foreground">--</span>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {(filteredCalls || allCalls || []).length > 100 && (
                  <div className="text-center py-3 text-xs text-muted-foreground border-t bg-muted/20">
                    <div className="flex items-center justify-center space-x-2">
                      <span>Showing first 100 of {(filteredCalls || allCalls || []).length} calls</span>
                      <Button variant="outline" size="sm" className="h-6 text-xs px-2">
                        Load More
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
      )}
    </div>
  );
}