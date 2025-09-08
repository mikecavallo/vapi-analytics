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
  Calendar as CalendarIcon,
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
  type: 'callId' | 'assistantId' | 'phoneNumberId' | 'createdAtRange';
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
  
  // API-supported filter states
  const [callIdFilter, setCallIdFilter] = useState<string>('');
  const [assistantIdFilter, setAssistantIdFilter] = useState<string>('');
  const [phoneNumberIdFilter, setPhoneNumberIdFilter] = useState<string>('');
  const [selectedDateRange, setSelectedDateRange] = useState<{from?: Date; to?: Date}>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [callsData, setCallsData] = useState<any[]>([]);

  // Function to fetch data with applied filters
  const fetchDataWithFilters = async () => {
    setIsLoadingData(true);
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters based on user selections
      if (callIdFilter.trim()) {
        queryParams.append('id', callIdFilter.trim());
      }
      if (assistantIdFilter.trim()) {
        queryParams.append('assistantId', assistantIdFilter.trim());
      }
      if (phoneNumberIdFilter.trim()) {
        queryParams.append('phoneNumberId', phoneNumberIdFilter.trim());
      }
      if (selectedDateRange.from) {
        queryParams.append('createdAtGe', selectedDateRange.from.toISOString());
      }
      if (selectedDateRange.to) {
        queryParams.append('createdAtLe', selectedDateRange.to.toISOString());
      }
      
      // Always set a reasonable limit
      queryParams.append('limit', '1000');
      
      const response = await fetch(`/api/bulk-analysis/calls?${queryParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch calls');
      }
      
      const data = await response.json();
      setCallsData(data);
      
      toast({
        title: "Data loaded successfully",
        description: `Found ${data.length} calls matching your filters`,
      });
    } catch (error: any) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      });
      setCallsData([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setCallIdFilter('');
    setAssistantIdFilter('');
    setPhoneNumberIdFilter('');
    setSelectedDateRange({});
    setCallsData([]);
  };

  // Add filter to list
  const addFilter = (type: FilterCriteria['type'], value: string, value2?: string) => {
    const label = getFilterLabel(type, value, value2);
    const newFilter: FilterCriteria = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      value,
      value2,
      label
    };
    setFilters([...filters, newFilter]);
  };

  // Remove filter from list
  const removeFilter = (filterId: string) => {
    setFilters(filters.filter(f => f.id !== filterId));
  };

  // Get filter label for display
  const getFilterLabel = (type: FilterCriteria['type'], value: string, value2?: string): string => {
    switch (type) {
      case 'callId':
        return `Call ID: ${value}`;
      case 'assistantId':
        return `Assistant ID: ${value}`;
      case 'phoneNumberId':
        return `Phone Number ID: ${value}`;
      case 'createdAtRange':
        return `Created: ${value}${value2 ? ` to ${value2}` : ''}`;
      default:
        return `${type}: ${value}`;
    }
  };

  // Analysis mutations
  const performAnalysisMutation = useMutation({
    mutationFn: async ({ callIds, analysisType }: { callIds: string[], analysisType: string }) => {
      const response = await fetch('/api/bulk-analysis/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callIds, analysisType })
      });
      
      if (!response.ok) {
        throw new Error('Analysis failed');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      const newMessage: AnalysisMessage = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: data.analysis,
        timestamp: new Date(),
        analysisType: variables.analysisType
      };
      setConversationHistory(prev => [...prev, newMessage]);
    }
  });

  const optimizePromptMutation = useMutation({
    mutationFn: async ({ assistantId, currentPrompt, transcriptIds }: { assistantId: string, currentPrompt: string, transcriptIds: string[] }) => {
      const response = await fetch('/api/bulk-analysis/optimize-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assistantId, currentPrompt, transcriptIds })
      });
      
      if (!response.ok) {
        throw new Error('Prompt optimization failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setOptimizationResults(data);
    }
  });

  const analyzeConversationFlowMutation = useMutation({
    mutationFn: async ({ callIds }: { callIds: string[] }) => {
      const response = await fetch('/api/bulk-analysis/conversation-flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callIds })
      });
      
      if (!response.ok) {
        throw new Error('Conversation flow analysis failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setFlowAnalysisResults(data);
    }
  });

  // Check if any filters are set
  const hasFilters = callIdFilter || assistantIdFilter || phoneNumberIdFilter || (selectedDateRange.from && selectedDateRange.to);

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
                <Link href="/settings" className="text-muted-foreground hover:text-foreground pb-4 px-1 text-sm font-medium transition-colors">
                  Settings
                </Link>
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

      {/* Filter Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Data Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Call ID Filter */}
            <div className="space-y-2">
              <Label htmlFor="call-id-filter">Call ID</Label>
              <Input
                id="call-id-filter"
                placeholder="Enter specific call ID"
                value={callIdFilter}
                onChange={(e) => setCallIdFilter(e.target.value)}
                data-testid="input-call-id"
              />
            </div>

            {/* Assistant ID Filter */}
            <div className="space-y-2">
              <Label htmlFor="assistant-id-filter">Assistant ID</Label>
              <Input
                id="assistant-id-filter"
                placeholder="Enter assistant ID"
                value={assistantIdFilter}
                onChange={(e) => setAssistantIdFilter(e.target.value)}
                data-testid="input-assistant-id"
              />
            </div>

            {/* Phone Number ID Filter */}
            <div className="space-y-2">
              <Label htmlFor="phone-number-id-filter">Phone Number ID</Label>
              <Input
                id="phone-number-id-filter"
                placeholder="Enter phone number ID"
                value={phoneNumberIdFilter}
                onChange={(e) => setPhoneNumberIdFilter(e.target.value)}
                data-testid="input-phone-number-id"
              />
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <Label>Created Date Range</Label>
              <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    data-testid="button-date-picker"
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {selectedDateRange.from ? (
                      selectedDateRange.to ? (
                        <>
                          {selectedDateRange.from.toLocaleDateString()} -{" "}
                          {selectedDateRange.to.toLocaleDateString()}
                        </>
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
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={fetchDataWithFilters}
              disabled={!hasFilters || isLoadingData}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
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
              data-testid="button-clear-filters"
            >
              <X className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          </div>

          {/* Show filter requirements */}
          {!hasFilters && (
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                Please set at least one filter above, then click "Get Data" to load call records for analysis.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {callsData.length > 0 ? (
        <div className="space-y-6">
          {/* Dataset Preview - Full Width First */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Dataset Preview ({callsData.length} calls)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted">
                      <TableHead className="text-foreground font-medium sticky top-0 bg-muted z-10 border-b border-border">Call ID</TableHead>
                      <TableHead className="text-foreground font-medium sticky top-0 bg-muted z-10 border-b border-border">Type</TableHead>
                      <TableHead className="text-foreground font-medium sticky top-0 bg-muted z-10 border-b border-border">
                        <div className="flex items-center space-x-1">
                          <span>Assistant</span>
                          <Phone size={12} />
                        </div>
                      </TableHead>
                      <TableHead className="text-foreground font-medium sticky top-0 bg-muted z-10 border-b border-border">
                        <div className="flex items-center space-x-1">
                          <span>Customer</span>
                          <Phone size={12} />
                        </div>
                      </TableHead>
                      <TableHead className="text-foreground font-medium sticky top-0 bg-muted z-10 border-b border-border">Assistant Name</TableHead>
                      <TableHead className="text-foreground font-medium sticky top-0 bg-muted z-10 border-b border-border">Date & Time</TableHead>
                      <TableHead className="text-foreground font-medium sticky top-0 bg-muted z-10 border-b border-border">Duration</TableHead>
                      <TableHead className="text-foreground font-medium sticky top-0 bg-muted z-10 border-b border-border">Cost</TableHead>
                      <TableHead className="text-foreground font-medium sticky top-0 bg-muted z-10 border-b border-border">Success Evaluation</TableHead>
                      <TableHead className="text-foreground font-medium sticky top-0 bg-muted z-10 border-b border-border">Details</TableHead>
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
                        <TableCell className="font-mono text-xs">
                          {call.assistantPhoneNumber || call.phoneNumber || 'N/A'}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {call.customerPhoneNumber || call.customer?.number || 'N/A'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {call.assistantName || call.assistant?.name || 'N/A'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {call.createdAt ? new Date(call.createdAt).toLocaleString() : 'N/A'}
                        </TableCell>
                        <TableCell>{call.duration ? `${Math.round(call.duration)}s` : 'N/A'}</TableCell>
                        <TableCell>${call.cost?.toFixed(4) || '0.00'}</TableCell>
                        <TableCell>
                          <Badge variant={call.status === 'ended' ? 'default' : 'secondary'}>
                            {call.analysis?.successEvaluation || call.status || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* AI Analysis Panel - Full Width Below Dataset */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Conversation History - Above Input */}
                <ScrollArea className="h-64 border rounded-lg p-3">
                  {conversationHistory.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>AI analysis results will appear here</p>
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
                    </div>
                  )}
                </ScrollArea>

                {/* Input Box - Below Conversation */}
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Ask AI to analyze your call data (e.g., 'Analyze sentiment patterns', 'Find common failure points', 'Suggest improvements')"
                    value={analysisQuery}
                    onChange={(e) => setAnalysisQuery(e.target.value)}
                    className="min-h-20 flex-1"
                    data-testid="textarea-analysis-query"
                  />
                  <Button
                    onClick={() => {
                      if (analysisQuery.trim() && callsData.length > 0) {
                        const selectedCalls = callsData.slice(0, 20).map(call => call.id);
                        performAnalysisMutation.mutate({
                          callIds: selectedCalls,
                          analysisType: analysisQuery
                        });
                        
                        const userMessage: AnalysisMessage = {
                          id: Math.random().toString(36).substr(2, 9),
                          role: 'user',
                          content: analysisQuery,
                          timestamp: new Date()
                        };
                        setConversationHistory(prev => [...prev, userMessage]);
                        setAnalysisQuery('');
                      }
                    }}
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
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <div className="text-center">
                <Filter size={48} className="mx-auto mb-4 opacity-50" />
                <p className="font-semibold mb-2">No Data Loaded</p>
                <p className="text-sm">Set filters above and click "Get Data" to load call records for analysis</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      </main>
    </div>
  );
}