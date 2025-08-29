import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { DashboardData } from "@shared/schema";

interface ChartsSectionProps {
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

export default function ChartsSection({ data, isLoading }: ChartsSectionProps) {
  const [volumeTimeRange, setVolumeTimeRange] = useState("daily");
  
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
  
  // Filter call volume data based on selected time range
  const getFilteredVolumeData = () => {
    const volumeData = data?.callVolumeTrends || [];
    const now = new Date();
    
    switch (volumeTimeRange) {
      case "daily":
        // Show last 7 days
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return volumeData.filter(item => new Date(item.date) >= sevenDaysAgo);
      case "weekly":
        // Show last 4 weeks
        const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
        return volumeData.filter(item => new Date(item.date) >= fourWeeksAgo);
      case "monthly":
        // Show last 6 months
        const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        return volumeData.filter(item => new Date(item.date) >= sixMonthsAgo);
      default:
        return volumeData;
    }
  };

  const filteredVolumeData = getFilteredVolumeData();
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Call Volume Trends */}
      <Card data-testid="chart-call-volume">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Call Volume Trends</CardTitle>
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                variant={volumeTimeRange === "daily" ? "default" : "ghost"}
                onClick={() => setVolumeTimeRange("daily")}
                data-testid="button-daily"
              >
                Daily
              </Button>
              <Button 
                size="sm" 
                variant={volumeTimeRange === "weekly" ? "default" : "ghost"}
                onClick={() => setVolumeTimeRange("weekly")}
                data-testid="button-weekly"
              >
                Weekly
              </Button>
              <Button 
                size="sm" 
                variant={volumeTimeRange === "monthly" ? "default" : "ghost"}
                onClick={() => setVolumeTimeRange("monthly")}
                data-testid="button-monthly"
              >
                Monthly
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredVolumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214.3, 31.8%, 91.4%)" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(215.4, 16.3%, 46.9%)"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="hsl(215.4, 16.3%, 46.9%)" fontSize={12} />
                <Line 
                  type="monotone" 
                  dataKey="calls" 
                  stroke={COLORS.chart1}
                  strokeWidth={3}
                  dot={{ fill: COLORS.chart1, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: COLORS.chart1, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Call Outcomes */}
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
          <div className="h-64 w-full mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={processedCallOutcomes}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
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
          <div className="grid grid-cols-2 gap-4">
            {processedCallOutcomes.map((outcome, index) => (
              <div key={outcome.outcome} className="flex items-center" data-testid={`outcome-${outcome.outcome}`}>
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: Object.values(COLORS)[index % Object.values(COLORS).length] }}
                />
                <span className="text-sm text-foreground">
                  {formatOutcomeName(outcome.outcome)}: {outcome.percentage.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>


      {/* Hourly Patterns */}
      <Card data-testid="chart-hourly-patterns">
        <CardHeader>
          <CardTitle>Hourly Call Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.hourlyPatterns || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214.3, 31.8%, 91.4%)" />
                <XAxis 
                  dataKey="hour" 
                  stroke="hsl(215.4, 16.3%, 46.9%)"
                  fontSize={12}
                  tickFormatter={(value) => `${value.toString().padStart(2, '0')}:00`}
                />
                <YAxis stroke="hsl(215.4, 16.3%, 46.9%)" fontSize={12} />
                <Line 
                  type="monotone" 
                  dataKey="calls" 
                  stroke={COLORS.chart2}
                  strokeWidth={3}
                  dot={{ fill: COLORS.chart2, strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function formatOutcomeName(outcome: string): string {
  return outcome
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
