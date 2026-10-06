/**
 * Security tests for per-tenant provider credentials.
 *
 * Two customers (A and B) each have their own Vapi account. A fake Vapi API scopes assistants
 * and calls to the key used, the way the real API does. The tests check that customer A can
 * never read or change B's resources, that every request uses the caller's own key, and that
 * the platform-level VAPI_API_KEY is never sent by any customer route.
 */
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";
import { readFileSync, readdirSync } from "fs";
import path from "path";

const PLATFORM_KEY = "platform-vapi-key-must-never-be-used";
const KEY_A = "tenant-a-vapi-key-1111";
const KEY_B = "tenant-b-vapi-key-2222";

process.env.VAPI_API_KEY = PLATFORM_KEY;
process.env.OPENAI_API_KEY = "sk-test-not-real";
delete process.env.DEMO_MODE;

const { fakeStorage, db } = vi.hoisted(() => {
  const db = {
    users: new Map<string, any>(),
    customers: new Map<string, any>(),
    assignments: [] as { userId: string; customerId: string }[],
  };
  const fakeStorage = {
    getUser: async (id: string) => db.users.get(id),
    getUserByEmail: async (email: string) => [...db.users.values()].find((u) => u.email === email),
    getUserByUsername: async (username: string) => [...db.users.values()].find((u) => u.username === username),
    updateUser: async (id: string, updates: any) => {
      const u = { ...db.users.get(id), ...updates };
      db.users.set(id, u);
      return u;
    },
    getUserCustomerAssignments: async (userId: string) =>
      db.assignments.filter((a) => a.userId === userId).map((a, i) => ({ id: `as-${i}`, ...a })),
    getCustomer: async (id: string) => db.customers.get(id),
    getAllCustomers: async () => [...db.customers.values()],
    createCustomer: async (data: any) => {
      const c = { id: `cust-${db.customers.size + 1}`, createdAt: new Date(), updatedAt: new Date(), ...data };
      db.customers.set(c.id, c);
      return c;
    },
    updateCustomer: async (id: string, updates: any) => {
      const c = { ...db.customers.get(id), ...updates };
      db.customers.set(id, c);
      return c;
    },
    getAllUsers: async () => [...db.users.values()],
    getCachedAnalytics: async () => undefined,
    setCachedAnalytics: async () => {},
    getDemoCalls: async () => [],
    getDemoCall: async () => undefined,
  };
  return { fakeStorage, db };
});

vi.mock("../server/storage", () => ({ storage: fakeStorage }));
vi.mock("openai", () => ({
  default: class {
    chat = {
      completions: {
        create: async () => ({ choices: [{ message: { content: JSON.stringify({ recommendations: [], flowImprovements: [], complianceFindings: [] }) } }] }),
      },
    };
  },
}));

// ---- Fake Vapi API: resources are owned by the key that created them ----
const vapiData: Record<string, { assistants: any[]; calls: any[] }> = {
  [KEY_A]: {
    assistants: [{ id: "asst-a-1", name: "A's assistant" }],
    calls: [{ id: "call-a-1", transcript: "hello from A", assistantId: "asst-a-1", createdAt: new Date().toISOString() }],
  },
  [KEY_B]: {
    assistants: [{ id: "asst-b-1", name: "B's assistant" }],
    calls: [{ id: "call-b-1", transcript: "secret from B", assistantId: "asst-b-1", createdAt: new Date().toISOString() }],
  },
};

type Recorded = { url: string; method: string; auth: string };
let requests: Recorded[] = [];

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

