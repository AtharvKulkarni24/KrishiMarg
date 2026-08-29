import React, { useState, useRef, useEffect } from 'react';
import { 
  PlusCircle, 
  AlertCircle, 
  ImageIcon, 
  X, 
  RotateCcw, 
  Camera, 
  Leaf, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2 
} from 'lucide-react';
import { apiClient } from '../../services/api';
import { CROP_IMAGES, DEFAULT_CROP_IMAGE } from '../../services/mockData';
import { useApp } from '../../context/AppContext';

export default function ProduceListingForm({
  farmerId,
  formData,
  setFormData,
  mandiPrice,
  minPrice,
  maxPrice,
  handleOpenUpdateModal
}) {
  const { t, addToast, addProduceLot, setDemoStep } = useApp();

  const [selectedImage, setSelectedImage] = useState(CROP_IMAGES['Tomato'] || DEFAULT_CROP_IMAGE);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // Update default image when crop changes (if using default image)
  useEffect(() => {
    if (!selectedImage || Object.values(CROP_IMAGES).includes(selectedImage) || selectedImage === DEFAULT_CROP_IMAGE) {
      const defaultImg = CROP_IMAGES[formData.crop_name] || DEFAULT_CROP_IMAGE;
      setSelectedImage(defaultImg);
      setFormData(prev => ({ ...prev, image_url: defaultImg }));
    }
  }, [formData.crop_name, setFormData, selectedImage]);

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

  return (
    <div className="space-y-6">
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
  );
}
