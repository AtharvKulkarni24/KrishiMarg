import React from 'react';
import { useApp } from './context/AppContext';
import WelcomePage from './components/WelcomePage';
import Navbar from './components/Navbar';
import DemoTourBar from './components/DemoTourBar';
import FarmerPortal from './components/farmer/FarmerPortal';
import BuyerMarketplace from './components/buyer/BuyerMarketplace';
import AdminLogisticsMap from './components/admin/AdminLogisticsMap';
import ToastContainer from './components/common/ToastContainer';

export default function App() {
  const { activeRole } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-brand-500 selection:text-white flex flex-col">
      {/* If on Welcome page, display full immersion hero screen */}
      {activeRole === 'welcome' ? (
        <WelcomePage />
      ) : (
        <>
          <Navbar />
          <DemoTourBar />
          <main className="flex-1 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            {activeRole === 'farmer' && <FarmerPortal />}
            {activeRole === 'buyer' && <BuyerMarketplace />}
            {activeRole === 'admin' && <AdminLogisticsMap />}
          </main>
          <footer className="border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500">
            KrishiMarg (कृषिमार्ग) • SIH 2026 Problem Statement #26033 • Ministry of Consumer Affairs
          </footer>
        </>
      )}

      {/* Global Toast Alert Overlay */}
      <ToastContainer />
    </div>
  );
}
