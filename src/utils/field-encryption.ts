/**
 * Application-Level PII Encryption Utility - Camada 6 (Segurança de Banco de Dados)
 * OWASP A02: Cryptographic Failures
 *
 * Implements AES-256-GCM authenticated encryption for Personally Identifiable Information (PII)
 * stored in the database. Fields such as id_number (BI), phone, and email of clients are
 * encrypted BEFORE being persisted to the database, ensuring that even a direct DB dump
 * exposes only ciphertext, never plaintext personal data.
 *
 * Algorithm: AES-256-GCM
 *   - 256-bit key = 32 bytes from environment variable (FIELD_ENCRYPTION_KEY)
 *   - 96-bit IV = 12 bytes, randomly generated per encryption operation
 *   - 128-bit Authentication Tag = built-in with GCM mode, ensures integrity
 *
 * Storage format: "iv_hex:authTag_hex:ciphertext_hex"
 *   - All components are hex-encoded and joined by ":"
 *   - This allows the decrypt function to reliably extract each component
 *
 * ⚠️ IMPORTANT: Set FIELD_ENCRYPTION_KEY in .env.local
 *   Generate a secure key with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 *   The key must be exactly 64 hex characters (32 bytes).
 */

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits recommended for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits

/**
 * Retrieves and validates the encryption key from environment variables.
 * Throws a hard error if the key is missing or malformed (fail-secure).
 */
function getEncryptionKey(): Buffer {
  const hexKey = process.env.FIELD_ENCRYPTION_KEY;
  if (!hexKey) {
    throw new Error(
      "[SECURITY] FIELD_ENCRYPTION_KEY is not set in environment variables. " +
      "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
    );
  }
  if (hexKey.length !== 64) {
    throw new Error(
      "[SECURITY] FIELD_ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes).",
    );
  }
  return Buffer.from(hexKey, "hex");
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns a portable, self-contained string with IV + auth tag + ciphertext.
 *
 * @param plaintext - The string to encrypt (e.g. "123456789A", "+258 84 000 0000")
 * @returns Encrypted string in format "iv:authTag:ciphertext" (all hex-encoded)
 */
export function encryptField(plaintext: string): string {
  if (!plaintext) return plaintext;

  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [iv.toString("hex"), authTag.toString("hex"), encrypted.toString("hex")].join(":");
}

/**
 * Decrypts a string previously encrypted with encryptField().
 * Returns the original plaintext, or throws on integrity failure.
 *
 * @param ciphertext - Encrypted string in "iv:authTag:ciphertext" format
 * @returns The original decrypted plaintext string
 */
export function decryptField(ciphertext: string): string {
  if (!ciphertext) return ciphertext;

  // If the value doesn't match the encrypted format, return as-is (backward compat)
  const parts = ciphertext.split(":");
  if (parts.length !== 3) return ciphertext;

  try {
    const key = getEncryptionKey();
    const [ivHex, authTagHex, encryptedHex] = parts;

    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const encryptedData = Buffer.from(encryptedHex, "hex");

    const decipher = createDecipheriv(ALGORITHM, key, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  } catch {
    // Fail-secure: log and return a masked value rather than crashing the app
    console.error("[SECURITY] Field decryption failed — data may be corrupted or key changed.");
    return "[DADOS PROTEGIDOS]";
  }
}

/**
 * Encrypts all PII fields in a client record before DB insertion/update.
 * Only encrypts non-null string values.
 */
export function encryptClientPII<T extends {
  id_number?: string | null;
  phone?: string | null;
  email?: string | null;
}>(data: T): T {
  return {
    ...data,
    id_number: data.id_number ? encryptField(data.id_number) : data.id_number,
    phone: data.phone ? encryptField(data.phone) : data.phone,
    email: data.email ? encryptField(data.email) : data.email,
  };
}

/**
 * Decrypts all PII fields from a client record retrieved from the DB.
 */
export function decryptClientPII<T extends {
  id_number?: string | null;
  phone?: string | null;
  email?: string | null;
}>(data: T): T {
  return {
    ...data,
    id_number: data.id_number ? decryptField(data.id_number) : data.id_number,
    phone: data.phone ? decryptField(data.phone) : data.phone,
    email: data.email ? decryptField(data.email) : data.email,
  };
}
