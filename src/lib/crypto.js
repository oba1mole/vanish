const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bytesToBase64Url(bytes) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlToBytes(value) {
  const normalized = value
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const padded =
    normalized + "=".repeat((4 - (normalized.length % 4)) % 4);

  const binary = atob(padded);

  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export async function generateKey() {
  return crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256
    },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function exportKey(key) {
  const rawKey = await crypto.subtle.exportKey("raw", key);

  return bytesToBase64Url(new Uint8Array(rawKey));
}

export async function importKey(encodedKey) {
  if (!encodedKey) {
    throw new Error("Missing encryption key.");
  }

  const rawKey = base64UrlToBytes(encodedKey);

  if (rawKey.length !== 32) {
    throw new Error("Invalid encryption key.");
  }

  return crypto.subtle.importKey(
    "raw",
    rawKey,
    {
      name: "AES-GCM"
    },
    false,
    ["decrypt"]
  );
}

export async function encryptMessage(message) {
  if (typeof message !== "string") {
    throw new Error("Message must be text.");
  }

  if (!message.trim()) {
    throw new Error("Message cannot be empty.");
  }

  const key = await generateKey();

  const iv = crypto.getRandomValues(
    new Uint8Array(12)
  );

  const plaintext = encoder.encode(message);

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv
    },
    key,
    plaintext
  );

  return {
    ciphertext: bytesToBase64Url(
      new Uint8Array(ciphertext)
    ),

    iv: bytesToBase64Url(iv),

    key: await exportKey(key)
  };
}

export async function decryptMessage(
  ciphertext,
  iv,
  encodedKey
) {
  if (!ciphertext || !iv || !encodedKey) {
    throw new Error("Incomplete encrypted message.");
  }

  const key = await importKey(encodedKey);

  const ciphertextBytes = base64UrlToBytes(ciphertext);
  const ivBytes = base64UrlToBytes(iv);

  const plaintext = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: ivBytes
    },
    key,
    ciphertextBytes
  );

  return decoder.decode(plaintext);
}

// This is the core browser encryption system.
// It uses:
//- AES-GCM
//- 256-bit encryption key
//- Web Crypto API
//- random IV
//- URL fragment for the decryption key