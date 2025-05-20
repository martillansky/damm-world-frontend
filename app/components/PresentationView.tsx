import { useTheme } from "@/context/ThemeContext";
import { useView } from "@/context/ViewContext";
import { useAppKit } from "@reown/appkit/react";
import Image from "next/image";
import { useEffect } from "react";

export default function PresentationView() {
  const { theme } = useTheme();
  const { open } = useAppKit();
  const { setView } = useView();

  useEffect(() => {
    setView("vault");
  }, []);

  return (
    <div className="min-h-screen bg-background-light dark:bg-black text-foreground-light dark:text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-screen flex items-center">
        <div className="relative w-full">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-surface opacity-10 rounded-3xl -z-10" />

          <div className="max-w-4xl mx-auto space-y-6">
            {/* Hero Section */}
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <Image
                  src={
                    theme === "dark"
                      ? "/Damm_Capital_Isotipo_Fondo Oscuro.png"
                      : "/Damm_Capital_Isotipo_Fondo blanco.png"
                  }
                  alt="Damm Capital Logo"
                  className="h-14 w-auto"
                  width={56}
                  height={56}
                />
              </div>
              <h1 className="text-2xl font-bold text-foreground-light dark:text-foreground">
                Welcome to DAMM World
              </h1>
              <p className="text-base text-muted max-w-2xl mx-auto">
                The official WLD/USDC liquidity pool powered by DAMM Capital,
                specially designed for Worldcoin
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-3 rounded-2xl bg-surface-light/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-border-light dark:border-zinc-800">
                <div className="h-8 w-8 rounded-xl bg-lime-400/10 flex items-center justify-center mb-2">
                  <svg
                    className="h-4 w-4 text-lime-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold mb-1 text-foreground-light dark:text-foreground">
                  Deep Liquidity
                </h3>
                <p className="text-xs text-muted">
                  Access the most liquid WLD/USDC trading pair
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-surface-light/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-border-light dark:border-zinc-800">
                <div className="h-8 w-8 rounded-xl bg-lime-400/10 flex items-center justify-center mb-2">
                  <svg
                    className="h-4 w-4 text-lime-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold mb-1 text-foreground-light dark:text-foreground">
                  Earn Rewards
                </h3>
                <p className="text-xs text-muted">
                  Generate yield by providing liquidity
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-surface-light/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-border-light dark:border-zinc-800">
                <div className="h-8 w-8 rounded-xl bg-lime-400/10 flex items-center justify-center mb-2">
                  <svg
                    className="h-4 w-4 text-lime-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold mb-1 text-foreground-light dark:text-foreground">
                  Official Pool
                </h3>
                <p className="text-xs text-muted">
                  The trusted Worldcoin liquidity pool
                </p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center space-y-3">
              <h2 className="text-lg font-semibold text-foreground-light dark:text-foreground">
                Ready to Provide Liquidity?
              </h2>
              <p className="text-xs text-muted max-w-2xl mx-auto">
                Connect your wallet to start earning rewards with WLD/USDC
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => open({ view: "Connect" })}
                  className="px-6 py-2.5 rounded-lg bg-white dark:bg-black text-black dark:text-white text-sm font-medium hover:opacity-90 transition-all duration-200 shadow-[0_0_15px_rgba(163,230,53,0.3)]"
                >
                  Connect Wallet
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
