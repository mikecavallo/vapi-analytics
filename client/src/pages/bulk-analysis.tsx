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
import type { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Calendar as CalendarIcon,
  Phone,
  Eye,
  AlertTriangle,
  CheckCircle,
  Copy,
  Activity,
  Wand2,
  FileText,
  LogOut
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/theme-context";
import logoTransparent from "@assets/logo_transparent_1757373755849.png";
import { useAuth } from "@/contexts/auth-context";
import { DashboardHeader } from "@/components/layout/dashboard-header";

interface FilterCriteria {
  id: string;
  type: 'callId' | 'assistantId' | 'squadId' | 'createdAtRange';
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
  // State management (keeping all existing state variables)
  const { toast } = useToast();
  const [callsData, setCallsData] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [callIdFilter, setCallIdFilter] = useState('');
  const [assistantIdFilter, setAssistantIdFilter] = useState('');
  const [squadIdFilter, setSquadIdFilter] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>(undefined);
  const [conversationHistory, setConversationHistory] = useState<AnalysisMessage[]>([]);
  const [analysisQuery, setAnalysisQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Example prompts for the chat
  const examplePrompts = [
    "What are the main conversation patterns?",
    "Which assistants perform best?",
    "Show me cost analysis by time period",
    "What are common failure points?",
    "Analyze call duration trends"
  ];

  // Check if any filters are set
  const hasFilters = callIdFilter.trim() !== '' || 
                    assistantIdFilter.trim() !== '' || 
                    squadIdFilter.trim() !== '' || 
                    selectedDateRange?.from;

  // Filter functions (keeping existing logic)
  const clearAllFilters = () => {
    setCallIdFilter('');
    setAssistantIdFilter('');
    setSquadIdFilter('');
    setSelectedDateRange(undefined);
    setCallsData([]);
  };

  const fetchDataWithFilters = async () => {
    if (!hasFilters) {
      toast({
        title: "No filters set",
        description: "Please set at least one filter before getting data.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingData(true);
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (callIdFilter.trim()) queryParams.append('id', callIdFilter.trim());
      if (assistantIdFilter.trim()) queryParams.append('assistantId', assistantIdFilter.trim());
      if (squadIdFilter.trim()) queryParams.append('squadId', squadIdFilter.trim());
      if (selectedDateRange?.from) {
        queryParams.append('createdAtGt', selectedDateRange.from.toISOString());
        if (selectedDateRange.to) {
          queryParams.append('createdAtLt', selectedDateRange.to.toISOString());
        }
      }

      const response = await apiRequest('GET', `/api/bulk-analysis/calls?${queryParams.toString()}`);
      const data = await response.json();
      setCallsData(Array.isArray(data) ? data : []);

      toast({
        title: "Data loaded successfully",
        description: `Found ${Array.isArray(data) ? data.length : 0} matching calls.`,
      });
    } catch (error) {
      console.error('Error fetching filtered calls:', error);
      toast({
        title: "Error loading data",
        description: "There was an error loading your call data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  // Analysis mutation
  const performAnalysisMutation = useMutation({
    mutationFn: async ({ callIds, analysisType }: { callIds: string[], analysisType: string }) => {
      const response = await apiRequest('POST', '/api/bulk-analysis/analyze', { callIds, analysisType });
      return response.json();
    },
    onSuccess: (data, variables) => {
      const newMessage: AnalysisMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.analysis || 'Analysis completed',
        timestamp: new Date(),
        analysisType: variables.analysisType,
      };
      setConversationHistory(prev => [...prev, newMessage]);
      setIsAnalyzing(false);
    },
    onError: (error) => {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your data. Please try again.",
        variant: "destructive",
      });
      setIsAnalyzing(false);
    }
  });

  const handleAnalysisSubmit = async () => {
    if (!analysisQuery.trim() || callsData.length === 0) return;

    const userMessage: AnalysisMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: analysisQuery.trim(),
      timestamp: new Date(),
    };
    
    setConversationHistory(prev => [...prev, userMessage]);
    setIsAnalyzing(true);
    setAnalysisQuery('');

    try {
      const callIds = callsData.map(call => call.id);
      await performAnalysisMutation.mutateAsync({
        callIds,
        analysisType: analysisQuery.trim()
      });
    } catch (error) {
      console.error('Error submitting analysis:', error);
      setIsAnalyzing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAnalysisSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader />

      {/* VoiceScope Header Section */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
              <img src={logoTransparent} alt="Invoxa.ai" className="h-10 w-auto" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                VoiceScope
              </h1>
              <p className="text-lg text-muted-foreground mt-1">
                AI-Powered Call Data Analysis Platform
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">What is VoiceScope?</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                VoiceScope is our proprietary AI analysis engine that transforms your voice call data into actionable insights. 
                Simply filter your call data and ask natural language questions to uncover patterns, trends, and optimization opportunities.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">What You Can Accomplish</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>Identify conversation patterns and success factors</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>Analyze call performance across different time periods</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>Compare assistant effectiveness and optimization areas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>Generate detailed reports and compliance summaries</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>Discover cost optimization and ROI improvement opportunities</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 flex flex-col gap-6 p-6">
        {/* Top Row: Filters + Chat */}
        <div className="flex gap-6 min-h-[500px]">
          {/* Left: Data Filters */}
          <div className="w-80 h-full bg-card border border-border rounded-lg p-6">
            <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-500" />
                Data Filters
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Apply filters to focus your analysis on specific call data
              </p>
            </div>


            {/* Assistant ID Filter */}
            <div className="space-y-2">
              <Label htmlFor="assistant-id-filter" className="text-sm font-medium">Assistant ID</Label>
              <Input
                id="assistant-id-filter"
                placeholder="Enter assistant ID"
                value={assistantIdFilter}
                onChange={(e) => setAssistantIdFilter(e.target.value)}
                data-testid="input-assistant-id"
                className="w-full"
              />
            </div>

            {/* Squad ID Filter */}
            <div className="space-y-2">
              <Label htmlFor="squad-id-filter" className="text-sm font-medium">Squad ID</Label>
              <Input
                id="squad-id-filter"
                placeholder="Enter squad ID"
                value={squadIdFilter}
                onChange={(e) => setSquadIdFilter(e.target.value)}
                data-testid="input-squad-id"
                className="w-full"
              />
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    data-testid="button-date-range"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDateRange?.from ? (
                      selectedDateRange.to ? (
                        `${selectedDateRange.from.toLocaleDateString()} - ${selectedDateRange.to.toLocaleDateString()}`
                      ) : (
                        selectedDateRange.from.toLocaleDateString()
                      )
                    ) : (
                      "Pick a date range"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={selectedDateRange}
                    onSelect={setSelectedDateRange}
                    numberOfMonths={2}
                    data-testid="calendar-date-range"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <Button 
                onClick={fetchDataWithFilters}
                disabled={!hasFilters || isLoadingData}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                data-testid="button-get-data"
              >
                {isLoadingData ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading Data...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Get Data
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={clearAllFilters}
                className="w-full"
                data-testid="button-clear-filters"
              >
                <X className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            </div>

            {/* Show filter requirements */}
            {!hasFilters && (
              <div className="bg-muted/50 rounded-lg p-3 mt-4">
                <p className="text-sm text-muted-foreground text-center">
                  Set at least one filter above and click "Get Data" to load call records for analysis.
                </p>
              </div>
            )}
            </div>
          </div>

          {/* Right: AI Chat Window */}
          <div className="flex-1 h-full min-h-0">
            <Card className="h-full rounded-none border-0 flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-500" />
                    AI Analysis Chat
                  </CardTitle>
                  {callsData.length > 0 && (
                    <Badge variant="secondary">
                      {callsData.length} calls loaded
                    </Badge>
                  )}
                </div>
                {/* Show example prompts when no data */}
                {callsData.length === 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      Try these example questions once you load your data:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {examplePrompts.map((prompt, index) => (
                        <button
                          key={index}
                          onClick={() => setAnalysisQuery(prompt)}
                          className="text-xs px-3 py-1 bg-muted hover:bg-muted/80 rounded-full transition-colors cursor-pointer"
                          data-testid={`example-prompt-${index}`}
                        >
                          "{prompt}"
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent className="flex-1 min-h-0 flex flex-col p-4 overflow-hidden">
                {/* Conversation History */}
                <ScrollArea className="flex-1 min-h-0 border rounded-lg p-3 mb-4">
                  {conversationHistory.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="font-medium">Ready to Analyze Your Data</p>
                      <p className="text-sm">Load call data from the filters on the left, then ask questions to get AI-powered insights</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {conversationHistory.map((message) => (
                        <div
                          key={message.id}
                          className={`p-3 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-blue-50 dark:bg-blue-950 ml-8'
                              : 'bg-muted mr-8'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                              message.role === 'user'
                                ? 'bg-blue-500 text-white'
                                : 'bg-purple-500 text-white'
                            }`}>
                              {message.role === 'user' ? 'U' : 'AI'}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {message.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {/* Show thinking animation when analyzing */}
                      {isAnalyzing && (
                        <div className="p-3 bg-muted mr-8 rounded-lg mb-3">
                          <div className="flex items-start gap-2">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium bg-purple-500 text-white">
                              AI
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">AI is analyzing your data</span>
                                <div className="flex gap-1">
                                  <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                                  <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                                  <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>

                {/* Input Box */}
                <div className="flex gap-3 flex-none">
                  <Textarea
                    placeholder="Ask AI to analyze your call data - Press Enter to send, Shift+Enter for new line"
                    value={analysisQuery}
                    onChange={(e) => setAnalysisQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="min-h-32 flex-1"
                    data-testid="textarea-analysis-query"
                  />
                  <Button
                    onClick={handleAnalysisSubmit}
                    disabled={!analysisQuery.trim() || callsData.length === 0 || performAnalysisMutation.isPending}
                    className="self-end"
                    data-testid="button-submit-analysis"
                  >
                    {performAnalysisMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Analyze
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Row: Dataset Preview - Full Width */}
        <div className="flex-none h-80 overflow-hidden">
            {callsData.length > 0 ? (
              <Card className="h-full rounded-none border-0 flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    Dataset Preview ({callsData.length} calls)
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 min-h-0">
                  <ScrollArea className="h-full">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted">
                          <TableHead className="text-foreground font-medium sticky top-0 bg-muted z-10 border-b border-border">Call ID</TableHead>
                          <TableHead className="text-foreground font-medium sticky top-0 bg-muted z-10 border-b border-border">Type</TableHead>
                          <TableHead className="text-foreground font-medium sticky top-0 bg-muted z-10 border-b border-border">Assistant Name</TableHead>
                          <TableHead className="text-foreground font-medium sticky top-0 bg-muted z-10 border-b border-border">Date & Time</TableHead>
                          <TableHead className="text-foreground font-medium sticky top-0 bg-muted z-10 border-b border-border">Duration</TableHead>
                          <TableHead className="text-foreground font-medium sticky top-0 bg-muted z-10 border-b border-border">Cost</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {callsData.slice(0, 100).map((call) => (
                          <TableRow key={call.id}>
                            <TableCell className="font-mono text-xs">
                              <div className="flex items-center gap-2">
                                <span>{call.id.substring(0, 8)}...</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigator.clipboard.writeText(call.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={call.type === 'inbound' ? 'default' : 'secondary'}>
                                {call.type || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {call.assistantName || call.assistant?.name || 'N/A'}
                            </TableCell>
                            <TableCell className="text-sm">
                              {call.createdAt ? new Date(call.createdAt).toLocaleString() : 'N/A'}
                            </TableCell>
                            <TableCell>{call.duration ? `${Math.round(call.duration)}s` : 'N/A'}</TableCell>
                            <TableCell>${call.cost?.toFixed(4) || '0.00'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full rounded-none border-0 flex items-center justify-center">
                <CardContent className="text-center text-muted-foreground">
                  <Filter size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="font-semibold mb-2">No Data Loaded</p>
                  <p className="text-sm">Set filters on the left and click "Get Data" to load call records for analysis</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
  );
}