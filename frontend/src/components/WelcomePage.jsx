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
  PlayCircle,
  MapPin,
  Languages,
  Send,
  UserCheck
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

        {/* 4 Main Role Selection Cards (Farmer, Buyer, Driver, Admin) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto w-full">
          
          {/* 1. Farmer / FPO Card */}
          <div 
            onClick={() => selectRole('farmer')}
            className="group relative rounded-2xl p-5 bg-white border border-emerald-900/10 hover:border-brand-500 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:scale-[1.02] shadow-sm hover:shadow-xl hover:shadow-brand-500/10"
          >
            <div className="absolute top-3.5 right-3.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
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
              <p className="text-slate-600 text-xs leading-relaxed mb-3 line-clamp-2">
                {t('welcome_farmer_desc')}
              </p>

              {/* Feature Highlights */}
              <ul className="space-y-2 border-t border-slate-100 pt-3 mb-4 text-xs text-slate-700">
                <li className="flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                  <span className="text-[11px]"><strong>{t('welcome_farmer_f1_title')}</strong> Mandi +20%</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                  <span className="text-[11px]"><strong>{t('welcome_farmer_f2_title')}</strong> 7-Day ML</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                  <span className="text-[11px]"><strong>{t('welcome_farmer_f3_title')}</strong> Batch Pool</span>
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
            className="group relative rounded-2xl p-5 bg-white border border-amber-900/10 hover:border-amber-500 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:scale-[1.02] shadow-sm hover:shadow-xl hover:shadow-amber-500/10"
          >
            <div className="absolute top-3.5 right-3.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
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
              <p className="text-slate-600 text-xs leading-relaxed mb-3 line-clamp-2">
                {t('welcome_buyer_desc')}
              </p>

              {/* Feature Highlights */}
              <ul className="space-y-2 border-t border-slate-100 pt-3 mb-4 text-xs text-slate-700">
                <li className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="text-[11px]"><strong>50km Query:</strong> Local Fresh</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="text-[11px]"><strong>Escrow Vault:</strong> OTP Protected</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="text-[11px]"><strong>Wholesale:</strong> 18% Less</span>
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
            className="group relative rounded-2xl p-5 bg-white border border-emerald-900/10 hover:border-emerald-600 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:scale-[1.02] shadow-sm hover:shadow-xl hover:shadow-emerald-600/10"
          >
            <div className="absolute top-3.5 right-3.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
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
              <p className="text-slate-600 text-xs leading-relaxed mb-3 line-clamp-2">
                {t('welcome_driver_desc')}
              </p>

              {/* Feature Highlights */}
              <ul className="space-y-2 border-t border-slate-100 pt-3 mb-4 text-xs text-slate-700">
                <li className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="text-[11px]"><strong>₹1,200/Trip:</strong> Guaranteed Fee</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="text-[11px]"><strong>Turn-by-Turn:</strong> GPS Itinerary</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="text-[11px]"><strong>Delivery OTP:</strong> Instant Settlement</span>
                </li>
              </ul>
            </div>

            <button className="w-full py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-700/20">
              <span>{t('welcome_driver_btn')}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* 4. Admin Logistics Dashboard Card */}
          <div 
            onClick={() => selectRole('admin')}
            className="group relative rounded-2xl p-5 bg-white border border-blue-900/10 hover:border-blue-500 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:scale-[1.02] shadow-sm hover:shadow-xl hover:shadow-blue-500/10"
          >
            <div className="absolute top-3.5 right-3.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              {t('welcome_admin_badge')}
            </div>

            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center mb-4 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>

              <div className="flex items-center gap-1.5 mb-1">
                <h3 className="text-lg font-bold font-heading text-emerald-950 group-hover:text-blue-700 transition-colors">
                  {t('welcome_admin_title')}
                </h3>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed mb-3 line-clamp-2">
                {t('welcome_admin_desc')}
              </p>

              {/* Feature Highlights */}
              <ul className="space-y-2 border-t border-slate-100 pt-3 mb-4 text-xs text-slate-700">
                <li className="flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="text-[11px]"><strong>OR-Tools:</strong> Combinatorial VRP</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="text-[11px]"><strong>-34.5% Cost:</strong> Milk-Run Routing</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="text-[11px]"><strong>Live Orders:</strong> GET /pending-orders</span>
                </li>
              </ul>
            </div>

            <button className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/20">
              <span>{t('welcome_admin_btn')}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>

        {/* 🌟 5-Minute Evaluator Pitch Mode Button */}
        <div className="mt-8 max-w-4xl mx-auto w-full">
          <div className="p-5 rounded-2xl bg-white border border-emerald-300 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
                <PlayCircle className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-950">{t('welcome_pitch_title')}</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  {t('welcome_pitch_desc')}
                </p>
              </div>
            </div>
            <button 
              onClick={handleStartDemoPitch}
              className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all duration-200 shrink-0 flex items-center gap-2 cursor-pointer"
            >
              <span>{t('welcome_pitch_btn')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      {/* Footer Strip */}
      <footer className="border-t border-emerald-900/10 bg-white py-4 px-6 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 z-10">
        <div>
          <span>{t('footer_text')}</span>
        </div>
        <div className="flex items-center gap-3 text-slate-500">
          <span>{t('pilot_region')}</span>
          <span>•</span>
          <span className="text-brand-700 font-semibold">{t('tech_stack_footer')}</span>
        </div>
      </footer>
    </div>
  );
}
