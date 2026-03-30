# ITRETAIL POS Integration

## Filipino Asian Market - POS Integration System

This integration connects the Filipino Market website with ITRETAIL POS for bidirectional inventory and order synchronization.

---

## Features

### ✅ Implemented

1. **Supabase Database Schema**
   - Products table with ITRETAIL sync fields
   - Orders table with POS integration
   - Inventory sync log tracking
   - Order queue system for failed/retry logic
   - Email queue for product email parser

2. **API Endpoints**
   - `POST /api/orders` - Create orders from website
   - `GET /api/orders` - List orders with filters
   - `POST /api/inventory/sync` - Bidirectional inventory sync
   - `GET /api/inventory/sync` - Sync status and pending items
   - `GET/POST/PUT/DELETE /api/products` - Product CRUD with POS sync
   - `GET/POST /api/itretail/webhook` - Receive POS webhooks
   - `GET/POST/DELETE /api/order-queue` - Manage order processing queue

3. **ITRETAIL Connector (`app/lib/itretail.ts`)**
   - Mock mode for development (no real API needed)
   - Product sync (create, update, price changes)
   - Inventory sync (get, update, batch updates)
   - Order sync (create, get status, cancel)
   - Webhook handlers for POS events

4. **Admin Dashboards**
   - **Sales Dashboard** - Orders, analytics, stats
   - **Inventory Dashboard** - Product management, POS sync controls
   - **Order Queue Dashboard** - Monitor and retry failed syncs

5. **Order Queue System**
   - Automatic retry with exponential backoff
   - Failed order tracking
   - Manual retry capability
   - Queue statistics and monitoring

---

## Setup Instructions

### 1. Database Setup

Run the migration file in Supabase SQL Editor:

```sql
-- File: supabase/migrations/001_itretail_integration.sql
-- Contains all tables, indexes, views, and RLS policies
```

### 2. Environment Variables

Add to `.env.local`:

```env
# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# ITRETAIL (when API available)
ITRETAIL_API_URL=https://api.itretail.com/v1
ITRETAIL_API_KEY=your_api_key
ITRETAIL_STORE_ID=your_store_id
```

### 3. ITRETAIL Connection

Currently running in **MOCK MODE** - no real API calls are made.

When ITRETAIL API is available:
1. Get API credentials from ITRETAIL dashboard
2. Add to environment variables
3. Connector automatically switches to live mode

---

## API Documentation

### Orders

**Create Order**
```http
POST /api/orders
Content-Type: application/json

{
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "(213) 555-0101",
  "items": [
    { "productId": "uuid", "name": "Product", "price": 10.99, "quantity": 2 }
  ],
  "subtotal": 21.98,
  "total": 21.98,
  "pickup_date": "2026-02-28",
  "pickup_time": "2:00 PM"
}
```

**List Orders**
```http
GET /api/orders?status=pending&limit=50
```

### Inventory Sync

**Sync from POS to Website**
```http
POST /api/inventory/sync
Content-Type: application/json

{ "direction": "from_pos" }
```

**Sync from Website to POS**
```http
POST /api/inventory/sync
Content-Type: application/json

{ "direction": "to_pos" }
```

### Products

**Create Product**
```http
POST /api/products
Content-Type: application/json

{
  "name": "Jasmine Rice 25lb",
  "sku": "RICE-001",
  "price": 24.99,
  "quantity": 50,
  "category": "Rice & Grains"
}
```

**Update Product Price**
```http
PUT /api/products
Content-Type: application/json

{
  "id": "product-uuid",
  "updates": { "price": 26.99 }
}
```

### Order Queue

**Process Queue**
```http
POST /api/order-queue
Content-Type: application/json

{ "action": "process" }
```

**Retry Failed Order**
```http
POST /api/order-queue
Content-Type: application/json

{ "action": "retry", "order_id": "order-uuid" }
```

---

## Webhooks

