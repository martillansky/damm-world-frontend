import { useTheme } from "@/context/ThemeContext";
import { useAppKitAccount } from "@reown/appkit/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDisconnect } from "wagmi";
import LedIcon from "../../icons/LedIcon";
import MoonIcon from "../../icons/MoonIcon";
import SunIcon from "../../icons/SunIcon";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { address } = useAppKitAccount();
  const { disconnect } = useDisconnect();
  const router = useRouter();

  const handleDisconnect = async () => {
    try {
      if (address) {
        // Set a flag to prevent auto-reconnection
        localStorage.setItem("disconnect_requested", "true");

        // Clear all connection data
        localStorage.removeItem("wagmi.connected");
        localStorage.removeItem("wagmi.account");
        localStorage.removeItem("wagmi.chainId");
        localStorage.removeItem("wagmi.wallet");

        // Disconnect from wagmi
        disconnect();

        // Small delay to ensure disconnect completes
        setTimeout(() => {
          // Route to root to reset the app state
          router.push("/");
          // Clear the disconnect flag after navigation
          setTimeout(() => {
            localStorage.removeItem("disconnect_requested");
          }, 1000);
        }, 100);
      }
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      // Fallback: clear storage and route to root
      localStorage.removeItem("wagmi.connected");
      localStorage.removeItem("wagmi.account");
      localStorage.removeItem("wagmi.chainId");
      localStorage.removeItem("wagmi.wallet");
      router.push("/");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-surface-light/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-border-light dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Image
              src={
                theme === "dark"
                  ? "/Damm_Capital_Isotipo_Fondo Oscuro.png"
                  : "/Damm_Capital_Isotipo_Fondo blanco.png"
              }
              alt="Damm Capital Logo"
              className="h-8 w-auto"
              width={32}
              height={32}
            />
            <h1 className="text-xl font-bold">DAMM World</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-surface-hover-light dark:hover:bg-zinc-800 transition-colors"
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>

            <button
              onClick={handleDisconnect}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-black text-black dark:text-white text-sm font-medium hover:opacity-90 transition-all duration-200 shadow-[0_0_15px_rgba(163,230,53,0.3)] flex items-center gap-2"
            >
              <LedIcon />
              Connected
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
