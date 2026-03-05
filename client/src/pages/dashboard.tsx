import { useState, useMemo, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardData } from "@shared/schema";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import KpiCards from "@/components/analytics/kpi-cards";
import CallVolumeTrends from "@/components/analytics/call-volume-trends";
import CallOutcomes from "@/components/analytics/call-outcomes";
import RecentCallsTable from "@/components/analytics/recent-calls-table";
import TimeRangeSelector from "@/components/analytics/time-range-selector";
import ConversationFlowAnalysis from "@/components/analytics/conversation-flow-analysis";
import DurationDistribution from "@/components/analytics/duration-distribution";
import PeakUsageHeatmap from "@/components/analytics/peak-usage-heatmap";
import ConversationOutcomes from "@/components/analytics/conversation-outcomes";
import WarningsPanel from "@/components/analytics/warnings-panel";
import MostSuccessfulAgent from "@/components/analytics/most-successful-agent";
import DailyMetricsCharts from "@/components/analytics/daily-metrics-charts";
import SummaryCards from "@/components/analytics/summary-cards";
import DraggableSection from "@/components/analytics/draggable-section";
import AIChatbot from "@/components/ai-chatbot";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartLine, Activity, Settings, RefreshCw, Phone, RotateCcw, Download } from "lucide-react";
import logoTransparent from "@assets/logo_transparent_1757373755849.png";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/theme-context";
import { useAuth } from "@/contexts/auth-context";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { useDashboardLayout } from "@/hooks/use-dashboard-layout";
import { downloadCSV } from "@/lib/export-utils";

// Helper functions to check if data is meaningful
const hasKpiData = (data?: DashboardData) => {
  return data?.kpis && (
    data.kpis.totalCalls > 0 ||
    data.kpis.avgDuration > 0 ||
    data.kpis.successRate > 0 ||
    data.kpis.totalCost > 0
  );
};

const hasCallVolumeData = (data?: DashboardData) => {
  return data?.callVolumeTrends && data.callVolumeTrends.length > 0;
};

const hasCallOutcomesData = (data?: DashboardData) => {
  return data?.callOutcomes && data.callOutcomes.length > 0;
};

const hasMostSuccessfulAgentData = (data?: DashboardData) => {
  return data?.mostSuccessfulAgent && data.mostSuccessfulAgent.name;
};

const hasDailyMetricsData = (data?: DashboardData) => {
  return data?.dailyMetrics && data.dailyMetrics.length > 0;
};

const hasRecentCallsData = (data?: DashboardData) => {
  return data?.recentCalls && data.recentCalls.length > 0;
};

const hasConversationFlowData = (data?: DashboardData) => {
  return data?.conversationFlow && (
    data.conversationFlow.stages.length > 0 ||
    data.conversationFlow.successPaths.length > 0 ||
    data.conversationFlow.dropOffPoints.length > 0
  );
};

const hasDurationDistributionData = (data?: DashboardData) => {
  return data?.durationHistogram && data.durationHistogram.histogram.length > 0;
};

const hasPeakUsageData = (data?: DashboardData) => {
  return data?.peakUsageHeatmap && data.peakUsageHeatmap.heatmapData.length > 0;
};

