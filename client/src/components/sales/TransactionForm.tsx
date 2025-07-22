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
          transaction_date: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setGrossAmount('');
        setDescription('');
        setSelectedClientId('');
        setVatRate('21');
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
    <Card>
      <CardHeader>
        <CardTitle>Nueva Venta</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client">Cliente</Label>
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grossAmount">Importe Total (€)</Label>
              <Input
                id="grossAmount"
                type="number"
                step="0.01"
                value={grossAmount}
                onChange={(e) => setGrossAmount(e.target.value)}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vatRate">Tipo IVA (%)</Label>
              <Select value={vatRate} onValueChange={setVatRate}>
                <SelectTrigger>
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
            <div className="bg-muted p-3 rounded-md space-y-1 text-sm">
              <div className="font-medium">Desglose IVA:</div>
              <div className="flex justify-between">
                <span>Base imponible:</span>
                <span>{breakdown.net.toFixed(2).replace('.', ',')}€</span>
              </div>
              <div className="flex justify-between">
                <span>IVA ({vatRate}%):</span>
                <span>{breakdown.vat.toFixed(2).replace('.', ',')}€</span>
              </div>
              <div className="flex justify-between font-medium border-t pt-1">
                <span>Total:</span>
                <span>{parseFloat(grossAmount).toFixed(2).replace('.', ',')}€</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción del servicio o producto"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={loading || !selectedClientId || !grossAmount}
          >
            {loading ? 'Añadiendo Venta...' : 'Añadir Venta'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
