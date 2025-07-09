import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";

interface HeaderProps {
  title?: string;
  description?: string;
  showActions?: boolean;
  onNewTransaction?: () => void;
  onExport?: () => void;
  actions?: React.ReactNode;
}

export function Header({ 
  title = "Dashboard", 
  description = "Financial overview and quick actions",
  showActions = true,
  onNewTransaction,
  onExport,
  actions
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          <p className="text-gray-600">{description}</p>
        </div>
        {actions || (showActions && (
          <div className="flex items-center space-x-4">
            <Button onClick={onNewTransaction} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              New Transaction
            </Button>
            <Button variant="outline" onClick={onExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        ))}
      </div>
    </header>
  );
}

export default Header;
