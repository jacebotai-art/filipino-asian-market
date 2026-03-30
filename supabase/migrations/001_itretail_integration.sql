-- ITRETAIL POS Integration Database Schema
-- Filipino Asian Market - Supabase Migration

-- ============================================
-- PRODUCTS TABLE (Enhanced for POS sync)
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Basic product info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100),
    
    -- Pricing
    price DECIMAL(10, 2) NOT NULL,
    compare_at_price DECIMAL(10, 2),
    cost_price DECIMAL(10, 2),
    
    -- Inventory
    quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 10,
    track_inventory BOOLEAN DEFAULT true,
    
    -- Categorization
    category VARCHAR(100),
    subcategory VARCHAR(100),
    tags TEXT[],
    
    -- Media
    images TEXT[],
    featured_image VARCHAR(500),
    
    -- ITRETAIL POS Integration
    itretail_product_id VARCHAR(100),
    itretail_sync_status VARCHAR(50) DEFAULT 'pending',
    itretail_last_sync TIMESTAMP WITH TIME ZONE,
    itretail_data JSONB,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active',
    is_featured BOOLEAN DEFAULT false,
    
    -- Metadata
    weight DECIMAL(10, 2),
    weight_unit VARCHAR(20) DEFAULT 'lb',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for products
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_itretail_id ON products(itretail_product_id);
CREATE INDEX IF NOT EXISTS idx_products_itretail_sync ON products(itretail_sync_status);

-- ============================================
-- ORDERS TABLE (Enhanced from existing)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Order identification
    order_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Customer info
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    
    -- Order items (JSON for flexibility)
    items JSONB NOT NULL,
    item_count INTEGER NOT NULL,
    
    -- Financials
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    
    -- Fulfillment
    pickup_date DATE,
    pickup_time VARCHAR(20),
    special_instructions TEXT,
    
    -- Order status
    status VARCHAR(50) DEFAULT 'pending',
    -- pending, preparing, ready, picked_up, cancelled, refunded
    
    -- ITRETAIL POS Integration
    itretail_order_id VARCHAR(100),
    itretail_sync_status VARCHAR(50) DEFAULT 'pending',
    itretail_sync_attempts INTEGER DEFAULT 0,
    itretail_last_sync_attempt TIMESTAMP WITH TIME ZONE,
    itretail_last_sync_error TEXT,
    itretail_receipt_number VARCHAR(100),
    
    -- Payment
    payment_status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_transaction_id VARCHAR(255),
    
    -- Metadata
    source VARCHAR(50) DEFAULT 'website', -- website, pos, manual
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_itretail_sync ON orders(itretail_sync_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);

-- ============================================
-- INVENTORY SYNC LOG
-- Track all sync operations between website and POS
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_sync_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Sync details
    sync_type VARCHAR(50) NOT NULL, -- 'to_pos', 'from_pos', 'price_update', 'stock_update'
    entity_type VARCHAR(50) NOT NULL, -- 'product', 'order'
    entity_id UUID,
    
    -- Status
    status VARCHAR(50) NOT NULL, -- 'success', 'failed', 'pending'
    
    -- Data
    request_payload JSONB,
    response_payload JSONB,
    error_message TEXT,
    
    -- ITRETAIL specific
    itretail_endpoint VARCHAR(255),
    itretail_response_code INTEGER,
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Retry tracking
    retry_count INTEGER DEFAULT 0,
    next_retry_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for sync log
CREATE INDEX IF NOT EXISTS idx_sync_log_type ON inventory_sync_log(sync_type);
CREATE INDEX IF NOT EXISTS idx_sync_log_status ON inventory_sync_log(status);
CREATE INDEX IF NOT EXISTS idx_sync_log_entity ON inventory_sync_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_sync_log_started ON inventory_sync_log(started_at);

-- ============================================
-- ORDER QUEUE (for failed/pending orders)
-- ============================================
CREATE TABLE IF NOT EXISTS order_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Reference to order
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    
    -- Queue status
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, failed, completed
    priority INTEGER DEFAULT 5, -- 1-10, lower is higher priority
    
    -- Processing
    processing_started_at TIMESTAMP WITH TIME ZONE,
    processing_completed_at TIMESTAMP WITH TIME ZONE,
    processor_id VARCHAR(100),
    
    -- Error handling
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    last_error_at TIMESTAMP WITH TIME ZONE,
    
    -- Retry logic
    max_retries INTEGER DEFAULT 5,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for order queue
