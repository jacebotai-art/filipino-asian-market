/**
 * API Route: /api/order-queue
 * Process and manage the order queue for ITRETAIL sync
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getITRETAILConnector, convertToITRETAILOrder } from '@/app/lib/itretail';

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
 * GET /api/order-queue
 * Get queue status and items
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = getSupabaseClient()
      .from('order_queue')
      .select(`
        *,
        orders:order_id (*)
      `)
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: queueItems, error } = await query;

    if (error) {
      console.error('[Order Queue API] Error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch queue' },
        { status: 500 }
      );
    }

    // Get queue statistics
    const { data: stats } = await getSupabaseClient()
      .from('order_queue_stats')
      .select('*');

    return NextResponse.json({
      success: true,
      queue: queueItems,
      stats: stats || [],
      is_mock_mode: itretail.isInMockMode()
    });

  } catch (error) {
    console.error('[Order Queue API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/order-queue
 * Process the order queue
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action = 'process', order_id } = body;

    if (action === 'process') {
      // Process pending orders
      return await processQueue();
    } else if (action === 'retry' && order_id) {
      // Retry specific order
      return await retryOrder(order_id);
    } else if (action === 'clear') {
      // Clear completed/failed orders
      return await clearQueue();
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('[Order Queue API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Process pending orders in queue
 */
