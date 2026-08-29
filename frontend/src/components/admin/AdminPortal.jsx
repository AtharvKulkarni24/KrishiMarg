import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { MOCK_USERS } from '../../services/mockData';
import { 
  ShieldCheck, 
  Package, 
  Truck, 
  Sprout, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  UserCheck,
  Star,
  Phone,
  Check,
  ExternalLink,
  Layers,
  ChevronRight,
  X,
  Sparkles,
  Navigation,
  Calendar,
  Zap,
  Radio
} from 'lucide-react';
import L from 'leaflet';
import OrderStatusChart from './OrderStatusChart';
import ProduceVolumeChart from './ProduceVolumeChart';

export default function AdminPortal() {
  const { 
    pendingOrders, 
    routes, 
    availableLots, 
    drivers,
    selectedAdminOrderId,
    setSelectedAdminOrderId,
    optimizeRouteForOrder,
    assignDriverToRoute,
    selectRole, 
    addToast,
    language,
    t 
  } = useApp();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'routes' | 'lots' | 'drivers'
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedRouteForAssign, setSelectedRouteForAssign] = useState(null);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  // Active selected order
  const activeOrder = useMemo(() => {
    return pendingOrders.find(o => o.order_id === selectedAdminOrderId) || pendingOrders[0] || null;
  }, [pendingOrders, selectedAdminOrderId]);

  // Corresponding route for active order
  const activeOrderRoute = useMemo(() => {
    if (!activeOrder) return routes[0] || null;
    return routes.find(r => r.order_id === activeOrder.order_id || r.route_id === 'route_101') || routes[0] || null;
  }, [routes, activeOrder]);

  // Helper to format 2-digit numbers
  const formatStatNum = (n) => String(n).padStart(2, '0');

  // Helper to resolve farmer name
  const getFarmerName = (farmerId) => {
    const user = MOCK_USERS.find(u => u.user_id === farmerId);
    return user ? user.full_name : (farmerId === 'f_102' ? 'Suresh Mohite' : 'Ramesh Patil');
  };

  // Helper to resolve delivery slot display
  const getDeliverySlotDisplay = (slot) => {
    if (!slot) return 'Tomorrow • 9 AM – 12 PM';
    if (typeof slot === 'string') return slot;
    return `${slot.label || 'Tomorrow'} • ${slot.time_range || '9 AM – 12 PM'}`;
  };

  // 1. Initialize Leaflet Map
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

  // 2. Render Markers, Popups, and Routes on Map whenever activeOrder or routes change
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();
    const bounds = [];

    // A. Render Farm Pickup Markers for Active Order (or all available lots if none)
    const activeLotIds = activeOrder?.lot_ids || ['lot_901', 'lot_902'];
    const activePickups = availableLots.filter(l => activeLotIds.includes(l.lot_id));

    activePickups.forEach((lot, idx) => {
      const lat = Number(lot.latitude);
      const lon = Number(lot.longitude);
      if (isNaN(lat) || isNaN(lon)) return;

      bounds.push([lat, lon]);

      const pickupIcon = L.divIcon({
        className: 'custom-admin-marker',
        html: `
          <div style="position: relative; display: flex; items-center; justify-content: center;">
            <div style="background: #0caf3d; color: #ffffff; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 11px; border: 2.5px solid #ffffff; box-shadow: 0 4px 10px rgba(12,175,61,0.4); z-index: 10; cursor: pointer;">
              P${idx + 1}
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const farmerName = getFarmerName(lot.farmer_id);
      const popupHtml = `
        <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4; padding: 2px;">
          <div style="color: #0caf3d; font-weight: 800; font-size: 13px; margin-bottom: 2px;">
            🟢 ${t('admin_popup_farm_pickup')} (Stop ${idx + 1})
          </div>
          <div><strong>${lot.crop_name}</strong> • <span style="font-weight: 700; color: #0f172a;">${lot.quantity_kg} kg</span></div>
          <div style="color: #475569; font-size: 11px;">👨‍🌾 ${farmerName} (Lot #${lot.lot_id})</div>
          <div style="color: #64748b; font-size: 10.5px; margin-top: 2px;">📍 Saswad/Purandar (${lat.toFixed(4)}, ${lon.toFixed(4)})</div>
        </div>
      `;

      const marker = L.marker([lat, lon], { icon: pickupIcon }).bindPopup(popupHtml);
      layerGroup.addLayer(marker);
    });

    // B. Render Buyer Drop-off Marker for Active Order
    if (activeOrder) {
      const dropLat = Number(activeOrder.dropoff_latitude || 18.5018);
      const dropLon = Number(activeOrder.dropoff_longitude || 73.8636);

      if (!isNaN(dropLat) && !isNaN(dropLon)) {
        bounds.push([dropLat, dropLon]);

        const dropoffIcon = L.divIcon({
          className: 'custom-admin-marker',
          html: `
            <div style="position: relative; display: flex; items-center; justify-content: center;">
              <div style="background: #e11d48; color: #ffffff; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 11px; border: 2.5px solid #ffffff; box-shadow: 0 4px 10px rgba(225,29,72,0.4); z-index: 10; cursor: pointer;">
                D
              </div>
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });

        const slotStr = getDeliverySlotDisplay(activeOrder.delivery_slot);
        const dropoffHtml = `
          <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4; padding: 2px;">
            <div style="color: #e11d48; font-weight: 800; font-size: 13px; margin-bottom: 2px;">
              🔴 ${t('admin_popup_buyer_dropoff')}
            </div>
            <div><strong>${activeOrder.buyer_name || 'Green Leaf Restaurant & Mess'}</strong></div>
            <div style="color: #475569; font-size: 11px;">📦 Order #${activeOrder.order_id} • <strong>${activeOrder.total_volume_kg || 800} kg</strong></div>
            <div style="color: #d97706; font-size: 11px; font-weight: 600; margin-top: 2px;">⏰ ${slotStr}</div>
            <div style="color: #64748b; font-size: 10.5px;">📍 Kothrud Central, Pune (${dropLat.toFixed(4)}, ${dropLon.toFixed(4)})</div>
          </div>
        `;

        const dropMarker = L.marker([dropLat, dropLon], { icon: dropoffIcon }).bindPopup(dropoffHtml);
        layerGroup.addLayer(dropMarker);
      }
    }

    // C. Render Polyline if route exists
    if (activeOrderRoute?.route_coordinates && activeOrderRoute.route_coordinates.length > 0) {
      const polyline = L.polyline(activeOrderRoute.route_coordinates, {
        color: '#0284c7',
        weight: 5,
        opacity: 0.9,
        dashArray: '8, 8',
        lineCap: 'round'
      });
      layerGroup.addLayer(polyline);

      mapInstanceRef.current.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    } else if (bounds.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [activeOrder, activeOrderRoute, availableLots, t]);

  // Handler: Optimize Route
  const handleTriggerOptimization = async (orderId) => {
    setIsOptimizing(true);
    await optimizeRouteForOrder(orderId || activeOrder?.order_id);
    setIsOptimizing(false);
  };

  // Handler: Open Assign Modal
  const handleOpenAssignModal = (route) => {
    setSelectedRouteForAssign(route || activeOrderRoute || routes[0]);
    setIsAssignModalOpen(true);
  };

  // Handler: Confirm Assign Driver
  const handleConfirmAssign = async (driverId) => {
    if (!selectedRouteForAssign) return;
    await assignDriverToRoute(selectedRouteForAssign.route_id, driverId);
    setIsAssignModalOpen(false);
  };

  // Handler: Select order from table/card
  const handleSelectOrder = (orderId) => {
    setSelectedAdminOrderId(orderId);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
    }
  };

  // Compute live counts
  const ordersAwaitingRoutingCount = pendingOrders.filter(o => o.status === 'PENDING_ROUTE').length || 1;
  const activeDeliveriesCount = routes.filter(r => r.status === 'OPTIMIZED' || r.status === 'ASSIGNED' || r.status === 'ACCEPTED').length || 1;
  const availableLotsCount = availableLots.length;
  const completedTodayCount = 0;

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
      
      {/* 1. Header & Live Indicator */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-emerald-900/10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-50/40 rounded-full blur-3xl pointer-events-none -z-0" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold uppercase tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>{t('admin_badge')}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                <Radio className="w-3 h-3 text-brand-600 animate-pulse" />
                <span>{t('admin_live_feed')}</span>
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-emerald-950">
              {t('admin_portal_title')}
            </h1>
            
            <p className="text-xs md:text-sm text-slate-600 max-w-2xl font-normal leading-relaxed">
              {t('admin_portal_sub')}
            </p>
          </div>

          {/* Quick Trigger Button */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => handleTriggerOptimization(activeOrder?.order_id)}
              disabled={isOptimizing}
              className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:bg-emerald-300 text-white font-bold text-xs shadow-sm shadow-brand-500/20 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isOptimizing ? 'animate-spin' : ''}`} />
              <span>{isOptimizing ? t('admin_btn_optimizing') : t('admin_btn_optimize')}</span>
            </button>
          </div>
        </div>

        {/* 2. Needs Attention Section */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
              </div>
              <span className="font-extrabold uppercase tracking-wide text-amber-950">
                {t('admin_alerts_title')}:
              </span>
            </div>

            <div className="flex items-center gap-4 flex-wrap text-[11px] font-medium text-slate-700">
              <span className="flex items-center gap-1 text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                <strong>1 Order Awaiting Routing:</strong> #{activeOrder?.order_id || 'ord_7701'} ({activeOrder?.total_volume_kg || 800} kg)
              </span>

              <span className="flex items-center gap-1 text-amber-900 bg-amber-100/60 px-2 py-0.5 rounded-md border border-amber-200">
                <Clock className="w-3 h-3 text-amber-700" />
                <strong>Delivery Slot:</strong> {getDeliverySlotDisplay(activeOrder?.delivery_slot)}
              </span>

              <span className="flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <Sprout className="w-3 h-3 text-brand-600" />
                <strong>3 Farm Lots</strong> Available
              </span>
            </div>
          </div>
        </div>

        {/* 3. Four Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-5">
          {/* Stat 1 */}
          <div className="p-4 rounded-2xl bg-white border border-emerald-900/10 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {t('admin_stat_pending_orders')}
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950 font-heading mt-2">
              {formatStatNum(ordersAwaitingRoutingCount)}
            </div>
          </div>

          {/* Stat 2 */}
          <div className="p-4 rounded-2xl bg-white border border-emerald-900/10 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {t('admin_stat_active_routes')}
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-brand-600 font-heading mt-2">
              {formatStatNum(activeDeliveriesCount)}
            </div>
          </div>

          {/* Stat 3 */}
          <div className="p-4 rounded-2xl bg-white border border-emerald-900/10 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {t('admin_stat_available_lots')}
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950 font-heading mt-2">
              {formatStatNum(availableLotsCount)}
            </div>
          </div>

          {/* Stat 4 */}
          <div className="p-4 rounded-2xl bg-white border border-emerald-900/10 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {t('admin_stat_completed_trips')}
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-700 font-heading mt-2">
              {formatStatNum(completedTodayCount)}
            </div>
          </div>
        </div>

      </div>

      {/* 4. Main Section: Interactive Leaflet Map + Selected Order & Route Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Leaflet Map (Col span 7 on large desktop) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 border border-emerald-900/10 shadow-sm space-y-3 flex flex-col">
          
          {/* Map Header & Legend */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold font-heading text-emerald-950 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-brand-600" />
                <span>{t('admin_map_title')}</span>
              </h2>
              <p className="text-[11px] text-slate-500">
                {t('admin_map_subtitle')}
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-[11px] font-semibold flex-wrap">
              <span className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                <span>{t('admin_legend_farm')}</span>
              </span>

              <span className="flex items-center gap-1.5 text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                <span>{t('admin_legend_buyer')}</span>
              </span>

              <span className="flex items-center gap-1.5 text-sky-800 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                <span className="w-3 h-1 rounded bg-sky-600" />
                <span>{t('admin_legend_route')}</span>
              </span>
            </div>
          </div>

          {/* Leaflet Map DOM Container */}
          <div 
            ref={mapContainerRef}
            className="w-full h-[380px] sm:h-[440px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner z-10"
          />

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>📍 Active Region: Saswad • Purandar • Pune (50 km corridor)</span>
            <span className="font-medium text-emerald-900">Coordinates via OpenStreetMap & PostGIS</span>
          </div>

        </div>

        {/* Right: Selected Order & Route Summary Panel (Col span 5 on large desktop) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Selected Order Card */}
          <div className="bg-white rounded-3xl p-5 border border-emerald-900/10 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-200">
                  <Package className="w-4 h-4 text-brand-600" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {t('admin_selected_order_title')}
                  </span>
                  <h3 className="text-base font-extrabold text-emerald-950 font-heading">
                    #{activeOrder?.order_id || 'ord_7701'}
                  </h3>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200 uppercase">
                {activeOrder?.status || 'Awaiting Routing'}
              </span>
            </div>

            {/* Order Details Grid */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">{t('admin_buyer_label')}</span>
                <span className="font-bold text-slate-900">{activeOrder?.buyer_name || 'Green Leaf Restaurant & Mess'}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">{t('admin_qty_label')}</span>
                <span className="font-extrabold text-brand-700">{activeOrder?.total_volume_kg || 800} kg</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">{t('admin_delivery_dest_label')}</span>
                <span className="font-semibold text-slate-800">Kothrud Central, Pune</span>
              </div>

              {/* Delivery Slot Callout */}
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                      {t('admin_delivery_slot_label')}
                    </span>
                    <span className="text-xs font-extrabold text-amber-950">
                      {getDeliverySlotDisplay(activeOrder?.delivery_slot)}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900">
                  Priority
                </span>
              </div>
            </div>

            {/* Farm Pickups Included */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-500 block mb-2">
                Included Farm Harvest Lots:
              </span>
              <div className="space-y-1.5">
                {(activeOrder?.lot_ids || ['lot_901', 'lot_902']).map((lotId, idx) => {
                  const lot = availableLots.find(l => l.lot_id === lotId);
                  const farmer = getFarmerName(lot?.farmer_id || (idx === 0 ? 'f_101' : 'f_102'));
                  const crop = lot?.crop_name || 'Tomato';
                  const qty = lot?.quantity_kg || (idx === 0 ? 500 : 300);

                  return (
                    <div key={lotId} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] flex items-center justify-center">
                          P{idx + 1}
                        </span>
                        <div>
                          <span className="font-bold text-slate-800">{crop}</span>
                          <span className="text-[11px] text-slate-500 block">👨‍🌾 {farmer}</span>
                        </div>
                      </div>
                      <span className="font-extrabold text-emerald-800">{qty} kg</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Route Summary Card */}
          <div className="bg-white rounded-3xl p-5 border border-emerald-900/10 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {t('admin_route_summary_title')}
                </span>
                <h4 className="text-base font-extrabold text-emerald-950 font-heading">
                  #{activeOrderRoute?.route_id || 'route_101'}
                </h4>
              </div>

              {activeOrderRoute?.assigned_driver_name ? (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-brand-700 border border-emerald-200 uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-brand-600" />
                  <span>{t('admin_status_assigned')}</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-sky-50 text-sky-800 border border-sky-200 uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-sky-600" />
                  <span>{t('admin_route_optimized_badge')}</span>
                </span>
              )}
            </div>

            {/* Route Metrics (Distance, Stops, Payout) */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-medium block">Distance</span>
                <span className="text-sm font-extrabold text-slate-900">{activeOrderRoute?.total_distance_km || 42.6} km</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-medium block">Stops</span>
                <span className="text-sm font-extrabold text-slate-900">
                  {activeOrderRoute?.pickup_count || 2}P + {activeOrderRoute?.dropoff_count || 1}D
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                <span className="text-[10px] text-emerald-800 font-medium block">Driver Payout</span>
                <span className="text-sm font-extrabold text-brand-700">₹{activeOrderRoute?.estimated_payout || 1200}</span>
              </div>
            </div>

            {/* Assigned Driver Status if assigned */}
            {activeOrderRoute?.assigned_driver_name && (
              <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold text-xs">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-800 font-semibold block">Assigned Carrier:</span>
                    <span className="font-extrabold text-emerald-950">
                      {activeOrderRoute.assigned_driver_name} ({activeOrderRoute.assigned_driver_id})
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => selectRole('driver')}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>{t('admin_btn_test_driver')}</span>
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                onClick={() => handleOpenAssignModal(activeOrderRoute)}
                className="w-full py-3 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs shadow-sm shadow-brand-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <UserCheck className="w-4 h-4" />
                <span>
                  {activeOrderRoute?.assigned_driver_name ? t('admin_btn_reassign_driver') : t('admin_btn_assign_driver')}
                </span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* 5. Operational Analytics Charts (Order Status Distribution & Available Produce Volume) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <OrderStatusChart orders={pendingOrders} />
        <ProduceVolumeChart availableLots={availableLots} />
      </div>

      {/* 6. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-emerald-900/10 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'orders'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-emerald-50 border border-slate-200'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>{t('admin_tab_orders')} ({pendingOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('routes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'routes'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-emerald-50 border border-slate-200'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>{t('admin_tab_routes')} ({routes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('lots')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'lots'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-emerald-50 border border-slate-200'
          }`}
        >
          <Sprout className="w-3.5 h-3.5" />
          <span>{t('admin_tab_lots')} ({availableLots.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('drivers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'drivers'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-emerald-50 border border-slate-200'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>{t('admin_tab_drivers')} ({drivers.length})</span>
        </button>
      </div>

      {/* 6. Tab Content Area */}
      
      {/* Tab 1: Pending Orders */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-emerald-900/10 shadow-sm overflow-hidden p-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-emerald-50/70 border-b border-emerald-100 text-emerald-950 font-bold">
                <tr>
                  <th className="p-3.5">{t('admin_col_order_id')}</th>
                  <th className="p-3.5">{t('admin_col_buyer')}</th>
                  <th className="p-3.5">{t('admin_col_qty')}</th>
                  <th className="p-3.5">{t('admin_col_slot')}</th>
                  <th className="p-3.5">{t('admin_col_status')}</th>
                  <th className="p-3.5 text-right">{t('admin_col_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {pendingOrders.map((ord) => {
                  const isSelected = ord.order_id === selectedAdminOrderId;
                  const slotStr = getDeliverySlotDisplay(ord.delivery_slot);

                  return (
                    <tr 
                      key={ord.order_id} 
                      onClick={() => handleSelectOrder(ord.order_id)}
                      className={`transition-colors cursor-pointer ${
                        isSelected ? 'bg-emerald-50/80 font-medium' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="p-3.5 font-bold text-emerald-950 flex items-center gap-2">
                        {isSelected && <span className="w-2 h-2 rounded-full bg-brand-500" />}
                        <span>#{ord.order_id}</span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-semibold text-slate-900 block">{ord.buyer_name || 'Green Leaf Restaurant'}</span>
                        <span className="text-[11px] text-slate-400">Kothrud Central</span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-extrabold text-emerald-800">
                          {ord.total_volume_kg || 800} kg
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-semibold">
                          <Clock className="w-3 h-3 text-amber-700 shrink-0" />
                          <span>{slotStr}</span>
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ord.status === 'ROUTED' 
                            ? 'bg-sky-50 text-sky-800 border border-sky-200' 
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {ord.status || 'Awaiting Routing'}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectOrder(ord.order_id);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[11px] inline-flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                        >
                          <MapPin className="w-3 h-3 text-brand-600" />
                          <span>{t('admin_map_view_on_map')}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Logistics & Routes */}
      {activeTab === 'routes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {routes.map((rt) => (
            <div key={rt.route_id} className="p-5 rounded-3xl bg-white border border-emerald-900/10 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    <Truck className="w-4 h-4 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-emerald-950 font-heading">
                      #{rt.route_id}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {rt.pickup_count || 2} Pickups • {rt.dropoff_count || 1} Drop-off
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-extrabold text-brand-700">
                    ₹{rt.estimated_payout}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    {rt.total_distance_km} km
                  </div>
                </div>
              </div>

              {/* Status and Carrier */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Routing Optimization:</span>
                  <span className="font-bold text-emerald-700">✓ OR-Tools Multi-stop</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Assigned Driver:</span>
                  <span className="font-bold text-slate-900">
                    {rt.assigned_driver_name ? `${rt.assigned_driver_name} (${rt.assigned_driver_id})` : 'Unassigned'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenAssignModal(rt)}
                  className="flex-1 py-2 px-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{rt.assigned_driver_name ? 'Reassign Driver' : 'Assign Driver'}</span>
                </button>

                <button
                  onClick={() => selectRole('driver')}
                  className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  title="View in Driver Terminal"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Active Farm Lots */}
      {activeTab === 'lots' && (
        <div className="bg-white rounded-3xl border border-emerald-900/10 shadow-sm overflow-hidden p-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-emerald-50/70 border-b border-emerald-100 text-emerald-950 font-bold">
                <tr>
                  <th className="p-3.5">Lot ID</th>
                  <th className="p-3.5">{t('admin_crop')}</th>
                  <th className="p-3.5">{t('admin_qty')}</th>
                  <th className="p-3.5">{t('admin_price')}</th>
                  <th className="p-3.5">{t('admin_farmer')}</th>
                  <th className="p-3.5">{t('admin_location')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {availableLots.map((lot) => (
                  <tr key={lot.lot_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-emerald-950">
                      #{lot.lot_id}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">
                      {lot.crop_name}
                    </td>
                    <td className="p-3.5 font-extrabold text-emerald-800">
                      {lot.quantity_kg} kg
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">
                      ₹{lot.price_per_kg}/kg
                    </td>
                    <td className="p-3.5 text-slate-600">
                      👨‍🌾 {getFarmerName(lot.farmer_id)} ({lot.farmer_id})
                    </td>
                    <td className="p-3.5 text-slate-500">
                      📍 Saswad / Purandar (${lot.latitude}, ${lot.longitude})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Fleet Drivers */}
      {activeTab === 'drivers' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {drivers.map((drv) => {
            const isAvailable = drv.status === 'AVAILABLE';

            return (
              <div key={drv.user_id} className="p-5 rounded-3xl bg-white border border-emerald-900/10 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isAvailable ? 'bg-emerald-50 text-brand-600 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-emerald-950 font-heading">
                        {drv.full_name}
                      </h4>
                      <span className="text-[11px] text-slate-400">{drv.user_id}</span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                    isAvailable ? 'bg-emerald-50 text-brand-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {isAvailable ? t('admin_driver_available') : t('admin_driver_busy')}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>{t('admin_driver_vehicle')}</span>
                    <span className="font-bold text-slate-800">{drv.vehicle || 'Tata Ace (1.2 Ton)'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>{t('admin_driver_rating')}</span>
                    <span className="font-bold text-amber-600 flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      {drv.rating || 4.9}/5
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>{t('admin_driver_phone')}</span>
                    <span className="font-medium text-slate-700">{drv.phone || '+91 98221 44551'}</span>
                  </div>
                </div>

                <button
                  disabled={!isAvailable}
                  onClick={() => {
                    handleOpenAssignModal(activeOrderRoute);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 disabled:bg-slate-100 text-emerald-900 disabled:text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed border border-emerald-200/80"
                >
                  <UserCheck className="w-3.5 h-3.5 text-brand-600" />
                  <span>Assign Active Route</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 7. Assign Driver Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-emerald-900/10 shadow-xl space-y-5 animate-fade-in relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-brand-600 flex items-center justify-center border border-emerald-200">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold font-heading text-emerald-950">
                    {t('admin_modal_assign_title')}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Route #{selectedRouteForAssign?.route_id || 'route_101'} • {selectedRouteForAssign?.total_distance_km || 42.6} km • 2 Pickups → 1 Drop-off
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Payout Callout */}
            <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between text-xs">
              <span className="text-emerald-900 font-semibold">{t('admin_driver_payout')}</span>
              <span className="text-sm font-extrabold text-brand-700">₹{selectedRouteForAssign?.estimated_payout || 1200}</span>
            </div>

            {/* Drivers Selection List */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 block">
                {t('admin_available_drivers_heading')}:
              </span>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {drivers.map((drv) => {
                  const isAvail = drv.status === 'AVAILABLE';

                  return (
                    <div 
                      key={drv.user_id}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                        isAvail 
                          ? 'bg-white hover:bg-emerald-50/50 border-slate-200 hover:border-emerald-300' 
                          : 'bg-slate-50 border-slate-100 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isAvail ? 'bg-emerald-100 text-brand-700' : 'bg-slate-200 text-slate-600'
                        }`}>
                          <Truck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">{drv.full_name}</span>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              isAvail ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {isAvail ? t('admin_driver_available') : t('admin_driver_busy')}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 block">
                            {drv.vehicle || 'Tata Ace (1.2 Ton)'} • ★ {drv.rating || 4.9}
                          </span>
                        </div>
                      </div>

                      <button
                        disabled={!isAvail}
                        onClick={() => handleConfirmAssign(drv.user_id)}
                        className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                          isAvail 
                            ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-sm shadow-brand-500/20 active:scale-95' 
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {t('admin_btn_assign')}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
