/**
 * API Route: /api/itretail/webhook
 * Handle webhooks from ITRETAIL POS
 * Receives updates when sales happen in-store
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getITRETAILConnector } from '@/app/lib/itretail';

// Lazy initialization of Supabase client
let supabaseClient: any = null;
function getSupabaseClient(): any {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }
    supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
  }
  return supabaseClient;
}

const itretail = getITRETAILConnector();

/**
 * POST /api/itretail/webhook
 * Receive webhook events from ITRETAIL
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    
    // Verify webhook signature (in production, implement proper verification)
    const signature = request.headers.get('x-itretail-signature');
    if (!verifyWebhookSignature(payload, signature)) {
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const { event_type, data } = payload;

    console.log('[ITRETAIL Webhook] Received:', event_type, data);

    switch (event_type) {
      case 'inventory.updated':
        return await handleInventoryUpdate(data);
      
      case 'sale.completed':
        return await handleSaleCompleted(data);
      
      case 'product.updated':
        return await handleProductUpdate(data);
      
      case 'product.price_changed':
        return await handlePriceChange(data);
      
      default:
        console.log('[ITRETAIL Webhook] Unknown event type:', event_type);
        return NextResponse.json(
          { success: false, error: 'Unknown event type' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('[ITRETAIL Webhook] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle inventory update webhook
 * Triggered when stock changes in POS (sales, returns, adjustments)
 */
async function handleInventoryUpdate(data: {
  sku: string;
  quantity: number;
  adjustment_reason?: string;
  timestamp: string;
}) {
  try {
    const { sku, quantity, adjustment_reason } = data;

    // Find product by SKU
    const { data: product, error: findError } = await getSupabaseClient()
      .from('products')
      .select('id, name, quantity')
      .eq('sku', sku)
      .maybeSingle();

    if (findError) {
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

    if (!product) {
      // Product doesn't exist in website yet - could auto-create
      console.log('[ITRETAIL Webhook] Product not found for SKU:', sku);
      return NextResponse.json({
        success: false,
        error: 'Product not found',
        sku
      }, { status: 404 });
    }

    // Update inventory
    const updateData: Record<string, any> = {
      quantity: quantity,
      itretail_last_sync: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const { error: updateError } = await getSupabaseClient()
      .from('products')
      .update(updateData)
      .eq('id', product.id);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'Failed to update inventory' },
        { status: 500 }
      );
    }

    // Log the sync
    await getSupabaseClient()
      .from('inventory_sync_log')
      .insert([{
        sync_type: 'from_pos',
        entity_type: 'product',
        entity_id: product.id,
        status: 'success',
        request_payload: {
          previous_quantity: product.quantity,
          new_quantity: quantity,
          adjustment_reason
        },
        itretail_endpoint: 'webhook:inventory.updated'
      }]);

    // Check for low stock alert
    const { data: lowStockData } = await getSupabaseClient()
      .from('low_stock_products')
      .select('*')
      .eq('id', product.id)
      .eq('is_low_stock', true)
      .maybeSingle();

    if (lowStockData) {
      // Could trigger notification here
      console.log(`[ITRETAIL Webhook] Low stock alert: ${product.name} (${quantity} remaining)`);
    }

    return NextResponse.json({
      success: true,
      message: 'Inventory updated',
      product: {
        id: product.id,
        name: product.name,
        previous_quantity: product.quantity,
        new_quantity: quantity
      }
    });

  } catch (error) {
    console.error('[ITRETAIL Webhook] Inventory update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process inventory update' },
      { status: 500 }
    );
  }
}

/**
 * Handle sale completed webhook
 * Triggered when a sale is completed in-store
 */
async function handleSaleCompleted(data: {
  sale_id: string;
  items: Array<{
    sku: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  timestamp: string;
}) {
  try {
    const { sale_id, items, total } = data;

    console.log(`[ITRETAIL Webhook] Sale ${sale_id} completed: $${total}`);

    // Update stock for each item sold
    for (const item of items) {
      const { data: product } = await getSupabaseClient()
        .from('products')
        .select('id, quantity')
        .eq('sku', item.sku)
        .maybeSingle();

      if (product) {
        const newQuantity = Math.max(0, product.quantity - item.quantity);
        
        await getSupabaseClient()
          .from('products')
          .update({
            quantity: newQuantity,
            itretail_last_sync: new Date().toISOString()
          })
          .eq('id', product.id);

        console.log(`[ITRETAIL Webhook] Decreased ${item.sku} stock: ${product.quantity} → ${newQuantity}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Sale processed',
      items_updated: items.length
    });

  } catch (error) {
    console.error('[ITRETAIL Webhook] Sale processing error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process sale' },
      { status: 500 }
    );
  }
}

/**
 * Handle product update webhook
 * Triggered when product details change in POS
 */
async function handleProductUpdate(data: {
  sku: string;
  name?: string;
  category?: string;
  is_active?: boolean;
  timestamp: string;
}) {
  try {
    const { sku, name, category, is_active } = data;

    const updateData: any = {
      itretail_last_sync: new Date().toISOString()
    };

    if (name) updateData.name = name;
    if (category) updateData.category = category;
    if (is_active !== undefined) updateData.status = is_active ? 'active' : 'inactive';

    const { data: product, error } = await getSupabaseClient()
      .from('products')
      .update(updateData)
      .eq('sku', sku)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to update product' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product updated',
      product
    });

  } catch (error) {
    console.error('[ITRETAIL Webhook] Product update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process product update' },
      { status: 500 }
    );
  }
}

/**
 * Handle price change webhook
 * Triggered when prices change in POS
 */
async function handlePriceChange(data: {
  sku: string;
  old_price: number;
  new_price: number;
  timestamp: string;
}) {
  try {
    const { sku, old_price, new_price } = data;

    const { data: product, error } = await getSupabaseClient()
      .from('products')
      .update({
        price: new_price,
        compare_at_price: old_price,
        itretail_last_sync: new Date().toISOString()
      })
      .eq('sku', sku)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to update price' },
        { status: 500 }
      );
    }

    console.log(`[ITRETAIL Webhook] Price updated: ${sku} $${old_price} → $${new_price}`);

    return NextResponse.json({
      success: true,
      message: 'Price updated',
      product: {
        id: product.id,
        name: product.name,
        old_price,
        new_price
      }
    });

  } catch (error) {
    console.error('[ITRETAIL Webhook] Price update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process price change' },
      { status: 500 }
    );
  }
}

/**
 * Verify webhook signature
 * In production, implement proper HMAC verification
 */
function verifyWebhookSignature(payload: any, signature: string | null): boolean {
  // Mock implementation - in production, verify with ITRETAIL's signing secret
  if (itretail.isInMockMode()) {
    return true; // Allow in mock mode
  }

  // TODO: Implement proper signature verification
  // const expectedSignature = crypto
  //   .createHmac('sha256', WEBHOOK_SECRET)
  //   .update(JSON.stringify(payload))
  //   .digest('hex');
  // return signature === expectedSignature;

  return true;
}

/**
 * GET /api/itretail/webhook
 * Webhook health check
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'ITRETAIL webhook endpoint ready',
    supported_events: [
      'inventory.updated',
      'sale.completed',
      'product.updated',
      'product.price_changed'
    ],
    is_mock_mode: itretail.isInMockMode()
  });
}
