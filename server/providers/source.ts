import type { Customer } from "@shared/schema";
import { storage } from "../storage";
import { filterCallsByRange, type NormalizedCall } from "../analytics/dashboard";
import {
  MAX_FETCH_LIMIT,
  attachVapiAssistantNames,
  fetchCallsWithFilters,
  fetchRetellCallsWithFilters,
} from "./calls";

export type CallProvider = "vapi" | "retell";
export type CallSource = CallProvider | "demo";

/** Demo mode serves seeded sample calls to customers that have no provider key. */
export function isDemoMode(): boolean {
  return process.env.DEMO_MODE === "true";
}

export function normalizeProvider(value: unknown): CallProvider {
  return value === "retell" ? "retell" : "vapi";
}

export function providerKey(customer: Customer | undefined, provider: CallProvider): string | null {
  if (!customer) return null;
  return (provider === "retell" ? customer.retellApiKey : customer.vapiApiKey) || null;
}

/** True when requests for this customer/provider should be served from demo data. */
export function usesDemoData(customer: Customer | undefined, provider: CallProvider): boolean {
  return isDemoMode() && !!customer && !providerKey(customer, provider);
}

type Range = { start: string; end: string };

export interface PeriodCalls {
  source: CallSource;
  current: NormalizedCall[];
  previous: NormalizedCall[];
  /** True when a fetch returned the maximum number of calls, so totals may be truncated. */
  callLimitReached: boolean;
}

/**
 * Load normalized calls for a current period and the same-length previous period.
 * Returns null when the customer has no key for the provider and demo mode is off.
 */
export async function loadCallsForPeriods(
  customer: Customer | undefined,
  provider: CallProvider,
  current: Range,
  previous: Range,
): Promise<PeriodCalls | null> {
  const limit = MAX_FETCH_LIMIT;

  if (usesDemoData(customer, provider)) {
    const calls = (await storage.getDemoCalls(customer!.id, provider, { start: previous.start, end: current.end, limit: 5000 })) as NormalizedCall[];
    // Workspaces that were never seeded get the normal empty state, not a demo banner.
    if (calls.length === 0) return null;
    return {
      source: "demo",
      current: filterCallsByRange(calls, current.start, current.end),
      previous: filterCallsByRange(calls, previous.start, previous.end, true),
      callLimitReached: false,
    };
  }

  const key = providerKey(customer, provider);
  if (!key) return null;

  if (provider === "retell") {
    // Retell has no aggregation API: pull the most recent calls once and split in memory.
    const calls = (await fetchRetellCallsWithFilters({ limit: String(limit) }, key)) as NormalizedCall[];
    return {
      source: "retell",
      current: filterCallsByRange(calls, current.start, current.end),
      previous: filterCallsByRange(calls, previous.start, previous.end, true),
      callLimitReached: calls.length >= limit,
    };
  }

  const [cur, prev] = await Promise.all([
    fetchCallsWithFilters({ limit: String(limit), createdAtGe: current.start, createdAtLe: current.end }, key),
    fetchCallsWithFilters({ limit: String(limit), createdAtGe: previous.start, createdAtLt: previous.end }, key),
  ]);
  return {
    source: "vapi",
    current: await attachVapiAssistantNames(cur as NormalizedCall[], key),
    previous: prev as NormalizedCall[],
    callLimitReached: cur.length >= limit || prev.length >= limit,
  };
}
