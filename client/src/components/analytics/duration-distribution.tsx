import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Clock, Users } from "lucide-react";

interface DurationDistributionProps {
  data: {
    histogram: Array<{
      range: string;
      count: number;
      percentage: number;
    }>;
    stats: {
      average: string;
      median: string;
      mostCommon: string;
      longest: string;
    };
  };
  isLoading: boolean;
}

export default function DurationDistribution({ data, isLoading }: DurationDistributionProps) {
  if (isLoading) {
    return (
      <Card className="col-span-full lg:col-span-2">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-end space-x-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-64 w-full" />
            <div className="grid grid-cols-4 gap-4">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium">{label}</p>
          <p className="text-chart-1">
            <span className="font-medium">{payload[0].value}</span> calls ({payload[0].payload.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold">Call Duration Distribution</CardTitle>
          <p className="text-sm text-muted-foreground">Conversation length analysis and patterns</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-chart-1/10 text-chart-1" data-testid="badge-histogram">
            Histogram
          </Badge>
          <Badge variant="outline" data-testid="badge-trend">
            Trend
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Duration Histogram */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.histogram} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="range" 
                  fontSize={12}
                  className="text-muted-foreground"
                />
                <YAxis 
                  fontSize={12}
                  className="text-muted-foreground"
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--chart-1))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Duration Statistics */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="flex items-center justify-center mb-2">
                <Clock className="text-chart-4 mr-1" size={16} />
                <span className="text-xs text-muted-foreground">Average</span>
              </div>
              <p className="text-lg font-bold text-chart-4" data-testid="stat-average">
                {data.stats.average}
              </p>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="text-chart-2 mr-1" size={16} />
                <span className="text-xs text-muted-foreground">Median</span>
              </div>
              <p className="text-lg font-bold text-chart-2" data-testid="stat-median">
                {data.stats.median}
              </p>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="flex items-center justify-center mb-2">
                <Users className="text-chart-3 mr-1" size={16} />
                <span className="text-xs text-muted-foreground">Most Common</span>
              </div>
              <p className="text-lg font-bold text-chart-3" data-testid="stat-common">
                {data.stats.mostCommon}
              </p>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="flex items-center justify-center mb-2">
                <Clock className="text-chart-5 mr-1" size={16} />
                <span className="text-xs text-muted-foreground">Longest</span>
              </div>
              <p className="text-lg font-bold text-chart-5" data-testid="stat-longest">
                {data.stats.longest}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}