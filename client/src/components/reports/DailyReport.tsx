import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DailyReportData {
  date: string;
  total: number;
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
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-green-600">
              {reportData?.total?.toFixed(2).replace('.', ',') || '0,00'}€
            </div>
            <div className="text-sm text-muted-foreground">
              {reportData?.count || 0} transacciones
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(selectedDate).toLocaleDateString('es-ES')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
