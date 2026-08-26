import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { apiClient } from '../../services/api';
import EmptyState from '../common/EmptyState';
import { 
  ShieldCheck, 
  Compass, 
  MapPin, 
  CheckCircle2, 
  Layers, 
  TrendingDown, 
  Fuel, 
  Clock, 
  Radio, 
  RotateCw, 
  Sparkles,
  ArrowRight,
  PackageOpen,
  Send,
  AlertCircle,
  Truck,
  Building2,
  Navigation
} from 'lucide-react';
import L from 'leaflet';

export default function AdminLogisticsMap() {
  const { 
    activeRoute, 
    runRouteOptimization, 
    isOptimizing, 
    broadcastToDrivers, 
    isDispatching,
    dispatchedDriver,
    selectRole,
    addToast,
    t 
  } = useApp();

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  const [pendingOrders, setPendingOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState('ord_7701');
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // 1. Fetch pending orders dynamically from GET /api/v1/admin/pending-orders on load
  const loadPendingOrders = useCallback(async () => {
    setIsLoadingOrders(true);
    setFetchError(null);
    try {
      const data = await apiClient.getPendingOrders();
      const orders = data?.pending_orders || [];
      setPendingOrders(orders);
      if (orders.length > 0 && !selectedOrderId) {
        setSelectedOrderId(orders[0].order_id);
      }
    } catch (err) {
      setFetchError(err.message || 'Failed to load pending orders from Java API.');
      addToast(`Error loading orders: ${err.message}`, 'error');
    } finally {
      setIsLoadingOrders(false);
    }
  }, [selectedOrderId, addToast]);

  useEffect(() => {
    loadPendingOrders();
  }, [loadPendingOrders]);

  const currentOrder = pendingOrders.find(o => o.order_id === selectedOrderId) || pendingOrders[0] || null;

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
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

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 300);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 3. Render 🟢 GREEN Farm Markers, 🔴 RED Buyer Dropoff, and 🔵 Route Polyline
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();
    const bounds = [];

    // Render all pending orders or selected order
    const ordersToRender = currentOrder ? [currentOrder] : pendingOrders;

    ordersToRender.forEach((order) => {
      // 🟢 Farm / Pickup Locations (Green Markers)
      if (order.pickups && order.pickups.length > 0) {
        order.pickups.forEach((pickup, idx) => {
          const lat = Number(pickup.latitude);
          const lon = Number(pickup.longitude);
          if (isNaN(lat) || isNaN(lon)) return;

          bounds.push([lat, lon]);

          const farmIcon = L.divIcon({
            className: 'custom-farm-marker',
            html: `
              <div style="background: #0caf3d; color: #ffffff; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 11px; border: 2.5px solid #ffffff; box-shadow: 0 4px 12px rgba(12, 175, 61, 0.45); cursor: pointer;">
                P${idx + 1}
              </div>
            `,
            iconSize: [34, 34],
            iconAnchor: [17, 17]
          });

          const popupContent = `
            <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4; padding: 2px;">
              <strong style="color: #0caf3d; font-size: 13px;">🟢 Farm Pickup #${idx + 1}</strong><br/>
              <strong>Lot ID:</strong> <span style="font-family: monospace; font-weight: bold;">${pickup.lot_id}</span><br/>
              ${pickup.farmer_name ? `<strong>Farmer:</strong> ${pickup.farmer_name}<br/>` : ''}
              ${pickup.crop_name ? `<strong>Crop:</strong> ${pickup.crop_name} (${pickup.quantity_kg || 0} kg)<br/>` : ''}
              <span style="color: #64748b; font-size: 11px;">📍 Coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}</span>
            </div>
          `;

          const marker = L.marker([lat, lon], { icon: farmIcon }).bindPopup(popupContent);
          layerGroup.addLayer(marker);
        });
      }

      // 🔴 Buyer / Drop-off Location (Red Marker)
      if (order.dropoff_location) {
        const lat = Number(order.dropoff_location.latitude);
        const lon = Number(order.dropoff_location.longitude);
        if (!isNaN(lat) && !isNaN(lon)) {
          bounds.push([lat, lon]);

          const dropIcon = L.divIcon({
            className: 'custom-drop-marker',
            html: `
              <div style="background: #e11d48; color: #ffffff; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 11px; border: 2.5px solid #ffffff; box-shadow: 0 4px 12px rgba(225, 29, 72, 0.45); cursor: pointer;">
                D
              </div>
            `,
            iconSize: [34, 34],
            iconAnchor: [17, 17]
          });

          const popupContent = `
            <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4; padding: 2px;">
              <strong style="color: #e11d48; font-size: 13px;">🔴 Buyer Drop-off (Delivery)</strong><br/>
              <strong>Buyer:</strong> ${order.buyer_name || 'Green Leaf Restaurant'}<br/>
              <strong>Order ID:</strong> <span style="font-family: monospace; font-weight: bold;">${order.order_id}</span><br/>
              <strong>Type:</strong> Drop-off Destination<br/>
              <span style="color: #64748b; font-size: 11px;">📍 ${order.dropoff_location.address || `${lat.toFixed(4)}, ${lon.toFixed(4)}`}</span>
            </div>
          `;

          const marker = L.marker([lat, lon], { icon: dropIcon }).bindPopup(popupContent);
          layerGroup.addLayer(marker);
        }
      }
    });

    // 🔵 4. Draw Optimized Route Polyline if activeRoute is computed
    if (activeRoute?.route_coordinates && activeRoute.route_coordinates.length > 0) {
      const polyline = L.polyline(activeRoute.route_coordinates, {
        color: '#0284c7', // Sky Blue Polyline
        weight: 5,
        opacity: 0.9,
        dashArray: '8, 8',
        lineCap: 'round'
      });
      layerGroup.addLayer(polyline);

      mapInstanceRef.current.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    } else if (bounds.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [currentOrder, pendingOrders, activeRoute]);

  // Handle Route Optimization (Calls Java backend POST /api/v1/admin/optimize)
  const handleOptimizeRoute = async (orderId) => {
    setSelectedOrderId(orderId);
    await runRouteOptimization(orderId);
  };

  // Handle Dispatch to Driver
  const handleDispatchDriver = async () => {
    await broadcastToDrivers();
    // After dispatching, give user option to view driver screen
    setTimeout(() => {
      selectRole('driver');
    }, 1200);
  };

  // Summary counts
  const totalOrdersCount = pendingOrders.length;
  const totalPickupsCount = pendingOrders.reduce((acc, o) => acc + (o.pickups?.length || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 w-full">
      
      {/* 1. Admin Header & Logistics Overview Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-blue-900/10 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold font-heading text-emerald-950">
              {t('admin_dashboard_title')}
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-semibold border border-blue-200">
              Admin ID: adm_01
            </span>
          </div>
          <p className="text-slate-600 text-xs md:text-sm">
            {t('admin_dashboard_sub')}
          </p>
        </div>

        {/* Overview Stat Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-[10px] text-slate-500 font-bold uppercase">{t('admin_stat_orders')}</div>
            <div className="text-base font-extrabold text-slate-800 font-mono">{totalOrdersCount}</div>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
            <div className="text-[10px] text-emerald-800 font-bold uppercase">{t('admin_stat_pickups')}</div>
            <div className="text-base font-extrabold text-brand-700 font-mono">{totalPickupsCount}</div>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-center">
            <div className="text-[10px] text-blue-800 font-bold uppercase">{t('admin_stat_opt_distance')}</div>
            <div className="text-base font-extrabold text-blue-700 font-mono">
              {activeRoute ? `${activeRoute.total_distance_km} km` : 'Pending'}
            </div>
          </div>
        </div>
      </div>

      {fetchError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{fetchError}</span>
          </div>
          <button
            onClick={loadPendingOrders}
            className="px-3 py-1 bg-white border border-red-300 rounded-lg font-bold text-red-700 hover:bg-red-50 cursor-pointer"
          >
            Retry Fetch
          </button>
        </div>
      )}

      {/* 2. Interactive Map (Major Component) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-emerald-950 flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-600" />
              <span>{t('admin_map_title')}</span>
            </h3>
            <p className="text-xs text-slate-500">{t('admin_map_sub')}</p>
          </div>

          {/* Map Legend */}
          <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-[#0caf3d] inline-block" />
              <span>{t('admin_legend_pickup')}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-[#e11d48] inline-block" />
              <span>{t('admin_legend_dropoff')}</span>
            </span>
            {activeRoute && (
              <span className="flex items-center gap-1 text-blue-700">
                <span className="w-3 h-3 rounded-full bg-[#0284c7] inline-block" />
                <span>{t('admin_legend_route')}</span>
              </span>
            )}
          </div>
        </div>

        {/* Map Canvas Card */}
        <div className="rounded-2xl bg-white border border-emerald-900/10 p-2 overflow-hidden shadow-sm relative h-[480px] w-full">
          <div ref={mapContainerRef} className="w-full h-full rounded-xl z-0" />

          {/* Floating Map Legend (Mobile) */}
          <div className="sm:hidden absolute top-4 left-4 z-10 p-2.5 rounded-xl bg-white/95 border border-slate-200 backdrop-blur-md text-[11px] font-semibold text-slate-700 space-y-1 shadow-md">
            <div>{t('admin_legend_pickup')}</div>
            <div>{t('admin_legend_dropoff')}</div>
          </div>

          {/* Live Optimized Polyline Badge Overlay */}
          {activeRoute && (
            <div className="absolute bottom-4 left-4 right-4 z-10 p-3.5 rounded-xl bg-white/95 border border-blue-300 backdrop-blur-md text-xs flex flex-wrap items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-2 text-blue-900 font-bold">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{t('admin_route_active')}</span>
              </div>
              <div className="flex items-center gap-4 font-mono text-xs">
                <span className="text-slate-900 font-extrabold">{t('admin_total_distance_display', { dist: activeRoute.total_distance_km })}</span>
                <span className="text-brand-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {t('admin_cost_saved_badge')}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Pending Orders Section & Route Optimization Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Pending Orders List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-emerald-950 flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-600" />
                <span>{t('admin_pending_orders_heading')}</span>
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">{t('admin_pending_orders_sub')}</span>
            </div>
            <button
              onClick={loadPendingOrders}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              title="Refresh Orders"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {isLoadingOrders ? (
            <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-2">
              <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Fetching pending orders from GET /api/v1/admin/pending-orders...</p>
            </div>
          ) : pendingOrders.length === 0 ? (
            <EmptyState
              icon={PackageOpen}
              title={t('admin_no_orders_title')}
              description={t('admin_no_orders_desc')}
              actionLabel={t('admin_no_orders_btn')}
              onAction={() => selectRole('buyer')}
            />
          ) : (
            <div className="space-y-4">
              {pendingOrders.map((order) => {
                const isSelected = order.order_id === selectedOrderId;
                const pickups = order.pickups || [];
                const dropoff = order.dropoff_location || {};

                return (
                  <div
                    key={order.order_id}
                    className={`p-5 rounded-2xl bg-white border transition-all shadow-sm ${
                      isSelected
                        ? 'border-blue-500 ring-2 ring-blue-400/20'
                        : 'border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 font-mono">
                          Order #{order.order_id}
                        </span>
                        <span className="text-xs text-slate-600 font-medium">
                          {order.status || 'PENDING_DISPATCH'}
                        </span>
                      </div>

                      {activeRoute && isSelected && (
                        <span className="text-[11px] font-bold text-brand-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-brand-600" />
                          <span>{t('admin_optimized_tag')}</span>
                        </span>
                      )}
                    </div>

                    <div className="space-y-2.5 text-xs text-slate-700 mb-4">
                      {/* Buyer Information */}
                      <div className="flex items-start gap-2">
                        <Building2 className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900">Buyer:</strong> {order.buyer_name || 'Green Leaf Restaurant'}
                        </div>
                      </div>

                      {/* Pickups List */}
                      <div className="flex items-start gap-2">
                        <Truck className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900">{t('admin_order_card_pickups')} ({pickups.length}):</strong>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {pickups.map((p, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 font-mono text-[11px] text-emerald-900 font-semibold">
                                {p.lot_id} {p.crop_name ? `(${p.crop_name})` : ''}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Dropoff Coordinates */}
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900">{t('admin_order_card_dropoff')}:</strong> {dropoff.address || `${dropoff.latitude}, ${dropoff.longitude}`}
                        </div>
                      </div>
                    </div>

                    {/* Optimize Route Button */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        disabled={isOptimizing}
                        onClick={() => handleOptimizeRoute(order.order_id)}
                        className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-sm shadow-blue-600/20 flex items-center gap-2 cursor-pointer active:scale-98"
                      >
                        {isOptimizing && isSelected ? (
                          <>
                            <RotateCw className="w-3.5 h-3.5 animate-spin" />
                            <span>{t('admin_btn_optimizing_order')}</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{t('admin_btn_optimize_order')}</span>
                          </>
                        )}
                      </button>

                      {activeRoute && isSelected && (
                        <button
                          type="button"
                          onClick={handleDispatchDriver}
                          disabled={isDispatching}
                          className="py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isDispatching ? 'Dispatching...' : t('admin_btn_assign_driver')}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Optimized Route Summary & Ordered Stops (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-emerald-900/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-600" />
                <span>{t('admin_route_result_heading')}</span>
              </h3>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 font-mono font-bold border border-blue-200">
                {activeRoute ? 'OR-Tools VRP Solver' : 'Awaiting Calculation'}
              </span>
            </div>

            {activeRoute ? (
              <div className="space-y-4">
                {/* Distance & Savings Bar */}
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="text-[11px] text-blue-900/70 font-semibold">{t('admin_total_distance_label')}</div>
                    <div className="text-lg font-extrabold text-blue-950 font-mono">
                      {activeRoute.total_distance_km} km
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-brand-800 font-bold uppercase">{t('admin_cost_saved_badge')}</div>
                    <div className="text-xs font-bold text-brand-700 mt-0.5">
                      {t('admin_fuel_saved_badge', { liters: activeRoute.estimated_fuel_saved_liters || 6.8 })}
                    </div>
                  </div>
                </div>

                {/* Ordered Stops List */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 mb-2">{t('admin_ordered_stops_heading')}:</h4>
                  <div className="space-y-2.5">
                    {activeRoute.ordered_stops?.map((stop, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                          stop.type === 'PICKUP'
                            ? 'bg-emerald-50/60 border-emerald-200'
                            : 'bg-rose-50/60 border-rose-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] ${
                            stop.type === 'PICKUP' ? 'bg-brand-500 text-white' : 'bg-rose-600 text-white'
                          }`}>
                            {idx + 1}
                          </span>
                          <div>
                            <div className="font-bold text-slate-900">
                              {stop.type === 'PICKUP'
                                ? t('admin_stop_pickup', { lot_id: stop.lot_id || `P${idx+1}` })
                                : t('admin_stop_dropoff', { buyer: currentOrder?.buyer_name || 'Buyer Kitchen' })
                              }
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {stop.name || stop.address || (stop.type === 'PICKUP' ? 'Farm Location' : 'Drop-off')}
                            </div>
                          </div>
                        </div>

                        {stop.eta && (
                          <span className="text-[11px] text-slate-600 font-mono flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{stop.eta}</span>
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Driver Dispatch Action */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleDispatchDriver}
                    disabled={isDispatching}
                    className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isDispatching ? 'Broadcasting Route...' : t('admin_btn_assign_driver')}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500 space-y-2">
                <Compass className="w-8 h-8 mx-auto text-slate-400 animate-pulse" />
                <p>Click "Optimize Route" on any pending order to calculate the Google OR-Tools shortest path and ordered stops.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
