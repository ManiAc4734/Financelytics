import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, PieChart, BarChart3 } from "lucide-react";

interface SummaryData {
  totalIncome: number;
  totalExpenses: number;
  transactionCount: number;
  unclassifiedCount: number;
  accountBreakdown: { accountId: string; accountName: string; balance: number }[];
}

export default function Analytics() {
  const { data: summary, isLoading } = useQuery<SummaryData>({
    queryKey: ["/api/analytics/summary"],
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="animate-pulse space-y-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-32 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const netIncome = (summary?.totalIncome || 0) - (summary?.totalExpenses || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Financial Analytics</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-income" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-income">
              ${summary?.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-expense" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-expense">
              ${summary?.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <BarChart3 className={`h-4 w-4 ${netIncome >= 0 ? 'text-income' : 'text-expense'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-income' : 'text-expense'}`}>
              ${Math.abs(netIncome).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {netIncome >= 0 ? 'Positive cash flow' : 'Negative cash flow'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classification Rate</CardTitle>
            <PieChart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.transactionCount ? 
                Math.round(((summary.transactionCount - summary.unclassifiedCount) / summary.transactionCount) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {summary?.unclassifiedCount || 0} unclassified
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Account Breakdown */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Account Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summary?.accountBreakdown.map((account) => (
              <div key={account.accountId} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{account.accountName}</p>
                  <p className="text-sm text-gray-500">Account Balance</p>
                </div>
                <div className={`text-lg font-semibold ${account.balance >= 0 ? 'text-income' : 'text-expense'}`}>
                  ${Math.abs(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Transactions:</span>
                <span className="font-semibold">{summary?.transactionCount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Classified:</span>
                <span className="font-semibold text-green-600">
                  {(summary?.transactionCount || 0) - (summary?.unclassifiedCount || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Unclassified:</span>
                <span className="font-semibold text-yellow-600">{summary?.unclassifiedCount || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Income/Expense Ratio:</span>
                <span className="font-semibold">
                  {summary?.totalExpenses ? 
                    ((summary.totalIncome || 0) / summary.totalExpenses).toFixed(2) : 
                    'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Average Transaction:</span>
                <span className="font-semibold">
                  ${summary?.transactionCount ? 
                    Math.abs((summary.totalIncome - summary.totalExpenses) / summary.transactionCount).toFixed(2) :
                    '0.00'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
