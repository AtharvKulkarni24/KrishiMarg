import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { apiClient } from '../../services/api';
import { 
  MOCK_USERS, 
  CROP_IMAGES, 
  DEFAULT_CROP_IMAGE, 
  CUSTOMER_SUPPORT_PHONE, 
  CUSTOMER_SUPPORT_EMAIL, 
  getProduceFreshness 
} from '../../services/mockData';
import EmptyState from '../common/EmptyState';
import { 
  Store, 
  MapPin, 
  ShieldCheck, 
  ShoppingBag, 
  ArrowRight, 
  CheckCircle2, 
  Check,
  Lock, 
  Sparkles, 
  Truck, 
  Plus, 
  Minus,
  Trash2, 
  Search, 
  PackageOpen,
  Calendar,
  User,
  Tag,
  Award,
  ArrowUpDown,
  X,
  TrendingDown,
  Clock,
  AlertTriangle,
  Star,
  Phone,
  Mail,
  HelpCircle,
  FileText,
  Bell,
  RefreshCw,
  Zap,
  CheckCircle
} from 'lucide-react';

export default function BuyerMarketplace() {
  const { 
    availableLots, 
    pendingOrders,
    createOrder, 
    setDemoStep, 
    selectRole, 
    addToast, 
    currentUser, 
    buyerNotifications,
    markBuyerNotificationRead,
    markAllBuyerNotificationsRead,
    simulateFarmerTimeout,
    switchOrderFarmer,
    orderFeedbacks,
    submitOrderFeedback,
    t 
  } = useApp();

  // Cart state mapping: lot_id -> selected_quantity_kg
  const [cartItems, setCartItems] = useState({
    'lot_901': 15,
    'lot_902': 20
  });

  // Local card state for unadded lots: lot_id -> selected_quantity_kg
  const [cardQuantities, setCardQuantities] = useState({});

  const [selectedCropFilter, setSelectedCropFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  // Modal state for viewing product details
  const [detailsModalLot, setDetailsModalLot] = useState(null);

  // Feature 2: Choose Another Farmer Modal
  const [showSwitchFarmerModal, setShowSwitchFarmerModal] = useState(false);
  const [switchOrderData, setSwitchOrderData] = useState(null); // { order_id, old_lot_id, crop_name }

  // Feature 3: Delivery Slot Selection State
  const [selectedSlotId, setSelectedSlotId] = useState('tomorrow_morning');

  // Feature 4: Rating & Feedback State (for completed orders)
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingHover, setRatingHover] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [ratingOrderTarget, setRatingOrderTarget] = useState(null);

  // Feature 5: Return Policy & Customer Service Modals
  const [showReturnPolicyModal, setShowReturnPolicyModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  // Buyer Notification Bell Popover State
  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const notifRef = useRef(null);

  // Countdown timer ticker for active 15-min timeout
  const [currentTime, setCurrentTime] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close modals on Escape key & close notifications on click outside
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setDetailsModalLot(null);
        setCheckoutModalOpen(false);
        setShowSwitchFarmerModal(false);
        setShowReturnPolicyModal(false);
        setShowSupportModal(false);
        setShowNotifPopover(false);
      }
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

  // Buyer reference location (Kothrud, Pune)
  const buyerLocation = {
    buyer_id: currentUser?.user_id || 'b_501',
    full_name: currentUser?.full_name || 'Green Leaf Restaurant & Mess',
    delivery_area: 'Kothrud, Pune',
    latitude: currentUser?.default_lat || 18.5018,
    longitude: currentUser?.default_lng || 73.8636
  };

  // Helper to resolve farmer name from users data
  const getFarmerName = (farmerId) => {
    const user = MOCK_USERS.find(u => u.user_id === farmerId);
    return user ? user.full_name : (farmerId === 'f_102' ? 'Suresh Mohite' : 'Ramesh Patil');
  };

  // Helper to resolve farm location display
  const getFarmLocationName = (lot) => {
    if (lot.farmer_id === 'f_101') return 'Saswad Farm #1, Purandar';
    if (lot.farmer_id === 'f_102') return 'Jejuri Road Farm, Purandar';
    return `Purandar Cluster (${Number(lot.latitude || 18.34).toFixed(2)}, ${Number(lot.longitude || 74.03).toFixed(2)})`;
  };

  // Delivery Slots dynamically generated from current date
  const deliverySlots = useMemo(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(today.getDate() + 2);

    const fmt = (d) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    return [
      {
        id: 'deliver_now',
        label: t('buyer_slot_now'),
        shortLabel: 'Deliver Now',
        dateFormatted: fmt(today),
        timeRange: '2–4 Hours Express',
        tag: 'Express'
      },
      {
        id: 'tomorrow_morning',
        label: t('buyer_slot_tomorrow_morning'),
        shortLabel: 'Tomorrow Morning',
        dateFormatted: fmt(tomorrow),
        timeRange: '9 AM – 12 PM',
        tag: 'Recommended'
      },
      {
        id: 'tomorrow_evening',
        label: t('buyer_slot_tomorrow_evening'),
        shortLabel: 'Tomorrow Evening',
        dateFormatted: fmt(tomorrow),
        timeRange: '4 PM – 7 PM',
        tag: 'Evening'
      },
      {
        id: 'day_after_morning',
        label: t('buyer_slot_day_after_morning'),
        shortLabel: 'After 2 Days',
        dateFormatted: fmt(dayAfter),
        timeRange: '9 AM – 12 PM',
        tag: 'Scheduled'
      }
    ];
  }, [t]);

  const activeSelectedSlot = deliverySlots.find(s => s.id === selectedSlotId) || deliverySlots[1];

  // Dynamic calculation for Best Price indicator per crop
  const cropPriceStats = useMemo(() => {
    const minMap = {};
    const countMap = {};
    availableLots.forEach(lot => {
      const crop = lot.crop_name;
      const price = Number(lot.price_per_kg);
      if (!isNaN(price)) {
        countMap[crop] = (countMap[crop] || 0) + 1;
        if (minMap[crop] === undefined || price < minMap[crop]) {
          minMap[crop] = price;
        }
      }
    });
    return { minMap, countMap };
  }, [availableLots]);

  // Cart Management Functions
  const getSelectedQuantity = (lot) => {
    if (cartItems[lot.lot_id] !== undefined) {
      return cartItems[lot.lot_id];
    }
    if (cardQuantities[lot.lot_id] !== undefined) {
      return cardQuantities[lot.lot_id];
    }
    return 10;
  };

  const setLocalCardQuantity = (lotId, qty) => {
    setCardQuantities(prev => ({ ...prev, [lotId]: qty }));
  };

  const addToCart = (lotId, qty) => {
    setCartItems(prev => ({ ...prev, [lotId]: qty }));
    addToast(t('buyer_btn_in_cart_qty', { qty }), 'success');
  };

  const updateCartQuantity = (lotId, qty) => {
    setCartItems(prev => ({ ...prev, [lotId]: qty }));
  };

  const removeFromCart = (lotId) => {
    setCartItems(prev => {
      const updated = { ...prev };
      delete updated[lotId];
      return updated;
    });
    addToast(t('buyer_btn_remove'), 'info');
  };

  // Chosen Lots in Cart
  const chosenLots = useMemo(() => {
    return availableLots.filter(l => cartItems[l.lot_id] !== undefined && cartItems[l.lot_id] > 0);
  }, [availableLots, cartItems]);

  const totalQuantity = useMemo(() => {
    return chosenLots.reduce((sum, lot) => sum + (cartItems[lot.lot_id] || 0), 0);
  }, [chosenLots, cartItems]);

  const totalAmount = useMemo(() => {
    return chosenLots.reduce((sum, lot) => {
      const qty = cartItems[lot.lot_id] || 0;
      return sum + (qty * Number(lot.price_per_kg));
    }, 0);
  }, [chosenLots, cartItems]);

  const estimatedSavings = useMemo(() => {
    return Math.round(totalAmount * 0.28);
  }, [totalAmount]);

  // Filter and Sort Logic
  const filteredAndSortedLots = useMemo(() => {
    let result = availableLots.filter(lot => {
      if (selectedCropFilter !== 'ALL' && lot.crop_name.toLowerCase() !== selectedCropFilter.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const cropMatch = lot.crop_name.toLowerCase().includes(q);
        const farmerName = getFarmerName(lot.farmer_id).toLowerCase();
        const farmerMatch = farmerName.includes(q);
        const lotMatch = lot.lot_id.toLowerCase().includes(q);
        if (!cropMatch && !farmerMatch && !lotMatch) return false;
      }
      return true;
    });

    // Client-side sorting
    result.sort((a, b) => {
      if (sortBy === 'price_asc') return Number(a.price_per_kg) - Number(b.price_per_kg);
      if (sortBy === 'price_desc') return Number(b.price_per_kg) - Number(a.price_per_kg);
      if (sortBy === 'distance') return Number(a.distance_km || 28) - Number(b.distance_km || 28);
      if (sortBy === 'qty') return Number(b.quantity_kg) - Number(a.quantity_kg);
      if (sortBy === 'quality') return 0;
      return 0; // recommended default
    });

    return result;
  }, [availableLots, selectedCropFilter, searchQuery, sortBy]);

  // Checkout Placement Handler
  const handlePlaceOrder = async () => {
    if (chosenLots.length === 0) return;
    setIsCheckingOut(true);

    try {
      const lotQuantities = {};
      chosenLots.forEach(lot => {
        lotQuantities[lot.lot_id] = cartItems[lot.lot_id] || 1;
      });

      const payload = {
        buyer_id: buyerLocation.buyer_id,
        lot_ids: chosenLots.map(l => l.lot_id),
        lot_quantities: lotQuantities,
        dropoff_latitude: buyerLocation.latitude,
        dropoff_longitude: buyerLocation.longitude,
        delivery_slot: {
          slot_id: activeSelectedSlot.id,
          label: activeSelectedSlot.shortLabel,
          date_formatted: activeSelectedSlot.dateFormatted,
          time_range: activeSelectedSlot.timeRange
        }
      };

      const result = await apiClient.createOrder(payload);

      const newOrder = {
        order_id: result.order_id,
        buyer_id: payload.buyer_id,
        lot_ids: payload.lot_ids,
        lot_quantities: payload.lot_quantities,
        dropoff_latitude: payload.dropoff_latitude,
        dropoff_longitude: payload.dropoff_longitude,
        delivery_slot: payload.delivery_slot,
        total_amount: result.total_amount || totalAmount,
        status: result.status || 'PENDING_ROUTE',
        acceptance_status: 'WAITING_CONFIRMATION',
        created_at: new Date().toISOString(),
        farmer_acceptance_deadline: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        payment_status: result.payment_status || 'MOCK_SUCCESS'
      };

      createOrder(newOrder);
      setCompletedOrder(newOrder);
      setIsCheckingOut(false);
      setDemoStep(3); // Advance demo pitch step to Driver
    } catch (err) {
      addToast(t('toast_order_error', { err: err.message }), 'error');
      setIsCheckingOut(false);
    }
  };

  const handleProceedToDriver = () => {
    setCheckoutModalOpen(false);
    selectRole('driver');
  };

  // Recent buyer active order (for 15-min countdown & timeout UI)
  const activeBuyerOrder = useMemo(() => {
    return completedOrder || (pendingOrders && pendingOrders.find(o => o.buyer_id === buyerLocation.buyer_id)) || null;
  }, [completedOrder, pendingOrders, buyerLocation.buyer_id]);

  // Calculate remaining time for 15-min acceptance deadline
  const acceptanceTimeRemainingStr = useMemo(() => {
    if (!activeBuyerOrder?.farmer_acceptance_deadline) return null;
    const deadline = new Date(activeBuyerOrder.farmer_acceptance_deadline).getTime();
    const diffMs = deadline - currentTime;
    if (diffMs <= 0) return '00:00';
    const totalSecs = Math.floor(diffMs / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [activeBuyerOrder, currentTime]);

  // Alternative farmers available for switching after timeout
  const alternativeFarmersForSwitch = useMemo(() => {
    if (!switchOrderData) return [];
    return availableLots.filter(l => 
      l.crop_name === switchOrderData.crop_name && 
      l.lot_id !== switchOrderData.old_lot_id &&
      l.status !== 'SOLD'
    );
  }, [availableLots, switchOrderData]);

  // Crop filter chips list
  const cropFilters = [
    { id: 'ALL', label: t('buyer_filter_all') },
    { id: 'Tomato', label: t('buyer_filter_tomato') },
    { id: 'Onion', label: t('buyer_filter_onion') },
    { id: 'Potato', label: t('buyer_filter_potato') }
  ];

  const unreadBuyerNotifs = (buyerNotifications || []).filter(n => !n.read);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 w-full">
      
      {/* 🌿 1. Modern Header & Delivery Location */}
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

        {/* Right Section: Delivery Location + Quick Links + Notification Bell */}
        <div className="flex flex-wrap items-center gap-2.5 self-stretch md:self-auto justify-between md:justify-end">
          
          {/* Deliver to Location Badge */}
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

          {/* 📋 Feature 5: Return Policy Button */}
          <button
            type="button"
            onClick={() => setShowReturnPolicyModal(true)}
            className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title={t('buyer_btn_return_policy')}
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">{t('buyer_btn_return_policy')}</span>
          </button>

          {/* 📞 Feature 5: Customer Service Button */}
          <button
            type="button"
            onClick={() => setShowSupportModal(true)}
            className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title={t('buyer_customer_service_title')}
          >
            <Phone className="w-3.5 h-3.5 text-brand-600" />
            <span className="hidden sm:inline">{t('buyer_customer_service_title')}</span>
          </button>

          {/* 🔔 Buyer Notification Bell & Popover */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setShowNotifPopover(prev => !prev)}
              className="relative p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 transition-colors cursor-pointer"
              title={t('buyer_notif_title')}
            >
              <Bell className="w-4 h-4 text-brand-700" />
              {unreadBuyerNotifs.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-4.5 px-1 rounded-full bg-rose-600 text-white text-[10px] font-extrabold flex items-center justify-center border border-white animate-pulse">
                  {unreadBuyerNotifs.length}
                </span>
              )}
            </button>

            {/* Buyer Notification Dropdown */}
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

      {/* ⏱️ FEATURE 2: 15-Minute Acceptance Status / Timeout Alert Banner */}
      {activeBuyerOrder && (
        <div className={`p-4 rounded-2xl border transition-all shadow-xs ${
          activeBuyerOrder.acceptance_status === 'TIMEOUT_DELAYED'
            ? 'bg-amber-50 border-amber-300'
            : 'bg-blue-50/80 border-blue-200'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                activeBuyerOrder.acceptance_status === 'TIMEOUT_DELAYED'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {activeBuyerOrder.acceptance_status === 'TIMEOUT_DELAYED' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-700 animate-bounce" />
                ) : (
                  <Clock className="w-5 h-5 text-blue-700 animate-spin" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">
                    {activeBuyerOrder.acceptance_status === 'TIMEOUT_DELAYED'
                      ? t('buyer_timeout_delayed_title')
                      : t('buyer_timeout_waiting')}
                  </span>
                  <span className="px-2 py-0.2 rounded-md bg-white border border-slate-200 text-slate-600 font-mono text-[10px] font-bold">
                    Order #{activeBuyerOrder.order_id}
                  </span>
                </div>
                <p className="text-slate-600 mt-0.5">
                  {activeBuyerOrder.acceptance_status === 'TIMEOUT_DELAYED'
                    ? t('buyer_timeout_delayed_desc')
                    : `Farmer has 15 minutes to confirm. ${acceptanceTimeRemainingStr} remaining.`}
                </p>
              </div>
            </div>

            {/* Action Buttons: Choose Another Farmer OR Simulate Timeout */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              {activeBuyerOrder.acceptance_status === 'TIMEOUT_DELAYED' ? (
                <button
                  type="button"
                  onClick={() => {
                    setSwitchOrderData({ order_id: activeBuyerOrder.order_id, old_lot_id: activeBuyerOrder.lot_ids?.[0] || 'lot_901', crop_name: 'Tomato' });
                    setShowSwitchFarmerModal(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                >
                  {t('buyer_btn_choose_another_farmer')}
                </button>
              ) : (
                /* Demo helper button to test timeout without waiting 15 real mins */
                <button
                  type="button"
                  onClick={() => simulateFarmerTimeout(activeBuyerOrder.order_id)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-blue-300 text-blue-900 font-bold text-[11px] transition-colors cursor-pointer shadow-2xs"
                  title="Test the 15-min timeout flow instantly for demo"
                >
                  {t('buyer_simulate_timeout_btn')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ⭐ FEATURE 4: Post-Delivery Rating Card (if order is delivered) */}
      {activeBuyerOrder && (activeBuyerOrder.status === 'COMPLETED' || activeBuyerOrder.status === 'DELIVERED') && (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 border border-emerald-300 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
              <CheckCircle className="w-5 h-5 text-brand-600" />
              <span>✓ {t('buyer_notif_delivered')} — {t('buyer_rating_title')}</span>
            </div>
            {orderFeedbacks[activeBuyerOrder.order_id] && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold text-xs font-mono">
                {t('buyer_rating_rated_badge', { rating: orderFeedbacks[activeBuyerOrder.order_id].rating })}
              </span>
            )}
          </div>

          {!orderFeedbacks[activeBuyerOrder.order_id] ? (
            <div className="space-y-3 pt-1">
              <p className="text-xs text-emerald-900 font-medium">
                {t('buyer_rating_sub')}
              </p>

              {/* Star Rating Selector */}
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setRatingHover(star)}
                    onMouseLeave={() => setRatingHover(0)}
                    onClick={() => setRatingStars(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star 
                      className={`w-6 h-6 ${
                        (ratingHover || ratingStars) >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`} 
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-700 ml-2 font-mono">{ratingStars}/5 Stars</span>
              </div>

              {/* Feedback Input */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder={t('buyer_rating_feedback_placeholder')}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-emerald-200 text-xs text-slate-800 focus:outline-none focus:border-brand-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => {
                    submitOrderFeedback({
                      order_id: activeBuyerOrder.order_id,
                      rating: ratingStars,
                      comment: feedbackComment || 'Fresh and good quality.',
                      created_at: new Date().toISOString()
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                >
                  {t('buyer_rating_submit_btn')}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-emerald-800 font-medium italic">
              "{orderFeedbacks[activeBuyerOrder.order_id].comment}" — {t('buyer_rating_recorded')}
            </p>
          )}
        </div>
      )}

      {/* 🔍 2. Search, Crop Filters & Sorting Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-emerald-900/10 shadow-xs space-y-4">
        
        {/* Prominent Search Area */}
        <div>
          <label htmlFor="buyer-search-input" className="block text-xs sm:text-sm font-bold text-emerald-950 mb-1.5 flex items-center gap-1.5">
            <Search className="w-4 h-4 text-brand-600" />
            <span>{t('buyer_search_heading')}</span>
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="buyer-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('buyer_search_placeholder')}
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Chips & Sorting Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t border-slate-100">
          
          {/* Crop Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            {cropFilters.map((c) => {
              const isSelected = selectedCropFilter === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCropFilter(c.id)}
                  className={`text-xs px-4 py-2 rounded-xl font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/20'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/90'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>{t('buyer_sort_label')}</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:border-brand-500 focus:bg-white cursor-pointer transition-colors"
            >
              <option value="recommended">{t('buyer_sort_recommended')}</option>
              <option value="price_asc">{t('buyer_sort_price_asc')}</option>
              <option value="price_desc">{t('buyer_sort_price_desc')}</option>
              <option value="distance">{t('buyer_sort_distance')}</option>
              <option value="qty">{t('buyer_sort_qty')}</option>
              <option value="quality">{t('buyer_sort_quality')}</option>
            </select>
          </div>

        </div>

      </div>

      {/* 📦 3. Main Marketplace Layout: Feed (8 cols) & Sticky Cart (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Marketplace Produce Grid (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Section Heading with Count */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-emerald-950">
                {t('buyer_available_heading')}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold font-mono">
                {filteredAndSortedLots.length === 1 
                  ? t('buyer_matches_count_single') 
                  : t('buyer_matches_count', { count: filteredAndSortedLots.length })}
              </span>
            </div>
            {(selectedCropFilter !== 'ALL' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCropFilter('ALL');
                  setSearchQuery('');
                }}
                className="text-xs text-brand-600 hover:text-brand-700 font-semibold hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>

          {/* Grocery-Style Product Cards Grid */}
          {filteredAndSortedLots.length === 0 ? (
            <EmptyState
              icon={PackageOpen}
              title={t('buyer_cart_empty_title')}
              description={t('buyer_cart_empty_desc')}
              actionLabel={t('buyer_filter_all')}
              onAction={() => {
                setSearchQuery('');
                setSelectedCropFilter('ALL');
              }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredAndSortedLots.map((lot) => {
                const isInCart = cartItems[lot.lot_id] !== undefined;
                const currentQty = getSelectedQuantity(lot);
                const cropImg = lot.image_url || CROP_IMAGES[lot.crop_name] || DEFAULT_CROP_IMAGE;
                
                // Best Price Calculation
                const isBestPrice = cropPriceStats.countMap[lot.crop_name] > 1 && 
                  Number(lot.price_per_kg) === cropPriceStats.minMap[lot.crop_name];

                // 🌿 FEATURE 1: Produce Freshness Calculation
                const freshness = getProduceFreshness(lot.harvest_date, lot.crop_name);

                return (
                  <div
                    key={lot.lot_id}
                    onClick={() => setDetailsModalLot(lot)}
                    className={`rounded-2xl bg-white border transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden group shadow-xs hover:shadow-md hover:-translate-y-0.5 ${
                      isInCart
                        ? 'border-brand-500 ring-2 ring-brand-500/20'
                        : 'border-slate-200/90 hover:border-brand-300'
                    }`}
                  >
                    {/* 🖼️ Product Image: Full-Bleed without padding/inner border */}
                    <div className="w-full h-48 sm:h-52 overflow-hidden relative bg-slate-100">
                      <img
                        src={cropImg}
                        alt={lot.crop_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = DEFAULT_CROP_IMAGE;
                        }}
                      />
                      
                      {/* Top Badges */}
                      <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
                        {isBestPrice ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-600/95 text-white font-bold text-[10px] shadow-sm backdrop-blur-xs flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            <span>{t('buyer_badge_best_price')}</span>
                          </span>
                        ) : (
                          <span />
                        )}

                        {isInCart && (
                          <span className="px-2.5 py-1 rounded-full bg-brand-600 text-white font-mono text-[10px] font-bold shadow-sm backdrop-blur-xs flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{currentQty} kg</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Produce Information Area */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Produce Name */}
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-bold font-heading text-emerald-950 group-hover:text-brand-600 transition-colors">
                            {lot.crop_name}
                          </h3>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {lot.lot_id}
                          </span>
                        </div>

                        {/* Price & Available Volume */}
                        <div className="mt-2 flex items-baseline justify-between">
                          <div className="text-lg font-extrabold text-amber-700 font-mono">
                            ₹{Number(lot.price_per_kg).toFixed(2)} <span className="text-xs text-slate-500 font-normal font-sans">/ kg</span>
                          </div>
                          <div className="text-xs text-slate-500 font-medium">
                            {t('buyer_card_available')}: <strong className="text-slate-800 font-mono">{lot.quantity_kg} kg</strong>
                          </div>
                        </div>

                        {/* 🌿 FEATURE 1: Compact Freshness Badge on Card */}
                        <div className="mt-2.5 flex items-center justify-between">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                            freshness.status === 'FRESH'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                              : freshness.status === 'USE_SOON'
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : freshness.status === 'LOW_FRESHNESS'
                              ? 'bg-rose-100 text-rose-900 border border-rose-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            <span>
                              {freshness.status === 'FRESH'
                                ? `Fresh • ${freshness.daysRemaining}d left`
                                : freshness.status === 'USE_SOON'
                                ? `Use Soon • ${freshness.daysRemaining}d left`
                                : freshness.status === 'LOW_FRESHNESS'
                                ? `Low Freshness • 1d left`
                                : `Shelf Life Passed`}
                            </span>
                          </span>

                          <span className="text-[11px] text-brand-700/80 font-medium group-hover:text-brand-700 transition-colors">
                            {t('buyer_btn_tap_details')} →
                          </span>
                        </div>
                      </div>

                      {/* Quantity Stepper & Add to Bulk Cart Actions */}
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-2" onClick={(e) => e.stopPropagation()}>
                        
                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const next = Math.max(1, currentQty - 1);
                              if (isInCart) {
                                updateCartQuantity(lot.lot_id, next);
                              } else {
                                setLocalCardQuantity(lot.lot_id, next);
                              }
                            }}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-colors cursor-pointer text-sm disabled:opacity-40"
                            disabled={currentQty <= 1}
                            title="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <div className="flex-1 relative flex items-center">
                            <input
                              type="number"
                              min="1"
                              max={lot.quantity_kg}
                              value={currentQty}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === '') {
                                  if (isInCart) updateCartQuantity(lot.lot_id, 1);
                                  else setLocalCardQuantity(lot.lot_id, 1);
                                  return;
                                }
                                const num = parseInt(val, 10);
                                if (!isNaN(num)) {
                                  const bounded = Math.max(1, Math.min(Number(lot.quantity_kg), num));
                                  if (isInCart) updateCartQuantity(lot.lot_id, bounded);
                                  else setLocalCardQuantity(lot.lot_id, bounded);
                                }
                              }}
                              className="w-full text-center py-1 px-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs font-mono font-bold focus:bg-white focus:border-brand-500 focus:outline-none"
                            />
                            <span className="absolute right-2 text-[10px] text-slate-400 font-medium pointer-events-none">kg</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const next = Math.min(Number(lot.quantity_kg), currentQty + 1);
                              if (isInCart) {
                                updateCartQuantity(lot.lot_id, next);
                              } else {
                                setLocalCardQuantity(lot.lot_id, next);
                              }
                            }}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-colors cursor-pointer text-sm disabled:opacity-40"
                            disabled={currentQty >= Number(lot.quantity_kg)}
                            title="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Cart CTA Button */}
                        {isInCart ? (
                          <div className="flex items-center gap-1.5">
                            <div className="flex-1 py-2 px-3 rounded-xl bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                              <span>{t('buyer_btn_in_cart')}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFromCart(lot.lot_id)}
                              className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors cursor-pointer"
                              title={t('buyer_btn_remove')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => addToCart(lot.lot_id, currentQty)}
                            className="w-full py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-98"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{t('buyer_btn_add')}</span>
                          </button>
                        )}

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 🛒 4. Right Column: Sticky Bulk Order Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-4 sticky top-20">
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-emerald-900/10 shadow-sm space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-emerald-950 font-heading">
                  {t('buyer_cart_header')}
                </h3>
              </div>
              <span className="text-xs text-amber-800 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 font-mono">
                {t('buyer_cart_lots_chosen', { count: chosenLots.length, qty: totalQuantity })}
              </span>
            </div>

            {/* Selected Lots List */}
            {chosenLots.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                title={t('buyer_cart_empty_title')}
                description={t('buyer_cart_empty_desc')}
                className="py-4 border-0 bg-transparent"
              />
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {chosenLots.map(lot => {
                  const selectedQty = cartItems[lot.lot_id] || 1;
                  const itemPrice = (selectedQty * Number(lot.price_per_kg)).toFixed(2);
                  return (
                    <div key={lot.lot_id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-slate-800">{lot.crop_name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {selectedQty} kg • ₹{Number(lot.price_per_kg).toFixed(2)}/kg
                          </div>
                        </div>
                        <div className="text-right font-mono font-extrabold text-amber-800 text-xs">
                          ₹{itemPrice}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(lot.lot_id, Math.max(1, selectedQty - 1))}
                            className="w-5 h-5 rounded bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs cursor-pointer disabled:opacity-40"
                            disabled={selectedQty <= 1}
                          >
                            −
                          </button>
                          <span className="px-2 py-0.5 bg-white border border-slate-200 rounded font-mono font-bold text-slate-800 text-[10px]">
                            {selectedQty} kg
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(lot.lot_id, Math.min(Number(lot.quantity_kg), selectedQty + 1))}
                            className="w-5 h-5 rounded bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs cursor-pointer disabled:opacity-40"
                            disabled={selectedQty >= Number(lot.quantity_kg)}
                          >
                            +
                          </button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(lot.lot_id)}
                          className="text-[10px] text-red-500 hover:text-red-700 font-medium hover:underline cursor-pointer flex items-center gap-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{t('buyer_btn_remove')}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 📅 FEATURE 3: Delivery Slot Selector in Checkout Side Panel */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-brand-600" />
                  <span>{t('buyer_delivery_slot_title')}</span>
                </label>
                <span className="text-[10px] text-brand-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {activeSelectedSlot.tag}
                </span>
              </div>

              <select
                value={selectedSlotId}
                onChange={(e) => setSelectedSlotId(e.target.value)}
                className="w-full py-2 px-3 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                {deliverySlots.map(slot => (
                  <option key={slot.id} value={slot.id}>
                    {slot.label} ({slot.dateFormatted})
                  </option>
                ))}
              </select>

              <div className="text-[10px] text-slate-500 flex justify-between pt-0.5 font-medium">
                <span>{t('buyer_expected_delivery_date')}</span>
                <span className="font-bold text-slate-800">{activeSelectedSlot.dateFormatted} • {activeSelectedSlot.timeRange}</span>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>{t('buyer_produce_subtotal')}</span>
                <span className="text-slate-900 font-mono font-bold">₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{t('buyer_transport_cost')}</span>
                <span className="text-brand-700 font-semibold">{t('buyer_transport_included')}</span>
              </div>

              {/* TOTAL */}
              <div className="flex justify-between text-sm font-extrabold text-emerald-950 pt-2 border-t border-slate-100">
                <span>{t('buyer_total_escrow')}</span>
                <span className="text-amber-700 font-mono text-base">₹{totalAmount.toFixed(2)}</span>
              </div>

              {/* Savings Callout */}
              {chosenLots.length > 0 && (
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 font-medium">
                  <TrendingDown className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>{t('buyer_savings_callout', { amount: estimatedSavings.toLocaleString('en-IN') })}</span>
                </div>
              )}
            </div>

            {/* Checkout Action Button */}
            <button
              type="button"
              disabled={chosenLots.length === 0 || isCheckingOut}
              onClick={() => setCheckoutModalOpen(true)}
              className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>{t('buyer_btn_review_order')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* 🌟 5. Product Details Modal (Centered Popup with Feature 1 Freshness) */}
      {detailsModalLot && (() => {
        const isInCart = cartItems[detailsModalLot.lot_id] !== undefined;
        const currentQty = getSelectedQuantity(detailsModalLot);
        const maxAvailable = Number(detailsModalLot.quantity_kg) || 1;
        const cropImg = detailsModalLot.image_url || CROP_IMAGES[detailsModalLot.crop_name] || DEFAULT_CROP_IMAGE;
        const isBestPrice = cropPriceStats.countMap[detailsModalLot.crop_name] > 1 && 
          Number(detailsModalLot.price_per_kg) === cropPriceStats.minMap[detailsModalLot.crop_name];

        // 🌿 FEATURE 1: Freshness in Modal
        const freshness = getProduceFreshness(detailsModalLot.harvest_date, detailsModalLot.crop_name);

        return (
          <div 
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setDetailsModalLot(null)}
          >
            <div 
              className="max-w-md w-full rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 font-bold">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-heading text-emerald-950">
                      {detailsModalLot.crop_name}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-mono">Lot #{detailsModalLot.lot_id}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setDetailsModalLot(null)}
                  className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer font-bold text-sm"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Modal Content */}
              <div className="p-5 space-y-4 overflow-y-auto">
                
                {/* Large Product Image */}
                <div className="w-full h-48 rounded-xl overflow-hidden bg-slate-100 relative">
                  <img
                    src={cropImg}
                    alt={detailsModalLot.crop_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = DEFAULT_CROP_IMAGE;
                    }}
                  />
                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-bold text-[10px] shadow-sm backdrop-blur-xs flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      <span>{t('buyer_grade_agmark')}</span>
                    </span>
                    {isBestPrice && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white font-bold text-[10px] shadow-sm backdrop-blur-xs flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        <span>{t('buyer_badge_best_price')}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* 🌿 FEATURE 1: Comprehensive Freshness Details Box */}
                <div className={`p-3.5 rounded-xl border space-y-2 text-xs ${
                  freshness.status === 'FRESH'
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    : freshness.status === 'USE_SOON'
                    ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                    : 'bg-rose-50/80 border-rose-200 text-rose-950'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                      <span>{t('buyer_freshness_status_label')}</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white font-extrabold font-mono text-[10px] border shadow-2xs">
                      {freshness.status === 'FRESH' && `🟢 Fresh (${freshness.daysRemaining} days left)`}
                      {freshness.status === 'USE_SOON' && `🟡 Use Soon (${freshness.daysRemaining} days left)`}
                      {freshness.status === 'LOW_FRESHNESS' && `🔴 Low Freshness (1 day left)`}
                      {freshness.status === 'PASSED' && `⚠️ Shelf Life Passed`}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                    <div className="p-2 rounded-lg bg-white/90 border border-slate-200/70">
                      <div className="text-[9px] text-slate-500 uppercase">{t('buyer_harvested_label')}</div>
                      <div className="font-bold text-slate-800 text-[11px] mt-0.5">{freshness.harvestFormatted}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-white/90 border border-slate-200/70">
                      <div className="text-[9px] text-slate-500 uppercase">{t('buyer_shelf_life_label')}</div>
                      <div className="font-bold text-slate-800 text-[11px] mt-0.5">{freshness.shelfLifeDays} days</div>
                    </div>
                    <div className="p-2 rounded-lg bg-white/90 border border-slate-200/70">
                      <div className="text-[9px] text-slate-500 uppercase">{t('buyer_expected_fresh_until')}</div>
                      <div className="font-bold text-brand-700 text-[11px] mt-0.5">{freshness.expectedFreshUntilStr}</div>
                    </div>
                  </div>

                  {freshness.status === 'PASSED' && (
                    <p className="text-[10px] text-slate-600 font-medium italic pt-1 border-t border-slate-200/60">
                      {t('buyer_freshness_passed_note')}
                    </p>
                  )}
                </div>

                {/* Price & Available Volume Box */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">{t('buyer_available_volume')}</div>
                    <div className="text-base font-extrabold text-slate-900 font-mono">{detailsModalLot.quantity_kg} kg</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">{t('buyer_direct_wholesale')}</div>
                    <div className="text-lg font-extrabold text-amber-700 font-mono">
                      ₹{Number(detailsModalLot.price_per_kg).toFixed(2)} <span className="text-xs text-slate-500 font-normal">/ kg</span>
                    </div>
                  </div>
                </div>

                {/* Structured Lot & Farmer Details */}
                <div className="space-y-1.5 text-xs text-slate-700 pt-1">
                  
                  {/* Producer */}
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t('buyer_producer_label')}</span>
                    </span>
                    <span className="font-semibold text-slate-900 text-right">
                      {getFarmerName(detailsModalLot.farmer_id)}
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t('buyer_location_label')}</span>
                    </span>
                    <span className="font-medium text-slate-800 text-right">
                      {getFarmLocationName(detailsModalLot)}
                    </span>
                  </div>

                  {/* Distance */}
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t('buyer_distance_label')}</span>
                    </span>
                    <span className="font-mono font-bold text-amber-700">
                      {detailsModalLot.distance_km ? `${detailsModalLot.distance_km} km` : '28.4 km'}
                    </span>
                  </div>
                </div>

                {/* Quantity Selection in Modal */}
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-950">{t('buyer_qty_label')}</span>
                    <span className="font-mono font-bold text-amber-800">
                      {currentQty} kg × ₹{Number(detailsModalLot.price_per_kg).toFixed(2)} = ₹{(currentQty * Number(detailsModalLot.price_per_kg)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const next = Math.max(1, currentQty - 1);
                        if (isInCart) updateCartQuantity(detailsModalLot.lot_id, next);
                        else setLocalCardQuantity(detailsModalLot.lot_id, next);
                      }}
                      className="w-9 h-9 rounded-lg bg-white hover:bg-slate-100 border border-amber-300 text-slate-700 font-bold flex items-center justify-center transition-colors cursor-pointer text-sm disabled:opacity-40"
                      disabled={currentQty <= 1}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex-1 relative flex items-center">
                      <input
                        type="number"
                        min="1"
                        max={maxAvailable}
                        value={currentQty}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') {
                            if (isInCart) updateCartQuantity(detailsModalLot.lot_id, 1);
                            else setLocalCardQuantity(detailsModalLot.lot_id, 1);
                            return;
                          }
                          const num = parseInt(val, 10);
                          if (!isNaN(num)) {
                            const bounded = Math.max(1, Math.min(maxAvailable, num));
                            if (isInCart) updateCartQuantity(detailsModalLot.lot_id, bounded);
                            else setLocalCardQuantity(detailsModalLot.lot_id, bounded);
                          }
                        }}
                        className="w-full text-center py-2 px-2 rounded-lg bg-white border border-amber-300 text-slate-800 text-sm font-mono font-bold focus:border-amber-600 focus:outline-none"
                      />
                      <span className="absolute right-3 text-xs text-slate-400 font-medium pointer-events-none">kg</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const next = Math.min(maxAvailable, currentQty + 1);
                        if (isInCart) updateCartQuantity(detailsModalLot.lot_id, next);
                        else setLocalCardQuantity(detailsModalLot.lot_id, next);
                      }}
                      className="w-9 h-9 rounded-lg bg-white hover:bg-slate-100 border border-amber-300 text-slate-700 font-bold flex items-center justify-center transition-colors cursor-pointer text-sm disabled:opacity-40"
                      disabled={currentQty >= maxAvailable}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Add to Bulk Cart Actions in Modal */}
                <div className="pt-1">
                  {isInCart ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDetailsModalLot(null)}
                        className="flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>{t('buyer_btn_in_cart')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          removeFromCart(detailsModalLot.lot_id);
                          setDetailsModalLot(null);
                        }}
                        className="p-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors cursor-pointer"
                        title={t('buyer_btn_remove')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        addToCart(detailsModalLot.lot_id, currentQty);
                        setDetailsModalLot(null);
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm shadow-brand-600/20"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t('buyer_btn_add')}</span>
                    </button>
                  )}
                </div>

              </div>
            </div>
          </div>
        );
      })()}

      {/* 🌟 6. Mock Bulk Order Checkout Confirmation Modal (with Feature 3 Delivery Slot) */}
      {checkoutModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setCheckoutModalOpen(false)}
        >
          <div 
            className="max-w-md w-full p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-emerald-950 font-heading">{t('buyer_checkout_modal_title')}</h3>
              </div>
              <button 
                onClick={() => setCheckoutModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-3 font-medium">
              <p>
                {t('buyer_modal_summary', { qty: totalQuantity, count: chosenLots.length })}
              </p>

              {/* Itemized breakdown with actual purchased quantities */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 font-mono">
                <div className="space-y-1.5 pb-2 border-b border-slate-200">
                  {chosenLots.map(lot => {
                    const qty = cartItems[lot.lot_id] || 1;
                    return (
                      <div key={lot.lot_id} className="flex justify-between text-[11px]">
                        <span className="text-slate-700">{lot.crop_name} ({qty} kg):</span>
                        <span className="font-bold text-slate-900">₹{(qty * Number(lot.price_per_kg)).toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
                
                {/* 📅 FEATURE 3: Selected Delivery Slot confirmation */}
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">{t('buyer_delivery_slot_label')}</span>
                  <span className="text-brand-700 font-bold">{activeSelectedSlot.shortLabel} • {activeSelectedSlot.timeRange}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Deliver to:</span>
                  <span className="text-slate-800 font-bold">{buyerLocation.delivery_area}</span>
                </div>
                <div className="flex justify-between text-amber-800 font-extrabold pt-1.5 border-t border-slate-200 text-sm">
                  <span>Order Total:</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {completedOrder ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs space-y-3">
                <div className="flex items-center gap-2 text-emerald-950 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-brand-600" />
                  <span>{t('buyer_modal_success_title', { order_id: completedOrder.order_id })}</span>
                </div>
                <p className="text-emerald-900 leading-relaxed">
                  {t('buyer_modal_success_desc')}
                </p>
                <button
                  onClick={handleProceedToDriver}
                  className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-brand-600/20"
                >
                  <span>{t('buyer_modal_btn_driver')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setCheckoutModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  {t('buyer_modal_cancel')}
                </button>
                <button
                  type="button"
                  disabled={isCheckingOut || chosenLots.length === 0}
                  onClick={handlePlaceOrder}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isCheckingOut ? (
                    <span>{t('buyer_modal_locking')}</span>
                  ) : (
                    <span>{t('buyer_modal_confirm')}</span>
                  )}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 🔄 FEATURE 2 MODAL: Choose Alternative Farmer after 15-min timeout */}
      {showSwitchFarmerModal && switchOrderData && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowSwitchFarmerModal(false)}
        >
          <div 
            className="max-w-md w-full p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-emerald-950 font-heading">
                  {t('buyer_modal_choose_farmer_title')}
                </h3>
                <p className="text-xs text-slate-500">
                  {t('buyer_modal_choose_farmer_sub', { crop: switchOrderData.crop_name })}
                </p>
              </div>
              <button 
                onClick={() => setShowSwitchFarmerModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {alternativeFarmersForSwitch.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 space-y-2 bg-slate-50 rounded-xl">
                  <PackageOpen className="w-8 h-8 text-slate-300 mx-auto" />
                  <p>{t('buyer_no_alt_farmers')}</p>
                </div>
              ) : (
                alternativeFarmersForSwitch.map(altLot => (
                  <div
                    key={altLot.lot_id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-brand-500 flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        {getFarmerName(altLot.farmer_id)}
                      </div>
                      <div className="text-slate-600 mt-0.5">
                        {altLot.quantity_kg} kg available • ₹{Number(altLot.price_per_kg).toFixed(2)}/kg
                      </div>
                      <div className="text-[11px] text-slate-400">
                        📍 {altLot.distance_km || 31.2} km away • Lot #{altLot.lot_id}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        switchOrderFarmer(switchOrderData.order_id, switchOrderData.old_lot_id, altLot.lot_id);
                        setShowSwitchFarmerModal(false);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                    >
                      {t('buyer_btn_select_farmer')}
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSwitchFarmerModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📋 FEATURE 5 MODAL: Return & Refund Policy */}
      {showReturnPolicyModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowReturnPolicyModal(false)}
        >
          <div 
            className="max-w-lg w-full p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-brand-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-emerald-950 font-heading">
                    {t('buyer_modal_return_policy_title')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('buyer_modal_return_policy_sub')}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowReturnPolicyModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Eligibility Rules */}
            <div className="space-y-2 text-xs text-slate-700">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                {t('buyer_return_eligibility_title')}
              </h4>
              <ul className="space-y-1.5 list-disc pl-4 text-slate-600">
                <li>{t('buyer_return_reason_1')}</li>
                <li>{t('buyer_return_reason_2')}</li>
                <li>{t('buyer_return_reason_3')}</li>
                <li>{t('buyer_return_reason_4')}</li>
              </ul>
            </div>

            {/* Step by step procedure */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 text-xs">
                {t('buyer_return_steps_title')}
              </h4>
              <div className="space-y-1 text-slate-600 font-medium">
                <p>{t('buyer_return_step_1')}</p>
                <p>{t('buyer_return_step_2')}</p>
                <p>{t('buyer_return_step_3')}</p>
                <p>{t('buyer_return_step_4')}</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowReturnPolicyModal(false)}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📞 FEATURE 5 MODAL: Customer Support */}
      {showSupportModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowSupportModal(false)}
        >
          <div 
            className="max-w-md w-full p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-brand-600 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-emerald-950 font-heading">
                    {t('buyer_customer_service_title')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Direct Agri-Logistics Buyer Helpline
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowSupportModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-brand-600" />
                  <span className="text-slate-600 font-semibold">{t('buyer_customer_service_phone_label')}</span>
                </div>
                <span className="font-mono font-bold text-slate-900">{CUSTOMER_SUPPORT_PHONE}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span className="text-slate-600 font-semibold">{t('buyer_customer_service_email_label')}</span>
                </div>
                <span className="font-mono font-bold text-slate-900">{CUSTOMER_SUPPORT_EMAIL}</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-600" />
                  <span className="text-slate-600 font-semibold">{t('buyer_customer_service_hours_label')}</span>
                </div>
                <span className="font-medium text-emerald-950">{t('buyer_customer_service_hours_val')}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSupportModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
