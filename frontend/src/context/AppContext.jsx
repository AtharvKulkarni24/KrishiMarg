import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api';
import { INITIAL_AVAILABLE_LOTS, INITIAL_PENDING_ORDERS, INITIAL_ROUTES, MOCK_USERS } from '../services/mockData';
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

  // 2. Navigation 3 User Roles: 'welcome' | 'farmer' | 'buyer' | 'driver' | 'not_found'
  const [activeRole, setActiveRole] = useState(() => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    if (!hash || hash === '' || hash === 'welcome') return 'welcome';
    if (hash === 'farmer') return 'farmer';
    if (hash === 'buyer') return 'buyer';
    if (hash === 'driver' || hash === 'carrier') return 'driver';
    return 'not_found';
  });
  
  // Active User session simulation (FARMER, BUYER, DRIVER)
  const [currentUser, setCurrentUser] = useState(() => MOCK_USERS.find(u => u.role === 'FARMER'));

  // App Data State (Master Contract aligned)
  const [availableLots, setAvailableLots] = useState(INITIAL_AVAILABLE_LOTS);
  const [pendingOrders, setPendingOrders] = useState(INITIAL_PENDING_ORDERS);
  const [routes, setRoutes] = useState(INITIAL_ROUTES);
  const [selectedRouteId, setSelectedRouteId] = useState('route_101');
  const [routeStatusMap, setRouteStatusMap] = useState({ 'route_101': 'AVAILABLE' }); // 'AVAILABLE' | 'ACCEPTED' | 'COMPLETED'
  const [payoutStatusMap, setPayoutStatusMap] = useState({});

  // Connectivity Mode: true = Mock, false = Live Backend
  const [useMockMode, setUseMockMode] = useState(true);

  // Toast System
  const [toasts, setToasts] = useState([]);

  // Demo Pitch Step Tracker (1: Farmer -> 2: Buyer -> 3: Driver)
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
      } else {
        setActiveRole('not_found');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update document title dynamically
  useEffect(() => {
    if (activeRole === 'welcome') {
      document.title = language === 'mr' 
        ? 'कृषिमार्ग - थेट शेतकरी ते खरेदीदार बाजारपेठ व एआय वाहतूक'
        : 'KrishiMarg (कृषिमार्ग) - Sovereign Direct Agri-Marketplace & AI Logistics';
      window.history.replaceState(null, '', '#/');
    } else if (activeRole === 'farmer') {
      document.title = language === 'mr'
        ? 'शेतकरी पोर्टल | कृषिमार्ग'
        : 'Farmer Supply Portal | KrishiMarg';
      window.history.replaceState(null, '', '#/farmer');
    } else if (activeRole === 'buyer') {
      document.title = language === 'mr'
        ? 'खरेदीदार बाजारपेठ | कृषिमार्ग'
        : 'Buyer Procurement Marketplace | KrishiMarg';
      window.history.replaceState(null, '', '#/buyer');
    } else if (activeRole === 'driver') {
      document.title = language === 'mr'
        ? 'चालक व लॉजिस्टिक्स टर्मिनल | कृषिमार्ग'
        : 'Driver Fleet Terminal | KrishiMarg';
      window.history.replaceState(null, '', '#/driver');
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
      setCurrentUser(MOCK_USERS.find(u => u.role === 'DRIVER') || { user_id: 'd_901', full_name: 'Aman Sharma', role: 'DRIVER' });
    } else {
      setCurrentUser(null);
    }
  };

  // 1. Add new produce lot (POST /api/v1/produce)
  const addProduceLot = (newLot) => {
    setAvailableLots(prev => [newLot, ...prev]);
    const msg = t('toast_lot_listed', { crop: newLot.crop_name, qty: newLot.quantity_kg });
    addToast(msg, 'success');
  };

  // 2. Create new buyer order (POST /api/v1/orders)
  const createOrder = (newOrder) => {
    setPendingOrders(prev => [newOrder, ...prev]);

    // Construct a corresponding Driver Route for the ordered lot(s)
    const newRouteId = `route_${Math.floor(100 + Math.random() * 900)}`;
    const orderedStops = [];
    const routeCoords = [];

    // Add pickup stops from order lot_ids
    if (newOrder.lot_ids && newOrder.lot_ids.length > 0) {
      newOrder.lot_ids.forEach(lotId => {
        const lot = availableLots.find(l => l.lot_id === lotId);
        if (lot) {
          orderedStops.push({
            type: "PICKUP",
            lot_id: lot.lot_id,
            latitude: lot.latitude,
            longitude: lot.longitude
          });
          routeCoords.push([lot.latitude, lot.longitude]);
        }
      });
    }

    // Add dropoff stop
    orderedStops.push({
      type: "DROPOFF",
      order_id: newOrder.order_id,
      latitude: newOrder.dropoff_latitude,
      longitude: newOrder.dropoff_longitude
    });
    routeCoords.push([newOrder.dropoff_latitude, newOrder.dropoff_longitude]);

    const newRoute = {
      route_id: newRouteId,
      total_distance_km: 42.6,
      pickup_count: orderedStops.filter(s => s.type === 'PICKUP').length,
      dropoff_count: 1,
      estimated_payout: 1200.00,
      route_coordinates: routeCoords,
      ordered_stops: orderedStops
    };

    setRoutes(prev => [newRoute, ...prev]);
    setSelectedRouteId(newRouteId);
    setRouteStatusMap(prev => ({ ...prev, [newRouteId]: 'AVAILABLE' }));

    const msg = t('toast_order_placed', { order_id: newOrder.order_id });
    addToast(msg, 'success');
  };

  // 3. Driver accepts route (POST /api/v1/driver/routes/{route_id}/accept)
  const handleAcceptRoute = async (routeId) => {
    try {
      const res = await apiClient.acceptRoute(routeId, currentUser?.user_id || 'd_901');
      if (res.status === 'ACCEPTED') {
        setRouteStatusMap(prev => ({ ...prev, [routeId]: 'ACCEPTED' }));
        addToast(t('toast_route_accepted', { route_id: routeId }), 'success');
      }
    } catch (err) {
      addToast(t('toast_route_error', { err: err.message }), 'error');
    }
  };

  // 4. Driver completes route (POST /api/v1/driver/routes/{route_id}/complete)
  const handleCompleteRoute = async (routeId) => {
    try {
      const res = await apiClient.completeRoute(routeId);
      if (res.status === 'COMPLETED') {
        setRouteStatusMap(prev => ({ ...prev, [routeId]: 'COMPLETED' }));
        setPayoutStatusMap(prev => ({ ...prev, [routeId]: res.payout_status }));
        addToast(t('toast_route_completed'), 'success');
      }
    } catch (err) {
      addToast(t('toast_route_error', { err: err.message }), 'error');
    }
  };

  const activeRoute = routes.find(r => r.route_id === selectedRouteId) || routes[0] || null;
  const activeRouteStatus = routeStatusMap[selectedRouteId] || 'AVAILABLE';
  const activePayoutStatus = payoutStatusMap[selectedRouteId] || null;

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
    routes,
    setRoutes,
    selectedRouteId,
    setSelectedRouteId,
    activeRoute,
    activeRouteStatus,
    activePayoutStatus,
    handleAcceptRoute,
    handleCompleteRoute,
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
