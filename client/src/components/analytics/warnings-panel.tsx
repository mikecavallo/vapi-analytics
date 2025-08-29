import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, TrendingDown, TrendingUp, Clock, DollarSign, Users, Activity } from "lucide-react";
import { DashboardData } from "@shared/schema";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface WarningsPanelProps {
  data?: DashboardData;
  isLoading: boolean;
}

interface Warning {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  metric: string;
  value: string | number;
  trend: 'up' | 'down' | 'stable';
  icon: any;
}

export default function WarningsPanel({ data, isLoading }: WarningsPanelProps) {
  const generateWarnings = (): Warning[] => {
    if (!data) return [];

    const warnings: Warning[] = [];
    const { kpis, callOutcomes, assistantPerformance, costAnalysis, durationDistribution } = data;

    // 1. Success Rate Warnings
    if (kpis.successRate < 70) {
      warnings.push({
        id: 'low-success-rate',
        type: 'critical',
        title: 'Low Success Rate Detected',
        description: `Success rate has dropped to ${kpis.successRate.toFixed(1)}%. Consider reviewing assistant performance.`,
        metric: 'Success Rate',
        value: `${kpis.successRate.toFixed(1)}%`,
        trend: 'down',
        icon: TrendingDown,
      });
    } else if (kpis.successRate < 85) {
      warnings.push({
        id: 'moderate-success-rate',
        type: 'warning',
        title: 'Success Rate Below Target',
        description: `Success rate is ${kpis.successRate.toFixed(1)}%. Target is 85%+.`,
        metric: 'Success Rate',
        value: `${kpis.successRate.toFixed(1)}%`,
        trend: 'down',
        icon: TrendingDown,
      });
    }

    // 2. Cost Spike Warnings
    if (costAnalysis.avgCostPerCall > 2.0) {
      warnings.push({
        id: 'high-cost-per-call',
        type: 'warning',
        title: 'High Cost Per Call',
        description: `Average cost per call is $${costAnalysis.avgCostPerCall.toFixed(2)}. Review call duration and pricing.`,
        metric: 'Cost Per Call',
        value: `$${costAnalysis.avgCostPerCall.toFixed(2)}`,
        trend: 'up',
        icon: DollarSign,
      });
    }

    // 3. Duration Anomalies
    if (kpis.avgDuration < 30) {
      warnings.push({
        id: 'very-short-calls',
        type: 'warning',
        title: 'Very Short Call Duration',
        description: `Average call duration is only ${Math.round(kpis.avgDuration)}s. Users may be hanging up quickly.`,
        metric: 'Avg Duration',
        value: `${Math.round(kpis.avgDuration)}s`,
        trend: 'down',
        icon: Clock,
      });
    } else if (kpis.avgDuration > 600) {
      warnings.push({
        id: 'very-long-calls',
        type: 'info',
        title: 'Long Call Duration',
        description: `Average call duration is ${Math.floor(kpis.avgDuration / 60)}:${(kpis.avgDuration % 60).toString().padStart(2, '0')}. Monitor for efficiency.`,
        metric: 'Avg Duration',
        value: `${Math.floor(kpis.avgDuration / 60)}m`,
        trend: 'up',
        icon: Clock,
      });
    }

    // 4. High Error Rate Warnings
    const errorOutcomes = callOutcomes.filter(outcome => 
      ['pipeline-error', 'exceeded-max-duration', 'assistant-not-found'].includes(outcome.outcome)
    );
    const totalErrorRate = errorOutcomes.reduce((sum, outcome) => sum + outcome.percentage, 0);
    
    if (totalErrorRate > 15) {
      warnings.push({
        id: 'high-error-rate',
        type: 'critical',
        title: 'High Error Rate',
        description: `${totalErrorRate.toFixed(1)}% of calls are failing due to technical issues. Immediate attention required.`,
        metric: 'Error Rate',
        value: `${totalErrorRate.toFixed(1)}%`,
        trend: 'up',
        icon: AlertTriangle,
      });
    } else if (totalErrorRate > 5) {
      warnings.push({
        id: 'moderate-error-rate',
        type: 'warning',
        title: 'Elevated Error Rate',
        description: `${totalErrorRate.toFixed(1)}% of calls have technical errors. Monitor closely.`,
        metric: 'Error Rate',
        value: `${totalErrorRate.toFixed(1)}%`,
        trend: 'up',
        icon: AlertTriangle,
      });
    }

    // 5. Assistant Performance Issues
    const underperformingAssistants = assistantPerformance.filter(assistant => 
      assistant.successRate < 80 && assistant.calls > 10
    );
    
    if (underperformingAssistants.length > 0) {
      warnings.push({
        id: 'assistant-performance',
        type: 'warning',
        title: 'Assistant Performance Issues',
        description: `${underperformingAssistants.length} assistant(s) have success rates below 80%. Review training and setup.`,
        metric: 'Assistant Performance',
        value: `${underperformingAssistants.length} assistant(s)`,
        trend: 'down',
        icon: Users,
      });
    }

    // 6. Volume Spike Detection
    if (kpis.totalCalls > 1000) {
      warnings.push({
        id: 'high-volume',
        type: 'info',
        title: 'High Call Volume',
        description: `Processing ${kpis.totalCalls} calls. Monitor for capacity and quality impacts.`,
        metric: 'Total Calls',
        value: kpis.totalCalls.toLocaleString(),
        trend: 'up',
        icon: Activity,
      });
    }

    // 7. Quick Hangup Pattern
    const shortCallOutcome = durationDistribution.find(dist => dist.range === "0-30s");
    if (shortCallOutcome && shortCallOutcome.count > kpis.totalCalls * 0.3) {
      warnings.push({
        id: 'quick-hangups',
        type: 'warning',
        title: 'High Quick Hangup Rate',
        description: `${((shortCallOutcome.count / kpis.totalCalls) * 100).toFixed(1)}% of calls end within 30 seconds. Check greeting and initial experience.`,
        metric: 'Quick Hangups',
        value: `${((shortCallOutcome.count / kpis.totalCalls) * 100).toFixed(1)}%`,
        trend: 'up',
        icon: Clock,
      });
    }

    return warnings.sort((a, b) => {
      const order = { critical: 0, warning: 1, info: 2 };
      return order[a.type] - order[b.type];
    });
  };

  const warnings = generateWarnings();

  const getWarningColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-muted border-border';
    }
  };

  const getWarningBadgeColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'warning':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400';
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <Card data-testid="panel-warnings">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="p-4 rounded-lg border">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="panel-warnings">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="text-amber-500" size={20} />
          <span>System Alerts & Warnings</span>
          {warnings.length > 0 && (
            <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
              {warnings.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {warnings.length === 0 ? (
          <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
            <Activity className="text-green-600" size={16} />
            <AlertDescription className="text-green-800 dark:text-green-400">
              All systems operating normally. No alerts detected.
            </AlertDescription>
          </Alert>
        ) : (
          <TooltipProvider>
            <div className="space-y-3">
              {warnings.map((warning) => {
                const IconComponent = warning.icon;
                return (
                  <Tooltip key={warning.id}>
                    <TooltipTrigger asChild>
                      <Alert className={`${getWarningColor(warning.type)} cursor-help hover:shadow-sm transition-shadow`} data-testid={`warning-${warning.id}`}>
                        <div className="flex items-start space-x-3">
                          <IconComponent className="mt-0.5 text-current" size={16} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-sm flex items-center space-x-1">
                                <span>{warning.title}</span>
                                <Info size={12} className="text-muted-foreground" />
                              </h4>
                              <div className="flex items-center space-x-2">
                                <Badge className={`text-xs ${getWarningBadgeColor(warning.type)} border-0`}>
                                  {warning.type.toUpperCase()}
                                </Badge>
                                <span className="text-xs font-mono">{warning.value}</span>
                              </div>
                            </div>
                            <AlertDescription className="text-xs leading-relaxed">
                              {warning.description}
                            </AlertDescription>
                          </div>
                        </div>
                      </Alert>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm p-4">
                      <div className="space-y-2">
                        <p className="font-medium text-foreground">Detailed Analysis</p>
                        <div className="space-y-1 text-sm">
                          {warning.type === 'critical' ? (
                            <>
                              <p><span className="font-medium text-destructive">Impact:</span> High - Immediate attention required</p>
                              <p><span className="font-medium">Action:</span> Review assistant configuration and call flows</p>
                              <p><span className="font-medium">Timeline:</span> Address within 24 hours</p>
                            </>
                          ) : warning.type === 'warning' ? (
                            <>
                              <p><span className="font-medium text-orange-500">Impact:</span> Medium - Should be addressed soon</p>
                              <p><span className="font-medium">Action:</span> Monitor trends and optimize if needed</p>
                              <p><span className="font-medium">Timeline:</span> Address within 1-3 days</p>
                            </>
                          ) : (
                            <>
                              <p><span className="font-medium text-blue-500">Impact:</span> Low - For awareness</p>
                              <p><span className="font-medium">Action:</span> Monitor for patterns</p>
                              <p><span className="font-medium">Timeline:</span> No immediate action required</p>
                            </>
                          )}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
}