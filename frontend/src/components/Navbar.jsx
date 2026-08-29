import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sprout, 
  Store, 
  Truck, 
  ShieldCheck,
  Home, 
  Wifi, 
  Languages 
} from 'lucide-react';

export default function Navbar() {
  const { 
    activeRole, 
    selectRole, 
    language,
    toggleLanguage,
    t 
  } = useApp();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-emerald-900/10 shadow-sm px-4 lg:px-8 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Brand Logo & Home Button */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => selectRole('welcome')}
            className="flex items-center gap-2.5 group text-left focus:outline-none cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:bg-brand-600 transition-colors">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold font-heading tracking-tight text-emerald-950 group-hover:text-brand-600 transition-colors">
                  Krishi<span className="text-brand-600">Marg</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  v1.0
                </span>
              </div>
              <span className="text-[11px] text-emerald-800/60 block -mt-0.5 font-medium">
                {t('brand_sub')}
              </span>
            </div>
          </button>
        </div>

        {/* 4 Role Switcher Tabs (Desktop / Tablet) */}
        <div className="hidden lg:flex items-center p-1 rounded-xl bg-slate-100/90 border border-slate-200/80 gap-0.5">
          {/* 1. Farmer */}
          <button
            onClick={() => selectRole('farmer')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeRole === 'farmer'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-emerald-950 hover:bg-white/70'
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>{t('nav_farmer')}</span>
          </button>

          {/* 2. Buyer */}
          <button
            onClick={() => selectRole('buyer')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeRole === 'buyer'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-amber-950 hover:bg-white/70'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>{t('nav_buyer')}</span>
          </button>

          {/* 3. Driver */}
          <button
            onClick={() => selectRole('driver')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeRole === 'driver'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-emerald-950 hover:bg-white/70'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>{t('nav_driver')}</span>
          </button>

          {/* 4. Admin */}
          <button
            onClick={() => selectRole('admin')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeRole === 'admin'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-emerald-950 hover:bg-white/70'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('nav_admin')}</span>
          </button>
        </div>

        {/* Right Utility Buttons: Language Switcher + Home */}
        <div className="flex items-center gap-2">
          
          {/* Language Toggle Button: English | मराठी */}
          <button
            onClick={toggleLanguage}
            title={language === 'en' ? "मराठीमध्ये बदला (Switch to Marathi)" : "Switch to English"}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-400 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Languages className="w-3.5 h-3.5 text-brand-600" />
            <span className="tracking-wide">
              <span className={language === 'en' ? 'text-brand-700 font-extrabold underline underline-offset-2' : 'text-slate-600'}>English</span>
              <span className="mx-1 text-slate-400 font-normal">|</span>
              <span className={language === 'mr' ? 'text-brand-700 font-extrabold underline underline-offset-2' : 'text-slate-600'}>मराठी</span>
            </span>
          </button>

          {/* Home / Switcher button */}
          <button
            onClick={() => selectRole('welcome')}
            className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 border border-slate-200 hover:border-emerald-200 transition-colors cursor-pointer"
            title={t('nav_return_home')}
          >
            <Home className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Mobile & Tablet Role Switcher (4 Roles) */}
      <div className="grid grid-cols-4 lg:hidden items-center pt-2 mt-2 border-t border-slate-100 gap-1 text-center">
        <button
          onClick={() => selectRole('farmer')}
          className={`py-1.5 text-center text-xs font-semibold rounded-lg ${
            activeRole === 'farmer' ? 'bg-emerald-50 text-brand-700 font-bold' : 'text-slate-500'
          }`}
        >
          {t('nav_farmer')}
        </button>
        <button
          onClick={() => selectRole('buyer')}
          className={`py-1.5 text-center text-xs font-semibold rounded-lg ${
            activeRole === 'buyer' ? 'bg-amber-50 text-amber-700 font-bold' : 'text-slate-500'
          }`}
        >
          {t('nav_buyer')}
        </button>
        <button
          onClick={() => selectRole('driver')}
          className={`py-1.5 text-center text-xs font-semibold rounded-lg ${
            activeRole === 'driver' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-500'
          }`}
        >
          {t('nav_driver')}
        </button>
        <button
          onClick={() => selectRole('admin')}
          className={`py-1.5 text-center text-xs font-semibold rounded-lg ${
            activeRole === 'admin' ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-500'
          }`}
        >
          {t('nav_admin')}
        </button>
      </div>
    </header>
  );
}
