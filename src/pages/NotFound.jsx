import { Link } from "react-router-dom";
import GlassCard from "../components/GlassCard";

export default function NotFound() {
  return (
    <main className="page-shell">
      <GlassCard className="not-found-card">
        <div className="destroyed-icon">
          ?
        </div>

        <h1>
          Nothing here.
        </h1>

        <p>
          The page you're looking for doesn't
          exist.
        </p>

        <Link
          to="/"
          className="glass-button primary-button"
        >
          Return Home
        </Link>
      </GlassCard>
    </main>
  );
}