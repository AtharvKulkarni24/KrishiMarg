import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  CheckCircle2, 
  ChevronRight, 
  Sparkles,
  RotateCcw
} from 'lucide-react';

export default function DemoTourBar() {
  const { demoStep, setDemoStep, selectRole, t } = useApp();

  const steps = [
    { number: 1, role: 'farmer', title: t('tour_step_1'), subtitle: t('tour_step_1_sub') },
    { number: 2, role: 'buyer', title: t('tour_step_2'), subtitle: t('tour_step_2_sub') },
    { number: 3, role: 'admin', title: t('tour_step_3'), subtitle: t('tour_step_3_sub') },
    { number: 4, role: 'driver', title: t('tour_step_4'), subtitle: t('tour_step_4_sub') }
  ];

  const handleStepClick = (step) => {
    setDemoStep(step.number);
    selectRole(step.role);
  };

  return (
    <div className="bg-white border-b border-emerald-900/10 px-4 py-2 shadow-xs w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Left Pitch Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-6 h-6 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          </div>
          <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
            {t('tour_title')}
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
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-white font-bold shadow-sm'
                      : isCompleted
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-800'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                  ) : (
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isActive ? 'bg-white text-amber-700' : 'bg-slate-300 text-slate-700'
                    }`}>
                      {s.number}
                    </span>
                  )}
                  <span>{s.title}</span>
                </button>
                {idx < steps.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-slate-400 shrink-0 hidden sm:block" />
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
          className="text-[11px] text-slate-600 hover:text-emerald-950 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 shrink-0 cursor-pointer transition-colors"
          title="Reset Pitch to Step 1"
        >
          <RotateCcw className="w-3 h-3 text-slate-500" />
          <span>{t('tour_reset')}</span>
        </button>

      </div>
    </div>
  );
}
