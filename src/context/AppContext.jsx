import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { INITIAL_AVAILABLE_LOTS, INITIAL_PENDING_ORDERS, MOCK_USERS } from '../services/mockData';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Navigation Role: 'welcome' | 'farmer' | 'buyer' | 'admin' | 'not_found'
  const [activeRole, setActiveRole] = useState(() => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    if (!hash || hash === '' || hash === 'welcome') return 'welcome';
    if (hash === 'farmer') return 'farmer';
    if (hash === 'buyer') return 'buyer';
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

  // Connectivity Mode: true = Mock (zero-latency demo), false = Live Java Backend
  const [useMockMode, setUseMockMode] = useState(true);

  // Toast System
  const [toasts, setToasts] = useState([]);

  // Demo Pitch Step Tracker (1 to 4)
  const [demoStep, setDemoStep] = useState(1);

  // Sync with Mock Mode
  useEffect(() => {
    apiClient.setMockMode(useMockMode);
  }, [useMockMode]);

  // Sync with URL Hash and document.title
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (!hash || hash === '' || hash === 'welcome') {
        setActiveRole('welcome');
      } else if (hash === 'farmer') {
        setActiveRole('farmer');
      } else if (hash === 'buyer') {
        setActiveRole('buyer');
      } else if (hash === 'admin' || hash === 'logistics') {
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
      document.title = 'KrishiMarg (कृषिमार्ग) - Sovereign Direct Agri-Marketplace & AI Logistics';
      window.history.replaceState(null, '', '#/');
    } else if (activeRole === 'farmer') {
      document.title = 'Farmer & FPO Portal | KrishiMarg';
      window.history.replaceState(null, '', '#/farmer');
    } else if (activeRole === 'buyer') {
      document.title = 'Bulk Buyer Procurement Marketplace | KrishiMarg';
      window.history.replaceState(null, '', '#/buyer');
    } else if (activeRole === 'admin') {
      document.title = 'Central Logistics & Dispatch Hub | KrishiMarg';
      window.history.replaceState(null, '', '#/logistics');
    } else if (activeRole === 'not_found') {
      document.title = '404 - Page Not Found | KrishiMarg';
    }
  }, [activeRole]);

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
    } else if (role === 'admin') {
      setCurrentUser({ user_id: 'adm_01', full_name: 'Central Logistics Dispatcher', role: 'ADMIN' });
    } else if (role === 'welcome') {
      setCurrentUser(null);
    } else {
      setCurrentUser(null);
    }
  };

  // Add new produce lot
  const addProduceLot = (newLot) => {
    setAvailableLots(prev => [newLot, ...prev]);
    addToast(`Produce lot for ${newLot.crop_name} (${newLot.quantity_kg} kg) listed successfully with guaranteed Fair-Price!`, 'success');
  };

  // Add new order
  const createOrder = (newOrder) => {
    setPendingOrders(prev => [newOrder, ...prev]);
    addToast(`Bulk order #${newOrder.order_id} placed! ₹${newOrder.total_amount.toFixed(2)} safely locked in Escrow.`, 'success');
  };

  // Run Route Optimization
  const runRouteOptimization = async (orderId = 'ord_7701') => {
    try {
      setIsOptimizing(true);
      const routeData = await apiClient.optimizeRoute(orderId);
      setActiveRoute(routeData);
      addToast(`Google OR-Tools: Multi-stop route calculated (${routeData.total_distance_km} km) with -34.5% cost reduction!`, 'success');
      return routeData;
    } catch (err) {
      addToast(`Route optimization failed: ${err.message || 'Unable to connect to OR-Tools service.'}`, 'error');
    } finally {
      setIsOptimizing(false);
    }
  };

  // Simulate Driver Dispatch
  const broadcastToDrivers = async () => {
    setIsDispatching(true);
    await new Promise(r => setTimeout(r, 2200));
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
    addToast(`Route assigned to Driver ${driver.name} (${driver.vehicle_no})! Order status set to IN_TRANSIT.`, 'success');
  };

  const value = {
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
