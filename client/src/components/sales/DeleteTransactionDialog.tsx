import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Transaction {
  id: number;
  client_id: number;
  amount: number;
  description: string | null;
  transaction_date: string;
  client_name: string;
}

interface DeleteTransactionDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTransactionDeleted: () => void;
}

export function DeleteTransactionDialog({ transaction, open, onOpenChange, onTransactionDeleted }: DeleteTransactionDialogProps) {
  const [loading, setLoading] = React.useState(false);

  const handleDelete = async () => {
    if (!transaction) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onTransactionDeleted();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error al eliminar transacción:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Eliminar Transacción</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que quieres eliminar esta transacción de {transaction.amount.toFixed(2).replace('.', ',')}€ para {transaction.client_name}? Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 justify-end">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? 'Eliminando...' : 'Eliminar Transacción'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
