import React, { ComponentType, ReactElement } from "react";
import CloseIcon from "../../icons/CloseIcon";

export const DialogContents = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);
DialogContents.displayName = "DialogContents";

export const DialogActionButtons = ({
  children,
}: {
  children: React.ReactNode;
}) => <>{children}</>;
DialogActionButtons.displayName = "DialogActionButtons";

type DialogChildren = [
  React.ReactElement<typeof DialogContents>,
  React.ReactElement<typeof DialogActionButtons>
];

export default function Dialog({
  title,
  open,
  onClose,
  children,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: DialogChildren;
}) {
  let contents: ReactElement | null = null;
  let actions: ReactElement | null = null;

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;

    const type = child.type;
    if (
      typeof type === "function" &&
      (type as ComponentType & { displayName?: string }).displayName ===
        DialogContents.displayName
    ) {
      contents = child;
    } else if (
      typeof type === "function" &&
      (type as ComponentType & { displayName?: string }).displayName ===
        DialogActionButtons.displayName
    ) {
      actions = child;
    } else {
      throw new Error(
        "Dialog only accepts DialogContents and DialogActionButtons as children."
      );
    }
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:bg-gradient-to-br dark:from-zinc-900 dark:to-zinc-800 rounded-2xl p-6 w-full max-w-md mx-4 border-0 dark:border dark:border-zinc-800 overflow-visible">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={() => onClose()}
            className="text-muted-light dark:text-muted hover:text-foreground-light dark:hover:text-foreground"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="space-y-4 overflow-visible">
          {contents}
          <div className="flex space-x-3">{actions}</div>
        </div>
      </div>
    </div>
  );
}
