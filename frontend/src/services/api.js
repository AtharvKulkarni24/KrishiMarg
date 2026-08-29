const BASE_URL = 'http://localhost:8080/api/v1';

export const apiClient = {
  // 1. Farmer Portal: Market Insights (GET /api/v1/farmer/insights?crop=Tomato)
  async getFarmerInsights(crop = 'Tomato') {
    const res = await fetch(`${BASE_URL}/farmer/insights?crop=${encodeURIComponent(crop)}`);
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return await res.json();
  },

  // 2. Farmer Portal: Produce Listing (POST /api/v1/produce)
  async submitProduceListing(payload) {
    const res = await fetch(`${BASE_URL}/farmer/produce`, {
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
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return await res.json();
  },

  // 3. Buyer Marketplace: Search Nearby Produce (GET /api/v1/buyer/search?crop=Tomato&lat=18.5018&lng=73.8636&radius_km=50)
  async searchBuyerProduce(crop = '', lat = 18.5018, lng = 73.8636, radiusKm = 50) {
    const queryParams = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
      radius_km: String(radiusKm)
    });
    if (crop && crop !== 'ALL') queryParams.set('crop', crop);

    const res = await fetch(`${BASE_URL}/buyer/search?${queryParams.toString()}`);
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return await res.json();
  },

  // 4. Buyer Marketplace: Place Order (POST /api/v1/orders)
  async createOrder(payload) {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buyer_id: payload.buyer_id,
        lot_ids: payload.lot_ids,
        dropoff_latitude: Number(payload.dropoff_latitude),
        dropoff_longitude: Number(payload.dropoff_longitude)
      })
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return await res.json();
  },

  // 5. Driver Portal: Available Routes (GET /api/v1/driver/routes?lat=18.4&lng=73.9)
  async getDriverRoutes(lat = 18.4, lng = 73.9) {
    const res = await fetch(`${BASE_URL}/driver/routes?lat=${lat}&lng=${lng}`);
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return await res.json();
  },

  // 6. Driver Portal: Accept Route (POST /api/v1/driver/routes/{route_id}/accept)
  async acceptRoute(routeId, driverId = 'd_901') {
    const res = await fetch(`${BASE_URL}/driver/routes/${routeId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driver_id: driverId })
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return await res.json();
  },

  // 7. Driver Portal: Complete Route (POST /api/v1/driver/routes/{route_id}/complete)
  async completeRoute(routeId) {
    const res = await fetch(`${BASE_URL}/driver/routes/${routeId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return await res.json();
  },

  // 8. Farmer Portal: Update Produce Quantity (PATCH /api/v1/produce/{lot_id})
  async updateProduceLotQuantity(lotId, additionalQuantityKg) {
    const res = await fetch(`${BASE_URL}/farmer/produce/${lotId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ additional_quantity_kg: Number(additionalQuantityKg) })
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return await res.json();
  },

  // 9. Admin Logistics: Trigger Route Optimization (POST /api/v1/logistics/optimize-route)
  async optimizeRoute(orderId = null) {
    const res = await fetch(`${BASE_URL}/logistics/optimize-route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return await res.json();
  },

  // 10. Admin Logistics: Assign Driver (POST /api/v1/admin/routes/{route_id}/assign)
  async assignDriver(routeId, driverId) {
    const res = await fetch(`${BASE_URL}/driver/routes/${routeId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driver_id: driverId })
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return await res.json();
  }
};
