const VaultPerformanceIcon = ({
  className = "w-6 h-6",
}: {
  className?: string;
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    {/* Zigzag performance line with increasing values */}
    <path
      d="M3 17L8 14L12 16L16 10L18 6"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Arrowhead pointing straight up from last vertex */}
    <path
      d="M18 6L18 3M18 3L16.5 4.5M18 3L19.5 4.5"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default VaultPerformanceIcon;
