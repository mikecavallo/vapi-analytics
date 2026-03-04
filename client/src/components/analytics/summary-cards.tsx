import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Phone, DollarSign, TrendingUp } from "lucide-react";
import { DashboardData } from "@shared/schema";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface SummaryCardsProps {
  data?: DashboardData;
  isLoading: boolean;
}

export default function SummaryCards({ data, isLoading }: SummaryCardsProps) {
  const dailyMetrics = data?.dailyMetrics || [];

  const totalMinutes = data
    ? Math.round((data.kpis.avgDuration * data.kpis.totalCalls) / 60)
    : 0;

  const avgCostPerCall = data?.costAnalysis?.avgCostPerCall ?? (
    data?.kpis.totalCalls ? data.kpis.totalCost / data.kpis.totalCalls : 0
  );

  const cards = [
    {
      title: "Total Call Minutes",
      value: totalMinutes.toLocaleString(),
      icon: Clock,
      color: "#3b82f6",
      chartData: dailyMetrics.map(d => ({ v: Math.round(d.avgDuration * d.calls / 60) })),
    },
    {
      title: "Number of Calls",
      value: (data?.kpis.totalCalls || 0).toLocaleString(),
      icon: Phone,
      color: "#8b5cf6",
      chartData: dailyMetrics.map(d => ({ v: d.calls })),
    },
    {
      title: "Total Spent",
      value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data?.kpis.totalCost || 0),
      icon: DollarSign,
      color: "#10b981",
      chartData: dailyMetrics.map(d => ({ v: d.totalCost })),
    },
    {
      title: "Avg Cost / Call",
      value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(avgCostPerCall),
      icon: TrendingUp,
      color: "#f59e0b",
      chartData: dailyMetrics.map(d => ({ v: d.avgCost })),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
              <card.icon className="w-4 h-4 text-muted-foreground" />
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mb-3" />
            ) : (
              <p className="text-2xl font-bold text-foreground mb-3">{card.value}</p>
            )}
            <div className="h-12">
              {isLoading ? (
                <Skeleton className="h-full w-full rounded" />
              ) : card.chartData.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={card.chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`fill-${card.title}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={card.color} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={card.color} stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke={card.color}
                      strokeWidth={1.5}
                      fill={`url(#fill-${card.title})`}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  No trend data
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
