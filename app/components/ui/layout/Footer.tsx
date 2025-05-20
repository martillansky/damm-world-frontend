import { useView, View } from "@/context/ViewContext";
import { useAppKitAccount } from "@reown/appkit/react";
import { useRouter } from "next/navigation";
import ActivityIcon from "../../icons/ActivityIcon";
import PositionIcon from "../../icons/PositionIcon";
import VaultIcon from "../../icons/VaultIcon";

export default function Footer() {
  const { view, setView } = useView();
  const { address } = useAppKitAccount();
  const router = useRouter();

  const handleViewChange = (view: View) => {
    setView(view);
    router.push(`/wallet/${address}/${view}`);
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-surface-light/90 dark:bg-zinc-900/90 backdrop-blur-md border-t border-border-light dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-around py-2">
          <button
            onClick={() => handleViewChange("vault")}
            className={`relative flex flex-col items-center transition-all duration-200 ${
              view === "vault"
                ? "text-lime-400 drop-shadow-[0_0_1px_rgba(163,230,53,0.3)] scale-110"
                : "text-muted hover:text-lime-400"
            }`}
          >
            <div
              className={`p-2 rounded-xl transition-colors ${
                view === "vault" ? "bg-lime-400/10" : ""
              }`}
            >
              <VaultIcon />
            </div>
            <span className="text-xs mt-1 font-medium">Vault</span>
          </button>

          <button
            onClick={() => handleViewChange("position")}
            className={`relative flex flex-col items-center transition-all duration-200 ${
              view === "position"
                ? "text-lime-400 drop-shadow-[0_0_1px_rgba(163,230,53,0.3)] scale-110"
                : "text-muted hover:text-lime-400"
            }`}
          >
            <div
              className={`p-2 rounded-xl transition-colors ${
                view === "position" ? "bg-lime-400/10" : ""
              }`}
            >
              <PositionIcon />
            </div>
            <span className="text-xs mt-1 font-medium">Position</span>
          </button>

          <button
            onClick={() => handleViewChange("activity")}
            className={`relative flex flex-col items-center transition-all duration-200 ${
              view === "activity"
                ? "text-lime-400 drop-shadow-[0_0_1px_rgba(163,230,53,0.3)] scale-110"
                : "text-muted hover:text-lime-400"
            }`}
          >
            <div
              className={`p-2 rounded-xl transition-colors ${
                view === "activity" ? "bg-lime-400/10" : ""
              }`}
            >
              <ActivityIcon />
            </div>
            <span className="text-xs mt-1 font-medium">Activity</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
