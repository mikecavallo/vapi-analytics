/**
 * One-time security migration for databases created before bcrypt-only login and
 * encrypted provider keys. Safe to re-run.
 *
 *   DATABASE_URL=... ENCRYPTION_KEY=... npm run db:security-migrate             # apply
 *   DATABASE_URL=... ENCRYPTION_KEY=... npm run db:security-migrate -- --dry-run
 *   DATABASE_URL=... ENCRYPTION_KEY=... npm run db:security-migrate -- --force-reset
 *
 * Default: legacy plaintext passwords are rehashed in place (users keep their password).
 * --force-reset: they are replaced with a random hash instead, so those users cannot log in
 * until an admin sets a new password. Use this if the plaintext values may have leaked.
 * Use the same ENCRYPTION_KEY as the running app, or the app will not be able to read the keys.
 */
import { eq } from "drizzle-orm";
import { db, pool } from "../server/db";
import { customers, users } from "@shared/schema";
import { runSecurityMigration } from "../server/security/migrate";

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const forceReset = process.argv.includes("--force-reset");

  const report = await runSecurityMigration(
    {
      listUsers: () => db.select({ id: users.id, email: users.email, password: users.password }).from(users),
      setUserPassword: async (id, password) => {
        await db.update(users).set({ password, updatedAt: new Date() }).where(eq(users.id, id));
      },
      listCustomerKeys: () =>
        db.select({ id: customers.id, vapiApiKey: customers.vapiApiKey, retellApiKey: customers.retellApiKey }).from(customers),
      setCustomerKeys: async (id, keys) => {
        await db.update(customers).set({ ...keys, updatedAt: new Date() }).where(eq(customers.id, id));
      },
    },
    { dryRun, forceReset },
  );

  const verb = dryRun ? "Would" : "Did";
  console.log(`${verb} rehash ${report.passwordsRehashed.length} legacy plaintext password(s)${report.passwordsRehashed.length ? `: ${report.passwordsRehashed.join(", ")}` : ""}`);
  if (forceReset) {
    console.log(`${verb} reset ${report.passwordsReset.length} password(s)${report.passwordsReset.length ? `: ${report.passwordsReset.join(", ")}` : ""}`);
  }
  console.log(`${verb} encrypt provider keys for ${report.customersEncrypted.length} customer(s)`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
