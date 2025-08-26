import { useState } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type: string;
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  handleMaxClick?: () => void;
  labelMax?: React.ReactNode;
  max?: number;
  validInput?: (valid: boolean) => void;
}

const Input = ({
  type,
  label,
  value,
  onChange,
  placeholder,
  handleMaxClick,
  labelMax,
  max,
  validInput,
}: InputProps) => {
  const [maxExceeded, setMaxExceeded] = useState(
    max !== undefined && max <= 0 ? true : false
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (max !== undefined) {
      const numericValue = Number(e.target.value);
      let maxExceeded = false;
      if (numericValue > max) {
        maxExceeded = true;
      } else {
        maxExceeded = false;
      }
      setMaxExceeded(maxExceeded);
      if (validInput) validInput(!maxExceeded);
    }
    onChange(e);
  };

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
        onChange={handleChange}
        className={`w-full px-4 py-2 rounded-xl bg-surface-hover-light dark:bg-surface-hover border border-border-light dark:border-border focus:outline-none focus:ring-2 focus:ring-lime-400/20 ${
          maxExceeded
            ? "text-red-500 border-red-500 focus:ring-red-400/20"
            : "text-foreground-light dark:text-foreground"
        }`}
        placeholder={placeholder}
      />
      {handleMaxClick && (
        <button
          onClick={() => {
            handleChange({
              target: { value: max?.toString() },
            } as React.ChangeEvent<HTMLInputElement>);
            handleMaxClick();
          }}
          className="mt-1 text-xs text-lime-400 hover:text-lime-500 transition-colors text-left w-full"
        >
          {labelMax}
        </button>
      )}
    </div>
  );
};

export default Input;
