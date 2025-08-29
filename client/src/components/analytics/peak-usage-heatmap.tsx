import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, TrendingUp, Moon } from "lucide-react";

interface PeakUsageHeatmapProps {
  data: {
    heatmapData: Array<{
      hour: string;
      day: string;
      calls: number;
      intensity: number; // 0-1 for color intensity
    }>;
    insights: {
      peakHours: string;
      busiestDay: string;
      quietHours: string;
    };
  };
  isLoading: boolean;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, i) => 
  String(i).padStart(2, '0') + ':00'
);

export default function PeakUsageHeatmap({ data, isLoading }: PeakUsageHeatmapProps) {
  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    );
  }

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 0.8) return "bg-chart-1";
    if (intensity >= 0.6) return "bg-chart-1/80";
    if (intensity >= 0.4) return "bg-chart-1/60";
    if (intensity >= 0.2) return "bg-chart-1/40";
    if (intensity > 0) return "bg-chart-1/20";
    return "bg-muted";
  };

  const getCellData = (hour: string, day: string) => {
    return data.heatmapData.find(d => d.hour === hour && d.day === day) || { calls: 0, intensity: 0 };
  };

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold">Peak Usage Heatmap</CardTitle>
          <p className="text-sm text-muted-foreground">Hourly call volume by day of week</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-muted-foreground">Low</span>
            <div className="flex space-x-1">
              <div className="w-3 h-3 rounded bg-muted"></div>
              <div className="w-3 h-3 rounded bg-chart-1/20"></div>
              <div className="w-3 h-3 rounded bg-chart-1/60"></div>
              <div className="w-3 h-3 rounded bg-chart-1"></div>
            </div>
            <span className="text-muted-foreground">High</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Heatmap Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-8 gap-1 mb-2">
                <div></div>
                {DAYS.map(day => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              {HOURS.map(hour => (
                <div key={hour} className="grid grid-cols-8 gap-1 mb-1">
                  <div className="text-xs text-muted-foreground text-right pr-2 py-1 font-mono">
                    {hour}
                  </div>
                  {DAYS.map(day => {
                    const cellData = getCellData(hour, day);
                    return (
                      <div
                        key={`${hour}-${day}`}
                        className={`h-6 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-chart-1/50 ${getIntensityColor(cellData.intensity)}`}
                        title={`${day} ${hour}: ${cellData.calls} calls`}
                        data-testid={`heatmap-cell-${day}-${hour}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Usage Insights */}
          <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-chart-2/20">
                <TrendingUp className="text-chart-2" size={16} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Peak Hours</p>
                <p className="text-sm font-medium" data-testid="text-peak-hours">{data.insights.peakHours}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-chart-1/20">
                <Clock className="text-chart-1" size={16} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Busiest Day</p>
                <p className="text-sm font-medium" data-testid="text-busiest-day">{data.insights.busiestDay}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-muted">
                <Moon className="text-muted-foreground" size={16} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Quiet Hours</p>
                <p className="text-sm font-medium" data-testid="text-quiet-hours">{data.insights.quietHours}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}