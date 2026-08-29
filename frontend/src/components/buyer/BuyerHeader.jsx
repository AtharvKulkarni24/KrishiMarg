import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Store, MapPin, FileText, Phone, Bell, AlertTriangle } from 'lucide-react';

export default function BuyerHeader({
  buyerLocation,
  setShowReturnPolicyModal,
  setShowSupportModal,
  unreadBuyerNotifs,
  buyerNotifications,
  markAllBuyerNotificationsRead,
  markBuyerNotificationRead,
  setSwitchOrderData,
  setShowSwitchFarmerModal
}) {
  const { t } = useApp();
  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowNotifPopover(false);
    };
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifPopover(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white border border-emerald-900/10 shadow-xs">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 shadow-xs">
            <Store className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-heading text-emerald-950 tracking-tight">
                {t('buyer_title')}
              </h1>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-mono font-semibold border border-slate-200">
                {t('buyer_badge', { id: buyerLocation.buyer_id })}
              </span>
            </div>
            <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
              {t('buyer_sub')}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 self-stretch md:self-auto justify-between md:justify-end">
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs shadow-xs">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center border border-emerald-200 text-brand-700 shadow-2xs">
            <MapPin className="w-3.5 h-3.5 text-brand-600" />
          </div>
          <div>
            <div className="text-[10px] text-emerald-800/80 font-semibold">{t('buyer_dropoff_label')}</div>
            <div className="font-bold text-emerald-950 text-xs">
              {buyerLocation.delivery_area}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowReturnPolicyModal(true)}
          className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          title={t('buyer_btn_return_policy')}
        >
          <FileText className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">{t('buyer_btn_return_policy')}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowSupportModal(true)}
          className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          title={t('buyer_customer_service_title')}
        >
          <Phone className="w-3.5 h-3.5 text-brand-600" />
          <span className="hidden sm:inline">{t('buyer_customer_service_title')}</span>
        </button>

        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotifPopover(prev => !prev)}
            className="relative p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 transition-colors cursor-pointer"
            title={t('buyer_notif_title')}
          >
            <Bell className="w-4 h-4 text-brand-700" />
            {unreadBuyerNotifs?.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-4.5 px-1 rounded-full bg-rose-600 text-white text-[10px] font-extrabold flex items-center justify-center border border-white animate-pulse">
                {unreadBuyerNotifs.length}
              </span>
            )}
          </button>

          {showNotifPopover && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 overflow-hidden animate-scale-up">
              <div className="p-3.5 bg-emerald-950 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold font-heading">{t('buyer_notif_title')}</span>
                </div>
                {buyerNotifications?.length > 0 && (
                  <button
                    type="button"
                    onClick={() => markAllBuyerNotificationsRead(buyerLocation.buyer_id)}
                    className="text-[11px] text-emerald-300 hover:text-white underline cursor-pointer"
                  >
                    Mark read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 p-1">
                {!buyerNotifications || buyerNotifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No notifications yet
                  </div>
                ) : (
                  buyerNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markBuyerNotificationRead(notif.id)}
                      className={`p-3 rounded-xl transition-colors cursor-pointer space-y-1 ${
                        !notif.read ? 'bg-emerald-50/70 hover:bg-emerald-100/50' : 'hover:bg-slate-50 opacity-80'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-950">{notif.title}</span>
                        <span className="text-[10px] text-slate-400">Just now</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {notif.message}
                      </p>
                      {notif.type === 'TIMEOUT_DELAYED' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowNotifPopover(false);
                            setSwitchOrderData({ order_id: notif.order_id, old_lot_id: 'lot_901', crop_name: 'Tomato' });
                            setShowSwitchFarmerModal(true);
                          }}
                          className="mt-1 px-3 py-1 rounded-lg bg-amber-600 text-white font-bold text-[10px] hover:bg-amber-700 transition-colors"
                        >
                          {t('buyer_btn_choose_another_farmer')}
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
