import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Compass, 
  Home, 
  Sprout, 
  Store, 
  Truck, 
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export default function NotFoundPage() {
  const { selectRole, t } = useApp();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full p-8 md:p-10 rounded-3xl bg-white border border-emerald-900/10 text-center space-y-6 shadow-sm relative overflow-hidden">
        
        {/* 404 Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>{t('not_found_badge')}</span>
        </div>

        {/* Icon & Heading */}
        <div className="space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-brand-600 shadow-xs">
            <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: '12s' }} />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-emerald-950">
            {t('not_found_title')}
          </h2>
          <p className="text-xs md:text-sm text-slate-600 max-w-md mx-auto leading-relaxed font-normal">
            {t('not_found_desc')}
          </p>
        </div>

        {/* Quick Portal Switcher Grid (4 Roles) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-left">
          <button
            onClick={() => selectRole('farmer')}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition-all group cursor-pointer"
          >
            <Sprout className="w-4 h-4 text-brand-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-slate-900 group-hover:text-brand-700">{t('nav_farmer')}</div>
            <div className="text-[10px] text-slate-500">{t('not_found_farmer_desc')}</div>
          </button>

          <button
            onClick={() => selectRole('buyer')}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 transition-all group cursor-pointer"
          >
            <Store className="w-4 h-4 text-amber-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-slate-900 group-hover:text-amber-700">{t('nav_buyer')}</div>
            <div className="text-[10px] text-slate-500">{t('not_found_buyer_desc')}</div>
          </button>

          <button
            onClick={() => selectRole('driver')}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition-all group cursor-pointer"
          >
            <Truck className="w-4 h-4 text-emerald-700 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">{t('nav_driver')}</div>
            <div className="text-[10px] text-slate-500">{t('not_found_driver_desc')}</div>
          </button>

          <button
            onClick={() => selectRole('admin')}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-all group cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">{t('nav_admin')}</div>
            <div className="text-[10px] text-slate-500">{t('not_found_admin_desc')}</div>
          </button>
        </div>

        {/* Primary Return Button */}
        <div className="pt-2">
          <button
            onClick={() => selectRole('welcome')}
            className="w-full py-3 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>{t('not_found_btn_home')}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
