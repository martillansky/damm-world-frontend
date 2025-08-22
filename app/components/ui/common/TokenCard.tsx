import { cloneElement, isValidElement, ReactElement } from "react";
import { CardRowProps } from "./Card";

interface CardProps {
  title: string;
  subtitle?: string;
  secondSubtitle?: string;
  icon?: React.ReactNode;
  children?: ReactElement<CardRowProps> | ReactElement<CardRowProps>[];
  onClick?: () => void;
  active?: boolean;
}

const TokenCard = ({
  children,
  title,
  subtitle,
  secondSubtitle,
  icon,
  onClick,
  active = true,
}: CardProps) => {
  const sectionCore =
    "card bg-gradient-to-br from-gray-100 to-gray-200 dark:bg-gradient-to-br dark:from-zinc-900 dark:to-zinc-800 border-0 dark:border dark:border-zinc-800";
  const sectionSmall = `${sectionCore} p-4`;
  const containerSmall = "space-y-3";
  const containerBodySmall = "grid gap-2";

  const renderChildren = () => {
    const childrenLength = Array.isArray(children) ? children.length : 1;
    const horizontalLine = childrenLength > 1;
    return Array.isArray(children)
      ? children.map((child, i) =>
          isValidElement(child)
            ? cloneElement(child, {
                key: i,
                horizontalLine: horizontalLine && i < childrenLength - 1,
              })
            : child
        )
      : isValidElement(children)
      ? cloneElement(children)
      : children;
  };

  return (
    <section className={sectionSmall} onClick={onClick}>
      <div className={containerSmall}>
        <div className="mb-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {icon && (
                <div className="flex items-center justify-center pr-4">
                  <div className="w-12 h-12 rounded-full bg-surface-light/80 dark:bg-zinc-800/80 flex items-center justify-center">
                    {icon}
                  </div>
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center">
                  <h3 className={`font-semibold ${"text-lg"}`}>{title}</h3>
                  {!active && (
                    <div className="text-right ml-4">
                      <h3 className="bg-white dark:bg-red-400/10 text-red-400 px-2 py-0.5 rounded-md text-xs font-medium border border-red-400/20 drop-shadow-[0_0_1px_rgba(239,68,68,0.3)]">
                        Closed
                      </h3>
                    </div>
                  )}
                </div>
                {subtitle && (
                  <p className="text-sm text-muted-light dark:text-muted">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {secondSubtitle && (
              <div className="text-right">
                <h3 className="text-sm text-muted-light dark:text-muted font-medium pt-1">
                  My deposit
                </h3>

                <p className="text-sm text-muted-light dark:text-muted">
                  {secondSubtitle}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className={containerBodySmall}>{renderChildren()}</div>
      </div>
    </section>
  );
};

export default TokenCard;
