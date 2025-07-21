import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface MonthlyReportData {
  year: number;
  month: number;
  total: number;
  count: number;
}

export function MonthlyReport() {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = React.useState(currentDate.getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = React.useState((currentDate.getMonth() + 1).toString());
  const [reportData, setReportData] = React.useState<MonthlyReportData | null>(null);
  const [loading, setLoading] = React.useState(false);

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => {
    const year = currentDate.getFullYear() - 2 + i;
    return { value: year.toString(), label: year.toString() };
  });

  React.useEffect(() => {
    fetchMonthlyReport();
  }, [selectedYear, selectedMonth]);

  const fetchMonthlyReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports/monthly?year=${selectedYear}&month=${selectedMonth}`);
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Error fetching monthly report:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (monthNum: number) => {
    return months.find(m => m.value === monthNum.toString())?.label || '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>Month</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Year</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year.value} value={year.value}>
                    {year.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-blue-600">
              ${reportData?.total?.toFixed(2) || '0.00'}
            </div>
            <div className="text-sm text-muted-foreground">
              {reportData?.count || 0} transactions
            </div>
            <div className="text-xs text-muted-foreground">
              {getMonthName(reportData?.month || parseInt(selectedMonth))} {reportData?.year || selectedYear}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
