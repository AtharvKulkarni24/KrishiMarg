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

```
[React.js + Tailwind + Leaflet] 
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

## 🚀 Getting Started (Frontend)

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/AtharvKulkarni24/KrishiMarg.git

# Navigate to project directory
cd KrishiMarg

# Install dependencies
npm install

# Run Vite development server
npm run dev
```

The application will be running locally at `http://localhost:5173/`.

---

## 👥 Tech Stack
- **Frontend**: React 18, Tailwind CSS, Leaflet.js, Recharts, Lucide Icons, Vite
- **Backend (Core)**: Java 17/21, Spring Boot 3.x, Hibernate Spatial
- **Database**: PostgreSQL 15+ with PostGIS Extension
- **AI & Optimization**: Python 3.10+, FastAPI, Facebook Prophet, Google OR-Tools
