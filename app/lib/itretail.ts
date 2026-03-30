/**
 * ITRETAIL POS Connector
 * Filipino Asian Market - POS Integration Middleware
 * 
 * This module handles all communication between the website and ITRETAIL POS.
 * Currently uses mock implementations - replace with real API calls when available.
 */

// Types for ITRETAIL API
export interface ITRETAILProduct {
  id?: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  cost_price?: number;
  quantity: number;
  category?: string;
  barcode?: string;
  tax_rate?: number;
  is_active: boolean;
}

export interface ITRETAILOrder {
  id?: string;
  order_number: string;
  receipt_number?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  items: ITRETAILOrderItem[];
  subtotal: number;
  tax_amount: number;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at?: string;
  notes?: string;
}

export interface ITRETAILOrderItem {
  product_id: string;
  sku: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface ITRETAILInventoryUpdate {
  sku: string;
  quantity: number;
  adjustment_reason?: string;
}

export interface ITRETAILAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  error_code?: string;
}

// Configuration
interface ITRETAILConfig {
  apiBaseUrl: string;
  apiKey: string;
  storeId: string;
  timeout: number;
  maxRetries: number;
}

// Mock configuration - replace with real credentials
const defaultConfig: ITRETAILConfig = {
  apiBaseUrl: process.env.ITRETAIL_API_URL || 'https://api.itretail.com/v1',
  apiKey: process.env.ITRETAIL_API_KEY || 'mock-api-key',
  storeId: process.env.ITRETAIL_STORE_ID || 'mock-store-id',
  timeout: 30000,
  maxRetries: 3
};

/**
 * ITRETAIL Connector Class
 * Handles all API communication with ITRETAIL POS
 */
export class ITRETAILConnector {
  private config: ITRETAILConfig;
  private isMockMode: boolean;

  constructor(config: Partial<ITRETAILConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    // Enable mock mode if no real API key is provided
    this.isMockMode = !this.config.apiKey || this.config.apiKey === 'mock-api-key';
    
    if (this.isMockMode) {
      console.log('[ITRETAIL] Running in MOCK mode - no real API calls will be made');
    }
  }

  /**
   * Check if connector is in mock mode
   */
  isInMockMode(): boolean {
    return this.isMockMode;
  }

