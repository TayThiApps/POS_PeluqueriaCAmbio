import * as React from 'react';
import { TransactionForm } from '@/components/sales/TransactionForm';
import { DailyTotal } from '@/components/sales/DailyTotal';
import { TransactionsList } from '@/components/sales/TransactionsList';

export function SalesPage() {
  const [refreshKey, setRefreshKey] = React.useState(0);

  const handleTransactionAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1">
          <TransactionForm onTransactionAdded={handleTransactionAdded} />
        </div>
        <div className="lg:w-80">
          <DailyTotal key={refreshKey} />
        </div>
      </div>
      <TransactionsList key={refreshKey} />
    </div>
  );
}
