// Mock Data strictly aligned with KrishiMarg Master API & Data Contract

export const MOCK_USERS = [
  {
    user_id: "f_101",
    full_name: "Ramesh Patil",
    role: "FARMER",
    default_lat: 18.3489,
    default_lng: 74.0312
  },
  {
    user_id: "f_102",
    full_name: "Suresh Mohite",
    role: "FARMER",
    default_lat: 18.3245,
    default_lng: 74.0118
  },
  {
    user_id: "b_501",
    full_name: "Green Leaf Restaurant & Mess",
    role: "BUYER",
    default_lat: 18.5018,
    default_lng: 73.8636
  },
  {
    user_id: "d_901",
    full_name: "Aman Sharma",
    role: "DRIVER",
    default_lat: 18.4000,
    default_lng: 73.9000
  }
];

export const MOCK_INSIGHTS = {
  "Tomato": {
    current_mandi_price: 15.00,
    min_price: 12.00,
    max_price: 18.00,
    harvest_suggestion: "Demand is peaking over the next 3 days in the Pune region. Delay bulk harvest until 29 Aug for optimal price realization.",
    ml_7_day_forecast: [
      { date: "26 Aug", price: 15.50 },
      { date: "27 Aug", price: 16.80 },
      { date: "28 Aug", price: 18.20 },
      { date: "29 Aug", price: 19.00 },
      { date: "30 Aug", price: 17.50 },
      { date: "31 Aug", price: 16.00 },
      { date: "01 Sep", price: 15.00 }
    ]
  },
  "Onion": {
    current_mandi_price: 22.00,
    min_price: 18.00,
    max_price: 26.00,
    harvest_suggestion: "Stable price trend across APMC markets. Recommended harvest window: immediate.",
    ml_7_day_forecast: [
      { date: "26 Aug", price: 22.00 },
      { date: "27 Aug", price: 23.00 },
      { date: "28 Aug", price: 24.50 },
      { date: "29 Aug", price: 25.00 },
      { date: "30 Aug", price: 24.00 },
      { date: "31 Aug", price: 23.50 },
      { date: "01 Sep", price: 22.50 }
    ]
  },
  "Potato": {
    current_mandi_price: 18.00,
    min_price: 15.00,
    max_price: 22.00,
    harvest_suggestion: "Supply steady in wholesale channels. Favorable prices expected throughout the week.",
    ml_7_day_forecast: [
      { date: "26 Aug", price: 18.00 },
      { date: "27 Aug", price: 18.50 },
      { date: "28 Aug", price: 19.00 },
      { date: "29 Aug", price: 20.00 },
      { date: "30 Aug", price: 19.50 },
      { date: "31 Aug", price: 19.00 },
      { date: "01 Sep", price: 18.50 }
    ]
  },
  "Cauliflower": {
    current_mandi_price: 20.00,
    min_price: 16.00,
    max_price: 25.00,
    harvest_suggestion: "Shortage indicated in nearby urban markets. Good harvest conditions.",
    ml_7_day_forecast: [
      { date: "26 Aug", price: 20.00 },
      { date: "27 Aug", price: 21.50 },
      { date: "28 Aug", price: 23.00 },
      { date: "29 Aug", price: 24.00 },
      { date: "30 Aug", price: 22.50 },
      { date: "31 Aug", price: 21.00 },
      { date: "01 Sep", price: 20.50 }
    ]
  },
  "Green Chili": {
    current_mandi_price: 45.00,
    min_price: 38.00,
    max_price: 55.00,
    harvest_suggestion: "High market demand. Harvest and list immediately for top returns.",
    ml_7_day_forecast: [
      { date: "26 Aug", price: 45.00 },
      { date: "27 Aug", price: 48.00 },
      { date: "28 Aug", price: 52.00 },
      { date: "29 Aug", price: 54.00 },
      { date: "30 Aug", price: 50.00 },
      { date: "31 Aug", price: 47.00 },
      { date: "01 Sep", price: 46.00 }
    ]
  }
};

export const INITIAL_AVAILABLE_LOTS = [
  {
    lot_id: "lot_901",
    farmer_id: "f_101",
    crop_name: "Tomato",
    quantity_kg: 500,
    price_per_kg: 18.00,
    harvest_date: "2026-08-28",
    distance_km: 28.4,
    latitude: 18.3489,
    longitude: 74.0312,
    status: "AVAILABLE"
  },
  {
    lot_id: "lot_902",
    farmer_id: "f_102",
    crop_name: "Tomato",
    quantity_kg: 300,
    price_per_kg: 18.50,
    harvest_date: "2026-08-27",
    distance_km: 31.2,
    latitude: 18.3245,
    longitude: 74.0118,
    status: "AVAILABLE"
  },
  {
    lot_id: "lot_903",
    farmer_id: "f_101",
    crop_name: "Onion",
    quantity_kg: 750,
    price_per_kg: 26.00,
    harvest_date: "2026-08-29",
    distance_km: 35.0,
    latitude: 18.2890,
    longitude: 74.0520,
    status: "AVAILABLE"
  }
];

export const INITIAL_PENDING_ORDERS = [
  {
    order_id: "ord_7701",
    buyer_id: "b_501",
    lot_ids: ["lot_901", "lot_902"],
    dropoff_latitude: 18.5018,
    dropoff_longitude: 73.8636,
    total_amount: 14550.00,
    status: "PENDING_ROUTE",
    payment_status: "MOCK_SUCCESS"
  }
];

export const INITIAL_ROUTES = [
  {
    route_id: "route_101",
    total_distance_km: 42.6,
    pickup_count: 2,
    dropoff_count: 1,
    estimated_payout: 1200.00,
    route_coordinates: [
      [18.3245, 74.0118], // Stop 1 (Purandar)
      [18.3489, 74.0312], // Stop 2 (Saswad)
      [18.5018, 73.8636]  // Stop 3 (Kothrud Dropoff)
    ],
    ordered_stops: [
      {
        type: "PICKUP",
        lot_id: "lot_902",
        latitude: 18.3245,
        longitude: 74.0118
      },
      {
        type: "PICKUP",
        lot_id: "lot_901",
        latitude: 18.3489,
        longitude: 74.0312
      },
      {
        type: "DROPOFF",
        order_id: "ord_7701",
        latitude: 18.5018,
        longitude: 73.8636
      }
    ]
  }
];
