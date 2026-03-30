/**
 * API Route: /api/products
 * Product management API - CRUD operations with ITRETAIL sync
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
 * GET /api/products
 * Get products with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const lowStock = searchParams.get('low_stock') === 'true';
    const syncStatus = searchParams.get('sync_status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (syncStatus) {
      query = query.eq('itretail_sync_status', syncStatus);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,barcode.ilike.%${search}%`);
    }

    if (lowStock) {
      // Use the low_stock_products view
      const { data, error, count } = await supabase
        .from('low_stock_products')
        .select('*')
        .eq('is_low_stock', true)
        .limit(limit);

      if (error) {
        return NextResponse.json(
          { success: false, error: 'Failed to fetch low stock products' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        products: data,
        pagination: { total: count || 0, limit, offset }
      });
    }

    const { data: products, error, count } = await query;

    if (error) {
      console.error('[Products API] Error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        total: count || 0,
        limit,
        offset
      }
    });

  } catch (error) {
    console.error('[Products API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products
 * Create new product
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.sku || body.price === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, sku, price' },
        { status: 400 }
      );
    }

    // Check for duplicate SKU
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('sku', body.sku)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'SKU already exists' },
        { status: 409 }
      );
    }

    // Prepare product data
    const productData = {
      name: body.name,
      description: body.description,
      sku: body.sku,
      barcode: body.barcode,
      price: body.price,
      compare_at_price: body.compare_at_price,
      cost_price: body.cost_price,
      quantity: body.quantity || 0,
      low_stock_threshold: body.low_stock_threshold || 10,
      track_inventory: body.track_inventory !== false,
      category: body.category,
      subcategory: body.subcategory,
      tags: body.tags || [],
      images: body.images || [],
      featured_image: body.featured_image,
      status: body.status || 'active',
      is_featured: body.is_featured || false,
      weight: body.weight,
      weight_unit: body.weight_unit || 'lb',
      itretail_sync_status: 'pending'
    };

    // Save to database
    const { data: product, error: insertError } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (insertError) {
      console.error('[Products API] Insert error:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to create product' },
        { status: 500 }
      );
    }

    // Sync to ITRETAIL (async, don't block response)
    syncProductToITRETAIL(product).catch(error => {
      console.error('[Products API] Background sync error:', error);
    });

    return NextResponse.json({
      success: true,
      product,
      message: 'Product created and pending POS sync'
    }, { status: 201 });

  } catch (error) {
    console.error('[Products API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/products
 * Update product(s)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, updates, bulk_updates } = body;

    // Bulk update mode
    if (bulk_updates && Array.isArray(bulk_updates)) {
      const results = await Promise.all(
        bulk_updates.map(async (item: { id: string; updates: any }) => {
          return updateSingleProduct(item.id, item.updates);
        })
      );

      const successCount = results.filter(r => r.success).length;
      const failedCount = results.length - successCount;

      return NextResponse.json({
        success: failedCount === 0,
        results,
        summary: { total: results.length, success: successCount, failed: failedCount }
      });
    }

    // Single update mode
    if (!id || !updates) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: id, updates' },
        { status: 400 }
      );
    }

    const result = await updateSingleProduct(id, updates);
    return NextResponse.json(result);

  } catch (error) {
    console.error('[Products API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products
 * Delete product(s)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: id' },
        { status: 400 }
      );
    }

    // Get product SKU for ITRETAIL sync
    const { data: product } = await supabase
      .from('products')
      .select('sku, itretail_product_id')
      .eq('id', id)
      .single();

    // Soft delete - mark as inactive
    const { error: updateError } = await supabase
      .from('products')
      .update({ status: 'deleted', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete product' },
        { status: 500 }
      );
    }

    // Update ITRETAIL (mark as inactive)
    if (product?.sku) {
      await itretail.updateProduct(product.sku, { is_active: false });
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('[Products API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Update single product helper
 */
async function updateSingleProduct(id: string, updates: any) {
  try {
    // Get current product
    const { data: currentProduct, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentProduct) {
      return { success: false, id, error: 'Product not found' };
    }

    // If price is changing, update ITRETAIL
    const priceChanged = updates.price !== undefined && updates.price !== currentProduct.price;
    
    // Prepare update data
    const updateData = {
      ...updates,
      itretail_sync_status: priceChanged ? 'pending' : currentProduct.itretail_sync_status,
      updated_at: new Date().toISOString()
    };

    // Update in database
    const { data: product, error: updateError } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return { success: false, id, error: updateError.message };
    }

    // Sync to ITRETAIL if price changed
    if (priceChanged && currentProduct.sku) {
      await itretail.updateProductPrice(currentProduct.sku, updates.price);
      
      // Update sync status
      await supabase
        .from('products')
        .update({ itretail_sync_status: 'synced' })
        .eq('id', id);
    }

    return { success: true, id, product };

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, id, error: errorMsg };
  }
}

/**
 * Sync product to ITRETAIL
 */
async function syncProductToITRETAIL(product: any): Promise<void> {
  try {
    const result = await itretail.createProduct({
      sku: product.sku,
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      category: product.category,
      barcode: product.barcode,
      is_active: product.status === 'active'
    });

    if (result.success) {
      await supabase
        .from('products')
        .update({
          itretail_sync_status: 'synced',
          itretail_last_sync: new Date().toISOString(),
          itretail_product_id: result.data?.id
        })
        .eq('id', product.id);
    } else {
      await supabase
        .from('products')
        .update({ itretail_sync_status: 'failed' })
        .eq('id', product.id);
    }
  } catch (error) {
    console.error('[Products API] ITRETAIL sync error:', error);
    await supabase
      .from('products')
      .update({ itretail_sync_status: 'failed' })
      .eq('id', product.id);
  }
}
