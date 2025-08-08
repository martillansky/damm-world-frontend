import { useTransaction } from "@/context/TransactionContext";
import TransactionOverlay from "../common/TransactionOverlay";
import { ActionSlotProvider } from "./ActionSlotProvider";
import Footer from "./Footer";
import Header from "./Header";
import SubHeader from "./SubHeader";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { transactionState, hideTransaction } = useTransaction();

  return (
    <div className="min-h-screen bg-background-light dark:bg-black text-foreground-light dark:text-foreground">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-surface opacity-10 rounded-3xl -z-10" />
          <div className="space-y-6">
            <SubHeader />
            <ActionSlotProvider>{children}</ActionSlotProvider>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <Footer />

      {/* Transaction Overlay */}
      <TransactionOverlay
        isVisible={transactionState.isVisible}
        title={transactionState.title}
        message={transactionState.message}
        status={transactionState.status}
        onClose={hideTransaction}
      />
    </div>
  );
}
