import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { Transaction, Account, UpdateTransaction } from "@shared/schema";
import { CLASSIFICATION_OPTIONS, PAYMENT_MEDIUM_OPTIONS, PROCESS_TYPE_OPTIONS, SCHEDULE_OPTIONS, STATUTORY_TYPE_OPTIONS, CURRENCY_OPTIONS } from "@shared/schema";
import { formatCurrencyWithSign, convertCurrency, getExchangeRate } from "@/lib/currency-utils";

interface TransactionModalProps {
  transaction: Transaction;
  accounts: Account[];
  onClose: () => void;
  onSave: (updates: UpdateTransaction) => void;
}

export default function TransactionModal({ transaction, accounts, onClose, onSave }: TransactionModalProps) {
  const [formData, setFormData] = useState<UpdateTransaction>({
    date: transaction.date,
    amount: transaction.amount,
    originalAmount: transaction.originalAmount,
    currency: transaction.currency || "GBP",
    baseCurrency: transaction.baseCurrency || "GBP",
    exchangeRate: transaction.exchangeRate,
    currentDescription: transaction.currentDescription || "",
    transactor: transaction.transactor || "",
    accountId: transaction.accountId || "",
    classification: transaction.classification || "",
    paymentMedium: transaction.paymentMedium || "",
    processType: transaction.processType || "",
    schedule: transaction.schedule || "",
    statutoryType: transaction.statutoryType || "",
    isDeleted: transaction.isDeleted,
    isActual: transaction.isActual,
    isBudgetItem: transaction.isBudgetItem,
    isInteraccount: transaction.isInteraccount,
    isIncomeStatement: transaction.isIncomeStatement,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleInputChange = (field: keyof UpdateTransaction, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // If currency or originalAmount changes, recalculate the base amount
      if (field === 'currency' || field === 'originalAmount') {
        const originalAmount = parseFloat(field === 'originalAmount' ? value : newData.originalAmount || '0');
        const currency = field === 'currency' ? value : newData.currency || 'GBP';
        const baseCurrency = newData.baseCurrency || 'GBP';
        
        const exchangeRate = getExchangeRate(currency, baseCurrency);
        const baseAmount = originalAmount * exchangeRate;
        
        newData.exchangeRate = exchangeRate.toString();
        newData.amount = baseAmount.toString();
      }
      
      return newData;
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Transaction Details</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">Transaction Date</Label>
              <Input
                type="date"
                value={new Date(formData.date!).toISOString().split('T')[0]}
                onChange={(e) => handleInputChange("date", new Date(e.target.value))}
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">Currency</Label>
              <Select value={formData.currency || "GBP"} onValueChange={(value) => handleInputChange("currency", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency..." />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_OPTIONS.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Original Amount ({formData.currency})
              </Label>
              <Input
                type="number"
                step="0.01"
                value={formData.originalAmount}
                onChange={(e) => handleInputChange("originalAmount", e.target.value)}
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Base Amount (GBP)
              </Label>
              <Input
                type="number"
                step="0.01"
                value={formData.amount}
                disabled
                className="bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Exchange Rate: 1 {formData.currency} = {parseFloat(formData.exchangeRate || '1').toFixed(4)} GBP
              </p>
            </div>

            <div className="md:col-span-2">
              <Label className="block text-sm font-medium text-gray-700 mb-2">Original Description</Label>
              <Input
                value={transaction.originalDescription}
                disabled
                className="bg-gray-50 text-gray-500"
              />
            </div>

            <div className="md:col-span-2">
              <Label className="block text-sm font-medium text-gray-700 mb-2">Current Description</Label>
              <Input
                value={formData.currentDescription || ""}
                onChange={(e) => handleInputChange("currentDescription", e.target.value)}
                placeholder="Enter description..."
              />
            </div>

            <div className="md:col-span-2">
              <Label className="block text-sm font-medium text-gray-700 mb-2">Transactor/Counterparty</Label>
              <Input
                value={formData.transactor || ""}
                onChange={(e) => handleInputChange("transactor", e.target.value)}
                placeholder="Enter counterparty..."
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">Classification</Label>
              <Select value={formData.classification || ""} onValueChange={(value) => handleInputChange("classification", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select classification..." />
                </SelectTrigger>
                <SelectContent>
                  {CLASSIFICATION_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">Payment Medium</Label>
              <Select value={formData.paymentMedium || ""} onValueChange={(value) => handleInputChange("paymentMedium", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment medium..." />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_MEDIUM_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">Process Type</Label>
              <Select value={formData.processType || ""} onValueChange={(value) => handleInputChange("processType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select process type..." />
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

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">Schedule</Label>
              <Select value={formData.schedule || ""} onValueChange={(value) => handleInputChange("schedule", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select schedule..." />
                </SelectTrigger>
                <SelectContent>
                  {SCHEDULE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">Statutory Type</Label>
              <Select value={formData.statutoryType || ""} onValueChange={(value) => handleInputChange("statutoryType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select statutory type..." />
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

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">Account</Label>
              <Select value={formData.accountId || ""} onValueChange={(value) => handleInputChange("accountId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account..." />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} - {account.identifier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">Transaction Flags</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isDeleted"
                  checked={formData.isDeleted || false}
                  onCheckedChange={(checked) => handleInputChange("isDeleted", checked)}
                />
                <Label htmlFor="isDeleted" className="text-sm text-gray-700">Deleted</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActual"
                  checked={formData.isActual || false}
                  onCheckedChange={(checked) => handleInputChange("isActual", checked)}
                />
                <Label htmlFor="isActual" className="text-sm text-gray-700">Actual</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isBudgetItem"
                  checked={formData.isBudgetItem || false}
                  onCheckedChange={(checked) => handleInputChange("isBudgetItem", checked)}
                />
                <Label htmlFor="isBudgetItem" className="text-sm text-gray-700">Budget Item</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isInteraccount"
                  checked={formData.isInteraccount || false}
                  onCheckedChange={(checked) => handleInputChange("isInteraccount", checked)}
                />
                <Label htmlFor="isInteraccount" className="text-sm text-gray-700">Interaccount</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isIncomeStatement"
                  checked={formData.isIncomeStatement || false}
                  onCheckedChange={(checked) => handleInputChange("isIncomeStatement", checked)}
                />
                <Label htmlFor="isIncomeStatement" className="text-sm text-gray-700">Income Statement</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}