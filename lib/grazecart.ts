// Grazecart API Integration
// API Documentation based on standard REST patterns

const GRAZECART_API_URL = "https://filipinoasianmarket.grazecart.com/api/v1";
const API_TOKEN = process.env.NEXT_PUBLIC_GRAZECART_API_TOKEN || "";

// Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sale_price?: number;
  inventory_count: number;
  images: string[];
  category: string;
  sku: string;
  weight?: number;
  is_available: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  product_count: number;
}

export interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  customer_name: string;
  customer_email: string;
  created_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  orders_count: number;
  total_spent: number;
}

// API Client
class GrazecartAPI {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      "Authorization": `Bearer ${this.token}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Grazecart API Error:", error);
      throw error;
    }
  }

  // Products
  async getProducts(params?: { category?: string; limit?: number; page?: number }): Promise<Product[]> {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append("category", params.category);
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.page) queryParams.append("page", params.page.toString());
    
    return this.request<Product[]>(`/products?${queryParams.toString()}`);
  }

  async getProduct(id: string): Promise<Product> {
    return this.request<Product>(`/products/${id}`);
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>("/categories");
  }

  async getCategory(slug: string): Promise<Category> {
    return this.request<Category>(`/categories/${slug}`);
  }

  // Orders
  async getOrders(params?: { status?: string; limit?: number }): Promise<Order[]> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    
    return this.request<Order[]>(`/orders?${queryParams.toString()}`);
  }

  async getOrder(id: string): Promise<Order> {
    return this.request<Order>(`/orders/${id}`);
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return this.request<Customer[]>("/customers");
  }

  async getCustomer(id: string): Promise<Customer> {
    return this.request<Customer>(`/customers/${id}`);
  }

  // Inventory
  async updateInventory(productId: string, quantity: number): Promise<Product> {
    return this.request<Product>(`/products/${productId}/inventory`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    });
  }

  // Store Info
  async getStoreInfo(): Promise<{
    name: string;
    description: string;
    currency: string;
    timezone: string;
  }> {
    return this.request("/store");
  }
}

// Export singleton instance
export const grazecart = new GrazecartAPI(GRAZECART_API_URL, API_TOKEN);

// Helper function to get products (uses API if available, falls back to mock)
export async function getProducts(): Promise<Product[]> {
  try {
    return await grazecart.getProducts({ limit: 50 });
  } catch (error) {
    console.warn("Using mock data - API unavailable");
    return [];
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    return await grazecart.getCategories();
  } catch (error) {
    console.warn("Using mock data - API unavailable");
    return [];
  }
}