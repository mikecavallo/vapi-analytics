import { apiRequest } from "./queryClient";
import { VapiAnalyticsQuery, DashboardData } from "@shared/schema";

export async function fetchAnalytics(timeRange: string): Promise<DashboardData> {
  const response = await apiRequest("POST", "/api/analytics", {
    timeRange,
    queries: [],
  });
  
  return await response.json();
}

export async function fetchAnalyticsSummary(timeRange: string): Promise<DashboardData> {
  const response = await apiRequest("GET", `/api/analytics/summary?timeRange=${timeRange}`);
  return await response.json();
}

export function formatCallDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function getTimeRangeLabel(timeRange: string): string {
  switch (timeRange) {
    case 'last-7-days': return 'Last 7 days';
    case 'last-30-days': return 'Last 30 days';
    case 'last-90-days': return 'Last 90 days';
    case 'custom-range': return 'Custom range';
    default: return 'Last 7 days';
  }
}

export function calculateSuccessRate(outcomes: Array<{ outcome: string; count: number }>): number {
  const totalCalls = outcomes.reduce((sum, item) => sum + item.count, 0);
  const successfulCalls = outcomes
    .filter(item => ['customer-ended-call', 'assistant-ended-call'].includes(item.outcome))
    .reduce((sum, item) => sum + item.count, 0);
  
  return totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0;
}
