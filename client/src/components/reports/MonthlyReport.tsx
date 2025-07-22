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
    <Card>
      <CardHeader>
        <CardTitle>Informe Mensual</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>Mes</Label>
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
            <Label>Año</Label>
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
          <div className="text-center text-muted-foreground">Cargando...</div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Base imponible:</span>
                <span>{formatAmount(reportData?.net_total || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA:</span>
                <span>{formatAmount(reportData?.vat_total || 0)}</span>
              </div>
            </div>
            <div className="border-t pt-2">
              <div className="text-center space-y-1">
                <div className="text-xl font-bold text-blue-600">
                  {formatAmount(reportData?.total || 0)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {reportData?.count || 0} transacciones
                </div>
                <div className="text-xs text-muted-foreground">
                  {getMonthName(reportData?.month || parseInt(selectedMonth))} {reportData?.year || selectedYear}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
