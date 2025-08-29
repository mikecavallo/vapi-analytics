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
              <Button size="sm" className="bg-primary text-primary-foreground" data-testid="button-daily">
                Daily
              </Button>
              <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground" data-testid="button-weekly">
                Weekly
              </Button>
              <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground" data-testid="button-monthly">
                Monthly
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.callVolumeTrends || []}>
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
                  data={data?.callOutcomes || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {(data?.callOutcomes || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.values(COLORS).length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {(data?.callOutcomes || []).map((outcome, index) => (
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

      {/* Duration Distribution */}
      <Card data-testid="chart-duration-distribution">
        <CardHeader>
          <CardTitle>Call Duration Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.durationDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214.3, 31.8%, 91.4%)" />
                <XAxis dataKey="range" stroke="hsl(215.4, 16.3%, 46.9%)" fontSize={12} />
                <YAxis stroke="hsl(215.4, 16.3%, 46.9%)" fontSize={12} />
                <Bar dataKey="count" fill={COLORS.chart1} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
