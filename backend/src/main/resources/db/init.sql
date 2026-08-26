-- 1. Create Users Table (Farmers, Buyers, Drivers)
CREATE TABLE users (
    user_id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL, -- 'FARMER', 'BUYER', 'DRIVER'
    default_lat FLOAT,
    default_lng FLOAT
);

-- 2. Create Produce Lots Table (Inventory & Farm Location)
CREATE TABLE produce_lots (
    lot_id VARCHAR(50) PRIMARY KEY,
    farmer_id VARCHAR(50) NOT NULL,
    crop_name VARCHAR(50) NOT NULL,
    quantity_kg INT NOT NULL,
    quality_grade VARCHAR(10),
    price_per_kg DECIMAL(10, 2),
    harvest_date DATE,
    status VARCHAR(20) DEFAULT 'AVAILABLE',
    farm_location GEOMETRY(Point, 4326),
    FOREIGN KEY (farmer_id) REFERENCES users(user_id)
);

-- 3. Create Orders Table (Purchases)
CREATE TABLE orders (
    order_id VARCHAR(50) PRIMARY KEY,
    buyer_id VARCHAR(50) NOT NULL,
    lot_ids JSONB NOT NULL,
    total_amount DECIMAL(10, 2),
    dropoff_location GEOMETRY(Point, 4326), -- 4326 is the standard GPS coordinate system
    status VARCHAR(30) DEFAULT 'PENDING_ROUTE',
    FOREIGN KEY (buyer_id) REFERENCES users(user_id)
);

-- 4. Create Delivery Routes Table (Logistics)
CREATE TABLE delivery_routes (
    route_id VARCHAR(50) PRIMARY KEY,
    driver_id VARCHAR(50),
    route_coordinates JSONB NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING_DRIVER',
    FOREIGN KEY (driver_id) REFERENCES users(user_id)
);

-- 5. Create Spatial Index (Speeds up the 50km radius search)
CREATE INDEX idx_produce_location ON produce_lots USING GIST (farm_location);

-- 6. Insert Dummy Users
INSERT INTO users (user_id, full_name, role) 
VALUES 
    ('f_101', 'Ramesh Patil', 'FARMER'),
    ('f_102', 'Suresh Mohite', 'FARMER'),
    ('f_103', 'Anil Deshmukh', 'FARMER'),
    ('b_501', 'Green Leaf Restaurant', 'BUYER'),
    ('d_801', 'Ravi Kumar (Driver)', 'DRIVER');

-- 7. Insert Dummy Farm Produce (Using ST_SetSRID and ST_MakePoint for Lat/Long)
-- Note: PostGIS uses ST_MakePoint(longitude, latitude) - Longitude comes FIRST!
INSERT INTO produce_lots (lot_id, farmer_id, crop_name, quantity_kg, quality_grade, price_per_kg, harvest_date, farm_location) 
VALUES 
    ('lot_901', 'f_101', 'Tomato', 500, 'A', 20.00, '2026-08-28', ST_SetSRID(ST_MakePoint(74.0312, 18.3489), 4326)),
    ('lot_902', 'f_102', 'Tomato', 300, 'B', 18.00, '2026-08-25', ST_SetSRID(ST_MakePoint(74.0118, 18.3245), 4326)),
    ('lot_903', 'f_103', 'Onion', 800, 'A', 25.00, '2026-08-30', ST_SetSRID(ST_MakePoint(73.9982, 18.3301), 4326)),
    ('lot_904', 'f_101', 'Potato', 600, 'B', 15.00, '2026-08-20', ST_SetSRID(ST_MakePoint(74.0255, 18.3510), 4326)),
    ('lot_905', 'f_102', 'Onion', 400, 'A', 26.00, '2026-09-01', ST_SetSRID(ST_MakePoint(74.0150, 18.3180), 4326));
