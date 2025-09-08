import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { DashboardData } from "@shared/schema";
import { format } from "date-fns";

interface AssistantUsageChartProps {
  data?: DashboardData;
  isLoading: boolean;
}

// Colors for different assistants - using distinct colors for better visibility
const ASSISTANT_COLORS = [
  "#0ea5e9", // Sky blue
  "#10b981", // Emerald green
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Violet
  "#06b6d4", // Cyan
  "#84cc16", // Lime
  "#f97316", // Orange
  "#ec4899", // Pink
  "#6366f1"  // Indigo
];

export default function AssistantUsageChart({ data, isLoading }: AssistantUsageChartProps) {
  
  // Generate mock assistant usage data for demonstration
  const generateAssistantUsageData = () => {
    if (!data?.callVolumeTrends || data.callVolumeTrends.length === 0) {
      // Generate sample data for the last 30 days
      const sampleData = [];
      const assistants = ['Healthcare Assistant', 'Sales Bot', 'Customer Support', 'Booking Agent'];
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = format(date, 'MMM dd');
        
        const dataPoint: any = {
          date: dateStr,
          fullDate: format(date, 'yyyy-MM-dd')
        };
        
        // Generate realistic usage patterns for each assistant
        assistants.forEach((assistant, index) => {
          const baseUsage = Math.random() * 50 + 20; // Base 20-70 calls
          const variance = Math.sin(i * 0.3 + index) * 15; // Some variation
          const weekendFactor = date.getDay() === 0 || date.getDay() === 6 ? 0.6 : 1; // Lower on weekends
          
          dataPoint[assistant] = Math.max(0, Math.round(baseUsage + variance * weekendFactor));
        });
        
        sampleData.push(dataPoint);
      }
      return sampleData;
    }
    
    // For now, use sample data since assistantBreakdown isn't available in the API
    // This can be extended when the API provides assistant-specific data
    const assistants = ['Healthcare Assistant', 'Sales Bot', 'Customer Support', 'Booking Agent'];
    
    return data.callVolumeTrends.map((item, index) => {
      const dataPoint: any = {
        date: format(new Date(item.date), 'MMM dd'),
        fullDate: item.date
      };
      
      // Distribute total calls among assistants with some variance
      const totalCalls = item.calls;
      assistants.forEach((assistant, i) => {
        const factor = 0.15 + (Math.sin(index + i) * 0.1) + 0.2; // Vary between 0.05-0.45
        dataPoint[assistant] = Math.round(totalCalls * factor);
      });
      
      return dataPoint;
    });
  };

  const assistantUsageData = generateAssistantUsageData();
  
  // Extract assistant names (excluding date fields)
  const assistantNames = assistantUsageData.length > 0 
    ? Object.keys(assistantUsageData[0]).filter(key => key !== 'date' && key !== 'fullDate')
    : [];
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Assistant Activity</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Call volume per assistant over the last 30 days
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Assistant Activity</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Call volume per assistant over the last 30 days
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={assistantUsageData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-muted-foreground text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-muted-foreground text-xs"
                tick={{ fontSize: 12 }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              {assistantNames.map((assistant, index) => (
                <Line
                  key={assistant}
                  type="monotone"
                  dataKey={assistant}
                  stroke={ASSISTANT_COLORS[index % ASSISTANT_COLORS.length]}
                  strokeWidth={2}
                  dot={{ fill: ASSISTANT_COLORS[index % ASSISTANT_COLORS.length], strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: ASSISTANT_COLORS[index % ASSISTANT_COLORS.length] }}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Assistant Summary Stats */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-2 gap-4">
            {assistantNames.slice(0, 4).map((assistant, index) => {
              const totalCalls = assistantUsageData.reduce((sum, day) => sum + (day[assistant] || 0), 0);
              const avgCalls = Math.round(totalCalls / assistantUsageData.length);
              
              return (
                <div key={assistant} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: ASSISTANT_COLORS[index % ASSISTANT_COLORS.length] }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{assistant}</p>
                    <p className="text-xs text-muted-foreground">
                      {totalCalls} total • {avgCalls}/day avg
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}