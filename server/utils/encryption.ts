import { createCipheriv, createDecipheriv, randomBytes, createHash, scryptSync } from 'crypto';

const ENCRYPTION_KEY_SOURCE = process.env.ENCRYPTION_KEY || (() => {
  if (process.env.NODE_ENV === 'production') throw new Error('ENCRYPTION_KEY environment variable is required in production');
  return 'dev-only-encryption-key-not-for-production';
})();
const ALGORITHM = 'aes-256-cbc';

// Derive and cache the encryption key at module load time (scryptSync is expensive)
const DERIVED_KEY: Buffer = scryptSync(ENCRYPTION_KEY_SOURCE, 'salt', 32); // 32 bytes for AES-256

/**
 * Encrypts a string value using AES-256-CBC encryption
 */
export function encrypt(text: string): string {
  try {
    const key = DERIVED_KEY;
    const iv = randomBytes(16);
    const cipher = createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypts a string value using AES-256-CBC decryption
 */
export function decrypt(encryptedText: string): string {
  try {
    const [ivHex, encrypted] = encryptedText.split(':');
    const key = DERIVED_KEY;
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Generates app secret proof for Facebook API requests
 * This adds extra security to API calls with access tokens
 * Uses per-customer appSecret if provided, otherwise falls back to env var
 */
export function generateAppSecretProof(accessToken: string, appSecret?: string): string {
  const secret = appSecret || process.env.FACEBOOK_APP_SECRET;
  if (!secret) {
    throw new Error('Facebook App Secret is required. Provide it per-customer or set FACEBOOK_APP_SECRET env var.');
  }
  return createHash('sha256')
    .update(accessToken + secret)
    .digest('hex');
}

/**
 * Validates that an access token format is correct
 */
export function validateAccessTokenFormat(token: string): boolean {
  // Accept various Facebook token formats:
  // - Long access tokens (100+ chars starting with EAA)
  // - Short-lived tokens 
  // - App secrets and other token types for testing
  if (typeof token !== 'string' || token.length < 20) {
    return false;
  }
  
  // Allow alphanumeric, underscores, hyphens, and pipes
  return /^[A-Za-z0-9_|-]+$/.test(token);
}