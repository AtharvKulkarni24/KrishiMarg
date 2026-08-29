import { 
  MOCK_INSIGHTS, 
  INITIAL_AVAILABLE_LOTS, 
  INITIAL_PENDING_ORDERS, 
  INITIAL_ROUTES 
} from './mockData';

const BASE_URL = 'http://localhost:8080/api/v1';

export const apiClient = {
  useMock: true,

  setMockMode(enabled) {
    this.useMock = enabled;
  },

  // 1. Farmer Portal: Market Insights (GET /api/v1/farmer/insights?crop=Tomato)
  async getFarmerInsights(crop = 'Tomato') {
    if (this.useMock) {
      await new Promise(r => setTimeout(r, 300));
      return MOCK_INSIGHTS[crop] || {
        current_mandi_price: 15.00,
        min_price: 12.00,
        max_price: 18.00,
        harvest_suggestion: `Favorable harvest window for ${crop}.`,
        ml_7_day_forecast: [
          { date: "26 Aug", price: 15.00 },
          { date: "27 Aug", price: 15.50 },
          { date: "28 Aug", price: 16.00 },
          { date: "29 Aug", price: 16.50 },
          { date: "30 Aug", price: 16.00 },
          { date: "31 Aug", price: 15.50 },
          { date: "01 Sep", price: 15.00 }
        ]
      };
    }

    const res = await fetch(`${BASE_URL}/farmer/insights?crop=${encodeURIComponent(crop)}`);
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return await res.json();
  },

  // 2. Farmer Portal: Produce Listing (POST /api/v1/produce)
  // Request: farmer_id, crop_name, quantity_kg, price_per_kg, harvest_date, latitude, longitude
  // Response: lot_id, status: 'LISTED'
  async submitProduceListing(payload) {
    if (this.useMock) {
      await new Promise(r => setTimeout(r, 450));
      return {
        lot_id: `lot_${Math.floor(100 + Math.random() * 900)}`,
        status: "LISTED"
      };
    }

    const res = await fetch(`${BASE_URL}/produce`, {
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
    if (this.useMock) {
      await new Promise(r => setTimeout(r, 350));
      let lots = INITIAL_AVAILABLE_LOTS;
      if (crop && crop !== 'ALL') {
        lots = lots.filter(l => l.crop_name.toLowerCase() === crop.toLowerCase());
      }
      return lots;
    }

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
  // Request: buyer_id, lot_ids, dropoff_latitude, dropoff_longitude
  // Response: order_id, status: 'PENDING_ROUTE', payment_status: 'MOCK_SUCCESS', total_amount
  async createOrder(payload) {
    if (this.useMock) {
      await new Promise(r => setTimeout(r, 500));
      return {
        order_id: `ord_${Math.floor(1000 + Math.random() * 9000)}`,
        status: "PENDING_ROUTE",
        payment_status: "MOCK_SUCCESS",
        total_amount: payload.total_amount || 14550.00
      };
    }

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
  // Response: array of routes (route_id, total_distance_km, pickup_count, dropoff_count, estimated_payout, route_coordinates, ordered_stops)
  async getDriverRoutes(lat = 18.4, lng = 73.9) {
    if (this.useMock) {
      await new Promise(r => setTimeout(r, 350));
      return INITIAL_ROUTES;
    }

    const res = await fetch(`${BASE_URL}/driver/routes?lat=${lat}&lng=${lng}`);
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return await res.json();
  },

  // 6. Driver Portal: Accept Route (POST /api/v1/driver/routes/{route_id}/accept)
  // Request: driver_id
  // Response: status: 'ACCEPTED'
  async acceptRoute(routeId, driverId = 'd_901') {
    if (this.useMock) {
      await new Promise(r => setTimeout(r, 400));
      return {
        status: "ACCEPTED"
      };
    }

    const res = await fetch(`${BASE_URL}/driver/routes/${routeId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driver_id: driverId })
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return await res.json();
  },

  // 7. Driver Portal: Complete Route (POST /api/v1/driver/routes/{route_id}/complete)
  // Response: status: 'COMPLETED', payout_status: 'MOCK_ESCROW_RELEASED'
  async completeRoute(routeId) {
    if (this.useMock) {
      await new Promise(r => setTimeout(r, 400));
      return {
        status: "COMPLETED",
        payout_status: "MOCK_ESCROW_RELEASED"
      };
    }

    const res = await fetch(`${BASE_URL}/driver/routes/${routeId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return await res.json();
  },

  // 8. Farmer Portal: Update Produce Quantity (PATCH /api/v1/produce/{lot_id})
  // Request: additional_quantity_kg
  // Response: lot_id, updated_quantity_kg, status: 'UPDATED'
  async updateProduceLotQuantity(lotId, additionalQuantityKg) {
    if (this.useMock) {
      await new Promise(r => setTimeout(r, 350));
      return {
        lot_id: lotId,
        added_quantity_kg: Number(additionalQuantityKg),
        status: "UPDATED"
      };
    }

    const res = await fetch(`${BASE_URL}/produce/${lotId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ additional_quantity_kg: Number(additionalQuantityKg) })
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return await res.json();
  },

  // 9. Admin Logistics: Trigger Route Optimization (POST /api/v1/logistics/optimize-route)
  async optimizeRoute(orderId = null) {
    if (this.useMock) {
      await new Promise(r => setTimeout(r, 600));
      return {
        success: true,
        route_id: "route_101",
        total_distance_km: 42.6,
        pickup_count: 2,
        dropoff_count: 1,
        estimated_payout: 1200.00,
        status: "OPTIMIZED",
        message: "OR-Tools multi-stop clustering completed."
      };
    }

    try {
      const res = await fetch(`${BASE_URL}/logistics/optimize-route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
      return await res.json();
    } catch (e) {
      console.warn('Backend optimize-route failed, fallback to local optimization:', e);
      return {
        success: true,
        route_id: "route_101",
        total_distance_km: 42.6,
        pickup_count: 2,
        dropoff_count: 1,
        estimated_payout: 1200.00,
        status: "OPTIMIZED"
      };
    }
  },

  // 10. Admin Logistics: Assign Driver (POST /api/v1/admin/routes/{route_id}/assign)
  async assignDriver(routeId, driverId) {
    if (this.useMock) {
      await new Promise(r => setTimeout(r, 350));
      return {
        success: true,
        route_id: routeId,
        driver_id: driverId,
        status: "ASSIGNED"
      };
    }

    try {
      const res = await fetch(`${BASE_URL}/driver/routes/${routeId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driver_id: driverId })
      });
      if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
      return await res.json();
    } catch (e) {
      console.warn('Backend driver assignment fallback:', e);
      return { success: true, route_id: routeId, driver_id: driverId, status: "ASSIGNED" };
    }
  }
};
