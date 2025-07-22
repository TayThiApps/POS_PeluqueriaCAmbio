import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface YearlyReportData {
  year: number;
  total: number;
  net_total: number;
  vat_total: number;
  count: number;
}

export function YearlyReport() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = React.useState(currentYear.toString());
  const [reportData, setReportData] = React.useState<YearlyReportData | null>(null);
  const [loading, setLoading] = React.useState(false);

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = currentYear - 5 + i;
    return { value: year.toString(), label: year.toString() };
  });

  React.useEffect(() => {
    fetchYearlyReport();
  }, [selectedYear]);

  const fetchYearlyReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports/yearly?year=${selectedYear}`);
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Error al obtener informe anual:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return amount.toFixed(2).replace('.', ',') + '€';
  };

  return (
    <Card className="reports-card shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-purple-800 flex items-center gap-2">
          📅 Informe Anual
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-purple-700 font-medium">Seleccionar Año</Label>
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
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                  {formatAmount(reportData?.total || 0)}
                </div>
                <div className="text-sm text-purple-600 flex items-center justify-center gap-1">
                  💼 {reportData?.count || 0} transacciones
                </div>
                <div className="text-xs text-purple-500 bg-purple-50 rounded-md py-1 px-2">
                  📅 Año {reportData?.year || selectedYear}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