  /**
   * Make authenticated API request to ITRETAIL
   */
  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<ITRETAILAPIResponse<T>> {
    // Mock mode - simulate API responses
    if (this.isMockMode) {
      return this.mockRequest<T>(endpoint, method, body);
    }

    try {
      const url = `${this.config.apiBaseUrl}${endpoint}`;
      const headers: HeadersInit = {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'X-Store-ID': this.config.storeId
      };

      const options: RequestInit = {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          error_code: errorData.code || `HTTP_${response.status}`
        };
      }

      const data = await response.json();
      return { success: true, data };

    } catch (error) {
      console.error('[ITRETAIL] API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        error_code: 'REQUEST_FAILED'
      };
    }
  }

  /**
   * Mock request handler for development/testing
   */
  private async mockRequest<T>(
    endpoint: string,
    method: string,
    body?: any
  ): Promise<ITRETAILAPIResponse<T>> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));
    
    console.log(`[ITRETAIL MOCK] ${method} ${endpoint}`, body ? { body } : '');

    // Simulate occasional failures (5% chance)
    if (Math.random() < 0.05) {
      return {
        success: false,
        error: 'Mock: Simulated API failure',
        error_code: 'MOCK_ERROR'
      };
    }

    // Return mock data based on endpoint
    if (endpoint.includes('/products')) {
      if (method === 'GET') {
        return {
          success: true,
          data: this.generateMockProducts() as T
        };
      }
      if (method === 'POST' || method === 'PUT') {
        return {
          success: true,
          data: { 
            id: `mock-${Date.now()}`,
            ...body,
            sync_status: 'synced'
          } as T
        };
      }
    }

    if (endpoint.includes('/orders')) {
      if (method === 'POST') {
        return {
          success: true,
          data: {
            id: `mock-order-${Date.now()}`,
            ...body,
            receipt_number: `R-${Math.floor(Math.random() * 100000)}`,
            status: 'completed'
          } as T
        };
      }
    }

    if (endpoint.includes('/inventory')) {
      return {
        success: true,
        data: { updated: true, timestamp: new Date().toISOString() } as T
      };
    }

    return { success: true, data: {} as T };
  }

  /**
   * Generate mock products for testing
   */
  private generateMockProducts(): ITRETAILProduct[] {
    const mockProducts: ITRETAILProduct[] = [
      { sku: 'RICE-001', name: 'Jasmine Rice 25lb', price: 24.99, quantity: 50, category: 'Rice & Grains', is_active: true },
      { sku: 'SAUC-001', name: 'Soy Sauce Premium', price: 4.99, quantity: 120, category: 'Sauces', is_active: true },
      { sku: 'NOOD-001', name: 'Ramen Noodles', price: 3.49, quantity: 200, category: 'Noodles', is_active: true },
      { sku: 'SNAC-001', name: 'Seaweed Snacks', price: 2.99, quantity: 75, category: 'Snacks', is_active: true },
      { sku: 'FROZ-001', name: 'Gyoza Dumplings', price: 7.99, quantity: 40, category: 'Frozen', is_active: true },
    ];
    return mockProducts;
  }

  // ============================================
  // PRODUCT API METHODS
  // ============================================

  /**
   * Get all products from ITRETAIL
   */
  async getProducts(): Promise<ITRETAILAPIResponse<ITRETAILProduct[]>> {
    return this.request<ITRETAILProduct[]>('/products');
  }

  /**
   * Get single product by SKU
   */
  async getProductBySKU(sku: string): Promise<ITRETAILAPIResponse<ITRETAILProduct>> {
    return this.request<ITRETAILProduct>(`/products/${sku}`);
  }

  /**
   * Create new product in ITRETAIL
   */
  async createProduct(product: ITRETAILProduct): Promise<ITRETAILAPIResponse<ITRETAILProduct>> {
    return this.request<ITRETAILProduct>('/products', 'POST', product);
  }

  /**
   * Update product in ITRETAIL
   */
  async updateProduct(sku: string, updates: Partial<ITRETAILProduct>): Promise<ITRETAILAPIResponse<ITRETAILProduct>> {
    return this.request<ITRETAILProduct>(`/products/${sku}`, 'PUT', updates);
  }

  /**
   * Update product price in ITRETAIL
   */
  async updateProductPrice(sku: string, price: number): Promise<ITRETAILAPIResponse<ITRETAILProduct>> {
    return this.request<ITRETAILProduct>(`/products/${sku}/price`, 'PUT', { price });
  }

  // ============================================
  // INVENTORY API METHODS
  // ============================================

  /**
   * Get inventory levels from ITRETAIL
   */
  async getInventory(): Promise<ITRETAILAPIResponse<Array<{ sku: string; quantity: number }>>> {
    return this.request<Array<{ sku: string; quantity: number }>>('/inventory');
  }

  /**
   * Update inventory quantity in ITRETAIL
   */
  async updateInventory(sku: string, quantity: number, reason?: string): Promise<ITRETAILAPIResponse<any>> {
    return this.request<any>(`/inventory/${sku}`, 'PUT', { 
      quantity, 
      adjustment_reason: reason 
    });
  }

  /**
   * Batch update inventory
   */
  async batchUpdateInventory(updates: ITRETAILInventoryUpdate[]): Promise<ITRETAILAPIResponse<any>> {
    return this.request<any>('/inventory/batch', 'POST', { updates });
  }

  /**
   * Sync inventory from website sale
   * Decreases stock in POS when website order is placed
   */
  async syncSaleToPOS(items: Array<{ sku: string; quantity: number }>): Promise<ITRETAILAPIResponse<any>> {
    const updates = items.map(item => ({
      sku: item.sku,
      quantity: -item.quantity, // Negative for decrease
      adjustment_reason: 'Website sale'
    }));
    return this.batchUpdateInventory(updates);
  }

  // ============================================
  // ORDER API METHODS
  // ============================================

  /**
   * Create order in ITRETAIL POS
   * This sends website orders to the POS system
   */
  async createOrder(order: ITRETAILOrder): Promise<ITRETAILAPIResponse<ITRETAILOrder>> {
    return this.request<ITRETAILOrder>('/orders', 'POST', order);
  }

  /**
   * Get order status from ITRETAIL
   */
  async getOrderStatus(orderId: string): Promise<ITRETAILAPIResponse<{ status: string; receipt_number?: string }>> {
    return this.request<{ status: string; receipt_number?: string }>(`/orders/${orderId}/status`);
  }

  /**
   * Cancel order in ITRETAIL
   */
  async cancelOrder(orderId: string, reason?: string): Promise<ITRETAILAPIResponse<any>> {
    return this.request<any>(`/orders/${orderId}/cancel`, 'POST', { reason });
  }

  // ============================================
  // WEBHOOK HANDLERS (ITRETAIL → Website)
  // ============================================

  /**
   * Handle inventory update webhook from ITRETAIL
   * Called when stock changes in POS (in-store sales, etc.)
   */
  handleInventoryWebhook(payload: {
    sku: string;
    quantity: number;
    timestamp: string;
  }): { success: boolean; action: string } {
    console.log('[ITRETAIL Webhook] Inventory update received:', payload);
    
    // This would update the website database
    // Return instructions for what to do
    return {
      success: true,
      action: 'UPDATE_WEBSITE_STOCK'
    };
  }

  /**
   * Handle sale webhook from ITRETAIL
   * Called when a sale is made in-store
   */
  handleSaleWebhook(payload: {
    sale_id: string;
    items: Array<{ sku: string; quantity: number }>;
    timestamp: string;
  }): { success: boolean; action: string } {
    console.log('[ITRETAIL Webhook] Sale recorded in POS:', payload);
    
    return {
      success: true,
      action: 'UPDATE_WEBSITE_STOCK_FROM_SALE'
    };
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let connectorInstance: ITRETAILConnector | null = null;

export function getITRETAILConnector(config?: Partial<ITRETAILConfig>): ITRETAILConnector {
  if (!connectorInstance) {
    connectorInstance = new ITRETAILConnector(config);
  }
  return connectorInstance;
}

export function resetITRETAILConnector(): void {
  connectorInstance = null;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Convert website order format to ITRETAIL format
 */
export function convertToITRETAILOrder(
  websiteOrder: {
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    items: Array<{
      productId: string;
      name: string;
      price: number;
      quantity: number;
    }>;
    subtotal: number;
    total: number;
    special_instructions?: string;
  },
  productSKUs: Map<string, string> // Map of productId to SKU
): ITRETAILOrder {
  return {
    order_number: websiteOrder.order_number,
    customer_name: websiteOrder.customer_name,
    customer_email: websiteOrder.customer_email,
    customer_phone: websiteOrder.customer_phone,
    items: websiteOrder.items.map(item => ({
      product_id: item.productId,
      sku: productSKUs.get(item.productId) || 'UNKNOWN',
      name: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity
    })),
    subtotal: websiteOrder.subtotal,
    tax_amount: 0, // Calculate based on tax rules
    total: websiteOrder.total,
    status: 'pending',
    notes: websiteOrder.special_instructions
  };
}

/**
 * Convert ITRETAIL product to website format
 */
export function convertFromITRETAILProduct(itProduct: ITRETAILProduct): {
  name: string;
  sku: string;
  price: number;
  quantity: number;
  category?: string;
  barcode?: string;
  itretail_product_id?: string;
} {
  return {
    name: itProduct.name,
    sku: itProduct.sku,
    price: itProduct.price,
    quantity: itProduct.quantity,
    category: itProduct.category,
    barcode: itProduct.barcode,
    itretail_product_id: itProduct.id
  };
}

// ============================================
// MOCK DATA GENERATOR (for testing)
// ============================================

export function generateMockITRETAILResponse<T>(data: T): ITRETAILAPIResponse<T> {
  return {
    success: true,
    data
  };
}

export function generateMockITRETAILError(error: string, code: string): ITRETAILAPIResponse<any> {
  return {
    success: false,
    error,
    error_code: code
  };
}
