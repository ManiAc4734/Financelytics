import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit, Save, Trash2, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import TransactionModal from "@/components/ui/transaction-modal";
import type { Transaction, Account, UpdateTransaction } from "@shared/schema";
import { CLASSIFICATION_OPTIONS, PAYMENT_MEDIUM_OPTIONS, PROCESS_TYPE_OPTIONS, SCHEDULE_OPTIONS, STATUTORY_TYPE_OPTIONS } from "@shared/schema";
import { formatCurrencyWithSign } from "@/lib/currency-utils";

interface TransactionTableProps {
  filters: Record<string, any>;
  selectedTransactionIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export default function TransactionTable({ filters, selectedTransactionIds, onSelectionChange }: TransactionTableProps) {
  const [editingTransaction, setEditingTransaction] = useState<string | null>(null);
  const [modalTransaction, setModalTransaction] = useState<Transaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortField, setSortField] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions", filters],
  });

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateTransaction }) => {
      return apiRequest("PUT", `/api/transactions/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/summary"] });
      setEditingTransaction(null);
      toast({
        title: "Transaction updated",
        description: "Transaction has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update transaction",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/summary"] });
      toast({
        title: "Transaction deleted",
        description: "Transaction has been deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
    },
  });

  // Sort and paginate transactions
  const sortedTransactions = [...transactions].sort((a, b) => {
    let aValue = a[sortField as keyof Transaction];
    let bValue = b[sortField as keyof Transaction];

    if (sortField === "date") {
      aValue = new Date((aValue || '') as string).getTime();
      bValue = new Date((bValue || '') as string).getTime();
    } else if (sortField === "amount") {
      aValue = parseFloat((aValue || '0') as string);
      bValue = parseFloat((bValue || '0') as string);
    }

    if (sortDirection === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedTransactions = sortedTransactions.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(sortedTransactions.length / pageSize);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(paginatedTransactions.map(tx => tx.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectTransaction = (transactionId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedTransactionIds, transactionId]);
    } else {
      onSelectionChange(selectedTransactionIds.filter(id => id !== transactionId));
    }
  };

  const handleInlineUpdate = (transaction: Transaction, field: keyof UpdateTransaction, value: any) => {
    const updates: UpdateTransaction = { [field]: value };
    updateMutation.mutate({ id: transaction.id, updates });
  };

  // Currency formatting is now handled by formatCurrencyWithSign utility

  const isUnclassified = (transaction: Transaction) => {
    return !transaction.classification;
  };

  if (isLoading) {
    return (
      <Card className="bg-white rounded-lg shadow">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-white rounded-lg shadow">
        <CardHeader className="border-b border-gray-200 flex flex-row justify-between items-center p-6">
          <h3 className="text-lg font-medium text-gray-900">Transactions</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              Showing {startIndex + 1}-{Math.min(startIndex + pageSize, sortedTransactions.length)} of {sortedTransactions.length} transactions
            </span>
            <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
              <SelectTrigger className="w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
                <SelectItem value="100">100 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Checkbox
                    checked={paginatedTransactions.length > 0 && paginatedTransactions.every(tx => selectedTransactionIds.includes(tx.id))}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("date")}
                >
                  Date <ArrowUpDown className="inline ml-1 h-3 w-3" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descriptions
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("amount")}
                >
                  Amount <ArrowUpDown className="inline ml-1 h-3 w-3" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Classification
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Flags
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedTransactions.map((transaction) => (
                <tr 
                  key={transaction.id} 
                  className={`hover:bg-gray-50 ${isUnclassified(transaction) ? 'bg-yellow-50' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Checkbox
                      checked={selectedTransactionIds.includes(transaction.id)}
                      onCheckedChange={(checked) => handleSelectTransaction(transaction.id, checked as boolean)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">Original:</span> {transaction.originalDescription}
                      </div>
                      <div className="text-sm text-gray-900">
                        <span className="font-medium">Current:</span>
                        <Input
                          value={transaction.currentDescription || ""}
                          onChange={(e) => handleInlineUpdate(transaction, "currentDescription", e.target.value)}
                          className="border-0 bg-transparent focus:ring-0 focus:border-b focus:border-blue-500 w-full p-0 h-auto"
                          placeholder="Enter description..."
                        />
                      </div>
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">Transactor:</span>
                        <Input
                          value={transaction.transactor || ""}
                          onChange={(e) => handleInlineUpdate(transaction, "transactor", e.target.value)}
                          className="border-0 bg-transparent focus:ring-0 focus:border-b focus:border-blue-500 w-full p-0 h-auto"
                          placeholder="Enter counterparty..."
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrencyWithSign(parseFloat(transaction.amount), "GBP")}
                      </div>
                      {transaction.currency && transaction.currency !== "GBP" && (
                        <div className="text-xs text-gray-500">
                          Original: {formatCurrencyWithSign(parseFloat(transaction.originalAmount || transaction.amount), transaction.currency)}
                        </div>
                      )}
                    </div>
                    {isUnclassified(transaction) && (
                      <div className="text-xs text-yellow-600 font-medium">UNCLASSIFIED</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <Select 
                        value={transaction.classification || ""} 
                        onValueChange={(value) => handleInlineUpdate(transaction, "classification", value)}
                      >
                        <SelectTrigger className={`w-full text-xs ${!transaction.classification ? 'border-yellow-300 bg-yellow-50' : ''}`}>
                          <SelectValue placeholder="Select Type..." />
                        </SelectTrigger>
                        <SelectContent>
                          {CLASSIFICATION_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select 
                        value={transaction.paymentMedium || ""} 
                        onValueChange={(value) => handleInlineUpdate(transaction, "paymentMedium", value)}
                      >
                        <SelectTrigger className="w-full text-xs">
                          <SelectValue placeholder="Select Method..." />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_MEDIUM_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select 
                        value={transaction.processType || ""} 
                        onValueChange={(value) => handleInlineUpdate(transaction, "processType", value)}
                      >
                        <SelectTrigger className="w-full text-xs">
                          <SelectValue placeholder="Select Process..." />
                        </SelectTrigger>
                        <SelectContent>
                          {PROCESS_TYPE_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <Select 
                        value={transaction.schedule || ""} 
                        onValueChange={(value) => handleInlineUpdate(transaction, "schedule", value)}
                      >
                        <SelectTrigger className="w-full text-xs">
                          <SelectValue placeholder="Select Schedule..." />
                        </SelectTrigger>
                        <SelectContent>
                          {SCHEDULE_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select 
                        value={transaction.statutoryType || ""} 
                        onValueChange={(value) => handleInlineUpdate(transaction, "statutoryType", value)}
                      >
                        <SelectTrigger className="w-full text-xs">
                          <SelectValue placeholder="Select Statutory..." />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUTORY_TYPE_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Checkbox
                          checked={transaction.isActual || false}
                          onCheckedChange={(checked) => handleInlineUpdate(transaction, "isActual", checked)}
                          className="mr-1 h-3 w-3"
                        />
                        Actual
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Checkbox
                          checked={transaction.isBudgetItem || false}
                          onCheckedChange={(checked) => handleInlineUpdate(transaction, "isBudgetItem", checked)}
                          className="mr-1 h-3 w-3"
                        />
                        Budget
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <Checkbox
                          checked={transaction.isInteraccount || false}
                          onCheckedChange={(checked) => handleInlineUpdate(transaction, "isInteraccount", checked)}
                          className="mr-1 h-3 w-3"
                        />
                        Inter
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setModalTransaction(transaction)}
                      className="text-blue-600 hover:text-blue-900 mr-2"
                      title="Edit Transaction"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(transaction.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Transaction"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{Math.min(startIndex + pageSize, sortedTransactions.length)}</span> of{' '}
                <span className="font-medium">{sortedTransactions.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNumber)}
                      className="relative inline-flex items-center px-4 py-2"
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </Card>

      {modalTransaction && (
        <TransactionModal
          transaction={modalTransaction}
          accounts={accounts}
          onClose={() => setModalTransaction(null)}
          onSave={(updates) => {
            updateMutation.mutate({ id: modalTransaction.id, updates });
            setModalTransaction(null);
          }}
        />
      )}
    </>
  );
}
