import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Truck, 
  Compass, 
  MapPin, 
  CheckCircle2, 
  Layers, 
  TrendingDown, 
  Fuel, 
  Clock, 
  Radio, 
  UserCheck, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCw
} from 'lucide-react';
import L from 'leaflet';

export default function AdminLogisticsMap() {
  const { 
    pendingOrders, 
    activeRoute, 
    isOptimizing, 
    runRouteOptimization,
    isDispatching,
    broadcastToDrivers,
    dispatchedDriver,
    setDemoStep
  } = useApp();

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  const [selectedOrder, setSelectedOrder] = useState(pendingOrders[0] || null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center near Pune / Saswad region
      const map = L.map(mapContainerRef.current, {
        center: [18.42, 73.94],
        zoom: 11,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      // Clean up map on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers & Polyline Route whenever activeRoute or selectedOrder changes
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    // 1. Plot Farm Pickups (Green Pins)
    if (selectedOrder?.pickups) {
      selectedOrder.pickups.forEach((pickup, idx) => {
        const farmIcon = L.divIcon({
          className: 'custom-farm-marker',
          html: `
            <div style="background: #16a34a; color: #fff; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; border: 2px solid #fff; box-shadow: 0 0 15px rgba(22, 163, 74, 0.6);">
              P${idx + 1}
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([pickup.latitude, pickup.longitude], { icon: farmIcon })
          .bindPopup(`
            <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
              <strong style="color: #4ade80;">Farm Pickup #${idx + 1}</strong><br/>
              <strong>${pickup.farmer_name || 'Ramesh Patil'}</strong><br/>
              ${pickup.crop_name || 'Tomato'} (${pickup.quantity_kg}kg)<br/>
              <em>${pickup.area_name || 'Saswad'}</em>
            </div>
          `);
        layerGroup.addLayer(marker);
      });
    }

    // 2. Plot Buyer Dropoff (Red/Amber Pin)
    if (selectedOrder?.dropoff_location) {
      const dropIcon = L.divIcon({
        className: 'custom-drop-marker',
        html: `
          <div style="background: #ef4444; color: #fff; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; border: 2px solid #fff; box-shadow: 0 0 15px rgba(239, 68, 68, 0.6);">
            D
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([selectedOrder.dropoff_location.latitude, selectedOrder.dropoff_location.longitude], { icon: dropIcon })
        .bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
            <strong style="color: #f87171;">Buyer Dropoff (Kitchen)</strong><br/>
            <strong>${selectedOrder.buyer_name || 'Green Leaf Restaurant'}</strong><br/>
            ${selectedOrder.dropoff_location.address || 'Kothrud, Pune'}
          </div>
        `);
      layerGroup.addLayer(marker);
    }

    // 3. Draw Optimized Route Polyline if computed
    if (activeRoute?.route_coordinates && activeRoute.route_coordinates.length > 0) {
      const polyline = L.polyline(activeRoute.route_coordinates, {
        color: '#3b82f6',
        weight: 5,
        opacity: 0.85,
        dashArray: '8, 8',
        lineCap: 'round'
      });
      layerGroup.addLayer(polyline);

      // Fit map bounds to show full route
      mapInstanceRef.current.fitBounds(polyline.getBounds(), { padding: [40, 40] });
    }
  }, [activeRoute, selectedOrder]);

  const handleOptimizeClick = async () => {
    const route = await runRouteOptimization(selectedOrder?.order_id || 'ord_7701');
    if (route) {
      setDemoStep(4); // Advance demo pitch step to Driver Broadcast
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl glass-panel border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-blue-500/20 text-blue-400">
              <Compass className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold font-heading text-white">Central Logistics & Dispatch Hub</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
              USP 2: Google OR-Tools Milk-Run Engine
            </span>
          </div>
          <p className="text-slate-400 text-xs md:text-sm">
            Clusters smallholder farm pickups into a single multi-stop vehicle trajectory, reducing dead mileage and cutting logistics cost per kg.
          </p>
        </div>

        {/* Action Button: Optimize Batch */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleOptimizeClick}
            disabled={isOptimizing}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
          >
            {isOptimizing ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Computing Shortest Path (OR-Tools)...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-blue-200" />
                <span>Optimize Pooled Batch</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid: Interactive Map (8 cols) & Sequence / Dispatch Panel (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Leaflet Interactive Map Container (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl glass-panel border border-slate-800 p-2 overflow-hidden shadow-2xl relative h-[520px]">
            {/* Map Canvas */}
            <div ref={mapContainerRef} className="w-full h-full rounded-xl z-0" />

            {/* Map Floating Overlay Badge */}
            <div className="absolute top-4 left-4 z-10 p-3 rounded-xl bg-slate-950/90 border border-slate-800/80 backdrop-blur-md text-xs text-slate-200 space-y-1 shadow-lg max-w-xs pointer-events-none">
              <div className="font-bold text-white flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-400" />
                <span>Pune / Saswad / Purandar Corridor</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Green Pins: Farm Pickups • Red Pin: Bulk Buyer Kitchen
              </div>
            </div>

            {/* Live Route Calculated Pill */}
            {activeRoute && (
              <div className="absolute bottom-4 left-4 right-4 z-10 p-3 rounded-xl bg-blue-950/90 border border-blue-500/50 backdrop-blur-md text-xs flex flex-wrap items-center justify-between gap-3 shadow-xl">
                <div className="flex items-center gap-2 text-blue-200 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Optimized Milk-Run Sequence Active</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="text-white font-bold">{activeRoute.total_distance_km} km Total</span>
                  <span className="text-emerald-400 font-bold">-34.5% Logistics Cost</span>
                </div>
              </div>
            )}
          </div>

          {/* Environmental & Fuel Savings Metrics */}
          {activeRoute && (
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl glass-panel border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400 uppercase">Total Distance</div>
                <div className="text-lg font-extrabold text-white font-mono mt-0.5">
                  {activeRoute.total_distance_km} km
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">vs 65km unpooled</div>
              </div>

              <div className="p-4 rounded-2xl glass-panel border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400 uppercase flex items-center justify-center gap-1">
                  <Fuel className="w-3.5 h-3.5 text-amber-400" />
                  <span>Fuel Saved</span>
                </div>
                <div className="text-lg font-extrabold text-amber-300 font-mono mt-0.5">
                  {activeRoute.estimated_fuel_saved_liters || 6.8} Liters
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Diesel avoided</div>
              </div>

              <div className="p-4 rounded-2xl glass-panel border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400 uppercase flex items-center justify-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Transport Cost</span>
                </div>
                <div className="text-lg font-extrabold text-emerald-400 font-mono mt-0.5">
                  -34.5%
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Direct margin savings</div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Multi-Stop Schedule & Driver Dispatch (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Stops Sequence Timeline */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>Multi-Stop Milk-Run Sequence</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-blue-300 font-mono">
                {activeRoute ? 'OR-Tools Optimized' : 'Pending'}
              </span>
            </div>

            {activeRoute?.ordered_stops ? (
              <div className="space-y-3">
                {activeRoute.ordered_stops.map((stop, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-xl border text-xs relative ${
                      stop.type === 'PICKUP'
                        ? 'bg-slate-900/80 border-emerald-500/30'
                        : 'bg-slate-900/80 border-red-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        stop.type === 'PICKUP' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                      }`}>
                        Stop #{stop.stop_number}: {stop.type}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{stop.eta || '07:00 AM'}</span>
                      </span>
                    </div>

                    <div className="font-semibold text-white mt-1">{stop.name}</div>
                    {stop.crop && <div className="text-[11px] text-slate-400 mt-0.5">{stop.crop}</div>}
                    
                    <div className="text-[10px] text-slate-500 mt-1 flex justify-between border-t border-slate-800/80 pt-1 font-mono">
                      <span>Cumulative Load:</span>
                      <span className="text-slate-300">{stop.load_after_stop_kg} kg / 1000 kg cap</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500 space-y-2">
                <Compass className="w-8 h-8 mx-auto text-slate-600 animate-pulse" />
                <p>Click "Optimize Pooled Batch" to calculate the Google OR-Tools multi-stop route.</p>
              </div>
            )}
          </div>

          {/* Gig Driver Broadcast Simulation Panel */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-amber-400" />
                <span>Gig Fleet Dispatch</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Tata Ace Network</span>
            </div>

            {dispatchedDriver ? (
              <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-xs space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <span>Trip Accepted & Dispatched!</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                    IN_TRANSIT
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1 font-mono text-[11px]">
                  <div className="text-white font-semibold">{dispatchedDriver.name}</div>
                  <div className="text-slate-400">{dispatchedDriver.vehicle_type}</div>
                  <div className="text-amber-400 font-bold">{dispatchedDriver.vehicle_no}</div>
                  <div className="text-emerald-400 pt-1 border-t border-slate-800">
                    Guaranteed Payout: ₹{dispatchedDriver.payout_inr}
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-tight">
                  Turn-by-turn multi-stop coordinates broadcasted to driver mobile terminal.
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Broadcast the computed {activeRoute ? `${activeRoute.total_distance_km}km` : ''} route to available mini-truck owner-operators within the Saswad-Pune corridor.
                </p>

                <button
                  type="button"
                  disabled={!activeRoute || isDispatching}
                  onClick={broadcastToDrivers}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                >
                  {isDispatching ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Broadcasting to Nearby Drivers (Radar)...</span>
                    </>
                  ) : (
                    <>
                      <Radio className="w-4 h-4" />
                      <span>Broadcast to Local Drivers</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
