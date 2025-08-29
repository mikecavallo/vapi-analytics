import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Clock, Users, Info } from "lucide-react";

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
  const [viewMode, setViewMode] = useState("histogram");

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
      const data = payload[0].payload;
      const isPopularRange = data.percentage > 20;
      const isLongCall = label.includes('10+') || label.includes('15+');
      
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-4 min-w-[220px]">
          <p className="font-medium text-foreground mb-2">Duration: {label}</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-400">📞 Calls:</span>
              <span className="font-medium">{data.count.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Percentage:</span>
              <span className="font-medium">{data.percentage.toFixed(1)}%</span>
            </div>
            <div className="pt-2 border-t text-xs text-muted-foreground">
              {isPopularRange ? '🎯 Common call duration - majority of conversations' :
               isLongCall ? '⏰ Extended conversations - complex discussions or detailed support' :
               '⚡ Quick interactions - brief exchanges or early disconnects'}
            </div>
          </div>
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
          <Button
            size="sm"
            variant={viewMode === "histogram" ? "default" : "outline"}
            onClick={() => setViewMode("histogram")}
            data-testid="badge-histogram"
          >
            Histogram
          </Button>
          <Button
            size="sm"
            variant={viewMode === "trend" ? "default" : "outline"}
            onClick={() => setViewMode("trend")}
            data-testid="badge-trend"
          >
            Trend
          </Button>
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
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  fill="hsl(43, 74%, 66%)"
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