import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import EmptyState from '../common/EmptyState';
import { 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Navigation, 
  Clock, 
  ShieldCheck, 
  DollarSign, 
  Phone, 
  AlertCircle,
  PackageCheck,
  Send,
  ArrowRight,
  UserCheck,
  Sparkles,
  KeyRound,
  RotateCcw
} from 'lucide-react';

export default function DriverPortal() {
  const { 
    activeRoute, 
    dispatchedDriver, 
    completedStops, 
    checkinStop, 
    isDeliveryCompleted, 
    completeDelivery,
    selectRole,
    t 
  } = useApp();

  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  const driverInfo = dispatchedDriver || {
    driver_id: 'd_901',
    name: 'Aman Sharma',
    vehicle_no: 'MH 12 AB 1234',
    vehicle_type: 'Tata Ace (Chota Hathi) - 1 Ton',
    phone: '+91 98765 43210',
    rating: 4.9,
    payout_inr: 1200
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!enteredOtp || enteredOtp.trim().length < 4) {
      setOtpError('Please enter a valid 4-digit buyer delivery OTP (e.g. 8824).');
      return;
    }
    setOtpError('');
    completeDelivery();
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
              {t('driver_portal_badge')}
            </span>
          </div>
          <p className="text-slate-600 text-xs md:text-sm">
            {t('driver_portal_sub')}
          </p>
        </div>

        {/* Vehicle & Payout Badge */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800 font-bold">
            ₹
          </div>
          <div>
            <div className="text-[10px] text-amber-900/70 font-semibold">{t('driver_guaranteed_payout')}</div>
            <div className="text-sm font-extrabold text-amber-900 font-mono">₹{driverInfo.payout_inr}</div>
          </div>
        </div>
      </div>

      {/* Driver Profile Bar */}
      <div className="p-4 rounded-2xl bg-white border border-emerald-900/10 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-brand-700 font-bold">
            AS
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm">{driverInfo.name}</div>
            <div className="text-slate-500 font-mono text-[11px]">{driverInfo.vehicle_no} • {driverInfo.vehicle_type}</div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-slate-600">
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono">{driverInfo.phone}</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
            ★ {driverInfo.rating} Rated
          </span>
        </div>
      </div>

      {/* Main Trip Itinerary Execution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Sequential Milk-Run Itinerary (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-emerald-950 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-brand-600" />
              <span>{t('driver_active_itinerary')}</span>
            </h3>
            {activeRoute && (
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 font-mono">
                {activeRoute.total_distance_km} km Route
              </span>
            )}
          </div>

          {!activeRoute ? (
            <EmptyState
              icon={Truck}
              title={t('driver_no_active_trip')}
              description={t('driver_no_active_trip_desc')}
              actionLabel="Go to Admin Dashboard"
              onAction={() => selectRole('admin')}
            />
          ) : isDeliveryCompleted ? (
            <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-300 text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center mx-auto text-brand-600">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-emerald-950">{t('driver_trip_completed')}</h4>
                <p className="text-xs text-emerald-900 mt-1 max-w-md mx-auto">
                  {t('driver_trip_completed_desc')}
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => selectRole('welcome')}
                  className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
                >
                  Return to Home
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {activeRoute.ordered_stops?.map((stop, idx) => {
                const isPickup = stop.type === 'PICKUP';
                const isChecked = completedStops.includes(stop.stop_number || idx + 1);

                return (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl bg-white border transition-all shadow-sm ${
                      isChecked
                        ? 'border-emerald-300 bg-emerald-50/30'
                        : isPickup
                        ? 'border-slate-200/90'
                        : 'border-amber-300 bg-amber-50/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isChecked
                            ? 'bg-brand-600 text-white'
                            : isPickup
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-emerald-950">
                          {isPickup ? `Stop #${idx + 1}: ${t('driver_step_pickup')}` : `Stop #${idx + 1}: ${t('driver_step_dropoff')}`}
                        </span>
                      </div>

                      <span className="text-[11px] text-slate-500 font-mono font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{stop.eta || '07:00 AM'}</span>
                      </span>
                    </div>

                    <div className="pl-9 space-y-1.5 text-xs text-slate-700">
                      <div className="font-bold text-slate-900 text-sm">{stop.name || 'Farm Location'}</div>
                      {stop.crop && <div className="text-slate-600 font-medium">{stop.crop}</div>}
                      {stop.address && <div className="text-slate-500 text-[11px]">{stop.address}</div>}

                      {isPickup ? (
                        <div className="pt-2 flex items-center justify-between">
                          <span className="text-[11px] text-slate-500 font-mono">
                            Cumulative: {stop.load_after_stop_kg || 500} kg / 1000 kg
                          </span>

                          <button
                            type="button"
                            disabled={isChecked}
                            onClick={() => checkinStop(stop.stop_number || idx + 1)}
                            className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-brand-500 hover:bg-brand-600 text-white shadow-xs'
                            }`}
                          >
                            {isChecked ? t('driver_btn_checkedin') : t('driver_btn_checkin')}
                          </button>
                        </div>
                      ) : (
                        <div className="pt-3 border-t border-slate-100 mt-2">
                          <form onSubmit={handleVerifyOtp} className="space-y-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Enter 4-Digit Buyer Delivery OTP <span className="text-red-500">*</span>
                              </label>
                              <div className="flex gap-2">
                                <div className="relative flex-1">
                                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                  <input
                                    type="text"
                                    maxLength="4"
                                    value={enteredOtp}
                                    onChange={(e) => setEnteredOtp(e.target.value)}
                                    placeholder="Enter OTP (e.g. 8824)"
                                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-sm tracking-widest focus:border-amber-500 focus:bg-white focus:outline-none"
                                  />
                                </div>
                                <button
                                  type="submit"
                                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
                                >
                                  {t('driver_btn_verify_otp')}
                                </button>
                              </div>
                              {otpError && (
                                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  <span>{otpError}</span>
                                </p>
                              )}
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Driver Earnings & Vehicle Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-emerald-900/10 shadow-sm space-y-4 sticky top-20">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <span>Trip Settlement</span>
              </h3>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Digital Wallet
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                <div className="text-[11px] text-emerald-900 font-medium">Guaranteed Trip Fee:</div>
                <div className="text-2xl font-extrabold text-brand-700 font-mono">₹{driverInfo.payout_inr}.00</div>
                <div className="text-[10px] text-emerald-800">Auto-credited upon buyer OTP verification</div>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex justify-between text-slate-600">
                  <span>Vehicle Model:</span>
                  <span className="font-semibold text-slate-800">{driverInfo.vehicle_type}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Capacity:</span>
                  <span className="font-semibold text-slate-800 font-mono">1,000 kg</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Milk-Run Region:</span>
                  <span className="font-semibold text-slate-800">Saswad - Pune Corridor</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => selectRole('admin')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>View Admin Logistics Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
