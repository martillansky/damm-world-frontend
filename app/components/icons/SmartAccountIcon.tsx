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
    {/* Combination lock wheel - bigger */}
    <circle cx="12" cy="12" r="10" />
    {/* Center dial - bigger */}
    <circle cx="12" cy="12" r="4" />
    {/* Dial markings - clearer and more prominent */}
    <path d="M12 2v3" />
    <path d="M12 19v3" />
    <path d="M2 12h3" />
    <path d="M19 12h3" />
    <path d="M5 5l2 2" />
    <path d="M17 17l2 2" />
    <path d="M5 19l2-2" />
    <path d="M17 5l2-2" />
    {/* Center indicator - bigger */}
    <path d="M12 10v4" />
  </svg>
);

export default SmartAccountIcon;
