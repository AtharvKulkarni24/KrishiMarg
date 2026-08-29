import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { apiClient } from '../../services/api';
import { CROP_IMAGES, DEFAULT_CROP_IMAGE, MOCK_USERS } from '../../services/mockData';
import EmptyState from '../common/EmptyState';
import { 
  Sprout, 
  TrendingUp, 
  Scale, 
  MapPin, 
  Calendar, 
  Layers, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  PackageOpen,
  Camera,
  Image as ImageIcon,
  RotateCcw,
  X,
  Bell,
  PlusCircle,
  Check,
  Clock,
  ExternalLink,
  Leaf
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Area, 
  AreaChart 
} from 'recharts';

export default function FarmerPortal() {
  const { 
    addProduceLot, 
    updateProduceLotQuantity,
    farmerNotifications,
    markFarmerNotificationRead,
    markAllFarmerNotificationsRead,
    availableLots, 
    setDemoStep, 
    addToast, 
    currentUser, 
    t 
  } = useApp();

  const farmerId = currentUser?.user_id || 'f_101';

  // Form State
  const [formData, setFormData] = useState({
    farmer_id: farmerId,
    crop_name: 'Tomato',
    quantity_kg: 500,
    price_per_kg: 18.00,
    harvest_date: new Date().toISOString().split('T')[0],
    latitude: 18.3489,
    longitude: 74.0312,
    area_preset: 'saswad',
    image_url: CROP_IMAGES['Tomato'] || DEFAULT_CROP_IMAGE
  });

  // Feature 1: Image Upload State
  const [selectedImage, setSelectedImage] = useState(CROP_IMAGES['Tomato'] || DEFAULT_CROP_IMAGE);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // Feature 2: Update Existing Lot State & Modal
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedLotToUpdate, setSelectedLotToUpdate] = useState(null);
  const [newHarvestQty, setNewHarvestQty] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [isUpdatingLot, setIsUpdatingLot] = useState(false);
  const [updateSuccessBanner, setUpdateSuccessBanner] = useState(null);

  // Feature 3: Notification Bell & Popover State
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showNotifBanner, setShowNotifBanner] = useState(true);
  const notifDropdownRef = useRef(null);

  const [formErrors, setFormErrors] = useState({});
  const [insightsData, setInsightsData] = useState(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  // Filter notifications for this farmer
  const myNotifications = useMemo(() => {
    return (farmerNotifications || []).filter(n => n.farmer_id === farmerId);
  }, [farmerNotifications, farmerId]);

  const unreadNotifs = useMemo(() => {
    return myNotifications.filter(n => !n.read);
  }, [myNotifications]);

  // Filter active lots owned by this farmer
  const myActiveLots = useMemo(() => {
    return (availableLots || []).filter(l => l.farmer_id === farmerId && l.status !== 'SOLD');
  }, [availableLots, farmerId]);

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
        setShowUpdateModal(false);
        setShowNotifDropdown(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update default image when crop changes (if using default image)
  useEffect(() => {
    if (!selectedImage || Object.values(CROP_IMAGES).includes(selectedImage) || selectedImage === DEFAULT_CROP_IMAGE) {
      const defaultImg = CROP_IMAGES[formData.crop_name] || DEFAULT_CROP_IMAGE;
      setSelectedImage(defaultImg);
      setFormData(prev => ({ ...prev, image_url: defaultImg }));
    }
  }, [formData.crop_name]);

  // Location Presets
  const handleLocationPreset = (preset) => {
    if (preset === 'saswad') {
      setFormData(prev => ({ ...prev, area_preset: 'saswad', latitude: 18.3489, longitude: 74.0312 }));
    } else if (preset === 'purandar') {
      setFormData(prev => ({ ...prev, area_preset: 'purandar', latitude: 18.3245, longitude: 74.0118 }));
    } else if (preset === 'jejuri') {
      setFormData(prev => ({ ...prev, area_preset: 'jejuri', latitude: 18.2890, longitude: 74.0520 }));
    }
  };

  // Fetch insights whenever crop changes
  useEffect(() => {
    async function loadInsights() {
      setIsLoadingInsights(true);
      try {
        const data = await apiClient.getFarmerInsights(formData.crop_name);
        setInsightsData(data);
        if (data?.current_mandi_price) {
          setFormData(prev => ({
            ...prev,
            price_per_kg: prev.price_per_kg || Number((data.current_mandi_price * 1.2).toFixed(2))
          }));
        }
      } catch (err) {
        addToast(t('toast_forecast_error', { err: err.message }), 'error');
      } finally {
        setIsLoadingInsights(false);
      }
    }
    loadInsights();
  }, [formData.crop_name]);

  // --- Feature 1: Image Selection Handlers ---
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate format
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      addToast(t('farmer_image_invalid_type'), 'error');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      addToast(t('farmer_image_too_large'), 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const dataUrl = loadEvent.target.result;
      setSelectedImage(dataUrl);
      setFormData(prev => ({ ...prev, image_url: dataUrl }));
      addToast('Image uploaded successfully!', 'success');
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  const handleUseDefaultImage = () => {
    const defaultImg = CROP_IMAGES[formData.crop_name] || DEFAULT_CROP_IMAGE;
    setSelectedImage(defaultImg);
    setFormData(prev => ({ ...prev, image_url: defaultImg }));
    addToast('Default crop image applied.', 'info');
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setFormData(prev => ({ ...prev, image_url: null }));
  };

  // --- Feature 2: Update Existing Lot Handlers ---
  const handleOpenUpdateModal = (lot = null) => {
    if (lot) {
      setSelectedLotToUpdate(lot);
    } else if (myActiveLots.length === 1) {
      setSelectedLotToUpdate(myActiveLots[0]);
    } else {
      setSelectedLotToUpdate(null);
    }
    setNewHarvestQty('');
    setUpdateError('');
    setShowUpdateModal(true);
  };

  const handleConfirmUpdateQuantity = async (e) => {
    e.preventDefault();
    if (!selectedLotToUpdate) return;

    const qtyNumber = Number(newHarvestQty);
    if (!newHarvestQty || isNaN(qtyNumber) || qtyNumber <= 0) {
      setUpdateError(t('farmer_update_err_qty'));
      return;
    }

    setIsUpdatingLot(true);
    setUpdateError('');

    try {
      const res = await updateProduceLotQuantity(selectedLotToUpdate.lot_id, qtyNumber);
      if (res) {
        setUpdateSuccessBanner({
          crop: res.crop_name,
          lot_id: res.lot_id,
          prev: res.prevQty,
          added: res.addedQty,
          total: res.newQty
        });
      }
      setShowUpdateModal(false);
      setSelectedLotToUpdate(null);
      setNewHarvestQty('');
    } catch (err) {
      setUpdateError(err.message || 'Failed to update quantity');
    } finally {
      setIsUpdatingLot(false);
    }
  };

  // Form Validation & Submit
  const validateForm = () => {
    const errors = {};
    if (!formData.quantity_kg || Number(formData.quantity_kg) < 1) {
      errors.quantity_kg = t('err_min_volume');
    }
    if (!formData.price_per_kg || Number(formData.price_per_kg) <= 0) {
      errors.price_per_kg = t('err_price');
    }
    if (!formData.latitude || formData.latitude < 8 || formData.latitude > 37) {
      errors.latitude = t('err_latitude');
    }
    if (!formData.longitude || formData.longitude < 68 || formData.longitude > 98) {
      errors.longitude = t('err_longitude');
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitListing = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      addToast(t('err_form_fix'), 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const submissionDate = new Date().toISOString().split('T')[0];
      const payload = {
        farmer_id: farmerId,
        crop_name: formData.crop_name,
        quantity_kg: Number(formData.quantity_kg),
        price_per_kg: Number(formData.price_per_kg),
        harvest_date: submissionDate,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude)
      };

      const result = await apiClient.submitProduceListing(payload);
      setSubmissionResult(result);

      // Add to shared available lots with selected image
      const finalImage = selectedImage || CROP_IMAGES[payload.crop_name] || DEFAULT_CROP_IMAGE;
      const newLot = {
        lot_id: result.lot_id,
        farmer_id: payload.farmer_id,
        crop_name: payload.crop_name,
        quantity_kg: payload.quantity_kg,
        price_per_kg: payload.price_per_kg,
        harvest_date: payload.harvest_date,
        distance_km: 28.4,
        latitude: payload.latitude,
        longitude: payload.longitude,
        status: 'AVAILABLE',
        image_url: finalImage
      };
      addProduceLot(newLot);
      setDemoStep(2); // Advance demo pitch step to Buyer
    } catch (err) {
      addToast(t('toast_listing_error', { err: err.message }), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const mandiPrice = insightsData?.current_mandi_price || 15.00;
  const minPrice = insightsData?.min_price || 12.00;
  const maxPrice = insightsData?.max_price || 18.00;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 w-full relative">
      
      {/* 🔔 Hidden File Inputs for Camera & Gallery */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        type="file"
        ref={galleryInputRef}
        accept="image/jpeg, image/jpg, image/png, image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

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

      {/* 🎉 Quantity Updated Success Banner (Feature 2) */}
      {updateSuccessBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 shadow-sm flex items-start justify-between gap-3 animate-fade-in">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-brand-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="font-extrabold text-emerald-950 text-sm">
                {t('farmer_update_success_title')}
              </div>
              <div className="font-semibold text-emerald-900">
                {updateSuccessBanner.crop} — Lot #{updateSuccessBanner.lot_id}
              </div>
              <div className="flex items-center gap-3 text-slate-700 font-mono pt-0.5">
                <span>Previous: <strong>{updateSuccessBanner.prev} kg</strong></span>
                <span>+</span>
                <span className="text-brand-700 font-bold">Added: +{updateSuccessBanner.added} kg</span>
                <span>=</span>
                <span className="text-emerald-900 font-extrabold bg-emerald-200/70 px-2 py-0.5 rounded-md">
                  Updated: {updateSuccessBanner.total} kg
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setUpdateSuccessBanner(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Grid: Form (Left) & Insights (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* 📝 Left Column: Produce Listing Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-emerald-900/10 shadow-xs space-y-5">
            
            {/* Header with Dual Actions: List New + Update Existing */}
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-emerald-950 flex items-center gap-2">
                  <span>{t('farmer_form_title')}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">{t('farmer_form_desc')}</p>
              </div>

              {/* ⚡ Feature 2 Button: Update Existing Lot */}
              <button
                type="button"
                onClick={() => handleOpenUpdateModal()}
                className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-brand-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-98"
              >
                <PlusCircle className="w-4 h-4 text-brand-600" />
                <span>{t('farmer_btn_update_existing')}</span>
              </button>
            </div>

            <form onSubmit={handleSubmitListing} className="space-y-4">
              
              {/* Crop Selection & Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('farmer_crop_label')} <span className="text-red-500">*</span>
                  </label>
                  <p className="text-[11px] text-slate-500 mb-1">{t('farmer_crop_helper')}</p>
                  <select
                    value={formData.crop_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, crop_name: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500 transition-colors"
                  >
                    <option value="Tomato">{t('crop_tomato_detail')}</option>
                    <option value="Onion">{t('crop_onion_detail')}</option>
                    <option value="Potato">{t('crop_potato_detail')}</option>
                    <option value="Cauliflower">{t('crop_cauliflower_detail')}</option>
                    <option value="Green Chili">{t('crop_chili_detail')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('farmer_quantity_label')} <span className="text-red-500">*</span>
                  </label>
                  <p className="text-[11px] text-slate-500 mb-1">{t('farmer_quantity_helper')}</p>
                  <input
                    type="number"
                    min="1"
                    step="10"
                    value={formData.quantity_kg}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, quantity_kg: e.target.value }));
                      if (formErrors.quantity_kg) setFormErrors(prev => ({ ...prev, quantity_kg: null }));
                    }}
                    placeholder={t('farmer_quantity_placeholder')}
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border text-slate-800 text-sm focus:outline-none focus:bg-white transition-colors font-mono ${
                      formErrors.quantity_kg ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
                    }`}
                    required
                  />
                  {formErrors.quantity_kg && (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{formErrors.quantity_kg}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* 📷 FEATURE 1: Produce Image Section */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-brand-600" />
                      <span>{t('farmer_image_section_title')}</span>
                    </label>
                    <p className="text-[11px] text-slate-500">{t('farmer_image_section_desc')}</p>
                  </div>
                  {selectedImage && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      ✓ Image Ready
                    </span>
                  )}
                </div>

                {/* If image is selected, show preview with change button */}
                {selectedImage ? (
                  <div className="space-y-2">
                    <div className="relative rounded-xl overflow-hidden border border-emerald-200 bg-slate-100 h-44 w-full group shadow-xs">
                      <img 
                        src={selectedImage} 
                        alt={formData.crop_name} 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleClearImage}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 transition-colors cursor-pointer shadow-md"
                        title="Remove Image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 italic">
                        {formData.crop_name} photo selected
                      </span>
                      <button
                        type="button"
                        onClick={handleClearImage}
                        className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{t('farmer_image_change')}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* 3 Options: Take Photo, Gallery, Default Image */
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    {/* Option 1: Take Photo */}
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="p-3.5 rounded-xl bg-white hover:bg-emerald-50/60 border border-slate-200 hover:border-brand-300 text-slate-800 font-semibold text-xs flex flex-col items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-98"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-brand-600 flex items-center justify-center">
                        <Camera className="w-4 h-4" />
                      </div>
                      <span>{t('farmer_image_opt_camera')}</span>
                    </button>

                    {/* Option 2: Choose from Gallery */}
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="p-3.5 rounded-xl bg-white hover:bg-emerald-50/60 border border-slate-200 hover:border-brand-300 text-slate-800 font-semibold text-xs flex flex-col items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-98"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <span>{t('farmer_image_opt_gallery')}</span>
                    </button>

                    {/* Option 3: Use Default Image */}
                    <button
                      type="button"
                      onClick={handleUseDefaultImage}
                      className="p-3.5 rounded-xl bg-white hover:bg-emerald-50/60 border border-slate-200 hover:border-brand-300 text-slate-800 font-semibold text-xs flex flex-col items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-98"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Leaf className="w-4 h-4" />
                      </div>
                      <span>{t('farmer_image_opt_default')}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Price per kg & Harvest Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('farmer_price_label')} <span className="text-red-500">*</span>
                  </label>
                  <p className="text-[11px] text-slate-500 mb-1">{t('farmer_price_helper')}</p>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={formData.price_per_kg}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, price_per_kg: e.target.value }));
                      if (formErrors.price_per_kg) setFormErrors(prev => ({ ...prev, price_per_kg: null }));
                    }}
                    placeholder={t('farmer_price_placeholder')}
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border text-slate-800 text-sm focus:outline-none focus:bg-white transition-colors font-mono ${
                      formErrors.price_per_kg ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
                    }`}
                    required
                  />
                  {formErrors.price_per_kg && (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{formErrors.price_per_kg}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('farmer_date_label')} <span className="text-[10px] text-slate-400 font-normal">({t('farmer_date_auto')})</span>
                  </label>
                  <p className="text-[11px] text-slate-500 mb-1">{t('farmer_portal_sub_note')}</p>
                  <div className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/90 border border-slate-200 text-slate-600 text-sm font-mono flex items-center justify-between cursor-not-allowed select-none">
                    <span>{formData.harvest_date}</span>
                    <Calendar className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Farm Location Preset */}
              <div>
                <div className="flex flex-wrap items-center justify-between mb-1 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block">
                      {t('farmer_location_label')}
                    </label>
                    <p className="text-[11px] text-slate-500">{t('farmer_location_helper')}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleLocationPreset('saswad')}
                      className={`text-[11px] px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                        formData.area_preset === 'saswad' 
                          ? 'bg-brand-600 text-white font-bold shadow-xs' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {t('farmer_preset_saswad')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLocationPreset('purandar')}
                      className={`text-[11px] px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                        formData.area_preset === 'purandar' 
                          ? 'bg-brand-600 text-white font-bold shadow-xs' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {t('farmer_preset_purandar')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLocationPreset('jejuri')}
                      className={`text-[11px] px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                        formData.area_preset === 'jejuri' 
                          ? 'bg-brand-600 text-white font-bold shadow-xs' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {t('farmer_preset_jejuri')}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-1.5">
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-[11px] text-slate-400 font-medium">{t('farmer_lat_label')}</span>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.latitude}
                      onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-50/80 border border-slate-200 text-slate-700 text-xs font-mono focus:border-brand-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-[11px] text-slate-400 font-medium">{t('farmer_lon_label')}</span>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.longitude}
                      onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-50/80 border border-slate-200 text-slate-700 text-xs font-mono focus:border-brand-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Mandi Thresholds Benchmark Card */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-300 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-brand-700 font-bold">
                    <Sparkles className="w-4 h-4 text-brand-600" />
                    <span>{t('farmer_mandi_thresholds_title')}</span>
                  </div>
                  <span className="text-[11px] text-emerald-800 font-medium">{t('farmer_mandi_thresholds_sub')}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2.5 rounded-xl bg-white border border-emerald-200/80 shadow-xs">
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">{t('farmer_min_price')}</div>
                    <div className="text-sm font-bold text-slate-700 mt-0.5 font-mono">
                      ₹{minPrice.toFixed(2)}/kg
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                    <div className="text-[10px] text-emerald-100 font-bold uppercase">{t('farmer_current_mandi')}</div>
                    <div className="text-base font-extrabold text-white mt-0.5 font-mono">
                      ₹{mandiPrice.toFixed(2)}/kg
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-emerald-200/80 shadow-xs">
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">{t('farmer_max_price')}</div>
                    <div className="text-sm font-bold text-amber-700 mt-0.5 font-mono">
                      ₹{maxPrice.toFixed(2)}/kg
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition-all shadow-md shadow-brand-600/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-98"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t('farmer_btn_submitting')}</span>
                  </span>
                ) : (
                  <>
                    <span>{t('farmer_btn_submit')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Submission Success Confirmation Banner */}
          {submissionResult && (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-start gap-3.5 animate-fade-in shadow-xs">
              <CheckCircle2 className="w-6 h-6 text-brand-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs space-y-1.5">
                <div className="font-bold text-emerald-950 text-sm">
                  {t('farmer_success_title')}
                </div>
                <div className="font-extrabold text-emerald-900 text-xs font-mono">
                  {formData.crop_name} • {formData.quantity_kg} kg • ₹{Number(formData.price_per_kg).toFixed(0)}/kg
                </div>
                <p className="text-emerald-900 leading-relaxed">
                  {t('farmer_success_desc')}
                </p>
                <div className="text-[11px] text-emerald-800/80 font-mono">
                  {t('farmer_success_lot_id', { lot_id: submissionResult.lot_id })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 📈 Right Column: 7-Day Price Forecast & Listed Lots (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Price Forecast Card */}
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
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                {t('farmer_7day_horizon')}
              </span>
            </div>

            {/* Price Forecast Chart */}
            <div className="h-52 w-full pt-2">
              {isLoadingInsights ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-500 space-y-2 flex-col">
                  <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                  <span>{t('farmer_loading_forecast')}</span>
                </div>
              ) : insightsData?.ml_7_day_forecast ? (
                <>
                  <ResponsiveContainer width="100%" height="90%">
                    <AreaChart data={insightsData.ml_7_day_forecast}>
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
                  {t('farmer_no_forecast', { crop: formData.crop_name })}
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

          {/* 📦 My Listed Produce with Quick Update Button */}
          <div className="p-6 rounded-2xl bg-white border border-emerald-900/10 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-600" />
                <span>{t('farmer_active_lots_title')}</span>
              </h3>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 font-mono">
                {t('farmer_active_count', { count: myActiveLots.length })}
              </span>
            </div>

            {myActiveLots.length === 0 ? (
              <EmptyState
                icon={PackageOpen}
                title={t('farmer_no_lots_title')}
                description={t('farmer_no_lots_desc')}
                className="py-6 border-0 bg-transparent"
              />
            ) : (
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {myActiveLots.map((lot) => {
                  const cropEmoji = lot.crop_name === 'Tomato' ? '🍅' 
                    : lot.crop_name === 'Onion' ? '🧅' 
                    : lot.crop_name === 'Potato' ? '🥔' 
                    : lot.crop_name === 'Cauliflower' ? '🥦' 
                    : lot.crop_name === 'Green Chili' ? '🌶️' : '🌾';

                  return (
                    <div 
                      key={lot.lot_id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-brand-500/40 flex items-center justify-between text-xs transition-colors group"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                          <span>{cropEmoji} {lot.crop_name}</span>
                        </div>
                        <div className="text-xs text-slate-700 font-medium">
                          {lot.quantity_kg} kg • ₹{Number(lot.price_per_kg).toFixed(2)}/kg
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {t('farmer_lot_id_label', { lot_id: lot.lot_id })}
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end gap-1.5">
                        <span className="text-[10px] font-bold text-brand-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                          {lot.status === 'AVAILABLE' ? t('farmer_lot_status_available') : (lot.status || t('farmer_lot_status_sold'))}
                        </span>
                        
                        {/* Quick Update Button on Lot Card */}
                        <button
                          type="button"
                          onClick={() => handleOpenUpdateModal(lot)}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-brand-700 font-bold transition-all cursor-pointer shadow-2xs"
                        >
                          + Add Harvest
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 🌟 FEATURE 2 MODAL: UPDATE EXISTING PRODUCE QUANTITY */}
      {showUpdateModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setShowUpdateModal(false)}
        >
          <div 
            className="w-full max-w-lg rounded-2xl bg-white border border-emerald-900/10 shadow-2xl overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-heading text-emerald-950">
                  {t('farmer_update_modal_title')}
                </h3>
                <p className="text-xs text-slate-500">
                  {t('farmer_update_modal_sub')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowUpdateModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              
              {/* Step 1: Select Lot (if none selected) */}
              {!selectedLotToUpdate ? (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-700">
                    {t('farmer_update_select_lot')}
                  </p>

                  {myActiveLots.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 space-y-2 bg-slate-50 rounded-xl">
                      <PackageOpen className="w-8 h-8 text-slate-300 mx-auto" />
                      <p>{t('farmer_update_no_active_lots')}</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {myActiveLots.map(lot => (
                        <div
                          key={lot.lot_id}
                          className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-brand-500 flex items-center justify-between text-xs transition-colors"
                        >
                          <div>
                            <div className="font-bold text-slate-900 text-sm">
                              {lot.crop_name} <span className="text-slate-400 font-mono text-xs font-normal">({lot.lot_id})</span>
                            </div>
                            <div className="text-slate-600 mt-0.5">
                              {t('farmer_update_current_available')} <strong>{lot.quantity_kg} kg</strong> • ₹{Number(lot.price_per_kg).toFixed(0)}/kg
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedLotToUpdate(lot)}
                            className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-colors cursor-pointer"
                          >
                            Select
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Step 2: Enter Added Harvest & Visual Calculation */
                <form onSubmit={handleConfirmUpdateQuantity} className="space-y-4">
                  
                  {/* Selected Lot Header Card */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-semibold block">Active Lot</span>
                      <div className="font-bold text-emerald-950 text-base">
                        {selectedLotToUpdate.crop_name}
                      </div>
                      <div className="text-xs text-slate-600 font-mono">
                        Lot #{selectedLotToUpdate.lot_id} • ₹{Number(selectedLotToUpdate.price_per_kg).toFixed(0)}/kg
                      </div>
                    </div>
                    {myActiveLots.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setSelectedLotToUpdate(null)}
                        className="text-xs text-brand-700 hover:underline font-semibold cursor-pointer"
                      >
                        {t('farmer_update_btn_back')}
                      </button>
                    )}
                  </div>

                  {/* Quantity Input Field */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('farmer_update_new_harvest')} <span className="text-red-500">*</span>
                    </label>
                    <p className="text-[11px] text-slate-500 mb-1.5">{t('farmer_update_new_harvest_helper')}</p>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      autoFocus
                      value={newHarvestQty}
                      onChange={(e) => {
                        setNewHarvestQty(e.target.value);
                        setUpdateError('');
                      }}
                      placeholder="e.g. 10"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-base font-bold font-mono focus:bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                      required
                    />
                    {updateError && (
                      <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{updateError}</span>
                      </p>
                    )}
                  </div>

                  {/* 🧮 Live Visual Calculation Card */}
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
                    <div className="font-bold text-emerald-950 text-xs">
                      Live Quantity Calculation:
                    </div>

                    <div className="grid grid-cols-3 gap-2 items-center text-center">
                      {/* Current */}
                      <div className="bg-white p-2.5 rounded-lg border border-emerald-200">
                        <div className="text-[10px] text-slate-500 font-semibold uppercase">{t('farmer_update_calc_current')}</div>
                        <div className="text-sm font-bold text-slate-800 font-mono mt-0.5">
                          {selectedLotToUpdate.quantity_kg} kg
                        </div>
                      </div>

                      {/* Added */}
                      <div className="bg-white p-2.5 rounded-lg border border-emerald-300">
                        <div className="text-[10px] text-brand-700 font-semibold uppercase">+{t('farmer_update_calc_add')}</div>
                        <div className="text-sm font-bold text-brand-700 font-mono mt-0.5">
                          +{Number(newHarvestQty) > 0 ? Number(newHarvestQty) : 0} kg
                        </div>
                      </div>

                      {/* Total */}
                      <div className="bg-emerald-600 p-2.5 rounded-lg text-white shadow-xs">
                        <div className="text-[10px] text-emerald-100 font-bold uppercase">{t('farmer_update_calc_total')}</div>
                        <div className="text-base font-extrabold text-white font-mono mt-0.5">
                          {Number(selectedLotToUpdate.quantity_kg) + (Number(newHarvestQty) > 0 ? Number(newHarvestQty) : 0)} kg
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modal Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowUpdateModal(false)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
                    >
                      {t('farmer_update_btn_cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdatingLot || !newHarvestQty || Number(newHarvestQty) <= 0}
                      className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-all shadow-md shadow-brand-600/20 disabled:opacity-50 cursor-pointer active:scale-98"
                    >
                      {isUpdatingLot ? t('farmer_update_btn_submitting') : t('farmer_update_btn_submit')}
                    </button>
                  </div>

                </form>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
