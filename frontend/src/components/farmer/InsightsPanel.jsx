import React from 'react';
import { TrendingUp } from 'lucide-react';
import { 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Area, 
  AreaChart 
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { MOCK_INSIGHTS } from '../../services/mockData';

export default function InsightsPanel({ 
  isLoadingInsights, 
  insightsData, 
  cropName 
}) {
  const { t } = useApp();

  return (
    <div className="p-6 rounded-2xl bg-white border border-emerald-900/10 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-emerald-950">{t('farmer_ai_forecast_title')}</h3>
            <p className="text-[11px] text-slate-500">{t('farmer_ai_forecast_sub')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 font-bold">
            Mock Data
          </span>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold">
            {t('farmer_7day_horizon')}
          </span>
        </div>
      </div>

      {/* Price Forecast Chart */}
      <div className="h-52 w-full pt-2">
        {isLoadingInsights ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-500 space-y-2 flex-col">
            <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
            <span>{t('farmer_loading_forecast')}</span>
          </div>
        ) : (MOCK_INSIGHTS[cropName]?.ml_7_day_forecast || MOCK_INSIGHTS['Tomato'].ml_7_day_forecast) ? (
          <>
            <ResponsiveContainer width="100%" height="90%">
              <AreaChart data={MOCK_INSIGHTS[cropName]?.ml_7_day_forecast || MOCK_INSIGHTS['Tomato'].ml_7_day_forecast}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0caf3d" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0caf3d" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="#94a3b8" tick={{ fontSize: 10 }} unit="₹" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#bbf7d0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  formatter={(val) => [`₹${Number(val).toFixed(2)}/kg`, t('farmer_predicted_price')]}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#0caf3d" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#priceGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="text-[11px] text-slate-400 text-center pt-1 font-medium">
              {t('farmer_forecast_note')}
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            {t('farmer_no_forecast', { crop: cropName })}
          </div>
        )}
      </div>

      {/* Harvest Recommendation Card */}
      {insightsData?.harvest_suggestion && (() => {
        const text = insightsData.harvest_suggestion.toLowerCase();
        const isWait = text.includes('delay') || text.includes('wait') || text.includes('peaking');
        const actionBadge = isWait ? t('farmer_action_wait') : t('farmer_action_sell');

        return (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-950 text-sm">{t('farmer_advisory_title')}</span>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                isWait 
                  ? 'bg-amber-200 text-amber-900 border-amber-300' 
                  : 'bg-emerald-100 text-emerald-900 border-emerald-300'
              }`}>
                {actionBadge}
              </span>
            </div>
            <p className="text-xs font-semibold leading-relaxed text-amber-950">
              {insightsData.harvest_suggestion}
            </p>
            <p className="text-[11px] text-amber-800/80 pt-1.5 border-t border-amber-200/60 font-medium">
              {t('farmer_advisory_footer')}
            </p>
          </div>
        );
      })()}
    </div>
  );
}
