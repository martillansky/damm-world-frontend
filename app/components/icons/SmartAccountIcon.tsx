const SmartAccountIcon = ({
  className = "w-6 h-6",
}: {
  className?: string;
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    {/* Coin circle */}
    <circle cx="12" cy="12" r="10" />

    {/* Inner circle for coin effect */}
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1" />

    {/* $ symbol */}
    <text
      x="12"
      y="16"
      textAnchor="middle"
      className="text-xs fill-current"
      style={{ strokeWidth: "0.2" }}
    >
      $
    </text>
  </svg>
);

export default SmartAccountIcon;
