import { useView, View } from "@/context/ViewContext";
import { useAppKitAccount } from "@reown/appkit/react";
import ActivityIcon from "../../icons/ActivityIcon";
import PositionIcon from "../../icons/PositionIcon";
import SmartAccountIcon from "../../icons/SmartAccountIcon";
import VaultIcon from "../../icons/VaultIcon";

export default function Footer() {
  const { view, setView } = useView();
  const { address } = useAppKitAccount();

  const handleViewChange = (nextView: View) => {
    if (!address) return;
    setView(nextView);
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-surface-light/90 dark:bg-zinc-900/90 backdrop-blur-md border-t border-border-light dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center py-2 gap-8">
          <FooterButton
            label="Fund"
            icon={<SmartAccountIcon />}
            active={view === "smartAccount"}
            onClick={() => handleViewChange("smartAccount")}
          />
          <div className="w-px h-8 bg-border-light dark:bg-zinc-700" />
          <FooterButton
            label="Vault"
            icon={<VaultIcon />}
            active={view === "vault"}
            onClick={() => handleViewChange("vault")}
          />
          <FooterButton
            label="Position"
            icon={<PositionIcon />}
            active={view === "position"}
            onClick={() => handleViewChange("position")}
          />
          <FooterButton
            label="Activity"
            icon={<ActivityIcon />}
            active={view === "activity"}
            onClick={() => handleViewChange("activity")}
          />
        </div>
      </div>
    </nav>
  );
}

function FooterButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center transition-all duration-200 ${
        active
          ? "text-lime-400 drop-shadow-[0_0_1px_rgba(163,230,53,0.3)] scale-110"
          : "text-muted hover:text-lime-400"
      }`}
    >
      <div
        className={`p-2 rounded-xl transition-colors ${
          active ? "bg-lime-400/10" : ""
        }`}
      >
        {icon}
      </div>
      <span className="text-xs mt-1 font-medium">{label}</span>
    </button>
  );
}
