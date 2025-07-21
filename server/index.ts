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
    console.log('Fetching all clients');
    const clients = await db.selectFrom('clients').selectAll().execute();
    console.log('Found clients:', clients.length);
    res.json(clients);
    return;
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
    return;
  }
});

// Create new client
app.post('/api/clients', async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    console.log('Creating new client:', { name, phone, email });
    
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

    console.log('Created client with ID:', result?.id);
    res.json({ id: result?.id, name, phone, email });
    return;
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Failed to create client' });
    return;
  }
});

// Update client
app.put('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email } = req.body;
    console.log('Updating client:', { id, name, phone, email });

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
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    console.log('Updated client with ID:', id);
    res.json({ id: parseInt(id), name, phone, email });
    return;
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Failed to update client' });
    return;
  }
});

// Delete client
app.delete('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting client with ID:', id);

    // Check if client has transactions
    const transactionsCount = await db
      .selectFrom('transactions')
      .select(db => db.fn.count('id').as('count'))
      .where('client_id', '=', parseInt(id))
      .executeTakeFirst();

    if (transactionsCount && transactionsCount.count > 0) {
      res.status(400).json({ 
        error: 'Cannot delete client with existing transactions. Please delete transactions first.' 
      });
      return;
    }

    const result = await db
      .deleteFrom('clients')
      .where('id', '=', parseInt(id))
      .executeTakeFirst();

    if (result.numDeletedRows === 0) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    console.log('Deleted client with ID:', id);
    res.json({ message: 'Client deleted successfully' });
    return;
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Failed to delete client' });
    return;
  }
});

// Get all transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const { date, month, year } = req.query;
    console.log('Fetching transactions with filters:', { date, month, year });

    let query = db
      .selectFrom('transactions')
      .innerJoin('clients', 'transactions.client_id', 'clients.id')
      .select([
        'transactions.id',
        'transactions.client_id',
        'transactions.amount',
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
    console.log('Found transactions:', transactions.length);
    res.json(transactions);
    return;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
    return;
  }
});

// Create new transaction
app.post('/api/transactions', async (req, res) => {
  try {
    const { client_id, amount, description, transaction_date } = req.body;
    console.log('Creating new transaction:', { client_id, amount, description, transaction_date });

    const result = await db
      .insertInto('transactions')
      .values({
        client_id,
        amount,
        description: description || null,
        transaction_date: transaction_date || new Date().toISOString(),
        created_at: new Date().toISOString()
      })
      .returning('id')
      .executeTakeFirst();

    console.log('Created transaction with ID:', result?.id);
    res.json({ id: result?.id, client_id, amount, description, transaction_date });
    return;
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
    return;
  }
});

// Update transaction
app.put('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { client_id, amount, description, transaction_date } = req.body;
    console.log('Updating transaction:', { id, client_id, amount, description, transaction_date });

    const result = await db
      .updateTable('transactions')
      .set({
        client_id,
        amount,
        description: description || null,
        transaction_date: transaction_date || new Date().toISOString(),
      })
      .where('id', '=', parseInt(id))
      .executeTakeFirst();

    if (result.numUpdatedRows === 0) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    console.log('Updated transaction with ID:', id);
    res.json({ id: parseInt(id), client_id, amount, description, transaction_date });
    return;
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
    return;
  }
});

// Delete transaction
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting transaction with ID:', id);

    const result = await db
      .deleteFrom('transactions')
      .where('id', '=', parseInt(id))
      .executeTakeFirst();

    if (result.numDeletedRows === 0) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    console.log('Deleted transaction with ID:', id);
    res.json({ message: 'Transaction deleted successfully' });
    return;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
    return;
  }
});

// Get daily totals
app.get('/api/reports/daily', async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    console.log('Fetching daily total for date:', targetDate);

    const result = await db
      .selectFrom('transactions')
      .select(db => [
        db.fn.sum('amount').as('total'),
        db.fn.count('id').as('count')
      ])
      .where('transaction_date', 'like', `${targetDate}%`)
      .executeTakeFirst();

    console.log('Daily total result:', result);
    res.json({
      date: targetDate,
      total: result?.total || 0,
      count: result?.count || 0
    });
    return;
  } catch (error) {
    console.error('Error fetching daily total:', error);
    res.status(500).json({ error: 'Failed to fetch daily total' });
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
    
    console.log('Fetching monthly total for:', datePrefix);

    const result = await db
      .selectFrom('transactions')
      .select(db => [
        db.fn.sum('amount').as('total'),
        db.fn.count('id').as('count')
      ])
      .where('transaction_date', 'like', `${datePrefix}%`)
      .executeTakeFirst();

    console.log('Monthly total result:', result);
    res.json({
      year: targetYear,
      month: targetMonth,
      total: result?.total || 0,
      count: result?.count || 0
    });
    return;
  } catch (error) {
    console.error('Error fetching monthly total:', error);
    res.status(500).json({ error: 'Failed to fetch monthly total' });
    return;
  }
});

// Get yearly totals
app.get('/api/reports/yearly', async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = year || new Date().getFullYear();
    
    console.log('Fetching yearly total for:', targetYear);

    const result = await db
      .selectFrom('transactions')
      .select(db => [
        db.fn.sum('amount').as('total'),
        db.fn.count('id').as('count')
      ])
      .where('transaction_date', 'like', `${targetYear}%`)
      .executeTakeFirst();

    console.log('Yearly total result:', result);
    res.json({
      year: targetYear,
      total: result?.total || 0,
      count: result?.count || 0
    });
    return;
  } catch (error) {
    console.error('Error fetching yearly total:', error);
    res.status(500).json({ error: 'Failed to fetch yearly total' });
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
      console.log(`API Server running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Start the server directly if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Starting server...');
  startServer(process.env.PORT || 3001);
}
