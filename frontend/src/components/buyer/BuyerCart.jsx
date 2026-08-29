import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShoppingBag, Clock, TrendingDown, ArrowRight, Trash2 } from 'lucide-react';
import EmptyState from '../common/EmptyState';

export default function BuyerCart({
  chosenLots,
  cartItems,
  totalQuantity,
  totalAmount,
  estimatedSavings,
  updateCartQuantity,
  removeFromCart,
  deliverySlots,
  selectedSlotId,
  setSelectedSlotId,
  activeSelectedSlot,
  isCheckingOut,
  setCheckoutModalOpen
}) {
  const { t } = useApp();

  return (
    <div className="lg:col-span-4 space-y-4 sticky top-20">
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-emerald-900/10 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-emerald-950 font-heading">
              {t('buyer_cart_header')}
            </h3>
          </div>
          <span className="text-xs text-amber-800 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 font-mono">
            {t('buyer_cart_lots_chosen', { count: chosenLots.length, qty: totalQuantity })}
          </span>
        </div>

        {chosenLots.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title={t('buyer_cart_empty_title')}
            description={t('buyer_cart_empty_desc')}
            className="py-4 border-0 bg-transparent"
          />
        ) : (
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {chosenLots.map(lot => {
              const selectedQty = cartItems[lot.lot_id] || 1;
              const itemPrice = (selectedQty * Number(lot.price_per_kg)).toFixed(2);
              return (
                <div key={lot.lot_id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-slate-800">{lot.crop_name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {selectedQty} kg • ₹{Number(lot.price_per_kg).toFixed(2)}/kg
                      </div>
                    </div>
                    <div className="text-right font-mono font-extrabold text-amber-800 text-xs">
                      ₹{itemPrice}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(lot.lot_id, Math.max(1, selectedQty - 1))}
                        className="w-5 h-5 rounded bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs cursor-pointer disabled:opacity-40"
                        disabled={selectedQty <= 1}
                      >
                        −
                      </button>
                      <span className="px-2 py-0.5 bg-white border border-slate-200 rounded font-mono font-bold text-slate-800 text-[10px]">
                        {selectedQty} kg
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(lot.lot_id, Math.min(Number(lot.quantity_kg), selectedQty + 1))}
                        className="w-5 h-5 rounded bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs cursor-pointer disabled:opacity-40"
                        disabled={selectedQty >= Number(lot.quantity_kg)}
                      >
                        +
                      </button>
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

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-600" />
              <span>{t('buyer_delivery_slot_title')}</span>
            </label>
            <span className="text-[10px] text-brand-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {activeSelectedSlot.tag}
            </span>
          </div>

          <select
            value={selectedSlotId}
            onChange={(e) => setSelectedSlotId(e.target.value)}
            className="w-full py-2 px-3 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:border-brand-500 cursor-pointer"
          >
            {deliverySlots.map(slot => (
              <option key={slot.id} value={slot.id}>
                {slot.label} ({slot.dateFormatted})
              </option>
            ))}
          </select>

          <div className="text-[10px] text-slate-500 flex justify-between pt-0.5 font-medium">
            <span>{t('buyer_expected_delivery_date')}</span>
            <span className="font-bold text-slate-800">{activeSelectedSlot.dateFormatted} • {activeSelectedSlot.timeRange}</span>
          </div>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>{t('buyer_produce_subtotal')}</span>
            <span className="text-slate-900 font-mono font-bold">₹{totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>{t('buyer_transport_cost')}</span>
            <span className="text-brand-700 font-semibold">{t('buyer_transport_included')}</span>
          </div>

          <div className="flex justify-between text-sm font-extrabold text-emerald-950 pt-2 border-t border-slate-100">
            <span>{t('buyer_total_escrow')}</span>
            <span className="text-amber-700 font-mono text-base">₹{totalAmount.toFixed(2)}</span>
          </div>

          {chosenLots.length > 0 && (
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 font-medium">
              <TrendingDown className="w-4 h-4 text-brand-600 shrink-0" />
              <span>{t('buyer_savings_callout', { amount: estimatedSavings.toLocaleString('en-IN') })}</span>
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={chosenLots.length === 0 || isCheckingOut}
          onClick={() => setCheckoutModalOpen(true)}
          className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <span>{t('buyer_btn_review_order')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
