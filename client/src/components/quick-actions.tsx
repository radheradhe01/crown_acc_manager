import { useState } from "react";
import { Upload, FileText, UserPlus, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BankUploadModal } from "@/components/modals/bank-upload-modal";
import { CustomerFormModal } from "@/components/modals/customer-form-modal";
import { RevenueFormModal } from "@/components/modals/revenue-form-modal";
import { ExpenseFormModal } from "@/components/modals/expense-form-modal";

export function QuickActions() {
  const [bankUploadOpen, setBankUploadOpen] = useState(false);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [revenueModalOpen, setRevenueModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);

  const actions = [
    {
      title: "Upload Bank Statement",
      description: "Import transactions from your bank",
      icon: Upload,
      onClick: () => setBankUploadOpen(true),
    },
    {
      title: "Create Invoice",
      description: "Generate a new customer invoice",
      icon: FileText,
      onClick: () => setRevenueModalOpen(true),
    },
    {
      title: "Add Customer",
      description: "Add a new customer to your system",
      icon: UserPlus,
      onClick: () => setCustomerModalOpen(true),
    },
    {
      title: "Record Expense",
      description: "Log a new business expense",
      icon: Receipt,
      onClick: () => setExpenseModalOpen(true),
    },
  ];

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {actions.map((action) => {
              const Icon = action.icon;
              
              return (
                <Button
                  key={action.title}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center justify-center space-y-2 hover:bg-gray-50"
                  onClick={action.onClick}
                >
                  <Icon className="h-8 w-8 text-blue-600" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">{action.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      <BankUploadModal
        isOpen={bankUploadOpen}
        onClose={() => setBankUploadOpen(false)}
      />
      
      <CustomerFormModal
        isOpen={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
      />
      
      <RevenueFormModal
        isOpen={revenueModalOpen}
        onClose={() => setRevenueModalOpen(false)}
      />
      
      <ExpenseFormModal
        isOpen={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
      />
    </>
  );
}
