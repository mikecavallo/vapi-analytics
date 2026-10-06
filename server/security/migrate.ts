import { randomBytes } from "crypto";
import { hashPassword, isBcryptHash } from "../auth-utils";
import { encryptSecret, isEncryptedSecret } from "./secrets";

/**
 * One-time security migration, run with `npm run db:security-migrate`:
 *   1. Legacy plaintext passwords are rehashed with bcrypt (or, with --force-reset, replaced by
 *      a random unusable hash so the user must be given a new password by an admin).
 *   2. Plaintext provider API keys in `customers` are encrypted with AES-256-GCM.
 * Idempotent: rows that are already hashed / encrypted are left alone.
 */

export interface UserRow { id: string; email: string; password: string }
export interface CustomerKeyRow { id: string; vapiApiKey: string | null; retellApiKey: string | null }

export interface MigrationStore {
  listUsers(): Promise<UserRow[]>;
  setUserPassword(id: string, passwordHash: string): Promise<void>;
  listCustomerKeys(): Promise<CustomerKeyRow[]>;
  setCustomerKeys(id: string, keys: { vapiApiKey?: string; retellApiKey?: string }): Promise<void>;
}

export interface MigrationOptions { dryRun?: boolean; forceReset?: boolean }

export interface MigrationReport {
  passwordsRehashed: string[];
  passwordsReset: string[];
  customersEncrypted: string[];
}

export async function runSecurityMigration(store: MigrationStore, opts: MigrationOptions = {}): Promise<MigrationReport> {
  const report: MigrationReport = { passwordsRehashed: [], passwordsReset: [], customersEncrypted: [] };

  for (const user of await store.listUsers()) {
    if (isBcryptHash(user.password)) continue;
    if (opts.forceReset) {
      report.passwordsReset.push(user.email);
      if (!opts.dryRun) await store.setUserPassword(user.id, await hashPassword(randomBytes(32).toString("hex")));
    } else {
      report.passwordsRehashed.push(user.email);
      if (!opts.dryRun) await store.setUserPassword(user.id, await hashPassword(user.password));
    }
  }

  for (const row of await store.listCustomerKeys()) {
    const keys: { vapiApiKey?: string; retellApiKey?: string } = {};
    if (row.vapiApiKey && !isEncryptedSecret(row.vapiApiKey)) keys.vapiApiKey = encryptSecret(row.vapiApiKey);
    if (row.retellApiKey && !isEncryptedSecret(row.retellApiKey)) keys.retellApiKey = encryptSecret(row.retellApiKey);
    if (Object.keys(keys).length === 0) continue;
    report.customersEncrypted.push(row.id);
    if (!opts.dryRun) await store.setCustomerKeys(row.id, keys);
  }

  return report;
}
