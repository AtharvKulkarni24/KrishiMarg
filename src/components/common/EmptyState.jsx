import React from 'react';
import { PackageOpen, Sparkles, ArrowRight, RotateCcw } from 'lucide-react';

export default function EmptyState({
  icon: Icon = PackageOpen,
  title = "No Records Available",
  description = "There are no active records matching your current filter criteria.",
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = ""
}) {
  return (
    <div className={`p-8 md:p-12 rounded-2xl glass-panel border border-slate-800 text-center flex flex-col items-center justify-center max-w-lg mx-auto ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
        <Icon className="w-7 h-7 text-brand-400" />
      </div>
      
      <h3 className="text-base md:text-lg font-bold font-heading text-white mb-1.5">
        {title}
      </h3>
      
      <p className="text-xs md:text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {actionLabel && (
            <button
              onClick={onAction}
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5"
            >
              <span>{actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {secondaryActionLabel && (
            <button
              onClick={onSecondaryAction}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>{secondaryActionLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
