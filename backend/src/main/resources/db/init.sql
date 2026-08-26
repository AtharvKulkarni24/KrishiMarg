-- 1. Create Users Table (Farmers & Buyers)
CREATE TABLE users (
    user_id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL -- 'FARMER' or 'BUYER'
);

-- 2. Create Orders Table (Escrow & Dropoff)
CREATE TABLE orders (
    order_id VARCHAR(50) PRIMARY KEY,
    buyer_id VARCHAR(50) NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING_DISPATCH',
    total_amount DECIMAL(10, 2),
    dropoff_location GEOMETRY(Point, 4326), -- 4326 is the standard GPS coordinate system
    FOREIGN KEY (buyer_id) REFERENCES users(user_id)
);

-- 3. Create Produce Lots Table (Inventory & Farm Location)
CREATE TABLE produce_lots (
    lot_id VARCHAR(50) PRIMARY KEY,
    farmer_id VARCHAR(50) NOT NULL,
    order_id VARCHAR(50), -- Remains NULL until a buyer purchases it
    crop_name VARCHAR(50) NOT NULL,
    quantity_kg INT NOT NULL,
    quality_grade VARCHAR(10),
    price_per_kg DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'AVAILABLE',
    farm_location GEOMETRY(Point, 4326),
    FOREIGN KEY (farmer_id) REFERENCES users(user_id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- 4. Create Spatial Index (Speeds up the 50km radius search)
CREATE INDEX idx_produce_location ON produce_lots USING GIST (farm_location);

-- 5. Insert Dummy Users
INSERT INTO users (user_id, full_name, role) 
VALUES 
    ('f_101', 'Ramesh Patil', 'FARMER'),
    ('f_102', 'Suresh Mohite', 'FARMER'),
    ('f_103', 'Anil Deshmukh', 'FARMER'),
    ('b_501', 'Green Leaf Restaurant', 'BUYER');

-- 6. Insert Dummy Farm Produce (Using ST_SetSRID and ST_MakePoint for Lat/Long)
-- Note: PostGIS uses ST_MakePoint(longitude, latitude) - Longitude comes FIRST!
INSERT INTO produce_lots (lot_id, farmer_id, crop_name, quantity_kg, quality_grade, price_per_kg, farm_location) 
VALUES 
    ('lot_901', 'f_101', 'Tomato', 500, 'A', 20.00, ST_SetSRID(ST_MakePoint(74.0312, 18.3489), 4326)),
    ('lot_902', 'f_102', 'Tomato', 300, 'B', 18.00, ST_SetSRID(ST_MakePoint(74.0118, 18.3245), 4326)),
    ('lot_903', 'f_103', 'Onion', 800, 'A', 25.00, ST_SetSRID(ST_MakePoint(73.9982, 18.3301), 4326)),
    ('lot_904', 'f_101', 'Potato', 600, 'B', 15.00, ST_SetSRID(ST_MakePoint(74.0255, 18.3510), 4326)),
    ('lot_905', 'f_102', 'Onion', 400, 'A', 26.00, ST_SetSRID(ST_MakePoint(74.0150, 18.3180), 4326));
