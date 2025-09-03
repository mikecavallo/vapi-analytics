import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  FileText,
  ArrowLeft,
  Loader2,
  Download,
  Calendar as CalendarIcon,
  Settings,
  BarChart3,
  Shield,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Clock,
  Users,
  Target,
  Eye,
  Copy,
  ChartLine,
  Brain,
  Activity,
  Wand2,
  User,
  Sun,
  Moon,
  Building2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/theme-context";
import { format } from "date-fns";

interface ReportData {
  metadata: {
    title: string;
    generatedAt: string;
    reportType: string;
    totalCalls: number;
    reportId: string;
    period: string;
  };
  executiveSummary: string;
  keyMetrics: {
    totalCalls: number;
    successRate: number;
    avgDuration: number;
    totalCost: string;
    avgCost: string;
    appointmentBookingRate: number;
    urgentCallPercentage: number;
    prescriptionInquiryRate: number;
  };
  recommendations: string[];
  actionItems: Array<{
    priority: string;
    action: string;
    timeline: string;
    expectedImpact: string;
  }>;
  healthcareCompliance: {
    hipaaComplianceScore: number;
    privacyMetrics: any;
    auditTrail: any[];
  };
  performanceTrends: any;
  appendices: {
    rawData: any[];
    benchmarkData: any;
    methodology: any;
  };
}