ITRETAIL can send webhooks to `/api/itretail/webhook`:

### Supported Events

- `inventory.updated` - Stock level changed in POS
- `sale.completed` - In-store sale completed
- `product.updated` - Product details changed
- `product.price_changed` - Price updated in POS

### Webhook Payload Example
```json
{
  "event_type": "inventory.updated",
  "data": {
    "sku": "RICE-001",
    "quantity": 45,
    "adjustment_reason": "In-store sale",
    "timestamp": "2026-02-27T21:00:00Z"
  }
}
```

---

## Database Schema

### Products Table
- `id`, `name`, `sku`, `barcode`, `price`, `quantity`
- `itretail_product_id` - Link to POS
- `itretail_sync_status` - pending/synced/failed
- `itretail_last_sync` - Last sync timestamp
- `itretail_data` - Raw POS data (JSON)

### Orders Table
- `id`, `order_number`, `customer_*`, `items`, `total`
- `itretail_order_id` - Link to POS order
- `itretail_receipt_number`
- `itretail_sync_status`
- `itretail_sync_attempts`
- `itretail_last_sync_error`

### Order Queue Table
- `order_id` - Reference to order
- `status` - pending/processing/failed/completed
- `priority` - 1-10 (lower = higher priority)
- `error_count`, `max_retries`
- `next_retry_at` - For exponential backoff

### Inventory Sync Log
- Tracks all sync attempts
- `sync_type` - to_pos/from_pos
- `entity_type` - product/order
- `request_payload`, `response_payload`
- `error_message`

---

## Sync Flow

### Website Order → POS
1. Customer places order on website
2. Order saved to database with `itretail_sync_status: 'pending'`
3. Order added to queue
4. Background process sends to ITRETAIL
5. On success: Update order with POS ID, update inventory
6. On failure: Increment retry count, schedule retry

### POS Sale → Website
1. Sale completed in POS
2. ITRETAIL sends webhook to website
3. Website updates product quantities
4. Sync logged for tracking

---

## Admin Dashboard Features

### Inventory Dashboard
- View all products with sync status
- Add/edit/delete products
- Push/pull inventory from POS
- Filter by category, sync status
- Low stock alerts

### Order Queue Dashboard
- View pending/processing/failed orders
- Process queue manually
- Retry failed orders
- Clear completed items
- See error details

### Sales Dashboard
- Order management
- Status updates
- Sales analytics
- Top products

---

## Development

### Mock Mode
When `ITRETAIL_API_KEY` is not set or is "mock-api-key", the connector runs in mock mode:
- Simulates API responses
- Random 5% failure rate (to test error handling)
- 300-1000ms artificial delay

### Testing Webhooks Locally
```bash
# Use ngrok to expose local server
ngrok http 3000

# Set webhook URL in ITRETAIL to:
# https://your-ngrok-url/api/itretail/webhook
```

---

## Future Enhancements

1. **Email Parser Integration**
   - Cloudflare Email Worker
   - AI parsing (Gemini)
   - Image processing
   - Review queue

2. **Advanced Features**
   - Scheduled sync (cron)
   - Real-time inventory via WebSockets
   - Inventory alerts/notifications
   - Multi-location support

3. **Analytics**
   - Online vs in-store sales comparison
   - Inventory turnover
   - Sync health dashboard

---

## Troubleshooting

### Sync Failures
Check `/api/order-queue` for failed items and error messages.

### Missing Products in POS
- Check `itretail_sync_status` in products table
- Look at `inventory_sync_log` for error details
- Try manual sync from Inventory Dashboard

### Orders Not Syncing
- Verify order is in queue table
- Check error_count and last_error
- Use retry button or wait for automatic retry

---

## Support

For issues or questions:
1. Check the sync logs in Supabase
2. Review error messages in order queue
3. Verify ITRETAIL API credentials
4. Check webhook delivery in ITRETAIL dashboard
