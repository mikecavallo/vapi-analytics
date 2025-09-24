import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  DollarSign,
  Users,
  Target,
  ExternalLink,
  Plus,
  Trash2,
  Calendar,
  ChevronRight,
  ChevronDown,
  Activity
} from "lucide-react";
import { format, subDays } from "date-fns";
import type { ProcessedFacebookAdsMetrics } from "@shared/schema";

interface FacebookAdsAccount {
  id: string;
  adAccountId: string;
  accountName: string;
  isActive: boolean;
  lastValidatedAt: string | null;
}

interface StatusResponse {
  connected: boolean;
  account?: {
    id: string;
    adAccountId: string;
    accountName: string;
    isActive: boolean;
    lastValidatedAt: string | null;
  };
  message?: string;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  created_time: string;
  adsets?: AdSet[];
  metrics?: ProcessedFacebookAdsMetrics;
}

interface AdSet {
  id: string;
  name: string;
  status: string;
  campaign_id: string;
  daily_budget: string;
  created_time: string;
  ads?: Ad[];
  metrics?: ProcessedFacebookAdsMetrics;
}

interface Ad {
  id: string;
  name: string;
  status: string;
  adset_id: string;
  creative: {
    id: string;
    name: string;
    title?: string;
    body?: string;
  };
  created_time: string;
  metrics?: ProcessedFacebookAdsMetrics;
}

