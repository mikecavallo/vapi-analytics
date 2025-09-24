import { 
  type FacebookAdsInsights, 
  type FacebookAdsMetrics, 
  type ProcessedFacebookAdsMetrics,
  facebookAdsInsightsSchema,
} from '@shared/schema';
import { generateAppSecretProof, validateAccessTokenFormat } from '../utils/encryption';

interface PaginatedResponse<T> {
  data: T[];
  paging?: {
    cursors?: {
      before?: string;
      after?: string;
    };
    next?: string;
    previous?: string;
  };
}

interface FacebookApiError {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id?: string;
  };
}

export class FacebookAdsService {
  private baseUrl: string;

  constructor() {
    // Make API version configurable via environment variable
    const apiVersion = process.env.FACEBOOK_API_VERSION || 'v23.0';
    this.baseUrl = `https://graph.facebook.com/${apiVersion}`;
  }

  /**
   * Creates a secure URL with access token and app secret proof
   */
  private createSecureUrl(endpoint: string, accessToken: string, params: Record<string, string> = {}): string {
    const urlParams = new URLSearchParams({
      access_token: accessToken,
      appsecret_proof: generateAppSecretProof(accessToken),
      ...params,
    });
    
    return `${this.baseUrl}${endpoint}?${urlParams.toString()}`;
  }

