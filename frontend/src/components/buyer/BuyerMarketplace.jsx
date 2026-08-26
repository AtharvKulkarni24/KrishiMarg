import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { apiClient } from '../../services/api';
import EmptyState from '../common/EmptyState';
import { 
  Store, 
  MapPin, 
  ShieldCheck, 
  ShoppingBag, 
  Scale, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  Truck, 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  PackageOpen,
  Calendar,
  User,
  Award
} from 'lucide-react';

// Static crop image mapping for modern grocery marketplace card presentation
const CROP_IMAGES = {
  'Tomato': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
  'Onion': 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80',
  'Potato': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80',
  'Cauliflower': 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=600&auto=format&fit=crop&q=80',
  'Green Chili': 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&auto=format&fit=crop&q=80'
};

const DEFAULT_CROP_IMAGE = 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=600&auto=format&fit=crop&q=80';

export default function BuyerMarketplace() {
  const { availableLots, createOrder, setDemoStep, selectRole, addToast, t } = useApp();

  const [selectedLots, setSelectedLots] = useState(['lot_901', 'lot_902']);
  const [selectedCropFilter, setSelectedCropFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  // Modal state for viewing product details
  const [detailsModalLot, setDetailsModalLot] = useState(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setDetailsModalLot(null);
        setCheckoutModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Buyer reference location (Kothrud, Pune)
  const buyerLocation = {
    buyer_id: 'b_501',
    buyer_name: 'Green Leaf Restaurant & Mess',
    address: 'Kothrud Central Kitchen, Pune',
    latitude: 18.5018,
    longitude: 73.8636
  };

  // Toggle selection for bulk cart
  const toggleSelectLot = (lotId) => {
    setSelectedLots(prev => 
      prev.includes(lotId) ? prev.filter(id => id !== lotId) : [...prev, lotId]
    );
  };

  // Filtered available lots
  const filteredLots = availableLots.filter(lot => {
    const matchesCrop = selectedCropFilter === 'ALL' || lot.crop_name.toLowerCase() === selectedCropFilter.toLowerCase();
    const matchesSearch = !searchQuery || 
      lot.crop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lot.farmer_name && lot.farmer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lot.location?.area_name && lot.location.area_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCrop && matchesSearch;
  });

  // Calculate order totals
  const chosenLots = availableLots.filter(l => selectedLots.includes(l.lot_id));
  const totalQuantity = chosenLots.reduce((acc, l) => acc + (l.quantity_kg || 0), 0);
  const totalProduceCost = chosenLots.reduce((acc, l) => acc + ((l.quantity_kg || 0) * (l.price_per_kg || 20)), 0);
  const estimatedLogisticsCost = chosenLots.length > 0 ? 1200.00 : 0; // pooled delivery fee
  const totalEscrowAmount = totalProduceCost + estimatedLogisticsCost;
  
  // Retail comparison cost (e.g. ₹25/kg retail vs ₹20/kg platform)
  const retailComparisonCost = totalQuantity * 25.00;
  const totalSavings = Math.max(0, retailComparisonCost - totalProduceCost);

  const handlePlaceOrder = async () => {
    if (chosenLots.length === 0) {
      addToast(t('err_select_lot'), 'warning');
      return;
    }

    setIsCheckingOut(true);
    try {
      const payload = {
        buyer_id: buyerLocation.buyer_id,
        buyer_name: buyerLocation.buyer_name,
        lot_ids: selectedLots,
        total_quantity_kg: totalQuantity,
        total_amount: totalEscrowAmount,
        dropoff_location: {
          latitude: buyerLocation.latitude,
          longitude: buyerLocation.longitude,
          address: buyerLocation.address
        },
        pickups: chosenLots.map(l => ({
          lot_id: l.lot_id,
          farmer_name: l.farmer_name,
          crop_name: l.crop_name,
          quantity_kg: l.quantity_kg,
          latitude: l.location?.latitude || 18.3489,
          longitude: l.location?.longitude || 74.0312,
          area_name: l.location?.area_name || 'Saswad Regional Cluster'
        }))
      };

      const result = await apiClient.placeOrder(payload);
      const newOrder = {
        ...payload,
        order_id: result.order_id || `ord_${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'PENDING_DISPATCH',
        payment_status: 'ESCROW_LOCKED'
      };

      createOrder(newOrder);
      setCompletedOrder(newOrder);
      setIsCheckingOut(false);
      setDemoStep(3); // Advance demo pitch step to Admin Logistics Map
    } catch (err) {
      addToast(t('toast_order_error', { err: err.message }), 'error');
      setIsCheckingOut(false);
    }
  };

  const handleProceedToLogistics = () => {
    setCheckoutModalOpen(false);
    selectRole('admin');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 w-full">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-amber-900/10 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <Store className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold font-heading text-emerald-950">
              {t('buyer_title')}
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold border border-amber-200">
              {t('buyer_badge')}
            </span>
          </div>
          <p className="text-slate-600 text-xs md:text-sm">
            {t('buyer_sub')}
          </p>
        </div>

        {/* Location & Radius Badge */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs shrink-0">
          <MapPin className="w-4 h-4 text-amber-700 shrink-0" />
          <div>
            <div className="text-[11px] text-amber-900/70 font-medium">{t('buyer_dropoff_label')}</div>
            <div className="font-bold text-emerald-950">{t('buyer_dropoff_val')}</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Marketplace Feed (8 cols) & Order Cart Summary (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Marketplace Feed (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Search & Filter Header Bar */}
          <div className="p-4 rounded-2xl bg-white border border-emerald-900/10 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('buyer_search_placeholder')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              />
            </div>

            {/* Crop Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'ALL', label: t('buyer_filter_all') },
                { id: 'Tomato', label: t('buyer_filter_tomato') },
                { id: 'Onion', label: t('buyer_filter_onion') },
                { id: 'Potato', label: t('buyer_filter_potato') }
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCropFilter(c.id)}
                  className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                    selectedCropFilter === c.id
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Heading with match count */}
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
              <span>{t('buyer_available_heading')}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold font-mono">
                {t('buyer_matches_count', { count: filteredLots.length })}
              </span>
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">{t('buyer_spatial_active')}</span>
          </div>

          {/* Grocery-Style Product Grid */}
          {filteredLots.length === 0 ? (
            <EmptyState
              icon={PackageOpen}
              title={t('buyer_cart_empty_title')}
              description={t('buyer_cart_empty_desc')}
              actionLabel={t('buyer_filter_all')}
              onAction={() => {
                setSearchQuery('');
                setSelectedCropFilter('ALL');
              }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredLots.map((lot) => {
                const isSelected = selectedLots.includes(lot.lot_id);
                const cropImg = CROP_IMAGES[lot.crop_name] || DEFAULT_CROP_IMAGE;

                return (
                  <div
                    key={lot.lot_id}
                    onClick={() => setDetailsModalLot(lot)}
                    className={`rounded-2xl bg-white border transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden group shadow-sm hover:shadow-md ${
                      isSelected
                        ? 'border-amber-500 ring-2 ring-amber-400/20'
                        : 'border-slate-200/90 hover:border-brand-400'
                    }`}
                  >
                    {/* Full-Bleed Product Image Container (NO White Padding) */}
                    <div className="w-full h-44 overflow-hidden relative bg-slate-100">
                      <img
                        src={cropImg}
                        alt={lot.crop_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = DEFAULT_CROP_IMAGE;
                        }}
                      />
                    </div>

                    {/* Essential Shopping Information */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Produce Name */}
                        <h4 className="text-base font-bold font-heading text-emerald-950 group-hover:text-amber-700 transition-colors">
                          {lot.crop_name}
                        </h4>

                        {/* Price & Available Volume */}
                        <div className="mt-1.5 flex items-baseline justify-between">
                          <div className="text-base font-extrabold text-amber-700 font-mono">
                            ₹{lot.price_per_kg?.toFixed(2) || '20.00'} <span className="text-xs text-slate-500 font-normal">/ kg</span>
                          </div>
                          <div className="text-xs text-slate-500 font-medium font-mono">
                            {t('buyer_card_available')} <strong className="text-slate-800">{lot.quantity_kg} kg</strong>
                          </div>
                        </div>
                      </div>

                      {/* Add to Bulk Cart Button (Clickable independently without opening details modal) */}
                      <div className="mt-4 pt-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevents opening the details modal
                            toggleSelectLot(lot.lot_id);
                          }}
                          className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-emerald-50 text-brand-700 hover:bg-brand-500 hover:text-white border border-emerald-200'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                              <span>{t('buyer_btn_selected')}</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>{t('buyer_btn_add')}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Escrow Checkout Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-emerald-900/10 shadow-sm space-y-5 sticky top-20">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-600" />
                <span>{t('buyer_cart_title')}</span>
              </h3>
              <span className="text-xs text-amber-800 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                {t('buyer_cart_lots_chosen', { count: selectedLots.length })}
              </span>
            </div>

            {/* Selected Lots Summary list */}
            {chosenLots.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                title={t('buyer_cart_empty_title')}
                description={t('buyer_cart_empty_desc')}
                className="py-4 border-0 bg-transparent"
              />
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {chosenLots.map(lot => (
                  <div key={lot.lot_id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-800">{lot.crop_name} ({lot.quantity_kg} kg)</div>
                      <div className="text-[10px] text-slate-500">{lot.farmer_name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-amber-800 font-extrabold">
                        ₹{((lot.quantity_kg || 0) * (lot.price_per_kg || 20)).toFixed(2)}
                      </div>
                      <button 
                        onClick={() => toggleSelectLot(lot.lot_id)}
                        className="text-[10px] text-red-500 hover:text-red-700 font-medium hover:underline cursor-pointer"
                      >
                        {t('buyer_btn_remove')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Cost Breakdown */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>{t('buyer_total_volume')}</span>
                <span className="text-slate-900 font-mono font-bold">{totalQuantity} kg</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>{t('buyer_produce_cost')}</span>
                <span className="text-slate-900 font-mono">₹{totalProduceCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('buyer_transport_cost')}</span>
                </span>
                <span className="text-slate-900 font-mono">₹{estimatedLogisticsCost.toFixed(2)}</span>
              </div>

              {/* Total Invoice */}
              <div className="flex justify-between text-sm font-extrabold text-emerald-950 pt-2.5 border-t border-slate-100">
                <span>{t('buyer_total_escrow')}</span>
                <span className="text-amber-700 font-mono text-base">₹{totalEscrowAmount.toFixed(2)}</span>
              </div>

              {/* Buyer Savings Indicator */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between font-medium">
                <span>{t('buyer_savings_label')}</span>
                <span className="font-bold text-brand-700">{t('buyer_savings_val', { amount: totalSavings.toFixed(0) })}</span>
              </div>
            </div>

            {/* Escrow Guarantee Pill */}
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-800">
                <Lock className="w-4 h-4 text-amber-700" />
                <span>{t('buyer_escrow_security_title')}</span>
              </div>
              <p className="leading-relaxed text-[11px] text-amber-900/90">
                {t('buyer_escrow_security_desc')}
              </p>
            </div>

            {/* Place Order Button */}
            <button
              type="button"
              disabled={chosenLots.length === 0 || isCheckingOut}
              onClick={() => setCheckoutModalOpen(true)}
              className="w-full py-3.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>{t('buyer_btn_checkout')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* 🌟 1. Produce Details Modal (Centered Popup) */}
      {detailsModalLot && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setDetailsModalLot(null)}
        >
          <div 
            className="max-w-md w-full p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-brand-700 font-bold">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-heading text-emerald-950">
                    {detailsModalLot.crop_name}
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">Lot #{detailsModalLot.lot_id}</span>
                </div>
              </div>
              <button 
                onClick={() => setDetailsModalLot(null)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Large Full-Bleed Product Image */}
            <div className="w-full h-52 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 relative">
              <img
                src={CROP_IMAGES[detailsModalLot.crop_name] || DEFAULT_CROP_IMAGE}
                alt={detailsModalLot.crop_name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = DEFAULT_CROP_IMAGE;
                }}
              />
            </div>

            {/* Price & Available Volume Box */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-500 font-semibold uppercase">{t('buyer_available_volume')}</div>
                <div className="text-base font-extrabold text-slate-900 font-mono">{detailsModalLot.quantity_kg} kg</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">{t('buyer_direct_wholesale')}</div>
                <div className="text-lg font-extrabold text-amber-700 font-mono">
                  ₹{detailsModalLot.price_per_kg?.toFixed(2) || '20.00'} <span className="text-xs text-slate-500 font-normal">/ kg</span>
                </div>
              </div>
            </div>

            {/* Complete Detailed Lot Information */}
            <div className="space-y-2.5 pt-1 text-xs text-slate-700">
              {/* Agmark Grade */}
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-brand-600" />
                  <span>Agmark Grade</span>
                </span>
                <span className="font-bold text-emerald-950">
                  {detailsModalLot.quality_grade ? `Grade ${detailsModalLot.quality_grade} (Table Purpose)` : 'Grade A'}
                </span>
              </div>

              {/* Producer */}
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Producer</span>
                </span>
                <span className="font-semibold text-slate-900 text-right">
                  {detailsModalLot.farmer_name || 'Saswad Regional Cluster'}
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Location</span>
                </span>
                <span className="font-medium text-slate-800 text-right">
                  {detailsModalLot.location?.area_name || 'Purandar Agro Belt'}
                </span>
              </div>

              {/* Distance */}
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Distance</span>
                </span>
                <span className="font-mono font-bold text-amber-700">
                  {detailsModalLot.distance_km ? `${detailsModalLot.distance_km} km away` : '28.4 km away'}
                </span>
              </div>

              {/* Harvest Date */}
              {detailsModalLot.harvest_date && (
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Harvest Date</span>
                  </span>
                  <span className="font-mono text-slate-800">
                    {detailsModalLot.harvest_date}
                  </span>
                </div>
              )}

              {/* Mandi Benchmark Price */}
              {detailsModalLot.benchmark_mandi_price && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
                  <span>Mandi Benchmark Reference:</span>
                  <span className="font-mono font-bold text-brand-700">₹{detailsModalLot.benchmark_mandi_price.toFixed(2)}/kg</span>
                </div>
              )}
            </div>

            {/* Add to Bulk Cart Button inside Details Modal */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  toggleSelectLot(detailsModalLot.lot_id);
                }}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                  selectedLots.includes(detailsModalLot.lot_id)
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-brand-500 hover:bg-brand-600 text-white'
                }`}
              >
                {selectedLots.includes(detailsModalLot.lot_id) ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>{t('buyer_btn_selected')}</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>{t('buyer_btn_add')}</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 🌟 2. Escrow Modal Confirmation */}
      {checkoutModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setCheckoutModalOpen(false)}
        >
          <div 
            className="max-w-md w-full p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl space-y-5 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-emerald-950">{t('buyer_modal_title')}</h3>
              </div>
              <button 
                onClick={() => setCheckoutModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-3 font-medium">
              <p>
                {t('buyer_modal_summary', { qty: totalQuantity, count: chosenLots.length })}
              </p>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Produce:</span>
                  <span className="text-slate-800 font-bold">₹{totalProduceCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Shared Transport:</span>
                  <span className="text-slate-800 font-bold">₹{estimatedLogisticsCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-amber-800 font-extrabold pt-1.5 border-t border-slate-200">
                  <span>Escrow Lock Total:</span>
                  <span>₹{totalEscrowAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {completedOrder ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs space-y-3">
                <div className="flex items-center gap-2 text-emerald-950 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-brand-600" />
                  <span>{t('buyer_modal_success_title', { order_id: completedOrder.order_id })}</span>
                </div>
                <p className="text-emerald-900 leading-relaxed">
                  {t('buyer_modal_success_desc')}
                </p>
                <button
                  onClick={handleProceedToLogistics}
                  className="w-full py-2.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-brand-500/20"
                >
                  <span>{t('buyer_modal_btn_logistics')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCheckoutModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  {t('buyer_modal_cancel')}
                </button>
                <button
                  type="button"
                  disabled={isCheckingOut}
                  onClick={handlePlaceOrder}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isCheckingOut ? (
                    <span>{t('buyer_modal_locking')}</span>
                  ) : (
                    <span>{t('buyer_modal_confirm')}</span>
                  )}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
