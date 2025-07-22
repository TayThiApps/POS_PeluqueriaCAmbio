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
    <Card>
      <CardHeader>
        <CardTitle>Informe Diario</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="date">Seleccionar Fecha</Label>
          <Input
            id="date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
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
                <div className="text-xl font-bold text-green-600">
                  {formatAmount(reportData?.total || 0)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {reportData?.count || 0} transacciones
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(selectedDate).toLocaleDateString('es-ES')}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
