import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { apiClient } from '../../services/api';
import { CROP_IMAGES, DEFAULT_CROP_IMAGE, MOCK_USERS } from '../../services/mockData';
import EmptyState from '../common/EmptyState';
import FarmerHeader from './FarmerHeader';
import InsightsPanel from './InsightsPanel';
import ProduceListingForm from './ProduceListingForm';
import ActiveListings from './ActiveListings';
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
  AlertCircle,
  PackageOpen,
  Camera,
  Image as ImageIcon,
  RotateCcw,
  X,
  Bell,
  PlusCircle,
  Check,
  Clock,
  ExternalLink,
  Leaf
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Area, 
  AreaChart 
} from 'recharts';

export default function FarmerPortal() {
  const { 
    addProduceLot, 
    updateProduceLotQuantity,
    farmerNotifications,
    markFarmerNotificationRead,
    markAllFarmerNotificationsRead,
    availableLots, 
    setDemoStep, 
    addToast, 
    currentUser, 
    t 
  } = useApp();

  const farmerId = currentUser?.user_id || 'f_101';

  // Form State
  const [formData, setFormData] = useState({
    farmer_id: farmerId,
    crop_name: 'Tomato',
    quantity_kg: 500,
    price_per_kg: 18.00,
    harvest_date: new Date().toISOString().split('T')[0],
    latitude: 18.3489,
    longitude: 74.0312,
    area_preset: 'saswad',
    image_url: CROP_IMAGES['Tomato'] || DEFAULT_CROP_IMAGE
  });

  // Feature 2: Update Existing Lot State & Modal
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedLotToUpdate, setSelectedLotToUpdate] = useState(null);
  const [newHarvestQty, setNewHarvestQty] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [isUpdatingLot, setIsUpdatingLot] = useState(false);
  const [updateSuccessBanner, setUpdateSuccessBanner] = useState(null);

  const [insightsData, setInsightsData] = useState(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  // Filter active lots owned by this farmer
  const myActiveLots = useMemo(() => {
    return (availableLots || []).filter(l => l.farmer_id === farmerId && l.status !== 'SOLD');
  }, [availableLots, farmerId]);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowUpdateModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch insights whenever crop changes
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

  // --- Feature 2: Update Existing Lot Handlers ---
  const handleOpenUpdateModal = (lot = null) => {
    if (lot) {
      setSelectedLotToUpdate(lot);
    } else if (myActiveLots.length === 1) {
      setSelectedLotToUpdate(myActiveLots[0]);
    } else {
      setSelectedLotToUpdate(null);
    }
    setNewHarvestQty('');
    setUpdateError('');
    setShowUpdateModal(true);
  };

  const handleConfirmUpdateQuantity = async (e) => {
    e.preventDefault();
    if (!selectedLotToUpdate) return;

    const qtyNumber = Number(newHarvestQty);
    if (!newHarvestQty || isNaN(qtyNumber) || qtyNumber <= 0) {
      setUpdateError(t('farmer_update_err_qty'));
      return;
    }

    setIsUpdatingLot(true);
    setUpdateError('');

    try {
      const res = await updateProduceLotQuantity(selectedLotToUpdate.lot_id, qtyNumber);
      if (res) {
        setUpdateSuccessBanner({
          crop: res.crop_name,
          lot_id: res.lot_id,
          prev: res.prevQty,
          added: res.addedQty,
          total: res.newQty
        });
      }
      setShowUpdateModal(false);
      setSelectedLotToUpdate(null);
      setNewHarvestQty('');
    } catch (err) {
      setUpdateError(err.message || 'Failed to update quantity');
    } finally {
      setIsUpdatingLot(false);
    }
  };

  const mandiPrice = insightsData?.current_mandi_price || 15.00;
  const minPrice = insightsData?.min_price || 12.00;
  const maxPrice = insightsData?.max_price || 18.00;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 w-full relative">
      
      {/* Grid: Form (Left) & Insights (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* 📝 Left Column: Produce Listing Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <ProduceListingForm 
            farmerId={farmerId}
            formData={formData}
            setFormData={setFormData}
            mandiPrice={mandiPrice}
            minPrice={minPrice}
            maxPrice={maxPrice}
            handleOpenUpdateModal={handleOpenUpdateModal}
          />
        </div>

        {/* 📈 Right Column: 7-Day Price Forecast & Listed Lots (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <InsightsPanel 
            isLoadingInsights={isLoadingInsights}
            insightsData={insightsData}
            cropName={formData.crop_name}
          />

          {/* 📦 My Listed Produce with Quick Update Button */}
          <ActiveListings 
            myActiveLots={myActiveLots}
            handleOpenUpdateModal={handleOpenUpdateModal}
          />
        </div>

      </div>

      {/* 🌟 FEATURE 2 MODAL: UPDATE EXISTING PRODUCE QUANTITY */}
      {showUpdateModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setShowUpdateModal(false)}
        >
          <div 
            className="w-full max-w-lg rounded-2xl bg-white border border-emerald-900/10 shadow-2xl overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-heading text-emerald-950">
                  {t('farmer_update_modal_title')}
                </h3>
                <p className="text-xs text-slate-500">
                  {t('farmer_update_modal_sub')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowUpdateModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              
              {/* Step 1: Select Lot (if none selected) */}
              {!selectedLotToUpdate ? (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-700">
                    {t('farmer_update_select_lot')}
                  </p>

                  {myActiveLots.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 space-y-2 bg-slate-50 rounded-xl">
                      <PackageOpen className="w-8 h-8 text-slate-300 mx-auto" />
                      <p>{t('farmer_update_no_active_lots')}</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {myActiveLots.map(lot => (
                        <div
                          key={lot.lot_id}
                          className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-brand-500 flex items-center justify-between text-xs transition-colors"
                        >
                          <div>
                            <div className="font-bold text-slate-900 text-sm">
                              {lot.crop_name} <span className="text-slate-400 font-mono text-xs font-normal">({lot.lot_id})</span>
                            </div>
                            <div className="text-slate-600 mt-0.5">
                              {t('farmer_update_current_available')} <strong>{lot.quantity_kg} kg</strong> • ₹{Number(lot.price_per_kg).toFixed(0)}/kg
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedLotToUpdate(lot)}
                            className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-colors cursor-pointer"
                          >
                            Select
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Step 2: Enter Added Harvest & Visual Calculation */
                <form onSubmit={handleConfirmUpdateQuantity} className="space-y-4">
                  
                  {/* Selected Lot Header Card */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-semibold block">Active Lot</span>
                      <div className="font-bold text-emerald-950 text-base">
                        {selectedLotToUpdate.crop_name}
                      </div>
                      <div className="text-xs text-slate-600 font-mono">
                        Lot #{selectedLotToUpdate.lot_id} • ₹{Number(selectedLotToUpdate.price_per_kg).toFixed(0)}/kg
                      </div>
                    </div>
                    {myActiveLots.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setSelectedLotToUpdate(null)}
                        className="text-xs text-brand-700 hover:underline font-semibold cursor-pointer"
                      >
                        {t('farmer_update_btn_back')}
                      </button>
                    )}
                  </div>

                  {/* Quantity Input Field */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('farmer_update_new_harvest')} <span className="text-red-500">*</span>
                    </label>
                    <p className="text-[11px] text-slate-500 mb-1.5">{t('farmer_update_new_harvest_helper')}</p>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      autoFocus
                      value={newHarvestQty}
                      onChange={(e) => {
                        setNewHarvestQty(e.target.value);
                        setUpdateError('');
                      }}
                      placeholder="e.g. 10"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-base font-bold font-mono focus:bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                      required
                    />
                    {updateError && (
                      <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{updateError}</span>
                      </p>
                    )}
                  </div>

                  {/* 🧮 Live Visual Calculation Card */}
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
                    <div className="font-bold text-emerald-950 text-xs">
                      Live Quantity Calculation:
                    </div>

                    <div className="grid grid-cols-3 gap-2 items-center text-center">
                      {/* Current */}
                      <div className="bg-white p-2.5 rounded-lg border border-emerald-200">
                        <div className="text-[10px] text-slate-500 font-semibold uppercase">{t('farmer_update_calc_current')}</div>
                        <div className="text-sm font-bold text-slate-800 font-mono mt-0.5">
                          {selectedLotToUpdate.quantity_kg} kg
                        </div>
                      </div>

                      {/* Added */}
                      <div className="bg-white p-2.5 rounded-lg border border-emerald-300">
                        <div className="text-[10px] text-brand-700 font-semibold uppercase">+{t('farmer_update_calc_add')}</div>
                        <div className="text-sm font-bold text-brand-700 font-mono mt-0.5">
                          +{Number(newHarvestQty) > 0 ? Number(newHarvestQty) : 0} kg
                        </div>
                      </div>

                      {/* Total */}
                      <div className="bg-emerald-600 p-2.5 rounded-lg text-white shadow-xs">
                        <div className="text-[10px] text-emerald-100 font-bold uppercase">{t('farmer_update_calc_total')}</div>
                        <div className="text-base font-extrabold text-white font-mono mt-0.5">
                          {Number(selectedLotToUpdate.quantity_kg) + (Number(newHarvestQty) > 0 ? Number(newHarvestQty) : 0)} kg
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modal Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowUpdateModal(false)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
                    >
                      {t('farmer_update_btn_cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdatingLot || !newHarvestQty || Number(newHarvestQty) <= 0}
                      className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-all shadow-md shadow-brand-600/20 disabled:opacity-50 cursor-pointer active:scale-98"
                    >
                      {isUpdatingLot ? t('farmer_update_btn_submitting') : t('farmer_update_btn_submit')}
                    </button>
                  </div>

                </form>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
