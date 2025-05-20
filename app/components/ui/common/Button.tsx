interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

export default function Button({
  children,
  onClick,
  variant = "primary",
}: ButtonProps) {
  const classNamePrimary =
    "flex-1 px-4 py-2 rounded-xl bg-lime-400 text-black font-medium hover:bg-lime-500 transition-all duration-200 flex items-center justify-center space-x-2";
  const classNameSecondary =
    "flex-1 px-4 py-2 rounded-xl bg-white dark:bg-zinc-800 text-black dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors border-2 border-lime-400/80 hover:border-lime-400";
  return (
    <button
      onClick={onClick}
      className={variant === "primary" ? classNamePrimary : classNameSecondary}
    >
      {children}
    </button>
  );
}
