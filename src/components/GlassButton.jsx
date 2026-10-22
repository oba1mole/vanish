export default function GlassButton({
  children,
  type = "button",
  onClick,
  disabled = false,
  className = ""
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`glass-button ${className}`}
    >
      {children}
    </button>
  );
}