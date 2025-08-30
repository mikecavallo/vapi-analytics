import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  TrendingDown,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Users,
  Target,
  Award,
  ArrowLeft,
  Download,
  RefreshCw,
  Zap,
  Shield
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/theme-context";

interface PerformanceBenchmarks {
  callTimingDistribution: {
    distribution: {
      p25: number;
      p50: number;
      p75: number;
      p90: number;
      p95: number;
    };
    average: number;
    totalCalls: number;
    hourlyPatterns: Array<{
      hour: number;
      calls: number;
      avgDuration: number;
      successRate: number;
    }>;
  };
  anomalyDetection: {
    totalAnomalies: number;
    types: {
      duration: number;
      cost: number;
      status: number;
    };
    recentAnomalies: Array<{
      id: string;
      type: string;
      severity: string;
      description: string;
      timestamp: string;
    }>;
  };
  assistantPerformance: Array<{
    assistantId: string;
    avgDuration: number;
    avgCost: number;
    successRate: number;
    totalCalls: number;
    efficiency: number;
  }>;
  healthcareSpecificMetrics: {
    appointmentBookingRate: number;
    urgentCallPercentage: number;
    prescriptionInquiries: number;
    avgAppointmentCallDuration: number;
    complianceScore: number;
  };
  benchmarkComparisons: {
    industryBenchmarks: {
      avgDuration: number;
      successRate: number;
      costPerCall: number;
    };
    currentPerformance: {
      avgDuration: number;
      successRate: number;
      costPerCall: number;
    };
    weekOverWeekChange: {
      callVolume: number;
      avgDuration: number;
      successRate: number;
    };
  };
}

