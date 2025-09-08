import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardData } from "@shared/schema";
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
import AIChatbot from "@/components/ai-chatbot";
import { Button } from "@/components/ui/button";
import { Download, ChartLine, User, Sun, Moon, Brain, Activity, Wand2, FileText, Settings, RefreshCw, Users } from "lucide-react";
import logoTransparent from "@assets/logo_transparent_1757373439311.png";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/theme-context";
import { useAuth } from "@/contexts/auth-context";

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
  const [timeRange, setTimeRange] = useState("all-time");
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  const { user } = useAuth();

  const { data, isLoading, error, refetch } = useQuery<DashboardData>({
    queryKey: ["/api/analytics/summary", `?timeRange=${timeRange}`],
    enabled: true,
  });


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
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            {/* Logo - Left Aligned */}
            <div className="flex-shrink-0">
              <img src={logoTransparent} alt="Invoxa.ai" className="h-8" style={{ width: 'auto' }} />
            </div>
            
            {/* Navigation - Center */}
            <nav className="hidden md:flex space-x-8 mx-auto">
              <Link href="/dashboard" className="text-primary border-b-2 border-primary pb-4 px-1 text-sm font-medium">
                Dashboard
              </Link>
              <Link href="/bulk-analysis" className="text-muted-foreground hover:text-foreground pb-4 px-1 text-sm font-medium transition-colors flex items-center space-x-1">
                <Brain size={16} />
                <span>VoiceScope</span>
              </Link>
              <Link href="/performance-benchmarks" className="text-muted-foreground hover:text-foreground pb-4 px-1 text-sm font-medium transition-colors flex items-center space-x-1">
                <Activity size={16} />
                <span>Benchmarks</span>
              </Link>
              <Link href="/assistant-studio" className="text-muted-foreground hover:text-foreground pb-4 px-1 text-sm font-medium transition-colors flex items-center space-x-1">
                <Wand2 size={16} />
                <span>Studio</span>
              </Link>
              {user?.role === 'super_admin' && (
                <Link href="/agency" className="text-muted-foreground hover:text-foreground pb-4 px-1 text-sm font-medium transition-colors flex items-center space-x-1">
                  <Users size={16} />
                  <span>Agency</span>
                </Link>
              )}
              <Link href="/settings" className="text-muted-foreground hover:text-foreground pb-4 px-1 text-sm font-medium transition-colors">
                Settings
              </Link>
            </nav>
            
            {/* Right side controls */}
            <div className="flex items-center space-x-4 ml-auto">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleTheme}
                className="w-8 h-8 rounded-full p-0"
                data-testid="button-toggle-theme"
              >
                {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
              </Button>
              <div className="relative">
                <Button variant="secondary" size="sm" className="w-8 h-8 rounded-full p-0" data-testid="button-user">
                  <User size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Show message when no data is available */}
        {!isLoading && !hasKpiData(data) && !hasCallVolumeData(data) && !hasCallOutcomesData(data) && !hasMostSuccessfulAgentData(data) && !hasDailyMetricsData(data) && !hasRecentCallsData(data) && (
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
        {/* Key Performance Indicators - Main dashboard metrics with time range selector */}
        {/* Key Metrics */}
        {(isLoading || hasKpiData(data)) && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-foreground">Key Metrics</h2>
              <TimeRangeSelector 
                value={timeRange} 
                onChange={setTimeRange}
                data-testid="select-time-range"
              />
            </div>
            <KpiCards data={data} isLoading={isLoading} />
          </section>
        )}

        {/* System Status - Warnings and alerts displayed in full-width section */}
        {/* System Alerts & Warnings */}
        {(isLoading || hasKpiData(data)) && (
          <section className="mb-8">
            <WarningsPanel data={data} isLoading={isLoading} />
          </section>
        )}

        {/* Core Analytics Overview - 3-column layout showing key performance data */}
        {/* Analytics Row: Most Successful Agent, Call Volume, Call Outcomes */}
        {(isLoading || hasMostSuccessfulAgentData(data) || hasCallVolumeData(data) || hasCallOutcomesData(data)) && (
          <section className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {(isLoading || hasMostSuccessfulAgentData(data)) && (
                <MostSuccessfulAgent data={data} isLoading={isLoading} />
              )}
              {(isLoading || hasCallVolumeData(data)) && (
                <CallVolumeTrends data={data} isLoading={isLoading} />
              )}
              {(isLoading || hasCallOutcomesData(data)) && (
                <CallOutcomes data={data} isLoading={isLoading} />
              )}
            </div>
          </section>
        )}


        {/* Daily Metrics Charts */}
        {(isLoading || hasDailyMetricsData(data)) && (
          <section className="mb-8">
            <DailyMetricsCharts data={{ dailyMetrics: data?.dailyMetrics || [] }} isLoading={isLoading} />
          </section>
        )}

        {/* Recent Calls Table */}
        {(isLoading || hasRecentCallsData(data)) && (
          <section className="mb-8">
            <RecentCallsTable data={data?.recentCalls || []} isLoading={isLoading} />
          </section>
        )}

        {/* Advanced Analytics Grid */}
        {(isLoading || hasConversationFlowData(data) || hasDurationDistributionData(data) || hasPeakUsageData(data) || hasConversationOutcomesData(data)) && (
          <section className="mb-8 grid grid-cols-1 gap-8">
            {/* Conversation Flow Analysis */}
            {(isLoading || hasConversationFlowData(data)) && (
              <ConversationFlowAnalysis 
                data={data?.conversationFlow || { stages: [], successPaths: [], dropOffPoints: [] }} 
                isLoading={isLoading} 
              />
            )}
            
            {/* Duration Distribution */}
            {(isLoading || hasDurationDistributionData(data)) && (
              <DurationDistribution 
                data={data?.durationHistogram || { histogram: [], stats: { average: "0:00", median: "0:00", mostCommon: "0:00", longest: "0:00" } }} 
                isLoading={isLoading} 
              />
            )}
            
            {/* Peak Usage Heatmap */}
            {(isLoading || hasPeakUsageData(data)) && (
              <PeakUsageHeatmap 
                data={data?.peakUsageHeatmap || { heatmapData: [], insights: { peakHours: "", busiestDay: "", quietHours: "" } }} 
                isLoading={isLoading} 
              />
            )}
            
            {/* Conversation Outcomes */}
            {(isLoading || hasConversationOutcomesData(data)) && (
              <ConversationOutcomes 
                data={data?.conversationOutcomes || { summary: { totalConversations: 0, successRate: 0, avgDuration: "0:00", avgSatisfaction: 0 }, outcomes: [] }} 
                isLoading={isLoading} 
              />
            )}
          </section>
        )}
      </main>

      {/* AI Chatbot */}
      <AIChatbot callData={data} />
    </div>
  );
}
