import { supabase } from "./supabase";
import {
  encryptMessage
} from "./crypto";
import {
  debugLog,
  debugError,
  validateMessageId
} from "./security";

const MAX_MESSAGE_LENGTH = 10000;

const DEFAULT_EXPIRY_MINUTES = 60;


/*
 * Share an in-flight consume request when React
 * invokes the same viewer effect more than once.
 */
const consumeRequests = new Map();


export async function createBurnMessage(
  plaintext,
  expiryMinutes = DEFAULT_EXPIRY_MINUTES
) {
  if (typeof plaintext !== "string" || !plaintext.trim()) {
    throw new Error("Please enter a message.");
  }

  if (plaintext.length > MAX_MESSAGE_LENGTH) {
    throw new Error(
      `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`
    );
  }

  const expiry = Number(expiryMinutes);

  if (!Number.isFinite(expiry) || expiry < 1 || expiry > 10080) {
    throw new Error("Expiry must be between 1 minute and 7 days.");
  }

  try {
    const encrypted = await encryptMessage(plaintext);

    const expiresAt = new Date(
      Date.now() + expiry * 60 * 1000
    ).toISOString();

    // Generate the message ID locally; do not request it back from Supabase.
    const messageId = crypto.randomUUID();

    const { error } = await supabase
      .from("burn_messages")
      .insert({
        id: messageId,
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
        expires_at: expiresAt
      });

    if (error) {
      debugError(error);
      throw new Error("Unable to create the secure message.");
    }

    debugLog("Encrypted message created:", messageId);

    return {
      id: messageId,
      key: encrypted.key,
      expiresAt
    };
  } catch (error) {
    debugError(error);

    throw error instanceof Error
      ? error
      : new Error("An unexpected error occurred.");
  }
}


async function consumeBurnMessageOnce(messageId) {
  const functionUrl =
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/consume-message`;

  const response = await fetch(functionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      Authorization:
        `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({ id: messageId }),
    cache: "no-store"
  });

  if (response.status === 404) {
    throw new Error(
      "This message has already been read, expired, or destroyed."
    );
  }

  if (!response.ok) {
    throw new Error("Unable to retrieve this message.");
  }

  const data = await response.json();

  if (!data?.ciphertext || !data?.iv) {
    throw new Error("The message data is incomplete.");
  }

  return data;
}

export function consumeBurnMessage(messageId) {
  if (!validateMessageId(messageId)) {
    return Promise.reject(
      new Error("Invalid message link.")
    );
  }

  const existingRequest = consumeRequests.get(messageId);

  if (existingRequest) {
    return existingRequest;
  }

  const request = consumeBurnMessageOnce(messageId)
    .catch((error) => {
      debugError(error);
      throw error instanceof Error
        ? error
        : new Error("Unable to consume message.");
    })
    .finally(() => {
      if (consumeRequests.get(messageId) === request) {
        consumeRequests.delete(messageId);
      }
    });

  consumeRequests.set(messageId, request);

  return request;
}
