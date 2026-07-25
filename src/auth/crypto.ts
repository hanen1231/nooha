export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;
export const PASSWORD_ITERATIONS = 310000;
export const PASSWORD_SALT_BYTES = 16;
export const SESSION_TOKEN_BYTES = 32;

const encoder = new TextEncoder();

type SubtleCryptoWithTimingSafeEqual = SubtleCrypto & {
  timingSafeEqual?: (left: Uint8Array, right: Uint8Array) => boolean;
};

export interface PasswordHash {
  hash: string;
  salt: string;
  iterations: number;
}

function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

export function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
}

export function base64UrlDecode(value: string): Uint8Array {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

export function validatePasswordLength(password: string): boolean {
  return password.length >= PASSWORD_MIN_LENGTH && password.length <= PASSWORD_MAX_LENGTH;
}

export function createSessionToken(): string {
  return base64UrlEncode(randomBytes(SESSION_TOKEN_BYTES));
}

export async function sha256Bytes(value: string | Uint8Array): Promise<Uint8Array> {
  const data = typeof value === "string" ? encoder.encode(value) : value;
  return new Uint8Array(await crypto.subtle.digest("SHA-256", data));
}

export async function sha256Base64Url(value: string | Uint8Array): Promise<string> {
  return base64UrlEncode(await sha256Bytes(value));
}

export async function secureCompareStrings(left: string, right: string): Promise<boolean> {
  const leftDigest = await sha256Bytes(left);
  const rightDigest = await sha256Bytes(right);
  return timingSafeEqual(leftDigest, rightDigest);
}

export function timingSafeEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.byteLength !== right.byteLength) {
    return false;
  }

  const subtle = crypto.subtle as SubtleCryptoWithTimingSafeEqual;
  if (typeof subtle.timingSafeEqual === "function") {
    return subtle.timingSafeEqual(left, right);
  }

  let difference = 0;
  for (let index = 0; index < left.byteLength; index += 1) {
    difference |= left[index] ^ right[index];
  }

  return difference === 0;
}

export async function hashSensitiveValue(value: string, pepper: string): Promise<string> {
  return sha256Base64Url(`${pepper}\u0000${value}`);
}

export async function hashSessionToken(token: string, pepper: string): Promise<string> {
  return hashSensitiveValue(`session:${token}`, pepper);
}

export async function hashIpAddress(ipAddress: string, pepper: string): Promise<string> {
  return hashSensitiveValue(`ip:${ipAddress}`, pepper);
}

export async function hashPassword(password: string, pepper: string): Promise<PasswordHash> {
  const saltBytes = randomBytes(PASSWORD_SALT_BYTES);
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(`${pepper}\u0000${password}`),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: saltBytes,
      iterations: PASSWORD_ITERATIONS
    },
    key,
    256
  );

  return {
    hash: base64UrlEncode(new Uint8Array(bits)),
    salt: base64UrlEncode(saltBytes),
    iterations: PASSWORD_ITERATIONS
  };
}

export async function verifyPassword(
  password: string,
  pepper: string,
  expectedHash: string,
  salt: string,
  iterations: number
): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(`${pepper}\u0000${password}`),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: base64UrlDecode(salt),
      iterations
    },
    key,
    256
  );

  return timingSafeEqual(new Uint8Array(bits), base64UrlDecode(expectedHash));
}
