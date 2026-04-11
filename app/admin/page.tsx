"use client";

import { useState, useEffect } from "react";
import { AdminDashboard } from "../components/AdminDashboard";
import { InventoryDashboard } from "../components/InventoryDashboard";
import { OrderQueueDashboard } from "../components/OrderQueueDashboard";
import { BarChart3, Package, List, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Tab = "sales" | "inventory" | "queue";

// Simple password protection (in production, use proper auth)
const ADMIN_PASSWORD = "filipino2024"; // You should change this!

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("sales");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Check if already authenticated (session storage)
  useEffect(() => {
    const auth = sessionStorage.getItem("admin_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem("admin_auth", "true");
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("admin_auth");
    setPassword("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Admin Access</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              This area is restricted to authorized personnel only.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}
              <Button type="submit" className="w-full">
                Access Admin Panel
              </Button>
            </form>
            <p className="text-xs text-center text-muted-foreground mt-4">
              Forgot password? Contact the site owner.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show admin dashboard if authenticated
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with logout */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
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
            
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
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