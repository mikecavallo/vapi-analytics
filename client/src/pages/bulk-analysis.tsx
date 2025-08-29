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
  Download
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/theme-context";

interface FilterCriteria {
  id: string;
  type: 'duration' | 'cost' | 'outcome' | 'timeRange' | 'assistantId';
  operator: 'equals' | 'greater' | 'less' | 'between' | 'contains';
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
  const [newFilterType, setNewFilterType] = useState<FilterCriteria['type']>('duration');
  const [newFilterOperator, setNewFilterOperator] = useState<FilterCriteria['operator']>('greater');
  const [newFilterValue, setNewFilterValue] = useState('');
  const [newFilterValue2, setNewFilterValue2] = useState('');
  
  const [analysisQuery, setAnalysisQuery] = useState('');
  const [conversationHistory, setConversationHistory] = useState<AnalysisMessage[]>([]);

  // Fetch filtered calls based on current filters
  const { data: filteredCalls, isLoading: isLoadingCalls } = useQuery<any[]>({
    queryKey: ['/api/bulk-analysis/calls', filters],
    enabled: true,
  });

  // AI Analysis mutation
  const analysisMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await fetch('/api/bulk-analysis/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          filters,
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

  const addFilter = () => {
    if (!newFilterValue) return;

    const filterId = Date.now().toString();
    
    let label = '';
    switch (newFilterType) {
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

  const removeFilter = (filterId: string) => {
    setFilters(prev => prev.filter(f => f.id !== filterId));
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
              {/* Add New Filter */}
              <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
                <Label className="text-sm font-medium">Add Filter</Label>
                
                <Select value={newFilterType} onValueChange={(value: any) => setNewFilterType(value)}>
                  <SelectTrigger data-testid="select-filter-type">
                    <SelectValue placeholder="Filter type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="duration">Call Duration</SelectItem>
                    <SelectItem value="cost">Call Cost</SelectItem>
                    <SelectItem value="outcome">Call Outcome</SelectItem>
                    <SelectItem value="timeRange">Date Range</SelectItem>
                    <SelectItem value="assistantId">Assistant</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={newFilterOperator} onValueChange={(value: any) => setNewFilterOperator(value)}>
                  <SelectTrigger data-testid="select-filter-operator">
                    <SelectValue placeholder="Operator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="greater">Greater than</SelectItem>
                    <SelectItem value="less">Less than</SelectItem>
                    <SelectItem value="between">Between</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex space-x-2">
                  <Input
                    placeholder="Value"
                    value={newFilterValue}
                    onChange={(e) => setNewFilterValue(e.target.value)}
                    data-testid="input-filter-value"
                  />
                  {newFilterOperator === 'between' && (
                    <Input
                      placeholder="To"
                      value={newFilterValue2}
                      onChange={(e) => setNewFilterValue2(e.target.value)}
                      data-testid="input-filter-value2"
                    />
                  )}
                </div>

                <Button 
                  onClick={addFilter} 
                  size="sm" 
                  className="w-full"
                  disabled={!newFilterValue}
                  data-testid="button-add-filter"
                >
                  <Plus size={16} className="mr-1" />
                  Add Filter
                </Button>
              </div>

              {/* Active Filters */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Active Filters ({filters.length})</Label>
                {filters.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No filters applied - analyzing all calls</p>
                ) : (
                  <div className="space-y-2">
                    {filters.map((filter) => (
                      <div key={filter.id} className="flex items-center justify-between p-2 bg-background rounded border">
                        <span className="text-sm">{filter.label}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFilter(filter.id)}
                          data-testid={`button-remove-filter-${filter.id}`}
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

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
      </main>
    </div>
  );
}