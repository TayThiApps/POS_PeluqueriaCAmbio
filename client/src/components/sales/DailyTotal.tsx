import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface DailyTotalData {
  date: string;
  total: number;
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
      console.error('Error fetching daily total:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Today's Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Sales</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">
            ${dailyTotal?.total?.toFixed(2) || '0.00'}
          </div>
          <div className="text-sm text-muted-foreground">
            {dailyTotal?.count || 0} transactions
          </div>
        </div>
        <div className="text-xs text-muted-foreground text-center">
          {new Date().toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
}
