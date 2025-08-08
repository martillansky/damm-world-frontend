import { useTheme } from "@/context/ThemeContext";
import { useView } from "@/context/ViewContext";
import { useAppKit } from "@reown/appkit/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import StackedAreaChart from "./charts/Visx-XYChart/StackedAreaChart";
import ChartCard from "./ui/common/ChartCard";
import Select from "./ui/common/Select";

export default function PresentationView() {
  const { theme } = useTheme();
  const { open } = useAppKit();
  const { setView } = useView();
  const [filter, setFilter] = useState("all");
  useEffect(() => {
    // Only set view if we're not on the root path
    if (window.location.pathname !== "/") {
      setView("smartAccount");
    }
  }, [setView]);

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
                The official DAMM Capital investment funds.
              </p>
            </div>

            {/* Chart Section */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-3 rounded-2xl ">
                <ChartCard
                  title="Fund Performance"
                  subtitle="Historical performance metrics and trends"
                  variant="small"
                  selector={
                    <Select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      options={["all", "WLD/USDC", "WLD/DAI", "WLD/USDT"]}
                      displayLabels={{
                        all: "All Funds",
                        "WLD/USDC": "WLD/USDC",
                        "WLD/DAI": "WLD/DAI",
                        "WLD/USDT": "WLD/USDT",
                      }}
                      size="small"
                    />
                  }
                >
                  <StackedAreaChart vaultName={filter} />
                </ChartCard>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center space-y-3">
              <div className="flex justify-center mt-16">
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
