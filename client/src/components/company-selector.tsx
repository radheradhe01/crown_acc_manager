import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { CompanyFormModal } from "./modals/company-form-modal";
import type { Company } from "@shared/schema";

export function CompanySelector() {
  const { currentCompany, setCurrentCompany } = useCurrentCompany();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  // Set first company as current if none selected
  useEffect(() => {
    if (!currentCompany && companies.length > 0) {
      setCurrentCompany(companies[0]);
    }
  }, [currentCompany, companies, setCurrentCompany]);

  const handleCompanySelect = (company: Company) => {
    setCurrentCompany(company);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between bg-gray-50 hover:bg-gray-100"
          >
            <div className="text-left">
              <div className="font-medium text-sm">
                {currentCompany?.name || "Select Company"}
              </div>
              <div className="text-xs text-gray-500">
                {currentCompany?.legalEntityType || "No company selected"}
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          {companies.map((company) => (
            <DropdownMenuItem
              key={company.id}
              onClick={() => handleCompanySelect(company)}
            >
              <div>
                <div className="font-medium text-sm">{company.name}</div>
                <div className="text-xs text-gray-500">{company.legalEntityType}</div>
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Company
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CompanyFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(company) => {
          setCurrentCompany(company);
          setIsModalOpen(false);
        }}
      />
    </>
  );
}
