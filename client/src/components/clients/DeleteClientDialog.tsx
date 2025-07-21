import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Client {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
}

interface DeleteClientDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientDeleted: () => void;
}

export function DeleteClientDialog({ client, open, onOpenChange, onClientDeleted }: DeleteClientDialogProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleDelete = async () => {
    if (!client) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/clients/${client.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onClientDeleted();
        onOpenChange(false);
      } else {
        const data = await response.json();
        setError(data.error || 'Error al eliminar cliente');
      }
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      setError('Error al eliminar cliente');
    } finally {
      setLoading(false);
    }
  };

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Eliminar Cliente</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que quieres eliminar a "{client.name}"? Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

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
            {loading ? 'Eliminando...' : 'Eliminar Cliente'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
