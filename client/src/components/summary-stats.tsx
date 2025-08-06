import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, List, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface SummaryData {
  totalIncome: number;
  totalExpenses: number;
  transactionCount: number;
  unclassifiedCount: number;
}

interface SummaryStatsProps {
  filters?: Record<string, any>;
}

export default function SummaryStats({ filters }: SummaryStatsProps) {
  const { data: summary, isLoading } = useQuery<SummaryData>({
    queryKey: ["/api/analytics/summary", filters],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Total Income",
      value: `$${summary?.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`,
      icon: TrendingUp,
      color: "income",
      bgColor: "bg-green-100",
      iconColor: "text-income",
    },
    {
      title: "Total Expenses",
      value: `$${summary?.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`,
      icon: TrendingDown,
      color: "expense",
      bgColor: "bg-red-100",
      iconColor: "text-expense",
    },
    {
      title: "Total Transactions",
      value: summary?.transactionCount.toLocaleString() || '0',
      icon: List,
      color: "blue",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-500",
    },
    {
      title: "Unclassified",
      value: summary?.unclassifiedCount.toLocaleString() || '0',
      icon: AlertTriangle,
      color: "yellow",
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white rounded-lg shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 ${stat.bgColor} rounded-md flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{stat.title}</dt>
                  <dd className={`text-lg font-semibold ${
                    stat.color === 'income' ? 'text-income' :
                    stat.color === 'expense' ? 'text-expense' :
                    stat.color === 'yellow' ? 'text-yellow-600' :
                    'text-gray-900'
                  }`}>
                    {stat.value}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
