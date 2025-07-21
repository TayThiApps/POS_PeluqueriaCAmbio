import * as React from 'react';
import { DailyReport } from '@/components/reports/DailyReport';
import { MonthlyReport } from '@/components/reports/MonthlyReport';
import { YearlyReport } from '@/components/reports/YearlyReport';

export function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <DailyReport />
        <MonthlyReport />
        <YearlyReport />
      </div>
    </div>
  );
}
