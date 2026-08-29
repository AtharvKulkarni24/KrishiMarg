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

  // 2. Navigation 4 User Roles: 'welcome' | 'farmer' | 'buyer' | 'driver' | 'admin' | 'not_found'
  const [activeRole, setActiveRole] = useState(() => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    if (!hash || hash === '' || hash === 'welcome') return 'welcome';
    if (hash === 'farmer') return 'farmer';
    if (hash === 'buyer') return 'buyer';
    if (hash === 'driver' || hash === 'carrier') return 'driver';
    if (hash === 'admin' || hash === 'operations') return 'admin';
    return 'not_found';
  });
  
  // Active User session simulation (FARMER, BUYER, DRIVER, ADMIN)
  const [currentUser, setCurrentUser] = useState(() => MOCK_USERS.find(u => u.role === 'FARMER'));

  // Drivers fleet state
  const [drivers, setDrivers] = useState(() => MOCK_USERS.filter(u => u.role === 'DRIVER'));

  // Admin selected order for map focus and details
  const [selectedAdminOrderId, setSelectedAdminOrderId] = useState('ord_7701');

  // App Data State (Master Contract aligned)
  const [availableLots, setAvailableLots] = useState(INITIAL_AVAILABLE_LOTS);
  const [pendingOrders, setPendingOrders] = useState(INITIAL_PENDING_ORDERS);
  const [routes, setRoutes] = useState(INITIAL_ROUTES);
  const [selectedRouteId, setSelectedRouteId] = useState('route_101');
  const [routeStatusMap, setRouteStatusMap] = useState({ 'route_101': 'AVAILABLE' }); // 'AVAILABLE' | 'ACCEPTED' | 'COMPLETED'
  const [payoutStatusMap, setPayoutStatusMap] = useState({});

  // Connectivity Mode: true = Mock, false = Live Backend
  const [useMockMode, setUseMockMode] = useState(true);

  // Farmer Order Notifications State
  const [farmerNotifications, setFarmerNotifications] = useState([
    {
      id: 'notif_init_1',
      farmer_id: 'f_101',
      order_id: 'ord_7701',
      buyer_name: 'Green Leaf Restaurant & Mess',
      crop_name: 'Tomato',
      quantity_kg: 500,
      amount: 9000,
      status: 'Order Placed',
      delivery_slot: {
        label: 'Tomorrow',
        time_range: '9 AM – 12 PM',
        date_formatted: '30 Aug 2026'
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      read: false
    }
  ]);

  // Buyer Notifications State
  const [buyerNotifications, setBuyerNotifications] = useState([
    {
      id: 'notif_buyer_init_1',
      buyer_id: 'b_501',
      order_id: 'ord_7701',
      type: 'ORDER_PLACED',
      title: 'Order Placed (#ord_7701)',
      message: 'Your bulk produce order for 800 kg Tomato has been placed. Waiting for farmer confirmation.',
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      read: false
    }
  ]);

  // Order Feedback State (mapping: order_id -> { rating, comment, timestamp })
  const [orderFeedbacks, setOrderFeedbacks] = useState({});

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
      } else if (hash === 'admin' || hash === 'operations') {
        setActiveRole('admin');
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
    } else if (activeRole === 'admin') {
      document.title = language === 'mr'
        ? 'प्रशासक ऑपरेशन्स केंद्र | कृषिमार्ग'
        : 'Admin Operations Hub | KrishiMarg';
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
      setCurrentUser(MOCK_USERS.find(u => u.role === 'DRIVER') || { user_id: 'd_901', full_name: 'Aman Sharma', role: 'DRIVER' });
    } else if (role === 'admin') {
      setCurrentUser({ user_id: 'adm_01', full_name: 'Operations Admin', role: 'ADMIN' });
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

  // 2. Update existing produce lot quantity (PATCH /api/v1/produce/{lot_id})
  const updateProduceLotQuantity = async (lotId, additionalQuantityKg) => {
    const lot = availableLots.find(l => l.lot_id === lotId);
    if (!lot) return null;
    const currentQty = Number(lot.quantity_kg) || 0;
    const addedQty = Number(additionalQuantityKg) || 0;
    const newQty = currentQty + addedQty;

    try {
      await apiClient.updateProduceLotQuantity(lotId, addedQty);
    } catch (e) {
      console.warn('Backend patch failed, updated in local state:', e);
    }

    setAvailableLots(prev => prev.map(l => l.lot_id === lotId ? { ...l, quantity_kg: newQty } : l));

    const msg = t('toast_lot_updated', {
      crop: lot.crop_name,
      prev: currentQty,
      added: addedQty,
      total: newQty
    });
    addToast(msg, 'success');
    return { lot_id: lotId, prevQty: currentQty, addedQty, newQty, crop_name: lot.crop_name };
  };

  // 3. Farmer Notification Handlers
  const markFarmerNotificationRead = (notifId) => {
    setFarmerNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  };

  const markAllFarmerNotificationsRead = (farmerId) => {
    setFarmerNotifications(prev => prev.map(n => n.farmer_id === farmerId ? { ...n, read: true } : n));
  };

  // 4. Buyer Notification Handlers
  const markBuyerNotificationRead = (notifId) => {
    setBuyerNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  };

  const markAllBuyerNotificationsRead = (buyerId = 'b_501') => {
    setBuyerNotifications(prev => prev.map(n => n.buyer_id === buyerId ? { ...n, read: true } : n));
  };

  // 5. Simulate 15-minute Farmer Timeout (Demo Mode)
  const simulateFarmerTimeout = (orderId) => {
    setPendingOrders(prev => prev.map(o => {
      if (o.order_id === orderId) {
        return { ...o, acceptance_status: 'TIMEOUT_DELAYED' };
      }
      return o;
    }));

    const timeoutNotif = {
      id: `notif_timeout_${Date.now()}`,
      buyer_id: 'b_501',
      order_id: orderId,
      type: 'TIMEOUT_DELAYED',
      title: t('buyer_timeout_delayed_title'),
      message: t('buyer_timeout_delayed_desc'),
      timestamp: new Date().toISOString(),
      read: false
    };

    setBuyerNotifications(prev => [timeoutNotif, ...prev]);
    addToast(t('buyer_timeout_delayed_title'), 'warning');
  };

  // 6. Switch Farmer after timeout
  const switchOrderFarmer = (orderId, oldLotId, newLotId) => {
    const newLot = availableLots.find(l => l.lot_id === newLotId);
    if (!newLot) return;

    setPendingOrders(prev => prev.map(o => {
      if (o.order_id === orderId) {
        const updatedLots = o.lot_ids.map(id => id === oldLotId ? newLotId : id);
        return {
          ...o,
          lot_ids: updatedLots,
          acceptance_status: 'WAITING_CONFIRMATION',
          farmer_acceptance_deadline: new Date(Date.now() + 15 * 60 * 1000).toISOString()
        };
      }
      return o;
    }));

    // Notify new farmer with delivery slot info
    const newFarmerNotif = {
      id: `notif_${Date.now()}`,
      farmer_id: newLot.farmer_id,
      order_id: orderId,
      buyer_name: 'Green Leaf Restaurant & Mess',
      crop_name: newLot.crop_name,
      quantity_kg: newLot.quantity_kg,
      amount: Number(newLot.quantity_kg) * Number(newLot.price_per_kg),
      status: 'Order Placed',
      delivery_slot: {
        label: 'Tomorrow',
        time_range: '9 AM – 12 PM',
        date_formatted: '30 Aug 2026'
      },
      timestamp: new Date().toISOString(),
      read: false
    };
    setFarmerNotifications(prev => [newFarmerNotif, ...prev]);

    // Toast and Buyer notification
    const farmerUser = MOCK_USERS.find(u => u.user_id === newLot.farmer_id);
    const farmerName = farmerUser ? farmerUser.full_name : 'Suresh Mohite';
    addToast(t('toast_farmer_switched', { farmer: farmerName, lot_id: newLotId }), 'success');
  };

  // 7. Submit Product Rating & Feedback
  const submitOrderFeedback = (feedback) => {
    setOrderFeedbacks(prev => ({
      ...prev,
      [feedback.order_id]: feedback
    }));
    addToast(t('buyer_rating_thank_you'), 'success');
  };

  // 8. Create new buyer order (POST /api/v1/orders)
  const createOrder = (newOrder) => {
    const defaultSlot = {
      slot_id: 'tomorrow_morning',
      label: 'Tomorrow',
      date_formatted: '30 Aug 2026',
      time_range: '9 AM – 12 PM'
    };

    const enrichedOrder = {
      ...newOrder,
      created_at: new Date().toISOString(),
      farmer_acceptance_deadline: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      acceptance_status: 'WAITING_CONFIRMATION',
      delivery_slot: newOrder.delivery_slot || defaultSlot
    };

    setPendingOrders(prev => [enrichedOrder, ...prev]);

    // Notify relevant farmer(s) with their specific lots AND the selected delivery slot
    if (enrichedOrder.lot_ids && enrichedOrder.lot_ids.length > 0) {
      enrichedOrder.lot_ids.forEach(lotId => {
        const lot = availableLots.find(l => l.lot_id === lotId);
        if (lot) {
          const qty = enrichedOrder.lot_quantities?.[lotId] || lot.quantity_kg;
          const newNotif = {
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            farmer_id: lot.farmer_id,
            order_id: enrichedOrder.order_id,
            buyer_name: 'Green Leaf Restaurant & Mess',
            crop_name: lot.crop_name,
            quantity_kg: qty,
            amount: qty * Number(lot.price_per_kg),
            status: 'Order Placed',
            delivery_slot: enrichedOrder.delivery_slot,
            timestamp: new Date().toISOString(),
            read: false
          };
          setFarmerNotifications(prev => [newNotif, ...prev]);
        }
      });
    }

    // Notify Buyer of order confirmation
    const buyerNotif = {
      id: `notif_buyer_${Date.now()}`,
      buyer_id: enrichedOrder.buyer_id || 'b_501',
      order_id: enrichedOrder.order_id,
      type: 'ORDER_PLACED',
      title: t('buyer_modal_success_title', { order_id: enrichedOrder.order_id }),
      message: `Your bulk order #${enrichedOrder.order_id} has been queued. Delivery: ${enrichedOrder.delivery_slot.label} • ${enrichedOrder.delivery_slot.time_range}.`,
      timestamp: new Date().toISOString(),
      read: false
    };
    setBuyerNotifications(prev => [buyerNotif, ...prev]);

    // Construct a corresponding Driver Route for the ordered lot(s)
    const newRouteId = `route_${Math.floor(100 + Math.random() * 900)}`;
    const orderedStops = [];
    const routeCoords = [];

    // Add pickup stops from order lot_ids
    if (enrichedOrder.lot_ids && enrichedOrder.lot_ids.length > 0) {
      enrichedOrder.lot_ids.forEach(lotId => {
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
      order_id: enrichedOrder.order_id,
      latitude: enrichedOrder.dropoff_latitude,
      longitude: enrichedOrder.dropoff_longitude
    });
    routeCoords.push([enrichedOrder.dropoff_latitude, enrichedOrder.dropoff_longitude]);

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

    const msg = t('toast_order_placed', { order_id: enrichedOrder.order_id });
    addToast(msg, 'success');
  };

  // 9. Driver accepts route (POST /api/v1/driver/routes/{route_id}/accept)
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

  // 10. Driver completes route (POST /api/v1/driver/routes/{route_id}/complete)
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

  // 11. Admin: Optimize route for pending order
  const optimizeRouteForOrder = async (orderId) => {
    const order = pendingOrders.find(o => o.order_id === orderId) || pendingOrders[0];
    if (!order) return null;

    try {
      const optResult = await apiClient.optimizeRoute(orderId);
      
      // Construct ordered stops from order lot_ids and dropoff
      const orderedStops = [];
      const routeCoords = [];

      if (order.lot_ids && order.lot_ids.length > 0) {
        order.lot_ids.forEach(lotId => {
          const lot = availableLots.find(l => l.lot_id === lotId);
          if (lot) {
            orderedStops.push({
              type: "PICKUP",
              lot_id: lot.lot_id,
              latitude: Number(lot.latitude),
              longitude: Number(lot.longitude)
            });
            routeCoords.push([Number(lot.latitude), Number(lot.longitude)]);
          }
        });
      }

      orderedStops.push({
        type: "DROPOFF",
        order_id: order.order_id,
        latitude: Number(order.dropoff_latitude || 18.5018),
        longitude: Number(order.dropoff_longitude || 73.8636)
      });
      routeCoords.push([Number(order.dropoff_latitude || 18.5018), Number(order.dropoff_longitude || 73.8636)]);

      const targetRouteId = optResult?.route_id || `route_${Math.floor(100 + Math.random() * 900)}`;
      const newRoute = {
        route_id: targetRouteId,
        order_id: order.order_id,
        total_distance_km: optResult?.total_distance_km || 42.6,
        pickup_count: orderedStops.filter(s => s.type === 'PICKUP').length,
        dropoff_count: 1,
        estimated_payout: optResult?.estimated_payout || 1200.00,
        status: "OPTIMIZED",
        assigned_driver_id: null,
        assigned_driver_name: null,
        route_coordinates: routeCoords.length > 0 ? routeCoords : [
          [18.3245, 74.0118],
          [18.3489, 74.0312],
          [18.5018, 73.8636]
        ],
        ordered_stops: orderedStops
      };

      setRoutes(prev => {
        const existingIdx = prev.findIndex(r => r.route_id === targetRouteId || r.order_id === order.order_id);
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = { ...updated[existingIdx], ...newRoute };
          return updated;
        }
        return [newRoute, ...prev];
      });

      setPendingOrders(prev => prev.map(o => o.order_id === order.order_id ? { ...o, status: 'ROUTED' } : o));
      setSelectedRouteId(targetRouteId);
      setRouteStatusMap(prev => ({ ...prev, [targetRouteId]: 'AVAILABLE' }));
      addToast(t('admin_optimize_success'), 'success');
      return newRoute;
    } catch (err) {
      addToast(t('toast_route_error', { err: err.message }), 'error');
      return null;
    }
  };

  // 12. Admin: Assign driver to route
  const assignDriverToRoute = async (routeId, driverId) => {
    const driver = drivers.find(d => d.user_id === driverId) || MOCK_USERS.find(u => u.user_id === driverId);
    if (!driver) return;

    try {
      await apiClient.assignDriver(routeId, driverId);

      setRoutes(prev => prev.map(r => {
        if (r.route_id === routeId) {
          return {
            ...r,
            assigned_driver_id: driverId,
            assigned_driver_name: driver.full_name,
            status: 'ASSIGNED'
          };
        }
        return r;
      }));

      setDrivers(prev => prev.map(d => d.user_id === driverId ? { ...d, status: 'BUSY' } : d));
      setRouteStatusMap(prev => ({ ...prev, [routeId]: 'ACCEPTED' }));
      setSelectedRouteId(routeId);

      const msg = t('admin_toast_driver_assigned', { driver: driver.full_name, route_id: routeId });
      addToast(msg, 'success');
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
    drivers,
    setDrivers,
    selectedAdminOrderId,
    setSelectedAdminOrderId,
    availableLots,
    setAvailableLots,
    addProduceLot,
    updateProduceLotQuantity,
    farmerNotifications,
    markFarmerNotificationRead,
    markAllFarmerNotificationsRead,
    buyerNotifications,
    markBuyerNotificationRead,
    markAllBuyerNotificationsRead,
    simulateFarmerTimeout,
    switchOrderFarmer,
    orderFeedbacks,
    submitOrderFeedback,
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
    optimizeRouteForOrder,
    assignDriverToRoute,
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
