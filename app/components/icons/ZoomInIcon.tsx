const ZoomInIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
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

    {/* Plus sign inside the magnifying glass */}
    <path d="M11 7v8M7 11h8" />
  </svg>
);

export default ZoomInIcon;
