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
            className={`p-4 rounded-2xl border bg-white shadow-xl flex items-start gap-3 text-xs pointer-events-auto transition-all transform animate-slide-up duration-200 ${
              isSuccess
                ? 'border-emerald-300 shadow-emerald-500/10'
                : isError
                ? 'border-red-300 shadow-red-500/10'
                : isWarning
                ? 'border-amber-300 shadow-amber-500/10'
                : 'border-blue-300 shadow-blue-500/10'
            }`}
          >
            {isSuccess ? (
              <div className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 text-brand-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            ) : isError ? (
              <div className="w-7 h-7 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center shrink-0 text-red-600">
                <AlertCircle className="w-4 h-4" />
              </div>
            ) : isWarning ? (
              <div className="w-7 h-7 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 text-amber-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 text-blue-600">
                <Info className="w-4 h-4" />
              </div>
            )}

            <div className="flex-1 pt-0.5">
              <div className="font-bold text-slate-900 leading-snug">
                {isSuccess ? 'Success' : isError ? 'Error Notification' : isWarning ? 'Warning' : 'Notification'}
              </div>
              <p className="leading-snug text-slate-600 text-[11px] mt-0.5">
                {toast.message}
              </p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 transition-colors p-1 -mr-1 rounded-lg hover:bg-slate-100 cursor-pointer"
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
