import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Client {
  id: number;
  name: string;
}

interface Transaction {
  id: number;
  client_id: number;
  amount: number;
  description: string | null;
  transaction_date: string;
  client_name: string;
}

interface EditTransactionDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTransactionUpdated: () => void;
}

export function EditTransactionDialog({ transaction, open, onOpenChange, onTransactionUpdated }: EditTransactionDialogProps) {
  const [clients, setClients] = React.useState<Client[]>([]);
  const [clientId, setClientId] = React.useState<string>('');
  const [amount, setAmount] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [transactionDate, setTransactionDate] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      fetchClients();
    }
  }, [open]);

  React.useEffect(() => {
    if (transaction) {
      setClientId(transaction.client_id.toString());
      setAmount(transaction.amount.toString());
      setDescription(transaction.description || '');
      setTransactionDate(transaction.transaction_date.split('T')[0]);
    }
  }, [transaction]);

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
    if (!transaction || !clientId || !amount) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: parseInt(clientId),
          amount: parseFloat(amount),
          description: description || null,
          transaction_date: new Date(transactionDate + 'T00:00:00').toISOString(),
        }),
      });

      if (response.ok) {
        onTransactionUpdated();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error al actualizar transacción:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Transacción</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-client">Cliente</Label>
            <Select value={clientId} onValueChange={setClientId}>
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
            <Label htmlFor="edit-amount">Importe (€)</Label>
            <Input
              id="edit-amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Descripción</Label>
            <Input
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción del servicio o producto"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-date">Fecha</Label>
            <Input
              id="edit-date"
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !clientId || !amount}>
              {loading ? 'Actualizando...' : 'Actualizar Transacción'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
