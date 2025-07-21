import * as React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from '@/components/navigation/Navigation';
import { SalesPage } from '@/pages/sales/SalesPage';
import { ClientsPage } from '@/pages/clients/ClientsPage';
import { ReportsPage } from '@/pages/reports/ReportsPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<SalesPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
