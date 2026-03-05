import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Trash2,
  Calendar,
  ChevronRight,
  ChevronDown,
  Activity,
  ArrowLeft,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Layers,
} from "lucide-react";
import { format, subDays } from "date-fns";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { ProcessedFacebookAdsMetrics } from "@shared/schema";
import { DashboardHeader } from "@/components/layout/dashboard-header";

// ---------- Types ----------

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

interface HierarchyResponse {
  campaigns: ProcessedFacebookAdsMetrics[];
  adSets: ProcessedFacebookAdsMetrics[];
  ads: ProcessedFacebookAdsMetrics[];
}

interface CampaignInfo {
  id: string;
  name: string;
  status: string;
  objective: string;
  created_time: string;
}

interface AdSetInfo {
  id: string;
  name: string;
  status: string;
  campaign_id: string;
  created_time: string;
}

interface DailyDataPoint {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  reach: number;
  cpm: number;
  cpc: number;
  ctr: number;
}

type SortField = "name" | "amountSpent" | "impressions" | "uniqueClicks" | "uniqueCtr" | "cpm" | "costPerUniqueClick" | "reach" | "results";
type SortDirection = "asc" | "desc";

// ---------- Utilities ----------

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("en-US").format(Math.round(num));
};

const formatPercentage = (num: number): string => {
  return `${num.toFixed(2)}%`;
};

const formatCompactNumber = (num: number): string => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toFixed(0);
};

// ---------- Sub-components ----------

