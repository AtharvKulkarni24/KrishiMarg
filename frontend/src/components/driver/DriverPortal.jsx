import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import EmptyState from '../common/EmptyState';
import { 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Navigation, 
  ShieldCheck, 
  DollarSign, 
  Sparkles,
  ArrowRight,
  PackageCheck,
  Compass,
  AlertCircle,
  Clock
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
    selectRole,
    currentUser,
    t 
  } = useApp();

  const [isAccepting, setIsAccepting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

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

  // Render Stops and Route Polyline on Map
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

        const stopIcon = L.divIcon({
          className: 'custom-driver-marker',
          html: `
            <div style="background: ${isPickup ? '#0caf3d' : '#e11d48'}; color: #ffffff; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 11px; border: 2.5px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.3); cursor: pointer;">
              ${isPickup ? `P${idx + 1}` : 'D'}
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const popupContent = `
          <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4; padding: 2px;">
            <strong style="color: ${isPickup ? '#0caf3d' : '#e11d48'}; font-size: 13px;">
              ${isPickup ? `🟢 Pickup #${idx + 1}` : '🔴 Dropoff'}
            </strong><br/>
            ${isPickup ? `<strong>Lot ID:</strong> <span style="font-family: monospace;">${stop.lot_id}</span>` : `<strong>Order ID:</strong> <span style="font-family: monospace;">${stop.order_id}</span>`}<br/>
            <span style="color: #64748b; font-size: 11px;">📍 ${lat.toFixed(4)}, ${lon.toFixed(4)}</span>
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
  }, [activeRoute]);

  const onAccept = async () => {
    if (!activeRoute) return;
    setIsAccepting(true);
    await handleAcceptRoute(activeRoute.route_id);
    setIsAccepting(false);
  };

  const onComplete = async () => {
    if (!activeRoute) return;
    setIsCompleting(true);
    await handleCompleteRoute(activeRoute.route_id);
    setIsCompleting(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 w-full">
      
      {/* Driver Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-emerald-900/10 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <Truck className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold font-heading text-emerald-950">
              {t('driver_portal_title')}
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold border border-amber-200 font-mono">
              {currentUser?.user_id || 'd_901'}
            </span>
          </div>
          <p className="text-slate-600 text-xs md:text-sm">
            {t('driver_portal_sub')}
          </p>
        </div>

        {/* Payout Badge */}
        {activeRoute && (
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800 font-bold">
              ₹
            </div>
            <div>
              <div className="text-[10px] text-amber-900/70 font-semibold">{t('driver_estimated_payout')}</div>
              <div className="text-sm font-extrabold text-amber-900 font-mono">₹{Number(activeRoute.estimated_payout).toFixed(2)}</div>
            </div>
          </div>
        )}
      </div>

      {/* Driver Interactive Route Map Card */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-emerald-950 flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-600" />
              <span>{t('driver_map_title')}</span>
            </h3>
            <p className="text-xs text-slate-500">{t('driver_map_sub')}</p>
          </div>

          {/* Map Legend */}
          <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-[#0caf3d] inline-block" />
              <span>{t('driver_legend_pickup')}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-[#e11d48] inline-block" />
              <span>{t('driver_legend_dropoff')}</span>
            </span>
            <span className="flex items-center gap-1 text-blue-700">
              <span className="w-3 h-3 rounded-full bg-[#0284c7] inline-block" />
              <span>{t('driver_legend_route')}</span>
            </span>
          </div>
        </div>

        {/* Leaflet Map Canvas */}
        <div className="rounded-2xl bg-white border border-emerald-900/10 p-2 overflow-hidden shadow-sm relative h-[420px] w-full">
          <div ref={mapContainerRef} className="w-full h-full rounded-xl z-0" />

          {activeRoute && (
            <div className="absolute bottom-4 left-4 right-4 z-10 p-3.5 rounded-xl bg-white/95 border border-blue-300 backdrop-blur-md text-xs flex flex-wrap items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-2 text-blue-900 font-bold">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{activeRoute.route_id} • {activeRoute.total_distance_km} km Total</span>
              </div>
              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="text-slate-700 font-semibold">{activeRoute.pickup_count} Pickups</span>
                <span className="text-slate-700 font-semibold">{activeRoute.dropoff_count} Dropoff</span>
                <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  ₹{Number(activeRoute.estimated_payout).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Available Route Cards & Stops Itinerary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Available Routes List & Stops (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Routes Heading */}
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-emerald-950 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-brand-600" />
              <span>{t('driver_routes_heading')}</span>
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-mono font-bold border border-emerald-200">
              {t('driver_routes_count', { count: routes.length })}
            </span>
          </div>

          {routes.length === 0 ? (
            <EmptyState
              icon={Truck}
              title={t('driver_no_routes_title')}
              description={t('driver_no_routes_desc')}
              actionLabel="Go to Buyer Marketplace"
              onAction={() => selectRole('buyer')}
            />
          ) : (
            <div className="space-y-4">
              {routes.map(route => {
                const isSelected = route.route_id === selectedRouteId;
                const status = activeRouteStatus;

                return (
                  <div
                    key={route.route_id}
                    onClick={() => setSelectedRouteId(route.route_id)}
                    className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer shadow-sm ${
                      isSelected
                        ? 'border-blue-500 ring-2 ring-blue-400/20'
                        : 'border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 font-mono">
                          {route.route_id}
                        </span>
                        <span className="text-xs text-slate-600 font-medium font-mono">
                          {status}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-extrabold text-amber-700 font-mono">
                          ₹{Number(route.estimated_payout).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 border-t border-b border-slate-100 my-2">
                      <div className="p-2 bg-slate-50 rounded-xl">
                        <div className="text-[10px] text-slate-500 font-semibold">{t('driver_stat_distance')}</div>
                        <div className="font-bold text-slate-800 font-mono mt-0.5">{route.total_distance_km} km</div>
                      </div>
                      <div className="p-2 bg-emerald-50 rounded-xl">
                        <div className="text-[10px] text-emerald-800 font-semibold">{t('driver_stat_pickups')}</div>
                        <div className="font-bold text-brand-700 font-mono mt-0.5">{route.pickup_count} Stops</div>
                      </div>
                      <div className="p-2 bg-rose-50 rounded-xl">
                        <div className="text-[10px] text-rose-800 font-semibold">{t('driver_stat_dropoffs')}</div>
                        <div className="font-bold text-rose-700 font-mono mt-0.5">{route.dropoff_count} Stop</div>
                      </div>
                    </div>

                    {/* Ordered Stops List */}
                    <div className="pt-2 space-y-2">
                      <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        {t('driver_stops_heading')}
                      </div>
                      {route.ordered_stops?.map((stop, idx) => (
                        <div 
                          key={idx}
                          className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                            stop.type === 'PICKUP'
                              ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                              : 'bg-rose-50/50 border-rose-200 text-rose-950'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] text-white ${
                              stop.type === 'PICKUP' ? 'bg-brand-600' : 'bg-rose-600'
                            }`}>
                              {idx + 1}
                            </span>
                            <span className="font-semibold">
                              {stop.type === 'PICKUP' ? t('driver_step_pickup') : t('driver_step_dropoff')}
                            </span>
                            <span className="font-mono text-[11px] text-slate-500">
                              {stop.lot_id ? `(${stop.lot_id})` : `(${stop.order_id})`}
                            </span>
                          </div>
                          <div className="font-mono text-[10px] text-slate-500">
                            {Number(stop.latitude).toFixed(4)}, {Number(stop.longitude).toFixed(4)}
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Right: Route Actions & Execution (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-emerald-900/10 shadow-sm space-y-4 sticky top-20">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <span>Route Actions</span>
              </h3>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {activeRouteStatus}
              </span>
            </div>

            {activeRoute ? (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Selected Route:</span>
                    <span className="font-bold text-slate-800 font-mono">{activeRoute.route_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Distance:</span>
                    <span className="font-bold text-slate-800 font-mono">{activeRoute.total_distance_km} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Estimated Payout:</span>
                    <span className="font-extrabold text-amber-800 font-mono">₹{Number(activeRoute.estimated_payout).toFixed(2)}</span>
                  </div>
                </div>

                {/* Status-specific action buttons */}
                {activeRouteStatus === 'AVAILABLE' && (
                  <button
                    type="button"
                    disabled={isAccepting}
                    onClick={onAccept}
                    className="w-full py-3.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    {isAccepting ? (
                      <span>Accepting...</span>
                    ) : (
                      <>
                        <span>{t('driver_btn_accept')}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}

                {activeRouteStatus === 'ACCEPTED' && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-medium">
                      ✓ Route accepted by Driver {currentUser?.user_id || 'd_901'}. Proceed with pickups and dropoff.
                    </div>
                    <button
                      type="button"
                      disabled={isCompleting}
                      onClick={onComplete}
                      className="w-full py-3.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      {isCompleting ? (
                        <span>{t('driver_btn_completing')}</span>
                      ) : (
                        <>
                          <PackageCheck className="w-4 h-4" />
                          <span>{t('driver_btn_complete')}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {activeRouteStatus === 'COMPLETED' && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-950 font-bold">
                      <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0" />
                      <span>{t('driver_trip_completed')}</span>
                    </div>
                    <p className="text-emerald-900 leading-relaxed">
                      {t('driver_trip_completed_desc')}
                    </p>
                    <div className="text-[11px] font-mono text-brand-800 bg-white/70 p-2 rounded-lg border border-emerald-200">
                      Payout Status: {activePayoutStatus || 'MOCK_ESCROW_RELEASED'}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Select a route from the left to view actions.</p>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
