import { 
  MOCK_FORECAST, 
  INITIAL_AVAILABLE_LOTS, 
  INITIAL_PENDING_ORDERS, 
  MOCK_OPTIMIZATION_RESULT, 
  MOCK_CROPS_BENCHMARK 
} from './mockData';

const JAVA_BASE_URL = 'http://localhost:8080/api/v1';

export const apiClient = {
  // Mode flag: controlled by UI toggle
  useMock: true,

  setMockMode(enabled) {
    this.useMock = enabled;
  },

  // 1. Farmer Supply Portal: Submit Listing (POST /api/v1/produce)
  async submitProduceListing(payload) {
    if (this.useMock) {
      await new Promise(r => setTimeout(r, 600)); // simulate network
      const benchmark = MOCK_CROPS_BENCHMARK[payload.crop_name] || { mandi_price: 15.00, fair_payout: 18.00, buyer_price: 20.00 };
      return {
        lot_id: `lot_${Math.floor(100 + Math.random() * 900)}`,
        status: "LISTED",
        benchmark_mandi_price: benchmark.mandi_price,
        guaranteed_payout: benchmark.fair_payout,
        buyer_retail_price: benchmark.buyer_price,
        crop_name: payload.crop_name,
        quantity_kg: payload.quantity_kg,
        quality_grade: payload.quality_grade,
        farmer_id: payload.farmer_id || "f_101",
        location: payload.location,
        created_at: new Date().toISOString()
      };
    }

    const res = await fetch(`${JAVA_BASE_URL}/produce`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Java API Error: ${res.statusText}`);
    return await res.json();
  },

  // 2. Farmer Supply Portal: Fetch Price Forecast (GET /api/v1/forecast?crop=...)
  async getPriceForecast(cropName = 'Tomato') {
    if (this.useMock) {
      await new Promise(r => setTimeout(r, 400));
      return {
        ...MOCK_FORECAST,
        crop_name: cropName
      };
    }

    const res = await fetch(`${JAVA_BASE_URL}/forecast?crop=${encodeURIComponent(cropName)}`);
    if (!res.ok) throw new Error(`Java API Error: ${res.statusText}`);
    return await res.json();
  },

  // 3. Buyer Marketplace: Get Nearby Available Produce (GET /api/v1/produce/nearby)
  async getNearbyProduce(lat = 18.5018, lon = 73.8636, radiusKm = 50) {
    if (this.useMock) {
      await new Promise(r => setTimeout(r, 350));
      return {
        available_lots: INITIAL_AVAILABLE_LOTS
      };
    }

    const res = await fetch(`${JAVA_BASE_URL}/produce/nearby?lat=${lat}&lon=${lon}&radius_km=${radiusKm}`);
    if (!res.ok) throw new Error(`Java API Error: ${res.statusText}`);
    return await res.json();
  },

  // 4. Buyer Marketplace: Place Order (POST /api/v1/orders)
  async placeOrder(payload) {
    if (this.useMock) {
      await new Promise(r => setTimeout(r, 700));
      return {
        order_id: `ord_${Math.floor(1000 + Math.random() * 9000)}`,
        status: "PENDING_DISPATCH",
        payment_status: "ESCROW_LOCKED",
        total_amount: payload.total_amount || 16000.00
      };
    }

    const res = await fetch(`${JAVA_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Java API Error: ${res.statusText}`);
    return await res.json();
  },

  // 5. Admin Logistics: Fetch Pending Orders (GET /api/v1/admin/pending-orders)
  async getPendingOrders() {
    if (this.useMock) {
      await new Promise(r => setTimeout(r, 300));
      return {
        pending_orders: INITIAL_PENDING_ORDERS
      };
    }

    const res = await fetch(`${JAVA_BASE_URL}/admin/pending-orders`);
    if (!res.ok) throw new Error(`Java API Error: ${res.statusText}`);
    return await res.json();
  },

  // 6. Admin Logistics: Trigger Route Optimization (POST /api/v1/admin/optimize)
  async optimizeRoute(orderId = 'ord_7701') {
    if (this.useMock) {
      await new Promise(r => setTimeout(r, 900));
      return MOCK_OPTIMIZATION_RESULT;
    }

    const res = await fetch(`${JAVA_BASE_URL}/admin/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId })
    });
    if (!res.ok) throw new Error(`Java API Error: ${res.statusText}`);
    return await res.json();
  }
};
