import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { INITIAL_AVAILABLE_LOTS, INITIAL_PENDING_ORDERS, MOCK_USERS } from '../services/mockData';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Navigation Role: 'welcome' | 'farmer' | 'buyer' | 'admin'
  const [activeRole, setActiveRole] = useState('welcome');
  
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

  useEffect(() => {
    apiClient.setMockMode(useMockMode);
  }, [useMockMode]);

  const addToast = (message, type = 'success', duration = 4000) => {
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
    } else {
      setCurrentUser(null);
    }
  };

  // Add new produce lot
  const addProduceLot = (newLot) => {
    setAvailableLots(prev => [newLot, ...prev]);
    addToast(`Produce lot "${newLot.crop_name}" listed successfully with Fair-Price guarantee!`, 'success');
  };

  // Add new order
  const createOrder = (newOrder) => {
    setPendingOrders(prev => [newOrder, ...prev]);
    addToast(`Bulk order #${newOrder.order_id} placed! Payment held in Escrow.`, 'success');
  };

  // Run Route Optimization
  const runRouteOptimization = async (orderId = 'ord_7701') => {
    try {
      setIsOptimizing(true);
      const routeData = await apiClient.optimizeRoute(orderId);
      setActiveRoute(routeData);
      addToast(`Google OR-Tools: Milk-run route computed! 3 stops, ${routeData.total_distance_km} km.`, 'success');
      return routeData;
    } catch (err) {
      addToast(`Optimization error: ${err.message}`, 'error');
    } finally {
      setIsOptimizing(false);
    }
  };

  // Simulate Driver Dispatch
  const broadcastToDrivers = async () => {
    setIsDispatching(true);
    await new Promise(r => setTimeout(r, 2500)); // 2.5s radar search
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
    addToast(`Trip claimed by Driver ${driver.name} (${driver.vehicle_no})!`, 'success');
  };

  const value = {
    activeRole,
    setActiveRole,
    selectRole,
    currentUser,
    setCurrentUser,
    availableLots,
    addProduceLot,
    pendingOrders,
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
