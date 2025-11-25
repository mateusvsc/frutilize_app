import * as SQLite from 'expo-sqlite';
import { Customer, Order, PaymentMethod, User, DailyReportSchedule } from '../types';

let db: SQLite.SQLiteDatabase | null = null;

interface OrderWithCustomer {
  id: number;
  customerId: number;
  items: string;
  total: number;
  paymentMethod: string;
  changeFor: number | null;
  status: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerNeighborhood: string;
  customerReference: string;
  formattedItems: string;
}

interface DailyOrderReport {
  date: string;
  customerName: string;
  customerPhone: string;
  orderItems: string;
  orderTotal: number;
  paymentMethod: string;
  orderId: number;
}

export const initDatabase = async (): Promise<void> => {
  try {
    db = SQLite.openDatabaseSync('frutilize.db');
    await db.execAsync('PRAGMA foreign_keys = ON;');
    
    console.log('🔑 Foreign keys enabled');
    
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL UNIQUE,
        address TEXT NOT NULL,
        neighborhood TEXT NOT NULL,
        reference TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customerId INTEGER NOT NULL,
        items TEXT NOT NULL,
        total REAL NOT NULL,
        paymentMethod TEXT NOT NULL,
        changeFor REAL,
        status TEXT DEFAULT 'pending',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customerId) REFERENCES customers (id) ON DELETE CASCADE
      );
    `);
    
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS report_schedule (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lastRun TEXT NOT NULL,
        enabled BOOLEAN DEFAULT true,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    const adminExists = await db.getFirstAsync(
      'SELECT id FROM users WHERE username = ?',
      ['admin']
    );
    
    if (!adminExists) {
      await db.runAsync(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        ['admin', 'admin@frutilize.com', '0406', 'admin']
      );
      console.log('✅ Usuário admin criado');
    }
    
    const scheduleExists = await db.getFirstAsync(
      'SELECT id FROM report_schedule LIMIT 1'
    );
    
    if (!scheduleExists) {
      await db.runAsync(
        'INSERT INTO report_schedule (lastRun, enabled) VALUES (?, ?)',
        [new Date().toISOString(), true]
      );
    }
    
    console.log('✅ Todas as tabelas inicializadas com sucesso');
    
  } catch (error) {
    console.error('❌ Erro inicializando database:', error);
    throw error;
  }
};

const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!db) {
    throw new Error('Database não inicializado. Chame initDatabase primeiro.');
  }
  return db;
};

export const saveCustomer = async (customer: Omit<Customer, 'id' | 'createdAt'>): Promise<number> => {
  try {
    const database = getDatabase();
    const existingCustomer = await getCustomerByPhone(customer.phone);
    
    if (existingCustomer && existingCustomer.id) {
      await database.runAsync(
        `UPDATE customers 
         SET name = ?, address = ?, neighborhood = ?, reference = ?
         WHERE phone = ?`,
        [customer.name, customer.address, customer.neighborhood, customer.reference || '', customer.phone]
      );
      console.log('✅ Cliente atualizado:', existingCustomer.id);
      return existingCustomer.id;
    } else {
      const result = await database.runAsync(
        `INSERT INTO customers (name, phone, address, neighborhood, reference) 
         VALUES (?, ?, ?, ?, ?)`,
        [customer.name, customer.phone, customer.address, customer.neighborhood, customer.reference || '']
      );
      const customerId = result.lastInsertRowId as number;
      console.log('✅ Novo cliente criado:', customerId);
      return customerId;
    }
  } catch (error) {
    console.error('❌ Erro salvando cliente:', error);
    throw error;
  }
};

export const getCustomerByPhone = async (phone: string): Promise<Customer | null> => {
  try {
    const database = getDatabase();
    const result = await database.getFirstAsync<Customer>(
      'SELECT * FROM customers WHERE phone = ? LIMIT 1',
      [phone]
    );
    return result || null;
  } catch (error) {
    console.error('Erro buscando cliente por telefone:', error);
    throw error;
  }
};

export const getLastCustomer = async (): Promise<Customer | null> => {
  try {
    const database = getDatabase();
    const result = await database.getFirstAsync<Customer>(
      'SELECT * FROM customers ORDER BY createdAt DESC LIMIT 1'
    );
    return result || null;
  } catch (error) {
    console.error('Erro buscando último cliente:', error);
    throw error;
  }
};

export const saveCustomerAndOrder = async (
  customerData: Omit<Customer, 'id' | 'createdAt'>,
  cartItems: any[],
  paymentMethod: PaymentMethod,
  changeFor?: number
): Promise<{ customerId: number; orderId: number }> => {
  const database = getDatabase();
  
  try {
    await database.execAsync('BEGIN TRANSACTION');
    
    try {
      const customerId = await saveCustomer(customerData);
      console.log('✅ Cliente salvo/atualizado com ID:', customerId);
      
      const itemsString = JSON.stringify(cartItems);
      const total = cartItems.reduce((sum, item) => {
        const itemTotal = (item.product.price || 0) * (item.quantity || 0);
        return sum + itemTotal;
      }, 0);
      
      const validatedTotal = isNaN(total) ? 0 : Number(total.toFixed(2));
      
      console.log('📦 Itens do pedido:', cartItems.length);
      console.log('💰 Total calculado:', validatedTotal);
      
      if (!customerId || customerId <= 0) {
        throw new Error('ID do cliente inválido: ' + customerId);
      }
      
      const orderResult = await database.runAsync(
        'INSERT INTO orders (customerId, items, total, paymentMethod, changeFor, status) VALUES (?, ?, ?, ?, ?, ?)',
        [customerId, itemsString, validatedTotal, paymentMethod, changeFor || null, 'pending']
      );
      
      const orderId = orderResult.lastInsertRowId as number;
      await database.execAsync('COMMIT');
      
      console.log(`✅ Cliente e pedido salvos. Cliente ID: ${customerId}, Pedido ID: ${orderId}`);
      
      return { customerId, orderId };
      
    } catch (error) {
      await database.execAsync('ROLLBACK');
      console.error('❌ Erro na transação saveCustomerAndOrder:', error);
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Erro database em saveCustomerAndOrder:', error);
    throw new Error('Falha ao salvar cliente e pedido: ' + (error as Error).message);
  }
};

export const saveOrder = async (order: Omit<Order, 'id' | 'createdAt'>): Promise<number> => {
  try {
    const database = getDatabase();
    const validatedTotal = isNaN(order.total) ? 0 : Number(order.total.toFixed(2));
    const changeForValue = order.changeFor !== undefined ? order.changeFor : null;
    
    const result = await database.runAsync(
      'INSERT INTO orders (customerId, items, total, paymentMethod, changeFor, status) VALUES (?, ?, ?, ?, ?, ?)',
      [order.customerId, order.items, validatedTotal, order.paymentMethod, changeForValue, order.status]
    );
    return result.lastInsertRowId as number;
  } catch (error) {
    console.error('Erro salvando pedido:', error);
    throw error;
  }
};

export const getCustomerOrders = async (customerId: number): Promise<Order[]> => {
  try {
    const database = getDatabase();
    const result = await database.getAllAsync<Order>(
      'SELECT * FROM orders WHERE customerId = ? ORDER BY createdAt DESC',
      [customerId]
    );
    return result;
  } catch (error) {
    console.error('Erro buscando pedidos do cliente:', error);
    throw error;
  }
};

export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const database = getDatabase();
    const result = await database.getAllAsync<Order>(
      'SELECT * FROM orders ORDER BY createdAt DESC'
    );
    return result;
  } catch (error) {
    console.error('Erro buscando todos os pedidos:', error);
    throw error;
  }
};

export const getOrderById = async (orderId: number): Promise<Order | null> => {
  try {
    const database = getDatabase();
    const result = await database.getFirstAsync<Order>(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );
    return result || null;
  } catch (error) {
    console.error('Erro buscando pedido por ID:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId: number, status: string): Promise<void> => {
  try {
    const database = getDatabase();
    await database.runAsync(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, orderId]
    );
    console.log(`Pedido ${orderId} status atualizado para: ${status}`);
  } catch (error) {
    console.error('Erro atualizando status do pedido:', error);
    throw error;
  }
};

export const formatOrderItems = (itemsString: string): string => {
  try {
    const items = JSON.parse(itemsString);
    
    if (!Array.isArray(items)) {
      return 'Itens inválidos';
    }
    
    return items.map(item => {
      const product = item.product;
      const quantity = item.quantity;
      const unit = product.unit || 'un';
      
      if (unit === 'kg') {
        return `${product.name} - ${quantity}kg`;
      } else if (unit === 'un') {
        return `${product.name} - ${quantity} unidade${quantity > 1 ? 's' : ''}`;
      } else {
        return `${product.name} - ${quantity}x`;
      }
    }).join('\n');
    
  } catch (error) {
    console.error('Erro formatando itens do pedido:', error);
    return 'Erro ao carregar itens';
  }
};

export const getAllOrdersWithCustomers = async (): Promise<OrderWithCustomer[]> => {
  try {
    const database = getDatabase();
    const result = await database.getAllAsync<any>(`
      SELECT 
        orders.*,
        customers.name as customerName,
        customers.phone as customerPhone,
        customers.address as customerAddress,
        customers.neighborhood as customerNeighborhood,
        customers.reference as customerReference
      FROM orders
      LEFT JOIN customers ON orders.customerId = customers.id
      ORDER BY orders.createdAt DESC
    `);
    
    return result.map((order: any) => {
      const formattedItems = formatOrderItems(order.items);
      return {
        id: order.id,
        customerId: order.customerId,
        items: order.items,
        total: order.total,
        paymentMethod: order.paymentMethod,
        changeFor: order.changeFor,
        status: order.status,
        createdAt: order.createdAt,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerAddress: order.customerAddress,
        customerNeighborhood: order.customerNeighborhood,
        customerReference: order.customerReference,
        formattedItems: formattedItems
      };
    });
  } catch (error) {
    console.error('Erro buscando pedidos com clientes:', error);
    throw error;
  }
};

export const registerUser = async (userData: {
  username: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
}): Promise<number> => {
  try {
    const database = getDatabase();
    
    const existingUser = await database.getFirstAsync(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [userData.username, userData.email]
    );
    
    if (existingUser) {
      throw new Error('Username ou email já cadastrado');
    }
    
    const result = await database.runAsync(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [userData.username, userData.email, userData.password, userData.role || 'user']
    );
    
    return result.lastInsertRowId as number;
  } catch (error) {
    console.error('Erro registrando usuário:', error);
    throw error;
  }
};

export const loginUser = async (username: string, password: string): Promise<any> => {
  try {
    const database = getDatabase();
    const user = await database.getFirstAsync(
      'SELECT id, username, email, role FROM users WHERE username = ? AND password = ?',
      [username, password]
    );
    
    if (!user) {
      throw new Error('Credenciais inválidas');
    }
    
    return user;
  } catch (error) {
    console.error('Erro no login:', error);
    throw error;
  }
};

export const getUserById = async (userId: number): Promise<any> => {
  try {
    const database = getDatabase();
    const user = await database.getFirstAsync(
      'SELECT id, username, email, role, createdAt FROM users WHERE id = ?',
      [userId]
    );
    
    return user;
  } catch (error) {
    console.error('Erro buscando usuário:', error);
    throw error;
  }
};

export const updateLastReportRun = async (): Promise<void> => {
  try {
    const database = getDatabase();
    await database.runAsync(
      'UPDATE report_schedule SET lastRun = ? WHERE id = 1',
      [new Date().toISOString()]
    );
  } catch (error) {
    console.error('Erro atualizando último relatório:', error);
    throw error;
  }
};

export const getLastReportRun = async (): Promise<string | null> => {
  try {
    const database = getDatabase();
    const result = await database.getFirstAsync<{ lastRun: string }>(
      'SELECT lastRun FROM report_schedule WHERE id = 1'
    );
    
    return result?.lastRun || null;
  } catch (error) {
    console.error('Erro buscando último relatório:', error);
    return null;
  }
};

export const shouldRunDailyReport = async (): Promise<boolean> => {
  try {
    const lastRun = await getLastReportRun();
    if (!lastRun) return true;
    
    const lastRunDate = new Date(lastRun);
    const today = new Date();
    
    return lastRunDate.toDateString() !== today.toDateString();
  } catch (error) {
    console.error('Erro verificando agendamento:', error);
    return false;
  }
};

export const getOrderStatistics = async (): Promise<{
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  uniqueCustomers: number;
  statusBreakdown: Array<{ status: string; count: number }>;
}> => {
  try {
    const database = getDatabase();
    
    const statsResult = await database.getFirstAsync<{
      totalOrders: number;
      totalRevenue: number;
      averageOrderValue: number;
      uniqueCustomers: number;
    }>(`
      SELECT 
        COUNT(*) as totalOrders,
        COALESCE(SUM(total), 0) as totalRevenue,
        COALESCE(AVG(total), 0) as averageOrderValue,
        COUNT(DISTINCT customerId) as uniqueCustomers
      FROM orders
      WHERE status != 'cancelled'
    `);

    const statusStats = await database.getAllAsync<{ status: string; count: number }>(`
      SELECT status, COUNT(*) as count 
      FROM orders 
      GROUP BY status
    `);
    
    const stats = statsResult || {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      uniqueCustomers: 0
    };
    
    return {
      totalOrders: stats.totalOrders,
      totalRevenue: stats.totalRevenue,
      averageOrderValue: stats.averageOrderValue,
      uniqueCustomers: stats.uniqueCustomers,
      statusBreakdown: statusStats
    };
  } catch (error) {
    console.error('Erro buscando estatísticas:', error);
    throw error;
  }
};

export const generateDailyCSV = async (targetDate: string): Promise<string> => {
  try {
    const database = getDatabase();
    
    const result = await database.getAllAsync<any>(`
      SELECT 
        orders.id as orderId,
        orders.total as orderTotal,
        orders.items as orderItems,
        orders.paymentMethod as paymentMethod,
        orders.createdAt as orderDate,
        customers.name as customerName,
        customers.phone as customerPhone
      FROM orders
      LEFT JOIN customers ON orders.customerId = customers.id
      WHERE DATE(orders.createdAt) = DATE(?)
      ORDER BY orders.createdAt ASC
    `, [targetDate]);

    if (result.length === 0) {
      return 'Nenhum pedido encontrado para esta data.';
    }

    let csv = 'Data,Hora,ID Pedido,Cliente,Telefone,Itens do Pedido,Total,Forma de Pagamento\n';
    
    result.forEach((row: any) => {
      const orderDate = new Date(row.orderDate);
      const dateStr = orderDate.toLocaleDateString('pt-BR');
      const timeStr = orderDate.toLocaleTimeString('pt-BR');
      
      const escapeCSV = (str: string) => {
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      csv += `${escapeCSV(dateStr)},`;
      csv += `${escapeCSV(timeStr)},`;
      csv += `${row.orderId},`;
      csv += `${escapeCSV(row.customerName || 'N/A')},`;
      csv += `${escapeCSV(row.customerPhone || 'N/A')},`;
      csv += `${escapeCSV(formatOrderItemsForCSV(row.orderItems))},`;
      csv += `R$ ${row.orderTotal.toFixed(2)},`;
      csv += `${escapeCSV(row.paymentMethod)}\n`;
    });

    const dailyTotal = result.reduce((sum: number, row: any) => sum + row.orderTotal, 0);
    csv += `\n,,,,,,Total do Dia:,"R$ ${dailyTotal.toFixed(2)}"`;
    csv += `\n,,,,,,Total de Pedidos:,${result.length}`;
    
    return csv;
  } catch (error) {
    console.error('Erro gerando CSV diário:', error);
    throw error;
  }
};

const formatOrderItemsForCSV = (itemsString: string): string => {
  try {
    const items = JSON.parse(itemsString);
    
    if (!Array.isArray(items)) {
      return 'Itens inválidos';
    }
    
    return items.map(item => {
      const product = item.product;
      const quantity = item.quantity;
      const unit = product.unit || 'un';
      const price = item.product.price || 0;
      const total = price * quantity;
      
      if (unit === 'kg') {
        return `${product.name} - ${quantity}kg - R$ ${total.toFixed(2)}`;
      } else if (unit === 'un') {
        return `${product.name} - ${quantity} un - R$ ${total.toFixed(2)}`;
      } else {
        return `${product.name} - ${quantity}x - R$ ${total.toFixed(2)}`;
      }
    }).join('; ');
    
  } catch (error) {
    console.error('Erro formatando itens para CSV:', error);
    return 'Erro ao carregar itens';
  }
};

export const saveCSVToFile = async (csvData: string, filename: string): Promise<void> => {
  try {
    console.log('CSV gerado:', filename);
    console.log('Dados:', csvData);
    // Implementar lógica de salvamento aqui
  } catch (error) {
    console.error('Erro salvando arquivo CSV:', error);
    throw error;
  }
};

export const checkDatabaseIntegrity = async (): Promise<void> => {
  try {
    const database = getDatabase();
    const tables = await database.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table'"
    );
    console.log('📊 Tabelas no database:', tables);
  } catch (error) {
    console.error('Erro verificando integridade:', error);
  }
};

// ADICIONAR FUNÇÃO printDatabaseLog QUE ESTAVA FALTANDO
export const printDatabaseLog = async (): Promise<void> => {
  try {
    const database = getDatabase();
    
    const customers = await database.getAllAsync<Customer>('SELECT * FROM customers ORDER BY createdAt DESC');
    const orders = await database.getAllAsync<Order>('SELECT * FROM orders ORDER BY createdAt DESC');
    const ordersWithCustomers = await getAllOrdersWithCustomers();
    
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const preparingOrders = orders.filter(order => order.status === 'preparing').length;
    const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
    const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;
    
    const summary = {
      totalCustomers: customers.length,
      totalOrders: orders.length,
      pendingOrders: pendingOrders,
      preparingOrders: preparingOrders,
      deliveredOrders: deliveredOrders,
      cancelledOrders: cancelledOrders
    };
    
    console.log('=== FRUTILIZE DATABASE LOG ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Summary:', summary);
    console.log('Customers:', customers);
    console.log('Orders:', orders);
    console.log('Orders with Customers:', ordersWithCustomers);
    console.log('==============================');
  } catch (error) {
    console.error('Error printing database log:', error);
  }
};