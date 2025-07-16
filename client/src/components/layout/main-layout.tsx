import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { TransactionFormModal } from "@/components/modals/transaction-form-modal";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  const handleNewTransaction = () => {
    setIsTransactionModalOpen(true);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Export functionality not yet implemented");
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Header 
          showActions={true}
          onNewTransaction={handleNewTransaction}
          onExport={handleExport}
        />
        <div className="p-6">{children}</div>
      </main>
      
      <TransactionFormModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
      />
    </div>
  );
}
