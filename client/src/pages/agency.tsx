import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Download, ChartLine, User, Sun, Moon, Brain, Activity, Wand2, FileText, Building2, Plus, Phone, DollarSign, TrendingUp, PieChart } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/theme-context";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Company {
  id: number;
  name: string;
  apiKey: string;
  createdAt: string;
}

interface CompanyMetrics {
  companyId: number;
  totalCalls: number;
  totalCost: number;
  callOutcomes: { outcome: string; count: number; percentage: number }[];
  callVolumeData: { date: string; calls: number }[];
}

export default function Agency() {
  const [companyName, setCompanyName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();

  // Fetch companies
  const { data: companies = [], isLoading: companiesLoading, refetch: refetchCompanies } = useQuery<Company[]>({
    queryKey: ["/api/agency/companies"],
  });

  // Fetch metrics for all companies
  const { data: metrics = [], isLoading: metricsLoading } = useQuery<CompanyMetrics[]>({
    queryKey: ["/api/agency/metrics"],
    enabled: companies.length > 0,
  });

  // Add company mutation
  const addCompanyMutation = useMutation({
    mutationFn: async (data: { name: string; apiKey: string }) => {
      return apiRequest("/api/agency/companies", "POST", data);
    },
    onSuccess: () => {
      setCompanyName("");
      setApiKey("");
      queryClient.invalidateQueries({ queryKey: ["/api/agency/companies"] });
      toast({
        title: "Company Added",
        description: "Company has been successfully added to your agency.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Adding Company",
        description: error.message || "Failed to add company. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddCompany = () => {
    if (!companyName.trim() || !apiKey.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both company name and API key.",
        variant: "destructive",
      });
      return;
    }

    addCompanyMutation.mutate({
      name: companyName.trim(),
      apiKey: apiKey.trim(),
    });
  };

  const handleExport = async () => {
    try {
      const response = await fetch("/api/agency/export", {
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
      a.download = `agency-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "Your agency report has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export Failed", 
        description: "There was an error exporting your data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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
                <Link href="/agency" className="text-primary border-b-2 border-primary pb-4 px-1 text-sm font-medium flex items-center space-x-1">
                  <Building2 size={16} />
                  <span>Agency</span>
                </Link>
                <Link href="/reports" className="text-muted-foreground hover:text-foreground pb-4 px-1 text-sm font-medium transition-colors flex items-center space-x-1">
                  <FileText size={16} />
                  <span>Reports</span>
                </Link>
                <a href="#" className="text-muted-foreground hover:text-foreground pb-4 px-1 text-sm font-medium transition-colors">
                  Settings
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={handleExport} data-testid="button-export" className="bg-primary hover:bg-primary/90">
                <Download className="mr-2" size={16} />
                Export
              </Button>
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
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Agency Management</h1>
          <p className="text-muted-foreground">Manage your client companies and monitor their voice AI performance metrics.</p>
        </div>

        {/* Add Company Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="mr-2" size={20} />
              Add New Company
            </CardTitle>
            <CardDescription>
              Add a new client company to track their voice AI analytics and performance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  placeholder="Enter company name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  data-testid="input-company-name"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="api-key">Vapi API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Enter Vapi API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  data-testid="input-api-key"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleAddCompany}
                  disabled={addCompanyMutation.isPending}
                  data-testid="button-add-company"
                  className="bg-primary hover:bg-primary/90"
                >
                  {addCompanyMutation.isPending ? "Adding..." : "Add Company"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Companies Grid */}
        {companiesLoading ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground">Loading companies...</div>
          </div>
        ) : companies.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="mx-auto mb-4 text-muted-foreground" size={48} />
              <h3 className="text-lg font-semibold mb-2">No Companies Added</h3>
              <p className="text-muted-foreground">Add your first client company to start tracking their voice AI metrics.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {companies.map((company) => {
              const companyMetrics = metrics.find(m => m.companyId === company.id);
              
              return (
                <Card key={company.id} className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-foreground mb-1">{company.name}</h2>
                    <p className="text-sm text-muted-foreground">Added {new Date(company.createdAt).toLocaleDateString()}</p>
                  </div>

                  {metricsLoading ? (
                    <div className="text-center py-8">
                      <div className="text-muted-foreground">Loading metrics...</div>
                    </div>
                  ) : companyMetrics ? (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      {/* Total Calls */}
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Total Calls</p>
                              <p className="text-2xl font-bold text-foreground">{companyMetrics.totalCalls.toLocaleString()}</p>
                            </div>
                            <Phone className="text-primary" size={24} />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Total Cost */}
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Total Cost</p>
                              <p className="text-2xl font-bold text-foreground">${companyMetrics.totalCost.toFixed(2)}</p>
                            </div>
                            <DollarSign className="text-green-500" size={24} />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Call Outcomes */}
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-muted-foreground">Call Outcomes</p>
                            <PieChart className="text-blue-500" size={20} />
                          </div>
                          <ResponsiveContainer width="100%" height={80}>
                            <RechartsPieChart>
                              <Pie
                                data={companyMetrics.callOutcomes}
                                cx="50%"
                                cy="50%"
                                innerRadius={20}
                                outerRadius={35}
                                dataKey="count"
                              >
                                {companyMetrics.callOutcomes.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      {/* Call Volume Trend */}
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-muted-foreground">30-Day Trend</p>
                            <TrendingUp className="text-purple-500" size={20} />
                          </div>
                          <ResponsiveContainer width="100%" height={80}>
                            <LineChart data={companyMetrics.callVolumeData}>
                              <Line 
                                type="monotone" 
                                dataKey="calls" 
                                stroke="#8884d8" 
                                strokeWidth={2}
                                dot={false}
                              />
                              <XAxis dataKey="date" hide />
                              <YAxis hide />
                              <Tooltip />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-muted-foreground">No metrics available for this company</div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}