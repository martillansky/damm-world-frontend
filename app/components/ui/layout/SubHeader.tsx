import { useView } from "@/context/ViewContext";

export default function SubHeader() {
  const { view } = useView();

  return (
    <div className="mb-8">
      <div className="mb-1">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">WLD/USDC Pool</h2>
          <div className="flex items-center space-x-2">
            <p className="text-muted-light dark:text-muted">Vault status:</p>
            <span className="bg-white dark:bg-lime-400/10 text-lime-400 px-2 py-0.5 rounded-md text-xs font-medium border border-lime-400/20 drop-shadow-[0_0_1px_rgba(163,230,53,0.3)]">
              Active
            </span>
          </div>
        </div>
      </div>
      {view === "vault" && (
        <p className="text-sm text-muted-light dark:text-muted">
          A vault run by DAMM Capital on Uniswap V4 in a sophisticated, active
          manner.
        </p>
      )}
    </div>
  );
}
