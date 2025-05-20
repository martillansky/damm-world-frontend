import { createContext, ReactNode, useContext, useState } from "react";

type ActionSlotContextType = {
  setActions: (actions: ReactNode) => void;
};

const ActionSlotContext = createContext<ActionSlotContextType | undefined>(
  undefined
);

export const useActionSlot = () => {
  const context = useContext(ActionSlotContext);
  if (!context)
    throw new Error("useActionSlot must be used within ActionSlotProvider");
  return context;
};

export function ActionSlotProvider({ children }: { children: ReactNode }) {
  const [actions, setActions] = useState<ReactNode>(null);

  return (
    <ActionSlotContext.Provider value={{ setActions }}>
      {children}
      {/* Render the action area at the bottom */}
      <div className="fixed bottom-20 left-0 right-0 px-4 pb-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-4">{actions}</div>
        </div>
      </div>
    </ActionSlotContext.Provider>
  );
}
