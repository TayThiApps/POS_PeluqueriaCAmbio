import express from 'express';
import dotenv from 'dotenv';
import { setupStaticServing } from './static-serve.js';
import { db } from './database.js';

dotenv.config();

const app = express();

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Get all clients
app.get('/api/clients', async (req, res) => {
  try {
    console.log('Obteniendo todos los clientes');
    const clients = await db.selectFrom('clients').selectAll().execute();
    console.log('Clientes encontrados:', clients.length);
    res.json(clients);
    return;
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error al obtener clientes' });
    return;
  }
});

// Create new client
app.post('/api/clients', async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    console.log('Creando nuevo cliente:', { name, phone, email });
    
    const result = await db
      .insertInto('clients')
      .values({
        name,
        phone: phone || null,
        email: email || null,
        created_at: new Date().toISOString()
      })
      .returning('id')
      .executeTakeFirst();

    console.log('Cliente creado con ID:', result?.id);
    res.json({ id: result?.id, name, phone, email });
    return;
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ error: 'Error al crear cliente' });
    return;
  }
});

// Update client
app.put('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email } = req.body;
    console.log('Actualizando cliente:', { id, name, phone, email });

    const result = await db
      .updateTable('clients')
      .set({
        name,
        phone: phone || null,
        email: email || null,
      })
      .where('id', '=', parseInt(id))
      .executeTakeFirst();

    if (result.numUpdatedRows === 0) {
      res.status(404).json({ error: 'Cliente no encontrado' });
      return;
    }

    console.log('Cliente actualizado con ID:', id);
    res.json({ id: parseInt(id), name, phone, email });
    return;
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ error: 'Error al actualizar cliente' });
    return;
  }
});

// Delete client
app.delete('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Eliminando cliente con ID:', id);

    // Check if client has transactions
    const transactionsCount = await db
      .selectFrom('transactions')
      .select(db => db.fn.count('id').as('count'))
      .where('client_id', '=', parseInt(id))
      .executeTakeFirst();

    if (transactionsCount && transactionsCount.count > 0) {
      res.status(400).json({ 
        error: 'No se puede eliminar el cliente con transacciones existentes. Por favor elimina las transacciones primero.' 
      });
      return;
    }

    const result = await db
      .deleteFrom('clients')
      .where('id', '=', parseInt(id))
      .executeTakeFirst();

    if (result.numDeletedRows === 0) {
      res.status(404).json({ error: 'Cliente no encontrado' });
      return;
    }

    console.log('Cliente eliminado con ID:', id);
    res.json({ message: 'Cliente eliminado correctamente' });
    return;
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ error: 'Error al eliminar cliente' });
    return;
  }
});

// Get all transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const { date, month, year } = req.query;
    console.log('Obteniendo transacciones con filtros:', { date, month, year });

    let query = db
      .selectFrom('transactions')
      .innerJoin('clients', 'transactions.client_id', 'clients.id')
      .select([
        'transactions.id',
        'transactions.client_id',
        'transactions.amount',
        'transactions.net_amount',
        'transactions.vat_rate',
        'transactions.vat_amount',
        'transactions.description',
        'transactions.transaction_date',
        'clients.name as client_name'
      ]);

    if (date) {
      query = query.where('transactions.transaction_date', 'like', `${date}%`);
    } else if (month && year) {
      query = query.where('transactions.transaction_date', 'like', `${year}-${month.toString().padStart(2, '0')}%`);
    } else if (year) {
      query = query.where('transactions.transaction_date', 'like', `${year}%`);
    }

    const transactions = await query.orderBy('transactions.transaction_date', 'desc').execute();
    console.log('Transacciones encontradas:', transactions.length);
    res.json(transactions);
    return;
  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    res.status(500).json({ error: 'Error al obtener transacciones' });
    return;
  }
});

// Create new transaction
app.post('/api/transactions', async (req, res) => {
  try {
    const { client_id, amount, description, transaction_date, vat_rate = 21.0 } = req.body;
    console.log('Creando nueva transacción:', { client_id, amount, description, transaction_date, vat_rate });

    // Calculate VAT breakdown
    const netAmount = Math.round((amount / (1 + (vat_rate / 100))) * 100) / 100;
    const vatAmount = Math.round((amount - netAmount) * 100) / 100;

    const result = await db
      .insertInto('transactions')
      .values({
        client_id,
        amount,
        net_amount: netAmount,
        vat_rate,
        vat_amount: vatAmount,
        description: description || null,
        transaction_date: transaction_date || new Date().toISOString(),
        created_at: new Date().toISOString()
      })
      .returning('id')
      .executeTakeFirst();

    console.log('Transacción creada con ID:', result?.id);
    res.json({ 
      id: result?.id, 
      client_id, 
      amount, 
      net_amount: netAmount,
      vat_rate,
      vat_amount: vatAmount,
      description, 
      transaction_date 
    });
    return;
  } catch (error) {
    console.error('Error al crear transacción:', error);
    res.status(500).json({ error: 'Error al crear transacción' });
    return;
  }
});