export default function Reports() {
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  const { toast } = useToast();

  // Form states
  const [reportType, setReportType] = useState('executive');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [includeTranscripts, setIncludeTranscripts] = useState(false);
  const [includeBenchmarks, setIncludeBenchmarks] = useState(true);
  const [assistantFilter, setAssistantFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Generated report state
  const [generatedReport, setGeneratedReport] = useState<ReportData | null>(null);
  const [showReportPreview, setShowReportPreview] = useState(false);

  // Mutations
  const generateReportMutation = useMutation({
    mutationFn: async (reportConfig: any) => {
      const response = await fetch('/api/voicescope/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportConfig),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate report');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedReport(data);
      setShowReportPreview(true);
      toast({
        title: "Report Generated!",
        description: `Created ${data.metadata.title} with ${data.metadata.totalCalls} calls`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Report Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerateReport = () => {
    const config = {
      reportType,
      dateRange,
      includeTranscripts,
      includeBenchmarks,
      customFilters: {
        assistantId: assistantFilter || undefined,
        status: statusFilter || undefined
      }
    };

    generateReportMutation.mutate(config);
  };

  const downloadReport = (format: 'json' | 'html') => {
    if (!generatedReport) return;
    
    let blob: Blob;
    let filename: string;
    
    if (format === 'json') {
      blob = new Blob([JSON.stringify(generatedReport, null, 2)], { type: 'application/json' });
      filename = `${generatedReport.metadata.reportId}-${reportType}-report.json`;
    } else {
      const htmlContent = generateHTMLReport(generatedReport);
      blob = new Blob([htmlContent], { type: 'text/html' });
      filename = `${generatedReport.metadata.reportId}-${reportType}-report.html`;
    }
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: `Report Downloaded`,
      description: `${format.toUpperCase()} report saved successfully`,
    });
  };

  const generateHTMLReport = (report: ReportData): string => {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>${report.metadata.title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; color: #333; }
        .header { border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px; }
        .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; background: #f9fafb; }
        .metric-value { font-size: 2em; font-weight: bold; color: #1f2937; }
        .metric-label { color: #6b7280; margin-top: 5px; }
        .section { margin: 30px 0; }
        .recommendation { background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 10px 0; }
        .action-item { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 10px 0; }
        .priority-high { border-left-color: #ef4444; }
        .priority-medium { border-left-color: #f59e0b; }
        .priority-low { border-left-color: #10b981; }
        h1 { color: #1f2937; }
        h2 { color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
        .compliance-score { display: inline-block; padding: 8px 16px; border-radius: 20px; background: #10b981; color: white; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${report.metadata.title}</h1>
        <p><strong>Report ID:</strong> ${report.metadata.reportId}</p>
        <p><strong>Generated:</strong> ${new Date(report.metadata.generatedAt).toLocaleString()}</p>
        <p><strong>Period:</strong> ${report.metadata.period}</p>
        <p><strong>Total Calls Analyzed:</strong> ${report.metadata.totalCalls}</p>
    </div>

    <div class="section">
        <h2>Executive Summary</h2>
        <p>${report.executiveSummary}</p>
    </div>

    <div class="section">
        <h2>Key Performance Metrics</h2>
        <div class="metric-grid">
            <div class="metric-card">
                <div class="metric-value">${report.keyMetrics.totalCalls}</div>
                <div class="metric-label">Total Calls</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${report.keyMetrics.successRate.toFixed(1)}%</div>
                <div class="metric-label">Success Rate</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${report.keyMetrics.avgDuration}s</div>
                <div class="metric-label">Average Duration</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">$${report.keyMetrics.totalCost}</div>
                <div class="metric-label">Total Cost</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${report.keyMetrics.appointmentBookingRate.toFixed(1)}%</div>
                <div class="metric-label">Appointment Bookings</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${report.keyMetrics.urgentCallPercentage.toFixed(1)}%</div>
                <div class="metric-label">Urgent Calls</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Healthcare Compliance</h2>
        <p>HIPAA Compliance Score: <span class="compliance-score">${report.healthcareCompliance.hipaaComplianceScore.toFixed(0)}%</span></p>
    </div>

    <div class="section">
        <h2>Recommendations</h2>
        ${report.recommendations.map(rec => `<div class="recommendation">${rec}</div>`).join('')}
    </div>

    <div class="section">
        <h2>Action Items</h2>
        ${report.actionItems.map(item => `
            <div class="action-item priority-${item.priority}">
                <strong>${item.action}</strong> (${item.priority} priority)<br>
                <em>Timeline: ${item.timeline}</em><br>
                Expected Impact: ${item.expectedImpact}
            </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>Report Methodology</h2>
        <p><strong>Data Collection:</strong> ${report.appendices.methodology.dataCollection}</p>
        <p><strong>Analysis Framework:</strong> ${report.appendices.methodology.analysisFramework}</p>
        <p><strong>Quality Assurance:</strong> ${report.appendices.methodology.qualityAssurance}</p>
    </div>
</body>
</html>`;
  };

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
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground pb-4 px-1 text-sm font-medium transition-colors">
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
                <Link href="/agency" className="text-muted-foreground hover:text-foreground pb-4 px-1 text-sm font-medium transition-colors flex items-center space-x-1">
                  <Building2 size={16} />
                  <span>Agency</span>
                </Link>
                <Link href="/reports" className="text-primary border-b-2 border-primary pb-4 px-1 text-sm font-medium flex items-center space-x-1">
                  <FileText size={16} />
                  <span>Reports</span>
                </Link>
                <a href="#" className="text-muted-foreground hover:text-foreground pb-4 px-1 text-sm font-medium transition-colors">
                  Settings
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="px-3 py-1">
                <BarChart3 size={14} className="mr-1" />
                Professional Reports
              </Badge>
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
        <div className="space-y-6">
          {/* Page Title */}
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-3">
              <FileText size={32} />
              <span>Advanced Reports</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Generate comprehensive analytics reports with AI-powered insights
            </p>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings size={20} />
                <span>Report Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Report Type */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger data-testid="select-report-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="executive">Executive Summary</SelectItem>
                    <SelectItem value="detailed">Detailed Analytics</SelectItem>
                    <SelectItem value="compliance">Healthcare Compliance</SelectItem>
                    <SelectItem value="performance">Performance Benchmarks</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="justify-start text-left font-normal">
                        <CalendarIcon size={14} className="mr-2" />
                        {dateRange.from ? format(dateRange.from, "MMM dd") : "From"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="justify-start text-left font-normal">
                        <CalendarIcon size={14} className="mr-2" />
                        {dateRange.to ? format(dateRange.to, "MMM dd") : "To"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange.to}
                        onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Filters */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Assistant Filter (Optional)</Label>
                  <Input
                    placeholder="Assistant ID"
                    value={assistantFilter}
                    onChange={(e) => setAssistantFilter(e.target.value)}
                    data-testid="input-assistant-filter"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status Filter (Optional)</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger data-testid="select-status-filter">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="ended">Ended</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="include-transcripts" 
                    checked={includeTranscripts}
                    onCheckedChange={setIncludeTranscripts}
                  />
                  <Label htmlFor="include-transcripts" className="text-sm">
                    Include Transcripts (Sample)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="include-benchmarks" 
                    checked={includeBenchmarks}
                    onCheckedChange={setIncludeBenchmarks}
                  />
                  <Label htmlFor="include-benchmarks" className="text-sm">
                    Include Benchmark Data
                  </Label>
                </div>
              </div>

              {/* Generate Button */}
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleGenerateReport}
                disabled={generateReportMutation.isPending}
                data-testid="button-generate-report"
              >
                {generateReportMutation.isPending ? (
                  <Loader2 className="mr-2 animate-spin" size={20} />
                ) : (
                  <FileText className="mr-2" size={20} />
                )}
                {generateReportMutation.isPending ? 'Generating Report...' : 'Generate Report'}
              </Button>

              {/* Quick Presets */}
              <div className="space-y-3 pt-4 border-t">
                <p className="text-sm font-medium text-muted-foreground">Quick Presets:</p>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => {
                      setReportType('executive');
                      setDateRange({ from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), to: new Date() });
                      setIncludeBenchmarks(true);
                      setIncludeTranscripts(false);
                    }}
                  >
                    <TrendingUp className="mr-2" size={14} />
                    Weekly Executive Report
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => {
                      setReportType('compliance');
                      setDateRange({ from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), to: new Date() });
                      setIncludeBenchmarks(true);
                      setIncludeTranscripts(true);
                    }}
                  >
                    <Shield className="mr-2" size={14} />
                    Monthly Compliance Audit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Preview */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye size={20} />
                  <span>Report Preview</span>
                </div>
                {generatedReport && (
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => downloadReport('html')}
                      data-testid="button-download-html"
                    >
                      <Download size={14} className="mr-1" />
                      HTML
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => downloadReport('json')}
                      data-testid="button-download-json"
                    >
                      <Download size={14} className="mr-1" />
                      JSON
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!generatedReport ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                  <FileText className="text-muted-foreground" size={48} />
                  <div>
                    <h3 className="font-medium text-foreground">No Report Generated Yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure your report settings and click "Generate Report" to create a comprehensive analysis
                    </p>
                  </div>
                </div>
              ) : (
                <ScrollArea className="h-96 w-full">
                  <div className="space-y-6 pr-4">
                    {/* Report Header */}
                    <div className="border-b pb-4">
                      <h3 className="text-xl font-bold">{generatedReport.metadata.title}</h3>
                      <div className="text-sm text-muted-foreground space-y-1 mt-2">
                        <p>Report ID: {generatedReport.metadata.reportId}</p>
                        <p>Period: {generatedReport.metadata.period}</p>
                        <p>Generated: {new Date(generatedReport.metadata.generatedAt).toLocaleString()}</p>
                        <p>Total Calls: {generatedReport.metadata.totalCalls}</p>
                      </div>
                    </div>

                    {/* Executive Summary */}
                    <div>
                      <h4 className="font-semibold mb-2">Executive Summary</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {generatedReport.executiveSummary}
                      </p>
                    </div>

                    {/* Key Metrics */}
                    <div>
                      <h4 className="font-semibold mb-3">Key Metrics</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Users size={16} className="text-blue-500" />
                            <span className="text-sm font-medium">Total Calls</span>
                          </div>
                          <p className="text-lg font-bold mt-1">{generatedReport.keyMetrics.totalCalls}</p>
                        </div>
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Target size={16} className="text-green-500" />
                            <span className="text-sm font-medium">Success Rate</span>
                          </div>
                          <p className="text-lg font-bold mt-1">{generatedReport.keyMetrics.successRate.toFixed(1)}%</p>
                        </div>
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Clock size={16} className="text-purple-500" />
                            <span className="text-sm font-medium">Avg Duration</span>
                          </div>
                          <p className="text-lg font-bold mt-1">{generatedReport.keyMetrics.avgDuration}s</p>
                        </div>
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Shield size={16} className="text-amber-500" />
                            <span className="text-sm font-medium">HIPAA Score</span>
                          </div>
                          <p className="text-lg font-bold mt-1">{generatedReport.healthcareCompliance.hipaaComplianceScore.toFixed(0)}%</p>
                        </div>
                      </div>
                    </div>

                    {/* Recommendations */}
                    {generatedReport.recommendations?.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">Key Recommendations</h4>
                        <div className="space-y-2">
                          {generatedReport.recommendations.slice(0, 3).map((rec, index) => (
                            <div key={index} className="flex items-start space-x-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                              <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Items */}
                    {generatedReport.actionItems?.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">Priority Action Items</h4>
                        <div className="space-y-2">
                          {generatedReport.actionItems.slice(0, 3).map((item, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">{item.action}</span>
                                <Badge variant={
                                  item.priority === 'high' ? 'destructive' : 
                                  item.priority === 'medium' ? 'default' : 'secondary'
                                }>
                                  {item.priority}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Timeline: {item.timeline} | Impact: {item.expectedImpact}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
        </div>
      </main>
    </div>
  );
}