"use client";

import { useState } from "react";
import { AdminDashboard } from "../components/AdminDashboard";
import { InventoryDashboard } from "../components/InventoryDashboard";
import { OrderQueueDashboard } from "../components/OrderQueueDashboard";
import { BarChart3, Package, List } from "lucide-react";

type Tab = "sales" | "inventory" | "queue";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("sales");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-gray-900 py-4">Admin Panel</h1>
            
            <nav className="flex gap-1">
              <TabButton
                active={activeTab === "sales"}
                onClick={() => setActiveTab("sales")}
                icon={<BarChart3 className="w-4 h-4" />}
                label="Sales Dashboard"
              />
              <TabButton
                active={activeTab === "inventory"}
                onClick={() => setActiveTab("inventory")}
                icon={<Package className="w-4 h-4" />}
                label="Inventory"
              />
              <TabButton
                active={activeTab === "queue"}
                onClick={() => setActiveTab("queue")}
                icon={<List className="w-4 h-4" />}
                label="Order Queue"
              />
            </nav>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "sales" && <AdminDashboard />}
        {activeTab === "inventory" && <InventoryDashboard />}
        {activeTab === "queue" && <OrderQueueDashboard />}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-4 font-medium text-sm transition-colors relative ${
        active 
          ? "text-primary" 
          : "text-gray-600 hover:text-gray-900"
      }`}
    >
      {icon}
      {label}
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
      )}
    </button>
  );
}
