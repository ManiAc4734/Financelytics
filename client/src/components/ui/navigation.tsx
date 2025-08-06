import { Link, useLocation } from "wouter";
import { Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { parseCSV, exportToCSV } from "@/lib/csv-utils";
import { useQuery } from "@tanstack/react-query";
import type { Transaction } from "@shared/schema";

export default function Navigation() {
  const [location] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const importMutation = useMutation({
    mutationFn: async (transactions: any[]) => {
      return apiRequest("POST", "/api/transactions/import", { transactions });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/summary"] });
      toast({
        title: "Import successful",
        description: "Transactions have been imported successfully",
      });
    },
    onError: () => {
      toast({
        title: "Import failed",
        description: "Failed to import transactions",
        variant: "destructive",
      });
    },
  });

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const transactions = await parseCSV(file);
      importMutation.mutate(transactions);
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Failed to parse CSV file",
        variant: "destructive",
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleExport = () => {
    if (!transactions) return;
    
    try {
      exportToCSV(transactions, "transactions.csv");
      toast({
        title: "Export successful",
        description: "Transactions have been exported to CSV",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export transactions",
        variant: "destructive",
      });
    }
  };

  const navItems = [
    { path: "/transactions", label: "Transactions" },
    { path: "/accounts", label: "Accounts" },
    { path: "/analytics", label: "Analytics" },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-primary">Transaction Classifier</h1>
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <Link key={item.path} href={item.path}>
                    <span
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        location === item.path || (location === "/" && item.path === "/transactions")
                          ? "bg-primary text-white"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleImport}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={importMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Upload className="mr-2 h-4 w-4" />
              Import Transactions
            </Button>
            <Button
              onClick={handleExport}
              disabled={!transactions}
              variant="secondary"
              className="bg-gray-600 hover:bg-gray-700 text-white"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}