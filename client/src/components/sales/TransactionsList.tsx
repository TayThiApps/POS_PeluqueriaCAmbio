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
      <Card className="sales-card shadow-lg">
        <CardHeader>
          <CardTitle className="text-purple-800 flex items-center gap-2">
            📋 Transacciones de Hoy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-purple-600">Cargando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="sales-card shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-purple-800 flex items-center gap-2">
            📋 Transacciones de Hoy
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center text-purple-600 py-8 bg-purple-50 rounded-lg">
              🌸 No hay transacciones hoy
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-purple-200">
                    <TableHead className="text-purple-700 font-medium">Hora</TableHead>
                    <TableHead className="text-purple-700 font-medium">Cliente</TableHead>
                    <TableHead className="text-purple-700 font-medium">Descripción</TableHead>
                    <TableHead className="text-right text-purple-700 font-medium">Base</TableHead>
                    <TableHead className="text-right text-purple-700 font-medium">IVA</TableHead>
                    <TableHead className="text-right text-purple-700 font-medium">Total</TableHead>
                    <TableHead className="text-right text-purple-700 font-medium">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction, index) => (
                    <TableRow key={transaction.id} className={index % 2 === 0 ? 'bg-purple-25' : 'bg-white'}>
                      <TableCell className="text-purple-600">⏰ {formatTime(transaction.transaction_date)}</TableCell>
                      <TableCell className="font-medium text-purple-800">{transaction.client_name}</TableCell>
                      <TableCell className="text-purple-600">{transaction.description || '💫 Sin descripción'}</TableCell>
                      <TableCell className="text-right text-purple-800">
                        {formatAmount(transaction.net_amount)}
                      </TableCell>
                      <TableCell className="text-right text-purple-800">
                        {formatAmount(transaction.vat_amount)}
                        {transaction.vat_rate && (
                          <div className="text-xs text-purple-500">
                            {transaction.vat_rate}%
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {formatAmount(transaction.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTransaction(transaction)}
                            className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                          >
                            ✏️ Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTransaction(transaction)}
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            🗑️ Eliminar
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
