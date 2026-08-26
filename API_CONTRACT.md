# Master API & Data Contract

This Master API & Data Contract dictates the exact JSON payloads, database schemas, and endpoints for the KrishiMarg internal evaluation round. It ensures all 3 actors (Farmer, Buyer, Driver) and our 2 ML systems (Prophet Forecast, OR-Tools Logistics) are fully integrated.

## Global Contract Rules
- **Format**: `application/json`
- **Casing**: `snake_case` for all keys.
- **Coordinates**: Always passed as explicit latitude/longitude fields. Internally stored as PostGIS `GEOMETRY(Point)`.
- **Base URL**: `http://localhost:8080/api/v1`

---

## 1. Database Schema (PostgreSQL + PostGIS)

### `users` (Farmers, Buyers, Drivers)
| Column | Type | Notes |
|--------|------|-------|
| `user_id` | VARCHAR(50) | Primary Key (e.g., 'f_101', 'b_501', 'd_801') |
| `full_name` | VARCHAR(100) | |
| `role` | VARCHAR(20) | 'FARMER', 'BUYER', 'DRIVER' |
| `default_lat` | FLOAT | Optional |
| `default_lng` | FLOAT | Optional |

### `produce_lots` (Inventory)
| Column | Type | Notes |
|--------|------|-------|
| `lot_id` | VARCHAR(50) | Primary Key |
| `farmer_id`| VARCHAR(50) | Foreign Key to `users` |
| `crop_name`| VARCHAR(50) | e.g., 'Tomato' |
| `quantity_kg`| INT | |
| `price_per_kg`| DECIMAL(10,2)| Farmer's chosen price (validated via bounds) |
| `harvest_date`| DATE | |
| `status` | VARCHAR(20) | 'AVAILABLE', 'SOLD' |
| `location` | GEOMETRY(Point, 4326) | Used for radius search |

### `orders` (Purchases)
| Column | Type | Notes |
|--------|------|-------|
| `order_id` | VARCHAR(50) | Primary Key |
| `buyer_id` | VARCHAR(50) | Foreign Key to `users` |
| `lot_ids`  | JSON | Array of purchased `lot_id` strings |
| `total_amount`| DECIMAL(10,2)| Sum of bought lots. (MOCK PAYMENT) |
| `dropoff_location`| GEOMETRY(Point, 4326)| |
| `status` | VARCHAR(30) | 'PENDING_ROUTE', 'ROUTE_ASSIGNED', 'DELIVERED' |



### `delivery_routes` (Logistics)
| Column | Type | Notes |
|--------|------|-------|
| `route_id` | VARCHAR(50) | Primary Key |
| `driver_id`| VARCHAR(50) | Foreign Key to `users`. Nullable initially. |
| `route_coordinates` | JSON | Exact points from OR-Tools |
| `status` | VARCHAR(30) | 'PENDING_DRIVER', 'ACCEPTED', 'COMPLETED' |

---

## 2. API Flow 1: The Farmer Portal

### A. Fetch Market Insights (AI & Mandi Data)
**Action**: Farmer selects a crop to see if they should harvest today. We combine Live Mandi Prices for thresholds and Prophet ML for 7-day forecasting.
- **Endpoint**: `GET /api/v1/farmer/insights?crop=Tomato`
- **Response (200 OK)**:
```json
{
  "mandi_thresholds": { 
    "current_mandi_price": 15.00,
    "min_price": 12.00, 
    "max_price": 25.00 
  },
  "harvest_suggestion": "Wait 2 days. Prices are expected to rise.",
  "ml_7_day_forecast": [
    {"date": "2026-08-26", "price": 15.50},
    {"date": "2026-08-27", "price": 16.80},
    {"date": "2026-08-28", "price": 18.20},
    {"date": "2026-08-29", "price": 19.00},
    {"date": "2026-08-30", "price": 17.50}
  ]
}
```

