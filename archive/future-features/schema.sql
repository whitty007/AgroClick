-- AgroClick PostgreSQL Database Schema DDL
-- Execute via CLI: psql -U postgres -d agroclick -f schema.sql

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    mobile VARCHAR(15) PRIMARY KEY,
    name VARCHAR(100),
    is_owner BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    kyc_verified BOOLEAN DEFAULT FALSE,
    aadhar VARCHAR(12),
    bank_account VARCHAR(20),
    ifsc VARCHAR(11),
    location VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- 2. Shops Table
CREATE TABLE IF NOT EXISTS shops (
    id VARCHAR(50) PRIMARY KEY,
    owner_mobile VARCHAR(15) REFERENCES users(mobile) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    owner_image TEXT,
    location VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Shop Items / Crops Table
CREATE TABLE IF NOT EXISTS shop_items (
    id VARCHAR(50) PRIMARY KEY,
    shop_id VARCHAR(50) REFERENCES shops(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    image TEXT,
    price NUMERIC(10, 2) NOT NULL,
    description TEXT,
    out_of_stock BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Shop Reviews Table
CREATE TABLE IF NOT EXISTS shop_reviews (
    id VARCHAR(50) PRIMARY KEY,
    shop_id VARCHAR(50) REFERENCES shops(id) ON DELETE CASCADE,
    customer_name VARCHAR(100) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY,
    customer_mobile VARCHAR(15) NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    shop_id VARCHAR(50) REFERENCES shops(id) ON DELETE CASCADE,
    shop_name VARCHAR(150) NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    location VARCHAR(100) NOT NULL,
    status VARCHAR(30) DEFAULT 'Placed',
    payment_method VARCHAR(50) DEFAULT 'Razorpay',
    payment_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Order Line Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
    item_name VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    qty INTEGER NOT NULL
);

-- 7. App State JSONB Table (for sync fallback)
CREATE TABLE IF NOT EXISTS app_state (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'app_state',
    state JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_shops_location ON shops(location);
CREATE INDEX IF NOT EXISTS idx_shop_items_shop_id ON shop_items(shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_mobile);
CREATE INDEX IF NOT EXISTS idx_orders_shop ON orders(shop_id);