CREATE INDEX IF NOT EXISTS idx_order_queue_status ON order_queue(status);
CREATE INDEX IF NOT EXISTS idx_order_queue_order_id ON order_queue(order_id);
CREATE INDEX IF NOT EXISTS idx_order_queue_next_retry ON order_queue(next_retry_at);
CREATE INDEX IF NOT EXISTS idx_order_queue_priority ON order_queue(priority, created_at);

-- ============================================
-- PRODUCT EMAIL QUEUE (for email parser)
-- ============================================
CREATE TABLE IF NOT EXISTS product_email_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Email info
    email_from VARCHAR(255) NOT NULL,
    email_subject TEXT NOT NULL,
    email_body TEXT NOT NULL,
    email_received_at TIMESTAMP WITH TIME ZONE,
    
    -- Parsed data
    parsed_data JSONB,
    parsed_at TIMESTAMP WITH TIME ZONE,
    parser_version VARCHAR(20),
    
    -- Processing status
    status VARCHAR(50) DEFAULT 'pending', -- pending, parsed, reviewed, approved, rejected
    
    -- Review queue
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    
    -- Image attachments
    attachments TEXT[],
    processed_images TEXT[],
    
    -- Created products (after approval)
    created_product_ids UUID[],
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for email queue
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON product_email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_received ON product_email_queue(email_received_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_created ON product_email_queue(created_at);

-- ============================================
-- SYNC CONFIGURATION
-- Store ITRETAIL connection settings
-- ============================================
CREATE TABLE IF NOT EXISTS sync_configuration (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Connection
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    
    -- Metadata
    description TEXT,
    is_encrypted BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables
CREATE TRIGGER IF NOT EXISTS update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_order_queue_updated_at
    BEFORE UPDATE ON order_queue
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_product_email_queue_updated_at
    BEFORE UPDATE ON product_email_queue
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_sync_config_updated_at
    BEFORE UPDATE ON sync_configuration
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS
-- ============================================

-- Daily sales view
CREATE OR REPLACE VIEW daily_sales AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as order_count,
    SUM(total) as revenue,
    AVG(total) as avg_order_value
FROM orders
WHERE status NOT IN ('cancelled', 'refunded')
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Low stock products view
CREATE OR REPLACE VIEW low_stock_products AS
SELECT 
    id,
    name,
    sku,
    quantity,
    low_stock_threshold,
    (quantity <= low_stock_threshold) as is_low_stock
FROM products
WHERE track_inventory = true
AND status = 'active'
ORDER BY quantity ASC;

-- Pending sync items view
CREATE OR REPLACE VIEW pending_sync_items AS
SELECT 
    'product' as entity_type,
    id as entity_id,
    name as entity_name,
    itretail_sync_status as sync_status,
    updated_at as last_updated
FROM products
WHERE itretail_sync_status IN ('pending', 'failed')
UNION ALL
SELECT 
    'order' as entity_type,
    id as entity_id,
    order_number as entity_name,
    itretail_sync_status as sync_status,
    updated_at as last_updated
FROM orders
WHERE itretail_sync_status IN ('pending', 'failed')
ORDER BY last_updated DESC;

-- Order queue stats view
CREATE OR REPLACE VIEW order_queue_stats AS
SELECT 
    status,
    COUNT(*) as count,
    AVG(error_count) as avg_error_count
FROM order_queue
GROUP BY status;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_configuration ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Products are viewable by everyone" ON products
    FOR SELECT USING (status = 'active');

CREATE POLICY "Products are manageable by authenticated users" ON products
    FOR ALL USING (auth.role() = 'authenticated');

-- Orders policies
CREATE POLICY "Orders viewable by owner or admin" ON orders
    FOR SELECT USING (
        auth.uid()::text = customer_email OR 
        auth.role() = 'authenticated'
    );

CREATE POLICY "Orders insertable by everyone" ON orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Orders updatable by admin" ON orders
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Admin tables policies
CREATE POLICY "Sync log viewable by admin" ON inventory_sync_log
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Order queue manageable by admin" ON order_queue
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Email queue manageable by admin" ON product_email_queue
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Config manageable by admin" ON sync_configuration
    FOR ALL USING (auth.role() = 'authenticated');
