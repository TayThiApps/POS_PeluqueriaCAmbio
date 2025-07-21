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
  const [amount, setAmount] = React.useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !amount) return;

    setLoading(true);
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: parseInt(selectedClientId),
          amount: parseFloat(amount),
          description: description || null,
          transaction_date: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setAmount('');
        setDescription('');
        setSelectedClientId('');
        onTransactionAdded();
      }
    } catch (error) {
      console.error('Error al crear transacción:', error);
    } finally {
      setLoading(false);
    }
  };

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

          <div className="space-y-2">
            <Label htmlFor="amount">Importe (€)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
            />
          </div>

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
            disabled={loading || !selectedClientId || !amount}
          >
            {loading ? 'Añadiendo Venta...' : 'Añadir Venta'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
