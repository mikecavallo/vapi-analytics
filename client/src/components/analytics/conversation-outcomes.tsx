import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Download, TrendingUp, TrendingDown, Star, Clock, Users } from "lucide-react";

interface ConversationOutcomesProps {
  data: {
    summary: {
      totalConversations: number;
      successRate: number;
      avgDuration: string;
      avgSatisfaction: number;
    };
    outcomes: Array<{
      outcome: string;
      volume: number;
      percentage: number;
      avgDuration: string;
      satisfaction: number;
      trend: number;
    }>;
  };
  isLoading: boolean;
}

export default function ConversationOutcomes({ data, isLoading }: ConversationOutcomesProps) {
  const [selectedOutcome, setSelectedOutcome] = useState("all");

  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatOutcomeName = (outcome: string) => {
    return outcome
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getOutcomeColor = (outcome: string) => {
    const successOutcomes = ['successful-resolution', 'faq-completion'];
    const transferOutcomes = ['transfer-to-agent'];
    const errorOutcomes = ['user-hangup', 'system-error'];
    
    if (successOutcomes.some(s => outcome.includes(s))) return "text-chart-2";
    if (transferOutcomes.some(s => outcome.includes(s))) return "text-chart-3";
    if (errorOutcomes.some(s => outcome.includes(s))) return "text-destructive";
    return "text-muted-foreground";
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="text-chart-2" size={14} />;
    if (trend < 0) return <TrendingDown className="text-destructive" size={14} />;
    return <div className="w-4 h-4" />;
  };

  const getSatisfactionStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={12}
        className={i < Math.round(rating) ? "text-yellow-500 fill-current" : "text-gray-300"}
      />
    ));
  };

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold">Conversation Outcomes</CardTitle>
          <p className="text-sm text-muted-foreground">Detailed outcome classification and performance metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedOutcome} onValueChange={setSelectedOutcome}>
            <SelectTrigger className="w-40" data-testid="select-outcomes">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Outcomes</SelectItem>
              <SelectItem value="success">Success Only</SelectItem>
              <SelectItem value="failed">Failed Only</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" data-testid="button-export-outcomes">
            <Download size={14} className="mr-1" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-center mb-2">
                <Users className="text-chart-1 mr-1" size={18} />
              </div>
              <p className="text-2xl font-bold mb-1" data-testid="stat-total-conversations">
                {data.summary.totalConversations.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Total Conversations</p>
            </div>
            
            <div className="text-center p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="text-chart-2 mr-1" size={18} />
              </div>
              <p className="text-2xl font-bold mb-1 text-chart-2" data-testid="stat-success-rate">
                {data.summary.successRate}%
              </p>
              <p className="text-xs text-muted-foreground">Success Rate</p>
            </div>
            
            <div className="text-center p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-center mb-2">
                <Clock className="text-chart-3 mr-1" size={18} />
              </div>
              <p className="text-2xl font-bold mb-1 text-chart-3" data-testid="stat-avg-duration">
                {data.summary.avgDuration}
              </p>
              <p className="text-xs text-muted-foreground">Avg Duration</p>
            </div>
            
            <div className="text-center p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-center mb-2">
                <Star className="text-chart-4 mr-1 fill-current" size={18} />
              </div>
              <p className="text-2xl font-bold mb-1 text-chart-4" data-testid="stat-avg-satisfaction">
                {data.summary.avgSatisfaction}
              </p>
              <p className="text-xs text-muted-foreground">Avg Satisfaction</p>
            </div>
          </div>

          {/* Outcomes Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Outcome</TableHead>
                  <TableHead className="text-center">Volume</TableHead>
                  <TableHead className="text-center">Percentage</TableHead>
                  <TableHead className="text-center">Avg Duration</TableHead>
                  <TableHead className="text-center">Satisfaction</TableHead>
                  <TableHead className="text-center">Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.outcomes.map((outcome, index) => {
                  if (selectedOutcome === 'success' && outcome.percentage < 50) return null;
                  if (selectedOutcome === 'failed' && outcome.percentage >= 50) return null;
                  
                  return (
                    <TableRow key={index} data-testid={`row-outcome-${index}`}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${getOutcomeColor(outcome.outcome).replace('text-', 'bg-')}`}></div>
                          <span className="font-medium">
                            {formatOutcomeName(outcome.outcome)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-mono text-sm">{outcome.volume.toLocaleString()}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-12 bg-muted rounded-full h-2">
                            <div 
                              className="h-2 bg-chart-1 rounded-full transition-all"
                              style={{ width: `${outcome.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{outcome.percentage}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="font-mono text-xs">
                          {outcome.avgDuration}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center space-x-1">
                          {getSatisfactionStars(outcome.satisfaction)}
                          <span className="text-xs text-muted-foreground ml-1">
                            {outcome.satisfaction.toFixed(1)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center space-x-1">
                          {getTrendIcon(outcome.trend)}
                          <span className={`text-xs font-medium ${outcome.trend > 0 ? 'text-chart-2' : outcome.trend < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                            {outcome.trend > 0 ? '+' : ''}{outcome.trend.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Bottom Summary */}
          <div className="text-center text-sm text-muted-foreground">
            Showing {data.outcomes.filter(o => {
              if (selectedOutcome === 'success') return o.percentage >= 50;
              if (selectedOutcome === 'failed') return o.percentage < 50;
              return true;
            }).length} of {data.outcomes.length} outcomes
          </div>
        </div>
      </CardContent>
    </Card>
  );
}