async function fakeFetch(input: any, init: any = {}): Promise<Response> {
  const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
  const method = (init.method || (input instanceof Request ? input.method : "GET")).toUpperCase();
  const headers = new Headers(init.headers || (input instanceof Request ? input.headers : undefined));
  const auth = headers.get("authorization") || "";
  requests.push({ url, method, auth });

  const u = new URL(url);
  if (u.hostname === "api.openai.com") {
    return json(200, { choices: [{ message: { content: "analysis" } }] });
  }
  if (u.hostname !== "api.vapi.ai") return json(404, {});

  const account = vapiData[auth.replace(/^Bearer /, "")];
  if (!account) return json(401, { message: "Invalid key" });

  const [, resource, id] = u.pathname.split("/");
  const collection = resource === "assistant" ? account.assistants : resource === "call" ? account.calls : null;
  if (!collection) return json(404, { message: "Not found" });
  if (!id) {
    if (method === "POST") {
      const created = { id: `asst-new-${collection.length}`, ...JSON.parse(init.body) };
      collection.push(created);
      return json(201, created);
    }
    return json(200, collection);
  }
  const item = collection.find((x) => x.id === id);
  if (!item) return json(404, { message: "Not found" });
  if (method === "DELETE") {
    collection.splice(collection.indexOf(item), 1);
    return json(200, item);
  }
  if (method === "PATCH") {
    Object.assign(item, JSON.parse(init.body));
    return json(200, item);
  }
  return json(200, item);
}

let app: express.Express;
let tokenA: string;
let tokenB: string;
let tokenNoKey: string;
let tokenAdmin: string;

beforeAll(async () => {
  const { hashPassword, generateToken, createTokenPayload } = await import("../server/auth-utils");
  const pw = await hashPassword("correct-horse-1");
  const users = [
    { id: "user-a", username: "a", email: "a@example.com", role: "customer", customerId: "cust-a" },
    { id: "user-b", username: "b", email: "b@example.com", role: "customer", customerId: "cust-b" },
    { id: "user-nokey", username: "n", email: "n@example.com", role: "customer", customerId: "cust-nokey" },
    { id: "user-admin", username: "admin", email: "admin@example.com", role: "super_admin", customerId: undefined },
  ];
  for (const u of users) {
    db.users.set(u.id, { id: u.id, username: u.username, email: u.email, role: u.role, password: pw, emailVerified: true, loggedOutAt: null });
    if (u.customerId) db.assignments.push({ userId: u.id, customerId: u.customerId });
  }
  db.customers.set("cust-a", { id: "cust-a", name: "A", vapiApiKey: KEY_A, retellApiKey: null });
  db.customers.set("cust-b", { id: "cust-b", name: "B", vapiApiKey: KEY_B, retellApiKey: null });
  db.customers.set("cust-nokey", { id: "cust-nokey", name: "No key", vapiApiKey: null, retellApiKey: null });

  const tok = (id: string, customerId?: string) => {
    const u = db.users.get(id);
    return generateToken(createTokenPayload(u, customerId));
  };
  tokenA = tok("user-a", "cust-a");
  tokenB = tok("user-b", "cust-b");
  tokenNoKey = tok("user-nokey", "cust-nokey");
  tokenAdmin = tok("user-admin");

  const { registerRoutes } = await import("../server/routes");
  app = express();
  app.use(express.json());
  await registerRoutes(app);
});

beforeEach(() => {
  requests = [];
  vi.stubGlobal("fetch", vi.fn(fakeFetch));
});

afterEach(() => {
  // No request made by any test may carry the platform key.
  expect(requests.filter((r) => r.auth.includes(PLATFORM_KEY))).toEqual([]);
  vi.unstubAllGlobals();
});

const as = (token: string) => ({ Authorization: `Bearer ${token}` });
const vapiRequests = () => requests.filter((r) => r.url.startsWith("https://api.vapi.ai"));

