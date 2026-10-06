/**
 * Startup checks for secrets. In production the server refuses to start when JWT_SECRET or
 * ENCRYPTION_KEY is missing, too short, or still set to a known placeholder value.
 */

export const KNOWN_PLACEHOLDER_SECRETS = new Set([
  "change-me-to-a-long-random-string",
  "dev-only-jwt-secret-not-for-production",
  "dev-only-encryption-key-not-for-production",
  "secret",
  "changeme",
]);

export const MIN_SECRET_LENGTH = 32;

function checkSecret(name: string, value: string | undefined): string | null {
  if (!value) return `${name} is not set`;
  if (KNOWN_PLACEHOLDER_SECRETS.has(value)) return `${name} is still set to a placeholder value`;
  if (value.length < MIN_SECRET_LENGTH) return `${name} must be at least ${MIN_SECRET_LENGTH} characters`;
  return null;
}

/** Returns a list of configuration problems. Empty outside production. */
export function findInsecureConfig(env: NodeJS.ProcessEnv = process.env): string[] {
  if (env.NODE_ENV !== "production") return [];
  return [checkSecret("JWT_SECRET", env.JWT_SECRET), checkSecret("ENCRYPTION_KEY", env.ENCRYPTION_KEY)]
    .filter((p): p is string => p !== null);
}

export function assertSecureConfig(env: NodeJS.ProcessEnv = process.env): void {
  const problems = findInsecureConfig(env);
  if (problems.length > 0) {
    throw new Error(`Refusing to start with insecure configuration: ${problems.join("; ")}`);
  }
}

/** Returns the JWT signing secret, failing fast in production when it is unsafe. */
export function getJwtSecret(env: NodeJS.ProcessEnv = process.env): string {
  if (env.NODE_ENV === "production") {
    const problem = checkSecret("JWT_SECRET", env.JWT_SECRET);
    if (problem) throw new Error(problem);
    return env.JWT_SECRET!;
  }
  return env.JWT_SECRET || "dev-only-jwt-secret-not-for-production";
}
