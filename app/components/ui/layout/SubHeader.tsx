import { useSafeLinkedAccountContext } from "@/context/SafeLinkedAccountContext";
import { useView } from "@/context/ViewContext";

export default function SubHeader() {
  const { view } = useView();
  const { isDeployed } = useSafeLinkedAccountContext();
  const isInvestmentFund = view === "smartAccount" || view === "metrics";

  const title = isInvestmentFund ? "DAMM Account" : "WLD/USDC Pool";
  const statusLabel = isInvestmentFund ? "Status:" : "Fund Status:";
  const status = isInvestmentFund
    ? isDeployed
      ? "Deployed"
      : "Not deployed"
    : "Active";
  const ok = isInvestmentFund ? isDeployed : true;
  const statusClassname = ok
    ? "bg-white dark:bg-lime-400/10 text-lime-400 px-2 py-0.5 rounded-md text-xs font-medium border border-lime-400/20 drop-shadow-[0_0_1px_rgba(163,230,53,0.3)]"
    : "bg-white dark:bg-red-400/10 text-red-400 px-2 py-0.5 rounded-md text-xs font-medium border border-red-400/20 drop-shadow-[0_0_1px_rgba(239,68,68,0.3)]";

  return (
    <div className="mb-8">
      <div className="mb-1">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{title}</h2>
          {!isInvestmentFund && (
            <div className="flex items-center space-x-2">
              <p className="text-muted-light dark:text-muted">{statusLabel}</p>
              <span className={statusClassname}>{status}</span>
            </div>
          )}
        </div>
      </div>
      {view === "vault" && (
        <p className="text-sm text-muted-light dark:text-muted">
          An investment fund run by DAMM Capital on Uniswap V4 in a
          sophisticated, active manner.
        </p>
      )}
      {view === "smartAccount" && (
        <p className="text-sm text-muted-light dark:text-muted">
          Your DAMM account acts as your personal gateway to deposit into and
          manage positions across DAMM investment funds.
        </p>
      )}
    </div>
  );
}
