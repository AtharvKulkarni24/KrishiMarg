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
  MapPin
} from 'lucide-react';

export default function WelcomePage() {
  const { selectRole, setDemoStep } = useApp();

  const handleStartDemoPitch = () => {
    setDemoStep(1);
    selectRole('farmer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-brand-500/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[350px] bg-emerald-700/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[350px] bg-amber-500/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Top Header Bar */}
      <header className="pt-8 px-6 max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-4 z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 p-0.5 shadow-lg shadow-brand-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sprout className="w-6 h-6 text-brand-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-heading tracking-tight text-white">
                Krishi<span className="text-brand-400">Marg</span>
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-medium border border-brand-500/30">
                कृषिमार्ग v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400">Direct Farm-to-Buyer Marketplace & AI Logistics</p>
          </div>
        </div>

        {/* Ministry Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-medium text-amber-300">SIH 2026 #26033</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">Ministry of Consumer Affairs</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8 w-full z-10 flex-1 flex flex-col justify-center">
        {/* Hero Headline */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-4 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Eliminating Intermediaries • Empowering Farmers • Smart AI Logistics</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold font-heading tracking-tight text-white leading-tight">
            Choose Your Portal to Enter <br />
            <span className="bg-gradient-to-r from-brand-400 via-emerald-300 to-amber-300 bg-clip-text text-transparent">
              The Intelligent Agri-Network
            </span>
          </h2>
          <p className="text-slate-400 text-sm md:text-base mt-3 max-w-2xl mx-auto leading-relaxed">
            Select your role to access customized dashboards for live APMC-benchmarked trade, 
            AI-driven harvest advisories, and Google OR-Tools pooled multi-stop milk-run logistics.
          </p>
        </div>

        {/* 3 Main Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto w-full">
          
          {/* 1. Farmer / FPO Card */}
          <div 
            onClick={() => selectRole('farmer')}
            className="group relative rounded-2xl p-6 glass-panel hover:bg-slate-900/90 border border-slate-800 hover:border-brand-500/50 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:scale-[1.02] hover:shadow-2xl hover:shadow-brand-500/10"
          >
            <div className="absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/30">
              Supply Side
            </div>

            <div>
              <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-5 group-hover:bg-brand-500 group-hover:text-slate-950 text-brand-400 transition-all duration-300 shadow-md">
                <Sprout className="w-7 h-7" />
              </div>

              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold font-heading text-white group-hover:text-brand-300 transition-colors">
                  Farmer / FPO
                </h3>
                <span className="text-xs text-slate-400 font-normal">| किसान</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">
                List harvest with Agmark grades, guarantee a 15-20% higher payout over local Mandis, and view 7-day AI forecast advisories.
              </p>

              {/* Feature Highlights */}
              <ul className="space-y-2 border-t border-slate-800/80 pt-4 mb-6 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Scale className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  <span><strong>Fair-Price Corridor:</strong> Mandi + 15% guaranteed</span>
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  <span><strong>AI Harvest Advisory:</strong> 7-day Prophet forecast</span>
                </li>
                <li className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  <span><strong>FPO Lot Aggregation:</strong> Pool small farm batches</span>
                </li>
              </ul>
            </div>

            <button className="w-full py-2.5 px-4 rounded-xl bg-brand-600/20 hover:bg-brand-500 text-brand-300 hover:text-slate-950 font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-2 border border-brand-500/30 group-hover:border-brand-400">
              <span>Enter Farmer Portal</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* 2. Bulk Buyer Card */}
          <div 
            onClick={() => selectRole('buyer')}
            className="group relative rounded-2xl p-6 glass-panel hover:bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:scale-[1.02] hover:shadow-2xl hover:shadow-amber-500/10"
          >
            <div className="absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
              Demand Side
            </div>

            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5 group-hover:bg-amber-500 group-hover:text-slate-950 text-amber-400 transition-all duration-300 shadow-md">
                <Store className="w-7 h-7" />
              </div>

              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold font-heading text-white group-hover:text-amber-300 transition-colors">
                  Bulk Buyer
                </h3>
                <span className="text-xs text-slate-400 font-normal">| थोक खरीदार</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">
                Institutional procurement for HoReCa, hostels, and housing societies with 15-20% savings below retail and verified quality.
              </p>

              {/* Feature Highlights */}
              <ul className="space-y-2 border-t border-slate-800/80 pt-4 mb-6 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span><strong>50km Radius Search:</strong> PostGIS spatial query</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span><strong>Escrow Protection:</strong> Funds locked until delivery OTP</span>
                </li>
                <li className="flex items-center gap-2">
                  <Scale className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span><strong>Wholesale Rates:</strong> 15-20% below retail store prices</span>
                </li>
              </ul>
            </div>

            <button className="w-full py-2.5 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-2 border border-amber-500/30 group-hover:border-amber-400">
              <span>Enter Buyer Marketplace</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* 3. Logistics & Admin Dispatcher Card */}
          <div 
            onClick={() => selectRole('admin')}
            className="group relative rounded-2xl p-6 glass-panel hover:bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10"
          >
            <div className="absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
              The Showstopper
            </div>

            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5 group-hover:bg-blue-500 group-hover:text-slate-950 text-blue-400 transition-all duration-300 shadow-md">
                <Truck className="w-7 h-7" />
              </div>

              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold font-heading text-white group-hover:text-blue-300 transition-colors">
                  Logistics & Admin
                </h3>
                <span className="text-xs text-slate-400 font-normal">| चालक व डिस्पैचर</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">
                Algorithmic multi-stop milk-run route optimization with Google OR-Tools and simulated gig driver dispatch.
              </p>

              {/* Feature Highlights */}
              <ul className="space-y-2 border-t border-slate-800/80 pt-4 mb-6 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span><strong>Google OR-Tools:</strong> Combinatorial VRP solver</span>
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span><strong>34.5% Cost Reduction:</strong> Clustered farm pickups</span>
                </li>
                <li className="flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span><strong>Gig Fleet Dispatch:</strong> Mini-truck / Tata Ace matching</span>
                </li>
              </ul>
            </div>

            <button className="w-full py-2.5 px-4 rounded-xl bg-blue-500/20 hover:bg-blue-500 text-blue-300 hover:text-slate-950 font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-2 border border-blue-500/30 group-hover:border-blue-400">
              <span>Open Logistics Map</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>

        {/* 🌟 5-Minute Evaluator Pitch Mode Button */}
        <div className="mt-8 max-w-4xl mx-auto w-full">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-950/80 via-slate-900/90 to-amber-950/80 border border-slate-700/80 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                <PlayCircle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">5-Minute Judge Pitch Mode</h4>
                <p className="text-xs text-slate-400">
                  Walk through the seamless 4-step Golden Journey: Farmer List ➔ Buyer Order ➔ Admin Optimization ➔ Driver Dispatch.
                </p>
              </div>
            </div>
            <button 
              onClick={handleStartDemoPitch}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-brand-500 hover:from-amber-400 hover:to-brand-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all duration-200 shrink-0 flex items-center gap-2"
            >
              <span>Start Guided Pitch</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      {/* Footer Strip */}
      <footer className="border-t border-slate-800/80 py-4 px-6 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 z-10">
        <div>
          <span>KrishiMarg • Built for Smart India Hackathon 2026</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Pune / Saswad / Purandar Pilot Region</span>
          <span>•</span>
          <span className="text-brand-400">PostGIS + Spring Boot + OR-Tools</span>
        </div>
      </footer>
    </div>
  );
}
