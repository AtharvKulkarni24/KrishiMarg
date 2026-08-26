import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { apiClient } from '../../services/api';
import { MOCK_CROPS_BENCHMARK } from '../../services/mockData';
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
  const { addProduceLot, availableLots, setDemoStep, addToast, t } = useApp();

  // Form State
  const [formData, setFormData] = useState({
    farmer_id: 'f_101',
    farmer_name: 'Ramesh Patil',
    crop_name: 'Tomato',
    quantity_kg: 500,
    quality_grade: 'A',
    harvest_date: '2026-08-28',
    is_fpo: false,
    latitude: 18.3489,
    longitude: 74.0312,
    area_preset: 'saswad'
  });

  const [formErrors, setFormErrors] = useState({});
  const [forecastData, setForecastData] = useState(null);
  const [isLoadingForecast, setIsLoadingForecast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  // Benchmarks for selected crop
  const benchmark = MOCK_CROPS_BENCHMARK[formData.crop_name] || {
    mandi_price: 15.00,
    retail_price: 25.00,
    fair_payout: 18.00,
    buyer_price: 20.00
  };

  // Location Presets
  const handleLocationPreset = (preset) => {
    if (preset === 'saswad') {
      setFormData(prev => ({ ...prev, area_preset: 'saswad', latitude: 18.3489, longitude: 74.0312 }));
    } else if (preset === 'purandar') {
      setFormData(prev => ({ ...prev, area_preset: 'purandar', latitude: 18.3245, longitude: 74.0118 }));
    } else if (preset === 'jejuri') {
      setFormData(prev => ({ ...prev, area_preset: 'jejuri', latitude: 18.2890, longitude: 74.0520 }));
    }
  };

  // Fetch forecast whenever crop changes
  useEffect(() => {
    async function loadForecast() {
      setIsLoadingForecast(true);
      try {
        const data = await apiClient.getPriceForecast(formData.crop_name);
        setForecastData(data);
      } catch (err) {
        addToast(t('toast_forecast_error', { err: err.message }), 'error');
      } finally {
        setIsLoadingForecast(false);
      }
    }
    loadForecast();
  }, [formData.crop_name]);

  const validateForm = () => {
    const errors = {};
    if (!formData.quantity_kg || Number(formData.quantity_kg) < 50) {
      errors.quantity_kg = t('err_min_volume');
    }
    if (!formData.harvest_date) {
      errors.harvest_date = t('err_harvest_date');
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
      const payload = {
        farmer_id: formData.farmer_id,
        farmer_name: formData.is_fpo ? `${formData.farmer_name} (FPO Lot Aggregation)` : formData.farmer_name,
        crop_name: formData.crop_name,
        quantity_kg: Number(formData.quantity_kg),
        quality_grade: formData.quality_grade,
        harvest_date: formData.harvest_date,
        location: {
          latitude: Number(formData.latitude),
          longitude: Number(formData.longitude),
          area_name: formData.area_preset === 'saswad' ? 'Saswad Farm Cluster, Purandar' : formData.area_preset === 'purandar' ? 'Purandar Agro Valley' : 'Jejuri Agro Hub'
        }
      };

      const result = await apiClient.submitProduceListing(payload);
      setSubmissionResult(result);
      addProduceLot({ ...payload, ...result });
      setDemoStep(2); // Advance demo pitch step to Buyer
    } catch (err) {
      addToast(t('toast_listing_error', { err: err.message }), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const extraFarmerEarnings = ((benchmark.fair_payout - benchmark.mandi_price) * (formData.quantity_kg || 0)).toFixed(0);

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
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
              {t('farmer_producer_id')}
            </span>
          </div>
          <p className="text-slate-600 text-xs md:text-sm">
            {t('farmer_portal_sub')}
          </p>
        </div>

        {/* Quick Stat Pill */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-brand-700">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-emerald-900/70 font-medium">{t('farmer_guaranteed_badge_label')}</div>
            <div className="text-sm font-extrabold text-brand-700">{t('farmer_guaranteed_badge_val')}</div>
          </div>
        </div>
      </div>

      {/* Grid: Form (Left) & Insights (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Produce Listing Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-emerald-900/10 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
              <div>
                <h3 className="text-base font-bold text-emerald-950 flex items-center gap-2">
                  <span>{t('farmer_form_title')}</span>
                  <span className="text-xs font-normal text-slate-500">{t('farmer_form_sub_title')}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{t('farmer_form_desc')}</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-700 font-medium cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50/70 border border-emerald-200 hover:border-brand-500 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.is_fpo}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_fpo: e.target.checked }))}
                    className="w-4 h-4 rounded text-brand-600 border-slate-300 focus:ring-brand-500 cursor-pointer"
                  />
                  <span className="text-emerald-950 font-semibold">{t('farmer_fpo_toggle')}</span>
                </label>
              </div>
            </div>

            <form onSubmit={handleSubmitListing} className="space-y-4">
              
              {/* Crop Selection & Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('farmer_crop_label')} <span className="text-red-500">*</span>
                  </label>
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
                  <input
                    type="number"
                    min="50"
                    step="50"
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

              {/* Agmark Quality Grade & Harvest Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('farmer_grade_label')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.quality_grade}
                    onChange={(e) => setFormData(prev => ({ ...prev, quality_grade: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500 transition-colors"
                  >
                    <option value="A">{t('grade_a')}</option>
                    <option value="B">{t('grade_b')}</option>
                    <option value="C">{t('grade_c')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('farmer_date_label')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.harvest_date}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, harvest_date: e.target.value }));
                      if (formErrors.harvest_date) setFormErrors(prev => ({ ...prev, harvest_date: null }));
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border text-slate-800 text-sm focus:outline-none focus:bg-white transition-colors ${
                      formErrors.harvest_date ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
                    }`}
                    required
                  />
                  {formErrors.harvest_date && (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{formErrors.harvest_date}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Farm Location Preset (Pune/Saswad coordinates) */}
              <div>
                <div className="flex flex-wrap items-center justify-between mb-1.5 gap-2">
                  <label className="text-xs font-semibold text-slate-700">
                    {t('farmer_location_label')}
                  </label>
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
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-medium">{t('farmer_lat_label')}</span>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.latitude}
                      onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                      className="w-full pl-12 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-mono focus:border-brand-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-medium">{t('farmer_lon_label')}</span>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.longitude}
                      onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                      className="w-full pl-12 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-mono focus:border-brand-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* USP 1: Fair-Price Corridor Dynamic Card */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-300 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-brand-700 font-bold">
                    <Sparkles className="w-4 h-4 text-brand-600" />
                    <span>{t('farmer_usp1_title')}</span>
                  </div>
                  <span className="text-[11px] text-emerald-800 font-medium">{t('farmer_usp1_sub')}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2.5 rounded-xl bg-white border border-emerald-200/80 shadow-xs">
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">{t('farmer_mandi_rate')}</div>
                    <div className="text-sm font-bold text-slate-400 mt-0.5 line-through decoration-red-400">
                      ₹{benchmark.mandi_price.toFixed(2)}/kg
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                    <div className="text-[10px] text-emerald-100 font-bold uppercase">{t('farmer_your_payout')}</div>
                    <div className="text-base font-extrabold text-white mt-0.5">
                      ₹{benchmark.fair_payout.toFixed(2)}/kg
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-emerald-200/80 shadow-xs">
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">{t('farmer_retail_ref')}</div>
                    <div className="text-sm font-bold text-amber-700 mt-0.5">
                      ₹{benchmark.retail_price.toFixed(2)}/kg
                    </div>
                  </div>
                </div>

                <div className="text-xs text-emerald-950 flex items-center justify-between pt-1 border-t border-emerald-200 font-medium">
                  <span>{t('farmer_extra_earnings')}</span>
                  <span className="font-bold text-brand-700 text-sm">+₹{extraFarmerEarnings} ({t('farmer_direct_benefit')})</span>
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
                <div className="font-bold text-emerald-950 flex items-center gap-2">
                  <span>{t('farmer_success_title', { lot_id: submissionResult.lot_id })}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-900 font-mono text-[10px] font-bold">
                    {submissionResult.status}
                  </span>
                </div>
                <p className="text-emerald-900 leading-relaxed">
                  {t('farmer_success_desc', {
                    qty: submissionResult.quantity_kg,
                    crop: submissionResult.crop_name,
                    payout: submissionResult.guaranteed_payout.toFixed(2)
                  })}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AI Demand Forecasting & Smart Advisory (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* AI Smart Advisory Card */}
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

            {/* Prophet Chart */}
            <div className="h-52 w-full pt-2">
              {isLoadingForecast ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-500 space-y-2 flex-col">
                  <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                  <span>{t('farmer_loading_forecast')}</span>
                </div>
              ) : forecastData?.forecast_trend ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastData.forecast_trend}>
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
                      formatter={(val) => [`₹${val.toFixed(2)}/kg`, t('farmer_predicted_price')]}
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
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  {t('farmer_no_forecast', { crop: formData.crop_name })}
                </div>
              )}
            </div>

            {/* Rule-Based Deterministic Advisory Banner */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-800">
                <Sparkles className="w-4 h-4 shrink-0 text-amber-600" />
                <span>{t('farmer_advisory_title')}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-900">
                {forecastData?.advisory_text || "Market demand is peaking next week in the Pune HoReCa belt. Delay harvest by 2 days for higher profit margins."}
              </p>
            </div>
          </div>

          {/* Active Farmer Lots in Region */}
          <div className="p-6 rounded-2xl bg-white border border-emerald-900/10 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-600" />
                <span>{t('farmer_active_lots_title')}</span>
              </h3>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
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
                {availableLots.map((lot) => (
                  <div 
                    key={lot.lot_id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-brand-500/40 flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                        <span>{lot.crop_name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-white text-emerald-800 border border-emerald-200 font-medium">
                          {lot.quality_grade ? `Grade ${lot.quality_grade}` : 'Grade A'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                        {lot.quantity_kg} kg • {lot.location?.area_name || 'Saswad Hub'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-brand-700 font-mono">₹{lot.price_per_kg?.toFixed(2) || '20.00'}/kg</div>
                      <span className="text-[10px] font-bold text-brand-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        {t('farmer_lot_status_active')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
