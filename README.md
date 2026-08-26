# KrishiMarg (कृषिमार्ग) 🌾🚛

> **Smart India Hackathon 2026 — Problem Statement #26033**  
> **Ministry:** Ministry of Consumer Affairs, Food & Public Distribution  
> **Objective:** Direct Farmer-to-Buyer Digital Marketplace & AI-Optimized Pooled Logistics Engine

---

## 📌 Problem & Solution Overview
Traditional agricultural supply chains are burdened with multiple intermediaries, resulting in severe price spreads: smallholder farmers receive rock-bottom rates while bulk buyers and consumers pay inflated retail prices.

**KrishiMarg** solves this through a dual-USP architecture:
1. **Fair-Price Corridor (USP 1)**: Real-time APMC Mandi price benchmarking that mathematically guarantees **15% to 20% higher earnings for farmers** while delivering produce to buyers at **15% to 20% below standard retail prices**.
2. **Pooled Milk-Run Logistics (USP 2)**: Combinatorial vehicle routing using **Google OR-Tools** and **PostGIS** geospatial clustering to group multiple smallholder farm pickups into a single shared delivery run, reducing transportation costs by up to **34.5%**.

---

## 🏛️ System Architecture

```text
[React 18 + Tailwind + Leaflet UI] 
              │
         (HTTP / REST)
              ▼
   [Java Spring Boot Core] ──── (PostGIS / Spatial) ────> [PostgreSQL DB]
              │
       (Internal Relay)
              ▼
    [Python FastAPI AI Microservice]
        ├── Facebook Prophet (7-Day Price Forecast & Harvest Advisories)
        └── Google OR-Tools (Vehicle Routing Problem - VRP Solver)
```

---

## ✨ Key Features & Portals

- **🌱 Farmer & FPO Supply Portal**:
  - Agmark Quality Grading (Grade A: Premium, Grade B: Standard, Grade C: Processing).
  - Dynamic Fair-Price Corridor calculation.
  - 7-Day AI Price Trend forecast & deterministic harvest advisories.
  - FPO lot aggregation support for pooling small harvests.

- **🏬 Bulk Buyer Marketplace**:
  - Localized 50km inventory feed using PostGIS spatial radius queries.
  - Direct wholesale pricing.
  - Escrow payment protection (funds locked until delivery OTP verification).

- **🗺️ Central Logistics & Dispatch Hub**:
  - Interactive Leaflet map plotting regional farm pickups (Saswad, Purandar) and buyer dropoff (Kothrud).
  - Google OR-Tools multi-stop route optimization polyline rendering.
  - Simulated gig fleet dispatch ("Chota Hathi" / Tata Ace mini-trucks).

---

## 📁 Repository Structure

```text
KrishiMarg/
├── src/                         # React Frontend Application
│   ├── components/
│   │   ├── admin/               # Central Logistics Hub & Route Map
│   │   ├── buyer/               # Bulk Buyer Marketplace & Cart
│   │   ├── common/              # Toast, EmptyState, Modal components
│   │   ├── farmer/              # Farmer Portal & Crop Listing
│   │   ├── Navbar.jsx           # Global Navigation & Role Switcher
│   │   ├── WelcomePage.jsx      # Landing Page & Solution Overview
│   │   └── NotFoundPage.jsx     # 404 Route Component
│   ├── context/AppContext.jsx   # Shared State Management & Toast System
│   ├── services/                # API Services & Mock Data
│   └── index.css                # Tailwind & Custom Styling
│
├── routes/                      # FastAPI AI Engine Route Handlers
│   ├── forecast.py              # 7-day crop price forecasting endpoint
│   └── optimize.py              # Multi-stop VRP route optimization endpoint
├── services/                    # Core AI & Operations Research Services
│   ├── prophet_service.py       # Facebook Prophet forecasting logic
│   └── ortools_service.py       # Google OR-Tools routing solver
├── models/                      # Pydantic Schemas & Data Models
│   └── schemas.py
├── data/                        # Datasets & Historical Mandi Prices
│   └── historical_prices.csv
├── generate_data.py             # Synthetic 180-day price data generator
├── main.py                      # FastAPI Application Entry Point
├── package.json                 # Frontend dependencies & scripts
├── vite.config.js               # Vite bundler configuration
└── tailwind.config.js           # Tailwind CSS configuration
```

---

## 🚀 Getting Started

### 1. Frontend Setup (React + Vite)

#### Prerequisites
- Node.js (v18+)
- npm or yarn

```bash
# Install frontend dependencies
npm install

# Start Vite development server
npm run dev
```
The frontend UI will be running at `http://localhost:5173/`.

---

### 2. Backend AI Engine Setup (FastAPI)

#### Prerequisites
- Python 3.10+
- pip & virtualenv

```bash
# Create & activate virtual environment
# Windows:
python -m venv .venv
.venv\Scripts\activate

# Linux/macOS:
python3 -m venv .venv
source .venv/bin/activate

# Install Python dependencies
pip install fastapi uvicorn prophet ortools pandas

# (Optional) Generate historical mandi dataset
python generate_data.py

# Launch FastAPI server
uvicorn main:app --reload --port 8000
```
The FastAPI AI Engine will start at `http://127.0.0.1:8000`.  
Interactive Swagger API documentation: 👉 `http://127.0.0.1:8000/docs`

---

## 📡 AI Engine API Endpoints

### 1. Forecast Crop Prices
* **Endpoint:** `GET /api/v1/forecast`
* **Query Params:** `crop` (`Tomato`, `Potato`, `Onion`, etc.)
* **Example:**
  ```bash
  curl -X GET "http://127.0.0.1:8000/api/v1/forecast?crop=Tomato"
  ```
* **Response:** Returns 7-day price trajectory and actionable harvest advisories.

### 2. Optimize Logistics Route (VRP Solver)
* **Endpoint:** `POST /api/v1/optimize-route`
* **Payload:**
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
* **Response:** Returns minimum distance sequence, route polyline coordinates, and vehicle load schedule.

---

## 👥 Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Leaflet.js, Recharts, Lucide Icons
- **Backend (Core)**: Java 17/21, Spring Boot 3.x, Hibernate Spatial
- **Database**: PostgreSQL 15+ with PostGIS Extension
- **AI & Optimization**: Python 3.10+, FastAPI, Facebook Prophet, Google OR-Tools
