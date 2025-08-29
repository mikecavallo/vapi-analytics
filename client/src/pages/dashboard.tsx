import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardData } from "@shared/schema";
import KpiCards from "@/components/analytics/kpi-cards";
import ChartsSection from "@/components/analytics/charts-section";
import RecentCallsTable from "@/components/analytics/recent-calls-table";
import TimeRangeSelector from "@/components/analytics/time-range-selector";
import { Button } from "@/components/ui/button";
import { Download, ChartLine, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState("all-time");
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useQuery<DashboardData>({
    queryKey: ["/api/analytics/summary", `?timeRange=${timeRange}`],
    enabled: true,
  });

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/analytics?timeRange=${timeRange}&format=csv`, {
        method: "GET",
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Export failed");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vapi-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "Your analytics report has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export Failed", 
        description: "There was an error exporting your data. Please try again.",
        variant: "destructive",
      });
    }
  };

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
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary flex items-center">
                  <ChartLine className="mr-2" size={24} />
                  Vapi Analytics
                </h1>
              </div>
              <nav className="hidden md:flex space-x-8">
                <a href="#" className="text-primary border-b-2 border-primary pb-4 px-1 text-sm font-medium">
                  Dashboard
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground pb-4 px-1 text-sm font-medium transition-colors">
                  Reports
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground pb-4 px-1 text-sm font-medium transition-colors">
                  Settings
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <TimeRangeSelector 
                value={timeRange} 
                onChange={setTimeRange}
                data-testid="select-time-range"
              />
              <Button onClick={handleExport} data-testid="button-export" className="bg-primary hover:bg-primary/90">
                <Download className="mr-2" size={16} />
                Export
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
        {/* Key Metrics */}
        <section className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-6">Key Metrics</h2>
          <KpiCards data={data} isLoading={isLoading} />
        </section>

        {/* Charts */}
        <section className="mb-8">
          <ChartsSection data={data} isLoading={isLoading} />
        </section>

        {/* Recent Calls Table */}
        <section className="mb-8">
          <RecentCallsTable data={data?.recentCalls || []} isLoading={isLoading} />
        </section>
      </main>
    </div>
  );
}
