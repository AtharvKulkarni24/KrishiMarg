import React from 'react';
import { Layers, PackageOpen } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import EmptyState from '../common/EmptyState';

export default function ActiveListings({ 
  myActiveLots, 
  handleOpenUpdateModal 
}) {
  const { t } = useApp();

  return (
    <div className="p-6 rounded-2xl bg-white border border-emerald-900/10 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand-600" />
          <span>{t('farmer_active_lots_title')}</span>
        </h3>
        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 font-mono">
          {t('farmer_active_count', { count: myActiveLots.length })}
        </span>
      </div>

      {myActiveLots.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title={t('farmer_no_lots_title')}
          description={t('farmer_no_lots_desc')}
          className="py-6 border-0 bg-transparent"
        />
      ) : (
        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
          {myActiveLots.map((lot) => {
            const cropEmoji = lot.crop_name === 'Tomato' ? '🍅' 
              : lot.crop_name === 'Onion' ? '🧅' 
              : lot.crop_name === 'Potato' ? '🥔' 
              : lot.crop_name === 'Cauliflower' ? '🥦' 
              : lot.crop_name === 'Green Chili' ? '🌶️' : '🌾';

            return (
              <div 
                key={lot.lot_id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-brand-500/40 flex items-center justify-between text-xs transition-colors group"
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

                <div className="text-right flex flex-col items-end gap-1.5">
                  <span className="text-[10px] font-bold text-brand-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                    {lot.status === 'AVAILABLE' ? t('farmer_lot_status_available') : (lot.status || t('farmer_lot_status_sold'))}
                  </span>
                  
                  {/* Quick Update Button on Lot Card */}
                  <button
                    type="button"
                    onClick={() => handleOpenUpdateModal(lot)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-brand-700 font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    + Add Harvest
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
