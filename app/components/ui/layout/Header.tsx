import { useTheme } from "@/context/ThemeContext";
import Image from "next/image";
import { useDisconnect } from "wagmi";
import LedIcon from "../../icons/LedIcon";
import MoonIcon from "../../icons/MoonIcon";
import SunIcon from "../../icons/SunIcon";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { disconnect } = useDisconnect();

  const handleDisconnect = async () => {
    try {
      disconnect();
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
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
