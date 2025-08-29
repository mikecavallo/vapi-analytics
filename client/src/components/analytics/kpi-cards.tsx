import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Phone, Clock, CheckCircle, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { DashboardData } from "@shared/schema";

interface KpiCardsProps {
  data?: DashboardData;
  isLoading: boolean;
}

export default function KpiCards({ data, isLoading }: KpiCardsProps) {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    if (minutes === 0) {
      return `${remainingSeconds}sec`;
    }
    return `${minutes}min ${remainingSeconds}sec`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const kpiCards = [
    {
      title: "Total Calls",
      value: data?.kpis.totalCalls || 0,
      format: (val: number) => val.toLocaleString(),
      icon: Phone,
      trend: 12.5,
      trendLabel: "vs last month",
      color: "text-primary",
      bgColor: "bg-primary/10",
      testId: "kpi-total-calls"
    },
    {
      title: "Avg Duration", 
      value: data?.kpis.avgDuration || 0,
      format: formatDuration,
      icon: Clock,
      trend: -3.2,
      trendLabel: "vs last month",
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
      testId: "kpi-avg-duration"
    },
    {
      title: "Success Rate",
      value: data?.kpis.successRate || 0,
      format: (val: number) => `${val.toFixed(1)}%`,
      icon: CheckCircle,
      trend: 5.7,
      trendLabel: "vs last month",
      color: "text-chart-2", 
      bgColor: "bg-chart-2/10",
      testId: "kpi-success-rate"
    },
    {
      title: "Total Cost",
      value: data?.kpis.totalCost || 0,
      format: formatCurrency,
      icon: DollarSign,
      trend: 8.1,
      trendLabel: "vs last month",
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
      testId: "kpi-total-cost"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiCards.map((card, index) => (
        <Card key={card.title} className="stat-card shadow-sm" data-testid={card.testId}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-muted-foreground text-sm font-medium">{card.title}</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-20 mt-2" />
                ) : (
                  <p className="text-3xl font-bold text-foreground mt-2">
                    {card.format(card.value)}
                  </p>
                )}
                <div className="flex items-center mt-2">
                  {isLoading ? (
                    <Skeleton className="h-4 w-24" />
                  ) : (
                    <>
                      {card.trend >= 0 ? (
                        <TrendingUp className="text-chart-2 mr-1" size={14} />
                      ) : (
                        <TrendingDown className="text-destructive mr-1" size={14} />
                      )}
                      <span className={card.trend >= 0 ? "text-chart-2" : "text-destructive"}>
                        {card.trend >= 0 ? "+" : ""}{card.trend}%
                      </span>
                      <span className="text-muted-foreground text-sm ml-1">{card.trendLabel}</span>
                    </>
                  )}
                </div>
              </div>
              <div className={`${card.bgColor} p-3 rounded-lg`}>
                <card.icon className={`${card.color} text-xl`} size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
