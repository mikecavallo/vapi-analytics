import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { DashboardData } from "@shared/schema";

/**
 * Call Volume Trends Chart Component
 * Displays a line chart showing call volumes over time with filtering options for different time ranges
 */

interface CallVolumeTrendsProps {
  data?: DashboardData;
  isLoading: boolean;
}

const COLORS = {
  chart1: "hsl(210, 100%, 50%)",
};

export default function CallVolumeTrends({ data, isLoading }: CallVolumeTrendsProps) {
  const [volumeTimeRange, setVolumeTimeRange] = useState("daily");
  
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
      <Card>
        <CardHeader>
          <CardTitle>Call Volume Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
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
  );
}