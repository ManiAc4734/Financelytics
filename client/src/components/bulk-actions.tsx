import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Flag, Wand2, Copy, Undo } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { UpdateTransaction } from "@shared/schema";

interface BulkActionsProps {
  selectedTransactionIds: string[];
  onClearSelection: () => void;
}

export default function BulkActions({ selectedTransactionIds, onClearSelection }: BulkActionsProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, updates }: { ids: string[]; updates: UpdateTransaction }) => {
      return apiRequest("POST", "/api/transactions/bulk-update", { ids, updates });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/summary"] });
      onClearSelection();
      toast({
        title: "Bulk update successful",
        description: `Updated ${selectedTransactionIds.length} transactions`,
      });
    },
    onError: () => {
      toast({
        title: "Bulk update failed",
        description: "Failed to update transactions",
        variant: "destructive",
      });
    },
  });

  const handleBulkUpdate = (updates: UpdateTransaction) => {
    if (selectedTransactionIds.length === 0) {
      toast({
        title: "No transactions selected",
        description: "Please select transactions to update",
        variant: "destructive",
      });
      return;
    }

    bulkUpdateMutation.mutate({ ids: selectedTransactionIds, updates });
  };

  const quickActions = [
    {
      label: "Mark Selected as Income",
      icon: TrendingUp,
      className: "w-full bg-income hover:bg-green-600 text-white",
      action: () => handleBulkUpdate({ classification: "Income" }),
    },
    {
      label: "Mark Selected as Expense",
      icon: TrendingDown,
      className: "w-full bg-expense hover:bg-red-600 text-white",
      action: () => handleBulkUpdate({ classification: "Expense" }),
    },
    {
      label: "Mark as Actual",
      icon: Flag,
      className: "w-full border border-gray-300 hover:bg-gray-50 text-gray-700",
      action: () => handleBulkUpdate({ isActual: true, isBudgetItem: false }),
    },
  ];

  const smartActions = [
    {
      label: "Auto-classify Similar Transactions",
      icon: Wand2,
      className: "w-full bg-purple-600 hover:bg-purple-700 text-white",
      action: () => {
        toast({
          title: "Feature coming soon",
          description: "Auto-classification will be available in a future update",
        });
      },
    },
    {
      label: "Copy Classification to Similar",
      icon: Copy,
      className: "w-full bg-indigo-600 hover:bg-indigo-700 text-white",
      action: () => {
        toast({
          title: "Feature coming soon",
          description: "Classification copying will be available in a future update",
        });
      },
    },
    {
      label: "Undo Last Bulk Action",
      icon: Undo,
      className: "w-full border border-gray-300 hover:bg-gray-50 text-gray-700",
      action: () => {
        toast({
          title: "Feature coming soon",
          description: "Undo functionality will be available in a future update",
        });
      },
    },
  ];

  return (
    <Card className="bg-white rounded-lg shadow mb-6">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-medium text-gray-900">
          Bulk Classification Tools
          {selectedTransactionIds.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({selectedTransactionIds.length} selected)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Classification</h4>
            <div className="space-y-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  onClick={action.action}
                  disabled={bulkUpdateMutation.isPending || selectedTransactionIds.length === 0}
                  className={action.className}
                >
                  <action.icon className="mr-2 h-4 w-4" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Smart Classification</h4>
            <div className="space-y-2">
              {smartActions.map((action, index) => (
                <Button
                  key={index}
                  onClick={action.action}
                  disabled={bulkUpdateMutation.isPending}
                  className={action.className}
                >
                  <action.icon className="mr-2 h-4 w-4" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