async function processQueue() {
  console.log('[Order Queue] Starting queue processing...');
  const startTime = Date.now();

  try {
    // Get pending orders that are ready for retry
    const { data: pendingItems, error: fetchError } = await getSupabaseClient()
      .from('order_queue')
      .select(`
        *,
        orders:order_id (*)
      `)
      .eq('status', 'pending')
      .or(`next_retry_at.is.null,next_retry_at.lte.${new Date().toISOString()}`)
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(10);

    if (fetchError) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch pending orders' },
        { status: 500 }
      );
    }

    if (!pendingItems || pendingItems.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending orders to process',
        processed: 0
      });
    }

    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Process each order
    for (const item of pendingItems) {
      try {
        // Mark as processing
        await getSupabaseClient()
          .from('order_queue')
          .update({
            status: 'processing',
            processing_started_at: new Date().toISOString()
          })
          .eq('id', item.id);

        // Process the order
        const success = await processOrder(item.order_id, item.orders);

        if (success) {
          results.succeeded++;
          
          // Mark as completed
          await getSupabaseClient()
            .from('order_queue')
            .update({
              status: 'completed',
              processing_completed_at: new Date().toISOString()
            })
            .eq('id', item.id);

        } else {
          results.failed++;
          
          // Mark as failed (will retry later)
          const retryCount = (item.error_count || 0) + 1;
          const maxRetries = item.max_retries || 5;
          
          if (retryCount >= maxRetries) {
            // Max retries reached
            await getSupabaseClient()
              .from('order_queue')
              .update({
                status: 'failed',
                error_count: retryCount,
                processing_completed_at: new Date().toISOString()
              })
              .eq('id', item.id);
          } else {
            // Schedule retry with exponential backoff
            const backoffMinutes = Math.pow(2, retryCount) * 5; // 10, 20, 40, 80, 160 minutes
            const nextRetry = new Date(Date.now() + backoffMinutes * 60 * 1000);
            
            await getSupabaseClient()
              .from('order_queue')
              .update({
                status: 'pending',
                error_count: retryCount,
                next_retry_at: nextRetry.toISOString()
              })
              .eq('id', item.id);
          }
        }

        results.processed++;

      } catch (processError) {
        results.failed++;
        const errorMsg = processError instanceof Error ? processError.message : 'Unknown error';
        results.errors.push(`Error processing order ${item.order_id}: ${errorMsg}`);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[Order Queue] Processing completed in ${duration}ms:`, results);

    return NextResponse.json({
      success: true,
      duration_ms: duration,
      results
    });

  } catch (error) {
    console.error('[Order Queue] Processing error:', error);
    return NextResponse.json(
      { success: false, error: 'Queue processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Process single order to ITRETAIL
 */
async function processOrder(orderId: string, orderData: any): Promise<boolean> {
  try {
    // Get product SKUs
    const productIds = orderData.items.map((item: any) => item.productId);
    const { data: products } = await getSupabaseClient()
      .from('products')
      .select('id, sku')
      .in('id', productIds);

    const skuMap = new Map<string, string>(products?.map((p: any) => [p.id, p.sku]) || []);

    // Convert to ITRETAIL format
    const itOrder = convertToITRETAILOrder(orderData, skuMap);

    // Send to ITRETAIL
    const result = await itretail.createOrder(itOrder);

    if (result.success && result.data) {
      // Update order
      await getSupabaseClient()
        .from('orders')
        .update({
          itretail_order_id: result.data.id,
          itretail_receipt_number: result.data.receipt_number || null,
          itretail_sync_status: 'synced',
          itretail_last_sync_attempt: new Date().toISOString()
        })
        .eq('id', orderId);

      // Sync inventory
      const inventoryUpdates = orderData.items
        .map((item: any) => ({
          sku: skuMap.get(item.productId),
          quantity: item.quantity
        }))
        .filter((u: any) => u.sku);

      if (inventoryUpdates.length > 0) {
        await itretail.syncSaleToPOS(inventoryUpdates);
      }

      // Log success
      await logSync(orderId, 'success', {
        itretail_order_id: result.data.id,
        receipt_number: result.data.receipt_number
      });

      return true;

    } else {
      // Update order with error
      await getSupabaseClient()
        .from('orders')
        .update({
          itretail_sync_status: 'failed',
          itretail_last_sync_attempt: new Date().toISOString(),
          itretail_last_sync_error: result.error
        })
        .eq('id', orderId);

      await logSync(orderId, 'failed', {}, result.error);
      return false;
    }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    await logSync(orderId, 'failed', {}, errorMsg);
    return false;
  }
}

/**
 * Retry specific order
 */
async function retryOrder(orderId: string) {
  try {
    // Reset queue item
    await getSupabaseClient()
      .from('order_queue')
      .update({
        status: 'pending',
        error_count: 0,
        next_retry_at: null,
        last_error: null
      })
      .eq('order_id', orderId);

    // Reset order sync status
    await getSupabaseClient()
      .from('orders')
      .update({
        itretail_sync_status: 'pending',
        itretail_last_sync_error: null
      })
      .eq('id', orderId);

    return NextResponse.json({
      success: true,
      message: 'Order queued for retry',
      order_id: orderId
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to retry order' },
      { status: 500 }
    );
  }
}

/**
 * Clear completed/failed orders from queue
 */
async function clearQueue() {
  try {
    const { data, error } = await getSupabaseClient()
      .from('order_queue')
      .delete()
      .in('status', ['completed', 'failed'])
      .select('count');

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to clear queue' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Queue cleared',
      cleared_count: data?.length || 0
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to clear queue' },
      { status: 500 }
    );
  }
}

/**
 * Log sync attempt
 */
async function logSync(
  orderId: string,
  status: string,
  payload?: any,
  error?: string
): Promise<void> {
  try {
    await getSupabaseClient()
      .from('inventory_sync_log')
      .insert([{
        entity_type: 'order',
        entity_id: orderId,
        sync_type: 'to_pos',
        status,
        request_payload: payload,
        error_message: error,
        itretail_endpoint: '/orders'
      }]);
  } catch (logError) {
    console.error('[Order Queue] Error logging sync:', logError);
  }
}

/**
 * DELETE /api/order-queue
 * Remove order from queue
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing id parameter' },
        { status: 400 }
      );
    }

    await getSupabaseClient()
      .from('order_queue')
      .delete()
      .eq('id', id);

    return NextResponse.json({
      success: true,
      message: 'Queue item removed'
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to remove queue item' },
      { status: 500 }
    );
  }
}
