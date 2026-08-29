-- 1. Create Users Table
CREATE TABLE users (
    user_id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,
    default_lat FLOAT,
    default_lng FLOAT
);

-- 2. Create Produce Lots Table
CREATE TABLE produce_lots (
    lot_id VARCHAR(50) PRIMARY KEY,
    farmer_id VARCHAR(50) NOT NULL,
    crop_name VARCHAR(100) NOT NULL,
    quantity_kg FLOAT,
    price_per_kg DECIMAL(10, 2),
    status VARCHAR(30) DEFAULT 'AVAILABLE',
    location GEOMETRY(Point, 4326),
    harvest_date DATE,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES users(user_id)
);

-- 3. Create Orders Table
CREATE TABLE orders (
    order_id VARCHAR(50) PRIMARY KEY,
    buyer_id VARCHAR(50) NOT NULL,
    lot_ids TEXT,
    total_amount DECIMAL(10, 2),
    dropoff_latitude FLOAT,
    dropoff_longitude FLOAT,
    status VARCHAR(30) DEFAULT 'PENDING_ROUTE',
    payment_status VARCHAR(30) DEFAULT 'PENDING',
    route_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(user_id)
);

-- 4. Create Delivery Routes Table
CREATE TABLE delivery_routes (
    route_id VARCHAR(50) PRIMARY KEY,
    driver_id VARCHAR(50),
    route_coordinates TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING_DRIVER',
    total_distance_km FLOAT,
    estimated_payout DECIMAL(10, 2),
    ordered_stops TEXT,
    pickup_count INT,
    dropoff_count INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES users(user_id)
);

-- 5. Create Spatial Index (Speeds up the 50km radius search)
CREATE INDEX idx_produce_location ON produce_lots USING GIST (location);

-- 6. Insert Dummy Users
INSERT INTO users (user_id, full_name, role) 
VALUES 
    ('f_101', 'Ramesh Patil', 'FARMER'),
    ('f_102', 'Suresh Mohite', 'FARMER'),
    ('f_103', 'Anil Deshmukh', 'FARMER'),
    ('b_501', 'Green Leaf Restaurant', 'BUYER'),
    ('d_801', 'Ravi Kumar (Driver)', 'DRIVER');

-- 7. Insert Dummy Farm Produce
INSERT INTO produce_lots (lot_id, farmer_id, crop_name, quantity_kg, price_per_kg, location, harvest_date, image_url) 
VALUES 
    ('lot_901', 'f_101', 'Tomato', 500, 20.00, ST_SetSRID(ST_MakePoint(74.0312, 18.3489), 4326), '2026-08-26', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=800'),
    ('lot_902', 'f_102', 'Tomato', 300, 18.00, ST_SetSRID(ST_MakePoint(74.0118, 18.3245), 4326), '2026-08-25', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=800'),
    ('lot_903', 'f_103', 'Onion', 800, 25.00, ST_SetSRID(ST_MakePoint(73.9982, 18.3301), 4326), '2026-08-24', 'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?auto=format&fit=crop&q=80&w=800'),
    ('lot_904', 'f_101', 'Potato', 600, 15.00, ST_SetSRID(ST_MakePoint(74.0255, 18.3510), 4326), '2026-08-23', 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=800'),
    ('lot_905', 'f_102', 'Onion', 400, 26.00, ST_SetSRID(ST_MakePoint(74.0150, 18.3180), 4326), '2026-08-27', 'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?auto=format&fit=crop&q=80&w=800');