describe("Assistant Studio uses the caller's own Vapi key", () => {
  it("lists only the caller's assistants, with the caller's key", async () => {
    const resA = await request(app).get("/api/assistants").set(as(tokenA));
    expect(resA.status).toBe(200);
    expect(resA.body.map((a: any) => a.id)).toEqual(["asst-a-1"]);

    const resB = await request(app).get("/api/assistants").set(as(tokenB));
    expect(resB.body.map((a: any) => a.id)).toEqual(["asst-b-1"]);

    expect(vapiRequests().map((r) => r.auth)).toEqual([`Bearer ${KEY_A}`, `Bearer ${KEY_B}`]);
  });

  it("customer A cannot read customer B's assistant", async () => {
    const res = await request(app).get("/api/assistants/asst-b-1").set(as(tokenA));
    expect(res.status).toBe(404);
    expect(JSON.stringify(res.body)).not.toContain("B's assistant");
  });

  it("customer A cannot delete customer B's assistant, and no DELETE is sent", async () => {
    const res = await request(app).delete("/api/assistants/asst-b-1").set(as(tokenA));
    expect(res.status).toBe(404);
    expect(vapiRequests().some((r) => r.method === "DELETE")).toBe(false);
    expect(vapiData[KEY_B].assistants.map((a) => a.id)).toContain("asst-b-1");
  });

  it("customer A cannot modify customer B's assistant, and no PATCH is sent", async () => {
    const res = await request(app).patch("/api/assistants/asst-b-1").set(as(tokenA)).send({ name: "pwned" });
    expect(res.status).toBe(404);
    expect(vapiRequests().some((r) => r.method === "PATCH")).toBe(false);
    expect(vapiData[KEY_B].assistants[0].name).toBe("B's assistant");
  });

  it("customer A can update and delete their own assistant", async () => {
    const patched = await request(app).patch("/api/assistants/asst-a-1").set(as(tokenA)).send({ name: "Renamed" });
    expect(patched.status).toBe(200);
    expect(patched.body.name).toBe("Renamed");

    const deleted = await request(app).delete("/api/assistants/asst-a-1").set(as(tokenA));
    expect(deleted.status).toBe(200);
    expect(vapiRequests().filter((r) => r.method !== "GET").every((r) => r.auth === `Bearer ${KEY_A}`)).toBe(true);
    vapiData[KEY_A].assistants.push({ id: "asst-a-1", name: "A's assistant" });
  });

  it("rejects unknown PATCH fields instead of forwarding them to Vapi", async () => {
    const res = await request(app).patch("/api/assistants/asst-a-1").set(as(tokenA)).send({ server: { url: "https://evil.example" } });
    expect(res.status).toBe(400);
    expect(vapiRequests().some((r) => r.method === "PATCH")).toBe(false);
  });

  it("rejects IDs that would change the Vapi URL path", async () => {
    const res = await request(app).delete("/api/assistants/..%2Fcall%2Fcall-a-1").set(as(tokenA));
    expect(res.status).toBe(400);
    expect(vapiRequests()).toEqual([]);
  });

  it("creates assistants on the caller's own account", async () => {
    const res = await request(app)
      .post("/api/assistant-studio/create")
      .set(as(tokenB))
      .send({
        name: "New",
        firstMessage: "Hi",
        systemMessage: "Be brief",
        model: { provider: "openai", model: "gpt-4o" },
        voice: { provider: "11labs", voiceId: "v1" },
        transcriber: { provider: "deepgram" },
      });
    expect(res.status).toBe(200);
    expect(vapiRequests().map((r) => r.auth)).toEqual([`Bearer ${KEY_B}`]);
    expect(vapiData[KEY_A].assistants.some((a) => a.name === "New")).toBe(false);
  });

  it("returns a clear error, not the platform key, when the workspace has no Vapi key", async () => {
    const res = await request(app).get("/api/assistants").set(as(tokenNoKey));
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("PROVIDER_KEY_MISSING");
    expect(requests).toEqual([]);
  });

  it("a customer cannot switch to another customer's workspace with ?customerId", async () => {
    const res = await request(app).get("/api/assistants?customerId=cust-b").set(as(tokenA));
    expect(res.status).toBe(403);
    expect(requests).toEqual([]);
  });
});

