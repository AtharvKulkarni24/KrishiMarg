import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sprout, 
  ShoppingCart, 
  Truck, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Languages,
  ChevronRight
} from 'lucide-react';

export default function WelcomePage() {
  const { selectRole, language, toggleLanguage, t } = useApp();

  const portalCards = [
    {
      id: 'farmer',
      role: 'farmer',
      icon: Sprout,
      badge: t('welcome_farmer_badge'),
      title: t('welcome_farmer_title'),
      description: t('welcome_farmer_desc'),
      cta: t('welcome_farmer_btn'),
      iconBg: 'bg-emerald-50 text-brand-600 group-hover:bg-brand-500 group-hover:text-white',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      btnBg: 'bg-brand-500 hover:bg-brand-600 shadow-brand-500/20 text-white',
      hoverBorder: 'hover:border-brand-500/60'
    },
    {
      id: 'buyer',
      role: 'buyer',
      icon: ShoppingCart,
      badge: t('welcome_buyer_badge'),
      title: t('welcome_buyer_title'),
      description: t('welcome_buyer_desc'),
      cta: t('welcome_buyer_btn'),
      iconBg: 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      btnBg: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 text-white',
      hoverBorder: 'hover:border-emerald-600/60'
    },
    {
      id: 'driver',
      role: 'driver',
      icon: Truck,
      badge: t('welcome_driver_badge'),
      title: t('welcome_driver_title'),
      description: t('welcome_driver_desc'),
      cta: t('welcome_driver_btn'),
      iconBg: 'bg-emerald-50 text-emerald-800 group-hover:bg-emerald-700 group-hover:text-white',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      btnBg: 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-700/20 text-white',
      hoverBorder: 'hover:border-emerald-700/60'
    },
    {
      id: 'admin',
      role: 'admin',
      icon: ShieldCheck,
      badge: t('welcome_admin_badge'),
      title: t('welcome_admin_title'),
      description: t('welcome_admin_desc'),
      cta: t('welcome_admin_btn'),
      iconBg: 'bg-teal-50 text-teal-700 group-hover:bg-teal-700 group-hover:text-white',
      badgeBg: 'bg-teal-50 text-teal-800 border-teal-200/80',
      btnBg: 'bg-teal-700 hover:bg-teal-800 shadow-teal-700/20 text-white',
      hoverBorder: 'hover:border-teal-700/60'
    }
  ];

  const workflowSteps = [
    {
      step: t('step_1_num'),
      icon: Sprout,
      title: t('step_1_title'),
      description: t('step_1_desc'),
      color: 'text-brand-600 bg-emerald-50'
    },
    {
      step: t('step_2_num'),
      icon: ShoppingCart,
      title: t('step_2_title'),
      description: t('step_2_desc'),
      color: 'text-emerald-700 bg-emerald-50'
    },
    {
      step: t('step_3_num'),
      icon: ShieldCheck,
      title: t('step_3_title'),
      description: t('step_3_desc'),
      color: 'text-teal-700 bg-teal-50'
    },
    {
      step: t('step_4_num'),
      icon: Truck,
      title: t('step_4_title'),
      description: t('step_4_desc'),
      color: 'text-emerald-800 bg-emerald-50'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f6faf6] text-slate-800 flex flex-col justify-between relative overflow-x-hidden">
      
      {/* Background Soft Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-100/35 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-20 left-0 w-80 h-80 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Top Header Bar */}
      <header className="pt-6 px-4 sm:px-6 max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-4 z-10">
        
        {/* Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center shadow-md shadow-brand-500/20 shrink-0">
            <Sprout className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-heading tracking-tight text-emerald-950">
                Krishi<span className="text-brand-600">Marg</span>
              </h1>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                {t('brand_sub')}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">{t('tagline')}</p>
          </div>
        </div>

        {/* Right Badges: Ministry Identification + Language Toggle */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-emerald-900/10 text-xs text-slate-600 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-semibold text-emerald-950 text-[11px] sm:text-xs">
              {t('ministry_badge')}
            </span>
          </div>

          {/* Bilingual Language Switcher Toggle */}
          <button
            onClick={toggleLanguage}
            title={language === 'en' ? "Switch to Marathi (मराठी)" : "Switch to English"}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-400 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
          >
            <Languages className="w-3.5 h-3.5 text-brand-600" />
            <span>{language === 'en' ? 'EN ⇄ मराठी' : 'मराठी ⇄ EN'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-10 w-full z-10 flex-1 flex flex-col justify-center">
        
        {/* 1. Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300/80 text-emerald-800 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>{t('welcome_badge')}</span>
          </div>

          {/* Heading 1: Welcome to KrishiMarg */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading tracking-tight text-emerald-950 leading-tight">
            {t('welcome_hero_title')}
          </h2>

          {/* Heading 2: Choose how you want to use the platform */}
          <p className="text-lg sm:text-xl md:text-2xl font-bold font-heading text-brand-600 mt-2">
            {t('welcome_hero_sub_heading')}
          </p>

          {/* Subtitle */}
          <p className="text-slate-600 text-xs sm:text-sm md:text-base mt-2.5 max-w-2xl mx-auto leading-relaxed font-normal">
            {t('welcome_hero_subtitle')}
          </p>
        </div>

        {/* 2. Four Portal Cards (2×2 Grid on Desktop, 2 cols on Tablet, 1 col on Mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 max-w-5xl mx-auto w-full">
          {portalCards.map((card) => {
            const Icon = card.icon;

            return (
              <div 
                key={card.id}
                onClick={() => selectRole(card.role)}
                className={`group relative rounded-2xl p-6 bg-white border border-emerald-900/10 ${card.hoverBorder} transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg shadow-sm`}
              >
                {/* Subtle Role Descriptor Badge */}
                <div className={`absolute top-4 right-4 text-[10px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full border ${card.badgeBg}`}>
                  {card.badge}
                </div>

                <div>
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl border border-emerald-200/80 flex items-center justify-center mb-4 transition-all duration-200 shadow-xs ${card.iconBg}`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Role Title */}
                  <h3 className="text-xl font-bold font-heading text-emerald-950 group-hover:text-brand-700 transition-colors mb-2">
                    {card.title}
                  </h3>

                  {/* One-Sentence Description */}
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6 font-normal">
                    {card.description}
                  </p>
                </div>

                {/* Primary Action CTA Button */}
                <button 
                  type="button"
                  tabIndex={-1}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${card.btnBg}`}
                >
                  <span>{card.cta}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
                </button>
              </div>
            );
          })}
        </div>

        {/* 3. How KrishiMarg Works Section */}
        <div className="mt-12 md:mt-16 max-w-5xl mx-auto w-full pt-8 border-t border-emerald-900/10">
          
          <div className="text-center mb-6 md:mb-8">
            <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-emerald-950 tracking-tight">
              {t('how_it_works_title')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {t('how_it_works_sub')}
            </p>
          </div>

          {/* 4-Step Process Grid / Flow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {workflowSteps.map((step, idx) => {
              const StepIcon = step.icon;

              return (
                <div 
                  key={step.step}
                  className="bg-white rounded-2xl p-4 border border-emerald-900/10 shadow-xs flex flex-col justify-between relative"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${step.color} border border-emerald-200/60`}>
                        <StepIcon className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-heading">
                        Step {step.step}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold font-heading text-emerald-950 mb-1">
                      {step.title}
                    </h4>

                    <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
                      {step.description}
                    </p>
                  </div>

                  {idx < workflowSteps.length - 1 && (
                    <div className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-20">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs">
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-emerald-900/10 bg-white/70 backdrop-blur-md py-4 px-4 sm:px-6 text-center text-xs text-slate-500 w-full z-10">
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
