import { describe, expect, it } from "vitest";
import { decryptSecret, encryptSecret, isEncryptedSecret, maskSecret } from "../server/security/secrets";
import { assertSecureConfig, findInsecureConfig, getJwtSecret } from "../server/config";
import { runSecurityMigration, type CustomerKeyRow, type UserRow } from "../server/security/migrate";
import { hashPassword, isBcryptHash, verifyPassword } from "../server/auth-utils";

describe("provider key encryption (AES-256-GCM)", () => {
  it("round-trips and uses a fresh IV each time", () => {
    const a = encryptSecret("vapi-secret-key");
    const b = encryptSecret("vapi-secret-key");
    expect(a).not.toBe(b);
    expect(a).not.toContain("vapi-secret-key");
    expect(isEncryptedSecret(a)).toBe(true);
    expect(decryptSecret(a)).toBe("vapi-secret-key");
  });

  it("detects tampering", () => {
    const enc = encryptSecret("vapi-secret-key");
    const parts = enc.split(":");
    const data = Buffer.from(parts[4], "base64");
    data[0] ^= 1;
    parts[4] = data.toString("base64");
    expect(() => decryptSecret(parts.join(":"))).toThrow();
  });

  it("reads legacy plaintext values unchanged", () => {
    expect(decryptSecret("legacy-plain-key")).toBe("legacy-plain-key");
  });

  it("masks keys to the last four characters", () => {
    expect(maskSecret("abcdefgh1234")).toBe("••••1234");
    expect(maskSecret("short")).toBe("••••");
    expect(maskSecret(null)).toBeNull();
  });
});

describe("production secret checks", () => {
  const strong = "x".repeat(40);

  it("passes outside production", () => {
    expect(findInsecureConfig({ NODE_ENV: "development" })).toEqual([]);
  });

  it("fails fast on missing, placeholder or short secrets in production", () => {
    expect(() => assertSecureConfig({ NODE_ENV: "production" })).toThrow(/JWT_SECRET is not set/);
    expect(findInsecureConfig({ NODE_ENV: "production", JWT_SECRET: "change-me-to-a-long-random-string", ENCRYPTION_KEY: strong }))
      .toEqual(["JWT_SECRET is still set to a placeholder value"]);
    expect(findInsecureConfig({ NODE_ENV: "production", JWT_SECRET: strong, ENCRYPTION_KEY: "short" }))
      .toEqual(["ENCRYPTION_KEY must be at least 32 characters"]);
    expect(() => getJwtSecret({ NODE_ENV: "production", JWT_SECRET: "dev-only-jwt-secret-not-for-production" })).toThrow();
    expect(() => assertSecureConfig({ NODE_ENV: "production", JWT_SECRET: strong, ENCRYPTION_KEY: strong })).not.toThrow();
  });
});

describe("password checks", () => {
  it("never accepts a plaintext stored value", async () => {
    expect(isBcryptHash("hunter22")).toBe(false);
    expect(await verifyPassword("hunter22", "hunter22")).toBe(false);
    const hash = await hashPassword("hunter22");
    expect(isBcryptHash(hash)).toBe(true);
    expect(await verifyPassword("hunter22", hash)).toBe(true);
  });
});

describe("security migration", () => {
  async function setup(opts: { dryRun?: boolean; forceReset?: boolean } = {}) {
    const bcryptRow = await hashPassword("already-hashed-1");
    const users: UserRow[] = [
      { id: "1", email: "legacy@example.com", password: "plain-pass-1" },
      { id: "2", email: "ok@example.com", password: bcryptRow },
    ];
    const customers: CustomerKeyRow[] = [
      { id: "c1", vapiApiKey: "plain-vapi-key", retellApiKey: null },
      { id: "c2", vapiApiKey: encryptSecret("already-encrypted"), retellApiKey: null },
    ];
    const report = await runSecurityMigration(
      {
        listUsers: async () => users,
        setUserPassword: async (id, hash) => { users.find((u) => u.id === id)!.password = hash; },
        listCustomerKeys: async () => customers,
        setCustomerKeys: async (id, keys) => { Object.assign(customers.find((c) => c.id === id)!, keys); },
      },
      opts,
    );
    return { users, customers, report, bcryptRow };
  }

  it("rehashes legacy passwords so the user keeps their password, and encrypts plaintext keys", async () => {
    const { users, customers, report, bcryptRow } = await setup();
    expect(report.passwordsRehashed).toEqual(["legacy@example.com"]);
    expect(await verifyPassword("plain-pass-1", users[0].password)).toBe(true);
    expect(users[1].password).toBe(bcryptRow);
    expect(report.customersEncrypted).toEqual(["c1"]);
    expect(decryptSecret(customers[0].vapiApiKey!)).toBe("plain-vapi-key");
    expect(isEncryptedSecret(customers[0].vapiApiKey)).toBe(true);
  });

  it("--force-reset makes the old plaintext password unusable", async () => {
    const { users, report } = await setup({ forceReset: true });
    expect(report.passwordsReset).toEqual(["legacy@example.com"]);
    expect(await verifyPassword("plain-pass-1", users[0].password)).toBe(false);
  });

  it("--dry-run changes nothing", async () => {
    const { users, customers, report } = await setup({ dryRun: true });
    expect(report.passwordsRehashed).toHaveLength(1);
    expect(users[0].password).toBe("plain-pass-1");
    expect(customers[0].vapiApiKey).toBe("plain-vapi-key");
  });
});
