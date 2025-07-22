import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface MonthlyReportData {
  year: number;
  month: number;
  total: number;
  net_total: number;
  vat_total: number;
  count: number;
}

export function MonthlyReport() {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = React.useState(currentDate.getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = React.useState((currentDate.getMonth() + 1).toString());
  const [reportData, setReportData] = React.useState<MonthlyReportData | null>(null);
  const [loading, setLoading] = React.useState(false);

  const months = [
    { value: '1', label: 'Enero' },
    { value: '2', label: 'Febrero' },
    { value: '3', label: 'Marzo' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Mayo' },
    { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
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
      console.error('Error al obtener informe mensual:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (monthNum: number) => {
    return months.find(m => m.value === monthNum.toString())?.label || '';
  };

  const formatAmount = (amount: number) => {
    return amount.toFixed(2).replace('.', ',') + '€';
  };

  return (
    <Card className="reports-card shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-purple-800 flex items-center gap-2">
          📈 Informe Mensual
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-purple-700 font-medium text-sm">Mes</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="border-purple-200 focus:border-purple-400 focus:ring-purple-200">
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
            <Label className="text-purple-700 font-medium text-sm">Año</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="border-purple-200 focus:border-purple-400 focus:ring-purple-200">
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
          <div className="text-center text-purple-600 py-4">Cargando...</div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-purple-600">Base imponible:</span>
                <span className="font-medium text-purple-800">{formatAmount(reportData?.net_total || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-600">IVA:</span>
                <span className="font-medium text-purple-800">{formatAmount(reportData?.vat_total || 0)}</span>
              </div>
            </div>
            <div className="border-t border-purple-200 pt-3">
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {formatAmount(reportData?.total || 0)}
                </div>
                <div className="text-sm text-purple-600 flex items-center justify-center gap-1">
                  💼 {reportData?.count || 0} transacciones
                </div>
                <div className="text-xs text-purple-500 bg-purple-50 rounded-md py-1 px-2">
                  📅 {getMonthName(reportData?.month || parseInt(selectedMonth))} {reportData?.year || selectedYear}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
