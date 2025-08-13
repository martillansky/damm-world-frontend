import { cloneElement, isValidElement, ReactElement } from "react";

export interface CardRowProps {
  left: React.ReactNode;
  tooltip?: string;
  right?: React.ReactNode;
  highlightedRight?: boolean;
  secondaryRight?: React.ReactNode;
  variant?: "small" | "large";
  horizontalLine?: boolean;
  style?: "observation" | "default";
}

export const CardRow = ({
  left,
  tooltip,
  highlightedRight,
  right,
  secondaryRight,
  variant,
  horizontalLine = false,
  style = "default",
}: CardRowProps) => {
  const rowMeta = "flex justify-between items-center";
  const rowCore = `${rowMeta} ${
    horizontalLine ? "border-b border-border-light dark:border-border" : ""
  }`;
  const rowLarge = `${rowCore} py-2`;
  const rowSmall = `${rowCore} py-1`;

  return (
    <div className={variant === "large" ? rowLarge : rowSmall}>
      <span
        className={
          style === "observation" ? "" : "text-muted-light dark:text-muted"
        }
      >
        {left}
        {tooltip && (
          <span className="ml-1 text-xs cursor-help" title={tooltip}>
            ℹ️
          </span>
        )}
      </span>
      {right && (
        <div className="text-right">
          <span
            className={`text-lg font-medium ${
              highlightedRight
                ? "text-lime-400 drop-shadow-[0_0_1px_rgba(163,230,53,0.3)]"
                : ""
            }`}
          >
            {right}
          </span>
          {secondaryRight && (
            <span className="text-sm text-muted-light dark:text-muted ml-2">
              {secondaryRight}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

interface CardProps {
  title?: string;
  subtitle?: string;
  variant?: "large" | "small";
  children?: ReactElement<CardRowProps> | ReactElement<CardRowProps>[];
  selector?: React.ReactNode;
  onClick?: () => void;
  light?: boolean;
}

const Card = ({
  children,
  title,
  subtitle,
  variant = "large",
  selector,
  onClick,
  light = false,
}: CardProps) => {
  const backgorundColor = light
    ? "from-gray-200 to-gray-300 dark:from-zinc-800 dark:to-zinc-700"
    : "from-gray-100 to-gray-200 dark:from-zinc-900 dark:to-zinc-800";
  const sectionCore = `card bg-gradient-to-br dark:bg-gradient-to-br ${backgorundColor} border-0 dark:border dark:border-zinc-800`;
  /* const sectionCore =
    "card bg-gradient-to-br from-gray-100 to-gray-200 dark:bg-gradient-to-br dark:from-zinc-900 dark:to-zinc-800 border-0 dark:border dark:border-zinc-800"; */
  const sectionLarge = `${sectionCore} p-6`;
  const sectionSmall = `${sectionCore} p-4`;
  const containerLarge = "space-y-6";
  const containerSmall = "space-y-3";
  const containerBodyLarge = "space-y-4";
  const containerBodySmall = "grid gap-2";

  const renderChildren = () => {
    const childrenLength = Array.isArray(children) ? children.length : 1;
    const horizontalLine = childrenLength > 1;
    return Array.isArray(children)
      ? children.map((child, i) =>
          isValidElement(child)
            ? cloneElement(child, {
                variant,
                key: i,
                horizontalLine: horizontalLine && i < childrenLength - 1,
              })
            : child
        )
      : isValidElement(children)
      ? cloneElement(children, { variant })
      : children;
  };

  return (
    <section
      className={variant === "large" ? sectionLarge : sectionSmall}
      onClick={onClick}
    >
      <div className={variant === "large" ? containerLarge : containerSmall}>
        <div className="mb-1">
          {title && (
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{title}</h3>
              {selector && (
                <div className="flex items-center gap-2">{selector}</div>
              )}
            </div>
          )}
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
          {renderChildren()}
        </div>
      </div>
    </section>
  );
};

export default Card;
