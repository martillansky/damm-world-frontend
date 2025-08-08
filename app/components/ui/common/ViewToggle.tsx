import React from "react";

interface ViewToggleProps {
  views: {
    id: string;
    label: string;
    icon?: React.ReactNode;
  }[];
  activeView: string;
  onViewChange: (viewId: string) => void;
  className?: string;
}

export default function ViewToggle({
  views,
  activeView,
  onViewChange,
  className = "",
}: ViewToggleProps) {
  return (
    <div
      className={`flex bg-surface-light dark:bg-zinc-900 rounded-xl p-1 border border-border-light dark:border-zinc-800 ${className}`}
    >
      {views.map((view) => (
        <button
          key={view.id}
          onClick={() => onViewChange(view.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 text-sm font-medium ${
            activeView === view.id
              ? "bg-white dark:bg-zinc-800 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-700 border-2 border-lime-400/80 hover:border-lime-400"
              : "text-muted-light dark:text-muted hover:text-foreground-light dark:hover:text-foreground"
          }`}
        >
          {view.icon && <span className="w-4 h-4">{view.icon}</span>}
          {view.label}
        </button>
      ))}
    </div>
  );
}