export default function PerformanceBenchmarks() {
  const { theme } = useTheme();
  const [location] = useLocation();
  const { toast } = useToast();

  const { data: benchmarks, isLoading, refetch } = useQuery<PerformanceBenchmarks>({
    queryKey: ['/api/voicescope/performance-benchmarks'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const exportBenchmarks = () => {
    if (!benchmarks) return;
    
    const exportData = {
      generatedAt: new Date().toISOString(),
      data: benchmarks
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voicescope-benchmarks-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Benchmarks Exported",
      description: "Performance benchmarks have been downloaded successfully",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!benchmarks) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Performance Benchmarks Unavailable</h1>
            <p className="text-muted-foreground mb-6">Unable to load performance benchmarks data</p>
            <Button onClick={() => refetch()}>
              <RefreshCw size={16} className="mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" data-testid="button-back-dashboard">
                <ArrowLeft size={16} className="mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center space-x-3">
                <Activity size={32} />
                <span>Performance Benchmarks</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                Advanced analytics and performance monitoring for voice AI assistants
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => refetch()}
              data-testid="button-refresh-benchmarks"
            >
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </Button>
            <Button onClick={exportBenchmarks} data-testid="button-export-benchmarks">
              <Download size={16} className="mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Anomalies Detected</p>
                  <p className="text-2xl font-bold">{benchmarks.anomalyDetection.totalAnomalies}</p>
                </div>
                <AlertTriangle className="text-amber-500" size={24} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {benchmarks.anomalyDetection.types.status} status issues
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Call Duration</p>
                  <p className="text-2xl font-bold">{Math.round(benchmarks.callTimingDistribution.average)}s</p>
                </div>
                <Clock className="text-blue-500" size={24} />
              </div>
              <div className="flex items-center space-x-1 mt-2">
                <Badge variant="outline" className="text-xs">
                  P95: {Math.round(benchmarks.callTimingDistribution.distribution.p95)}s
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">{benchmarks.benchmarkComparisons.currentPerformance.successRate.toFixed(1)}%</p>
                </div>
                <Target className="text-green-500" size={24} />
              </div>
              <div className="flex items-center space-x-1 mt-2">
                {benchmarks.benchmarkComparisons.currentPerformance.successRate >= benchmarks.benchmarkComparisons.industryBenchmarks.successRate ? (
                  <TrendingUp className="text-green-500" size={12} />
                ) : (
                  <TrendingDown className="text-red-500" size={12} />
                )}
                <span className="text-xs text-muted-foreground">
                  vs {benchmarks.benchmarkComparisons.industryBenchmarks.successRate}% industry
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Compliance Score</p>
                  <p className="text-2xl font-bold">{benchmarks.healthcareSpecificMetrics.complianceScore.toFixed(0)}%</p>
                </div>
                <Shield className="text-purple-500" size={24} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                HIPAA compliance rating
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Call Timing Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 size={20} />
                <span>Call Timing Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { name: 'P25', value: benchmarks.callTimingDistribution.distribution.p25 },
                  { name: 'P50', value: benchmarks.callTimingDistribution.distribution.p50 },
                  { name: 'P75', value: benchmarks.callTimingDistribution.distribution.p75 },
                  { name: 'P90', value: benchmarks.callTimingDistribution.distribution.p90 },
                  { name: 'P95', value: benchmarks.callTimingDistribution.distribution.p95 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Hourly Call Patterns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity size={20} />
                <span>24-Hour Call Patterns</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={benchmarks.callTimingDistribution.hourlyPatterns}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area type="monotone" dataKey="calls" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Assistant Performance Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users size={20} />
                <span>Assistant Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {benchmarks.assistantPerformance.slice(0, 5).map((assistant, index) => (
                  <div key={assistant.assistantId} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Assistant {assistant.assistantId.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">{assistant.totalCalls} calls</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={assistant.successRate > 85 ? 'default' : 'secondary'}>
                        {assistant.successRate.toFixed(1)}% success
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        ${assistant.avgCost.toFixed(3)} avg cost
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Healthcare-Specific Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award size={20} />
                <span>Healthcare Metrics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Appointment Booking Rate</span>
                  <Badge variant="outline">
                    {benchmarks.healthcareSpecificMetrics.appointmentBookingRate.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Urgent Call Percentage</span>
                  <Badge variant={benchmarks.healthcareSpecificMetrics.urgentCallPercentage > 15 ? 'destructive' : 'default'}>
                    {benchmarks.healthcareSpecificMetrics.urgentCallPercentage.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Prescription Inquiries</span>
                  <Badge variant="outline">
                    {benchmarks.healthcareSpecificMetrics.prescriptionInquiries.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avg Appointment Call</span>
                  <Badge variant="outline">
                    {Math.round(benchmarks.healthcareSpecificMetrics.avgAppointmentCallDuration)}s
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Anomalies */}
        {benchmarks.anomalyDetection.recentAnomalies.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle size={20} />
                <span>Recent Anomalies</span>
                <Badge variant="destructive">{benchmarks.anomalyDetection.totalAnomalies}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {benchmarks.anomalyDetection.recentAnomalies.map((anomaly) => (
                  <div key={anomaly.id} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                    <AlertTriangle 
                      size={16} 
                      className={anomaly.severity === 'high' ? 'text-red-500' : 'text-amber-500'} 
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{anomaly.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(anomaly.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={anomaly.severity === 'high' ? 'destructive' : 'secondary'}>
                      {anomaly.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Benchmark Comparisons */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target size={20} />
              <span>Industry Benchmark Comparison</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Average Duration</p>
                <div className="mt-2">
                  <p className="text-2xl font-bold">{Math.round(benchmarks.benchmarkComparisons.currentPerformance.avgDuration)}s</p>
                  <p className="text-sm text-muted-foreground">vs {benchmarks.benchmarkComparisons.industryBenchmarks.avgDuration}s industry</p>
                </div>
                {benchmarks.benchmarkComparisons.currentPerformance.avgDuration <= benchmarks.benchmarkComparisons.industryBenchmarks.avgDuration ? (
                  <Badge variant="default" className="mt-2">Above Average</Badge>
                ) : (
                  <Badge variant="secondary" className="mt-2">Below Average</Badge>
                )}
              </div>
              
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <div className="mt-2">
                  <p className="text-2xl font-bold">{benchmarks.benchmarkComparisons.currentPerformance.successRate.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">vs {benchmarks.benchmarkComparisons.industryBenchmarks.successRate}% industry</p>
                </div>
                {benchmarks.benchmarkComparisons.currentPerformance.successRate >= benchmarks.benchmarkComparisons.industryBenchmarks.successRate ? (
                  <Badge variant="default" className="mt-2">Above Average</Badge>
                ) : (
                  <Badge variant="secondary" className="mt-2">Below Average</Badge>
                )}
              </div>
              
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Cost Per Call</p>
                <div className="mt-2">
                  <p className="text-2xl font-bold">${benchmarks.benchmarkComparisons.currentPerformance.costPerCall.toFixed(3)}</p>
                  <p className="text-sm text-muted-foreground">vs ${benchmarks.benchmarkComparisons.industryBenchmarks.costPerCall.toFixed(3)} industry</p>
                </div>
                {benchmarks.benchmarkComparisons.currentPerformance.costPerCall <= benchmarks.benchmarkComparisons.industryBenchmarks.costPerCall ? (
                  <Badge variant="default" className="mt-2">Above Average</Badge>
                ) : (
                  <Badge variant="secondary" className="mt-2">Below Average</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}