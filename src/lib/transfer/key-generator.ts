// Preferred character set excluding ambiguous characters (0, O, I, 1)
const TRANSFER_KEY_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const KEY_LENGTH = 6;

/**
 * Generates a cryptographically random transfer key.
 * Length: 6 characters
 * Charset: ABCDEFGHJKLMNPQRSTUVWXYZ23456789
 */
export function generateTransferKey(): string {
  const chars = TRANSFER_KEY_CHARSET;
  const charsLength = chars.length;
  let key = '';

  const randomValues = new Uint8Array(KEY_LENGTH);

  if (typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(randomValues);
  } else {
    // Fallback pseudo-random for edge cases where crypto API is unavailable
    for (let i = 0; i < KEY_LENGTH; i++) {
      randomValues[i] = Math.floor(Math.random() * 256);
    }
  }

  for (let i = 0; i < KEY_LENGTH; i++) {
    const randomIndex = randomValues[i] % charsLength;
    key += chars.charAt(randomIndex);
  }

  return key;
}

/**
 * Sanitizes and formats a raw key input from the user.
 * Example: " 1a3s7k " -> "1A3S7K"
 */
export function sanitizeTransferKey(rawKey: string): string {
  if (!rawKey) return '';
  return rawKey
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

/**
 * Validates whether a key matches the expected transfer key format.
 */
export function isValidKeyFormat(key: string): boolean {
  const sanitized = sanitizeTransferKey(key);
  // Key should be 6 characters long and only contain charset characters
  const regex = new RegExp(`^[${TRANSFER_KEY_CHARSET}]{6}$`);
  return regex.test(sanitized);
}
