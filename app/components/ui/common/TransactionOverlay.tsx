import React from "react";
import OverlayErrorIcon from "../../icons/OverlayErrorIcon";
import OverlaySuccessIcon from "../../icons/OverlaySuccessIcon";

interface TransactionOverlayProps {
  isVisible: boolean;
  title: string;
  message: string;
  status?: "pending" | "success" | "error";
  onClose?: () => void;
}

export default function TransactionOverlay({
  isVisible,
  title,
  message,
  status = "pending",
  onClose,
}: TransactionOverlayProps) {
  if (!isVisible) return null;

  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "text-green-500";
      case "error":
        return "text-red-500";
      default:
        return "text-lime-400";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "success":
        return <OverlaySuccessIcon />;
      case "error":
        return <OverlayErrorIcon />;
      default:
        return (
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 border-2 border-lime-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface-light dark:bg-zinc-900 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-border-light dark:border-zinc-800">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Status Icon */}
          <div className={`${getStatusColor()} mb-2`}>{getStatusIcon()}</div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-foreground-light dark:text-foreground">
            {title}
          </h3>

          {/* Message */}
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {message}
          </p>

          {/* Progress Bar for Pending Status */}
          {status === "pending" && (
            <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-2 mt-4">
              <div className="bg-lime-400 h-2 rounded-full animate-pulse"></div>
            </div>
          )}

          {/* Close Button for Success/Error */}
          {(status === "success" || status === "error") && onClose && (
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-lime-400 hover:bg-lime-500 text-black rounded-lg transition-colors duration-200"
            >
              {status === "success" ? "Continue" : "Close"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
