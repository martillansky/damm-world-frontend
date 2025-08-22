import { ChartRangeTypes } from "@/lib/api/types/Snapshots.types";
import React, { useState } from "react";
import ViewToggle from "./ViewToggle";

interface ChartCardProps {
  title?: string;
  subtitle?: string;
  variant?: "large" | "small";
  children: React.ReactNode;
  selector?: React.ReactNode;
  light?: boolean;
  onViewChange?: (viewId: ChartRangeTypes) => void;
  externalToggle?: {
    externalToggleOptions: { id: string; label: string }[];
    externalToggleDisplayLabels: Record<string, string>;
    externalToggleValue: string;
    externalToggleOnChange: (value: string) => void;
  };
}

const ChartCard = ({
  children,
  title,
  subtitle,
  variant = "large",
  selector,
  light = false,
  onViewChange,
  externalToggle,
}: ChartCardProps) => {
  const [activeView, setActiveView] = useState<ChartRangeTypes>("1m");
  const viewOptions: { id: ChartRangeTypes; label: string }[] = [
    {
      id: "24h",
      label: "24h",
    },
    {
      id: "7d",
      label: "7d",
    },
    {
      id: "1m",
      label: "1m",
    },
    {
      id: "6m",
      label: "6m",
    },
    {
      id: "1y",
      label: "1y",
    },
    {
      id: "all",
      label: "All",
    },
  ];

  const backgorundColor = light
    ? "from-gray-200 to-gray-300 dark:from-zinc-800 dark:to-zinc-700"
    : "from-gray-100 to-gray-200 dark:from-zinc-900 dark:to-zinc-800";

  const sectionCore = `card bg-gradient-to-br dark:bg-gradient-to-br border-0 dark:border dark:border-zinc-800 ${backgorundColor} mb-12`;
  const sectionLarge = `${sectionCore} p-6`;
  const sectionSmall = `${sectionCore} p-4`;
  const containerLarge = "space-y-6";
  const containerSmall = "space-y-3";
  const containerBodyLarge = "space-y-4";
  const containerBodySmall = "space-y-2";

  return (
    <section
      className={variant === "large" ? sectionLarge : sectionSmall}
      style={{ position: "relative", zIndex: 1 }}
    >
      <div className={variant === "large" ? containerLarge : containerSmall}>
        <div className="mb-1">
          <div className="flex items-center w-full">
            {title && (
              <h3 className="text-lg font-semibold justify-start w-full">
                {title}
              </h3>
            )}
            {externalToggle && (
              <div className="flex items-center gap-2 justify-start w-full">
                <ViewToggle
                  views={externalToggle.externalToggleOptions}
                  activeView={externalToggle.externalToggleValue}
                  onViewChange={(viewId) => {
                    externalToggle.externalToggleOnChange(viewId as string);
                  }}
                  className="scale-75"
                />
              </div>
            )}
            {selector && (
              <div className="flex items-center gap-2 justify-end w-full">
                {selector}
              </div>
            )}
          </div>

          {subtitle && (
            <p className="text-sm text-muted-light dark:text-muted">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className={
            variant === "large" ? containerBodyLarge : containerBodySmall
          }
        >
          <div className="w-full h-96">{children}</div>
        </div>
      </div>
      {/* Fixed View Toggle */}
      <div className="fixed justify-center" style={{ zIndex: 1 }}>
        <ViewToggle
          views={viewOptions}
          activeView={activeView}
          onViewChange={(viewId) => {
            setActiveView(viewId as ChartRangeTypes);
            onViewChange?.(viewId as ChartRangeTypes);
          }}
          className="scale-75"
        />
      </div>
    </section>
  );
};

export default ChartCard;
