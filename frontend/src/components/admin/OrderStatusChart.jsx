import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useApp } from '../../context/AppContext';
import { PieChart as PieChartIcon, Package, AlertCircle } from 'lucide-react';

const STATUS_COLOR_MAP = {
  PENDING_ROUTE: '#f59e0b', // Amber
  PENDING: '#f59e0b',
  ROUTED: '#0284c7',        // Sky Blue
  ACCEPTED: '#0caf3d',      // KrishiMarg Green
  IN_TRANSIT: '#10b981',    // Emerald
  COMPLETED: '#047857',     // Forest Green
  DELIVERED: '#047857',
  CANCELLED: '#94a3b8'      // Slate
};

export default function OrderStatusChart({ orders = [] }) {
  const { t } = useApp();

  const { chartData, totalOrders } = useMemo(() => {
    if (!orders || orders.length === 0) {
      return { chartData: [], totalOrders: 0 };
    }

    const counts = {};
    orders.forEach((ord) => {
      const rawStatus = (ord.status || 'PENDING_ROUTE').toUpperCase();
      counts[rawStatus] = (counts[rawStatus] || 0) + 1;
    });

    const getStatusLabel = (key) => {
      switch (key) {
        case 'PENDING_ROUTE':
        case 'PENDING':
          return t('status_pending');
        case 'ROUTED':
          return t('status_routed');
        case 'ACCEPTED':
          return t('status_accepted');
        case 'IN_TRANSIT':
          return t('status_in_transit');
        case 'COMPLETED':
        case 'DELIVERED':
          return t('status_delivered');
        case 'CANCELLED':
          return t('status_cancelled');
        default:
          return key;
      }
    };

    const data = Object.entries(counts).map(([statusKey, count]) => ({
      key: statusKey,
      name: getStatusLabel(statusKey),
      value: count,
      color: STATUS_COLOR_MAP[statusKey] || '#0caf3d'
    }));

    return {
      chartData: data,
      totalOrders: orders.length
    };
  }, [orders, t]);

  // Custom Interactive Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <div className="bg-slate-900/90 backdrop-blur-xs text-white px-3 py-2 rounded-xl text-xs shadow-lg border border-slate-700/50">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: item.payload.color }}
            />
            <span className="font-semibold text-slate-200">
              {t('chart_status')} <strong className="text-white">{item.name}</strong>
            </span>
          </div>
          <div className="text-[11px] text-slate-300">
            {t('chart_orders')} <strong className="text-emerald-400 text-xs">{item.value}</strong> ({Math.round((item.value / totalOrders) * 100)}%)
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
            <PieChartIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-extrabold font-heading text-emerald-950">
              {t('chart_order_status_title')}
            </h3>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              {t('chart_order_status_sub')}
            </p>
          </div>
        </div>

        <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-extrabold text-emerald-900 flex items-center gap-1.5 shrink-0">
          <span>{t('chart_total_orders')}:</span>
          <span className="text-brand-700 font-black">{totalOrders}</span>
        </div>
      </div>

      {/* Empty State vs Donut Chart */}
      {totalOrders === 0 ? (
        <div className="h-56 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <AlertCircle className="w-8 h-8 text-slate-400 mb-2" />
          <p className="text-xs font-semibold text-slate-600">
            {t('chart_no_orders')}
          </p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2">
          {/* Donut Chart Container */}
          <div className="w-48 h-48 relative flex items-center justify-center shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={46}
                  outerRadius={70}
                  paddingAngle={4}
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Central Count Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-xl font-extrabold text-emerald-950 font-heading leading-tight">
                {totalOrders}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {t('admin_tab_orders')}
              </span>
            </div>
          </div>

          {/* Status Breakdown Legend List */}
          <div className="flex-1 w-full sm:w-auto space-y-2 text-xs">
            {chartData.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-emerald-50/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-md shrink-0 shadow-2xs"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-semibold text-slate-800 text-[11px] md:text-xs">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900">
                    {item.value}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    ({Math.round((item.value / totalOrders) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
