import { useQuery } from "@tanstack/react-query";
import { DollarSign, Clock, CreditCard, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { formatCurrency } from "@/lib/accounting-utils";

interface Metrics {
  totalRevenue: number;
  totalExpenses: number;
  totalCost: number;
  outstandingBalance: number;
  totalPayable: number;
  netProfit: number;
}

interface MetricsCardsProps {
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

export function MetricsCards({ dateRange }: MetricsCardsProps) {
  const { currentCompany } = useCurrentCompany();

  const { data: metrics, isLoading } = useQuery<Metrics>({
    queryKey: ["/api/companies", currentCompany?.id, "dashboard", "metrics", dateRange?.startDate, dateRange?.endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateRange?.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange?.endDate) params.append('endDate', dateRange.endDate);
      
      const response = await fetch(`/api/companies/${currentCompany?.id}/dashboard/metrics?${params}`);
      if (!response.ok) throw new Error('Failed to fetch metrics');
      return response.json();
    },
    enabled: !!currentCompany?.id,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  const cards = [
    {
      title: "Total Revenue",
      value: formatCurrency(metrics.totalRevenue),
      icon: DollarSign,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      trend: "+12.3%",
      trendDirection: "up" as const,
      trendText: "from revenue sheets",
    },
    {
      title: "Total Cost",
      value: formatCurrency(metrics.totalCost),
      icon: CreditCard,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      trend: "+8.1%",
      trendDirection: "up" as const,
      trendText: "from revenue sheets",
    },
    {
      title: "Total Expenses",
      value: formatCurrency(metrics.totalExpenses),
      icon: CreditCard,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      trend: "+8.1%",
      trendDirection: "up" as const,
      trendText: "from expenses module",
    },
    {
      title: "Outstanding Balance",
      value: formatCurrency(metrics.outstandingBalance),
      icon: Clock,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      trend: "-5.2%",
      trendDirection: "down" as const,
      trendText: "receivables",
    },
    {
      title: "Total Payable",
      value: formatCurrency(metrics.totalPayable),
      icon: Clock,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      trend: "-2.1%",
      trendDirection: "down" as const,
      trendText: "vendor balances",
    },
    {
      title: "Net Profit",
      value: formatCurrency(metrics.netProfit),
      icon: TrendingUp,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      trend: "+15.7%",
      trendDirection: "up" as const,
      trendText: "revenue - expenses",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        const TrendIcon = card.trendDirection === "up" ? ArrowUp : ArrowDown;
        const trendColor = card.trendDirection === "up" ? "text-green-600" : "text-red-600";

        return (
          <div key={card.title} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-10 h-10 ${card.iconBg} rounded-full flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">{card.title}</p>
              <p className="text-lg font-semibold text-gray-900 mb-2">{card.value}</p>
              <div className="flex items-center">
                <TrendIcon className={`h-3 w-3 ${trendColor} mr-1`} />
                <span className={`text-xs ${trendColor}`}>{card.trend}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{card.trendText}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
