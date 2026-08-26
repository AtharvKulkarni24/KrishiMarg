import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, setToasts } = useApp();

  if (!toasts || toasts.length === 0) return null;

  const removeToast = (id) => {
    if (setToasts) {
      setToasts(prev => prev.filter(t => t.id !== id));
    }
  };

  return (
    <div 
      aria-live="polite" 
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            role="alert"
            className={`p-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-start gap-3 text-xs pointer-events-auto transition-all transform animate-slide-up duration-200 ${
              isSuccess
                ? 'bg-slate-900/95 border-emerald-500/60 text-emerald-300 shadow-emerald-950/40'
                : isError
                ? 'bg-slate-900/95 border-red-500/60 text-red-300 shadow-red-950/40'
                : isWarning
                ? 'bg-slate-900/95 border-amber-500/60 text-amber-300 shadow-amber-950/40'
                : 'bg-slate-900/95 border-sky-500/60 text-sky-300 shadow-sky-950/40'
            }`}
          >
            {isSuccess ? (
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
            ) : isError ? (
              <div className="w-6 h-6 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle className="w-4 h-4 text-red-400" />
              </div>
            ) : isWarning ? (
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-lg bg-sky-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Info className="w-4 h-4 text-sky-400" />
              </div>
            )}

            <div className="flex-1 pt-0.5">
              <div className="font-semibold text-white leading-snug">
                {isSuccess ? 'Success' : isError ? 'Error Notification' : isWarning ? 'Warning' : 'System Update'}
              </div>
              <p className="leading-snug text-slate-300 text-[11px] mt-0.5">
                {toast.message}
              </p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-500 hover:text-slate-200 transition-colors p-1 -mr-1 rounded-lg hover:bg-slate-800"
              title="Dismiss alert"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
