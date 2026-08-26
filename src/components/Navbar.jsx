import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sprout, 
  Store, 
  Truck, 
  Home, 
  Wifi, 
  WifiOff, 
  Sparkles, 
  ChevronDown,
  Layers
} from 'lucide-react';

export default function Navbar() {
  const { 
    activeRole, 
    selectRole, 
    useMockMode, 
    setUseMockMode,
    addToast 
  } = useApp();

  const handleToggleMock = () => {
    const nextMode = !useMockMode;
    setUseMockMode(nextMode);
    addToast(
      nextMode 
        ? 'Offline Mock Mode Active (Zero-latency rehearsal mode)' 
        : 'Live Backend Mode Active (Connecting to http://localhost:8080/api/v1)',
      'info'
    );
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo & Home Button */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => selectRole('welcome')}
            className="flex items-center gap-2 group text-left focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 p-0.5 shadow-md shadow-brand-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center group-hover:bg-slate-900 transition-colors">
                <Sprout className="w-5 h-5 text-brand-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold font-heading tracking-tight text-white group-hover:text-brand-300 transition-colors">
                  Krishi<span className="text-brand-400">Marg</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block -mt-1">कृषिमार्ग • SIH26033</span>
            </div>
          </button>
        </div>

        {/* Role Switcher Tabs */}
        <div className="hidden md:flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800">
          <button
            onClick={() => selectRole('farmer')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeRole === 'farmer'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>Farmer / FPO</span>
          </button>

          <button
            onClick={() => selectRole('buyer')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeRole === 'buyer'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Bulk Buyer</span>
          </button>

          <button
            onClick={() => selectRole('admin')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeRole === 'admin'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Logistics Map</span>
          </button>
        </div>

        {/* Right Utility Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Mock vs Live API Mode Toggle */}
          <button
            onClick={handleToggleMock}
            title={useMockMode ? "Switch to Live Java API" : "Switch to Offline Mock Mode"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              useMockMode
                ? 'bg-slate-800/80 text-emerald-400 border-emerald-500/30 hover:bg-slate-800'
                : 'bg-blue-950/60 text-blue-300 border-blue-500/40 hover:bg-blue-900/60'
            }`}
          >
            {useMockMode ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">Mock Mode (Demo)</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Live Backend API</span>
              </>
            )}
          </button>

          {/* Home / Switcher button */}
          <button
            onClick={() => selectRole('welcome')}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
            title="Return to Welcome Screen"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Mobile Role Switcher (Small Screens) */}
      <div className="flex md:hidden items-center justify-between pt-2 mt-2 border-t border-slate-800/60">
        <button
          onClick={() => selectRole('farmer')}
          className={`flex-1 py-1 text-center text-xs font-medium ${activeRole === 'farmer' ? 'text-brand-400 border-b-2 border-brand-400' : 'text-slate-400'}`}
        >
          Farmer
        </button>
        <button
          onClick={() => selectRole('buyer')}
          className={`flex-1 py-1 text-center text-xs font-medium ${activeRole === 'buyer' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-400'}`}
        >
          Buyer
        </button>
        <button
          onClick={() => selectRole('admin')}
          className={`flex-1 py-1 text-center text-xs font-medium ${activeRole === 'admin' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400'}`}
        >
          Logistics
        </button>
      </div>
    </header>
  );
}
