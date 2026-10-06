import { describe, expect, it, vi } from "vitest";
import {
  ConsoleEmailSender,
  ResendEmailSender,
  buildVerificationEmail,
  createEmailSender,
} from "../server/email/sender";
import { generateDemoCalls, DEMO_ASSISTANTS } from "../server/demo/sample-calls";
import { buildDashboardFromRawCalls } from "../server/analytics/dashboard";

describe("email sender", () => {
  it("uses the console sender unless RESEND_API_KEY is set", () => {
    expect(createEmailSender({} as NodeJS.ProcessEnv).name).toBe("console");
    expect(createEmailSender({ RESEND_API_KEY: "re_test" } as NodeJS.ProcessEnv).name).toBe("resend");
  });

  it("console sender logs instead of sending", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    await new ConsoleEmailSender().send({ to: "a@example.com", subject: "Hi", text: "Body" });
    expect(log).toHaveBeenCalledWith(expect.stringContaining("a@example.com"));
    log.mockRestore();
  });

  it("Resend sender posts to the Resend API and surfaces errors", async () => {
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    const sender = new ResendEmailSender("re_test", "App <no-reply@example.com>", fetchMock as unknown as typeof fetch);
    await sender.send({ to: "a@example.com", subject: "S", text: "T" });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer re_test");
    expect(JSON.parse(init.body as string)).toEqual({ from: "App <no-reply@example.com>", to: ["a@example.com"], subject: "S", text: "T" });

    const failing = new ResendEmailSender("re_test", "x", (async () => new Response("bad", { status: 422 })) as unknown as typeof fetch);
    await expect(failing.send({ to: "a", subject: "s", text: "t" })).rejects.toThrow("Resend API error 422");
  });

  it("builds a verification link from APP_URL", () => {
    const msg = buildVerificationEmail("a@example.com", "abc123", "https://app.example.com/");
    expect(msg.text).toContain("https://app.example.com/verify-email?token=abc123");
    expect(msg.to).toBe("a@example.com");
  });
});

describe("demo call generator", () => {
  const now = new Date("2026-03-15T12:00:00.000Z");

  it("is deterministic and clearly labeled as sample data", () => {
    const a = generateDemoCalls({ provider: "vapi", now, count: 50 });
    const b = generateDemoCalls({ provider: "vapi", now, count: 50 });
    expect(a).toEqual(b);
    expect(a).toHaveLength(50);
    for (const c of a) {
      expect(c.id.startsWith("demo-vapi-call-")).toBe(true);
      expect(c.demo).toBe(true);
      expect(DEMO_ASSISTANTS.map(x => x.name)).toContain(c.assistantName);
      expect(c.customerPhoneNumber).toMatch(/^\+1555010\d\d$/);
      expect(new Date(c.createdAt as string).getTime()).toBeLessThanOrEqual(now.getTime());
    }
  });

  it("produces a dashboard with non-trivial data", () => {
    const calls = generateDemoCalls({ provider: "retell", now, count: 300 });
    const d = buildDashboardFromRawCalls(calls);
    expect(d.kpis.totalCalls).toBe(300);
    expect(d.kpis.successRate).toBeGreaterThan(0);
    expect(d.kpis.successRate).toBeLessThan(100);
    expect(d.mostSuccessfulAgent).not.toBeNull();
  });
});
