"use client";

import { useEffect } from "react";
import CheckIcon from "../../icons/CheckIcon";
import CloseIcon from "../../icons/CloseIcon";
import ErrorIcon from "../../icons/ErrorIcon";
import InfoIcon from "../../icons/InfoIcon";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  show: boolean;
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  show,
  message,
  type = "info",
  onClose,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckIcon />;
      case "error":
        return <ErrorIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "bg-lime-400/10";
      case "error":
        return "bg-red-400/10";
      default:
        return "bg-blue-400/10";
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <div
        className={`flex items-center gap-2 px-4 py-3 rounded-xl ${getBackgroundColor()} backdrop-blur-sm border border-border-light dark:border-zinc-800 shadow-lg`}
      >
        <div className="flex-shrink-0">{getIcon()}</div>
        <p className="text-sm text-foreground-light dark:text-foreground">
          {message}
        </p>
        <button
          onClick={onClose}
          className="ml-2 flex-shrink-0 text-muted hover:text-foreground-light dark:hover:text-foreground transition-colors"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}
