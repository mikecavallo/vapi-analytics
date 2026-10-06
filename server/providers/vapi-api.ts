import { HttpError } from "../http-error";

/**
 * Thin Vapi REST client used by customer routes. Every function takes the tenant's own key.
 * IDs are validated before they are put in a URL so a crafted ID such as "../phone-number/x"
 * cannot redirect the request to a different Vapi resource.
 */

export const VAPI_BASE_URL = "https://api.vapi.ai";
const ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

export function assertProviderId(id: unknown, label = "ID"): string {
  if (typeof id !== "string" || !ID_PATTERN.test(id)) {
    throw new HttpError(400, `Invalid ${label}`);
  }
  return id;
}

async function vapiFetch(key: string, path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${VAPI_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers || {}),
    },
  });
}

async function failFromResponse(response: Response, action: string): Promise<never> {
  const body = await response.text().catch(() => "");
  console.error(`[vapi] ${action} failed: ${response.status} ${body.slice(0, 500)}`);
  if (response.status === 401 || response.status === 403) {
    throw new HttpError(502, "Vapi rejected this workspace's API key. Check the key in Settings.");
  }
  if (response.status === 400 || response.status === 422) {
    let detail = "";
    try {
      const parsed = JSON.parse(body);
      detail = Array.isArray(parsed.message) ? parsed.message.join("; ") : String(parsed.message || "");
    } catch {
      /* ignore */
    }
    throw new HttpError(400, `Vapi did not accept the request${detail ? `: ${detail.slice(0, 300)}` : "."}`);
  }
  throw new HttpError(502, `Vapi request failed (${action}).`);
}

export async function listAssistants(key: string): Promise<any[]> {
  const response = await vapiFetch(key, "/assistant");
  if (!response.ok) await failFromResponse(response, "list assistants");
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Fetches an assistant with the tenant's key. Returns null when it does not exist on that
 * account: this is the ownership check, since Vapi scopes assistants to the key's org.
 */
export async function getOwnedAssistant(key: string, id: string): Promise<any | null> {
  const safeId = assertProviderId(id, "assistant ID");
  const response = await vapiFetch(key, `/assistant/${encodeURIComponent(safeId)}`);
  if (response.status === 404 || response.status === 400) return null;
  if (!response.ok) await failFromResponse(response, "get assistant");
  const assistant = await response.json();
  // Defense in depth: never trust a record whose ID does not match what was asked for.
  if (!assistant || assistant.id !== safeId) return null;
  return assistant;
}

async function requireOwnedAssistant(key: string, id: string): Promise<any> {
  const assistant = await getOwnedAssistant(key, id);
  if (!assistant) throw new HttpError(404, "Assistant not found");
  return assistant;
}

export async function createAssistant(key: string, payload: Record<string, unknown>): Promise<any> {
  const response = await vapiFetch(key, "/assistant", { method: "POST", body: JSON.stringify(payload) });
  if (!response.ok) await failFromResponse(response, "create assistant");
  return response.json();
}

export async function updateAssistant(key: string, id: string, patch: Record<string, unknown>): Promise<any> {
  await requireOwnedAssistant(key, id);
  const response = await vapiFetch(key, `/assistant/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  if (!response.ok) await failFromResponse(response, "update assistant");
  return response.json();
}

export async function deleteAssistant(key: string, id: string): Promise<void> {
  await requireOwnedAssistant(key, id);
  const response = await vapiFetch(key, `/assistant/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!response.ok) await failFromResponse(response, "delete assistant");
}

/** Fetches a call with the tenant's key; null when it does not belong to that account. */
export async function getOwnedCall(key: string, id: string): Promise<any | null> {
  const safeId = assertProviderId(id, "call ID");
  const response = await vapiFetch(key, `/call/${encodeURIComponent(safeId)}`);
  if (response.status === 404 || response.status === 400) return null;
  if (!response.ok) await failFromResponse(response, "get call");
  const call = await response.json();
  if (!call || call.id !== safeId) return null;
  return call;
}

/** Fetches several calls in parallel, silently dropping IDs that are invalid or not owned. */
export async function getOwnedCalls(key: string, ids: string[]): Promise<any[]> {
  const results = await Promise.all(
    ids.map((id) => getOwnedCall(key, id).catch(() => null)),
  );
  return results.filter(Boolean);
}

export async function listCalls(key: string, params: Record<string, string> = {}): Promise<any[]> {
  const qs = new URLSearchParams(params).toString();
  const response = await vapiFetch(key, `/call${qs ? `?${qs}` : ""}`);
  if (!response.ok) await failFromResponse(response, "list calls");
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}
