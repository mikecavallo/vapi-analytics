import { createCipheriv, createDecipheriv, randomBytes, createHash, scryptSync } from 'crypto';

const ENCRYPTION_KEY_SOURCE = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
const ALGORITHM = 'aes-256-cbc';

// Derive a proper key from the source using scrypt
const deriveKey = (keySource: string): Buffer => {
  return scryptSync(keySource, 'salt', 32); // 32 bytes for AES-256
};

/**
 * Encrypts a string value using AES-256-CBC encryption
 */
export function encrypt(text: string): string {
  try {
    const key = deriveKey(ENCRYPTION_KEY_SOURCE);
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
    const key = deriveKey(ENCRYPTION_KEY_SOURCE);
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
 */
export function generateAppSecretProof(accessToken: string): string {
  const appSecret = process.env.FACEBOOK_APP_SECRET!;
  return createHash('sha256')
    .update(accessToken + appSecret)
    .digest('hex');
}

/**
 * Validates that an access token format is correct
 */
export function validateAccessTokenFormat(token: string): boolean {
  // Facebook access tokens are typically long alphanumeric strings
  // This is a basic validation - adjust as needed
  return typeof token === 'string' && 
         token.length > 50 && 
         /^[A-Za-z0-9_-]+$/.test(token);
}