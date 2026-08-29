import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sprout, 
  Scale, 
  Bell, 
  PackageOpen, 
  Clock, 
  X 
} from 'lucide-react';

export default function FarmerHeader() {
  const { 
    farmerNotifications,
    markFarmerNotificationRead,
    markAllFarmerNotificationsRead,
    currentUser, 
    t 
  } = useApp();

  const farmerId = currentUser?.user_id || 'f_101';

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showNotifBanner, setShowNotifBanner] = useState(true);
  const notifDropdownRef = useRef(null);

  // Filter notifications for this farmer
  const myNotifications = useMemo(() => {
    return (farmerNotifications || []).filter(n => n.farmer_id === farmerId);
  }, [farmerNotifications, farmerId]);

  const unreadNotifs = useMemo(() => {
    return myNotifications.filter(n => !n.read);
  }, [myNotifications]);

  // Close notifications dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
    };
    if (showNotifDropdown) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showNotifDropdown]);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowNotifDropdown(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* 🌾 1. Farmer Top Header with Notification Bell */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-emerald-900/10 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-emerald-50 text-brand-600 border border-emerald-200 shadow-xs">
              <Sprout className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold font-heading text-emerald-950">
              {t('farmer_portal_title')}
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200 font-mono">
              {farmerId}
            </span>
          </div>
          <p className="text-slate-700 text-xs md:text-sm font-semibold">
            {t('farmer_portal_sub')}
          </p>
        </div>

        {/* Right Section: Notification Bell + Logged-in Profile */}
        <div className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-end">
          
          {/* 🔔 Notification Bell Icon & Popover */}
          <div className="relative" ref={notifDropdownRef}>
            <button
              type="button"
              onClick={() => setShowNotifDropdown(prev => !prev)}
              className="relative p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-900 transition-colors cursor-pointer"
              title={t('farmer_notif_title')}
            >
              <Bell className="w-5 h-5 text-brand-700" />
              {unreadNotifs.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-rose-600 text-white text-[11px] font-extrabold flex items-center justify-center border-2 border-white shadow-xs animate-pulse">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown Popover */}
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 overflow-hidden animate-scale-up">
                <div className="p-3.5 bg-emerald-950 text-white flex items-center justify-between border-b border-emerald-900">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold font-heading">{t('farmer_notif_title')}</span>
                    {unreadNotifs.length > 0 && (
                      <span className="px-2 py-0.2 rounded-full bg-rose-500 text-[10px] font-extrabold">
                        {unreadNotifs.length} new
                      </span>
                    )}
                  </div>
                  {myNotifications.length > 0 && (
                    <button
                      type="button"
                      onClick={() => markAllFarmerNotificationsRead(farmerId)}
                      className="text-[11px] text-emerald-300 hover:text-white underline cursor-pointer"
                    >
                      {t('farmer_notif_mark_all')}
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 p-1">
                  {myNotifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 space-y-1">
                      <PackageOpen className="w-8 h-8 text-slate-300 mx-auto" />
                      <p>{t('farmer_notif_empty')}</p>
                    </div>
                  ) : (
                    myNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markFarmerNotificationRead(notif.id)}
                        className={`p-3.5 rounded-xl transition-colors cursor-pointer ${
                          !notif.read ? 'bg-emerald-50/70 hover:bg-emerald-100/50' : 'hover:bg-slate-50 opacity-80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${!notif.read ? 'bg-emerald-600 ring-2 ring-emerald-300' : 'bg-slate-300'}`} />
                            <span className="font-bold text-xs text-emerald-950">
                              {t('farmer_notif_new_order')}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{t('farmer_notif_just_now')}</span>
                          </span>
                        </div>

                        <div className="mt-1.5 pl-4 space-y-0.5 text-xs text-slate-700">
                          <div className="font-extrabold text-brand-700">
                            {notif.crop_name} • {notif.quantity_kg} kg
                          </div>
                          <div className="text-[11px] text-slate-600">
                            {t('farmer_notif_buyer', { name: notif.buyer_name })}
                          </div>
                          {notif.delivery_slot && (
                            <div className="text-[11px] text-amber-900 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block mt-0.5">
                              🚚 Delivery: {notif.delivery_slot.label} • {notif.delivery_slot.time_range} ({notif.delivery_slot.date_formatted})
                            </div>
                          )}
                          <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between pt-1">
                            <span>{t('farmer_notif_order_id', { id: notif.order_id })}</span>
                            <span className="px-2 py-0.2 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              {notif.status || 'Order Placed'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Badge */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-emerald-50/80 border border-emerald-200">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-brand-700 font-bold">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-emerald-900/70 font-semibold uppercase">{t('farmer_guaranteed_badge_label')}</div>
              <div className="text-xs font-extrabold text-brand-700">{currentUser?.full_name || 'Ramesh Patil'}</div>
            </div>
          </div>

        </div>
      </div>

      {/* 🔔 Subtle Dashboard Order Notification Banner (Feature 3) */}
      {unreadNotifs.length > 0 && showNotifBanner && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
              <Bell className="w-5 h-5 text-amber-700 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-amber-950 uppercase">{t('farmer_notif_new_order')}</span>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-200 text-amber-900 font-bold">
                  {unreadNotifs.length} unread
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-800 mt-0.5">
                {unreadNotifs[0].crop_name} • {unreadNotifs[0].quantity_kg} kg • {unreadNotifs[0].buyer_name} ({t('farmer_notif_order_id', { id: unreadNotifs[0].order_id })})
                {unreadNotifs[0].delivery_slot && (
                  <span className="text-amber-800 font-bold ml-1">
                    [Delivery: {unreadNotifs[0].delivery_slot.label} • {unreadNotifs[0].delivery_slot.time_range}]
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setShowNotifDropdown(true);
                markFarmerNotificationRead(unreadNotifs[0].id);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              {t('farmer_notif_view_order')}
            </button>
            <button
              type="button"
              onClick={() => setShowNotifBanner(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-amber-100 transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
