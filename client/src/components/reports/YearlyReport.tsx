import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface YearlyReportData {
  year: number;
  total: number;
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informe Anual</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Seleccionar Año</Label>
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

        {loading ? (
          <div className="text-center text-muted-foreground">Cargando...</div>
        ) : (
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-purple-600">
              {reportData?.total?.toFixed(2).replace('.', ',') || '0,00'}€
            </div>
            <div className="text-sm text-muted-foreground">
              {reportData?.count || 0} transacciones
            </div>
            <div className="text-xs text-muted-foreground">
              Año {reportData?.year || selectedYear}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
