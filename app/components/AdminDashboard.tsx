"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Package, 
  Calendar,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { 
  getOrders, 
  getTodayStats, 
  getTopProducts, 
  getSalesForRange,
  updateOrderStatus,
  Order,
  ProductSale
} from "@/app/lib/supabase";
import { formatPrice } from "../components/CartContext";

interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  avgOrderValue: number;
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
}

export function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<ProductSale[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    todayRevenue: 0,
    todayOrders: 0,
    avgOrderValue: 0,
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0
  });
  const [salesChart, setSalesChart] = useState<{date: string; revenue: number; orders: number}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<"7" | "30" | "90">("7");

  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);

  async function loadDashboardData() {
    setIsLoading(true);
    try {
      // Get today's stats
      const todayStats = await getTodayStats();
      
      // Get all orders
      const allOrders = await getOrders(500);
      
      // Get top products
      const products = await getTopProducts(5);
      
      // Get sales chart data
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(dateRange));
      
      const chartData = await getSalesForRange(
        startDate.toISOString(),
        endDate.toISOString()
      );
      
      // Calculate stats
      const validOrders = allOrders.filter(o => o.status !== 'cancelled');
      const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
      const pendingOrders = allOrders.filter(o => o.status === 'pending').length;
      
      setStats({
        todayRevenue: todayStats.revenue,
        todayOrders: todayStats.orders,
        avgOrderValue: validOrders.length > 0 ? totalRevenue / validOrders.length : 0,
        totalRevenue,
        totalOrders: validOrders.length,
        pendingOrders
      });
      
      setOrders(allOrders.slice(0, 20)); // Show last 20
      setTopProducts(products);
      setSalesChart(chartData);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusChange(orderId: string, newStatus: Order['status']) {
    try {
      await updateOrderStatus(orderId, newStatus);
      // Refresh orders
      const updatedOrders = await getOrders(20);
      setOrders(updatedOrders);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  }

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    preparing: "bg-blue-100 text-blue-800",
    ready: "bg-green-100 text-green-800",
    picked_up: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800"
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sales Dashboard</h1>
            <p className="text-gray-600 mt-1">Manila Mart Analytics</p>
          </div>
          <button
            onClick={loadDashboardData}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Today's Revenue"
            value={formatPrice(stats.todayRevenue)}
            icon={<DollarSign className="w-6 h-6" />}
            color="green"
          />
          <StatCard
            title="Today's Orders"
            value={stats.todayOrders.toString()}
            icon={<ShoppingBag className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Avg Order Value"
            value={formatPrice(stats.avgOrderValue)}
            icon={<TrendingUp className="w-6 h-6" />}
            color="purple"
          />
          <StatCard
            title="Pending Orders"
            value={stats.pendingOrders.toString()}
            icon={<Package className="w-6 h-6" />}
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sales Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Sales Trend</h2>
              <div className="flex gap-2">
                {(["7", "30", "90"] as const).map((days) => (
                  <button
                    key={days}
                    onClick={() => setDateRange(days)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      dateRange === days
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {days}D
                  </button>
                ))}
              </div>
            </div>
            
            {salesChart.length > 0 ? (
              <div className="space-y-3">
                {salesChart.map((day) => (
                  <div key={day.date} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-gray-600">
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${(day.revenue / Math.max(...salesChart.map(d => d.revenue))) * 100}%` 
                        }}
                        className="absolute h-full bg-primary rounded-full"
                        transition={{ duration: 0.5 }}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium">
                        {formatPrice(day.revenue)}
                      </span>
                    </div>
                    <div className="w-16 text-right text-sm text-gray-600">
                      {day.orders} orders
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No sales data for this period
              </div>
            )}
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Top Products</h2>
            
            {topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.product_id} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {product.product_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {product.total_quantity} sold
                      </p>
                    </div>
                    <div className="font-semibold text-gray-900">
                      {formatPrice(product.total_revenue)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No product data yet
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Orders</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Order #</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Items</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Pickup</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 font-medium">{order.order_number}</td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-sm text-gray-500">{order.customer_phone}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id || null)}
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        {order.item_count} items
                        {selectedOrder === order.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                      
                      {selectedOrder === order.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          className="mt-2 p-3 bg-gray-50 rounded-lg text-sm"
                        >
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between py-1">
                              <span>{item.emoji} {item.name} × {item.quantity}</span>
                              <span>{formatPrice(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </td>
                    <td className="py-4 px-4 font-semibold">{formatPrice(order.total)}</td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <p>{new Date(order.pickup_date).toLocaleDateString()}</p>
                        <p className="text-gray-500">{order.pickup_time}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id!, e.target.value as Order['status'])}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="pending">Pending</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="picked_up">Picked Up</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon, 
  color 
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  color: string;
}) {
  const colorClasses = {
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600"
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
