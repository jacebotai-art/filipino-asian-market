/**
 * API Route: /api/inventory/sync
 * Handles bidirectional inventory synchronization with ITRETAIL POS
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getITRETAILConnector } from '@/app/lib/itretail';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const itretail = getITRETAILConnector();

/**
 * POST /api/inventory/sync
 * Trigger inventory sync from ITRETAIL to website
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { direction = 'from_pos', product_ids } = body;

    if (direction === 'from_pos') {
      // Pull inventory from ITRETAIL to website
      return await syncFromPOS(product_ids);
    } else if (direction === 'to_pos') {
      // Push inventory from website to ITRETAIL
      return await syncToPOS(product_ids);
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid direction. Use "from_pos" or "to_pos"' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('[Inventory Sync API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/inventory/sync
 * Get sync status and pending items
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    // Get pending sync items from view
    const { data: pendingItems, error: pendingError } = await supabase
      .from('pending_sync_items')
      .select('*')
      .eq('sync_status', status)
      .limit(100);

    if (pendingError) {
      console.error('[Inventory Sync API] Error fetching pending items:', pendingError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch pending items' },
        { status: 500 }
      );
    }

    // Get sync statistics
    const { data: stats, error: statsError } = await supabase
      .from('inventory_sync_log')
      .select('status')
      .gte('started_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const syncStats = {
      last24Hours: {
        total: stats?.length || 0,
        success: stats?.filter(s => s.status === 'success').length || 0,
        failed: stats?.filter(s => s.status === 'failed').length || 0
      }
    };

    return NextResponse.json({
      success: true,
      pending_items: pendingItems,
      stats: syncStats,
      is_mock_mode: itretail.isInMockMode()
    });

  } catch (error) {
    console.error('[Inventory Sync API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Sync inventory from ITRETAIL POS to website
 */
