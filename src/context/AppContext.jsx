import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api';
import { INITIAL_AVAILABLE_LOTS, INITIAL_PENDING_ORDERS, MOCK_USERS } from '../services/mockData';
import { getTranslation } from '../i18n/translations';

const AppContext = createContext();

export function AppProvider({ children }) {
  // 1. Language State (en | mr) - Persisted in localStorage
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem('krishimarg_lang');
      if (saved === 'mr' || saved === 'en') return saved;
    } catch (e) {
      // fallback
    }
    return 'en';
  });

  const setLanguage = useCallback((newLang) => {
    const lang = newLang === 'mr' ? 'mr' : 'en';
    setLanguageState(lang);
    try {
      localStorage.setItem('krishimarg_lang', lang);
    } catch (e) {
      console.warn('Could not save language to localStorage', e);
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'mr' : 'en');
  }, [language, setLanguage]);

  // Translation helper bound to current language
  const t = useCallback((key, params = {}) => {
    return getTranslation(language, key, params);
  }, [language]);

  // 2. Navigation 4 User Roles: 'welcome' | 'farmer' | 'buyer' | 'driver' | 'admin' | 'not_found'
  const [activeRole, setActiveRole] = useState(() => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    if (!hash || hash === '' || hash === 'welcome') return 'welcome';
    if (hash === 'farmer') return 'farmer';
    if (hash === 'buyer') return 'buyer';
    if (hash === 'driver' || hash === 'carrier') return 'driver';
    if (hash === 'admin' || hash === 'logistics') return 'admin';
    return 'not_found';
  });
  
  // Active User session simulation
  const [currentUser, setCurrentUser] = useState(null);

  // App Data State
  const [availableLots, setAvailableLots] = useState(INITIAL_AVAILABLE_LOTS);
  const [pendingOrders, setPendingOrders] = useState(INITIAL_PENDING_ORDERS);
  const [activeRoute, setActiveRoute] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchedDriver, setDispatchedDriver] = useState(null);

  // Driver Check-in state
  const [completedStops, setCompletedStops] = useState([]);
  const [isDeliveryCompleted, setIsDeliveryCompleted] = useState(false);

  // Connectivity Mode: true = Mock (zero-latency demo), false = Live Java Backend
  const [useMockMode, setUseMockMode] = useState(true);

  // Toast System
  const [toasts, setToasts] = useState([]);

  // Demo Pitch Step Tracker (1 to 4: Farmer -> Buyer -> Admin -> Driver)
  const [demoStep, setDemoStep] = useState(1);

  // Sync with Mock Mode
  useEffect(() => {
    apiClient.setMockMode(useMockMode);
  }, [useMockMode]);

  // Sync with URL Hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (!hash || hash === '' || hash === 'welcome') {
        setActiveRole('welcome');
      } else if (hash === 'farmer') {
        setActiveRole('farmer');
      } else if (hash === 'buyer') {
        setActiveRole('buyer');
      } else if (hash === 'driver' || hash === 'carrier') {
        setActiveRole('driver');
      } else if (hash === 'admin' || hash === 'logistics') {
        setActiveRole('admin');
      } else {
        setActiveRole('not_found');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update document title dynamically with language awareness
  useEffect(() => {
    if (activeRole === 'welcome') {
      document.title = language === 'mr' 
        ? 'कृषिमार्ग - थेट शेतकरी ते खरेदीदार बाजारपेठ व एआय वाहतूक'
        : 'KrishiMarg (कृषिमार्ग) - Sovereign Direct Agri-Marketplace & AI Logistics';
      window.history.replaceState(null, '', '#/');
    } else if (activeRole === 'farmer') {
      document.title = language === 'mr'
        ? 'शेतकरी व एफपीओ पोर्टल | कृषिमार्ग'
        : 'Farmer & FPO Portal | KrishiMarg';
      window.history.replaceState(null, '', '#/farmer');
    } else if (activeRole === 'buyer') {
      document.title = language === 'mr'
        ? 'घाऊक खरेदीदार बाजारपेठ | कृषिमार्ग'
        : 'Bulk Buyer Procurement Marketplace | KrishiMarg';
      window.history.replaceState(null, '', '#/buyer');
    } else if (activeRole === 'driver') {
      document.title = language === 'mr'
        ? 'चालक व ड्रायव्हर टर्मिनल | कृषिमार्ग'
        : 'Driver Fleet Terminal | KrishiMarg';
      window.history.replaceState(null, '', '#/driver');
    } else if (activeRole === 'admin') {
      document.title = language === 'mr'
        ? 'अ‍ॅडमिन लॉजिस्टिक्स डॅशबोर्ड | कृषिमार्ग'
        : 'Admin Logistics Dashboard | KrishiMarg';
      window.history.replaceState(null, '', '#/admin');
    } else if (activeRole === 'not_found') {
      document.title = language === 'mr'
        ? '४०४ - पृष्ठ सापडले नाही | कृषिमार्ग'
        : '404 - Page Not Found | KrishiMarg';
    }
  }, [activeRole, language]);

  const addToast = (message, type = 'success', duration = 4500) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  // Role Switcher Handler
  const selectRole = (role) => {
    setActiveRole(role);
    if (role === 'farmer') {
      setCurrentUser(MOCK_USERS.find(u => u.role === 'FARMER'));
    } else if (role === 'buyer') {
      setCurrentUser(MOCK_USERS.find(u => u.role === 'BUYER'));
    } else if (role === 'driver') {
      setCurrentUser(MOCK_USERS.find(u => u.role === 'DRIVER') || { user_id: 'd_901', full_name: 'Aman Sharma (Driver)', role: 'DRIVER' });
    } else if (role === 'admin') {
      setCurrentUser({ user_id: 'adm_01', full_name: 'Central Logistics Administrator', role: 'ADMIN' });
    } else {
      setCurrentUser(null);
    }
  };

  // Add new produce lot
  const addProduceLot = (newLot) => {
    setAvailableLots(prev => [newLot, ...prev]);
    const msg = t('toast_lot_listed', { crop: newLot.crop_name, qty: newLot.quantity_kg });
    addToast(msg, 'success');
  };

  // Add new order
  const createOrder = (newOrder) => {
    setPendingOrders(prev => [newOrder, ...prev]);
    const msg = t('toast_order_placed', { order_id: newOrder.order_id, amount: newOrder.total_amount.toFixed(2) });
    addToast(msg, 'success');
  };

  // Run Route Optimization (calls Java API POST /api/v1/admin/optimize)
  const runRouteOptimization = async (orderId = 'ord_7701') => {
    try {
      setIsOptimizing(true);
      const routeData = await apiClient.optimizeRoute(orderId);
      setActiveRoute(routeData);
      const msg = t('toast_route_opt', { dist: routeData.total_distance_km });
      addToast(msg, 'success');
      return routeData;
    } catch (err) {
      const msg = t('toast_opt_error', { err: err.message || 'Unable to connect to OR-Tools service.' });
      addToast(msg, 'error');
    } finally {
      setIsOptimizing(false);
    }
  };

  // Dispatch Route to Driver
  const broadcastToDrivers = async () => {
    setIsDispatching(true);
    await new Promise(r => setTimeout(r, 1200));
    const driver = {
      driver_id: 'd_901',
      name: 'Aman Sharma',
      vehicle_no: 'MH 12 AB 1234',
      vehicle_type: 'Tata Ace (Chota Hathi) - 1 Ton',
      phone: '+91 98765 43210',
      rating: 4.9,
      payout_inr: 1200
    };
    setDispatchedDriver(driver);
    setIsDispatching(false);
    const msg = t('toast_driver_dispatched', { name: driver.name, veh: driver.vehicle_no });
    addToast(msg, 'success');
    setDemoStep(4);
  };

  // Driver Stop Checkin
  const checkinStop = (stopNumber) => {
    setCompletedStops(prev => [...new Set([...prev, stopNumber])]);
    addToast(t('toast_pickup_checked', { qty: '300-500' }), 'success');
  };

  // Complete Driver Delivery
  const completeDelivery = () => {
    setIsDeliveryCompleted(true);
    addToast(t('toast_delivery_success', { payout: '1,200' }), 'success');
  };

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    t,
    activeRole,
    setActiveRole,
    selectRole,
    currentUser,
    setCurrentUser,
    availableLots,
    setAvailableLots,
    addProduceLot,
    pendingOrders,
    setPendingOrders,
    createOrder,
    activeRoute,
    setActiveRoute,
    isOptimizing,
    runRouteOptimization,
    isDispatching,
    broadcastToDrivers,
    dispatchedDriver,
    setDispatchedDriver,
    completedStops,
    checkinStop,
    isDeliveryCompleted,
    completeDelivery,
    useMockMode,
    setUseMockMode,
    toasts,
    setToasts,
    addToast,
    demoStep,
    setDemoStep
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
