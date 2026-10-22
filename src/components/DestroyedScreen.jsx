import GlassCard from "./GlassCard";

export default function DestroyedScreen({
  title = "Message destroyed",
  description = "This message can no longer be accessed."
}) {
  return (
    <main className="page-shell">
      <GlassCard className="destroyed-card">
        <div className="destroyed-icon">
          ✓
        </div>

        <h1>{title}</h1>

        <p>{description}</p>

        <div className="destroyed-status">
          <span />
          One-time access completed
        </div>
      </GlassCard>
    </main>
  );
}