describe("Calls are scoped to the caller's own Vapi key", () => {
  it("customer A cannot read customer B's call", async () => {
    const res = await request(app).get("/api/calls/call-b-1").set(as(tokenA));
    expect(res.status).toBe(404);
    expect(JSON.stringify(res.body)).not.toContain("secret from B");
  });

  it("customer A can read their own call", async () => {
    const res = await request(app).get("/api/calls/call-a-1").set(as(tokenA));
    expect(res.status).toBe(200);
    expect(res.body.id).toBe("call-a-1");
  });

  it("VoiceScope prompt optimization refuses B's assistant and calls for customer A", async () => {
    const res = await request(app)
      .post("/api/voicescope/optimize-prompt")
      .set(as(tokenA))
      .send({ assistantId: "asst-b-1", currentPrompt: "x", transcriptIds: ["call-b-1"] });
    expect(res.status).toBe(404);
  });

  it("VoiceScope prompt optimization drops calls that belong to another customer", async () => {
    const res = await request(app)
      .post("/api/voicescope/optimize-prompt")
      .set(as(tokenA))
      .send({ assistantId: "asst-a-1", currentPrompt: "x", transcriptIds: ["call-b-1"] });
    expect(res.status).toBe(404);
  });

  it("conversation-flow analysis cannot read another customer's calls", async () => {
    const res = await request(app)
      .post("/api/conversation-flow/analyze")
      .set(as(tokenA))
      .send({ callIds: ["call-b-1"] });
    expect(res.status).toBe(404);
  });

  it("bulk analysis by call ID cannot read another customer's calls", async () => {
    const res = await request(app)
      .post("/api/bulk-analysis/analyze")
      .set(as(tokenA))
      .send({ query: "what happened?", callIds: ["call-b-1"] });
    expect(res.status).toBe(404);
    expect(requests.some((r) => r.url.startsWith("https://api.openai.com"))).toBe(false);
  });

  it("performance benchmarks use the caller's key", async () => {
    const res = await request(app).get("/api/performance-benchmarks").set(as(tokenB));
    expect(res.status).toBe(200);
    expect(vapiRequests().map((r) => r.auth)).toEqual([`Bearer ${KEY_B}`]);
  });
});

describe("Stored provider keys are never returned in full", () => {
  it("customer details mask keys to the last four characters", async () => {
    const res = await request(app).get("/api/customer/details").set(as(tokenA));
    expect(res.status).toBe(200);
    expect(res.body.vapiApiKey).toBe("••••1111");
    expect(res.body.hasVapiApiKey).toBe(true);
    expect(JSON.stringify(res.body)).not.toContain(KEY_A);
  });

  it("admin customer list masks keys", async () => {
    const res = await request(app).get("/api/admin/customers").set(as(tokenAdmin));
    expect(res.status).toBe(200);
    const body = JSON.stringify(res.body);
    expect(body).not.toContain(KEY_A);
    expect(body).not.toContain(KEY_B);
  });

  it("admin create-customer stores the key the admin entered, never the platform key", async () => {
    const res = await request(app)
      .post("/api/admin/customers")
      .set(as(tokenAdmin))
      .send({ name: "New Co", vapiApiKey: "admin-entered-key-9999" });
    expect(res.status).toBe(200);
    expect(res.body.vapiApiKey).toBe("••••9999");
    const stored = db.customers.get(res.body.id);
    expect(stored.vapiApiKey).toBe("admin-entered-key-9999");

    const noKey = await request(app).post("/api/admin/customers").set(as(tokenAdmin)).send({ name: "No Key Co" });
    expect(noKey.status).toBe(200);
    expect(db.customers.get(noKey.body.id).vapiApiKey).toBeNull();
  });

  it("customers cannot use admin routes", async () => {
    const res = await request(app).get("/api/admin/customers").set(as(tokenA));
    expect(res.status).toBe(403);
  });
});

describe("No customer route reads the platform Vapi key", () => {
  it("server source never reads process.env.VAPI_API_KEY", () => {
    const root = path.resolve(import.meta.dirname, "../server");
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(p);
        else if (p.endsWith(".ts")) files.push(p);
      }
    };
    walk(root);
    const offenders = files.filter((f) => /process\.env\.VAPI_API_KEY|process\.env\[["']VAPI_API_KEY/.test(readFileSync(f, "utf8")));
    expect(offenders).toEqual([]);
  });
});

describe("Login is bcrypt-only", () => {
  it("rejects a legacy plaintext password even when it matches", async () => {
    db.users.set("user-legacy", {
      id: "user-legacy", username: "legacy", email: "legacy@example.com", role: "customer",
      password: "plaintext-pass-1", emailVerified: true, loggedOutAt: null,
    });
    const res = await request(app).post("/api/auth/login").send({ email: "legacy@example.com", password: "plaintext-pass-1" });
    expect(res.status).toBe(401);
    // The stored value must not have been silently upgraded either.
    expect(db.users.get("user-legacy").password).toBe("plaintext-pass-1");
  });

  it("accepts a correct bcrypt password", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "b@example.com", password: "correct-horse-1" });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.password).toBeUndefined();
  });
});
