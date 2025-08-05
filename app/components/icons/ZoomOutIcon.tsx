const ZoomOutIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    {/* Magnifying glass circle */}
    <circle cx="11" cy="11" r="8" />

    {/* Magnifying glass handle */}
    <path d="m21 21-4.35-4.35" />

    {/* Minus sign inside the magnifying glass */}
    <path d="M7 11h8" />
  </svg>
);

export default ZoomOutIcon;
