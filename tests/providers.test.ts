import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchCallsWithFilters, fetchRetellCallsWithFilters, attachVapiAssistantNames } from "../server/providers/calls";
import { buildDashboardFromRawCalls } from "../server/analytics/dashboard";

function mockFetch(handler: (url: string, init?: RequestInit) => unknown, status = 200) {
  const fn = vi.fn(async (url: any, init?: RequestInit) => {
    const body = handler(String(url), init);
    return new Response(typeof body === "string" ? body : JSON.stringify(body), { status });
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Vapi call normalization", () => {
  it("converts minutes to seconds, maps call type and lifts successEvaluation", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    const fetchMock = mockFetch(() => [
      {
        id: "c1",
        assistantId: "a1",
        type: "inboundPhoneCall",
        duration: 2.5,
        cost: 0.3,
        createdAt: "2026-03-02T15:00:00.000Z",
        endedReason: "customer-ended-call",
        customer: { number: "+15550100" },
        analysis: { successEvaluation: true },
      },
      {
        id: "c2",
        type: "outboundPhoneCall",
        startedAt: "2026-03-02T16:00:00.000Z",
        endedAt: "2026-03-02T16:01:30.000Z",
      },
    ]);

    const calls = await fetchCallsWithFilters({ limit: "5000", createdAtGe: "2026-03-01T00:00:00.000Z" }, "test-key");
    const url = new URL(fetchMock.mock.calls[0][0] as string);
    expect(url.origin + url.pathname).toBe("https://api.vapi.ai/call");
    expect(url.searchParams.get("limit")).toBe("1000"); // clamped to MAX_FETCH_LIMIT
    expect(url.searchParams.get("createdAtGe")).toBe("2026-03-01T00:00:00.000Z");
    expect((fetchMock.mock.calls[0][1] as RequestInit).headers).toMatchObject({ Authorization: "Bearer test-key" });

    expect(calls[0]).toMatchObject({ duration: 150, type: "inbound", successEvaluation: "true", customerPhoneNumber: "+15550100" });
    expect(calls[1]).toMatchObject({ duration: 90, type: "outbound", successEvaluation: null, cost: 0, createdAt: "2026-03-02T16:00:00.000Z" });

    const dashboard = buildDashboardFromRawCalls(calls);
    expect(dashboard.kpis.totalCalls).toBe(2);
    expect(dashboard.kpis.successRate).toBe(50);
  });

  it("raises a clear error on 401", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockFetch(() => "unauthorized", 401);
    await expect(fetchCallsWithFilters({}, "bad")).rejects.toThrow("Invalid API key");
  });

  it("resolves missing assistant names and falls back to an id label, never an invented name", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockFetch(url => (url.endsWith("/a1") ? { name: "Front Desk" } : "nope"), 200);
    const named = await attachVapiAssistantNames([{ assistantId: "a1" }, { assistantId: "a1", assistantName: "Kept" }], "k");
    expect(named.map(c => c.assistantName)).toEqual(["Front Desk", "Kept"]);

    mockFetch(() => "not found", 404);
    const fallback = await attachVapiAssistantNames([{ assistantId: "94b9c5df-4630-45da" }], "k");
    expect(fallback[0].assistantName).toBe("Assistant 94b9c5df");
  });
});

describe("Retell call normalization", () => {
  it("maps Retell fields onto the shared call shape", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    const fetchMock = mockFetch(() => [
      {
        call_id: "r1",
        agent_id: "agent_1",
        direction: "inbound",
        call_status: "ended",
        disconnection_reason: "user_hangup",
        duration_ms: 61500,
        cost: "0.42",
        start_timestamp: Date.parse("2026-03-02T15:00:00.000Z"),
        end_timestamp: Date.parse("2026-03-02T15:01:01.500Z"),
        from_number: "+15550199",
        to_number: "+15550101",
        call_analysis: { call_successful: true, call_summary: "ok" },
      },
    ]);

    const calls = await fetchRetellCallsWithFilters({ limit: "10", createdAtGe: "2026-03-01T00:00:00.000Z" }, "rk");
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.retellai.com/v2/list-calls");
    expect(JSON.parse(init.body as string)).toEqual({
      limit: 10,
      filter_criteria: { start_timestamp: { lower_threshold: Date.parse("2026-03-01T00:00:00.000Z") } },
    });
    expect(calls[0]).toMatchObject({
      id: "r1",
      assistantId: "agent_1",
      type: "inbound",
      endedReason: "user_hangup",
      duration: 62,
      cost: 0.42,
      createdAt: "2026-03-02T15:00:00.000Z",
      successEvaluation: "true",
    });
  });
});
