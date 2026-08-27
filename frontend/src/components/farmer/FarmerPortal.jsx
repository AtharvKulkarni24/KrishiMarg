import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { apiClient } from '../../services/api';
import EmptyState from '../common/EmptyState';
import { 
  Sprout, 
  TrendingUp, 
  Scale, 
  MapPin, 
  Calendar, 
  Layers, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Info,
  AlertCircle,
  PackageOpen,
  DollarSign
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Area,
  AreaChart
} from 'recharts';

export default function FarmerPortal() {
  const { addProduceLot, availableLots, setDemoStep, addToast, currentUser, t } = useApp();

  // Form State (strictly contract aligned)
  const [formData, setFormData] = useState({
    farmer_id: currentUser?.user_id || 'f_101',
    crop_name: 'Tomato',
    quantity_kg: 500,
    price_per_kg: 18.00,
    harvest_date: new Date().toISOString().split('T')[0],
    latitude: 18.3489,
    longitude: 74.0312,
    area_preset: 'saswad'
  });

  const [formErrors, setFormErrors] = useState({});
  const [insightsData, setInsightsData] = useState(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  // Location Presets (unchanged coordinates)
  const handleLocationPreset = (preset) => {
    if (preset === 'saswad') {
      setFormData(prev => ({ ...prev, area_preset: 'saswad', latitude: 18.3489, longitude: 74.0312 }));
    } else if (preset === 'purandar') {
      setFormData(prev => ({ ...prev, area_preset: 'purandar', latitude: 18.3245, longitude: 74.0118 }));
    } else if (preset === 'jejuri') {
      setFormData(prev => ({ ...prev, area_preset: 'jejuri', latitude: 18.2890, longitude: 74.0520 }));
    }
  };

  // Fetch insights (GET /api/v1/farmer/insights?crop=...) whenever crop changes
  useEffect(() => {
    async function loadInsights() {
      setIsLoadingInsights(true);
      try {
        const data = await apiClient.getFarmerInsights(formData.crop_name);
        setInsightsData(data);
        if (data?.current_mandi_price) {
          setFormData(prev => ({
            ...prev,
            price_per_kg: prev.price_per_kg || Number((data.current_mandi_price * 1.2).toFixed(2))
          }));
        }
      } catch (err) {
        addToast(t('toast_forecast_error', { err: err.message }), 'error');
      } finally {
        setIsLoadingInsights(false);
      }
    }
    loadInsights();
  }, [formData.crop_name]);

  const validateForm = () => {
    const errors = {};
    if (!formData.quantity_kg || Number(formData.quantity_kg) < 1) {
      errors.quantity_kg = t('err_min_volume');
    }
    if (!formData.price_per_kg || Number(formData.price_per_kg) <= 0) {
      errors.price_per_kg = t('err_price');
    }
    if (!formData.latitude || formData.latitude < 8 || formData.latitude > 37) {
      errors.latitude = t('err_latitude');
    }
    if (!formData.longitude || formData.longitude < 68 || formData.longitude > 98) {
      errors.longitude = t('err_longitude');
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitListing = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      addToast(t('err_form_fix'), 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const submissionDate = new Date().toISOString().split('T')[0];
      const payload = {
        farmer_id: currentUser?.user_id || 'f_101',
        crop_name: formData.crop_name,
        quantity_kg: Number(formData.quantity_kg),
        price_per_kg: Number(formData.price_per_kg),
        harvest_date: submissionDate,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude)
      };

      const result = await apiClient.submitProduceListing(payload);
      setSubmissionResult(result);

      // Add to shared available lots in UI
      const newLot = {
        lot_id: result.lot_id,
        farmer_id: payload.farmer_id,
        crop_name: payload.crop_name,
        quantity_kg: payload.quantity_kg,
        price_per_kg: payload.price_per_kg,
        harvest_date: payload.harvest_date,
        distance_km: 28.4,
        latitude: payload.latitude,
        longitude: payload.longitude,
        status: 'AVAILABLE'
      };
      addProduceLot(newLot);
      setDemoStep(2); // Advance demo pitch step to Buyer
    } catch (err) {
      addToast(t('toast_listing_error', { err: err.message }), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const mandiPrice = insightsData?.current_mandi_price || 15.00;
  const minPrice = insightsData?.min_price || 12.00;
  const maxPrice = insightsData?.max_price || 18.00;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 w-full">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-emerald-900/10 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-emerald-50 text-brand-600 border border-emerald-200">
              <Sprout className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold font-heading text-emerald-950">
              {t('farmer_portal_title')}
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200 font-mono">
              {currentUser?.user_id || 'f_101'}
            </span>
          </div>
          <p className="text-slate-800 text-xs md:text-sm font-bold">
            {t('farmer_portal_sub')}
          </p>
          <p className="text-slate-500 text-xs mt-0.5 font-normal">
            {t('farmer_portal_sub_note')}
          </p>
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-brand-700 font-bold">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-emerald-900/70 font-medium">{t('farmer_guaranteed_badge_label')}</div>
            <div className="text-sm font-extrabold text-brand-700">{currentUser?.full_name || 'Ramesh Patil'}</div>
          </div>
        </div>
      </div>

      {/* Grid: Form (Left) & Insights (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Produce Listing Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-emerald-900/10 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-emerald-950 flex items-center gap-2">
                <span>{t('farmer_form_title')}</span>
                <span className="text-xs font-normal text-slate-500">{t('farmer_form_sub_title')}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{t('farmer_form_desc')}</p>
            </div>

            <form onSubmit={handleSubmitListing} className="space-y-4">
              
              {/* Crop Selection & Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('farmer_crop_label')} <span className="text-red-500">*</span>
                  </label>
                  <p className="text-[11px] text-slate-500 mb-1">{t('farmer_crop_helper')}</p>
                  <select
                    value={formData.crop_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, crop_name: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500 transition-colors"
                  >
                    <option value="Tomato">{t('crop_tomato_detail')}</option>
                    <option value="Onion">{t('crop_onion_detail')}</option>
                    <option value="Potato">{t('crop_potato_detail')}</option>
                    <option value="Cauliflower">{t('crop_cauliflower_detail')}</option>
                    <option value="Green Chili">{t('crop_chili_detail')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('farmer_quantity_label')} <span className="text-red-500">*</span>
                  </label>
                  <p className="text-[11px] text-slate-500 mb-1">{t('farmer_quantity_helper')}</p>
                  <input
                    type="number"
                    min="1"
                    step="10"
                    value={formData.quantity_kg}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, quantity_kg: e.target.value }));
                      if (formErrors.quantity_kg) setFormErrors(prev => ({ ...prev, quantity_kg: null }));
                    }}
                    placeholder={t('farmer_quantity_placeholder')}
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border text-slate-800 text-sm focus:outline-none focus:bg-white transition-colors font-mono ${
                      formErrors.quantity_kg ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
                    }`}
                    required
                  />
                  {formErrors.quantity_kg && (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{formErrors.quantity_kg}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Price per kg & Harvest Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('farmer_price_label')} <span className="text-red-500">*</span>
                  </label>
                  <p className="text-[11px] text-slate-500 mb-1">{t('farmer_price_helper')}</p>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={formData.price_per_kg}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, price_per_kg: e.target.value }));
                      if (formErrors.price_per_kg) setFormErrors(prev => ({ ...prev, price_per_kg: null }));
                    }}
                    placeholder={t('farmer_price_placeholder')}
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border text-slate-800 text-sm focus:outline-none focus:bg-white transition-colors font-mono ${
                      formErrors.price_per_kg ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
                    }`}
                    required
                  />
                  {formErrors.price_per_kg && (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{formErrors.price_per_kg}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('farmer_date_label')} <span className="text-[10px] text-slate-400 font-normal">({t('farmer_date_auto')})</span>
                  </label>
                  <p className="text-[11px] text-slate-500 mb-1">{t('farmer_portal_sub_note')}</p>
                  <div className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/90 border border-slate-200 text-slate-600 text-sm font-mono flex items-center justify-between cursor-not-allowed select-none">
                    <span>{formData.harvest_date}</span>
                    <Calendar className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Farm Location Preset (latitude & longitude) */}
              <div>
                <div className="flex flex-wrap items-center justify-between mb-1 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block">
                      {t('farmer_location_label')}
                    </label>
                    <p className="text-[11px] text-slate-500">{t('farmer_location_helper')}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleLocationPreset('saswad')}
                      className={`text-[11px] px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                        formData.area_preset === 'saswad' 
                          ? 'bg-brand-500 text-white font-bold shadow-xs' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {t('farmer_preset_saswad')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLocationPreset('purandar')}
                      className={`text-[11px] px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                        formData.area_preset === 'purandar' 
                          ? 'bg-brand-500 text-white font-bold shadow-xs' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {t('farmer_preset_purandar')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLocationPreset('jejuri')}
                      className={`text-[11px] px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                        formData.area_preset === 'jejuri' 
                          ? 'bg-brand-500 text-white font-bold shadow-xs' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {t('farmer_preset_jejuri')}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-1.5">
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-[11px] text-slate-400 font-medium">{t('farmer_lat_label')}</span>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.latitude}
                      onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-50/80 border border-slate-200 text-slate-700 text-xs font-mono focus:border-brand-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-[11px] text-slate-400 font-medium">{t('farmer_lon_label')}</span>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.longitude}
                      onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-50/80 border border-slate-200 text-slate-700 text-xs font-mono focus:border-brand-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Mandi Thresholds Benchmark Card */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-300 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-brand-700 font-bold">
                    <Sparkles className="w-4 h-4 text-brand-600" />
                    <span>{t('farmer_mandi_thresholds_title')}</span>
                  </div>
                  <span className="text-[11px] text-emerald-800 font-medium">{t('farmer_mandi_thresholds_sub')}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2.5 rounded-xl bg-white border border-emerald-200/80 shadow-xs">
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">{t('farmer_min_price')}</div>
                    <div className="text-sm font-bold text-slate-700 mt-0.5 font-mono">
                      ₹{minPrice.toFixed(2)}/kg
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                    <div className="text-[10px] text-emerald-100 font-bold uppercase">{t('farmer_current_mandi')}</div>
                    <div className="text-base font-extrabold text-white mt-0.5 font-mono">
                      ₹{mandiPrice.toFixed(2)}/kg
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-emerald-200/80 shadow-xs">
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">{t('farmer_max_price')}</div>
                    <div className="text-sm font-bold text-amber-700 mt-0.5 font-mono">
                      ₹{maxPrice.toFixed(2)}/kg
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-98"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t('farmer_btn_submitting')}</span>
                  </span>
                ) : (
                  <>
                    <span>{t('farmer_btn_submit')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Submission Success Confirmation Banner */}
          {submissionResult && (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-start gap-3.5 animate-fade-in shadow-sm">
              <CheckCircle2 className="w-6 h-6 text-brand-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs space-y-1.5">
                <div className="font-bold text-emerald-950 text-sm">
                  {t('farmer_success_title')}
                </div>
                <div className="font-extrabold text-emerald-900 text-xs font-mono">
                  {formData.crop_name} • {formData.quantity_kg} kg • ₹{Number(formData.price_per_kg).toFixed(0)}/kg
                </div>
                <p className="text-emerald-900 leading-relaxed">
                  {t('farmer_success_desc')}
                </p>
                <div className="text-[11px] text-emerald-800/80 font-mono">
                  {t('farmer_success_lot_id', { lot_id: submissionResult.lot_id })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: 7-Day Price Forecast & Listed Lots (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Price Forecast Card */}
          <div className="p-6 rounded-2xl bg-white border border-emerald-900/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-950">{t('farmer_ai_forecast_title')}</h3>
                  <p className="text-[11px] text-slate-500">{t('farmer_ai_forecast_sub')}</p>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                {t('farmer_7day_horizon')}
              </span>
            </div>

            {/* Price Forecast Chart */}
            <div className="h-52 w-full pt-2">
              {isLoadingInsights ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-500 space-y-2 flex-col">
                  <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                  <span>{t('farmer_loading_forecast')}</span>
                </div>
              ) : insightsData?.ml_7_day_forecast ? (
                <>
                  <ResponsiveContainer width="100%" height="90%">
                    <AreaChart data={insightsData.ml_7_day_forecast}>
                      <defs>
                        <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0caf3d" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#0caf3d" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="#94a3b8" tick={{ fontSize: 10 }} unit="₹" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#bbf7d0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                        formatter={(val) => [`₹${Number(val).toFixed(2)}/kg`, t('farmer_predicted_price')]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#0caf3d" 
                        strokeWidth={2.5}
                        fillOpacity={1} 
                        fill="url(#priceGradient)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="text-[11px] text-slate-400 text-center pt-1 font-medium">
                    {t('farmer_forecast_note')}
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  {t('farmer_no_forecast', { crop: formData.crop_name })}
                </div>
              )}
            </div>

            {/* Harvest Recommendation Card */}
            {insightsData?.harvest_suggestion && (() => {
              const text = insightsData.harvest_suggestion.toLowerCase();
              const isWait = text.includes('delay') || text.includes('wait') || text.includes('peaking');
              const actionBadge = isWait ? t('farmer_action_wait') : t('farmer_action_sell');

              return (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-950 text-sm">{t('farmer_advisory_title')}</span>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                      isWait 
                        ? 'bg-amber-200 text-amber-900 border-amber-300' 
                        : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    }`}>
                      {actionBadge}
                    </span>
                  </div>
                  <p className="text-xs font-semibold leading-relaxed text-amber-950">
                    {insightsData.harvest_suggestion}
                  </p>
                  <p className="text-[11px] text-amber-800/80 pt-1.5 border-t border-amber-200/60 font-medium">
                    {t('farmer_advisory_footer')}
                  </p>
                </div>
              );
            })()}
          </div>

          {/* My Listed Produce */}
          <div className="p-6 rounded-2xl bg-white border border-emerald-900/10 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-600" />
                <span>{t('farmer_active_lots_title')}</span>
              </h3>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 font-mono">
                {t('farmer_active_count', { count: availableLots.length })}
              </span>
            </div>

            {availableLots.length === 0 ? (
              <EmptyState
                icon={PackageOpen}
                title={t('farmer_no_lots_title')}
                description={t('farmer_no_lots_desc')}
                className="py-6 border-0 bg-transparent"
              />
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {availableLots.map((lot) => {
                  const cropEmoji = lot.crop_name === 'Tomato' ? '🍅' 
                    : lot.crop_name === 'Onion' ? '🧅' 
                    : lot.crop_name === 'Potato' ? '🥔' 
                    : lot.crop_name === 'Cauliflower' ? '🥦' 
                    : lot.crop_name === 'Green Chili' ? '🌶️' : '🌾';

                  return (
                    <div 
                      key={lot.lot_id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-brand-500/40 flex items-center justify-between text-xs transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                          <span>{cropEmoji} {lot.crop_name}</span>
                        </div>
                        <div className="text-xs text-slate-700 font-medium">
                          {lot.quantity_kg} kg • ₹{Number(lot.price_per_kg).toFixed(2)}/kg
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {t('farmer_lot_id_label', { lot_id: lot.lot_id })}
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <span className="text-[11px] font-bold text-brand-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                          {lot.status === 'AVAILABLE' ? t('farmer_lot_status_available') : (lot.status || t('farmer_lot_status_sold'))}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {lot.harvest_date}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