const MetricsCard = ({
  title,
  value,
  icon: Icon,
  formatter = (val) => val.toString(),
  color = "text-blue-600",
}: {
  title: string;
  value: number;
  icon: any;
  formatter?: (val: number) => string;
  color?: string;
}) => (
  <Card>
    <CardContent className="flex items-center p-6">
      <div className={`rounded-lg p-3 ${color.replace("text-", "bg-").replace("600", "100")} dark:bg-opacity-20 mr-4`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">{formatter(value)}</p>
      </div>
    </CardContent>
  </Card>
);

const SetupForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [accessToken, setAccessToken] = useState("");
  const [appId, setAppId] = useState("");
  const [appSecret, setAppSecret] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const setupMutation = useMutation({
    mutationFn: async (data: { accessToken: string; appId?: string; appSecret?: string }) => {
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
      await setupMutation.mutateAsync({
        accessToken: accessToken.trim(),
        appId: appId.trim() || undefined,
        appSecret: appSecret.trim() || undefined,
      });
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
            To connect your Facebook Ads account, enter your App ID, App Secret, and Access Token. You can
            find these in your Facebook App's Settings &gt; Basic in the Meta Developer Console. The Access
            Token should have <code>ads_read</code> permissions.
          </AlertDescription>
        </Alert>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="appId">Facebook App ID</Label>
            <Input
              id="appId"
              type="text"
              placeholder="Enter your Facebook App ID..."
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              data-testid="input-app-id"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="appSecret">Facebook App Secret</Label>
            <Input
              id="appSecret"
              type="password"
              placeholder="Enter your Facebook App Secret..."
              value={appSecret}
              onChange={(e) => setAppSecret(e.target.value)}
              data-testid="input-app-secret"
              className="mt-1"
            />
          </div>
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

// ---------- Sortable Table Header ----------

const SortableHeader = ({
  label,
  field,
  currentSort,
  currentDirection,
  onSort,
  className = "",
}: {
  label: string;
  field: SortField;
  currentSort: SortField;
  currentDirection: SortDirection;
  onSort: (field: SortField) => void;
  className?: string;
}) => {
  const isActive = currentSort === field;
  return (
    <TableHead
      className={`cursor-pointer select-none hover:bg-muted/50 ${className}`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        {isActive ? (
          currentDirection === "asc" ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-40" />
        )}
      </div>
    </TableHead>
  );
};

// ---------- Daily Chart ----------

const DailyChart = ({
  objectId,
  level,
  dateRange,
}: {
  objectId: string;
  level: "campaign" | "adset" | "ad";
  dateRange: { since: string; until: string };
}) => {
  const [chartMetric, setChartMetric] = useState<"spend" | "impressions" | "clicks" | "ctr">("spend");

  const { data, isLoading, error } = useQuery<{ daily: DailyDataPoint[]; dateRange: { since: string; until: string } }>({
    queryKey: ["/api/facebook-ads/insights/daily", objectId, level, dateRange.since, dateRange.until],
    queryFn: async () => {
      const params = new URLSearchParams({
        objectId,
        level,
        since: dateRange.since,
        until: dateRange.until,
      });
      const response = await apiRequest("GET", `/api/facebook-ads/insights/daily?${params}`);
      return response.json();
    },
    enabled: !!objectId && !!dateRange.since,
  });

  const metricConfig: Record<string, { label: string; color: string; formatter: (v: number) => string }> = {
    spend: { label: "Daily Spend", color: "#22c55e", formatter: formatCurrency },
    impressions: { label: "Daily Impressions", color: "#8b5cf6", formatter: formatCompactNumber },
    clicks: { label: "Daily Clicks", color: "#3b82f6", formatter: formatNumber },
    ctr: { label: "Daily CTR (%)", color: "#f59e0b", formatter: (v) => `${v.toFixed(2)}%` },
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data?.daily?.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground text-center py-8">
            {error ? "Failed to load daily data." : "No daily data available for this date range."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const config = metricConfig[chartMetric];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5" />
            {config.label}
          </CardTitle>
          <div className="flex gap-1">
            {Object.entries(metricConfig).map(([key, cfg]) => (
              <Button
                key={key}
                variant={chartMetric === key ? "default" : "outline"}
                size="sm"
                className="text-xs h-7 px-2"
                onClick={() => setChartMetric(key as any)}
              >
                {cfg.label.replace("Daily ", "")}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          {chartMetric === "spend" ? (
            <BarChart data={data.daily}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => format(new Date(d + "T00:00:00"), "MMM d")}
                className="text-xs"
              />
              <YAxis tickFormatter={config.formatter} className="text-xs" />
              <RechartsTooltip
                labelFormatter={(d) => format(new Date(d + "T00:00:00"), "MMM d, yyyy")}
                formatter={(value: number) => [config.formatter(value), config.label]}
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Bar dataKey={chartMetric} fill={config.color} radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={data.daily}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => format(new Date(d + "T00:00:00"), "MMM d")}
                className="text-xs"
              />
              <YAxis tickFormatter={config.formatter} className="text-xs" />
              <RechartsTooltip
                labelFormatter={(d) => format(new Date(d + "T00:00:00"), "MMM d, yyyy")}
                formatter={(value: number) => [config.formatter(value), config.label]}
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Line type="monotone" dataKey={chartMetric} stroke={config.color} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// ---------- Ad Set Detail View ----------

const AdSetDetailView = ({
  adSet,
  adSetInfo,
  ads,
  dateRange,
  onBack,
}: {
  adSet: ProcessedFacebookAdsMetrics;
  adSetInfo?: AdSetInfo;
  ads: ProcessedFacebookAdsMetrics[];
  dateRange: { since: string; until: string };
  onBack: () => void;
}) => {
  const [sortField, setSortField] = useState<SortField>("amountSpent");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const sortedAds = useMemo(() => {
    return [...ads].sort((a, b) => {
      const aVal = sortField === "name" ? a.name : (a[sortField] as number);
      const bVal = sortField === "name" ? b.name : (b[sortField] as number);
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
  }, [ads, sortField, sortDir]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div>
          <h2 className="text-xl font-bold">{adSet.name}</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {adSetInfo && (
              <Badge variant={adSetInfo.status === "ACTIVE" ? "default" : "secondary"}>{adSetInfo.status}</Badge>
            )}
            <span>Ad Set</span>
          </div>
        </div>
      </div>

      {/* Metrics cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricsCard title="Spend" value={adSet.amountSpent} icon={DollarSign} formatter={formatCurrency} color="text-green-600" />
        <MetricsCard title="Impressions" value={adSet.impressions} icon={Eye} formatter={formatNumber} color="text-purple-600" />
        <MetricsCard title="Clicks" value={adSet.uniqueClicks} icon={MousePointer} formatter={formatNumber} color="text-blue-600" />
        <MetricsCard title="CTR" value={adSet.uniqueCtr} icon={Target} formatter={formatPercentage} color="text-orange-600" />
      </div>

      {/* Daily chart */}
      <DailyChart objectId={adSet.id} level="adset" dateRange={dateRange} />

      {/* Ads table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ads ({ads.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedAds.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHeader label="Ad Name" field="name" currentSort={sortField} currentDirection={sortDir} onSort={handleSort} />
                  <SortableHeader label="Spend" field="amountSpent" currentSort={sortField} currentDirection={sortDir} onSort={handleSort} className="text-right" />
                  <SortableHeader label="Impressions" field="impressions" currentSort={sortField} currentDirection={sortDir} onSort={handleSort} className="text-right" />
                  <SortableHeader label="Clicks" field="uniqueClicks" currentSort={sortField} currentDirection={sortDir} onSort={handleSort} className="text-right" />
                  <SortableHeader label="CTR" field="uniqueCtr" currentSort={sortField} currentDirection={sortDir} onSort={handleSort} className="text-right" />
                  <SortableHeader label="CPC" field="costPerUniqueClick" currentSort={sortField} currentDirection={sortDir} onSort={handleSort} className="text-right" />
                  <SortableHeader label="CPM" field="cpm" currentSort={sortField} currentDirection={sortDir} onSort={handleSort} className="text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAds.map((ad) => (
                  <TableRow key={ad.id}>
                    <TableCell className="font-medium">{ad.name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(ad.amountSpent)}</TableCell>
                    <TableCell className="text-right">{formatNumber(ad.impressions)}</TableCell>
                    <TableCell className="text-right">{formatNumber(ad.uniqueClicks)}</TableCell>
                    <TableCell className="text-right">{formatPercentage(ad.uniqueCtr)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(ad.costPerUniqueClick)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(ad.cpm)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">No ads found for this ad set in the selected date range.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ---------- Campaign Detail View ----------

const CampaignDetailView = ({
  campaign,
  campaignInfo,
  adSets,
  ads,
  dateRange,
  onBack,
}: {
  campaign: ProcessedFacebookAdsMetrics;
  campaignInfo?: CampaignInfo;
  adSets: ProcessedFacebookAdsMetrics[];
  ads: ProcessedFacebookAdsMetrics[];
  dateRange: { since: string; until: string };
  onBack: () => void;
}) => {
  const [selectedAdSet, setSelectedAdSet] = useState<ProcessedFacebookAdsMetrics | null>(null);
  const [sortField, setSortField] = useState<SortField>("amountSpent");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  // Fetch ad set info (status, etc.) from the campaigns endpoint
  const { data: adSetInfoData } = useQuery<{ adSets: AdSetInfo[] }>({
    queryKey: ["/api/facebook-ads/campaigns", campaign.id, "adsets"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/facebook-ads/campaigns/${campaign.id}/adsets`);
      return response.json();
    },
  });

  const adSetInfoMap = useMemo(() => {
    const map = new Map<string, AdSetInfo>();
    adSetInfoData?.adSets?.forEach((as) => map.set(as.id, as));
    return map;
  }, [adSetInfoData]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const sortedAdSets = useMemo(() => {
    return [...adSets].sort((a, b) => {
      const aVal = sortField === "name" ? a.name : (a[sortField] as number);
      const bVal = sortField === "name" ? b.name : (b[sortField] as number);
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
  }, [adSets, sortField, sortDir]);

  // If an ad set is selected, show ad set detail
  if (selectedAdSet) {
    const adSetAds = ads.filter((ad) => ad.parentId === selectedAdSet.id);
    return (
      <AdSetDetailView
        adSet={selectedAdSet}
        adSetInfo={adSetInfoMap.get(selectedAdSet.id)}
        ads={adSetAds}
        dateRange={dateRange}
        onBack={() => setSelectedAdSet(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Campaigns
        </Button>
        <div>
          <h2 className="text-xl font-bold">{campaign.name}</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {campaignInfo && (
              <>
                <Badge variant={campaignInfo.status === "ACTIVE" ? "default" : "secondary"}>{campaignInfo.status}</Badge>
                <span>{campaignInfo.objective}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Metrics cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
        <MetricsCard title="Spend" value={campaign.amountSpent} icon={DollarSign} formatter={formatCurrency} color="text-green-600" />
        <MetricsCard title="Impressions" value={campaign.impressions} icon={Eye} formatter={formatNumber} color="text-purple-600" />
        <MetricsCard title="Clicks" value={campaign.uniqueClicks} icon={MousePointer} formatter={formatNumber} color="text-blue-600" />
        <MetricsCard title="Conversions" value={campaign.results} icon={Target} formatter={formatNumber} color="text-emerald-600" />
        <MetricsCard title="CTR" value={campaign.uniqueCtr} icon={TrendingUp} formatter={formatPercentage} color="text-orange-600" />
        <MetricsCard title="CPC" value={campaign.costPerUniqueClick} icon={DollarSign} formatter={formatCurrency} color="text-cyan-600" />
        <MetricsCard title="CPM" value={campaign.cpm} icon={DollarSign} formatter={formatCurrency} color="text-indigo-600" />
      </div>

      {/* Daily chart */}
      <DailyChart objectId={campaign.id} level="campaign" dateRange={dateRange} />

      {/* Ad Sets table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Layers className="h-5 w-5" />
            Ad Sets ({adSets.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedAdSets.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHeader label="Ad Set Name" field="name" currentSort={sortField} currentDirection={sortDir} onSort={handleSort} />
                  <TableHead className="text-center">Status</TableHead>
                  <SortableHeader label="Spend" field="amountSpent" currentSort={sortField} currentDirection={sortDir} onSort={handleSort} className="text-right" />
                  <SortableHeader label="Impressions" field="impressions" currentSort={sortField} currentDirection={sortDir} onSort={handleSort} className="text-right" />
                  <SortableHeader label="Clicks" field="uniqueClicks" currentSort={sortField} currentDirection={sortDir} onSort={handleSort} className="text-right" />
                  <SortableHeader label="CTR" field="uniqueCtr" currentSort={sortField} currentDirection={sortDir} onSort={handleSort} className="text-right" />
                  <SortableHeader label="CPC" field="costPerUniqueClick" currentSort={sortField} currentDirection={sortDir} onSort={handleSort} className="text-right" />
                  <SortableHeader label="CPM" field="cpm" currentSort={sortField} currentDirection={sortDir} onSort={handleSort} className="text-right" />
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAdSets.map((adSet) => {
                  const info = adSetInfoMap.get(adSet.id);
                  return (
                    <TableRow
                      key={adSet.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedAdSet(adSet)}
                    >
                      <TableCell className="font-medium">{adSet.name}</TableCell>
                      <TableCell className="text-center">
                        {info ? (
                          <Badge variant={info.status === "ACTIVE" ? "default" : "secondary"}>{info.status}</Badge>
                        ) : (
                          <span className="text-muted-foreground">--</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(adSet.amountSpent)}</TableCell>
                      <TableCell className="text-right">{formatNumber(adSet.impressions)}</TableCell>
                      <TableCell className="text-right">{formatNumber(adSet.uniqueClicks)}</TableCell>
                      <TableCell className="text-right">{formatPercentage(adSet.uniqueCtr)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(adSet.costPerUniqueClick)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(adSet.cpm)}</TableCell>
                      <TableCell>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">No ad sets found for this campaign in the selected date range.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ---------- Campaign List View ----------

const CampaignListView = ({
  campaigns,
  campaignInfoMap,
  adSets,
  ads,
  dateRange,
}: {
  campaigns: ProcessedFacebookAdsMetrics[];
  campaignInfoMap: Map<string, CampaignInfo>;
  adSets: ProcessedFacebookAdsMetrics[];
  ads: ProcessedFacebookAdsMetrics[];
  dateRange: { since: string; until: string };
}) => {
  const [selectedCampaign, setSelectedCampaign] = useState<ProcessedFacebookAdsMetrics | null>(null);
  const [sortField, setSortField] = useState<SortField>("amountSpent");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const sortedCampaigns = useMemo(() => {
    return [...campaigns].sort((a, b) => {
      const aVal = sortField === "name" ? a.name : (a[sortField] as number);
      const bVal = sortField === "name" ? b.name : (b[sortField] as number);
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
  }, [campaigns, sortField, sortDir]);

  // If a campaign is selected, show detail view
  if (selectedCampaign) {
    const campaignAdSets = adSets.filter((as) => as.parentId === selectedCampaign.id);
    return (
      <CampaignDetailView
        campaign={selectedCampaign}
        campaignInfo={campaignInfoMap.get(selectedCampaign.id)}
        adSets={campaignAdSets}
        ads={ads}
        dateRange={dateRange}
        onBack={() => setSelectedCampaign(null)}
      />
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-2">No campaigns found for the selected date range.</p>
        <p className="text-sm text-muted-foreground">Try adjusting your date range or check your Facebook Ads account.</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-5 w-5" />
          Campaigns ({campaigns.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader label="Campaign" field="name" currentSort={sortField} currentDirection={sortDir} onSort={handleSort} />
              <TableHead className="text-center">Status</TableHead>
              <SortableHeader label="Spend" field="amountSpent" currentSort={sortField} currentDirection={sortDir} onSort={handleSort} className="text-right" />
              <SortableHeader label="Impressions" field="impressions" currentSort={sortField} currentDirection={sortDir} onSort={handleSort} className="text-right" />
              <SortableHeader label="Clicks" field="uniqueClicks" currentSort={sortField} currentDirection={sortDir} onSort={handleSort} className="text-right" />
              <SortableHeader label="CTR" field="uniqueCtr" currentSort={sortField} currentDirection={sortDir} onSort={handleSort} className="text-right" />
              <SortableHeader label="CPC" field="costPerUniqueClick" currentSort={sortField} currentDirection={sortDir} onSort={handleSort} className="text-right" />
              <SortableHeader label="CPM" field="cpm" currentSort={sortField} currentDirection={sortDir} onSort={handleSort} className="text-right" />
              <SortableHeader label="Reach" field="reach" currentSort={sortField} currentDirection={sortDir} onSort={handleSort} className="text-right" />
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCampaigns.map((campaign) => {
              const info = campaignInfoMap.get(campaign.id);
              return (
                <TableRow
                  key={campaign.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedCampaign(campaign)}
                  data-testid={`campaign-row-${campaign.id}`}
                >
                  <TableCell>
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      {info?.objective && (
                        <p className="text-xs text-muted-foreground">{info.objective}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {info ? (
                      <Badge variant={info.status === "ACTIVE" ? "default" : "secondary"}>{info.status}</Badge>
                    ) : (
                      <span className="text-muted-foreground">--</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(campaign.amountSpent)}</TableCell>
                  <TableCell className="text-right">{formatNumber(campaign.impressions)}</TableCell>
                  <TableCell className="text-right">{formatNumber(campaign.uniqueClicks)}</TableCell>
                  <TableCell className="text-right">{formatPercentage(campaign.uniqueCtr)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(campaign.costPerUniqueClick)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(campaign.cpm)}</TableCell>
                  <TableCell className="text-right">{formatNumber(campaign.reach)}</TableCell>
                  <TableCell>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

// ---------- Overview Tab (expanded accordion view, kept from original) ----------

const OverviewCampaignItem = ({
  campaign,
  isExpanded,
  onToggle,
  adSets,
  ads,
}: {
  campaign: ProcessedFacebookAdsMetrics;
  isExpanded: boolean;
  onToggle: () => void;
  adSets: ProcessedFacebookAdsMetrics[];
  ads: ProcessedFacebookAdsMetrics[];
}) => {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={onToggle}
        data-testid={`campaign-${campaign.id}`}
      >
        <div className="flex items-center gap-3">
          {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          <div>
            <h3 className="font-semibold">{campaign.name}</h3>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="text-center">
            <p className="font-semibold">{formatCurrency(campaign.amountSpent)}</p>
            <p className="text-muted-foreground text-xs">Spent</p>
          </div>
          <div className="text-center">
            <p className="font-semibold">{formatNumber(campaign.reach)}</p>
            <p className="text-muted-foreground text-xs">Reach</p>
          </div>
          <div className="text-center">
            <p className="font-semibold">{formatPercentage(campaign.uniqueCtr)}</p>
            <p className="text-muted-foreground text-xs">CTR</p>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="ml-6 space-y-2">
          {adSets.map((adSet) => {
            const adSetAds = ads.filter((ad) => ad.parentId === adSet.id);
            return (
              <OverviewAdSetItem key={adSet.id} adSet={adSet} ads={adSetAds} />
            );
          })}
          {adSets.length === 0 && (
            <p className="text-sm text-muted-foreground py-2">No ad sets with data in this date range.</p>
          )}
        </div>
      )}
    </div>
  );
};

const OverviewAdSetItem = ({
  adSet,
  ads,
}: {
  adSet: ProcessedFacebookAdsMetrics;
  ads: ProcessedFacebookAdsMetrics[];
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border-l-2 border-blue-200 dark:border-blue-800 pl-4 py-2">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        data-testid={`adset-${adSet.id}`}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
          <h4 className="font-medium text-sm">{adSet.name}</h4>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span>{formatCurrency(adSet.amountSpent)}</span>
          <span>{formatNumber(adSet.impressions)} imp</span>
          <span>{formatPercentage(adSet.uniqueCtr)} CTR</span>
        </div>
      </div>

      {isExpanded && (
        <div className="ml-4 mt-2 space-y-1">
          {ads.map((ad) => (
            <div
              key={ad.id}
              className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded text-xs"
              data-testid={`ad-${ad.id}`}
            >
              <p className="font-medium">{ad.name}</p>
              <div className="flex items-center gap-3">
                <span>{formatCurrency(ad.amountSpent)}</span>
                <span>{formatNumber(ad.impressions)} imp</span>
                <span>{formatPercentage(ad.uniqueCtr)} CTR</span>
              </div>
            </div>
          ))}
          {ads.length === 0 && (
            <p className="text-xs text-muted-foreground py-1">No ads with data.</p>
          )}
        </div>
      )}
    </div>
  );
};

// ---------- Main Page ----------

export default function FacebookAdsPage() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [dateRange, setDateRange] = useState({
    since: format(subDays(new Date(), 7), "yyyy-MM-dd"),
    until: format(new Date(), "yyyy-MM-dd"),
  });
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(new Set());

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check Facebook Ads account status
  const { data: statusData, isLoading: statusLoading } = useQuery<StatusResponse>({
    queryKey: ["/api/facebook-ads/status"],
  });

  // Fetch campaign hierarchy data (metrics for all levels)
  const { data: hierarchyData, isLoading: hierarchyLoading, error: hierarchyError } = useQuery<HierarchyResponse>({
    queryKey: ["/api/facebook-ads/hierarchy", dateRange.since, dateRange.until],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/facebook-ads/hierarchy?since=${dateRange.since}&until=${dateRange.until}`);
      return response.json();
    },
    enabled: !!statusData?.connected,
  });

  // Fetch campaign info (status, objective) separately
  const { data: campaignsInfoData } = useQuery<{ campaigns: CampaignInfo[] }>({
    queryKey: ["/api/facebook-ads/campaigns"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/facebook-ads/campaigns");
      return response.json();
    },
    enabled: !!statusData?.connected,
  });

  const campaignInfoMap = useMemo(() => {
    const map = new Map<string, CampaignInfo>();
    campaignsInfoData?.campaigns?.forEach((c) => map.set(c.id, c));
    return map;
  }, [campaignsInfoData]);

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/facebook-ads/disconnect");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Facebook Ads account disconnected successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/facebook-ads/status"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to disconnect account", variant: "destructive" });
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

  // Compute summary from hierarchy data
  const summary = useMemo(() => {
    if (!hierarchyData?.campaigns?.length) return null;
    const campaigns = hierarchyData.campaigns;
    const totalSpend = campaigns.reduce((s, c) => s + c.amountSpent, 0);
    const totalReach = campaigns.reduce((s, c) => s + c.reach, 0);
    const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0);
    const totalClicks = campaigns.reduce((s, c) => s + c.uniqueClicks, 0);
    const avgCTR = campaigns.length > 0 ? campaigns.reduce((s, c) => s + c.uniqueCtr, 0) / campaigns.length : 0;
    return { totalSpend, totalReach, totalImpressions, totalClicks, avgCTR };
  }, [hierarchyData]);

  // --- Loading state ---
  if (statusLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  // --- Not connected ---
  if (!statusData?.connected) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="container mx-auto p-6">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Facebook Ads Analytics</h1>
          </div>
          <SetupForm onSuccess={handleSetupSuccess} />
        </div>
      </div>
    );
  }

  // --- Connected ---
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">Facebook Ads Analytics</h1>
              <p className="text-muted-foreground">
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
            <div className="flex items-center gap-4 flex-wrap">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <Label htmlFor="since-date">From:</Label>
                <Input
                  id="since-date"
                  type="date"
                  value={dateRange.since}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, since: e.target.value }))}
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
                  onChange={(e) => setDateRange((prev) => ({ ...prev, until: e.target.value }))}
                  data-testid="input-date-until"
                  className="w-auto"
                />
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setDateRange({
                      since: format(new Date(), "yyyy-MM-dd"),
                      until: format(new Date(), "yyyy-MM-dd"),
                    })
                  }
                  data-testid="button-today"
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setDateRange({
                      since: format(subDays(new Date(), 7), "yyyy-MM-dd"),
                      until: format(new Date(), "yyyy-MM-dd"),
                    })
                  }
                >
                  Last 7 Days
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setDateRange({
                      since: format(subDays(new Date(), 30), "yyyy-MM-dd"),
                      until: format(new Date(), "yyyy-MM-dd"),
                    })
                  }
                >
                  Last 30 Days
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="overview" data-testid="tab-overview">
              Overview
            </TabsTrigger>
            <TabsTrigger value="campaigns" data-testid="tab-campaigns">
              Campaigns
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
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
                  Failed to load Facebook Ads data: {(hierarchyError as Error).message || "Unknown error"}. Please check
                  your Facebook access token and try again.
                </AlertDescription>
              </Alert>
            ) : hierarchyData && summary ? (
              <>
                {/* Summary Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <MetricsCard
                    title="Total Spend"
                    value={summary.totalSpend}
                    icon={DollarSign}
                    formatter={formatCurrency}
                    color="text-green-600"
                  />
                  <MetricsCard
                    title="Total Reach"
                    value={summary.totalReach}
                    icon={Users}
                    formatter={formatNumber}
                    color="text-blue-600"
                  />
                  <MetricsCard
                    title="Impressions"
                    value={summary.totalImpressions}
                    icon={Eye}
                    formatter={formatNumber}
                    color="text-purple-600"
                  />
                  <MetricsCard
                    title="Average CTR"
                    value={summary.avgCTR}
                    icon={Target}
                    formatter={formatPercentage}
                    color="text-orange-600"
                  />
                </div>

                {/* Campaign Overview (accordion) */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Campaign Performance Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {hierarchyData.campaigns.length > 0 ? (
                        hierarchyData.campaigns.map((campaign) => {
                          const campaignAdSets = (hierarchyData.adSets || []).filter(
                            (as) => as.parentId === campaign.id
                          );
                          const campaignAds = (hierarchyData.ads || []).filter(
                            (ad) => campaignAdSets.some((as) => as.id === ad.parentId)
                          );
                          return (
                            <OverviewCampaignItem
                              key={campaign.id}
                              campaign={campaign}
                              isExpanded={expandedCampaigns.has(campaign.id)}
                              onToggle={() => toggleCampaign(campaign.id)}
                              adSets={campaignAdSets}
                              ads={campaignAds}
                            />
                          );
                        })
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground mb-2">No campaigns found for the selected date range.</p>
                          <p className="text-sm text-muted-foreground">
                            Try adjusting your date range or check your Facebook Ads account.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No data available. Select a date range to view campaign metrics.</p>
              </div>
            )}
          </TabsContent>

          {/* CAMPAIGNS TAB */}
          <TabsContent value="campaigns" className="space-y-6">
            {hierarchyLoading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : hierarchyError ? (
              <Alert variant="destructive">
                <AlertDescription>
                  Failed to load campaigns: {(hierarchyError as Error).message || "Unknown error"}.
                </AlertDescription>
              </Alert>
            ) : hierarchyData ? (
              <CampaignListView
                campaigns={hierarchyData.campaigns || []}
                campaignInfoMap={campaignInfoMap}
                adSets={hierarchyData.adSets || []}
                ads={hierarchyData.ads || []}
                dateRange={dateRange}
              />
            ) : null}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
