import * as React from 'react';
import { ClientForm } from '@/components/clients/ClientForm';
import { ClientsList } from '@/components/clients/ClientsList';

export function ClientsPage() {
  const [refreshKey, setRefreshKey] = React.useState(0);

  const handleClientAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <ClientForm onClientAdded={handleClientAdded} />
      <ClientsList key={refreshKey} />
    </div>
  );
}
