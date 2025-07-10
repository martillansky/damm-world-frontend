const DoubleCheckIcon = ({
  className = "w-4 h-4 text-lime-400",
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
    <path d="M20 6L9 17l-5-5" />
    <path d="M24 6L15 17l-1.5-1.5" />
  </svg>
);

export default DoubleCheckIcon;
