import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { Calendar, TrendingUp, DollarSign, Clock, CheckCircle } from "lucide-react";

interface DailyMetricsData {
  date: string;
  calls: number;
  successfulCalls: number;
  failedCalls: number;
  avgDuration: number;
  totalCost: number;
  avgCost: number;
  successRate: number;
}

interface DailyMetricsChartsProps {
  data: {
    dailyMetrics: DailyMetricsData[];
  };
  isLoading: boolean;
}

export default function DailyMetricsCharts({ data, isLoading }: DailyMetricsChartsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6">
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Custom tooltip for Success Evaluation chart
  const SuccessTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-4 min-w-[200px]">
          <p className="font-medium text-foreground mb-2">{formatDate(label)}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-green-400">✓ Successful:</span>
              <span className="font-medium">{data.successfulCalls}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-400">✗ Failed:</span>
              <span className="font-medium">{data.failedCalls}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Success Rate:</span>
              <span className="font-medium">{data.successRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Calls:</span>
              <span className="font-medium">{data.calls}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for Cost Breakdown chart
  const CostTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-4 min-w-[200px]">
          <p className="font-medium text-foreground mb-2">{formatDate(label)}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-yellow-400">💰 Total Cost:</span>
              <span className="font-medium">${data.totalCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-400">📞 Avg Cost/Call:</span>
              <span className="font-medium">${data.avgCost.toFixed(3)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-400">🕐 Avg Duration:</span>
              <span className="font-medium">{Math.floor(data.avgDuration / 60)}:{(data.avgDuration % 60).toString().padStart(2, '0')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Calls:</span>
              <span className="font-medium">{data.calls}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Success Evaluation Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="text-green-500" size={20} />
            <span>Success Evaluation</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Daily breakdown of successful vs failed calls with interactive tooltips
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.dailyMetrics} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                />
                <Tooltip content={<SuccessTooltip />} />
                <Legend />
                <Bar 
                  dataKey="successfulCalls" 
                  name="Successful"
                  stackId="calls"
                  fill="#22c55e" 
                  radius={[0, 0, 2, 2]}
                  minPointSize={2}
                />
                <Bar 
                  dataKey="failedCalls" 
                  name="Failed"
                  stackId="calls"
                  fill="#ef4444" 
                  radius={[2, 2, 0, 0]}
                  minPointSize={2}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}