// Update transaction
app.put('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { client_id, amount, description, transaction_date, vat_rate = 21.0 } = req.body;
    console.log('Actualizando transacción:', { id, client_id, amount, description, transaction_date, vat_rate });

    // Calculate VAT breakdown
    const netAmount = Math.round((amount / (1 + (vat_rate / 100))) * 100) / 100;
    const vatAmount = Math.round((amount - netAmount) * 100) / 100;

    const result = await db
      .updateTable('transactions')
      .set({
        client_id,
        amount,
        net_amount: netAmount,
        vat_rate,
        vat_amount: vatAmount,
        description: description || null,
        transaction_date: transaction_date || new Date().toISOString(),
      })
      .where('id', '=', parseInt(id))
      .executeTakeFirst();

    if (result.numUpdatedRows === 0) {
      res.status(404).json({ error: 'Transacción no encontrada' });
      return;
    }

    console.log('Transacción actualizada con ID:', id);
    res.json({ 
      id: parseInt(id), 
      client_id, 
      amount, 
      net_amount: netAmount,
      vat_rate,
      vat_amount: vatAmount,
      description, 
      transaction_date 
    });
    return;
  } catch (error) {
    console.error('Error al actualizar transacción:', error);
    res.status(500).json({ error: 'Error al actualizar transacción' });
    return;
  }
});

// Delete transaction
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Eliminando transacción con ID:', id);

    const result = await db
      .deleteFrom('transactions')
      .where('id', '=', parseInt(id))
      .executeTakeFirst();

    if (result.numDeletedRows === 0) {
      res.status(404).json({ error: 'Transacción no encontrada' });
      return;
    }

    console.log('Transacción eliminada con ID:', id);
    res.json({ message: 'Transacción eliminada correctamente' });
    return;
  } catch (error) {
    console.error('Error al eliminar transacción:', error);
    res.status(500).json({ error: 'Error al eliminar transacción' });
    return;
  }
});

// Get daily totals
app.get('/api/reports/daily', async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    console.log('Obteniendo total diario para fecha:', targetDate);

    const result = await db
      .selectFrom('transactions')
      .select(db => [
        db.fn.sum('amount').as('total'),
        db.fn.sum('net_amount').as('net_total'),
        db.fn.sum('vat_amount').as('vat_total'),
        db.fn.count('id').as('count')
      ])
      .where('transaction_date', 'like', `${targetDate}%`)
      .executeTakeFirst();

    console.log('Resultado total diario:', result);
    res.json({
      date: targetDate,
      total: result?.total || 0,
      net_total: result?.net_total || 0,
      vat_total: result?.vat_total || 0,
      count: result?.count || 0
    });
    return;
  } catch (error) {
    console.error('Error al obtener total diario:', error);
    res.status(500).json({ error: 'Error al obtener total diario' });
    return;
  }
});

// Get monthly totals
app.get('/api/reports/monthly', async (req, res) => {
  try {
    const { year, month } = req.query;
    const currentDate = new Date();
    const targetYear = year || currentDate.getFullYear();
    const targetMonth = month || (currentDate.getMonth() + 1);
    const datePrefix = `${targetYear}-${targetMonth.toString().padStart(2, '0')}`;
    
    console.log('Obteniendo total mensual para:', datePrefix);

    const result = await db
      .selectFrom('transactions')
      .select(db => [
        db.fn.sum('amount').as('total'),
        db.fn.sum('net_amount').as('net_total'),
        db.fn.sum('vat_amount').as('vat_total'),
        db.fn.count('id').as('count')
      ])
      .where('transaction_date', 'like', `${datePrefix}%`)
      .executeTakeFirst();

    console.log('Resultado total mensual:', result);
    res.json({
      year: targetYear,
      month: targetMonth,
      total: result?.total || 0,
      net_total: result?.net_total || 0,
      vat_total: result?.vat_total || 0,
      count: result?.count || 0
    });
    return;
  } catch (error) {
    console.error('Error al obtener total mensual:', error);
    res.status(500).json({ error: 'Error al obtener total mensual' });
    return;
  }
});

// Get yearly totals
app.get('/api/reports/yearly', async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = year || new Date().getFullYear();
    
    console.log('Obteniendo total anual para:', targetYear);

    const result = await db
      .selectFrom('transactions')
      .select(db => [
        db.fn.sum('amount').as('total'),
        db.fn.sum('net_amount').as('net_total'),
        db.fn.sum('vat_amount').as('vat_total'),
        db.fn.count('id').as('count')
      ])
      .where('transaction_date', 'like', `${targetYear}%`)
      .executeTakeFirst();

    console.log('Resultado total anual:', result);
    res.json({
      year: targetYear,
      total: result?.total || 0,
      net_total: result?.net_total || 0,
      vat_total: result?.vat_total || 0,
      count: result?.count || 0
    });
    return;
  } catch (error) {
    console.error('Error al obtener total anual:', error);
    res.status(500).json({ error: 'Error al obtener total anual' });
    return;
  }
});

// Export a function to start the server
export async function startServer(port) {
  try {
    if (process.env.NODE_ENV === 'production') {
      setupStaticServing(app);
    }
    app.listen(port, () => {
      console.log(`Servidor API ejecutándose en puerto ${port}`);
    });
  } catch (err) {
    console.error('Error al iniciar servidor:', err);
    process.exit(1);
  }
}

// Start the server directly if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Iniciando servidor...');
  startServer(process.env.PORT || 3001);
}
