import { useState } from "react";
import SummaryStats from "@/components/summary-stats";
import FilterControls from "@/components/filter-controls";
import BulkActions from "@/components/bulk-actions";
import TransactionTable from "@/components/transaction-table";

export default function Transactions() {
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<string[]>([]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <SummaryStats filters={filters} />
      <FilterControls filters={filters} onFiltersChange={setFilters} />
      <BulkActions 
        selectedTransactionIds={selectedTransactionIds} 
        onClearSelection={() => setSelectedTransactionIds([])}
      />
      <TransactionTable 
        filters={filters}
        selectedTransactionIds={selectedTransactionIds}
        onSelectionChange={setSelectedTransactionIds}
      />
    </div>
  );
}
