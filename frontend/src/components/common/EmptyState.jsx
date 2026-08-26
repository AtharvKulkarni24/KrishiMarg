import React from 'react';
import { PackageOpen, ArrowRight, RotateCcw } from 'lucide-react';

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
    <div className={`p-8 md:p-12 rounded-2xl bg-white border border-emerald-900/10 text-center flex flex-col items-center justify-center max-w-lg mx-auto shadow-xs ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-brand-600 mb-4 shadow-xs">
        <Icon className="w-7 h-7" />
      </div>
      
      <h3 className="text-base md:text-lg font-bold font-heading text-emerald-950 mb-1.5">
        {title}
      </h3>
      
      <p className="text-xs md:text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {actionLabel && (
            <button
              onClick={onAction}
              className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>{actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {secondaryActionLabel && (
            <button
              onClick={onSecondaryAction}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>{secondaryActionLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
