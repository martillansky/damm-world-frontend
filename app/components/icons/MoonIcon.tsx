const MoonIcon = ({
  className = "w-5 h-5 text-muted-light dark:text-muted hover:text-lime-400 drop-shadow-[0_0_1px_rgba(163,230,53,0.3)]",
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
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export default MoonIcon;
