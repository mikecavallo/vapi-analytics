import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Crown, User } from "lucide-react";
import { DashboardData } from "@shared/schema";

interface MostSuccessfulAgentProps {
  data?: DashboardData;
  isLoading: boolean;
}

export default function MostSuccessfulAgent({ data, isLoading }: MostSuccessfulAgentProps) {
  const agent = data?.mostSuccessfulAgent;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Crown className="text-yellow-500" size={18} />
          <span>Most Successful Agent</span>
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
              <Badge 
                variant="default" 
                className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                data-testid="agent-success-rate"
              >
                {agent.successRate.toFixed(1)}%
              </Badge>
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
  );
}