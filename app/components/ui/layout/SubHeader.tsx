import { useSafeLinkedAccountContext } from "@/context/SafeLinkedAccountContext";
import { useView } from "@/context/ViewContext";

export default function SubHeader() {
  const { view } = useView();
  const { isDeployed } = useSafeLinkedAccountContext();
  const title =
    view === "smartAccount"
      ? isDeployed
        ? "DAMM Account"
        : "Welcome to DAMM World"
      : view === "activity"
      ? "Account Activity"
      : "Investment Funds";

  return (
    <div className="mb-8">
      <div className="mb-1">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
      </div>
      {/* {view === "vault" && (
        <p className="text-sm text-muted-light dark:text-muted">
          Investment funds run by DAMM Capital on Uniswap V4 in a sophisticated,
          active manner.
        </p>
      )} */}
      {view === "smartAccount" && !isDeployed && (
        <p className="text-sm text-muted-light dark:text-muted">
          Create your DAMM account, deposit, and begin investing in our hedge
          fund strategies
        </p>
      )}
      {view === "smartAccount" && isDeployed && (
        <p className="text-sm text-muted-light dark:text-muted">
          Your DAMM account acts as your personal gateway to invest in our
          funds.
        </p>
      )}
    </div>
  );
}
