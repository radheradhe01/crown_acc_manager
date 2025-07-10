import { useState } from "react";
import { Plus, Upload, FileText, CreditCard, DollarSign, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { BankUploadModal } from "@/components/modals/bank-upload-modal";
import { RevenueUploadModal } from "@/components/modals/revenue-upload-modal";

export function QuickActions() {
  const { currentCompany } = useCurrentCompany();
  const [showBankUploadModal, setShowBankUploadModal] = useState(false);
  const [showRevenueUploadModal, setShowRevenueUploadModal] = useState(false);

  if (!currentCompany) return null;

  const actions = [
    {
      title: "Upload Bank Statement",
      description: "Import and categorize bank transactions",
      icon: <Upload className="h-5 w-5" />,
      action: () => setShowBankUploadModal(true),
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "Upload Revenue Sheet",
      description: "Import customer revenue data",
      icon: <TrendingUp className="h-5 w-5" />,
      action: () => setShowRevenueUploadModal(true),
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Create Invoice",
      description: "Generate new customer invoice",
      icon: <FileText className="h-5 w-5" />,
      action: () => window.location.href = "/revenue",
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "Add Expense",
      description: "Record new business expense",
      icon: <CreditCard className="h-5 w-5" />,
      action: () => window.location.href = "/expenses",
      color: "bg-orange-500 hover:bg-orange-600",
    },
    {
      title: "View Reports",
      description: "Access financial reports and analytics",
      icon: <DollarSign className="h-5 w-5" />,
      action: () => window.location.href = "/analytics",
      color: "bg-indigo-500 hover:bg-indigo-600",
    },
    {
      title: "Manage Customers",
      description: "Add or edit customer information",
      icon: <Plus className="h-5 w-5" />,
      action: () => window.location.href = "/customers",
      color: "bg-teal-500 hover:bg-teal-600",
    },
  ];

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          <p className="text-sm text-gray-600 mt-1">Common tasks to manage your finances</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 text-left justify-start hover:shadow-md transition-shadow"
                onClick={action.action}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg text-white ${action.color}`}>
                    {action.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{action.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <BankUploadModal
        isOpen={showBankUploadModal}
        onClose={() => setShowBankUploadModal(false)}
        companyId={currentCompany.id}
      />
      
      <RevenueUploadModal
        isOpen={showRevenueUploadModal}
        onClose={() => setShowRevenueUploadModal(false)}
        companyId={currentCompany.id}
      />
    </>
  );
}