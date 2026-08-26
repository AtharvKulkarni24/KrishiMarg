import React, { useState } from 'react';
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
  PackageOpen
} from 'lucide-react';

export default function BuyerMarketplace() {
  const { availableLots, createOrder, setDemoStep, selectRole, addToast } = useApp();

  const [selectedLots, setSelectedLots] = useState(['lot_901', 'lot_902']);
  const [selectedCropFilter, setSelectedCropFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  // Buyer reference location (Kothrud, Pune)
  const buyerLocation = {
    buyer_id: 'b_501',
    buyer_name: 'Green Leaf Restaurant & Mess',
    address: 'Kothrud Central Kitchen, Pune',
    latitude: 18.5018,
    longitude: 73.8636
  };

  // Toggle selection
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
      addToast('Please select at least one produce lot to proceed with bulk checkout.', 'warning');
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
      addToast(`Order creation failed: ${err.message}`, 'error');
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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl glass-panel border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Store className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold font-heading text-white">Bulk Buyer Procurement Marketplace</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
              Buyer ID: b_501 (HoReCa Kitchen)
            </span>
          </div>
          <p className="text-slate-400 text-xs md:text-sm">
            Direct farm-gate sourcing for restaurants, canteens, and housing societies. Verified Agmark grading within 50km radius with Escrow security.
          </p>
        </div>

        {/* Location & Radius Badge */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-slate-300 shrink-0">
          <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400">Delivery Drop-off</div>
            <div className="font-semibold text-white">Kothrud, Pune (50km Radius)</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Marketplace Feed (8 cols) & Order Cart Summary (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Marketplace Feed (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Search & Filter Header Bar */}
          <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by crop, farmer, or cluster location..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Crop Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['ALL', 'Tomato', 'Onion', 'Potato'].map((crop) => (
                <button
                  key={crop}
                  onClick={() => setSelectedCropFilter(crop)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
                    selectedCropFilter === crop
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {crop === 'ALL' ? 'All Crops' : crop}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Available Fresh Lots within 50km</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-mono">
                {filteredLots.length} Matches
              </span>
            </h3>
            <span className="text-[11px] text-slate-400">PostGIS Spatial Query Active</span>
          </div>

          {filteredLots.length === 0 ? (
            <EmptyState
              icon={PackageOpen}
              title="No Lots Found"
              description="No farm lots match your search query or filter. Try clearing your search or switching filters."
              actionLabel="Clear Filters"
              onAction={() => {
                setSearchQuery('');
                setSelectedCropFilter('ALL');
              }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredLots.map((lot) => {
                const isSelected = selectedLots.includes(lot.lot_id);
                return (
                  <div
                    key={lot.lot_id}
                    onClick={() => toggleSelectLot(lot.lot_id)}
                    className={`p-5 rounded-2xl glass-panel border transition-all cursor-pointer flex flex-col justify-between relative group ${
                      isSelected
                        ? 'border-amber-500/80 bg-slate-900/95 shadow-lg shadow-amber-500/10'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Top Tags */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {lot.quality_grade ? `Agmark Grade ${lot.quality_grade}` : 'Grade A'}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{lot.distance_km || 28.4} km away</span>
                      </span>
                    </div>

                    {/* Crop Info */}
                    <div className="mb-4">
                      <h4 className="text-lg font-bold font-heading text-white group-hover:text-amber-300 transition-colors">
                        {lot.crop_name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Producer: <span className="text-slate-300 font-medium">{lot.farmer_name || 'Saswad Regional Cluster'}</span>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Location: {lot.location?.area_name || 'Purandar Belt'}
                      </p>
                    </div>

                    {/* Pricing & Quantity Box */}
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between mb-4">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase">Available Volume</div>
                        <div className="text-sm font-bold text-white font-mono">{lot.quantity_kg} kg</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 uppercase">Direct Wholesale</div>
                        <div className="text-base font-extrabold text-amber-400 font-mono">
                          ₹{lot.price_per_kg?.toFixed(2) || '20.00'}/kg
                        </div>
                      </div>
                    </div>

                    {/* Selection Button */}
                    <button
                      type="button"
                      className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                          <span>Selected in Bulk Cart</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Bulk Order</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Escrow Checkout Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-5 sticky top-20">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>Bulk Order Checkout</span>
              </h3>
              <span className="text-xs text-amber-300 font-mono">
                {selectedLots.length} Lots Chosen
              </span>
            </div>

            {/* Selected Lots Summary list */}
            {chosenLots.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                title="Cart is Empty"
                description="Select produce lots from the marketplace on the left to aggregate your order."
                className="py-4 border-0 bg-transparent"
              />
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {chosenLots.map(lot => (
                  <div key={lot.lot_id} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-white">{lot.crop_name} ({lot.quantity_kg} kg)</div>
                      <div className="text-[10px] text-slate-400">{lot.farmer_name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-amber-400 font-bold">
                        ₹{((lot.quantity_kg || 0) * (lot.price_per_kg || 20)).toFixed(2)}
                      </div>
                      <button 
                        onClick={() => toggleSelectLot(lot.lot_id)}
                        className="text-[10px] text-red-400 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Cost Breakdown */}
            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Total Produce Volume:</span>
                <span className="text-white font-mono font-semibold">{totalQuantity} kg</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Produce Cost (Direct to Farmers):</span>
                <span className="text-white font-mono">₹{totalProduceCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span className="flex items-center gap-1">
                  <Truck className="w-3 h-3 text-slate-500" />
                  <span>Pooled Milk-Run Transport:</span>
                </span>
                <span className="text-white font-mono">₹{estimatedLogisticsCost.toFixed(2)}</span>
              </div>

              {/* Total Invoice */}
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                <span>Total Escrow Amount:</span>
                <span className="text-amber-400 font-mono text-base">₹{totalEscrowAmount.toFixed(2)}</span>
              </div>

              {/* Buyer Savings Indicator (No Purple Gradients!) */}
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center justify-between">
                <span>Savings vs Retail Stores:</span>
                <span className="font-bold">₹{totalSavings.toFixed(0)} Saved (18% Less)</span>
              </div>
            </div>

            {/* Escrow Guarantee Pill */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Smart Escrow Payment Security</span>
              </div>
              <p className="leading-tight text-slate-400">
                Funds remain locked in digital escrow until delivery OTP is confirmed at your Kothrud kitchen.
              </p>
            </div>

            {/* Place Order Button */}
            <button
              type="button"
              disabled={chosenLots.length === 0 || isCheckingOut}
              onClick={() => setCheckoutModalOpen(true)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <span>Review & Place Order (Escrow)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Escrow Modal Confirmation */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-2xl glass-panel border border-slate-700 shadow-2xl space-y-5 animate-fade-in">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Authorize Escrow Lock</h3>
              </div>
              <button 
                onClick={() => setCheckoutModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-3">
              <p>
                You are purchasing <strong>{totalQuantity} kg</strong> of fresh produce from <strong>{chosenLots.length} regional farms</strong> for delivery to <strong>Kothrud Central Kitchen</strong>.
              </p>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Produce:</span>
                  <span>₹{totalProduceCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Shared Transport:</span>
                  <span>₹{estimatedLogisticsCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-amber-400 font-bold pt-1 border-t border-slate-800">
                  <span>Escrow Lock Total:</span>
                  <span>₹{totalEscrowAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {completedOrder ? (
              <div className="p-4 rounded-xl bg-brand-950/90 border border-brand-500/60 text-xs space-y-3">
                <div className="flex items-center gap-2 text-brand-300 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-brand-400" />
                  <span>Order #{completedOrder.order_id} Locked in Escrow!</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  The order is now queued in <strong>PENDING_DISPATCH</strong>. Let's switch to the Admin Logistics Map to optimize the vehicle milk-run route.
                </p>
                <button
                  onClick={handleProceedToLogistics}
                  className="w-full py-2.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2"
                >
                  <span>Go to Admin Logistics Map (Step 3)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCheckoutModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isCheckingOut}
                  onClick={handlePlaceOrder}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
                >
                  {isCheckingOut ? (
                    <span>Locking Escrow...</span>
                  ) : (
                    <span>Confirm & Lock Escrow</span>
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
