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
  net_amount: number | null;
  vat_rate: number | null;
  vat_amount: number | null;
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
  const [grossAmount, setGrossAmount] = React.useState('');
  const [vatRate, setVatRate] = React.useState('21');
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
      setGrossAmount(transaction.amount.toString());
      setVatRate((transaction.vat_rate || 21).toString());
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
    if (!transaction || !clientId || !grossAmount) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: parseInt(clientId),
          amount: parseFloat(grossAmount),
          vat_rate: parseFloat(vatRate),
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

  const breakdown = grossAmount ? calculateVatBreakdown(parseFloat(grossAmount) || 0, parseFloat(vatRate)) : null;

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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-grossAmount">Importe Total (€)</Label>
              <Input
                id="edit-grossAmount"
                type="number"
                step="0.01"
                value={grossAmount}
                onChange={(e) => setGrossAmount(e.target.value)}
                placeholder="0,00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-vatRate">Tipo IVA (%)</Label>
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
            <Button type="submit" disabled={loading || !clientId || !grossAmount}>
              {loading ? 'Actualizando...' : 'Actualizar Transacción'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
