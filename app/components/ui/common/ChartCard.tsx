import React from "react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  variant?: "large" | "small";
  children: React.ReactNode;
  selector?: React.ReactNode;
}

const ChartCard = ({
  children,
  title,
  subtitle,
  variant = "large",
  selector,
}: ChartCardProps) => {
  const sectionCore =
    "card bg-gradient-to-br from-gray-100 to-gray-200 dark:bg-gradient-to-br dark:from-zinc-900 dark:to-zinc-800 border-0 dark:border dark:border-zinc-800";
  const sectionLarge = `${sectionCore} p-6`;
  const sectionSmall = `${sectionCore} p-4`;
  const containerLarge = "space-y-6";
  const containerSmall = "space-y-3";
  const containerBodyLarge = "space-y-4";
  const containerBodySmall = "space-y-2";

  return (
    <section className={variant === "large" ? sectionLarge : sectionSmall}>
      <div className={variant === "large" ? containerLarge : containerSmall}>
        <div className="mb-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{title}</h3>
            {selector && (
              <div className="flex items-center gap-2">{selector}</div>
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
    </section>
  );
};

export default ChartCard;
