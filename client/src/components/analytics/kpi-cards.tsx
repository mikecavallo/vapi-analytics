import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Phone, Clock, CheckCircle, DollarSign, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { DashboardData, KpiData } from "@shared/schema";

interface KpiCardsProps {
  data?: DashboardData;
  isLoading: boolean;
}

/**
 * Compute the percentage change between a current and previous value.
 * Returns null when there is no previous data to compare against.
 * Returns "new" sentinel when previous was 0 but current > 0.
 */
function computeTrend(current: number, previous: number | undefined): number | null | "new" {
  if (previous === undefined || previous === null) return null;
  if (previous === 0) return current > 0 ? "new" : null;
  return parseFloat(((current - previous) / previous * 100).toFixed(1));
}

type TrendValue = number | null | "new";

export default function KpiCards({ data, isLoading }: KpiCardsProps) {
  const prev = data?.previousKpis as KpiData | null | undefined;

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

  const kpiCards: Array<{
    title: string;
    value: number;
    format: (val: number) => string;
    icon: typeof Phone;
    trend: TrendValue;
    trendLabel: string;
    color: string;
    bgColor: string;
    testId: string;
    invertTrend?: boolean;
  }> = [
    {
      title: "Total Calls",
      value: data?.kpis.totalCalls || 0,
      format: (val: number) => val.toLocaleString(),
      icon: Phone,
      trend: computeTrend(data?.kpis.totalCalls || 0, prev?.totalCalls),
      trendLabel: "vs prior period",
      color: "text-primary",
      bgColor: "bg-primary/10",
      testId: "kpi-total-calls"
    },
    {
      title: "Avg Duration",
      value: data?.kpis.avgDuration || 0,
      format: formatDuration,
      icon: Clock,
      trend: computeTrend(data?.kpis.avgDuration || 0, prev?.avgDuration),
      trendLabel: "vs prior period",
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
      testId: "kpi-avg-duration"
    },
    {
      title: "Inbound Success",
      value: data?.kpis.inboundSuccessRate || 0,
      format: (val: number) => `${val.toFixed(1)}%`,
      icon: CheckCircle,
      trend: computeTrend(data?.kpis.inboundSuccessRate || 0, prev?.inboundSuccessRate),
      trendLabel: "vs prior period",
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      testId: "kpi-inbound-success-rate"
    },
    {
      title: "Outbound Success",
      value: data?.kpis.outboundSuccessRate || 0,
      format: (val: number) => `${val.toFixed(1)}%`,
      icon: CheckCircle,
      trend: computeTrend(data?.kpis.outboundSuccessRate || 0, prev?.outboundSuccessRate),
      trendLabel: "vs prior period",
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      testId: "kpi-outbound-success-rate"
    },
    {
      title: "Total Cost",
      value: data?.kpis.totalCost || 0,
      format: formatCurrency,
      icon: DollarSign,
      trend: computeTrend(data?.kpis.totalCost || 0, prev?.totalCost),
      trendLabel: "vs prior period",
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
      testId: "kpi-total-cost",
      invertTrend: true, // cost going up is bad
    },
  ];

  const renderTrend = (card: typeof kpiCards[number]) => {
    const { trend, trendLabel, invertTrend } = card;

    // No previous data available — hide trend entirely
    if (trend === null) {
      return (
        <span className="text-muted-foreground text-sm">No prior data</span>
      );
    }

    // Previous was 0, current > 0 — show "New" badge
    if (trend === "new") {
      return (
        <span className="text-chart-2 text-sm font-medium">New</span>
      );
    }

    // Normal numeric trend
    const isPositiveDirection = invertTrend ? trend <= 0 : trend >= 0;

    return (
      <>
        {trend === 0 ? (
          <Minus className="text-muted-foreground mr-1" size={14} />
        ) : isPositiveDirection ? (
          <TrendingUp className="text-chart-2 mr-1" size={14} />
        ) : (
          <TrendingDown className="text-destructive mr-1" size={14} />
        )}
        <span className={trend === 0 ? "text-muted-foreground" : isPositiveDirection ? "text-chart-2" : "text-destructive"}>
          {trend > 0 ? "+" : ""}{trend}%
        </span>
        <span className="text-muted-foreground text-sm ml-1">{trendLabel}</span>
      </>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
                    renderTrend(card)
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
