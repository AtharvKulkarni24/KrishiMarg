import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { useApp } from '../../context/AppContext';
import { BarChart3, Sprout, AlertCircle } from 'lucide-react';

const CROP_COLORS = {
  Tomato: '#0caf3d',     // KrishiMarg Green
  Onion: '#059669',      // Deep Teal
  Potato: '#0284c7',     // Sky Blue
  Cauliflower: '#0d9488', // Teal
  'Green Chili': '#16a34a', // Emerald
  DEFAULT: '#10b981'
};

export default function ProduceVolumeChart({ availableLots = [] }) {
  const { t, language } = useApp();

  const { chartData, totalVolumeKg } = useMemo(() => {
    if (!availableLots || availableLots.length === 0) {
      return { chartData: [], totalVolumeKg: 0 };
    }

    // Aggregate available volume grouped by crop
    const cropSums = {};
    let totalKg = 0;

    availableLots.forEach((lot) => {
      const crop = lot.crop_name || 'Other';
      const qty = Number(lot.quantity_kg) || 0;
      cropSums[crop] = (cropSums[crop] || 0) + qty;
      totalKg += qty;
    });

    const getCropDisplayName = (crop) => {
      if (language === 'mr') {
        const mrCrops = {
          Tomato: 'टोमॅटो',
          Onion: 'कांदा',
          Potato: 'बटाटा',
          Cauliflower: 'फ्लॉवर',
          'Green Chili': 'हिरवी मिरची'
        };
        return mrCrops[crop] || crop;
      }
      return crop;
    };

    const data = Object.entries(cropSums).map(([crop, volume]) => ({
      crop,
      displayName: getCropDisplayName(crop),
      volumeKg: volume,
      color: CROP_COLORS[crop] || CROP_COLORS.DEFAULT
    }));

    // Sort by volume descending for clean visual hierarchy
    data.sort((a, b) => b.volumeKg - a.volumeKg);

    return {
      chartData: data,
      totalVolumeKg: totalKg
    };
  }, [availableLots, language]);

  // Custom Interactive Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900/90 backdrop-blur-xs text-white px-3 py-2 rounded-xl text-xs shadow-lg border border-slate-700/50">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: item.color }}
            />
            <span className="font-semibold text-slate-200">
              {t('chart_crop')} <strong className="text-white">{item.displayName}</strong>
            </span>
          </div>
          <div className="text-[11px] text-slate-300">
            {t('chart_available')} <strong className="text-emerald-400 text-xs">{item.volumeKg} kg</strong>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl p-5 md:p-6 border border-emerald-900/10 shadow-sm flex flex-col justify-between h-full">
      {/* Chart Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-brand-600 flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-extrabold font-heading text-emerald-950">
              {t('chart_produce_volume_title')}
            </h3>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              {t('chart_produce_volume_sub')}
            </p>
          </div>
        </div>

        <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-extrabold text-emerald-900 flex items-center gap-1.5 shrink-0">
          <Sprout className="w-3.5 h-3.5 text-brand-600" />
          <span className="text-brand-700 font-black">{totalVolumeKg} kg</span>
        </div>
      </div>

      {/* Empty State vs Bar Chart */}
      {chartData.length === 0 ? (
        <div className="h-56 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <AlertCircle className="w-8 h-8 text-slate-400 mb-2" />
          <p className="text-xs font-semibold text-slate-600">
            {t('chart_no_produce')}
          </p>
        </div>
      ) : (
        <div className="py-2">
          {/* Responsive Bar Chart */}
          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="displayName"
                  tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  unit="kg"
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(12, 175, 61, 0.05)' }} />
                <Bar
                  dataKey="volumeKg"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`bar-cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Aggregated Crop Summary Badges */}
          <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
            {chartData.map((item) => (
              <span
                key={item.crop}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-100 text-[11px] font-semibold text-slate-700"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.displayName}:</span>
                <strong className="text-emerald-950 font-bold">{item.volumeKg} kg</strong>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
