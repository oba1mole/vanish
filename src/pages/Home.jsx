import { Link } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import SecurityBadge from "../components/SecurityBadge";

export default function Home() {
  return (
    <main className="page-shell home-page">
      <GlassCard className="hero-card">
        <div className="brand-mark">
          ◇
        </div>

        <span className="eyebrow">
          PRIVATE • TEMPORARY • ENCRYPTED
        </span>

        <h1>
          Messages
          <br />
          that <span>vanish.</span>
        </h1>

        <p className="hero-description">
          Create an encrypted one-time message.
          Share the link. Once it is successfully
          opened, the stored message is consumed.
        </p>

        <Link
          to="/create"
          className="glass-button primary-button hero-button"
        >
          Create Secure Message
        </Link>

        <SecurityBadge />
      </GlassCard>

      <div className="feature-grid">
        <GlassCard className="feature-card">
          <span className="feature-icon">
            🔐
          </span>

          <h3>
            Encrypted before upload
          </h3>

          <p>
            Your plaintext is encrypted inside
            the browser before it reaches the
            backend.
          </p>
        </GlassCard>

        <GlassCard className="feature-card">
          <span className="feature-icon">
            🔥
          </span>

          <h3>
            Read once
          </h3>

          <p>
            The backend atomically consumes the
            message when it is successfully opened.
          </p>
        </GlassCard>

        <GlassCard className="feature-card">
          <span className="feature-icon">
            ⏱
          </span>

          <h3>
            Automatic expiry
          </h3>

          <p>
            Messages can be configured to expire
            automatically.
          </p>
        </GlassCard>
      </div>

      <p className="privacy-disclaimer">
        VANISH cannot prevent screenshots, screen
        recording, compromised devices, or copies
        made outside the application.
      </p>
    </main>
  );
}