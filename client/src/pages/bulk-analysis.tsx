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
  Phone
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
  const assistants = [...new Set(allCalls?.map(call => {
    if (call.assistantName && call.assistantName.trim()) {
      return call.assistantName;
    }
    return call.assistantId;
  }).filter(Boolean))] || [];
  const endedReasons = [...new Set(allCalls?.map(call => call.endedReason).filter(Boolean))] || [];
  
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
    if (selectedCallType) count++;
    if (selectedAssistant) count++;
    if (assistantPhoneFilter) count++;
    if (customerPhoneFilter) count++;
    if (callIdFilter) count++;
    if (selectedSuccessEvaluation) count++;
    if (selectedEndedReason) count++;
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
  
  // Legacy function kept for compatibility
  const oldAddFilter = () => {
    return;
    
    let label = '';
    switch ('duration') {
      case 'duration':
        label = `Duration ${newFilterOperator} ${newFilterValue}${newFilterValue2 && newFilterOperator === 'between' ? ` and ${newFilterValue2}` : ''} seconds`;
        break;
      case 'cost':
        label = `Cost ${newFilterOperator} $${newFilterValue}${newFilterValue2 && newFilterOperator === 'between' ? ` and $${newFilterValue2}` : ''}`;
        break;
      case 'outcome':
        label = `Outcome ${newFilterOperator} "${newFilterValue}"`;
        break;
      case 'timeRange':
        label = `Date ${newFilterOperator} ${newFilterValue}${newFilterValue2 && newFilterOperator === 'between' ? ` and ${newFilterValue2}` : ''}`;
        break;
      case 'assistantId':
        label = `Assistant ${newFilterOperator} "${newFilterValue}"`;
        break;
    }

    const newFilter: FilterCriteria = {
      id: filterId,
      type: newFilterType,
      operator: newFilterOperator,
      value: newFilterValue,
      value2: newFilterValue2 || undefined,
      label,
    };

    setFilters(prev => [...prev, newFilter]);
    setNewFilterValue('');
    setNewFilterValue2('');
    
    // Invalidate queries to refetch with new filters
    queryClient.invalidateQueries({ queryKey: ['/api/bulk-analysis/calls'] });
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
                  <span>Bulk Analysis</span>
                </Link>
                <a href="#" className="text-muted-foreground hover:text-foreground pb-4 px-1 text-sm font-medium transition-colors">
                  Reports
                </a>
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
        <div className="flex items-center space-x-3 mb-8">
          <Brain className="text-primary" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Bulk Analysis</h1>
            <p className="text-muted-foreground">Talk to your call transcript data with AI-powered insights</p>
          </div>
        </div>

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
        </div>

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

        {/* Filtered Dataset Preview */}
        {filteredCalls && filteredCalls.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye size={20} />
                <span>Filtered Dataset Preview</span>
                <Badge variant="outline" className="ml-2">
                  {filteredCalls.length} calls
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Preview of filtered calls that will be used for AI analysis
              </p>
            </CardHeader>
            <CardContent>
              <div className="max-h-64 overflow-auto border rounded-lg">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead className="w-24">Call ID</TableHead>
                      <TableHead className="w-20">Type</TableHead>
                      <TableHead className="w-24">Duration</TableHead>
                      <TableHead className="w-20">Cost</TableHead>
                      <TableHead className="w-32">Date</TableHead>
                      <TableHead className="w-24">Success</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCalls.slice(0, 50).map((call: any) => (
                      <TableRow key={call.id} className="text-xs">
                        <TableCell className="font-mono">
                          {call.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <Badge variant={call.type === 'inbound' ? 'default' : 'secondary'} className="text-xs px-1 py-0">
                            {call.type === 'inbound' ? 'In' : 'Out'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {Math.floor(call.duration / 60)}:{(call.duration % 60).toString().padStart(2, '0')}
                        </TableCell>
                        <TableCell>
                          ${call.cost?.toFixed(2) || '0.00'}
                        </TableCell>
                        <TableCell>
                          {new Date(call.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={call.successEvaluation === 'true' ? 'default' : 'destructive'} 
                            className="text-xs px-1 py-0"
                          >
                            {call.successEvaluation === 'true' ? 'Pass' : 'Fail'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredCalls.length > 50 && (
                  <div className="text-center py-2 text-xs text-muted-foreground border-t">
                    Showing first 50 of {filteredCalls.length} filtered calls
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}