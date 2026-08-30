import { MOCK_INSIGHTS, INITIAL_AVAILABLE_LOTS, INITIAL_ROUTES } from './mockData';

const BASE_URL = 'http://localhost:8080/api/v1';

// Helper to gracefully fallback to mock data when backend fails or endpoints are missing
async function fetchWithFallback(url, options, mockData) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      console.warn(`API returned ${res.status} for ${url}, falling back to mock data...`);
      return mockData;
    }
    return await res.json();
  } catch (error) {
    console.warn(`Network error for ${url}, falling back to mock data...`);
    return mockData;
  }
}

export const apiClient = {
  // 1. Farmer Portal: Market Insights
  async getFarmerInsights(crop = 'Tomato') {
    return fetchWithFallback(
      `${BASE_URL}/farmer/insights?crop=${encodeURIComponent(crop)}`,
      { method: 'GET' },
      MOCK_INSIGHTS[crop] || MOCK_INSIGHTS['Tomato']
    );
  },

  // 2. Farmer Portal: Produce Listing
  async submitProduceListing(payload) {
    return fetchWithFallback(
      `${BASE_URL}/farmer/produce`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmer_id: payload.farmer_id,
          crop_name: payload.crop_name,
          quantity_kg: Number(payload.quantity_kg),
          price_per_kg: Number(payload.price_per_kg),
          harvest_date: payload.harvest_date,
          latitude: Number(payload.latitude),
          longitude: Number(payload.longitude)
        })
      },
      { lot_id: `lot_mock_${Math.floor(Math.random() * 1000)}`, status: "LISTED" }
    );
  },

  // 3. Buyer Marketplace: Search Nearby Produce
  async searchBuyerProduce(crop = '', lat = 18.5018, lng = 73.8636, radiusKm = 50) {
    const queryParams = new URLSearchParams({ lat: String(lat), lng: String(lng), radius_km: String(radiusKm) });
    if (crop && crop !== 'ALL') queryParams.set('crop', crop);

    return fetchWithFallback(
      `${BASE_URL}/buyer/search?${queryParams.toString()}`,
      { method: 'GET' },
      { available_lots: INITIAL_AVAILABLE_LOTS.filter(l => (crop && crop !== 'ALL') ? l.crop_name === crop : true) }
    );
  },

  // 4. Buyer Marketplace: Place Order
  async createOrder(payload) {
    return fetchWithFallback(
      `${BASE_URL}/orders`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyer_id: payload.buyer_id,
          lot_ids: payload.lot_ids,
          dropoff_latitude: Number(payload.dropoff_latitude),
          dropoff_longitude: Number(payload.dropoff_longitude)
        })
      },
      { order_id: `ord_mock_${Math.floor(Math.random() * 1000)}`, status: "PENDING_ROUTE", payment_status: "MOCK_SUCCESS", total_amount: 5000 }
    );
  },

  // 5. Driver Portal: Available Routes
  async getDriverRoutes(lat = 18.4, lng = 73.9) {
    return fetchWithFallback(
      `${BASE_URL}/driver/routes?lat=${lat}&lng=${lng}`,
      { method: 'GET' },
      { available_routes: INITIAL_ROUTES }
    );
  },

  // 6. Driver Portal: Accept Route
  async acceptRoute(routeId, driverId = 'd_901') {
    return fetchWithFallback(
      `${BASE_URL}/driver/routes/${routeId}/accept`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driver_id: driverId })
      },
      { status: "ACCEPTED" }
    );
  },

  // 7. Driver Portal: Complete Route
  async completeRoute(routeId) {
    return fetchWithFallback(
      `${BASE_URL}/driver/routes/${routeId}/complete`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { status: "COMPLETED", payout_status: "MOCK_ESCROW_RELEASED" }
    );
  },

  // 8. Farmer Portal: Update Produce Quantity
  async updateProduceLotQuantity(lotId, additionalQuantityKg) {
    return fetchWithFallback(
      `${BASE_URL}/farmer/produce/${lotId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ additional_quantity_kg: Number(additionalQuantityKg) })
      },
      { lot_id: lotId, status: "UPDATED" }
    );
  },

  // 9. Admin Logistics: Trigger Route Optimization
  async optimizeRoute(orderId = null) {
    return fetchWithFallback(
      `${BASE_URL}/logistics/optimize-route`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { status: "OPTIMIZED", route: INITIAL_ROUTES[0] }
    );
  },

  // 10. Admin Logistics: Assign Driver
  async assignDriver(routeId, driverId) {
    return fetchWithFallback(
      `${BASE_URL}/driver/routes/${routeId}/accept`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driver_id: driverId })
      },
      { status: "ASSIGNED", driver_id: driverId }
    );
  }
};
