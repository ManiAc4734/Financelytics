import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import type { Account } from "@shared/schema";
import { CLASSIFICATION_OPTIONS, PAYMENT_MEDIUM_OPTIONS, PROCESS_TYPE_OPTIONS, SCHEDULE_OPTIONS, STATUTORY_TYPE_OPTIONS } from "@shared/schema";

interface FilterControlsProps {
  filters: Record<string, any>;
  onFiltersChange: (filters: Record<string, any>) => void;
}

export default function FilterControls({ filters, onFiltersChange }: FilterControlsProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...localFilters };
    if (value === "all" || value === "") {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    setLocalFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {};
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  return (
    <Card className="bg-white rounded-lg shadow mb-6">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-medium text-gray-900">Filter & Search Transactions</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">Search Descriptions</Label>
            <Input
              type="text"
              placeholder="Search transactions..."
              value={localFilters.search || ""}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">Account</Label>
            <Select value={localFilters.accountId || ""} onValueChange={(value) => handleFilterChange("accountId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Accounts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} - {account.identifier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">Classification</Label>
            <Select value={localFilters.classification || ""} onValueChange={(value) => handleFilterChange("classification", value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {CLASSIFICATION_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
                <SelectItem value="unclassified">Unclassified</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">Date Range</Label>
            <Select value={localFilters.dateRange || ""} onValueChange={(value) => handleFilterChange("dateRange", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Last 30 Days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
                <SelectItem value="365">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">Payment Medium</Label>
            <Select value={localFilters.paymentMedium || ""} onValueChange={(value) => handleFilterChange("paymentMedium", value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                {PAYMENT_MEDIUM_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">Process Type</Label>
            <Select value={localFilters.processType || ""} onValueChange={(value) => handleFilterChange("processType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Processes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Processes</SelectItem>
                {PROCESS_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">Schedule</Label>
            <Select value={localFilters.schedule || ""} onValueChange={(value) => handleFilterChange("schedule", value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Schedules" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schedules</SelectItem>
                {SCHEDULE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">Statutory Type</Label>
            <Select value={localFilters.statutoryType || ""} onValueChange={(value) => handleFilterChange("statutoryType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {STATUTORY_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">Transactor</Label>
            <Input
              type="text"
              placeholder="Enter counterparty..."
              value={localFilters.transactor || ""}
              onChange={(e) => handleFilterChange("transactor", e.target.value)}
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <Label className="block text-sm font-medium text-gray-700 mb-2">Transaction Flags</Label>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showDeleted"
                checked={localFilters.showDeleted || false}
                onCheckedChange={(checked) => handleFilterChange("showDeleted", checked)}
              />
              <Label htmlFor="showDeleted" className="text-sm text-gray-700">Show Deleted</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActual"
                checked={localFilters.isActual !== false}
                onCheckedChange={(checked) => handleFilterChange("isActual", checked)}
              />
              <Label htmlFor="isActual" className="text-sm text-gray-700">Actual Transactions</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isBudgetItem"
                checked={localFilters.isBudgetItem || false}
                onCheckedChange={(checked) => handleFilterChange("isBudgetItem", checked)}
              />
              <Label htmlFor="isBudgetItem" className="text-sm text-gray-700">Budget Items</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isInteraccount"
                checked={localFilters.isInteraccount || false}
                onCheckedChange={(checked) => handleFilterChange("isInteraccount", checked)}
              />
              <Label htmlFor="isInteraccount" className="text-sm text-gray-700">Interaccount Transfers</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isIncomeStatement"
                checked={localFilters.isIncomeStatement || false}
                onCheckedChange={(checked) => handleFilterChange("isIncomeStatement", checked)}
              />
              <Label htmlFor="isIncomeStatement" className="text-sm text-gray-700">Income Statement Items</Label>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <Button variant="ghost" onClick={handleClearFilters} className="text-gray-500 hover:text-gray-700">
            Clear All Filters
          </Button>
          <div className="flex space-x-2">
            <Button onClick={handleApplyFilters} className="bg-blue-600 hover:bg-blue-700 text-white">
              Apply Filters
            </Button>
            <Button variant="outline" className="border-gray-300 hover:bg-gray-50 text-gray-700">
              Save Filter Set
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
