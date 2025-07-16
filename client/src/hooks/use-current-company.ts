import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Company } from '@shared/schema';

interface CurrentCompanyState {
  currentCompany: Company | null;
  setCurrentCompany: (company: Company | null) => void;
}

export const useCurrentCompany = create<CurrentCompanyState>()(
  persist(
    (set) => ({
      currentCompany: null,
      setCurrentCompany: (company) => set({ currentCompany: company }),
    }),
    {
      name: 'current-company-storage',
      version: 1, // Force reset of stored data
    }
  )
);
