import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { DashboardData } from "@shared/schema";

interface CallOutcomesProps {
  data?: DashboardData;
  isLoading: boolean;
}

const COLORS = {
  chart1: "hsl(210, 100%, 50%)",
  chart2: "hsl(173, 58%, 39%)",
  chart3: "hsl(43, 74%, 66%)",
  chart4: "hsl(27, 87%, 67%)",
  chart5: "hsl(12, 76%, 61%)",
};

export default function CallOutcomes({ data, isLoading }: CallOutcomesProps) {
  // Group call outcomes under 5% into "Other" category
  const processCallOutcomes = (outcomes: any[]) => {
    if (!outcomes || outcomes.length === 0) return [];
    
    const significantOutcomes = outcomes.filter(outcome => outcome.percentage >= 5);
    const smallOutcomes = outcomes.filter(outcome => outcome.percentage < 5);
    
    if (smallOutcomes.length === 0) {
      return significantOutcomes;
    }
    
    // Create "Other" category from small outcomes
    const otherCategory = {
      outcome: "other",
      count: smallOutcomes.reduce((sum, outcome) => sum + outcome.count, 0),
      percentage: smallOutcomes.reduce((sum, outcome) => sum + outcome.percentage, 0),
    };
    
    return [...significantOutcomes, otherCategory];
  };

  const processedCallOutcomes = processCallOutcomes(data?.callOutcomes || []);

  function formatOutcomeName(outcome: string): string {
    return outcome
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Call Outcomes</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full mb-3" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="chart-call-outcomes">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Call Outcomes</CardTitle>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Last 30 days</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-48 w-full mb-3">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={processedCallOutcomes}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="count"
              >
                {processedCallOutcomes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.values(COLORS).length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {processedCallOutcomes.map((outcome, index) => (
            <div key={outcome.outcome} className="flex items-center" data-testid={`outcome-${outcome.outcome}`}>
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: Object.values(COLORS)[index % Object.values(COLORS).length] }}
              />
              <span className="text-xs text-foreground">
                {formatOutcomeName(outcome.outcome)}: {outcome.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}