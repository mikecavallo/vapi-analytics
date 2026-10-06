import type { Request } from "express";
import type { Customer } from "@shared/schema";
import { storage } from "../storage";
import { HttpError } from "../http-error";
import { providerKey, usesDemoData, type CallProvider } from "./source";

/**
 * Per-tenant provider credentials.
 *
 * Every Vapi/Retell request made on behalf of a customer must use that customer's own stored
 * key, resolved here from `req.customerId` (set by validateCustomerAccess after checking the
 * user's assignments). The platform-level VAPI_API_KEY is never read by customer routes, so a
 * customer can only see or change resources that belong to their own provider account.
 */

export const PROVIDER_KEY_MISSING = "PROVIDER_KEY_MISSING";
export const DEMO_WORKSPACE = "DEMO_WORKSPACE";

export interface TenantContext {
  customer: Customer;
  /** The customer's key for the provider, or null when the workspace is served demo data. */
  key: string | null;
  demo: boolean;
}

const LABEL: Record<CallProvider, string> = { vapi: "Vapi", retell: "Retell" };

export async function getTenantContext(req: Request, provider: CallProvider): Promise<TenantContext> {
  const customerId = req.customerId;
  if (!customerId) {
    throw new HttpError(400, "Customer ID required");
  }
  const customer = await storage.getCustomer(customerId);
  if (!customer) {
    throw new HttpError(404, "Customer not found");
  }
  if (usesDemoData(customer, provider)) {
    return { customer, key: null, demo: true };
  }
  const key = providerKey(customer, provider);
  if (!key) {
    throw new HttpError(
      400,
      `No ${LABEL[provider]} API key is connected to this workspace. Add one in Settings.`,
      PROVIDER_KEY_MISSING,
    );
  }
  return { customer, key, demo: false };
}

/** Like getTenantContext, but demo workspaces are rejected (for actions that need a real account). */
export async function requireTenantKey(req: Request, provider: CallProvider): Promise<{ customer: Customer; key: string }> {
  const ctx = await getTenantContext(req, provider);
  if (!ctx.key) {
    throw new HttpError(
      409,
      `This is a demo workspace with sample data. Connect your own ${LABEL[provider]} API key in Settings to use this feature.`,
      DEMO_WORKSPACE,
    );
  }
  return { customer: ctx.customer, key: ctx.key };
}
