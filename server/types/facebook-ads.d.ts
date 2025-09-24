declare module 'facebook-nodejs-business-sdk' {
  export class FacebookAdsApi {
    static init(appId: string, appSecret: string): FacebookAdsApi;
    setAccessToken(accessToken: string): void;
  }

  export class AdAccount {
    constructor(id?: string);
    getAdAccounts(params?: any): Promise<any[]>;
    getCampaigns(params?: any): Promise<any[]>;
    getInsights(fields: string[], params?: any): Promise<any[]>;
  }

  export class Campaign {
    constructor(id: string);
    getAdSets(params?: any): Promise<any[]>;
    getInsights(fields: string[], params?: any): Promise<any[]>;
  }

  export class AdSet {
    constructor(id: string);
    getAds(params?: any): Promise<any[]>;
    getInsights(fields: string[], params?: any): Promise<any[]>;
  }

  export class Ad {
    constructor(id: string);
    getInsights(fields: string[], params?: any): Promise<any[]>;
  }
}