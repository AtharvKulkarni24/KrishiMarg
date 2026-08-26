import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { apiClient } from '../../services/api';
import { MOCK_CROPS_BENCHMARK } from '../../services/mockData';
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
  const { addProduceLot, availableLots, setDemoStep } = useApp();

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
        console.error(err);
      } finally {
        setIsLoadingForecast(false);
      }
    }
    loadForecast();
  }, [formData.crop_name]);

  const handleSubmitListing = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        farmer_id: formData.farmer_id,
        farmer_name: formData.is_fpo ? `${formData.farmer_name} (FPO Aggregation)` : formData.farmer_name,
        crop_name: formData.crop_name,
        quantity_kg: Number(formData.quantity_kg),
        quality_grade: formData.quality_grade,
        harvest_date: formData.harvest_date,
        location: {
          latitude: Number(formData.latitude),
          longitude: Number(formData.longitude),
          area_name: formData.area_preset === 'saswad' ? 'Saswad Farm Cluster' : formData.area_preset === 'purandar' ? 'Purandar Valley' : 'Jejuri Agro Hub'
        }
      };

      const result = await apiClient.submitProduceListing(payload);
      setSubmissionResult(result);
      addProduceLot({ ...payload, ...result });
      setDemoStep(2); // Advance demo pitch step to Buyer
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const extraFarmerEarnings = ((benchmark.fair_payout - benchmark.mandi_price) * formData.quantity_kg).toFixed(0);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl glass-panel border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-brand-500/20 text-brand-400">
              <Sprout className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold font-heading text-white">Farmer & FPO Supply Portal</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20">
              Verified Producer ID: f_101
            </span>
          </div>
          <p className="text-slate-400 text-xs md:text-sm">
            List your harvest with Agmark grading, lock in guaranteed fair-price realization (+15-20%), and utilize AI time-series harvest guidance.
          </p>
        </div>

        {/* Quick Stat Pill */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900/90 border border-brand-500/30">
          <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-400">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Guaranteed Premium</div>
            <div className="text-sm font-bold text-brand-300">+20% over Mandi</div>
          </div>
        </div>
      </div>

      {/* Grid: Form (Left) & USP Insights (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Produce Listing Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>List New Produce Lot</span>
                  <span className="text-xs font-normal text-slate-400">(नया उत्पाद दर्ज करें)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Enter harvest details to calculate dynamic Fair-Price Corridor</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-300 font-medium cursor-pointer flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={formData.is_fpo}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_fpo: e.target.checked }))}
                    className="w-4 h-4 rounded text-brand-600 bg-slate-900 border-slate-700 focus:ring-brand-500"
                  />
                  <span>FPO Lot Aggregation</span>
                </label>
              </div>
            </div>

            <form onSubmit={handleSubmitListing} className="space-y-4">
              
              {/* Crop Selection & Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Crop Commodity <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.crop_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, crop_name: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500"
                  >
                    <option value="Tomato">Tomato (टमाटर)</option>
                    <option value="Onion">Onion (प्याज़)</option>
                    <option value="Potato">Potato (आलू)</option>
                    <option value="Cauliflower">Cauliflower (गोभी)</option>
                    <option value="Green Chili">Green Chili (हरी मिर्च)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Harvest Quantity (kg) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="50"
                    step="50"
                    value={formData.quantity_kg}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity_kg: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500 font-mono"
                    placeholder="e.g. 500"
                    required
                  />
                </div>
              </div>

              {/* Agmark Quality Grade & Harvest Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Agmark Quality Grade <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.quality_grade}
                    onChange={(e) => setFormData(prev => ({ ...prev, quality_grade: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500"
                  >
                    <option value="A">Grade A (Premium / Table Purpose)</option>
                    <option value="B">Grade B (Standard Market Grade)</option>
                    <option value="C">Grade C (Processing / Puree / Sauce)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Expected Harvest Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.harvest_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, harvest_date: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>
              </div>

              {/* Farm Location Preset (Pune/Saswad coordinates) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Farm Location Coordinates (PostGIS Point)
                  </label>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleLocationPreset('saswad')}
                      className={`text-[10px] px-2 py-0.5 rounded ${formData.area_preset === 'saswad' ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                    >
                      Saswad
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLocationPreset('purandar')}
                      className={`text-[10px] px-2 py-0.5 rounded ${formData.area_preset === 'purandar' ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                    >
                      Purandar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLocationPreset('jejuri')}
                      className={`text-[10px] px-2 py-0.5 rounded ${formData.area_preset === 'jejuri' ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                    >
                      Jejuri
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-500">Lat:</span>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.latitude}
                      onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs font-mono"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-500">Lon:</span>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.longitude}
                      onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* USP 1: Fair-Price Corridor Dynamic Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-500/40 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <Sparkles className="w-4 h-4" />
                    <span>USP 1: Fair-Price Corridor Calculation</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Live APMC Mandi Benchmark</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase">Mandi Rate</div>
                    <div className="text-sm font-bold text-slate-300 mt-0.5 line-through decoration-red-400">
                      ₹{benchmark.mandi_price.toFixed(2)}/kg
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-900/40 border border-emerald-500/50">
                    <div className="text-[10px] text-emerald-300 font-semibold uppercase">Your Payout (+20%)</div>
                    <div className="text-base font-extrabold text-emerald-300 mt-0.5">
                      ₹{benchmark.fair_payout.toFixed(2)}/kg
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase">Retail Store Ref</div>
                    <div className="text-sm font-bold text-amber-400 mt-0.5">
                      ₹{benchmark.retail_price.toFixed(2)}/kg
                    </div>
                  </div>
                </div>

                <div className="text-xs text-emerald-400/90 flex items-center justify-between pt-1 border-t border-emerald-500/20">
                  <span>Additional Net Earnings on this Lot:</span>
                  <span className="font-bold text-emerald-300">+₹{extraFarmerEarnings} (Direct Benefit)</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Listing Produce Lot...</span>
                  </span>
                ) : (
                  <>
                    <span>Submit Listing & Lock Fair-Price</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Submission Success Confirmation Modal / Banner */}
          {submissionResult && (
            <div className="p-4 rounded-2xl bg-brand-950/80 border border-brand-500/50 flex items-start gap-3 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs space-y-1">
                <div className="font-bold text-white flex items-center gap-2">
                  <span>Lot #{submissionResult.lot_id} Successfully Listed!</span>
                  <span className="px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 font-mono text-[10px]">
                    Status: {submissionResult.status}
                  </span>
                </div>
                <p className="text-slate-300">
                  Your lot of <strong>{submissionResult.quantity_kg}kg {submissionResult.crop_name}</strong> is now live on the 50km buyer marketplace with guaranteed payout of <strong>₹{submissionResult.guaranteed_payout.toFixed(2)}/kg</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AI Demand Forecasting & Smart Advisory (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* AI Smart Advisory Card */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">AI Demand & Price Forecast</h3>
                  <p className="text-[11px] text-slate-400">Facebook Prophet Time-Series ML</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-amber-500/30">
                7-Day Horizon
              </span>
            </div>

            {/* Prophet Chart */}
            <div className="h-52 w-full pt-2">
              {forecastData?.forecast_trend ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastData.forecast_trend}>
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="#64748b" tick={{ fontSize: 10 }} unit="₹" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(val) => [`₹${val.toFixed(2)}/kg`, 'Predicted Price']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#10b981" 
                      strokeWidth={2.5}
                      fillOpacity={1} 
                      fill="url(#priceGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-500">
                  Loading ML forecast curve...
                </div>
              )}
            </div>

            {/* Rule-Based Deterministic Advisory Banner */}
            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>Harvest Advisory Rule</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-100/90">
                {forecastData?.advisory_text || "Market demand is peaking next week. Delay harvest by 2 days for higher profit margins."}
              </p>
            </div>
          </div>

          {/* Active Farmer Lots in Region */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-400" />
              <span>Your Active Produce Lots ({availableLots.length})</span>
            </h3>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {availableLots.map((lot) => (
                <div 
                  key={lot.lot_id}
                  className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <span>{lot.crop_name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {lot.quality_grade ? `Grade ${lot.quality_grade}` : 'Grade A'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {lot.quantity_kg} kg • {lot.location?.area_name || 'Saswad Hub'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-400">₹{lot.price_per_kg?.toFixed(2) || '20.00'}/kg</div>
                    <span className="text-[10px] text-brand-400/80">Active</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
