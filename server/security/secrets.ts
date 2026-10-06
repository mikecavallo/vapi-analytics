import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

/**
 * Encryption at rest for customer provider API keys (Vapi, Retell).
 *
 * AES-256-GCM with a key derived from ENCRYPTION_KEY. Stored format:
 *   enc:v1:<iv base64>:<auth tag base64>:<ciphertext base64>
 *
 * Values without the prefix are legacy plaintext rows written before encryption was added.
 * They are still readable so existing workspaces keep working, and
 * `npm run db:security-migrate` rewrites them in encrypted form.
 */

const PREFIX = "enc:v1:";
const DEV_FALLBACK = "dev-only-encryption-key-not-for-production";

let cachedKey: { source: string; key: Buffer } | null = null;

function getKey(): Buffer {
  const source = process.env.ENCRYPTION_KEY || DEV_FALLBACK;
  if (!process.env.ENCRYPTION_KEY && process.env.NODE_ENV === "production") {
    throw new Error("ENCRYPTION_KEY environment variable is required in production");
  }
  if (cachedKey?.source !== source) {
    cachedKey = { source, key: scryptSync(source, "invoxa-provider-keys:v1", 32) };
  }
  return cachedKey.key;
}

export function isEncryptedSecret(value: string | null | undefined): boolean {
  return typeof value === "string" && value.startsWith(PREFIX);
}

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("base64")}:${tag.toString("base64")}:${ciphertext.toString("base64")}`;
}

/** Decrypts a stored secret. Legacy plaintext values are returned unchanged. Throws if tampered. */
export function decryptSecret(stored: string): string {
  if (!isEncryptedSecret(stored)) return stored;
  const [ivB64, tagB64, dataB64] = stored.slice(PREFIX.length).split(":");
  if (!ivB64 || !tagB64 || dataB64 === undefined) {
    throw new Error("Malformed encrypted secret");
  }
  const decipher = createDecipheriv("aes-256-gcm", getKey(), Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(dataB64, "base64")), decipher.final()]).toString("utf8");
}

/** Never send a stored key back to the browser: show only the last four characters. */
export function maskSecret(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.length < 8) return "••••";
  return `••••${value.slice(-4)}`;
}
