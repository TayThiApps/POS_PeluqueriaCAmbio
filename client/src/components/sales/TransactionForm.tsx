import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Client {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
}

interface TransactionFormProps {
  onTransactionAdded: () => void;
}

export function TransactionForm({ onTransactionAdded }: TransactionFormProps) {
  const [clients, setClients] = React.useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = React.useState<string>('');
  const [grossAmount, setGrossAmount] = React.useState('');
  const [vatRate, setVatRate] = React.useState('21');
  const [description, setDescription] = React.useState('');
  const [transactionDate, setTransactionDate] = React.useState(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Error al obtener clientes:', error);
    }
  };

  const calculateVatBreakdown = (gross: number, vat: number) => {
    const netAmount = gross / (1 + (vat / 100));
    const vatAmount = gross - netAmount;
    return {
      net: Math.round(netAmount * 100) / 100,
      vat: Math.round(vatAmount * 100) / 100
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !grossAmount) return;

    setLoading(true);
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: parseInt(selectedClientId),
          amount: parseFloat(grossAmount),
          vat_rate: parseFloat(vatRate),
          description: description || null,
          transaction_date: new Date(transactionDate + 'T12:00:00').toISOString(),
        }),
      });

      if (response.ok) {
        setGrossAmount('');
        setDescription('');
        setSelectedClientId('');
        setVatRate('21');
        setTransactionDate(new Date().toISOString().split('T')[0]);
        onTransactionAdded();
      }
    } catch (error) {
      console.error('Error al crear transacción:', error);
    } finally {
      setLoading(false);
    }
  };

  const breakdown = grossAmount ? calculateVatBreakdown(parseFloat(grossAmount) || 0, parseFloat(vatRate)) : null;

  return (
    <Card className="sales-card shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-purple-800 flex items-center gap-2">
          ✨ Nueva Venta
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="client" className="text-purple-700 font-medium">Cliente</Label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger className="border-purple-200 focus:border-purple-400 focus:ring-purple-200">
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transactionDate" className="text-purple-700 font-medium">Fecha de Venta</Label>
              <Input
                id="transactionDate"
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="border-purple-200 focus:border-purple-400 focus:ring-purple-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grossAmount" className="text-purple-700 font-medium">Importe Total (€)</Label>
              <Input
                id="grossAmount"
                type="number"
                step="0.01"
                value={grossAmount}
                onChange={(e) => setGrossAmount(e.target.value)}
                placeholder="0,00"
                className="border-purple-200 focus:border-purple-400 focus:ring-purple-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vatRate" className="text-purple-700 font-medium">Tipo IVA (%)</Label>
              <Select value={vatRate} onValueChange={setVatRate}>
                <SelectTrigger className="border-purple-200 focus:border-purple-400 focus:ring-purple-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0% (Exento)</SelectItem>
                  <SelectItem value="4">4% (Superreducido)</SelectItem>
                  <SelectItem value="10">10% (Reducido)</SelectItem>
                  <SelectItem value="21">21% (General)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {breakdown && (
            <div className="vat-breakdown p-4 rounded-lg space-y-2 text-sm">
              <div className="font-medium text-purple-800 flex items-center gap-2">
                📋 Desglose IVA:
              </div>
              <div className="flex justify-between">
                <span className="text-purple-600">Base imponible:</span>
                <span className="font-medium">{breakdown.net.toFixed(2).replace('.', ',')}€</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-600">IVA ({vatRate}%):</span>
                <span className="font-medium">{breakdown.vat.toFixed(2).replace('.', ',')}€</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-purple-200 pt-2 text-purple-800">
                <span>Total:</span>
                <span>{parseFloat(grossAmount).toFixed(2).replace('.', ',')}€</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description" className="text-purple-700 font-medium">Descripción (opcional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción del servicio o producto"
              className="border-purple-200 focus:border-purple-400 focus:ring-purple-200"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-medium py-2.5 transition-all duration-200 shadow-md hover:shadow-lg"
            disabled={loading || !selectedClientId || !grossAmount}
          >
            {loading ? '✨ Añadiendo Venta...' : '💫 Añadir Venta'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
