import React, { useEffect, useRef, useState } from "react";

interface SelectProps {
  label?: string;
  options: string[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  displayLabels?: Record<string, string>;
  size?: "default" | "small";
}

const Select = ({
  label,
  options,
  value,
  onChange,
  displayLabels,
  size = "default",
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || options[0] || "");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    setSelectedValue(option);
    setIsOpen(false);
    // Simulate the onChange event
    if (onChange) {
      const syntheticEvent = {
        target: { value: option },
      } as React.ChangeEvent<HTMLSelectElement>;
      onChange(syntheticEvent);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-muted-light dark:text-muted mb-2">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full rounded-xl bg-surface-hover-light dark:bg-surface-hover border border-border-light dark:border-border text-foreground-light dark:text-foreground focus:outline-none focus:ring-2 focus:ring-lime-400/20 text-left flex justify-between items-center ${
          size === "small" ? "px-2 py-1 text-xs font-medium" : "px-4 py-2"
        }`}
      >
        <span>{displayLabels?.[selectedValue] || selectedValue}</span>
        <svg
          className={`transition-transform ${isOpen ? "rotate-180" : ""} ${
            size === "small" ? "w-3 h-3" : "w-4 h-4"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-1 bg-surface-hover-light dark:bg-surface-hover border border-border-light dark:border-border rounded-xl shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleSelect(option)}
              className={`w-full text-left hover:bg-lime-400/10 transition-colors ${
                option === selectedValue
                  ? "bg-lime-400/20 text-lime-400"
                  : "text-foreground-light dark:text-foreground"
              } ${size === "small" ? "px-2 py-1 text-xs" : "px-4 py-2"}`}
            >
              {displayLabels?.[option] || option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Select;
