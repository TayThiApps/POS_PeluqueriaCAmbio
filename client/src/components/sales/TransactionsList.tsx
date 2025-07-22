import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { EditTransactionDialog } from '@/components/sales/EditTransactionDialog';
import { DeleteTransactionDialog } from '@/components/sales/DeleteTransactionDialog';

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

export function TransactionsList() {
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editingTransaction, setEditingTransaction] = React.useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = React.useState<Transaction | null>(null);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  React.useEffect(() => {
    fetchTodaysTransactions();
  }, []);

  const fetchTodaysTransactions = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/transactions?date=${today}`);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error al obtener transacciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditDialogOpen(true);
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    setDeletingTransaction(transaction);
    setDeleteDialogOpen(true);
  };

  const handleTransactionUpdated = () => {
    fetchTodaysTransactions();
  };

  const handleTransactionDeleted = () => {
    fetchTodaysTransactions();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES');
  };

  const formatAmount = (amount: number | null) => {
    if (amount === null) return '-';
    return amount.toFixed(2).replace('.', ',') + '€';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transacciones de Hoy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Cargando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Transacciones de Hoy</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No hay transacciones hoy
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hora</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right">Base</TableHead>
                    <TableHead className="text-right">IVA</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatTime(transaction.transaction_date)}</TableCell>
                      <TableCell>{transaction.client_name}</TableCell>
                      <TableCell>{transaction.description || '-'}</TableCell>
                      <TableCell className="text-right">
                        {formatAmount(transaction.net_amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatAmount(transaction.vat_amount)}
                        {transaction.vat_rate && (
                          <div className="text-xs text-muted-foreground">
                            {transaction.vat_rate}%
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatAmount(transaction.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTransaction(transaction)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTransaction(transaction)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <EditTransactionDialog
        transaction={editingTransaction}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onTransactionUpdated={handleTransactionUpdated}
      />

      <DeleteTransactionDialog
        transaction={deletingTransaction}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onTransactionDeleted={handleTransactionDeleted}
      />
    </>
  );
}
