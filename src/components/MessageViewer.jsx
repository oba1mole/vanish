import { useEffect, useState } from "react";
import GlassCard from "./GlassCard";
import GlassButton from "./GlassButton";
import DestroyedScreen from "./DestroyedScreen";
import {
  consumeBurnMessage
} from "../lib/message";
import {
  decryptMessage
} from "../lib/crypto";

export default function MessageViewer({
  messageId,
  decryptionKey
}) {
  const [state, setState] =
    useState("loading");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    let active = true;

    async function readOnce() {
      try {
        if (!messageId) {
          throw new Error(
            "Missing message ID."
          );
        }

        if (!decryptionKey) {
          throw new Error(
            "Missing decryption key."
          );
        }

        /*
         * CRITICAL:
         *
         * This call consumes the database
         * record atomically.
         */
        const encrypted =
          await consumeBurnMessage(
            messageId
          );

        if (!active) return;

        const plaintext =
          await decryptMessage(
            encrypted.ciphertext,
            encrypted.iv,
            decryptionKey
          );

        if (!active) return;

        setMessage(plaintext);
        setState("ready");

        /*
         * Remove the key from the visible URL.
         *
         * The browser history entry is also replaced.
         */
        window.history.replaceState(
          null,
          "",
          `/s/${messageId}`
        );
      } catch (err) {
        if (!active) return;

        setError(
          err?.message ||
            "This message cannot be opened."
        );

        setState("error");
      }
    }

    readOnce();

    return () => {
      active = false;
    };
  }, [messageId, decryptionKey]);

  useEffect(() => {
    if (state !== "ready") {
      return;
    }

    /*
     * Best-effort protection against accidental
     * copying. This cannot prevent screenshots
     * or malicious screen capture.
     */
    const preventCopy = (event) => {
      event.preventDefault();
    };

    document.addEventListener(
      "copy",
      preventCopy
    );

    document.addEventListener(
      "cut",
      preventCopy
    );

    return () => {
      document.removeEventListener(
        "copy",
        preventCopy
      );

      document.removeEventListener(
        "cut",
        preventCopy
      );
    };
  }, [state]);

  if (state === "loading") {
    return (
      <main className="page-shell">
        <GlassCard className="viewer-card loading-card">
          <div className="loader" />

          <h2>
            Opening secure message...
          </h2>

          <p>
            This link can only be consumed once.
          </p>
        </GlassCard>
      </main>
    );
  }

  if (state === "error") {
    return (
      <DestroyedScreen
        title="Message unavailable"
        description={
          error ||
          "This message has expired, already been read, or does not exist."
        }
      />
    );
  }

  return (
    <main className="page-shell">
      <GlassCard className="viewer-card">
        <div className="viewer-header">
          <span className="eyebrow">
            ONE-TIME MESSAGE
          </span>

          <div className="live-indicator">
            <span />
            Read once
          </div>
        </div>

        <div className="message-display">
          {message}
        </div>

        <div className="viewer-warning">
          <strong>
            This message has been consumed.
          </strong>

          <span>
            Leaving this page will not restore
            the message.
          </span>
        </div>

        <GlassButton
          onClick={() => {
            setMessage("");
            setState("destroyed");
          }}
          className="primary-button"
        >
          Destroy From Screen
        </GlassButton>
      </GlassCard>
    </main>
  );
}