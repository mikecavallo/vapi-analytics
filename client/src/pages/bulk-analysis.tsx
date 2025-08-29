import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
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
  Plus
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";

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
    },
  });

  const addFilter = () => {
    if (!newFilterValue) return;
    
    const newFilter: FilterCriteria = {
      id: Date.now().toString(),
      type: newFilterType,
      operator: newFilterOperator,
      value: newFilterValue,
      value2: newFilterOperator === 'between' ? newFilterValue2 : undefined,
      label: generateFilterLabel(newFilterType, newFilterOperator, newFilterValue, newFilterValue2),
    };
    
    setFilters(prev => [...prev, newFilter]);
    setNewFilterValue('');
    setNewFilterValue2('');
  };

  const removeFilter = (filterId: string) => {
    setFilters(prev => prev.filter(f => f.id !== filterId));
  };

  const handleAnalysis = () => {
    if (!analysisQuery.trim()) return;
    analysisMutation.mutate(analysisQuery);
  };

  const generateFilterLabel = (type: string, operator: string, value: string, value2?: string) => {
    const typeLabel = {
      duration: 'Duration',
      cost: 'Cost', 
      outcome: 'Outcome',
      timeRange: 'Date',
      assistantId: 'Assistant'
    }[type];

    const operatorLabel = {
      equals: '=',
      greater: '>',
      less: '<', 
      between: 'between',
      contains: 'contains'
    }[operator];

    if (operator === 'between' && value2) {
      return `${typeLabel} ${operatorLabel} ${value} and ${value2}`;
    }
    return `${typeLabel} ${operatorLabel} ${value}`;
  };

  const commonQuestions = [
    "What are the most common customer complaints in this dataset?",
    "How often do agents ask the same questions repeatedly?", 
    "What is the overall customer satisfaction based on conversation tone?",
    "Are there patterns in failed calls vs successful ones?",
    "What topics do customers bring up most frequently?",
    "How effective are agents at handling objections?",
    "Are there transcription quality issues or errors?",
    "What are the peak conversation flow bottlenecks?"
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      {/* Navigation */}
      <div className="flex items-center space-x-4 mb-4">
        <Link href="/dashboard" className="text-muted-foreground hover:text-primary text-sm font-medium">
          ← Back to Dashboard
        </Link>
      </div>
      
      {/* Header */}
      <div className="flex items-center space-x-3">
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

            {/* Query Input */}
            <div className="space-y-3">
              <div className="flex space-x-2">
                <Textarea
                  placeholder="Ask a question about your call transcripts... e.g. 'What are common customer complaints?' or 'How often do agents repeat questions?'"
                  value={analysisQuery}
                  onChange={(e) => setAnalysisQuery(e.target.value)}
                  className="flex-1 min-h-[60px]"
                  data-testid="textarea-analysis-query"
                />
                <Button
                  onClick={handleAnalysis}
                  disabled={!analysisQuery.trim() || analysisMutation.isPending || !filteredCalls?.length}
                  className="px-6"
                  data-testid="button-analyze"
                >
                  {analysisMutation.isPending ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Search size={16} />
                  )}
                </Button>
              </div>

              {/* Common Questions */}
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Common Analysis Questions:</Label>
                <div className="flex flex-wrap gap-2">
                  {commonQuestions.map((question, index) => (
                    <Button
                      key={index}
                      size="sm"
                      variant="outline"
                      onClick={() => setAnalysisQuery(question)}
                      className="text-xs"
                      data-testid={`button-common-${index}`}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Results Summary */}
      {filteredCalls && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp size={20} />
              <span>Dataset Overview</span>
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
  );
}