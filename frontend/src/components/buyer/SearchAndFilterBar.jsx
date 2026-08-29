import React from 'react';
import { useApp } from '../../context/AppContext';
import { Search, X, Check, ArrowUpDown } from 'lucide-react';

export default function SearchAndFilterBar({
  searchQuery,
  setSearchQuery,
  cropFilters,
  selectedCropFilter,
  setSelectedCropFilter,
  sortBy,
  setSortBy
}) {
  const { t } = useApp();

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-emerald-900/10 shadow-xs space-y-4">
      <div>
        <label htmlFor="buyer-search-input" className="block text-xs sm:text-sm font-bold text-emerald-950 mb-1.5 flex items-center gap-1.5">
          <Search className="w-4 h-4 text-brand-600" />
          <span>{t('buyer_search_heading')}</span>
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="buyer-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('buyer_search_placeholder')}
            className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {cropFilters.map((c) => {
            const isSelected = selectedCropFilter === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCropFilter(c.id)}
                className={`text-xs px-4 py-2 rounded-xl font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/90'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>{t('buyer_sort_label')}</span>
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:border-brand-500 focus:bg-white cursor-pointer transition-colors"
          >
            <option value="recommended">{t('buyer_sort_recommended')}</option>
            <option value="price_asc">{t('buyer_sort_price_asc')}</option>
            <option value="price_desc">{t('buyer_sort_price_desc')}</option>
            <option value="distance">{t('buyer_sort_distance')}</option>
            <option value="qty">{t('buyer_sort_qty')}</option>
            <option value="quality">{t('buyer_sort_quality')}</option>
          </select>
        </div>
      </div>
    </div>
  );
}
