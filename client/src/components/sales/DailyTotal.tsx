import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface DailyTotalData {
  date: string;
  total: number;
  net_total: number;
  vat_total: number;
  count: number;
}

export function DailyTotal() {
  const [dailyTotal, setDailyTotal] = React.useState<DailyTotalData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchDailyTotal();
  }, []);

  const fetchDailyTotal = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/reports/daily?date=${today}`);
      const data = await response.json();
      setDailyTotal(data);
    } catch (error) {
      console.error('Error al obtener total diario:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return amount.toFixed(2).replace('.', ',') + '€';
  };

  if (loading) {
    return (
      <Card className="reports-card shadow-lg">
        <CardHeader>
          <CardTitle className="text-purple-800 flex items-center gap-2">
            🌟 Ventas de Hoy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-purple-600">Cargando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="reports-card shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-purple-800 flex items-center gap-2">
          🌟 Ventas de Hoy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-purple-600">Base imponible:</span>
            <span className="font-medium text-purple-800">{formatAmount(dailyTotal?.net_total || 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-purple-600">IVA:</span>
            <span className="font-medium text-purple-800">{formatAmount(dailyTotal?.vat_total || 0)}</span>
          </div>
          <div className="border-t border-purple-200 pt-3">
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {formatAmount(dailyTotal?.total || 0)}
              </div>
              <div className="text-sm text-purple-600 mt-1 flex items-center justify-center gap-1">
                💼 {dailyTotal?.count || 0} transacciones
              </div>
            </div>
          </div>
        </div>
        <div className="text-xs text-purple-500 text-center bg-purple-50 rounded-md py-2">
          📅 {new Date().toLocaleDateString('es-ES')}
        </div>
      </CardContent>
    </Card>
  );
}
