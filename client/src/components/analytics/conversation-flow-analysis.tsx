import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter, Download, TrendingUp, TrendingDown } from "lucide-react";

interface ConversationFlowProps {
  data: {
    stages: Array<{
      name: string;
      performance: number;
      avgDuration: string;
      dropRate: number;
    }>;
    successPaths: Array<{
      name: string;
      percentage: number;
    }>;
    dropOffPoints: Array<{
      name: string;
      percentage: number;
    }>;
  };
  isLoading: boolean;
}

export default function ConversationFlowAnalysis({ data, isLoading }: ConversationFlowProps) {
  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Skeleton className="h-64 w-full" />
            </div>
            <div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return "text-chart-2";
    if (percentage >= 70) return "text-chart-3";
    return "text-chart-1";
  };

  const getDropRateColor = (rate: number) => {
    if (rate <= 5) return "bg-chart-2/20 text-chart-2";
    if (rate <= 15) return "bg-chart-3/20 text-chart-3";
    return "bg-destructive/20 text-destructive";
  };

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold">Conversation Flow Analysis</CardTitle>
          <p className="text-sm text-muted-foreground">User journey paths and decision points</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" data-testid="button-filter-flow">
            <Filter size={14} className="mr-1" />
            Filter
          </Button>
          <Button variant="outline" size="sm" data-testid="button-export-flow">
            <Download size={14} className="mr-1" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sankey Flow Diagram */}
          <div className="lg:col-span-2">
            <div className="border rounded-lg p-6 h-64 bg-gradient-to-r from-muted/50 to-muted/30 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Simple Flow Visualization */}
                <div className="flex items-center space-x-8">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-chart-2/20 flex items-center justify-center">
                      <span className="text-chart-2 font-bold">95%</span>
                    </div>
                    <span className="text-xs mt-2">Call Start</span>
                  </div>
                  <div className="w-8 h-1 bg-chart-2/50 rounded"></div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-chart-2/20 flex items-center justify-center">
                      <span className="text-chart-2 font-bold">97%</span>
                    </div>
                    <span className="text-xs mt-2">Greeting</span>
                  </div>
                  <div className="w-8 h-1 bg-chart-2/50 rounded"></div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-chart-3/20 flex items-center justify-center">
                      <span className="text-chart-3 font-bold">92%</span>
                    </div>
                    <span className="text-xs mt-2">Intent Recognition</span>
                  </div>
                  <div className="w-8 h-1 bg-chart-3/50 rounded"></div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-chart-4/20 flex items-center justify-center">
                      <span className="text-chart-4 font-bold">75%</span>
                    </div>
                    <span className="text-xs mt-2">Resolution</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Success Paths and Drop-off Points */}
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="font-medium mb-3 text-chart-2">Success Paths</h4>
                <div className="space-y-2">
                  {data.successPaths.map((path, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded bg-chart-2/10">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-chart-2"></div>
                        <span className="text-sm">{path.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-chart-2 bg-chart-2/20">
                        {path.percentage}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3 text-chart-1">Drop-off Points</h4>
                <div className="space-y-2">
                  {data.dropOffPoints.map((point, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded bg-chart-1/10">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-chart-1"></div>
                        <span className="text-sm">{point.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-chart-1 bg-chart-1/20">
                        {point.percentage}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stage Performance */}
          <div>
            <h4 className="font-medium mb-4">Stage Performance</h4>
            <div className="space-y-4">
              {data.stages.map((stage, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{stage.name}</span>
                    <span className={`text-sm font-medium ${getPerformanceColor(stage.performance)}`}>
                      {stage.performance}%
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Avg Duration:</span>
                      <span>{stage.avgDuration}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span>Drop Rate:</span>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getDropRateColor(stage.dropRate)}`}
                      >
                        {stage.dropRate}%
                      </Badge>
                    </div>
                  </div>
                  
                  <Progress 
                    value={stage.performance} 
                    className="h-2"
                    data-testid={`progress-stage-${index}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}