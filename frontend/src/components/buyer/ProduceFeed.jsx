import React from 'react';
import { useApp } from '../../context/AppContext';
import { PackageOpen, CheckCircle2, Tag, Plus, Minus, Trash2 } from 'lucide-react';
import EmptyState from '../common/EmptyState';
import { CROP_IMAGES, DEFAULT_CROP_IMAGE } from '../../services/mockData';

export default function ProduceFeed({
  filteredAndSortedLots,
  cartItems,
  cropPriceStats,
  getProduceFreshness,
  getSelectedQuantity,
  setDetailsModalLot,
  updateCartQuantity,
  setLocalCardQuantity,
  addToCart,
  removeFromCart,
  selectedCropFilter,
  searchQuery,
  setSelectedCropFilter,
  setSearchQuery
}) {
  const { t } = useApp();

  return (
    <div className="lg:col-span-8 space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-sm sm:text-base font-bold text-emerald-950">
            {t('buyer_available_heading')}
          </h2>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold font-mono">
            {filteredAndSortedLots.length === 1 
              ? t('buyer_matches_count_single') 
              : t('buyer_matches_count', { count: filteredAndSortedLots.length })}
          </span>
        </div>
        {(selectedCropFilter !== 'ALL' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedCropFilter('ALL');
              setSearchQuery('');
            }}
            className="text-xs text-brand-600 hover:text-brand-700 font-semibold hover:underline cursor-pointer"
          >
            Reset filters
          </button>
        )}
      </div>

      {filteredAndSortedLots.length === 0 ? (
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredAndSortedLots.map((lot) => {
            const isInCart = cartItems[lot.lot_id] !== undefined;
            const currentQty = getSelectedQuantity(lot);
            const cropImg = lot.image_url || CROP_IMAGES[lot.crop_name] || DEFAULT_CROP_IMAGE;
            
            const isBestPrice = cropPriceStats.countMap[lot.crop_name] > 1 && 
              Number(lot.price_per_kg) === cropPriceStats.minMap[lot.crop_name];

            const freshness = getProduceFreshness(lot.harvest_date, lot.crop_name);

            return (
              <div
                key={lot.lot_id}
                onClick={() => setDetailsModalLot(lot)}
                className={`rounded-2xl bg-white border transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden group shadow-xs hover:shadow-md hover:-translate-y-0.5 ${
                  isInCart
                    ? 'border-brand-500 ring-2 ring-brand-500/20'
                    : 'border-slate-200/90 hover:border-brand-300'
                }`}
              >
                <div className="w-full h-48 sm:h-52 overflow-hidden relative bg-slate-100">
                  <img
                    src={cropImg}
                    alt={lot.crop_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = DEFAULT_CROP_IMAGE;
                    }}
                  />
                  
                  <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
                    {isBestPrice ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-600/95 text-white font-bold text-[10px] shadow-sm backdrop-blur-xs flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        <span>{t('buyer_badge_best_price')}</span>
                      </span>
                    ) : (
                      <span />
                    )}

                    {isInCart && (
                      <span className="px-2.5 py-1 rounded-full bg-brand-600 text-white font-mono text-[10px] font-bold shadow-sm backdrop-blur-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{currentQty} kg</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold font-heading text-emerald-950 group-hover:text-brand-600 transition-colors">
                        {lot.crop_name}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {lot.lot_id}
                      </span>
                    </div>

                    <div className="mt-2 flex items-baseline justify-between">
                      <div className="text-lg font-extrabold text-amber-700 font-mono">
                        ₹{Number(lot.price_per_kg).toFixed(2)} <span className="text-xs text-slate-500 font-normal font-sans">/ kg</span>
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        {t('buyer_card_available')}: <strong className="text-slate-800 font-mono">{lot.quantity_kg} kg</strong>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                        freshness.status === 'FRESH'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          : freshness.status === 'USE_SOON'
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : freshness.status === 'LOW_FRESHNESS'
                          ? 'bg-rose-100 text-rose-900 border border-rose-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>
                          {freshness.status === 'FRESH'
                            ? `Fresh • ${freshness.daysRemaining}d left`
                            : freshness.status === 'USE_SOON'
                            ? `Use Soon • ${freshness.daysRemaining}d left`
                            : freshness.status === 'LOW_FRESHNESS'
                            ? `Low Freshness • 1d left`
                            : `Shelf Life Passed`}
                        </span>
                      </span>

                      <span className="text-[11px] text-brand-700/80 font-medium group-hover:text-brand-700 transition-colors">
                        {t('buyer_btn_tap_details')} →
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2" onClick={(e) => e.stopPropagation()}>
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
                        <Minus className="w-3.5 h-3.5" />
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
                          className="w-full text-center py-1 px-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs font-mono font-bold focus:bg-white focus:border-brand-500 focus:outline-none"
                        />
                        <span className="absolute right-2 text-[10px] text-slate-400 font-medium pointer-events-none">kg</span>
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
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {isInCart ? (
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 py-2 px-3 rounded-xl bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                          <span>{t('buyer_btn_in_cart')}</span>
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
                        className="w-full py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-98"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t('buyer_btn_add')}</span>
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
  );
}
