import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DailyReportData {
  date: string;
  total: number;
  net_total: number;
  vat_total: number;
  count: number;
}

export function DailyReport() {
  const [selectedDate, setSelectedDate] = React.useState(
    new Date().toISOString().split('T')[0]
  );
  const [reportData, setReportData] = React.useState<DailyReportData | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    fetchDailyReport();
  }, [selectedDate]);

  const fetchDailyReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports/daily?date=${selectedDate}`);
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Error al obtener informe diario:', error);
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
          📊 Informe Diario
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="date" className="text-purple-700 font-medium">Seleccionar Fecha</Label>
          <Input
            id="date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border-purple-200 focus:border-purple-400 focus:ring-purple-200"
          />
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
                <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {formatAmount(reportData?.total || 0)}
                </div>
                <div className="text-sm text-purple-600 flex items-center justify-center gap-1">
                  💼 {reportData?.count || 0} transacciones
                </div>
                <div className="text-xs text-purple-500 bg-purple-50 rounded-md py-1 px-2">
                  📅 {new Date(selectedDate).toLocaleDateString('es-ES')}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
