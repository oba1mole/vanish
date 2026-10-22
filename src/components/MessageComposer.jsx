import { useState } from "react";
import GlassCard from "./GlassCard";
import GlassButton from "./GlassButton";
import BurnTimer from "./BurnTimer";
import {
  createBurnMessage
} from "../lib/message";

const expiryOptions = [
  {
    label: "10 minutes",
    value: 10
  },
  {
    label: "1 hour",
    value: 60
  },
  {
    label: "6 hours",
    value: 360
  },
  {
    label: "24 hours",
    value: 1440
  },
  {
    label: "7 days",
    value: 10080
  }
];

export default function MessageComposer({
  onCreated
}) {
  const [message, setMessage] =
    useState("");

  const [expiry, setExpiry] =
    useState(60);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [result, setResult] =
    useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setResult(null);

    if (!message.trim()) {
      setError(
        "Write a message before creating the link."
      );

      return;
    }

    setLoading(true);

    try {
      const created =
        await createBurnMessage(
          message,
          expiry
        );

      /*
       * The plaintext is no longer needed.
       */
      setMessage("");

      setResult(created);

      if (onCreated) {
        onCreated(created);
      }
    } catch (err) {
      setError(
        err?.message ||
          "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  const burnUrl =
    result
      ? `${window.location.origin}/s/${result.id}#${result.key}`
      : "";

  const copyLink = async () => {
    if (!burnUrl) return;

    try {
      await navigator.clipboard.writeText(
        burnUrl
      );
    } catch {
      setError(
        "Your browser blocked clipboard access. Copy the link manually."
      );
    }
  };

  return (
    <GlassCard className="composer-card">
      {!result ? (
        <form onSubmit={handleSubmit}>
          <div className="card-heading">
            <span className="eyebrow">
              SECURE MESSAGE
            </span>

            <h1>
              Say it.
              <br />
              Then let it vanish.
            </h1>

            <p>
              Your message is encrypted in your
              browser before it reaches the server.
            </p>
          </div>

          <label
            htmlFor="message"
            className="sr-only"
          >
            Your message
          </label>

          <textarea
            id="message"
            value={message}
            onChange={(event) =>
              setMessage(
                event.target.value
              )
            }
            placeholder="Write your secret message..."
            maxLength={10000}
            autoComplete="off"
            spellCheck="false"
            className="message-input"
          />

          <div className="composer-footer">
            <span className="character-count">
              {message.length} / 10,000
            </span>

            <label className="expiry-select">
              <span>Expires</span>

              <select
                value={expiry}
                onChange={(event) =>
                  setExpiry(
                    Number(event.target.value)
                  )
                }
              >
                {expiryOptions.map(
                  (option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  )
                )}
              </select>
            </label>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <GlassButton
            type="submit"
            disabled={loading}
            className="primary-button"
          >
            {loading
              ? "Encrypting..."
              : "🔒 Create Burn Link"}
          </GlassButton>
        </form>
      ) : (
        <div className="link-result">
          <div className="success-icon">
            ✓
          </div>

          <span className="eyebrow">
            BURN LINK CREATED
          </span>

          <h2>
            Your message is ready.
          </h2>

          <p>
            Anyone with this link can read
            the message once. After successful
            retrieval, it is consumed.
          </p>

          <div className="generated-link">
            {burnUrl}
          </div>

          <div className="link-actions">
            <GlassButton
              onClick={copyLink}
              className="primary-button"
            >
              Copy Secure Link
            </GlassButton>

            <GlassButton
              onClick={() => {
                setResult(null);
                setError("");
              }}
            >
              Create Another
            </GlassButton>
          </div>

          <BurnTimer
            expiresAt={result.expiresAt}
          />

          <small className="warning-text">
            ⚠️ Anyone who receives the link may
            open the message. Do not send it
            through an untrusted channel.
          </small>
        </div>
      )}
    </GlassCard>
  );
}