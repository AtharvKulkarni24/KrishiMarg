import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, X, CheckCircle2, ArrowRight } from 'lucide-react';

export default function CheckoutModal({
  checkoutModalOpen,
  setCheckoutModalOpen,
  totalQuantity,
  chosenLots,
  cartItems,
  totalAmount,
  activeSelectedSlot,
  buyerLocation,
  completedOrder,
  isCheckingOut,
  handlePlaceOrder,
  handleProceedToDriver
}) {
  const { t } = useApp();

  if (!checkoutModalOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
      onClick={() => setCheckoutModalOpen(false)}
    >
      <div 
        className="max-w-md w-full p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-emerald-950 font-heading">{t('buyer_checkout_modal_title')}</h3>
          </div>
          <button 
            onClick={() => setCheckoutModalOpen(false)}
            className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs text-slate-600 space-y-3 font-medium">
          <p>
            {t('buyer_modal_summary', { qty: totalQuantity, count: chosenLots.length })}
          </p>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 font-mono">
            <div className="space-y-1.5 pb-2 border-b border-slate-200">
              {chosenLots.map(lot => {
                const qty = cartItems[lot.lot_id] || 1;
                return (
                  <div key={lot.lot_id} className="flex justify-between text-[11px]">
                    <span className="text-slate-700">{lot.crop_name} ({qty} kg):</span>
                    <span className="font-bold text-slate-900">₹{(qty * Number(lot.price_per_kg)).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500">{t('buyer_delivery_slot_label')}</span>
              <span className="text-brand-700 font-bold">{activeSelectedSlot.shortLabel} • {activeSelectedSlot.timeRange}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500">Deliver to:</span>
              <span className="text-slate-800 font-bold">{buyerLocation.delivery_area}</span>
            </div>
            <div className="flex justify-between text-amber-800 font-extrabold pt-1.5 border-t border-slate-200 text-sm">
              <span>Order Total:</span>
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
              className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-brand-600/20"
            >
              <span>{t('buyer_modal_btn_driver')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 pt-1">
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
  );
}