interface CampaignHierarchy {
  campaigns: Campaign[];
  summary: {
    totalSpend: number;
    totalReach: number;
    totalImpressions: number;
    averageCPM: number;
    averageCTR: number;
    totalClicks: number;
  };
  dateRange: {
    since: string;
    until: string;
  };
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

const formatPercentage = (num: number): string => {
  return `${(num * 100).toFixed(2)}%`;
};

const MetricsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  formatter = (val) => val.toString(),
  color = "text-blue-600" 
}: {
  title: string;
  value: number;
  icon: any;
  formatter?: (val: number) => string;
  color?: string;
}) => (
  <Card>
    <CardContent className="flex items-center p-6">
      <div className={`rounded-lg p-3 ${color.replace('text-', 'bg-').replace('600', '100')} mr-4`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold">{formatter(value)}</p>
      </div>
    </CardContent>
  </Card>
);

const SetupForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [accessToken, setAccessToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const setupMutation = useMutation({
    mutationFn: async (data: { accessToken: string }) => {
      const response = await apiRequest("POST", "/api/facebook-ads/setup", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Facebook Ads account connected successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/facebook-ads/status"] });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect Facebook Ads account",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken.trim()) {
      toast({
        title: "Error",
        description: "Please enter your Facebook access token",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await setupMutation.mutateAsync({ accessToken: accessToken.trim() });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Connect Facebook Ads Account
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <AlertDescription>
            To connect your Facebook Ads account, you'll need a Facebook access token with ads_read permissions. 
            You can generate one from the Facebook Graph API Explorer or your app's developer console.
          </AlertDescription>
        </Alert>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="accessToken">Facebook Access Token</Label>
            <Input
              id="accessToken"
              type="password"
              placeholder="Enter your Facebook access token..."
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              data-testid="input-access-token"
              className="mt-1"
            />
          </div>
          
          <Button
            type="submit"
            disabled={isSubmitting || !accessToken.trim()}
            className="w-full"
            data-testid="button-connect-facebook"
          >
            {isSubmitting ? "Connecting..." : "Connect Facebook Ads"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const CampaignItem = ({ 
  campaign, 
  isExpanded, 
  onToggle,
  dateRange 
}: { 
  campaign: Campaign; 
  isExpanded: boolean; 
  onToggle: () => void;
  dateRange: { since: string; until: string };
}) => {
  const { data: adSets } = useQuery({
    queryKey: ["/api/facebook-ads/campaigns", campaign.id, "adsets"],
    enabled: isExpanded && !campaign.adsets,
  });

  const displayAdSets = campaign.adsets || (adSets as any)?.adSets || [];

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={onToggle}
        data-testid={`campaign-${campaign.id}`}
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
          <div>
            <h3 className="font-semibold">{campaign.name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Badge variant={campaign.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {campaign.status}
              </Badge>
              <span>•</span>
              <span>{campaign.objective}</span>
            </div>
          </div>
        </div>
        
        {campaign.metrics && (
          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <p className="font-semibold">{formatCurrency(campaign.metrics.amountSpent)}</p>
              <p className="text-gray-500">Spent</p>
            </div>
            <div className="text-center">
              <p className="font-semibold">{formatNumber(campaign.metrics.reach)}</p>
              <p className="text-gray-500">Reach</p>
            </div>
            <div className="text-center">
              <p className="font-semibold">{formatPercentage(campaign.metrics.uniqueCtr)}</p>
              <p className="text-gray-500">CTR</p>
            </div>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="ml-6 space-y-2">
          {displayAdSets.map((adSet: AdSet) => (
            <AdSetItem
              key={adSet.id}
              adSet={adSet}
              dateRange={dateRange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const AdSetItem = ({ 
  adSet, 
  dateRange 
}: { 
  adSet: AdSet; 
  dateRange: { since: string; until: string };
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { data: ads } = useQuery({
    queryKey: ["/api/facebook-ads/adsets", adSet.id, "ads"],
    enabled: isExpanded && !adSet.ads,
  });

  const displayAds = adSet.ads || (ads as any)?.ads || [];

  return (
    <div className="border-l-2 border-blue-200 pl-4 py-2">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        data-testid={`adset-${adSet.id}`}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-3 w-3 text-gray-400" />
          ) : (
            <ChevronRight className="h-3 w-3 text-gray-400" />
          )}
          <div>
            <h4 className="font-medium text-sm">{adSet.name}</h4>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Badge variant={adSet.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {adSet.status}
              </Badge>
              <span>Budget: ${adSet.daily_budget || 'N/A'}</span>
            </div>
          </div>
        </div>
        
        {adSet.metrics && (
          <div className="flex items-center gap-3 text-xs">
            <span>{formatCurrency(adSet.metrics.amountSpent)}</span>
            <span>{formatNumber(adSet.metrics.impressions)} imp</span>
            <span>{formatPercentage(adSet.metrics.uniqueCtr)} CTR</span>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="ml-4 mt-2 space-y-1">
          {displayAds.map((ad: Ad) => (
            <div 
              key={ad.id}
              className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded text-xs"
              data-testid={`ad-${ad.id}`}
            >
              <div>
                <p className="font-medium">{ad.name}</p>
                <p className="text-gray-500">{ad.creative?.title || 'No title'}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={ad.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {ad.status}
                </Badge>
                {ad.metrics && (
                  <span>{formatCurrency(ad.metrics.amountSpent)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function FacebookAdsPage() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [dateRange, setDateRange] = useState({
    since: format(new Date(), 'yyyy-MM-dd'), // Today
    until: format(new Date(), 'yyyy-MM-dd'), // Today
  });
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(new Set());

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check Facebook Ads account status
  const { data: statusData, isLoading: statusLoading } = useQuery<StatusResponse>({
    queryKey: ["/api/facebook-ads/status"],
  });

  // Fetch campaign hierarchy data
  const { data: hierarchyData, isLoading: hierarchyLoading, error: hierarchyError } = useQuery<CampaignHierarchy>({
    queryKey: ["/api/facebook-ads/hierarchy", dateRange.since, dateRange.until],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/facebook-ads/hierarchy?since=${dateRange.since}&until=${dateRange.until}`);
      return response.json();
    },
    enabled: statusData?.connected && selectedTab === "overview",
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/facebook-ads/disconnect");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Facebook Ads account disconnected successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/facebook-ads/status"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to disconnect account",
        variant: "destructive",
      });
    },
  });

  const toggleCampaign = (campaignId: string) => {
    const newExpanded = new Set(expandedCampaigns);
    if (newExpanded.has(campaignId)) {
      newExpanded.delete(campaignId);
    } else {
      newExpanded.add(campaignId);
    }
    setExpandedCampaigns(newExpanded);
  };

  const handleSetupSuccess = () => {
    setSelectedTab("overview");
  };

  if (statusLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (!statusData?.connected) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Facebook Ads Analytics</h1>
        </div>
        <SetupForm onSuccess={handleSetupSuccess} />
      </div>
    );
  }

  const hierarchy = hierarchyData;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Facebook Ads Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Account: {statusData.account?.accountName} 
              <Badge variant="outline" className="ml-2">
                {statusData.account?.adAccountId}
              </Badge>
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => disconnectMutation.mutate()}
          disabled={disconnectMutation.isPending}
          data-testid="button-disconnect-facebook"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Disconnect
        </Button>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Calendar className="h-5 w-5 text-gray-500" />
            <div className="flex items-center gap-2">
              <Label htmlFor="since-date">From:</Label>
              <Input
                id="since-date"
                type="date"
                value={dateRange.since}
                onChange={(e) => setDateRange(prev => ({ ...prev, since: e.target.value }))}
                data-testid="input-date-since"
                className="w-auto"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="until-date">To:</Label>
              <Input
                id="until-date"
                type="date"
                value={dateRange.until}
                onChange={(e) => setDateRange(prev => ({ ...prev, until: e.target.value }))}
                data-testid="input-date-until"
                className="w-auto"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDateRange({
                since: format(new Date(), 'yyyy-MM-dd'),
                until: format(new Date(), 'yyyy-MM-dd'),
              })}
              data-testid="button-today"
            >
              Today
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns" data-testid="tab-campaigns">Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {hierarchyLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : hierarchyError ? (
            <Alert variant="destructive">
              <AlertDescription>
                Failed to load Facebook Ads data: {hierarchyError.message || 'Unknown error'}. Please check your Facebook access token and try again.
              </AlertDescription>
            </Alert>
          ) : hierarchy ? (
            <>
              {/* Summary Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricsCard
                  title="Total Spend"
                  value={hierarchy.summary.totalSpend}
                  icon={DollarSign}
                  formatter={formatCurrency}
                  color="text-green-600"
                />
                <MetricsCard
                  title="Total Reach"
                  value={hierarchy.summary.totalReach}
                  icon={Users}
                  formatter={formatNumber}
                  color="text-blue-600"
                />
                <MetricsCard
                  title="Impressions"
                  value={hierarchy.summary.totalImpressions}
                  icon={Eye}
                  formatter={formatNumber}
                  color="text-purple-600"
                />
                <MetricsCard
                  title="Average CTR"
                  value={hierarchy.summary.averageCTR}
                  icon={Target}
                  formatter={formatPercentage}
                  color="text-orange-600"
                />
              </div>

              {/* Campaign Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Campaign Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {hierarchy.campaigns.length > 0 ? (
                      hierarchy.campaigns.map((campaign) => (
                        <CampaignItem
                          key={campaign.id}
                          campaign={campaign}
                          isExpanded={expandedCampaigns.has(campaign.id)}
                          onToggle={() => toggleCampaign(campaign.id)}
                          dateRange={hierarchy.dateRange}
                        />
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-2">No campaigns found for the selected date range.</p>
                        <p className="text-sm text-gray-400">Try adjusting your date range or check your Facebook Ads account.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <div className="text-center py-12">
            <p className="text-gray-500">Campaign details view coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}