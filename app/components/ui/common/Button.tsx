interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

export default function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
}: ButtonProps) {
  const commonClasses =
    "transition-all duration-200 flex items-center justify-center space-x-4";
  const classNamePrimary = `flex-1 px-4 py-2 rounded-xl bg-lime-400 text-black font-medium hover:bg-lime-500 ${commonClasses}`;
  const classNameSecondary = `flex-1 px-4 py-2 rounded-xl bg-white dark:bg-zinc-800 text-black dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors border-2 border-lime-400/80 hover:border-lime-400 ${commonClasses}`;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={
        disabled
          ? `flex-1 px-4 py-2 rounded-xl bg-gray-300 text-gray-500 dark:bg-gray-500 dark:text-gray-800 font-medium ${commonClasses}`
          : variant === "primary"
          ? classNamePrimary
          : classNameSecondary
      }
    >
      {children}
    </button>
  );
}
