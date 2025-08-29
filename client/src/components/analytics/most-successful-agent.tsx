import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Crown, User, Info, TrendingUp } from "lucide-react";
import { DashboardData } from "@shared/schema";

interface MostSuccessfulAgentProps {
  data?: DashboardData;
  isLoading: boolean;
}

export default function MostSuccessfulAgent({ data, isLoading }: MostSuccessfulAgentProps) {
  const agent = data?.mostSuccessfulAgent;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="shadow-sm hover:shadow-md transition-shadow cursor-help">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Crown className="text-yellow-500" size={18} />
                <span>Most Successful Agent</span>
                <Info size={14} className="text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ) : agent ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <User className="text-muted-foreground" size={16} />
                    <span className="font-medium text-foreground" data-testid="agent-name">
                      {agent.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Success Rate:</span>
                    <div className="flex items-center space-x-1">
                      <Badge 
                        variant="default" 
                        className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        data-testid="agent-success-rate"
                      >
                        {agent.successRate.toFixed(1)}%
                      </Badge>
                      <TrendingUp className="text-green-500" size={12} />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Calls:</span>
                    <span className="text-sm font-medium" data-testid="agent-total-calls">
                      {agent.totalCalls.toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <User className="text-muted-foreground mx-auto mb-2" size={24} />
                  <p className="text-sm text-muted-foreground">No agent data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-4">
          <div className="space-y-2">
            <p className="font-medium text-foreground">Top Performer Analysis</p>
            {agent ? (
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Performance:</span> {agent.successRate > 90 ? "Exceptional" : agent.successRate > 80 ? "Outstanding" : "Good"}</p>
                <p><span className="font-medium">Experience:</span> {agent.totalCalls > 500 ? "Very Experienced" : agent.totalCalls > 100 ? "Experienced" : "New Agent"}</p>
                <p><span className="font-medium">Ranking:</span> #1 out of all active agents</p>
                <div className="pt-1 border-t text-xs text-muted-foreground">
                  🏆 This agent consistently delivers the best results
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data available for analysis</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}