  /**
   * Handles Facebook API responses and errors
   */
  private async handleApiResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData: FacebookApiError = await response.json();
        if (errorData.error) {
          errorMessage = `Facebook API Error: ${errorData.error.message} (Code: ${errorData.error.code})`;
          if (errorData.error.error_subcode) {
            errorMessage += ` Subcode: ${errorData.error.error_subcode}`;
          }
        }
      } catch {
        // If we can't parse the error response, use the HTTP status
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Fetches all pages of a paginated response
   */
  private async fetchAllPages<T>(
    initialUrl: string,
    accessToken: string,
    maxPages: number = 10
  ): Promise<T[]> {
    const allData: T[] = [];
    let currentUrl = initialUrl;
    let pageCount = 0;

    while (currentUrl && pageCount < maxPages) {
      const response = await fetch(currentUrl);
      const data: PaginatedResponse<T> = await this.handleApiResponse(response);
      
      allData.push(...data.data);
      
      // Check if there's a next page
      currentUrl = data.paging?.next || '';
      pageCount++;
    }

    return allData;
  }

  /**
   * Validates a Facebook access token and returns ad account info
   */
  async validateAccessToken(accessToken: string): Promise<{ 
    isValid: boolean; 
    adAccountId?: string; 
    accountName?: string;
    error?: string;
    accounts?: Array<{ id: string; name: string; status: number }>;
  }> {
    try {
      // Basic format validation
      if (!validateAccessTokenFormat(accessToken)) {
        return { 
          isValid: false, 
          error: 'Invalid access token format' 
        };
      }

      const url = this.createSecureUrl('/me/adaccounts', accessToken, {
        fields: 'id,name,account_status,account_id,business'
      });
      
      const response = await fetch(url);
      const data: PaginatedResponse<any> = await this.handleApiResponse(response);
      const adAccounts = data.data || [];

      if (adAccounts.length === 0) {
        return { 
          isValid: false, 
          error: 'No ad accounts found for this access token' 
        };
      }

      // Return all accounts for user selection, but default to first active one
      const activeAccounts = adAccounts.filter((account: any) => account.account_status === 1);
      const accounts = adAccounts.map((account: any) => ({
        id: account.id,
        name: account.name,
        status: account.account_status,
      }));

      if (activeAccounts.length === 0) {
        return { 
          isValid: false, 
          error: 'No active ad accounts found',
          accounts 
        };
      }

      const defaultAccount = activeAccounts[0];
      return {
        isValid: true,
        adAccountId: defaultAccount.id,
        accountName: defaultAccount.name,
        accounts,
      };
    } catch (error) {
      console.error('Facebook access token validation error:', error);
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : 'Unknown validation error' 
      };
    }
  }

  /**
   * Fetch campaigns for an ad account with pagination
   */
  async getCampaigns(accessToken: string, adAccountId: string): Promise<any[]> {
    try {
      const params = {
        fields: 'id,name,status,objective,created_time,updated_time',
        effective_status: JSON.stringify(['ACTIVE', 'PAUSED']),
        limit: '100', // Increase limit to reduce API calls
      };

      const initialUrl = this.createSecureUrl(`/${adAccountId}/campaigns`, accessToken, params);
      const campaigns = await this.fetchAllPages(initialUrl, accessToken);

      // Validate the campaigns data structure
      return campaigns.filter((campaign: any) => 
        campaign && 
        typeof campaign.id === 'string' && 
        typeof campaign.name === 'string'
      );
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw new Error(`Failed to fetch campaigns: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch ad sets for a campaign with pagination
   */
  async getAdSets(accessToken: string, campaignId: string): Promise<any[]> {
    try {
      const params = {
        fields: 'id,name,status,campaign_id,created_time,updated_time',
        effective_status: JSON.stringify(['ACTIVE', 'PAUSED']),
        limit: '100',
      };

      const initialUrl = this.createSecureUrl(`/${campaignId}/adsets`, accessToken, params);
      const adSets = await this.fetchAllPages(initialUrl, accessToken);

      // Validate the ad sets data structure
      return adSets.filter((adSet: any) => 
        adSet && 
        typeof adSet.id === 'string' && 
        typeof adSet.name === 'string'
      );
    } catch (error) {
      console.error('Error fetching ad sets:', error);
      throw new Error(`Failed to fetch ad sets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch ads for an ad set with pagination
   */
  async getAds(accessToken: string, adSetId: string): Promise<any[]> {
    try {
      const params = {
        fields: 'id,name,status,adset_id,campaign_id,created_time,updated_time',
        effective_status: JSON.stringify(['ACTIVE', 'PAUSED']),
        limit: '100',
      };

      const initialUrl = this.createSecureUrl(`/${adSetId}/ads`, accessToken, params);
      const ads = await this.fetchAllPages(initialUrl, accessToken);

      // Validate the ads data structure
      return ads.filter((ad: any) => 
        ad && 
        typeof ad.id === 'string' && 
        typeof ad.name === 'string'
      );
    } catch (error) {
      console.error('Error fetching ads:', error);
      throw new Error(`Failed to fetch ads: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch insights (metrics) for campaigns, ad sets, or ads with proper validation
   */
  async getInsights(
    accessToken: string, 
    objectId: string, 
    level: 'campaign' | 'adset' | 'ad',
    dateRange: { since: string; until: string },
    breakdown?: string[]
  ): Promise<FacebookAdsMetrics> {
    try {
      const fields = [
        'impressions',
        'reach',
        'clicks',
        'unique_clicks',
        'spend',
        'cpm',
        'cpc',
        'ctr',
        'unique_ctr',
        'unique_link_clicks_ctr',
        'outbound_clicks',
        'outbound_clicks_ctr',
        'unique_outbound_clicks',
        'unique_outbound_clicks_ctr',
        'actions',
        'cost_per_action_type',
        'action_values',
      ];

      // Add level-specific fields
      if (level === 'campaign') {
        fields.push('campaign_id', 'campaign_name');
      } else if (level === 'adset') {
        fields.push('adset_id', 'adset_name', 'campaign_id', 'campaign_name');
      } else if (level === 'ad') {
        fields.push('ad_id', 'ad_name', 'adset_id', 'adset_name', 'campaign_id', 'campaign_name');
      }

      const params: Record<string, string> = {
        fields: fields.join(','),
        level,
        time_range: JSON.stringify({
          since: dateRange.since,
          until: dateRange.until,
        }),
        limit: '100',
      };

      // Add breakdown if specified
      if (breakdown && breakdown.length > 0) {
        params.breakdowns = breakdown.join(',');
      }

      const initialUrl = this.createSecureUrl(`/${objectId}/insights`, accessToken, params);
      const insights = await this.fetchAllPages(initialUrl, accessToken);

      // Validate and transform the response using Zod
      const validatedData = insights.map((insight: any) => {
        try {
          return facebookAdsInsightsSchema.parse(insight);
        } catch (error) {
          console.warn('Invalid insight data:', insight, error);
          return null;
        }
      }).filter((insight): insight is FacebookAdsInsights => insight !== null);

      return {
        adAccountId: objectId,
        level,
        data: validatedData,
        dateRange,
      };
    } catch (error) {
      console.error('Error fetching insights:', error);
      throw new Error(`Failed to fetch insights: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process raw Facebook Ads insights into metrics for the frontend
   */
  processInsights(insights: FacebookAdsInsights[]): ProcessedFacebookAdsMetrics[] {
    return insights.map(insight => {
      // Helper function to safely parse numeric values
      const safeParseFloat = (value?: string): number => {
        return value ? Number(value) || 0 : 0;
      };

      // Extract actions and costs
      const actions = insight.actions || [];
      const costs = insight.cost_per_action_type || [];
      const values = insight.action_values || [];

      // Find specific action types
      const getLinkClicks = () => {
        const linkClickAction = actions.find(action => action.action_type === 'link_click');
        return safeParseFloat(linkClickAction?.value);
      };

      const getOutboundClicks = () => {
        const outboundAction = actions.find(action => action.action_type === 'outbound_click');
        return safeParseFloat(outboundAction?.value);
      };

      const getResults = () => {
        // Results can be conversions, leads, purchases, etc.
        const resultActions = actions.filter(action => 
          ['post_engagement', 'page_engagement', 'lead', 'purchase', 'conversion'].includes(action.action_type)
        );
        return resultActions.reduce((sum, action) => sum + safeParseFloat(action.value), 0);
      };

      const getCostPerResult = () => {
        const results = getResults();
        const spend = safeParseFloat(insight.spend);
        return results > 0 ? spend / results : 0;
      };

      const getRoas = () => {
        // Calculate ROAS from action_values (revenue)
        const revenue = values.reduce((sum, value) => sum + safeParseFloat(value.value), 0);
        const spend = safeParseFloat(insight.spend);
        return spend > 0 ? revenue / spend : 0;
      };

      // Determine ID and name based on level
      let id = '';
      let name = '';
      let parentId = '';
      let level: 'campaign' | 'adset' | 'ad' = 'campaign';

      if (insight.ad_id) {
        id = insight.ad_id;
        name = insight.ad_name || 'Unnamed Ad';
        parentId = insight.adset_id || '';
        level = 'ad';
      } else if (insight.adset_id) {
        id = insight.adset_id;
        name = insight.adset_name || 'Unnamed Ad Set';
        parentId = insight.campaign_id || '';
        level = 'adset';
      } else if (insight.campaign_id) {
        id = insight.campaign_id;
        name = insight.campaign_name || 'Unnamed Campaign';
        level = 'campaign';
      }

      const uniqueClicks = safeParseFloat(insight.unique_clicks);
      const spend = safeParseFloat(insight.spend);
      const linkClicks = getLinkClicks();
      const outboundClicks = getOutboundClicks();
      const results = getResults();

      return {
        id,
        name,
        level,
        parentId: parentId || undefined,
        amountSpent: spend,
        reach: safeParseFloat(insight.reach),
        impressions: safeParseFloat(insight.impressions),
        cpm: safeParseFloat(insight.cpm),
        uniqueClicks,
        costPerUniqueClick: uniqueClicks > 0 ? spend / uniqueClicks : 0,
        uniqueCtr: safeParseFloat(insight.unique_ctr),
        uniqueLinkClicks: linkClicks,
        costPerUniqueLinkClick: linkClicks > 0 ? spend / linkClicks : 0,
        uniqueLinkClicksCtr: safeParseFloat(insight.unique_link_clicks_ctr),
        uniqueOutboundClicks: outboundClicks,
        costPerUniqueOutboundClick: outboundClicks > 0 ? spend / outboundClicks : 0,
        outboundCtr: safeParseFloat(insight.outbound_clicks_ctr),
        results,
        costPerResult: getCostPerResult(),
        resultRate: safeParseFloat(insight.impressions) > 0 ? (results / safeParseFloat(insight.impressions)) * 100 : 0,
        roas: getRoas(),
        dateRange: {
          since: insight.date_start,
          until: insight.date_stop,
        },
      };
    });
  }

  /**
   * Get hierarchical campaign structure with metrics
   */
  async getCampaignHierarchy(
    accessToken: string, 
    adAccountId: string, 
    dateRange: { since: string; until: string }
  ): Promise<{
    campaigns: ProcessedFacebookAdsMetrics[];
    adSets: ProcessedFacebookAdsMetrics[];
    ads: ProcessedFacebookAdsMetrics[];
  }> {
    try {
      // Fetch all insights at account level with different breakdowns
      const [campaignInsights, adSetInsights, adInsights] = await Promise.all([
        this.getInsights(accessToken, adAccountId, 'campaign', dateRange),
        this.getInsights(accessToken, adAccountId, 'adset', dateRange),
        this.getInsights(accessToken, adAccountId, 'ad', dateRange),
      ]);

      return {
        campaigns: this.processInsights(campaignInsights.data),
        adSets: this.processInsights(adSetInsights.data),
        ads: this.processInsights(adInsights.data),
      };
    } catch (error) {
      console.error('Error fetching campaign hierarchy:', error);
      throw new Error(`Failed to fetch campaign hierarchy: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const facebookAdsService = new FacebookAdsService();