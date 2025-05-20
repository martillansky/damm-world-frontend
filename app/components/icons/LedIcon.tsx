export default function LedIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-pulse"
    >
      <circle cx="5" cy="5" r="4" fill="#A3E635" />
      <circle cx="5" cy="5" r="4" fill="#A3E635" fillOpacity="0.5">
        <animate
          attributeName="r"
          values="4;5;4"
          dur="1.5s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="fill-opacity"
          values="0.5;0;0.5"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}
