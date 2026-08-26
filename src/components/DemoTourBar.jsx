import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Play, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles,
  Sprout,
  Store,
  Truck,
  RotateCcw
} from 'lucide-react';

export default function DemoTourBar() {
  const { demoStep, setDemoStep, selectRole } = useApp();

  const steps = [
    { number: 1, role: 'farmer', title: '1. Farmer Listing', subtitle: 'Fair-Price Corridor & AI Forecast' },
    { number: 2, role: 'buyer', title: '2. Buyer Bulk Cart', subtitle: '50km Feed & Escrow Checkout' },
    { number: 3, role: 'admin', title: '3. Route Optimization', subtitle: 'Google OR-Tools Milk-Run' },
    { number: 4, role: 'admin', title: '4. Driver Dispatch', subtitle: 'Broadcast to Gig Fleet' }
  ];

  const handleStepClick = (step) => {
    setDemoStep(step.number);
    selectRole(step.role);
  };

  return (
    <div className="bg-slate-900/95 border-b border-slate-800 px-4 py-2.5 backdrop-blur-md w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Left Pitch Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Judge Pitch Flow:
          </span>
        </div>

        {/* Step Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto py-1">
          {steps.map((s, idx) => {
            const isActive = demoStep === s.number;
            const isCompleted = demoStep > s.number;

            return (
              <React.Fragment key={s.number}>
                <button
                  onClick={() => handleStepClick(s)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                      : isCompleted
                      ? 'bg-slate-800 text-brand-300 border border-brand-500/30'
                      : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
                  ) : (
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      isActive ? 'bg-slate-950 text-amber-300' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {s.number}
                    </span>
                  )}
                  <span>{s.title}</span>
                </button>
                {idx < steps.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-slate-600 shrink-0 hidden sm:block" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Quick Reset Tour */}
        <button
          onClick={() => {
            setDemoStep(1);
            selectRole('farmer');
          }}
          className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 shrink-0 cursor-pointer transition-colors"
          title="Reset Pitch to Step 1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Demo</span>
        </button>

      </div>
    </div>
  );
}