const hasConversationOutcomesData = (data?: DashboardData) => {
  return data?.conversationOutcomes && (
    data.conversationOutcomes.summary.totalConversations > 0 ||
    data.conversationOutcomes.outcomes.length > 0
  );
};

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState("last-7-days");
  const [provider, setProvider] = useState("vapi");
  const [customDateRange, setCustomDateRange] = useState<{ from: Date; to: Date } | null>(null);
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  const { user } = useAuth();
  const { sections, reorder, resetLayout } = useDashboardLayout();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  // Build query string with optional custom dates
  const queryParams = (() => {
    const params = `?timeRange=${timeRange}&provider=${provider}`;
    if (timeRange === "custom-range" && customDateRange) {
      return `${params}&startDate=${customDateRange.from.toISOString()}&endDate=${customDateRange.to.toISOString()}`;
    }
    return params;
  })();

  const { data, isLoading, error, refetch } = useQuery<DashboardData>({
    queryKey: ["/api/analytics/summary", queryParams],
    enabled: timeRange !== "custom-range" || !!customDateRange,
  });

  const handleExportCSV = () => {
    if (!data) return;
    const rows: Record<string, any>[] = [];

    // Export daily metrics if available
    if (data.dailyMetrics && data.dailyMetrics.length > 0) {
      data.dailyMetrics.forEach((m: any) => {
        rows.push({
          date: m.date,
          totalCalls: m.totalCalls ?? '',
          successfulCalls: m.successfulCalls ?? '',
          failedCalls: m.failedCalls ?? '',
          avgDuration: m.avgDuration ?? '',
          totalCost: m.totalCost ?? '',
        });
      });
    }

    // If no daily metrics, export KPIs as a single row
    if (rows.length === 0 && data.kpis) {
      rows.push({
        totalCalls: data.kpis.totalCalls,
        avgDuration: data.kpis.avgDuration,
        successRate: data.kpis.successRate,
        totalCost: data.kpis.totalCost,
      });
    }

    if (rows.length === 0) return;
    const dateStr = new Date().toISOString().split('T')[0];
    downloadCSV(rows, `dashboard-metrics-${dateStr}.csv`);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorder(active.id as string, over.id as string);
    }
  };

  // Build section content map — always render all sections
  const sectionContent = useMemo((): Record<string, ReactNode> => {
    return {
      "kpi-cards": (
        <section>
          <h2 className="text-3xl font-bold text-foreground mb-6">Key Metrics</h2>
          <KpiCards data={data} isLoading={isLoading} />
        </section>
      ),

      "warnings": (
        <section>
          <WarningsPanel data={data} isLoading={isLoading} />
        </section>
      ),

      "agent-volume": (
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CallVolumeTrends data={data} isLoading={isLoading} />
            <DailyMetricsCharts data={{ dailyMetrics: data?.dailyMetrics || [] }} isLoading={isLoading} />
          </div>
          {(isLoading || hasMostSuccessfulAgentData(data)) && (
            <div className="mt-6">
              <MostSuccessfulAgent data={data} isLoading={isLoading} />
            </div>
          )}
        </section>
      ),

      "outcomes-evaluation": (
        <section>
          <CallOutcomes data={data} isLoading={isLoading} />
        </section>
      ),

      "recent-calls": (
        <section>
          <RecentCallsTable data={data?.recentCalls || []} isLoading={isLoading} />
        </section>
      ),

      "conversation-flow": (
        <section>
          <ConversationFlowAnalysis
            data={data?.conversationFlow || { stages: [], successPaths: [], dropOffPoints: [] }}
            isLoading={isLoading}
          />
        </section>
      ),

      "duration-distribution": (
        <section>
          <DurationDistribution
            data={data?.durationHistogram || { histogram: [], stats: { average: "0:00", median: "0:00", mostCommon: "0:00", longest: "0:00" } }}
            isLoading={isLoading}
          />
        </section>
      ),

      "peak-usage": (
        <section>
          <PeakUsageHeatmap
            data={data?.peakUsageHeatmap || { heatmapData: [], insights: { peakHours: "", busiestDay: "", quietHours: "" } }}
            isLoading={isLoading}
          />
        </section>
      ),

      "conversation-outcomes": (
        <section>
          <ConversationOutcomes
            data={data?.conversationOutcomes || { summary: { totalConversations: 0, successRate: 0, avgDuration: "0:00", avgSatisfaction: 0 }, outcomes: [] }}
            isLoading={isLoading}
          />
        </section>
      ),
    };
  }, [data, isLoading, provider, timeRange, customDateRange]);

  // Filter to only visible sections
  const visibleSections = sections.filter(s => s.visible);
  const hasAnyData = visibleSections.length > 0;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 bg-card rounded-lg border border-border shadow-sm max-w-md mx-4">
          <div className="text-destructive mb-4">
            <ChartLine size={48} className="mx-auto" />
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2">Analytics Unavailable</h1>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : "Unable to load analytics data. Please check your Vapi API configuration."}
          </p>
          <Button onClick={() => refetch()} data-testid="button-retry">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top controls: provider tabs + date picker */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <Tabs value={provider} onValueChange={setProvider} className="w-[200px]">
              <TabsList>
                <TabsTrigger value="vapi" className="flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Vapi
                </TabsTrigger>
                <TabsTrigger value="retell" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Retell
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex items-center gap-2">
            <TimeRangeSelector
              value={timeRange}
              onChange={setTimeRange}
              customDateRange={customDateRange}
              onCustomDateChange={setCustomDateRange}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleExportCSV}
              disabled={isLoading || !data}
              title="Export CSV"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Empty state when no data */}
        {!isLoading && !hasAnyData && (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <div className="max-w-md mx-auto">
              <div className="text-muted-foreground mb-4">
                <img src={logoTransparent} alt="Invoxa.ai" className="h-16 mx-auto mb-4 opacity-50" style={{ width: 'auto' }} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Analytics Data Available</h3>
              <p className="text-muted-foreground mb-6">
                Your dashboard will populate with analytics once you have call data. Make sure your Vapi API key is configured in settings and you have some voice calls to analyze.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/settings">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Configure API Key
                  </Button>
                </Link>
                <Button onClick={() => refetch()} variant="default" className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Refresh Data
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Draggable dashboard sections */}
        {hasAnyData && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={visibleSections.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-8">
                {visibleSections.map((section) => (
                  <DraggableSection key={section.id} id={section.id}>
                    {sectionContent[section.id]}
                  </DraggableSection>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Reset layout button */}
        {hasAnyData && (
          <div className="flex justify-center mt-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetLayout}
              className="text-muted-foreground hover:text-foreground gap-2"
            >
              <RotateCcw className="h-3 w-3" />
              Reset Layout
            </Button>
          </div>
        )}
      </main>

      {/* AI Chatbot */}
      <AIChatbot callData={data} />
    </div>
  );
}
