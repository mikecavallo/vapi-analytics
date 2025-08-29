import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip as RechartsTooltip } from "recharts";
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

  // Enhanced tooltip for volume trends
  const VolumeTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const date = new Date(label);
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-4 min-w-[250px]">
          <p className="font-medium text-foreground mb-2">{dayOfWeek}, {date.toLocaleDateString()}</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-400">📞 Total Calls:</span>
              <span className="font-medium">{data.calls}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Day Type:</span>
              <span className="font-medium">{isWeekend ? "Weekend" : "Weekday"}</span>
            </div>
            <div className="pt-2 border-t text-xs text-muted-foreground">
              {isWeekend ? "📉 Weekend volumes are typically 40-60% lower" : "📈 Weekday peak activity"}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Enhanced tooltip for pie chart
  const OutcomeTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = data?.count || 0;
      
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-4 min-w-[220px]">
          <p className="font-medium text-foreground mb-2">{data.outcome}</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Calls:</span>
              <span className="font-medium">{total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Percentage:</span>
              <span className="font-medium">{data.percentage.toFixed(1)}%</span>
            </div>
            <div className="pt-2 border-t text-xs text-muted-foreground">
              {data.outcome === 'customer-ended-call' ? '✅ Natural conversation completion' :
               data.outcome === 'assistant-ended-call' ? '🤖 Assistant completed objective' :
               data.outcome === 'pipeline-error-hangup' ? '⚠️ Technical issue - requires attention' :
               data.outcome === 'customer-hangup' ? '❌ Customer disconnected early' :
               '📊 Other call outcome'}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Enhanced tooltip for hourly patterns
  const HourlyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const hour = parseInt(label);
      const timeSlot = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : hour < 21 ? 'Evening' : 'Night';
      const businessHours = hour >= 9 && hour <= 17;
      
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-4 min-w-[200px]">
          <p className="font-medium text-foreground mb-2">{hour.toString().padStart(2, '0')}:00 - {timeSlot}</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-400">📞 Calls:</span>
              <span className="font-medium">{data.calls}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Period:</span>
              <span className="font-medium">{businessHours ? "Business Hours" : "Off Hours"}</span>
            </div>
            <div className="pt-2 border-t text-xs text-muted-foreground">
              {hour >= 9 && hour <= 11 ? '🌅 Morning peak - high customer engagement' :
               hour >= 12 && hour <= 14 ? '☀️ Lunch period - moderate activity' :
               hour >= 15 && hour <= 17 ? '🚀 Afternoon peak - highest activity' :
               hour >= 18 && hour <= 20 ? '🌆 Evening hours - declining activity' :
               '🌙 Off-hours - minimal activity expected'}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };
  
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Call Volume Trends */}
      <Card data-testid="chart-call-volume">
        <CardHeader>
          <CardTitle>Call Volume Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
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
                <RechartsTooltip content={<VolumeTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="calls" 
                  stroke={COLORS.chart1}
                  strokeWidth={2}
                  dot={{ fill: COLORS.chart1, strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, stroke: COLORS.chart1, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-2 mt-4">
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
                <RechartsTooltip content={<OutcomeTooltip />} />
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


      {/* Hourly Patterns */}
      <Card data-testid="chart-hourly-patterns">
        <CardHeader>
          <CardTitle>Hourly Call Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.hourlyPatterns || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214.3, 31.8%, 91.4%)" />
                <XAxis 
                  dataKey="hour" 
                  stroke="hsl(215.4, 16.3%, 46.9%)"
                  fontSize={12}
                  tickFormatter={(value) => `${value.toString().padStart(2, '0')}:00`}
                />
                <YAxis stroke="hsl(215.4, 16.3%, 46.9%)" fontSize={12} />
                <RechartsTooltip content={<HourlyTooltip />} />
                <Bar 
                  dataKey="calls" 
                  fill={COLORS.chart3}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
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