async function syncFromPOS(productIds?: string[]) {
  console.log('[Inventory Sync] Starting sync FROM POS...');
  const startTime = Date.now();

  try {
    // Fetch inventory from ITRETAIL
    const result = await itretail.getInventory();

    if (!result.success || !result.data) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to fetch inventory from POS' },
        { status: 502 }
      );
    }

    const inventory = result.data;
    const syncResults = {
      updated: 0,
      created: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[]
    };

    // Process each inventory item
    for (const item of inventory) {
      try {
        // Check if product exists
        const { data: existingProduct } = await supabase
          .from('products')
          .select('id, quantity')
          .eq('sku', item.sku)
          .maybeSingle();

        if (existingProduct) {
          // Update existing product
          const { error: updateError } = await supabase
            .from('products')
            .update({
              quantity: item.quantity,
              itretail_sync_status: 'synced',
              itretail_last_sync: new Date().toISOString()
            })
            .eq('id', existingProduct.id);

          if (updateError) {
            syncResults.failed++;
            syncResults.errors.push(`Failed to update ${item.sku}: ${updateError.message}`);
          } else {
            syncResults.updated++;
          }

        } else {
          // Product doesn't exist - fetch full details from ITRETAIL
          const productResult = await itretail.getProductBySKU(item.sku);
          
          if (productResult.success && productResult.data) {
            const product = productResult.data;
            
            const { error: insertError } = await supabase
              .from('products')
              .insert([{
                name: product.name,
                sku: product.sku,
                price: product.price,
                quantity: product.quantity,
                category: product.category,
                barcode: product.barcode,
                itretail_product_id: product.id,
                itretail_sync_status: 'synced',
                itretail_last_sync: new Date().toISOString(),
                itretail_data: product
              }]);

            if (insertError) {
              syncResults.failed++;
              syncResults.errors.push(`Failed to create ${item.sku}: ${insertError.message}`);
            } else {
              syncResults.created++;
            }
          } else {
            syncResults.skipped++;
          }
        }

        // Log sync
        await logInventorySync(item.sku, 'from_pos', 'success', {
          quantity: item.quantity
        });

      } catch (itemError) {
        syncResults.failed++;
        const errorMsg = itemError instanceof Error ? itemError.message : 'Unknown error';
        syncResults.errors.push(`Error processing ${item.sku}: ${errorMsg}`);
        
        await logInventorySync(item.sku, 'from_pos', 'failed', {}, errorMsg);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[Inventory Sync] Completed in ${duration}ms:`, syncResults);

    return NextResponse.json({
      success: true,
      direction: 'from_pos',
      duration_ms: duration,
      results: syncResults,
      is_mock_mode: itretail.isInMockMode()
    });

  } catch (error) {
    console.error('[Inventory Sync] Error syncing from POS:', error);
    return NextResponse.json(
      { success: false, error: 'Sync failed' },
      { status: 500 }
    );
  }
}

/**
 * Sync inventory from website to ITRETAIL POS
 */
async function syncToPOS(productIds?: string[]) {
  console.log('[Inventory Sync] Starting sync TO POS...');
  const startTime = Date.now();

  try {
    // Get products to sync
    let query = supabase
      .from('products')
      .select('id, name, sku, price, quantity, category, barcode, itretail_product_id');

    if (productIds && productIds.length > 0) {
      query = query.in('id', productIds);
    } else {
      // Get products that need syncing (pending or failed)
      query = query.in('itretail_sync_status', ['pending', 'failed']);
    }

    const { data: products, error: fetchError } = await query.limit(100);

    if (fetchError) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    if (!products || products.length === 0) {
      return NextResponse.json({
        success: true,
        direction: 'to_pos',
        message: 'No products to sync',
        synced_count: 0
      });
    }

    const syncResults = {
      updated: 0,
      created: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Sync each product to ITRETAIL
    for (const product of products) {
      try {
        let result;

        if (product.itretail_product_id) {
          // Update existing product in POS
          result = await itretail.updateProduct(product.sku, {
            name: product.name,
            price: product.price,
            quantity: product.quantity,
            category: product.category
          });
        } else {
          // Create new product in POS
          result = await itretail.createProduct({
            sku: product.sku,
            name: product.name,
            price: product.price,
            quantity: product.quantity,
            category: product.category,
            barcode: product.barcode,
            is_active: true
          });
        }

        if (result.success) {
          // Update product sync status
          await supabase
            .from('products')
            .update({
              itretail_sync_status: 'synced',
              itretail_last_sync: new Date().toISOString(),
              itretail_product_id: result.data?.id || product.itretail_product_id
            })
            .eq('id', product.id);

          if (product.itretail_product_id) {
            syncResults.updated++;
          } else {
            syncResults.created++;
          }

          await logInventorySync(product.sku, 'to_pos', 'success', {
            itretail_id: result.data?.id
          });

        } else {
          syncResults.failed++;
          syncResults.errors.push(`Failed to sync ${product.sku}: ${result.error}`);
          
          await supabase
            .from('products')
            .update({
              itretail_sync_status: 'failed'
            })
            .eq('id', product.id);

          await logInventorySync(product.sku, 'to_pos', 'failed', {}, result.error);
        }

      } catch (itemError) {
        syncResults.failed++;
        const errorMsg = itemError instanceof Error ? itemError.message : 'Unknown error';
        syncResults.errors.push(`Error syncing ${product.sku}: ${errorMsg}`);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[Inventory Sync] Completed in ${duration}ms:`, syncResults);

    return NextResponse.json({
      success: true,
      direction: 'to_pos',
      duration_ms: duration,
      results: syncResults,
      is_mock_mode: itretail.isInMockMode()
    });

  } catch (error) {
    console.error('[Inventory Sync] Error syncing to POS:', error);
    return NextResponse.json(
      { success: false, error: 'Sync failed' },
      { status: 500 }
    );
  }
}

/**
 * Log inventory sync attempt
 */
async function logInventorySync(
  sku: string,
  syncType: string,
  status: string,
  payload?: any,
  error?: string
): Promise<void> {
  try {
    await supabase
      .from('inventory_sync_log')
      .insert([{
        sync_type: syncType,
        entity_type: 'product',
        status,
        request_payload: payload,
        error_message: error,
        itretail_endpoint: '/inventory'
      }]);
  } catch (logError) {
    console.error('[Inventory Sync] Error logging sync:', logError);
  }
}
