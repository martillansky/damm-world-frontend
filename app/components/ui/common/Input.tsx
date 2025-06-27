interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type: string;
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  handleMaxClick?: () => void;
  labelMax?: React.ReactNode;
}
const Input = ({
  type,
  label,
  value,
  onChange,
  placeholder,
  handleMaxClick,
  labelMax,
}: InputProps) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-muted-light dark:text-muted mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 rounded-xl bg-surface-hover-light dark:bg-surface-hover border border-border-light dark:border-border text-foreground-light dark:text-foreground focus:outline-none focus:ring-2 focus:ring-lime-400/20"
        placeholder={placeholder}
      />
      {handleMaxClick && (
        <button
          onClick={handleMaxClick}
          className="mt-1 text-xs text-lime-400 hover:text-lime-500 transition-colors text-left w-full"
        >
          {labelMax}
        </button>
      )}
    </div>
  );
};

export default Input;
