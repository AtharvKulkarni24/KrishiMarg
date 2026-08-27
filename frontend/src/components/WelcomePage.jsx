import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sprout, 
  Store, 
  Truck, 
  TrendingUp, 
  ShieldCheck, 
  Compass, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  Scale, 
  MapPin, 
  Languages 
} from 'lucide-react';

export default function WelcomePage() {
  const { selectRole, setDemoStep, language, toggleLanguage, t } = useApp();

  const handleStartDemoPitch = () => {
    setDemoStep(1);
    selectRole('farmer');
  };

  return (
    <div className="min-h-screen bg-[#f6faf6] text-slate-800 flex flex-col justify-between relative overflow-hidden">
      
      {/* Subtle Background Agricultural Shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-100/40 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-10 left-0 w-80 h-80 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Top Header Bar */}
      <header className="pt-6 px-6 max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-4 z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center shadow-md shadow-brand-500/20">
            <Sprout className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-heading tracking-tight text-emerald-950">
                Krishi<span className="text-brand-600">Marg</span>
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                {t('brand_sub')}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">{t('tagline')}</p>
          </div>
        </div>

        {/* Right Header Badges: Ministry + Language Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-emerald-900/10 text-xs text-slate-600 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-semibold text-emerald-950">{t('ministry_badge')}</span>
          </div>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            title="Switch Language (भाषा बदला)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-400 transition-all cursor-pointer shadow-xs"
          >
            <Languages className="w-3.5 h-3.5 text-brand-600" />
            <span>{language === 'en' ? 'EN ⇄ मराठी' : 'मराठी ⇄ EN'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8 w-full z-10 flex-1 flex flex-col justify-center">
        {/* Hero Headline */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300/80 text-emerald-800 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>{t('welcome_badge')}</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold font-heading tracking-tight text-emerald-950 leading-tight">
            {t('welcome_hero_title_1')} <br />
            <span className="text-brand-600">
              {t('welcome_hero_title_2')}
            </span>
          </h2>
          <p className="text-slate-600 text-sm md:text-base mt-3 max-w-2xl mx-auto leading-relaxed font-normal">
            {t('welcome_hero_sub')}
          </p>
        </div>

        {/* 3 Main Role Selection Cards (Farmer, Buyer, Driver) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto w-full">
          
          {/* 1. Farmer Card */}
          <div 
            onClick={() => selectRole('farmer')}
            className="group relative rounded-2xl p-6 bg-white border border-emerald-900/10 hover:border-brand-500 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:scale-[1.02] shadow-sm hover:shadow-xl hover:shadow-brand-500/10"
          >
            <div className="absolute top-4 right-4 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {t('welcome_farmer_badge')}
            </div>

            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-4 text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300 shadow-xs">
                <Sprout className="w-6 h-6" />
              </div>

              <div className="flex items-center gap-1.5 mb-1">
                <h3 className="text-lg font-bold font-heading text-emerald-950 group-hover:text-brand-700 transition-colors">
                  {t('welcome_farmer_title')}
                </h3>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                {t('welcome_farmer_desc')}
              </p>

              {/* Feature Highlights */}
              <ul className="space-y-2.5 border-t border-slate-100 pt-3 mb-5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Scale className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                  <span className="text-[11px]"><strong>{t('welcome_farmer_f1_title')}</strong> {t('welcome_farmer_f1_desc')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                  <span className="text-[11px]"><strong>{t('welcome_farmer_f2_title')}</strong> {t('welcome_farmer_f2_desc')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                  <span className="text-[11px]"><strong>{t('welcome_farmer_f3_title')}</strong> {t('welcome_farmer_f3_desc')}</span>
                </li>
              </ul>
            </div>

            <button className="w-full py-2.5 px-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm shadow-brand-500/20">
              <span>{t('welcome_farmer_btn')}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* 2. Bulk Buyer Card */}
          <div 
            onClick={() => selectRole('buyer')}
            className="group relative rounded-2xl p-6 bg-white border border-amber-900/10 hover:border-amber-500 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:scale-[1.02] shadow-sm hover:shadow-xl hover:shadow-amber-500/10"
          >
            <div className="absolute top-4 right-4 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              {t('welcome_buyer_badge')}
            </div>

            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300 shadow-xs">
                <Store className="w-6 h-6" />
              </div>

              <div className="flex items-center gap-1.5 mb-1">
                <h3 className="text-lg font-bold font-heading text-emerald-950 group-hover:text-amber-700 transition-colors">
                  {t('welcome_buyer_title')}
                </h3>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                {t('welcome_buyer_desc')}
              </p>

              {/* Feature Highlights */}
              <ul className="space-y-2.5 border-t border-slate-100 pt-3 mb-5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="text-[11px]"><strong>{t('welcome_buyer_f1_title')}</strong> {t('welcome_buyer_f1_desc')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Scale className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="text-[11px]"><strong>{t('welcome_buyer_f2_title')}</strong> {t('welcome_buyer_f2_desc')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="text-[11px]"><strong>{t('welcome_buyer_f3_title')}</strong> {t('welcome_buyer_f3_desc')}</span>
                </li>
              </ul>
            </div>

            <button className="w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm shadow-amber-500/20">
              <span>{t('welcome_buyer_btn')}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* 3. Driver / Fleet Carrier Card */}
          <div 
            onClick={() => selectRole('driver')}
            className="group relative rounded-2xl p-6 bg-white border border-emerald-900/10 hover:border-emerald-600 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:scale-[1.02] shadow-sm hover:shadow-xl hover:shadow-emerald-600/10"
          >
            <div className="absolute top-4 right-4 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {t('welcome_driver_badge')}
            </div>

            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-4 text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white transition-all duration-300 shadow-xs">
                <Truck className="w-6 h-6" />
              </div>

              <div className="flex items-center gap-1.5 mb-1">
                <h3 className="text-lg font-bold font-heading text-emerald-950 group-hover:text-emerald-800 transition-colors">
                  {t('welcome_driver_title')}
                </h3>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                {t('welcome_driver_desc')}
              </p>

              {/* Feature Highlights */}
              <ul className="space-y-2.5 border-t border-slate-100 pt-3 mb-5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="text-[11px]"><strong>{t('welcome_driver_f1_title')}</strong> {t('welcome_driver_f1_desc')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="text-[11px]"><strong>{t('welcome_driver_f2_title')}</strong> {t('welcome_driver_f2_desc')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="text-[11px]"><strong>{t('welcome_driver_f3_title')}</strong> {t('welcome_driver_f3_desc')}</span>
                </li>
              </ul>
            </div>

            <button className="w-full py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-700/20">
              <span>{t('welcome_driver_btn')}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-emerald-900/10 bg-white/70 backdrop-blur-md py-4 px-6 text-center text-xs text-slate-500 w-full z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-medium text-emerald-950">
            {t('footer_text')}
          </span>
          <span className="text-slate-400 text-[11px]">
            {t('pilot_region')} • {t('tech_stack_footer')}
          </span>
        </div>
      </footer>

    </div>
  );
}
