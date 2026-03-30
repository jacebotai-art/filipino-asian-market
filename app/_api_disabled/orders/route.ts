/**
 * API Route: /api/orders
 * Handles order creation and management
 * Integrates with ITRETAIL POS
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { 
  getITRETAILConnector, 
  convertToITRETAILOrder,
  ITRETAILOrder 
} from '@/app/lib/itretail';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ITRETAIL Connector
const itretail = getITRETAILConnector();

/**
 * POST /api/orders
 * Create a new order from the website
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const required = ['customer_name', 'customer_email', 'items', 'total'];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Generate order number
    const orderNumber = `MM-${Date.now().toString(36).toUpperCase()}`;
    
    // Calculate item count
    const itemCount = body.items.reduce((sum: number, item: any) => sum + item.quantity, 0);

    // Prepare order data
    const orderData = {
      order_number: orderNumber,
      customer_name: body.customer_name,
      customer_email: body.customer_email,
      customer_phone: body.customer_phone || null,
      items: body.items,
      item_count: itemCount,
      subtotal: body.subtotal || body.total,
      tax_amount: body.tax_amount || 0,
      discount_amount: body.discount_amount || 0,
      total: body.total,
      pickup_date: body.pickup_date || null,
      pickup_time: body.pickup_time || null,
      special_instructions: body.special_instructions || null,
      status: 'pending',
      itretail_sync_status: 'pending',
      payment_status: 'pending',
      source: 'website'
    };

    // Save order to database
    const { data: order, error: dbError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (dbError) {
      console.error('[Orders API] Database error:', dbError);
      return NextResponse.json(
        { success: false, error: 'Failed to save order' },
        { status: 500 }
      );
    }

    // Add to order queue for ITRETAIL sync
    await addToOrderQueue(order.id);

    // Log sync attempt
    await logSyncAttempt('order', order.id, 'to_pos', 'pending', {
      order_number: orderNumber,
      item_count: itemCount,
      total: body.total
    });

    // Try to sync immediately (don't block response)
    syncOrderToITRETAIL(order).catch(error => {
      console.error('[Orders API] Background sync error:', error);
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: orderNumber,
        status: 'pending',
        message: 'Order received and pending POS sync'
      }
    });

  } catch (error) {
    console.error('[Orders API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orders
 * Get orders with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get('status');
    const syncStatus = searchParams.get('sync_status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (syncStatus) {
      query = query.eq('itretail_sync_status', syncStatus);
    }

    const { data: orders, error, count } = await query;

    if (error) {
      console.error('[Orders API] Error fetching orders:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        total: count || 0,
        limit,
        offset
      }
    });

  } catch (error) {
    console.error('[Orders API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Sync order to ITRETAIL POS
 */
async function syncOrderToITRETAIL(order: any): Promise<void> {
  try {
    // Get product SKUs for order items
    const productIds = order.items.map((item: any) => item.productId);
    const { data: products } = await supabase
      .from('products')
      .select('id, sku')
      .in('id', productIds);

    const skuMap = new Map(products?.map(p => [p.id, p.sku]) || []);

    // Convert to ITRETAIL format
    const itOrder: ITRETAILOrder = convertToITRETAILOrder(order, skuMap);

    // Send to ITRETAIL
    const result = await itretail.createOrder(itOrder);

    if (result.success && result.data) {
      // Update order with ITRETAIL ID and receipt
      await supabase
        .from('orders')
        .update({
          itretail_order_id: result.data.id,
          itretail_receipt_number: result.data.receipt_number,
          itretail_sync_status: 'synced',
          itretail_last_sync_attempt: new Date().toISOString()
        })
        .eq('id', order.id);

      // Sync inventory (decrease stock)
      const inventoryUpdates = order.items.map((item: any) => ({
        sku: skuMap.get(item.productId) || '',
        quantity: item.quantity
      })).filter((u: any) => u.sku);

      if (inventoryUpdates.length > 0) {
        await itretail.syncSaleToPOS(inventoryUpdates);
      }

      // Log success
      await logSyncAttempt('order', order.id, 'to_pos', 'success', {
        itretail_order_id: result.data.id,
        receipt_number: result.data.receipt_number
      });

      // Remove from queue
      await removeFromOrderQueue(order.id);

    } else {
      // Mark as failed, will retry
      await handleSyncFailure(order.id, 'order', result.error || 'Unknown error');
    }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    await handleSyncFailure(order.id, 'order', errorMsg);
  }
}

/**
 * Add order to processing queue
 */
async function addToOrderQueue(orderId: string): Promise<void> {
  try {
    await supabase
      .from('order_queue')
      .insert([{
        order_id: orderId,
        status: 'pending',
        priority: 5,
        max_retries: 5
      }]);
  } catch (error) {
    console.error('[Orders API] Error adding to queue:', error);
  }
}

/**
 * Remove order from queue
 */
async function removeFromOrderQueue(orderId: string): Promise<void> {
  try {
    await supabase
      .from('order_queue')
      .delete()
      .eq('order_id', orderId);
  } catch (error) {
    console.error('[Orders API] Error removing from queue:', error);
  }
}

/**
 * Handle sync failure
 */
async function handleSyncFailure(
  entityId: string, 
  entityType: string, 
  error: string
): Promise<void> {
  console.error(`[Orders API] Sync failed for ${entityType} ${entityId}:`, error);

  // Update order status
  if (entityType === 'order') {
    await supabase
      .from('orders')
      .update({
        itretail_sync_status: 'failed',
        itretail_last_sync_attempt: new Date().toISOString(),
        itretail_last_sync_error: error
      })
      .eq('id', entityId);
  }

  // Update queue entry
  await supabase
    .from('order_queue')
    .update({
      status: 'failed',
      error_count: supabase.rpc('increment', { x: 1 }),
      last_error: error,
      last_error_at: new Date().toISOString(),
      next_retry_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() // Retry in 5 minutes
    })
    .eq('order_id', entityId);

  // Log failure
  await logSyncAttempt(entityType, entityId, 'to_pos', 'failed', { error });
}

/**
 * Log sync attempt
 */
async function logSyncAttempt(
  entityType: string,
  entityId: string,
  syncType: string,
  status: string,
  payload: any
): Promise<void> {
  try {
    await supabase
      .from('inventory_sync_log')
      .insert([{
        entity_type: entityType,
        entity_id: entityId,
        sync_type: syncType,
        status,
        request_payload: payload,
        itretail_endpoint: '/orders'
      }]);
  } catch (error) {
    console.error('[Orders API] Error logging sync:', error);
  }
}
