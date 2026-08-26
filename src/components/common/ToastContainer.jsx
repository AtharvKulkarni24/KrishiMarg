import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';

export default function ToastContainer() {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-3.5 rounded-xl border backdrop-blur-md shadow-2xl flex items-start gap-2.5 text-xs animate-slide-up pointer-events-auto transition-all ${
            toast.type === 'success'
              ? 'bg-slate-900/95 border-emerald-500/50 text-emerald-300'
              : toast.type === 'error'
              ? 'bg-slate-900/95 border-red-500/50 text-red-300'
              : 'bg-slate-900/95 border-blue-500/50 text-blue-300'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          )}
          <span className="leading-snug text-white font-medium">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
