"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  List, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Play,
  Trash2,
  RotateCcw,
  Database
} from "lucide-react";

interface QueueItem {
  id: string;
  order_id: string;
  status: 'pending' | 'processing' | 'failed' | 'completed';
  priority: number;
  error_count: number;
  last_error?: string;
  next_retry_at?: string;
  created_at: string;
  orders?: {
    order_number: string;
    customer_name: string;
    total: number;
    status: string;
  };
}

interface QueueStats {
  status: string;
  count: number;
}

export function OrderQueueDashboard() {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [stats, setStats] = useState<QueueStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [isMockMode, setIsMockMode] = useState(true);

  useEffect(() => {
    loadQueue();
  }, []);

  async function loadQueue() {
    setLoading(true);
    try {
      const res = await fetch("/api/order-queue");
      const data = await res.json();
      
      if (data.success) {
        setQueueItems(data.queue || []);
        setStats(data.stats || []);
        setIsMockMode(data.is_mock_mode);
      }
    } catch (error) {
      console.error("Error loading queue:", error);
    } finally {
      setLoading(false);
    }
  }

  async function processQueue() {
    setProcessing(true);
    try {
      const res = await fetch("/api/order-queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "process" })
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert(`Queue processed! Succeeded: ${data.results?.succeeded || 0}, Failed: ${data.results?.failed || 0}`);
        loadQueue();
      } else {
        alert(`Processing failed: ${data.error}`);
      }
    } catch (error) {
      alert("Processing error occurred");
    } finally {
      setProcessing(false);
    }
  }

  async function retryOrder(orderId: string) {
    try {
      const res = await fetch("/api/order-queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "retry", order_id: orderId })
      });
      
      const data = await res.json();
      
      if (data.success) {
        loadQueue();
      } else {
        alert(`Retry failed: ${data.error}`);
      }
    } catch (error) {
      alert("Retry error occurred");
    }
  }

  async function clearQueue() {
    if (!confirm("Clear all completed/failed orders from queue?")) return;
    
    try {
      const res = await fetch("/api/order-queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear" })
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert(`Cleared ${data.cleared_count} orders from queue`);
        loadQueue();
      }
    } catch (error) {
      alert("Clear error occurred");
    }
  }

  async function deleteQueueItem(id: string) {
    if (!confirm("Remove this item from queue?")) return;
    
    try {
      await fetch(`/api/order-queue?id=${id}`, { method: "DELETE" });
      loadQueue();
    } catch (error) {
      alert("Failed to remove item");
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "processing": return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      case "failed": return <XCircle className="w-5 h-5 text-red-500" />;
      case "pending": return <Clock className="w-5 h-5 text-yellow-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "failed": return "bg-red-100 text-red-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const pendingCount = queueItems.filter(i => i.status === "pending").length;
  const failedCount = queueItems.filter(i => i.status === "failed").length;
  const processingCount = queueItems.filter(i => i.status === "processing").length;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Queue</h1>
            <p className="text-gray-600 mt-1">Manage orders waiting to sync with ITRETAIL POS</p>
          </div>
          <div className="flex items-center gap-4">
            {isMockMode && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                Mock Mode
              </span>
            )}
            <button
              onClick={loadQueue}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total in Queue"
            value={queueItems.length.toString()}
            icon={<List className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Pending"
            value={pendingCount.toString()}
            icon={<Clock className="w-6 h-6" />}
            color="yellow"
          />
          <StatCard
            title="Processing"
            value={processingCount.toString()}
            icon={<RefreshCw className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Failed"
            value={failedCount.toString()}
            icon={<XCircle className="w-6 h-6" />}
            color="red"
            alert={failedCount > 0}
          />
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={processQueue}
              disabled={processing || pendingCount === 0}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              {processing ? "Processing..." : "Process Queue"}
            </button>
            
            <button
              onClick={clearQueue}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear Completed
            </button>
          </div>
        </div>

        {/* Queue Items */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-gray-600">Loading queue...</p>
            </div>
          ) : queueItems.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Database className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Queue is empty</p>
              <p className="text-sm mt-2">All orders have been synced with ITRETAIL</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Order</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Priority</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Errors</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Added</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {queueItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium text-gray-900">
                        {item.orders?.order_number || "Unknown"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {item.orders?.customer_name || "Unknown"}
                    </td>
                    <td className="py-4 px-4 font-semibold text-gray-900">
                      ${item.orders?.total?.toFixed(2) || "0.00"}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.priority <= 3 ? "bg-red-100 text-red-800" :
                        item.priority <= 6 ? "bg-yellow-100 text-yellow-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {item.error_count > 0 ? (
                        <div className="flex items-center gap-1 text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm">{item.error_count}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {item.status === "failed" && (
                          <button
                            onClick={() => retryOrder(item.order_id)}
                            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Retry"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteQueueItem(item.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Failed Items Detail */}
        {failedCount > 0 && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Failed Items Requiring Attention
            </h3>
            <div className="space-y-3">
              {queueItems
                .filter(item => item.status === "failed")
                .map(item => (
                  <div key={item.id} className="bg-white rounded-lg p-4 border border-red-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">
                        {item.orders?.order_number}
                      </span>
                      <span className="text-sm text-red-600">
                        {item.error_count} failed attempts
                      </span>
                    </div>
                    {item.last_error && (
                      <p className="text-sm text-red-600 font-mono bg-red-50 p-2 rounded">
                        {item.last_error}
                      </p>
                    )}
                    {item.next_retry_at && (
                      <p className="text-sm text-gray-500 mt-2">
                        Next retry: {formatDate(item.next_retry_at)}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon, 
  color,
  alert = false
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  color: string;
  alert?: boolean;
}) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    yellow: "bg-yellow-100 text-yellow-600",
    red: "bg-red-100 text-red-600",
    green: "bg-green-100 text-green-600"
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 ${alert ? 'ring-2 ring-red-200' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
