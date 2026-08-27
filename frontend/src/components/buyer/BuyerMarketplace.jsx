import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { apiClient } from '../../services/api';
import { MOCK_USERS } from '../../services/mockData';
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
  Minus,
  Trash2, 
  Search, 
  PackageOpen,
  Calendar,
  User,
  AlertCircle
} from 'lucide-react';

// Static crop image mapping for grocery marketplace presentation
const CROP_IMAGES = {
  'Tomato': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
  'Onion': 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80',
  'Potato': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80',
  'Cauliflower': 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=600&auto=format&fit=crop&q=80',
  'Green Chili': 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&auto=format&fit=crop&q=80'
};

const DEFAULT_CROP_IMAGE = 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=600&auto=format&fit=crop&q=80';

export default function BuyerMarketplace() {
  const { availableLots, createOrder, setDemoStep, selectRole, addToast, currentUser, t } = useApp();

  // Cart state mapping: lot_id -> selected_quantity_kg
  const [cartItems, setCartItems] = useState({
    'lot_901': 15,
    'lot_902': 20
  });

  // Local card state for unadded lots: lot_id -> selected_quantity_kg
  const [cardQuantities, setCardQuantities] = useState({});

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
    buyer_id: currentUser?.user_id || 'b_501',
    full_name: currentUser?.full_name || 'Green Leaf Restaurant & Mess',
    latitude: currentUser?.default_lat || 18.5018,
    longitude: currentUser?.default_lng || 73.8636
  };

  // Helper to resolve farmer name from users data
  const getFarmerName = (farmerId) => {
    const user = MOCK_USERS.find(u => u.user_id === farmerId);
    return user ? user.full_name : farmerId;
  };

  // Cart Management Functions
  const getSelectedQuantity = (lot) => {
    if (cartItems[lot.lot_id] !== undefined) {
      return cartItems[lot.lot_id];
    }
    if (cardQuantities[lot.lot_id] !== undefined) {
      return cardQuantities[lot.lot_id];
    }
    return Math.min(15, Number(lot.quantity_kg) || 1);
  };

  const updateCartQuantity = (lotId, qty) => {
    const lot = availableLots.find(l => l.lot_id === lotId);
    if (!lot) return;
    const maxAvailable = Number(lot.quantity_kg) || 1;
    let parsed = parseInt(qty, 10);
    if (isNaN(parsed) || parsed < 1) parsed = 1;
    if (parsed > maxAvailable) parsed = maxAvailable;

    setCartItems(prev => ({
      ...prev,
      [lotId]: parsed
    }));
  };

  const setLocalCardQuantity = (lotId, qty) => {
    const lot = availableLots.find(l => l.lot_id === lotId);
    if (!lot) return;
    const maxAvailable = Number(lot.quantity_kg) || 1;
    let parsed = parseInt(qty, 10);
    if (isNaN(parsed) || parsed < 1) parsed = 1;
    if (parsed > maxAvailable) parsed = maxAvailable;

    setCardQuantities(prev => ({
      ...prev,
      [lotId]: parsed
    }));
  };

  const addToCart = (lotId, qty) => {
    const lot = availableLots.find(l => l.lot_id === lotId);
    if (!lot) return;
    const maxAvailable = Number(lot.quantity_kg) || 1;
    let parsed = parseInt(qty, 10);
    if (isNaN(parsed) || parsed < 1) parsed = 1;
    if (parsed > maxAvailable) parsed = maxAvailable;

    setCartItems(prev => ({
      ...prev,
      [lotId]: parsed
    }));
    addToast(t('buyer_btn_in_cart', { qty: parsed }), 'success');
  };

  const removeFromCart = (lotId) => {
    setCartItems(prev => {
      const next = { ...prev };
      delete next[lotId];
      return next;
    });
  };

  // Filtered available lots
  const filteredLots = availableLots.filter(lot => {
    const matchesCrop = selectedCropFilter === 'ALL' || lot.crop_name.toLowerCase() === selectedCropFilter.toLowerCase();
    const farmerName = getFarmerName(lot.farmer_id);
    const matchesSearch = !searchQuery || 
      lot.crop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lot.lot_id && lot.lot_id.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCrop && matchesSearch;
  });

  // Calculate order totals based strictly on chosen quantities
  const selectedLotIds = Object.keys(cartItems);
  const chosenLots = availableLots.filter(l => selectedLotIds.includes(l.lot_id));
  const totalQuantity = chosenLots.reduce((acc, l) => acc + (cartItems[l.lot_id] || 0), 0);
  const totalAmount = chosenLots.reduce((acc, l) => acc + ((cartItems[l.lot_id] || 0) * (Number(l.price_per_kg) || 0)), 0);

  const handlePlaceOrder = async () => {
    if (chosenLots.length === 0) {
      addToast(t('err_select_lot'), 'warning');
      return;
    }

    setIsCheckingOut(true);
    try {
      const payload = {
        buyer_id: buyerLocation.buyer_id,
        lot_ids: selectedLotIds,
        dropoff_latitude: Number(buyerLocation.latitude),
        dropoff_longitude: Number(buyerLocation.longitude),
        total_amount: totalAmount
      };

      const result = await apiClient.createOrder(payload);
      const newOrder = {
        order_id: result.order_id,
        buyer_id: payload.buyer_id,
        lot_ids: payload.lot_ids,
        lot_quantities: { ...cartItems },
        total_quantity: totalQuantity,
        dropoff_latitude: payload.dropoff_latitude,
        dropoff_longitude: payload.dropoff_longitude,
        total_amount: result.total_amount || totalAmount,
        status: result.status || 'PENDING_ROUTE',
        payment_status: result.payment_status || 'MOCK_SUCCESS'
      };

      createOrder(newOrder);
      setCompletedOrder(newOrder);
      setIsCheckingOut(false);
      setDemoStep(3); // Advance demo pitch step to Driver
    } catch (err) {
      addToast(t('toast_order_error', { err: err.message }), 'error');
      setIsCheckingOut(false);
    }
  };

  const handleProceedToDriver = () => {
    setCheckoutModalOpen(false);
    selectRole('driver');
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
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold border border-amber-200 font-mono">
              {buyerLocation.buyer_id}
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
            <div className="font-bold text-emerald-950">{buyerLocation.full_name}</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Marketplace Feed (8 cols) & Order Summary (4 cols) */}
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
                const isInCart = cartItems[lot.lot_id] !== undefined;
                const currentQty = getSelectedQuantity(lot);
                const cropImg = CROP_IMAGES[lot.crop_name] || DEFAULT_CROP_IMAGE;

                return (
                  <div
                    key={lot.lot_id}
                    onClick={() => setDetailsModalLot(lot)}
                    className={`rounded-2xl bg-white border transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden group shadow-sm hover:shadow-md ${
                      isInCart
                        ? 'border-amber-500 ring-2 ring-amber-400/20'
                        : 'border-slate-200/90 hover:border-brand-400'
                    }`}
                  >
                    {/* Full-Bleed Product Image */}
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
                      {isInCart && (
                        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-amber-600/90 text-white font-mono text-[10px] font-bold shadow-sm backdrop-blur-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{currentQty} kg</span>
                        </div>
                      )}
                    </div>

                    {/* Shopping Information */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Produce Name & Lot ID */}
                        <div className="flex items-center justify-between">
                          <h4 className="text-base font-bold font-heading text-emerald-950 group-hover:text-amber-700 transition-colors">
                            {lot.crop_name}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {lot.lot_id}
                          </span>
                        </div>

                        {/* Price & Available Volume */}
                        <div className="mt-1.5 flex items-baseline justify-between">
                          <div className="text-base font-extrabold text-amber-700 font-mono">
                            ₹{Number(lot.price_per_kg).toFixed(2)} <span className="text-xs text-slate-500 font-normal">/ kg</span>
                          </div>
                          <div className="text-xs text-slate-500 font-medium font-mono">
                            {t('buyer_card_available')} <strong className="text-slate-800">{lot.quantity_kg} kg</strong>
                          </div>
                        </div>

                        {/* Distance & Harvest Date */}
                        <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1.5 font-medium">
                          <span>{lot.distance_km ? `${lot.distance_km} km` : '28.4 km'}</span>
                          <span>Harvest: {lot.harvest_date}</span>
                        </div>
                      </div>

                      {/* Quantity Selector & Add to Cart Container */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-slate-700">
                            {isInCart ? t('buyer_card_buying', { qty: currentQty }) : t('buyer_qty_label')}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-amber-800">
                            = ₹{(currentQty * Number(lot.price_per_kg)).toFixed(2)}
                          </span>
                        </div>

                        {/* Quantity Stepper: − [ 15 kg ] + */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const next = Math.max(1, currentQty - 1);
                              if (isInCart) {
                                updateCartQuantity(lot.lot_id, next);
                              } else {
                                setLocalCardQuantity(lot.lot_id, next);
                              }
                            }}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-colors cursor-pointer text-sm disabled:opacity-40"
                            disabled={currentQty <= 1}
                            title="Decrease quantity"
                          >
                            −
                          </button>
                          <div className="flex-1 relative flex items-center">
                            <input
                              type="number"
                              min="1"
                              max={lot.quantity_kg}
                              value={currentQty}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === '') {
                                  if (isInCart) updateCartQuantity(lot.lot_id, 1);
                                  else setLocalCardQuantity(lot.lot_id, 1);
                                  return;
                                }
                                const num = parseInt(val, 10);
                                if (!isNaN(num)) {
                                  const bounded = Math.max(1, Math.min(Number(lot.quantity_kg), num));
                                  if (isInCart) updateCartQuantity(lot.lot_id, bounded);
                                  else setLocalCardQuantity(lot.lot_id, bounded);
                                }
                              }}
                              className="w-full text-center py-1.5 px-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs font-mono font-bold focus:bg-white focus:border-amber-500 focus:outline-none"
                            />
                            <span className="absolute right-2.5 text-[10px] text-slate-400 font-medium pointer-events-none">kg</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const next = Math.min(Number(lot.quantity_kg), currentQty + 1);
                              if (isInCart) {
                                updateCartQuantity(lot.lot_id, next);
                              } else {
                                setLocalCardQuantity(lot.lot_id, next);
                              }
                            }}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-colors cursor-pointer text-sm disabled:opacity-40"
                            disabled={currentQty >= Number(lot.quantity_kg)}
                            title="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        {/* Action Button */}
                        {isInCart ? (
                          <div className="flex items-center gap-1.5">
                            <div className="flex-1 py-2 px-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                              <span>{t('buyer_btn_in_cart', { qty: currentQty })}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFromCart(lot.lot_id)}
                              className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors cursor-pointer"
                              title={t('buyer_btn_remove')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => addToCart(lot.lot_id, currentQty)}
                            className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-98"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{t('buyer_btn_add_qty', { qty: currentQty })}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Order Summary & Checkout (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-emerald-900/10 shadow-sm space-y-5 sticky top-20">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-600" />
                <span>{t('buyer_cart_title')}</span>
              </h3>
              <span className="text-xs text-amber-800 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                {t('buyer_cart_lots_chosen', { count: chosenLots.length })}
              </span>
            </div>

            {/* Selected Lots list with inline quantity adjustment */}
            {chosenLots.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                title={t('buyer_cart_empty_title')}
                description={t('buyer_cart_empty_desc')}
                className="py-4 border-0 bg-transparent"
              />
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {chosenLots.map(lot => {
                  const selectedQty = cartItems[lot.lot_id] || 1;
                  return (
                    <div key={lot.lot_id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-slate-800">{lot.crop_name} ({selectedQty} kg)</div>
                          <div className="text-[10px] text-slate-500">{getFarmerName(lot.farmer_id)} • {lot.lot_id}</div>
                        </div>
                        <div className="text-right font-mono font-extrabold text-amber-800">
                          ₹{(selectedQty * Number(lot.price_per_kg)).toFixed(2)}
                        </div>
                      </div>

                      {/* Stepper + Remove row */}
                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(lot.lot_id, Math.max(1, selectedQty - 1))}
                            className="w-6 h-6 rounded bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs cursor-pointer disabled:opacity-40"
                            disabled={selectedQty <= 1}
                            title="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="px-2 py-0.5 bg-white border border-slate-200 rounded font-mono font-bold text-slate-800 text-[11px]">
                            {selectedQty} kg
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(lot.lot_id, Math.min(Number(lot.quantity_kg), selectedQty + 1))}
                            className="w-6 h-6 rounded bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs cursor-pointer disabled:opacity-40"
                            disabled={selectedQty >= Number(lot.quantity_kg)}
                            title="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          ₹{Number(lot.price_per_kg).toFixed(2)}/kg
                        </div>
                        <button 
                          onClick={() => removeFromCart(lot.lot_id)}
                          className="text-[10px] text-red-500 hover:text-red-700 font-medium hover:underline cursor-pointer flex items-center gap-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{t('buyer_btn_remove')}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
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
                <span className="text-slate-900 font-mono">₹{totalAmount.toFixed(2)}</span>
              </div>

              {/* Total Order */}
              <div className="flex justify-between text-sm font-extrabold text-emerald-950 pt-2.5 border-t border-slate-100">
                <span>{t('buyer_total_escrow')}</span>
                <span className="text-amber-700 font-mono text-base">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Mock Payment Information Box */}
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-800">
                <Lock className="w-4 h-4 text-amber-700" />
                <span>{t('buyer_mock_payment_notice')}</span>
              </div>
              <p className="leading-relaxed text-[11px] text-amber-900/90">
                {t('buyer_mock_payment_sub')}
              </p>
            </div>

            {/* Checkout Button */}
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
      {detailsModalLot && (() => {
        const isInCart = cartItems[detailsModalLot.lot_id] !== undefined;
        const currentQty = getSelectedQuantity(detailsModalLot);
        const maxAvailable = Number(detailsModalLot.quantity_kg) || 1;

        return (
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

              {/* Product Image */}
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

              {/* Price & Available Volume */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">{t('buyer_available_volume')}</div>
                  <div className="text-base font-extrabold text-slate-900 font-mono">{detailsModalLot.quantity_kg} kg</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">{t('buyer_direct_wholesale')}</div>
                  <div className="text-lg font-extrabold text-amber-700 font-mono">
                    ₹{Number(detailsModalLot.price_per_kg).toFixed(2)} <span className="text-xs text-slate-500 font-normal">/ kg</span>
                  </div>
                </div>
              </div>

              {/* Supported Lot Information */}
              <div className="space-y-2.5 pt-1 text-xs text-slate-700">
                {/* Producer */}
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Producer</span>
                  </span>
                  <span className="font-semibold text-slate-900 text-right">
                    {getFarmerName(detailsModalLot.farmer_id)}
                  </span>
                </div>

                {/* Coordinates */}
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Coordinates</span>
                  </span>
                  <span className="font-mono text-slate-800 text-right">
                    {Number(detailsModalLot.latitude).toFixed(4)}, {Number(detailsModalLot.longitude).toFixed(4)}
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
              </div>

              {/* Quantity Selection in Modal */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950">{t('buyer_qty_label')}</span>
                  <span className="font-mono font-bold text-amber-800">
                    {currentQty} kg × ₹{Number(detailsModalLot.price_per_kg).toFixed(2)} = ₹{(currentQty * Number(detailsModalLot.price_per_kg)).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const next = Math.max(1, currentQty - 1);
                      if (isInCart) updateCartQuantity(detailsModalLot.lot_id, next);
                      else setLocalCardQuantity(detailsModalLot.lot_id, next);
                    }}
                    className="w-9 h-9 rounded-lg bg-white hover:bg-slate-100 border border-amber-300 text-slate-700 font-bold flex items-center justify-center transition-colors cursor-pointer text-sm disabled:opacity-40"
                    disabled={currentQty <= 1}
                  >
                    −
                  </button>
                  <div className="flex-1 relative flex items-center">
                    <input
                      type="number"
                      min="1"
                      max={maxAvailable}
                      value={currentQty}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          if (isInCart) updateCartQuantity(detailsModalLot.lot_id, 1);
                          else setLocalCardQuantity(detailsModalLot.lot_id, 1);
                          return;
                        }
                        const num = parseInt(val, 10);
                        if (!isNaN(num)) {
                          const bounded = Math.max(1, Math.min(maxAvailable, num));
                          if (isInCart) updateCartQuantity(detailsModalLot.lot_id, bounded);
                          else setLocalCardQuantity(detailsModalLot.lot_id, bounded);
                        }
                      }}
                      className="w-full text-center py-2 px-2 rounded-lg bg-white border border-amber-300 text-slate-800 text-sm font-mono font-bold focus:border-amber-600 focus:outline-none"
                    />
                    <span className="absolute right-3 text-xs text-slate-400 font-medium pointer-events-none">kg</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = Math.min(maxAvailable, currentQty + 1);
                      if (isInCart) updateCartQuantity(detailsModalLot.lot_id, next);
                      else setLocalCardQuantity(detailsModalLot.lot_id, next);
                    }}
                    className="w-9 h-9 rounded-lg bg-white hover:bg-slate-100 border border-amber-300 text-slate-700 font-bold flex items-center justify-center transition-colors cursor-pointer text-sm disabled:opacity-40"
                    disabled={currentQty >= maxAvailable}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart / In Cart Buttons */}
              <div className="pt-2">
                {isInCart ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDetailsModalLot(null)}
                      className="flex-1 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>{t('buyer_btn_in_cart', { qty: currentQty })}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        removeFromCart(detailsModalLot.lot_id);
                        setDetailsModalLot(null);
                      }}
                      className="p-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors cursor-pointer"
                      title={t('buyer_btn_remove')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      addToCart(detailsModalLot.lot_id, currentQty);
                      setDetailsModalLot(null);
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm shadow-brand-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t('buyer_btn_add_qty', { qty: currentQty })}</span>
                  </button>
                )}
              </div>

            </div>
          </div>
        );
      })()}

      {/* 🌟 2. Mock Checkout Confirmation Modal */}
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

              {/* Itemized breakdown with actual purchased quantities */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 font-mono">
                <div className="space-y-1 pb-2 border-b border-slate-200">
                  {chosenLots.map(lot => {
                    const qty = cartItems[lot.lot_id] || 1;
                    return (
                      <div key={lot.lot_id} className="flex justify-between text-[11px]">
                        <span className="text-slate-700">{lot.crop_name} ({lot.lot_id}): {qty} kg × ₹{Number(lot.price_per_kg).toFixed(2)}</span>
                        <span className="font-bold text-slate-900">₹{(qty * Number(lot.price_per_kg)).toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Drop-off Coordinates:</span>
                  <span className="text-slate-800 font-bold">{buyerLocation.latitude.toFixed(4)}, {buyerLocation.longitude.toFixed(4)}</span>
                </div>
                <div className="flex justify-between text-amber-800 font-extrabold pt-1.5 border-t border-slate-200 text-sm">
                  <span>Total Order Amount:</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
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
                  onClick={handleProceedToDriver}
                  className="w-full py-2.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-brand-500/20"
                >
                  <span>{t('buyer_modal_btn_driver')}</span>
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
                  disabled={isCheckingOut || chosenLots.length === 0}
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
