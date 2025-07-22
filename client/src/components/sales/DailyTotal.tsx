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
      <Card>
        <CardHeader>
          <CardTitle>Ventas de Hoy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Cargando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventas de Hoy</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Base imponible:</span>
            <span>{formatAmount(dailyTotal?.net_total || 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>IVA:</span>
            <span>{formatAmount(dailyTotal?.vat_total || 0)}</span>
          </div>
          <div className="border-t pt-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatAmount(dailyTotal?.total || 0)}
              </div>
              <div className="text-sm text-muted-foreground">
                {dailyTotal?.count || 0} transacciones
              </div>
            </div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground text-center">
          {new Date().toLocaleDateString('es-ES')}
        </div>
      </CardContent>
    </Card>
  );
}
