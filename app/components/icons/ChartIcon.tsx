const ChartIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M3 3v18h18" />
    <path d="m9 9 2 2 4-4" />
    <path d="M18 12h-3" />
    <path d="M18 16h-3" />
    <path d="M18 8h-3" />
  </svg>
);

export default ChartIcon;