### B. Submit Produce Listing
**Action**: Farmer lists their crop after reviewing the insights.
- **Endpoint**: `POST /api/v1/produce`
- **Request**:
```json
{
  "farmer_id": "f_101",
  "crop_name": "Tomato",
  "quantity_kg": 500,
  "price_per_kg": 18.50,
  "harvest_date": "2026-08-28",
  "latitude": 18.3489,
  "longitude": 74.0312
}
```
- **Response (201 Created)**:
```json
{
  "lot_id": "lot_901",
  "status": "LISTED"
}
```

---

## 3. API Flow 2: The Buyer Marketplace

### A. Search Nearby Produce
**Action**: Buyer opens marketplace. Java runs a PostGIS 50km radius search.
- **Endpoint**: `GET /api/v1/buyer/search?crop=Tomato&lat=18.5018&lng=73.8636&radius_km=50`
- **Response (200 OK)**:
```json
{
  "available_lots": [
    {
      "lot_id": "lot_901",
      "farmer_id": "f_101",
      "crop_name": "Tomato",
      "quantity_kg": 500,
      "price_per_kg": 18.50,
      "harvest_date": "2026-08-28",
      "distance_km": 28.4,
      "latitude": 18.3489,
      "longitude": 74.0312
    }
  ]
}
```

### B. Checkout & Mock Payment
**Action**: Buyer purchases selected lots.
- **Endpoint**: `POST /api/v1/orders`
- **Request**:
```json
{
  "buyer_id": "b_501",
  "lot_ids": ["lot_901"],
  "dropoff_latitude": 18.5018,
  "dropoff_longitude": 73.8636
}
```
- **Response (201 Created)**: *(MOCK: Payment success assumed)*
```json
{
  "order_id": "ord_7701",
  "status": "PENDING_ROUTE",
  "payment_status": "MOCK_SUCCESS",
  "total_amount": 9250.00
}
```

---

## 4. API Flow 3: Logistics & Drivers (OR-Tools)

### A. Trigger Route Optimization (Internal / Admin)
**Action**: System sends all `PENDING_ROUTE` orders to Python OR-Tools API to get optimized delivery paths.
- **Endpoint**: `POST http://localhost:8000/api/v1/optimize-route` *(Python Engine)*
- **Response (200 OK)**:
```json
{
  "route_id": "route_999",
  "total_distance_km": 42.6,
  "route_coordinates": [
    [18.3245, 74.0118], 
    [18.3489, 74.0312], 
    [18.5018, 73.8636]
  ],
  "ordered_stops": [
    {"type": "PICKUP", "lot_id": "lot_902"},
    {"type": "PICKUP", "lot_id": "lot_901"},
    {"type": "DROPOFF", "order_id": "ord_7701"}
  ]
}
```

### B. Driver Views Routes
**Action**: Driver opens app, fetches pending localized routes.
- **Endpoint**: `GET /api/v1/driver/routes?lat=18.4&lng=73.9`
- **Response (200 OK)**:
```json
{
  "available_routes": [
    {
      "route_id": "route_999",
      "total_distance_km": 42.6,
      "pickup_count": 2,
      "dropoff_count": 1,
      "estimated_payout": 1500.00
    }
  ]
}
```

### C. Driver Accepts Route
**Action**: Driver claims the route.
- **Endpoint**: `POST /api/v1/driver/routes/{route_id}/accept`
- **Request**:
```json
{
  "driver_id": "d_801"
}
```
- **Response (200 OK)**:
```json
{
  "status": "ACCEPTED"
}
```

### D. Driver Completes Route (Mock Escrow Release)
**Action**: Driver finishes deliveries.
- **Endpoint**: `POST /api/v1/driver/routes/{route_id}/complete`
- **Response (200 OK)**: *(MOCK: Funds transferred to Farmer and Driver)*
```json
{
  "status": "COMPLETED",
  "payout_status": "MOCK_ESCROW_RELEASED"
}
```
