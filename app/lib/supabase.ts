// Supabase client configuration
import { createClient } from '@supabase/supabase-js';

// Get these from environment variables or replace with actual values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
export const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
  !supabaseUrl.includes('your-project') && !supabaseAnonKey.includes('your-anon-key');

// Client for browser (public, limited permissions)
export const supabaseClient = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Types for orders
export interface OrderItem {
  productId: string;
  name: string;
  emoji: string;
  price: number;
  quantity: number;
}

export interface Order {
  id?: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  item_count: number;
  pickup_date: string;
  pickup_time: string;
  special_instructions?: string;
  status: 'pending' | 'preparing' | 'ready' | 'picked_up' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

export interface DailySales {
  date: string;
  order_count: number;
  revenue: number;
  avg_order_value: number;
}

export interface ProductSale {
  product_id: string;
  product_name: string;
  total_quantity: number;
  total_revenue: number;
}

// Demo data for preview mode
const demoOrders: Order[] = [
  {
    id: 'demo-1',
    order_number: 'MM-12345678',
    customer_name: 'Maria Santos',
    customer_email: 'maria@example.com',
    customer_phone: '(213) 555-0101',
    items: [
      { productId: '1', name: 'Jasmine Rice', emoji: '🍚', price: 12.99, quantity: 2 },
      { productId: '2', name: 'Soy Sauce', emoji: '🍶', price: 4.99, quantity: 1 }
    ],
    subtotal: 30.97,
    total: 30.97,
    item_count: 3,
    pickup_date: '2026-02-27',
    pickup_time: '2:00 PM',
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'demo-2',
    order_number: 'MM-12345679',
    customer_name: 'Juan Dela Cruz',
    customer_email: 'juan@example.com',
    customer_phone: '(213) 555-0102',
    items: [
      { productId: '3', name: 'Lumpia Wrapper', emoji: '🥟', price: 3.99, quantity: 5 },
      { productId: '4', name: 'Banana Ketchup', emoji: '🍌', price: 3.49, quantity: 2 }
    ],
    subtotal: 26.93,
    total: 26.93,
    item_count: 7,
    pickup_date: '2026-02-27',
    pickup_time: '4:00 PM',
    status: 'preparing',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'demo-3',
    order_number: 'MM-12345680',
    customer_name: 'Ana Reyes',
    customer_email: 'ana@example.com',
    customer_phone: '(213) 555-0103',
    items: [
      { productId: '5', name: 'Ube Halaya', emoji: '🍠', price: 6.99, quantity: 3 }
    ],
    subtotal: 20.97,
    total: 20.97,
    item_count: 3,
    pickup_date: '2026-02-26',
    pickup_time: '6:00 PM',
    status: 'ready',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 'demo-4',
    order_number: 'MM-12345681',
    customer_name: 'Pedro Garcia',
    customer_email: 'pedro@example.com',
    customer_phone: '(213) 555-0104',
    items: [
      { productId: '1', name: 'Jasmine Rice', emoji: '🍚', price: 12.99, quantity: 5 },
      { productId: '3', name: 'Lumpia Wrapper', emoji: '🥟', price: 3.99, quantity: 10 },
      { productId: '5', name: 'Ube Halaya', emoji: '🍠', price: 6.99, quantity: 2 }
    ],
    subtotal: 102.83,
    total: 102.83,
    item_count: 17,
    pickup_date: '2026-02-25',
    pickup_time: '3:00 PM',
    status: 'picked_up',
    created_at: new Date(Date.now() - 259200000).toISOString(),
    updated_at: new Date(Date.now() - 259200000).toISOString()
  },
  {
    id: 'demo-5',
    order_number: 'MM-12345682',
    customer_name: 'Linda Cruz',
    customer_email: 'linda@example.com',
    customer_phone: '(213) 555-0105',
    items: [
      { productId: '2', name: 'Soy Sauce', emoji: '🍶', price: 4.99, quantity: 3 },
      { productId: '4', name: 'Banana Ketchup', emoji: '🍌', price: 3.49, quantity: 4 }
    ],
    subtotal: 28.93,
    total: 28.93,
    item_count: 7,
    pickup_date: '2026-02-25',
    pickup_time: '5:00 PM',
    status: 'cancelled',
    created_at: new Date(Date.now() - 300000000).toISOString(),
    updated_at: new Date(Date.now() - 300000000).toISOString()
  }
];

const demoTopProducts: ProductSale[] = [
  { product_id: '3', product_name: 'Lumpia Wrapper', total_quantity: 45, total_revenue: 179.55 },
  { product_id: '1', product_name: 'Jasmine Rice', total_quantity: 32, total_revenue: 415.68 },
  { product_id: '5', product_name: 'Ube Halaya', total_quantity: 28, total_revenue: 195.72 },
  { product_id: '2', product_name: 'Soy Sauce', total_quantity: 24, total_revenue: 119.76 },
  { product_id: '4', product_name: 'Banana Ketchup', total_quantity: 18, total_revenue: 62.82 }
];

// In-memory storage for demo mode
let demoOrdersMutable = [...demoOrders];

// Save order to Supabase (or demo mode)
export async function saveOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) {
  if (!isSupabaseConfigured || !supabaseClient) {
    console.log('Demo mode: Saving order locally');
    const newOrder: Order = {
      ...order,
      id: `demo-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    demoOrdersMutable = [newOrder, ...demoOrdersMutable];
    return newOrder;
  }

  const { data, error } = await supabaseClient
    .from('orders')
    .insert([order])
    .select()
    .single();
  
  if (error) {
    console.error('Error saving order:', error);
    throw error;
  }
  
  return data;
}

// Get all orders (for admin dashboard)
export async function getOrders(limit = 100, status?: string) {
  if (!isSupabaseConfigured || !supabaseClient) {
    console.log('Demo mode: Returning demo orders');
    let orders = demoOrdersMutable;
    if (status) {
      orders = orders.filter(o => o.status === status);
    }
    return orders.slice(0, limit);
  }

  let query = supabaseClient
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (status) {
    query = query.eq('status', status);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
  
  return data as Order[];
}

// Get daily sales analytics
export async function getDailySales(days = 30) {
  if (!isSupabaseConfigured || !supabaseClient) {
    console.log('Demo mode: Returning demo daily sales');
    // Generate demo daily sales
    const sales: DailySales[] = [];
    for (let i = 0; i < Math.min(days, 7); i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      sales.push({
        date: date.toISOString().split('T')[0],
        order_count: Math.floor(Math.random() * 10) + 1,
        revenue: Math.floor(Math.random() * 500) + 100,
        avg_order_value: Math.floor(Math.random() * 50) + 30
      });
    }
    return sales;
  }

  const { data, error } = await supabaseClient
    .from('daily_sales')
    .select('*')
    .order('date', { ascending: false })
    .limit(days);
  
  if (error) {
    console.error('Error fetching daily sales:', error);
    throw error;
  }
  
  return data as DailySales[];
}

// Get top selling products
export async function getTopProducts(limit = 10) {
  if (!isSupabaseConfigured || !supabaseClient) {
    console.log('Demo mode: Returning demo top products');
    return demoTopProducts.slice(0, limit);
  }

  // Try to get from a view first
  const { data, error } = await supabaseClient
    .from('product_sales_summary')
    .select('*')
    .order('total_revenue', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.log('View not found, calculating from orders:', error);
    // Fallback: calculate from orders
    return calculateTopProductsFromOrders(limit);
  }
  
  return data as ProductSale[];
}

// Calculate top products from orders (fallback)
async function calculateTopProductsFromOrders(limit: number) {
  const { data: orders, error } = await supabaseClient!
    .from('orders')
    .select('items')
    .neq('status', 'cancelled');
  
  if (error || !orders) return [];
  
  const productMap = new Map<string, ProductSale>();
  
  orders.forEach((order: any) => {
    order.items.forEach((item: OrderItem) => {
      const existing = productMap.get(item.productId);
      if (existing) {
        existing.total_quantity += item.quantity;
        existing.total_revenue += item.price * item.quantity;
      } else {
        productMap.set(item.productId, {
          product_id: item.productId,
          product_name: item.name,
          total_quantity: item.quantity,
          total_revenue: item.price * item.quantity
        });
      }
    });
  });
  
  return Array.from(productMap.values())
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .slice(0, limit);
}

// Update order status
export async function updateOrderStatus(orderId: string, status: Order['status']) {
  if (!isSupabaseConfigured || !supabaseClient) {
    console.log('Demo mode: Updating order status locally');
    const orderIndex = demoOrdersMutable.findIndex(o => o.id === orderId);
    if (orderIndex >= 0) {
      demoOrdersMutable[orderIndex] = {
        ...demoOrdersMutable[orderIndex],
        status,
        updated_at: new Date().toISOString()
      };
      return demoOrdersMutable[orderIndex];
    }
    throw new Error('Order not found');
  }

  const { data, error } = await supabaseClient
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating order:', error);
    throw error;
  }
  
  return data;
}

// Get today's stats
export async function getTodayStats() {
  if (!isSupabaseConfigured || !supabaseClient) {
    console.log('Demo mode: Returning demo today stats');
    // Calculate from demo orders for today
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = demoOrdersMutable.filter(o => 
      o.created_at?.startsWith(today) && o.status !== 'cancelled'
    );
    const revenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
    return {
      revenue,
      orders: todayOrders.length,
      avgOrderValue: todayOrders.length > 0 ? revenue / todayOrders.length : 0
    };
  }

  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabaseClient
    .from('orders')
    .select('total, status')
    .gte('created_at', `${today}T00:00:00`)
    .lte('created_at', `${today}T23:59:59`);
  
  if (error || !data) {
    return { revenue: 0, orders: 0, avgOrderValue: 0 };
  }
  
  const validOrders = data.filter((o: any) => o.status !== 'cancelled');
  const revenue = validOrders.reduce((sum: number, o: any) => sum + o.total, 0);
  
  return {
    revenue,
    orders: validOrders.length,
    avgOrderValue: validOrders.length > 0 ? revenue / validOrders.length : 0
  };
}

// Get sales for date range
export async function getSalesForRange(startDate: string, endDate: string) {
  if (!isSupabaseConfigured || !supabaseClient) {
    console.log('Demo mode: Returning demo sales for range');
    // Return demo chart data
    const sales = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      sales.push({
        date: d.toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 800) + 200,
        orders: Math.floor(Math.random() * 15) + 3
      });
    }
    return sales;
  }

  const { data, error } = await supabaseClient
    .from('orders')
    .select('created_at, total, status')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: true });
  
  if (error || !data) return [];
  
  // Group by date
  const salesByDate = new Map<string, { revenue: number; orders: number }>();
  
  data.forEach((order: any) => {
    if (order.status === 'cancelled') return;
    
    const date = order.created_at.split('T')[0];
    const existing = salesByDate.get(date);
    
    if (existing) {
      existing.revenue += order.total;
      existing.orders += 1;
    } else {
      salesByDate.set(date, { revenue: order.total, orders: 1 });
    }
  });
  
  return Array.from(salesByDate.entries()).map(([date, stats]) => ({
    date,
    ...stats,
    avgOrderValue: stats.orders > 0 ? stats.revenue / stats.orders : 0
  }));
}
