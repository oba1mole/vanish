export default function SecurityBadge() {
  return (
    <div className="security-badge">
      <span className="security-dot" />

      <span>
        Client-side encrypted
      </span>

      <span className="security-divider">
        •
      </span>

      <span>
        One-time access
      </span>

      <span className="security-divider">
        •
      </span>

      <span>
        No account required
      </span>
    </div>
  );
}