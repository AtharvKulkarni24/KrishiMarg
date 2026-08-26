import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Compass, 
  Home, 
  Sprout, 
  Store, 
  Truck, 
  ArrowLeft, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export default function NotFoundPage() {
  const { selectRole } = useApp();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full p-8 md:p-10 rounded-3xl glass-panel border border-slate-800 text-center space-y-6 shadow-2xl relative overflow-hidden">
        
        {/* Subtle Decorative Glows (No Purple!) */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-brand-500/10 blur-[60px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-12 right-1/2 translate-x-1/2 w-48 h-48 bg-amber-500/10 blur-[60px] rounded-full pointer-events-none" />

        {/* 404 Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Error 404 • Route Not Found</span>
        </div>

        {/* Icon & Heading */}
        <div className="space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-amber-400 shadow-inner">
            <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: '12s' }} />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-white">
            Lost in the Supply Chain?
          </h2>
          <p className="text-xs md:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            The page or route you are attempting to access does not exist on KrishiMarg. Choose an active portal below to get back on track.
          </p>
        </div>

        {/* Quick Portal Switcher Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left">
          <button
            onClick={() => selectRole('farmer')}
            className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-brand-500/50 transition-all group"
          >
            <Sprout className="w-4 h-4 text-brand-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white group-hover:text-brand-300">Farmer Portal</div>
            <div className="text-[10px] text-slate-400">List produce & prices</div>
          </button>

          <button
            onClick={() => selectRole('buyer')}
            className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/50 transition-all group"
          >
            <Store className="w-4 h-4 text-amber-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white group-hover:text-amber-300">Buyer Market</div>
            <div className="text-[10px] text-slate-400">Procure bulk lots</div>
          </button>

          <button
            onClick={() => selectRole('admin')}
            className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-blue-500/50 transition-all group"
          >
            <Truck className="w-4 h-4 text-blue-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white group-hover:text-blue-300">Logistics Hub</div>
            <div className="text-[10px] text-slate-400">Optimize truck paths</div>
          </button>
        </div>

        {/* Primary Return Button */}
        <div className="pt-2">
          <button
            onClick={() => selectRole('welcome')}
            className="w-full py-2.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to KrishiMarg Welcome Screen</span>
          </button>
        </div>

      </div>
    </div>
  );
}
