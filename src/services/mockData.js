// Seed Data for Pune/Saswad/Kothrud region matching Master API & Data Contract

export const MOCK_USERS = [
  { user_id: "f_101", full_name: "Ramesh Patil", role: "FARMER", location_name: "Saswad Farm Cluster", lat: 18.3489, lon: 74.0312 },
  { user_id: "f_102", full_name: "Suresh Mohite", role: "FARMER", location_name: "Purandar Agro Valley", lat: 18.3245, lon: 74.0118 },
  { user_id: "b_501", full_name: "Green Leaf Restaurant & Mess", role: "BUYER", location_name: "Kothrud, Pune", lat: 18.5018, lon: 73.8636 },
  { user_id: "d_901", full_name: "Aman Logistics (Tata Ace)", role: "DRIVER", vehicle_no: "MH 12 AB 1234", capacity_kg: 1000 }
];

export const MOCK_CROPS_BENCHMARK = {
  "Tomato": { mandi_price: 15.00, retail_price: 25.00, fair_payout: 18.00, buyer_price: 20.00, unit: "kg" },
  "Onion": { mandi_price: 22.00, retail_price: 36.00, fair_payout: 26.00, buyer_price: 30.00, unit: "kg" },
  "Potato": { mandi_price: 18.00, retail_price: 28.00, fair_payout: 21.50, buyer_price: 24.00, unit: "kg" },
  "Cauliflower": { mandi_price: 20.00, retail_price: 35.00, fair_payout: 24.00, buyer_price: 28.00, unit: "kg" },
  "Green Chili": { mandi_price: 45.00, retail_price: 70.00, fair_payout: 54.00, buyer_price: 60.00, unit: "kg" }
};

export const MOCK_FORECAST = {
  crop_name: "Tomato",
  current_mandi_price: 15.00,
  forecast_trend: [
    { date: "26 Aug", price: 15.50, demand_index: 82 },
    { date: "27 Aug", price: 16.80, demand_index: 88 },
    { date: "28 Aug", price: 18.20, demand_index: 95 },
    { date: "29 Aug", price: 19.00, demand_index: 99 },
    { date: "30 Aug", price: 17.50, demand_index: 90 },
    { date: "31 Aug", price: 16.00, demand_index: 80 },
    { date: "01 Sep", price: 15.00, demand_index: 75 }
  ],
  advisory_text: "📈 Demand surging over next 3-4 days (+26% price surge in Pune HoReCa belt). Delay bulk harvest until 29 Aug for maximum profit margin.",
  trend_type: "UPTREND",
  recommended_harvest_date: "2026-08-29"
};

export const INITIAL_AVAILABLE_LOTS = [
  {
    lot_id: "lot_901",
    farmer_id: "f_101",
    farmer_name: "Ramesh Patil (Saswad FPO)",
    crop_name: "Tomato",
    quantity_kg: 500,
    quality_grade: "A",
    price_per_kg: 20.00,
    distance_km: 28.4,
    benchmark_mandi_price: 15.00,
    guaranteed_farmer_payout: 18.00,
    harvest_date: "2026-08-28",
    location: {
      latitude: 18.3489,
      longitude: 74.0312,
      area_name: "Saswad Farm #1, Purandar"
    }
  },
  {
    lot_id: "lot_902",
    farmer_id: "f_102",
    farmer_name: "Suresh Mohite",
    crop_name: "Tomato",
    quantity_kg: 300,
    quality_grade: "B",
    price_per_kg: 18.50,
    distance_km: 31.2,
    benchmark_mandi_price: 14.00,
    guaranteed_farmer_payout: 16.50,
    harvest_date: "2026-08-27",
    location: {
      latitude: 18.3245,
      longitude: 74.0118,
      area_name: "Purandar South Hub"
    }
  },
  {
    lot_id: "lot_903",
    farmer_id: "f_103",
    farmer_name: "Kisan Cooperative #4",
    crop_name: "Onion",
    quantity_kg: 750,
    quality_grade: "A",
    price_per_kg: 30.00,
    distance_km: 35.0,
    benchmark_mandi_price: 22.00,
    guaranteed_farmer_payout: 26.00,
    harvest_date: "2026-08-29",
    location: {
      latitude: 18.2890,
      longitude: 74.0520,
      area_name: "Jejuri Agri Cluster"
    }
  }
];

export const INITIAL_PENDING_ORDERS = [
  {
    order_id: "ord_7701",
    buyer_id: "b_501",
    buyer_name: "Green Leaf Restaurant & Catering",
    dropoff_location: {
      latitude: 18.5018,
      longitude: 73.8636,
      address: "Kothrud, Pune"
    },
    pickups: [
      {
        lot_id: "lot_901",
        farmer_name: "Ramesh Patil",
        crop_name: "Tomato (Grade A)",
        quantity_kg: 500,
        latitude: 18.3489,
        longitude: 74.0312,
        area_name: "Saswad Farm"
      },
      {
        lot_id: "lot_902",
        farmer_name: "Suresh Mohite",
        crop_name: "Tomato (Grade B)",
        quantity_kg: 300,
        latitude: 18.3245,
        longitude: 74.0118,
        area_name: "Purandar Hub"
      }
    ],
    total_quantity_kg: 800,
    total_amount: 16000.00,
    logistics_fee: 1200.00,
    status: "PENDING_DISPATCH",
    payment_status: "ESCROW_LOCKED"
  }
];

export const MOCK_OPTIMIZATION_RESULT = {
  trip_id: "trip_3301",
  total_distance_km: 42.6,
  estimated_fuel_saved_liters: 6.8,
  co2_saved_kg: 18.2,
  cost_saved_percentage: 34.5,
  route_coordinates: [
    [18.3245, 74.0118], // Stop 1: Suresh Mohite (Purandar)
    [18.3489, 74.0312], // Stop 2: Ramesh Patil (Saswad)
    [18.5018, 73.8636]  // Stop 3: Dropoff (Kothrud, Pune)
  ],
  ordered_stops: [
    {
      stop_number: 1,
      type: "PICKUP",
      lot_id: "lot_902",
      name: "Farm 2 - Suresh Mohite",
      crop: "Tomato (Grade B, 300kg)",
      latitude: 18.3245,
      longitude: 74.0118,
      load_after_stop_kg: 300,
      eta: "06:45 AM"
    },
    {
      stop_number: 2,
      type: "PICKUP",
      lot_id: "lot_901",
      name: "Farm 1 - Ramesh Patil",
      crop: "Tomato (Grade A, 500kg)",
      latitude: 18.3489,
      longitude: 74.0312,
      load_after_stop_kg: 800,
      eta: "07:15 AM"
    },
    {
      stop_number: 3,
      type: "DROPOFF",
      name: "Green Leaf Restaurant (Kothrud)",
      address: "Kothrud Central Kitchen, Pune",
      latitude: 18.5018,
      longitude: 73.8636,
      load_after_stop_kg: 0,
      eta: "08:10 AM"
    }
  ]
};
