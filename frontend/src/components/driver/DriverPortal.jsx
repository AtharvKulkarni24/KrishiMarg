import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { MOCK_USERS } from '../../services/mockData';
import EmptyState from '../common/EmptyState';
import { 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Navigation, 
  ShieldCheck, 
  ArrowRight,
  PackageCheck,
  Compass,
  Clock,
  Check,
  ExternalLink,
  Phone,
  Sparkles,
  RotateCcw,
  Boxes,
  AlertCircle
} from 'lucide-react';
import L from 'leaflet';

export default function DriverPortal() {
  const { 
    routes, 
    selectedRouteId, 
    setSelectedRouteId, 
    activeRoute, 
    activeRouteStatus, 
    activePayoutStatus,
    handleAcceptRoute, 
    handleCompleteRoute,
    availableLots,
    pendingOrders,
    selectRole,
    currentUser,
    addToast,
    t 
  } = useApp();

  const [isAccepting, setIsAccepting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Workflow Progression State: tracks current stop index (0, 1, 2, ...)
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  
  // Stop status mapping: stopIndex -> 'EN_ROUTE' | 'ARRIVED' | 'COMPLETED'
  const [stopProgressMap, setStopProgressMap] = useState({});

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  // Reset or initialize stop progress when active route changes
  useEffect(() => {
    if (activeRouteStatus === 'COMPLETED') {
      const allCompleted = {};
      activeRoute?.ordered_stops?.forEach((_, idx) => {
        allCompleted[idx] = 'COMPLETED';
      });
      setStopProgressMap(allCompleted);
      setCurrentStopIndex(activeRoute?.ordered_stops ? activeRoute.ordered_stops.length - 1 : 0);
    } else if (activeRouteStatus === 'ACCEPTED') {
      setCurrentStopIndex(0);
      setStopProgressMap({ 0: 'EN_ROUTE' });
    } else {
      setCurrentStopIndex(0);
      setStopProgressMap({});
    }
  }, [activeRoute?.route_id, activeRouteStatus]);

  // Helper to resolve farmer name
  const getFarmerName = (farmerId) => {
    const user = MOCK_USERS.find(u => u.user_id === farmerId);
    return user ? user.full_name : (farmerId === 'f_102' ? 'Suresh Mohite' : 'Ramesh Patil');
  };

  // Helper to resolve buyer name
  const getBuyerName = (buyerId) => {
    const user = MOCK_USERS.find(u => u.user_id === buyerId);
    return user ? user.full_name : 'Green Leaf Restaurant & Mess';
  };

  // Helper to get structured stop data
  const getStopDetails = (stop, index) => {
    if (!stop) return null;
    const isPickup = stop.type === 'PICKUP';
    
    if (isPickup) {
      const lot = availableLots.find(l => l.lot_id === stop.lot_id);
      const farmerId = lot?.farmer_id || (stop.lot_id === 'lot_902' ? 'f_102' : 'f_101');
      const cropName = lot?.crop_name || (stop.lot_id === 'lot_903' ? 'Onion' : 'Tomato');
      const quantityKg = lot?.quantity_kg || (stop.lot_id === 'lot_902' ? 300 : 500);
      const farmerName = getFarmerName(farmerId);
      const locationName = farmerId === 'f_102' ? 'Jejuri Road Farm, Purandar' : 'Saswad Farm #1, Purandar';

      return {
        index,
        type: 'PICKUP',
        title: `Pickup — Produce Lot`,
        subtitle: `${cropName} • ${quantityKg} kg`,
        lot_id: stop.lot_id,
        cropName,
        quantityKg,
        contactName: farmerName,
        locationName,
        latitude: Number(stop.latitude),
        longitude: Number(stop.longitude)
      };
    } else {
      const order = pendingOrders.find(o => o.order_id === stop.order_id) || pendingOrders[0];
      const buyerName = getBuyerName(order?.buyer_id);
      const totalVolume = activeRoute?.ordered_stops
        ? activeRoute.ordered_stops
            .filter(s => s.type === 'PICKUP')
            .reduce((sum, s) => {
              const l = availableLots.find(lot => lot.lot_id === s.lot_id);
              return sum + (Number(l?.quantity_kg) || (s.lot_id === 'lot_902' ? 300 : 500));
            }, 0)
        : 800;

      return {
        index,
        type: 'DROPOFF',
        title: `Drop-off — Buyer Delivery`,
        subtitle: `${buyerName} • ${totalVolume} kg Total`,
        order_id: stop.order_id || 'ord_7701',
        totalVolume,
        contactName: buyerName,
        locationName: 'Kothrud Central Drop-off, Pune',
        latitude: Number(stop.latitude || 18.5018),
        longitude: Number(stop.longitude || 73.8636)
      };
    }
  };

  const totalStops = activeRoute?.ordered_stops?.length || 0;
  const currentStop = activeRoute?.ordered_stops ? activeRoute.ordered_stops[currentStopIndex] : null;
  const currentStopDetails = useMemo(() => {
    return getStopDetails(currentStop, currentStopIndex);
  }, [currentStop, currentStopIndex, availableLots, pendingOrders, activeRoute]);

  const currentStopStatus = stopProgressMap[currentStopIndex] || (activeRouteStatus === 'ACCEPTED' ? 'EN_ROUTE' : 'PENDING');
  const isRouteFinished = activeRouteStatus === 'COMPLETED' || (totalStops > 0 && currentStopIndex >= totalStops);

  // Initialize Leaflet Map
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

  // Render Stops and Route Polyline on Map with Highlighted Next Stop
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();
    const bounds = [];

    if (activeRoute?.ordered_stops && activeRoute.ordered_stops.length > 0) {
      activeRoute.ordered_stops.forEach((stop, idx) => {
        const lat = Number(stop.latitude);
        const lon = Number(stop.longitude);
        if (isNaN(lat) || isNaN(lon)) return;

        bounds.push([lat, lon]);

        const isPickup = stop.type === 'PICKUP';
        const isCurrentStop = idx === currentStopIndex && activeRouteStatus === 'ACCEPTED';
        const isStopDone = stopProgressMap[idx] === 'COMPLETED' || activeRouteStatus === 'COMPLETED';

        const markerColor = isPickup ? '#0caf3d' : '#e11d48';
        const ringColor = isCurrentStop ? (isPickup ? '#0caf3d' : '#e11d48') : 'transparent';
        const markerLabel = isStopDone ? '✓' : (isPickup ? `P${idx + 1}` : 'D');

        const stopIcon = L.divIcon({
          className: 'custom-driver-marker',
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center;">
              ${isCurrentStop ? `
                <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; border: 3px solid ${ringColor}; opacity: 0.8; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              ` : ''}
              <div style="background: ${markerColor}; color: #ffffff; width: ${isCurrentStop ? '36px' : '30px'}; height: ${isCurrentStop ? '36px' : '30px'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: ${isStopDone ? '13px' : '11px'}; border: 2.5px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 10; cursor: pointer; transform: ${isCurrentStop ? 'scale(1.1)' : 'scale(1)'}; transition: all 0.2s ease;">
                ${markerLabel}
              </div>
            </div>
          `,
          iconSize: [44, 44],
          iconAnchor: [22, 22]
        });

        const stopDetail = getStopDetails(stop, idx);
        const popupContent = `
          <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4; padding: 2px;">
            <strong style="color: ${isPickup ? '#0caf3d' : '#e11d48'}; font-size: 13px;">
              ${isPickup ? `🟢 Stop ${idx + 1}: Pickup` : '🔴 Final Stop: Drop-off'}
            </strong><br/>
            <strong>${stopDetail?.cropName || stopDetail?.contactName}</strong> • ${stopDetail?.quantityKg ? `${stopDetail.quantityKg} kg` : ''}<br/>
            <span style="color: #64748b; font-size: 11px;">📍 ${stopDetail?.locationName}</span>
          </div>
        `;

        const marker = L.marker([lat, lon], { icon: stopIcon }).bindPopup(popupContent);
        layerGroup.addLayer(marker);
      });
    }

    // Draw route polyline from route_coordinates
    if (activeRoute?.route_coordinates && activeRoute.route_coordinates.length > 0) {
      const polyline = L.polyline(activeRoute.route_coordinates, {
        color: '#0284c7',
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
  }, [activeRoute, currentStopIndex, stopProgressMap, activeRouteStatus]);

  // Actions
  const onAccept = async () => {
    if (!activeRoute) return;
    setIsAccepting(true);
    await handleAcceptRoute(activeRoute.route_id);
    setIsAccepting(false);
    setCurrentStopIndex(0);
    setStopProgressMap({ 0: 'EN_ROUTE' });
  };

  const handleStartRoute = () => {
    setCurrentStopIndex(0);
    setStopProgressMap({ 0: 'EN_ROUTE' });
    addToast(t('driver_status_in_progress'), 'info');
  };

  const handleArrived = () => {
    setStopProgressMap(prev => ({
      ...prev,
      [currentStopIndex]: 'ARRIVED'
    }));
    addToast(t('driver_status_at_stop', { stop: currentStopIndex + 1 }), 'info');
  };

  const handleCompleteCurrentStop = async () => {
    const isPickup = currentStop?.type === 'PICKUP';
    
    setStopProgressMap(prev => ({
      ...prev,
      [currentStopIndex]: 'COMPLETED'
    }));

    if (currentStopIndex + 1 < totalStops) {
      // Advance to next stop
      const nextIdx = currentStopIndex + 1;
      setCurrentStopIndex(nextIdx);
      setStopProgressMap(prev => ({
        ...prev,
        [nextIdx]: 'EN_ROUTE'
      }));
      
      const nextStop = activeRoute.ordered_stops[nextIdx];
      if (mapInstanceRef.current && nextStop) {
        mapInstanceRef.current.flyTo([Number(nextStop.latitude), Number(nextStop.longitude)], 13, { duration: 1 });
      }

      addToast(
        isPickup 
          ? `✓ Pickup #${currentStopIndex + 1} completed! Proceeding to next stop.` 
          : `✓ Drop-off completed!`, 
        'success'
      );
    } else {
      // All stops completed -> Finalize trip & release escrow
      setIsCompleting(true);
      await handleCompleteRoute(activeRoute.route_id);
      setIsCompleting(false);
      addToast(t('driver_trip_completed'), 'success');
    }
  };

  // Open Google Maps navigation for current stop
  const handleOpenNavigation = () => {
    if (!currentStopDetails) return;
    const lat = currentStopDetails.latitude;
    const lon = currentStopDetails.longitude;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
    window.open(url, '_blank', 'noopener,noreferrer');

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lon], 14, { duration: 1 });
    }
    addToast(`Navigating to ${currentStopDetails.locationName}...`, 'info');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 w-full">
      
      {/* 🚚 1. Driver Workflow Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-emerald-900/10 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 shadow-xs">
            <Truck className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-heading text-emerald-950">
                {t('driver_portal_title')}
              </h1>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-mono font-bold border border-emerald-200">
                {t('driver_portal_badge', { id: currentUser?.user_id || 'd_901' })}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              {t('driver_portal_sub')}
            </p>
          </div>
        </div>

        {/* Compact Route Header Metrics */}
        {activeRoute && (
          <div className="flex items-center gap-3 self-stretch sm:self-auto bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs">
            <div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase">{t('driver_stat_payout')}</div>
              <div className="text-sm font-extrabold text-amber-800 font-mono">
                ₹{Number(activeRoute.estimated_payout).toFixed(2)}
              </div>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase">{t('driver_stat_distance')}</div>
              <div className="text-xs font-bold text-slate-800 font-mono">
                {activeRoute.total_distance_km} km
              </div>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase">{t('driver_stops_heading')}</div>
              <div className="text-xs font-bold text-brand-700 font-mono">
                {currentStopIndex + 1}/{totalStops}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Left Execution Flow (8 cols) & Right Route Summary (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* 🌟 Left: NEXT STOP Action Center + Map + Progress (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* No Routes Empty State */}
          {!activeRoute ? (
            <EmptyState
              icon={Truck}
              title={t('driver_no_routes_title')}
              description={t('driver_no_routes_desc')}
              actionLabel="Go to Buyer Marketplace"
              onAction={() => selectRole('buyer')}
            />
          ) : activeRouteStatus === 'AVAILABLE' ? (
            /* 🚀 State 1: Route Available - Accept Action */
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-brand-200 shadow-sm space-y-5 text-center">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 mx-auto">
                <Navigation className="w-7 h-7 text-brand-600 animate-bounce" />
              </div>
              <div className="space-y-1">
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold font-mono">
                  {t('driver_status_available')}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold font-heading text-emerald-950 pt-2">
                  Route #{activeRoute.route_id} Assigned
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                  {activeRoute.total_distance_km} km • {activeRoute.pickup_count} Pickups • {activeRoute.dropoff_count} Drop-off • Estimated Payout: ₹{Number(activeRoute.estimated_payout).toFixed(2)}
                </p>
              </div>

              <div className="pt-2 max-w-sm mx-auto">
                <button
                  type="button"
                  disabled={isAccepting}
                  onClick={onAccept}
                  className="w-full py-4 px-6 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm sm:text-base transition-all shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2.5 cursor-pointer active:scale-98"
                >
                  {isAccepting ? (
                    <span>{t('driver_btn_accepting')}</span>
                  ) : (
                    <>
                      <span>{t('driver_btn_accept_route')}</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : isRouteFinished ? (
            /* 🎉 State 5: Route Completed State */
            <div className="p-6 sm:p-8 rounded-2xl bg-emerald-50 border border-emerald-300 shadow-sm space-y-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-brand-700 mx-auto">
                <CheckCircle2 className="w-8 h-8 text-brand-600" />
              </div>
              <div className="space-y-1">
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-200 text-emerald-950 font-bold">
                  {t('driver_status_completed')}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold font-heading text-emerald-950 pt-2">
                  {t('driver_trip_completed')}
                </h2>
                <p className="text-xs sm:text-sm text-emerald-900 max-w-md mx-auto">
                  {t('driver_trip_completed_desc', { payout: Number(activeRoute.estimated_payout).toFixed(2) })}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-emerald-200 max-w-md mx-auto text-left space-y-2 text-xs">
                <div className="flex justify-between text-slate-700">
                  <span>Route Distance:</span>
                  <span className="font-mono font-bold text-slate-900">{activeRoute.total_distance_km} km</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Stops Completed:</span>
                  <span className="font-mono font-bold text-brand-700">{totalStops} of {totalStops}</span>
                </div>
                <div className="flex justify-between text-slate-700 border-t border-slate-100 pt-2">
                  <span>Payout Released:</span>
                  <span className="font-mono font-extrabold text-amber-800 text-sm">₹{Number(activeRoute.estimated_payout).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : (
            /* 🟢 State 2-4: Active "NEXT STOP" Driver Workflow Card */
            currentStopDetails && (
              <div className="p-6 rounded-2xl bg-white border-2 border-brand-500 shadow-agri-lg space-y-5">
                
                {/* Next Stop Header Bar */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                      currentStopDetails.type === 'PICKUP' 
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                        : 'bg-rose-100 text-rose-900 border border-rose-300'
                    }`}>
                      <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                      <span>{currentStopDetails.type === 'PICKUP' ? t('driver_next_stop_pickup') : t('driver_next_stop_dropoff')}</span>
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {t('driver_stop_progress', { current: currentStopIndex + 1, total: totalStops })}
                  </span>
                </div>

                {/* Main Task Description */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-emerald-950 tracking-tight">
                      {currentStopDetails.cropName || currentStopDetails.contactName}
                    </h2>
                    <p className="text-sm font-semibold text-slate-700 mt-1 flex items-center gap-2">
                      {currentStopDetails.quantityKg && (
                        <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-900 font-mono border border-amber-200">
                          {currentStopDetails.quantityKg} kg
                        </span>
                      )}
                      <span>{currentStopDetails.contactName}</span>
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-2">
                      <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span>{currentStopDetails.locationName}</span>
                    </p>
                  </div>

                  {/* Stop Reference Tag */}
                  <div className="text-left sm:text-right text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 self-stretch sm:self-auto shrink-0">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      {currentStopDetails.type === 'PICKUP' ? t('driver_lot_label') : t('driver_order_label')}
                    </span>
                    <span className="font-mono font-bold text-slate-800 text-sm">
                      {currentStopDetails.lot_id || currentStopDetails.order_id}
                    </span>
                  </div>
                </div>

                {/* 🧭 Action Buttons: Navigate + Arrive + Complete */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  
                  {/* Navigation Button */}
                  <button
                    type="button"
                    onClick={handleOpenNavigation}
                    className="py-3.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-98"
                  >
                    <Compass className="w-4 h-4 text-blue-600" />
                    <span>{t('driver_btn_navigate')}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                  </button>

                  {/* Stage-based Action Button */}
                  {currentStopStatus === 'EN_ROUTE' ? (
                    <button
                      type="button"
                      onClick={handleArrived}
                      className="py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-600/20 cursor-pointer active:scale-98"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>{currentStopDetails.type === 'PICKUP' ? t('driver_btn_arrived_pickup') : t('driver_btn_arrived_dropoff')}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isCompleting}
                      onClick={handleCompleteCurrentStop}
                      className={`py-3.5 px-4 rounded-xl text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer active:scale-98 ${
                        currentStopDetails.type === 'PICKUP'
                          ? 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-700/20'
                          : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>
                        {isCompleting 
                          ? t('driver_btn_completing') 
                          : (currentStopDetails.type === 'PICKUP' ? t('driver_btn_complete_pickup') : t('driver_btn_complete_delivery'))}
                      </span>
                    </button>
                  )}

                </div>

              </div>
            )
          )}

          {/* 🗺️ Leaflet Route Map */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-brand-600" />
                <span>{t('driver_map_title')}</span>
              </h3>
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0caf3d]" />
                  <span>{t('driver_legend_pickup')}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e11d48]" />
                  <span>{t('driver_legend_dropoff')}</span>
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 p-2 overflow-hidden shadow-xs relative h-[320px] sm:h-[380px] w-full">
              <div ref={mapContainerRef} className="w-full h-full rounded-xl z-0" />
            </div>
          </div>

          {/* 📋 Route Progress Tracker */}
          {activeRoute?.ordered_stops && (
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-emerald-950 font-heading">
                {t('driver_progress_title')}
              </h3>

              <div className="space-y-2.5">
                {activeRoute.ordered_stops.map((stop, idx) => {
                  const isPickup = stop.type === 'PICKUP';
                  const detail = getStopDetails(stop, idx);
                  const isCompleted = stopProgressMap[idx] === 'COMPLETED' || activeRouteStatus === 'COMPLETED';
                  const isCurrent = idx === currentStopIndex && activeRouteStatus === 'ACCEPTED' && !isCompleted;
                  const isPending = !isCompleted && !isCurrent;

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                        isCurrent
                          ? 'bg-brand-50/60 border-brand-500 ring-2 ring-brand-500/20'
                          : isCompleted
                          ? 'bg-slate-50/70 border-slate-200/80 opacity-80'
                          : 'bg-white border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Status Icon Marker */}
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                          isCompleted
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? (isPickup ? 'bg-brand-600 text-white' : 'bg-rose-600 text-white animate-pulse')
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                        </div>

                        <div>
                          <div className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                            <span>{isPickup ? `Pickup — ${detail?.cropName}` : `Drop-off — ${detail?.contactName}`}</span>
                            {detail?.quantityKg && (
                              <span className="font-mono text-slate-500 text-xs font-normal">({detail.quantityKg} kg)</span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <span>{detail?.locationName}</span>
                            <span>•</span>
                            <span className="font-mono">{stop.lot_id || stop.order_id}</span>
                          </div>
                        </div>
                      </div>

                      {/* State Badge */}
                      <div>
                        {isCompleted && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            {t('driver_step_completed_badge')}
                          </span>
                        )}
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-md bg-brand-600 text-white font-bold text-[10px] shadow-xs">
                            {t('driver_step_next_badge')}
                          </span>
                        )}
                        {isPending && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-medium text-[10px]">
                            {t('driver_step_pending_badge')}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* 📦 Right: Compact Route Summary & Stop Contact (4 cols) */}
        <div className="lg:col-span-4 space-y-5 sticky top-20">
          
          {/* Route Summary Card */}
          {activeRoute && (
            <div className="p-5 rounded-2xl bg-white border border-emerald-900/10 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-emerald-950 font-heading flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand-600" />
                  <span>{t('driver_route_summary', { route_id: activeRoute.route_id })}</span>
                </h3>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  activeRouteStatus === 'COMPLETED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : activeRouteStatus === 'ACCEPTED'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {activeRouteStatus}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>{t('driver_stat_distance')}:</span>
                  <span className="font-bold text-slate-800 font-mono">{activeRoute.total_distance_km} km</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{t('driver_stat_pickups')}:</span>
                  <span className="font-bold text-slate-800 font-mono">{activeRoute.pickup_count} Farm Stops</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{t('driver_stat_dropoffs')}:</span>
                  <span className="font-bold text-slate-800 font-mono">{activeRoute.dropoff_count} Delivery</span>
                </div>

                <div className="flex justify-between text-slate-900 font-extrabold border-t border-slate-100 pt-2.5 text-sm">
                  <span>{t('driver_estimated_payout')}:</span>
                  <span className="text-amber-800 font-mono text-base">₹{Number(activeRoute.estimated_payout).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Contact / Location Details for Active Stop */}
          {currentStopDetails && !isRouteFinished && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-xs space-y-3.5 text-xs">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-600" />
                <span>{currentStopDetails.type === 'PICKUP' ? t('driver_pickup_card_title') : t('driver_dropoff_card_title')}</span>
              </div>

              <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">{currentStopDetails.type === 'PICKUP' ? t('driver_farmer_label') : t('driver_buyer_label')}</span>
                  <span className="font-bold text-slate-900">{currentStopDetails.contactName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('driver_location_label')}</span>
                  <span className="font-medium text-slate-800 text-right">{currentStopDetails.locationName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('driver_coords_label')}</span>
                  <span className="font-mono text-slate-600">{currentStopDetails.latitude.toFixed(4)}, {currentStopDetails.longitude.toFixed(4)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenNavigation}
                className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs"
              >
                <Compass className="w-3.5 h-3.5 text-brand-600" />
                <span>{t('driver_btn_navigate_short')}</span>
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
