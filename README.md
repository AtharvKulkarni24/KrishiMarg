# KrishiMarg AI Engine

The KrishiMarg AI Engine is a FastAPI-based backend service designed to empower farmers and optimize agricultural supply chains. It provides predictive market analytics and intelligent logistics routing using advanced machine learning and operations research models.

## Features

This AI engine currently supports two primary capabilities:

### 1. Market Price Forecasting (Prophet)
* **What it does:** Uses historical price data to predict future crop prices over a 7-day horizon.
* **Technology:** Facebook Prophet (Time-series forecasting).
* **Value:** Provides farmers with actionable advisories (e.g., "Prices are projected to drop, harvest immediately" or "Demand is surging, delay harvest") to maximize their profit margins.

### 2. Smart Route Optimization (Google OR-Tools)
* **What it does:** Calculates the most fuel-efficient delivery route for a single vehicle making multiple farm pickups before dropping off the produce at a buyer's location.
* **Technology:** Google OR-Tools (Vehicle Routing Problem).
* **Value:** Reduces transportation costs, optimizes logistics, and ensures the vehicle's cargo capacity is strictly respected.

## Project Structure

```text
KrishiMarg-AI/
├── data/
│   └── historical_prices.csv    # Dataset used for Prophet forecasting
├── models/
│   └── schemas.py               # Pydantic models for API request/response validation
├── routes/
│   ├── forecast.py              # API routes for price forecasting
│   └── optimize.py              # API routes for route optimization
├── services/
│   ├── prophet_service.py       # Core logic for Prophet time-series prediction
│   └── ortools_service.py       # Core logic for distance matrix and VRP routing
├── generate_data.py             # Script to generate synthetic 180-day historical data
└── main.py                      # FastAPI application entry point
```

## Setup & Installation

1. **Activate your virtual environment** (if not already active):
   ```bash
   # Windows
   .venv\Scripts\activate
   ```

2. **Install Requirements** (Ensure you have installed FastAPI, Uvicorn, Prophet, OR-Tools, and Pandas):
   ```bash
   pip install fastapi uvicorn prophet ortools pandas
   ```

3. **Generate Synthetic Data**:
   Before running the forecast endpoint, ensure you have sufficient data:
   ```bash
   python generate_data.py
   ```

4. **Run the Server**:
   ```bash
   uvicorn main:app --reload
   ```
   The server will start at `http://127.0.0.1:8000`.

## API Endpoints & Testing

Once the server is running, you can access the interactive Swagger UI at:
👉 **http://127.0.0.1:8000/docs**

### 1. Forecast Crop Prices
* **Endpoint:** `GET /api/v1/forecast`
* **Query Params:** `crop` (e.g., Tomato, Potato, Onion)
* **Example Request:**
  ```bash
  curl -X GET "http://127.0.0.1:8000/api/v1/forecast?crop=Tomato"
  ```
* **Response:** Returns a 7-day trend array and an actionable advisory text.

### 2. Optimize Logistics Route
* **Endpoint:** `POST /api/v1/optimize-route`
* **Payload Format (JSON):**
  ```json
  {
    "vehicle_capacity_kg": 1000,
    "pickups": [
      {"lot_id": "LOT-001", "quantity_kg": 100, "latitude": 18.5204, "longitude": 73.8567},
      {"lot_id": "LOT-002", "quantity_kg": 200, "latitude": 18.5300, "longitude": 73.8600}
    ],
    "dropoff": {
      "latitude": 18.5500,
      "longitude": 73.9000
    }
  }
  ```
* **Example Request:**
  ```bash
  curl -X POST "http://127.0.0.1:8000/api/v1/optimize-route" -H "Content-Type: application/json" -d '{...}'
  ```
* **Response:** Returns the total route distance (in km), the ordered coordinates for mapping, and an ordered sequence of stops.
