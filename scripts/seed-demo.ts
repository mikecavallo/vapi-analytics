/**
 * Seed a demo login with clearly fake sample calls so the dashboards can be explored
 * without Vapi or Retell API keys. Idempotent: re-running refreshes the sample calls.
 *
 *   DATABASE_URL=... npm run db:push
 *   DATABASE_URL=... npm run db:seed-demo
 *   DEMO_MODE=true DATABASE_URL=... npm run dev
 *
 * Credentials default to demo@example.com / demo-password-1 and can be overridden with
 * DEMO_EMAIL / DEMO_PASSWORD.
 */
import { eq } from "drizzle-orm";
import { db, pool } from "../server/db";
import { storage } from "../server/storage";
import { hashPassword } from "../server/auth-utils";
import { generateDemoCalls } from "../server/demo/sample-calls";
import { customers, users } from "@shared/schema";

const DEMO_EMAIL = process.env.DEMO_EMAIL || "demo@example.com";
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "demo-password-1";
const DEMO_USERNAME = "demo";

async function main() {
  let user = await storage.getUserByEmail(DEMO_EMAIL);
  let customerId: string;

  if (!user) {
    const created = await storage.createUserWithCustomerAndAssignment({
      username: DEMO_USERNAME,
      email: DEMO_EMAIL,
      password: await hashPassword(DEMO_PASSWORD),
    });
    user = created.user;
    customerId = created.customer.id;
  } else {
    await storage.updateUser(user.id, { password: await hashPassword(DEMO_PASSWORD) });
    const assignments = await storage.getUserCustomerAssignments(user.id);
    if (assignments.length === 0) throw new Error(`User ${DEMO_EMAIL} exists but has no customer assignment`);
    customerId = assignments[0].customerId;
  }

  await db.update(users).set({ emailVerified: true }).where(eq(users.id, user.id));
  await db.update(customers).set({
    name: "Demo Workspace (sample data)",
    description: "Seeded by scripts/seed-demo.ts. All calls are generated sample data.",
  }).where(eq(customers.id, customerId));

  const now = new Date();
  const rows = (["vapi", "retell"] as const).flatMap(provider =>
    generateDemoCalls({ provider, now, count: provider === "vapi" ? 420 : 240 }).map(call => ({
      id: call.id,
      customerId,
      provider,
      createdAt: new Date(call.createdAt as string),
      call,
    })),
  );
  await storage.replaceDemoCalls(customerId, rows);

  console.log(`Seeded ${rows.length} sample calls for customer ${customerId}.`);
  console.log(`Log in with ${DEMO_EMAIL} / ${DEMO_PASSWORD} (start the server with DEMO_MODE=true).`);
}

main()
  .catch(err => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
