import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { EditClientDialog } from '@/components/clients/EditClientDialog';
import { DeleteClientDialog } from '@/components/clients/DeleteClientDialog';

interface Client {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  created_at: string;
}

export function ClientsList() {
  const [clients, setClients] = React.useState<Client[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editingClient, setEditingClient] = React.useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = React.useState<Client | null>(null);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

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
    } finally {
      setLoading(false);
    }
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setEditDialogOpen(true);
  };

  const handleDeleteClient = (client: Client) => {
    setDeletingClient(client);
    setDeleteDialogOpen(true);
  };

  const handleClientUpdated = () => {
    fetchClients();
  };

  const handleClientDeleted = () => {
    fetchClients();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  if (loading) {
    return (
      <Card className="clients-card shadow-lg">
        <CardHeader>
          <CardTitle className="text-purple-800 flex items-center gap-2">
            👥 Todos los Clientes
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
      <Card className="clients-card shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-purple-800 flex items-center gap-2">
            👥 Todos los Clientes ({clients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center text-purple-600 py-8 bg-purple-50 rounded-lg">
              🌸 No se han añadido clientes aún
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-purple-200">
                  <TableHead className="text-purple-700 font-medium">Nombre</TableHead>
                  <TableHead className="text-purple-700 font-medium">Teléfono</TableHead>
                  <TableHead className="text-purple-700 font-medium">Correo</TableHead>
                  <TableHead className="text-purple-700 font-medium">Fecha de Alta</TableHead>
                  <TableHead className="text-right text-purple-700 font-medium">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client, index) => (
                  <TableRow key={client.id} className={index % 2 === 0 ? 'bg-purple-25' : 'bg-white'}>
                    <TableCell className="font-semibold text-purple-800">👤 {client.name}</TableCell>
                    <TableCell className="text-purple-600">
                      {client.phone ? `📞 ${client.phone}` : '📞 -'}
                    </TableCell>
                    <TableCell className="text-purple-600">
                      {client.email ? `✉️ ${client.email}` : '✉️ -'}
                    </TableCell>
                    <TableCell className="text-purple-600">📅 {formatDate(client.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClient(client)}
                          className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                        >
                          ✏️ Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClient(client)}
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
          )}
        </CardContent>
      </Card>

      <EditClientDialog
        client={editingClient}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onClientUpdated={handleClientUpdated}
      />

      <DeleteClientDialog
        client={deletingClient}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onClientDeleted={handleClientDeleted}
      />
    </>
  );
}
