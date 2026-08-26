import React from 'react';
import { useApp } from './context/AppContext';
import WelcomePage from './components/WelcomePage';
import Navbar from './components/Navbar';
import DemoTourBar from './components/DemoTourBar';
import FarmerPortal from './components/farmer/FarmerPortal';
import BuyerMarketplace from './components/buyer/BuyerMarketplace';
import DriverPortal from './components/driver/DriverPortal';
import AdminLogisticsMap from './components/admin/AdminLogisticsMap';
import NotFoundPage from './components/NotFoundPage';
import ToastContainer from './components/common/ToastContainer';

export default function App() {
  const { activeRole, t } = useApp();

  return (
    <div className="min-h-screen bg-[#f6faf6] text-slate-800 font-sans selection:bg-brand-500 selection:text-white flex flex-col w-full max-w-full overflow-x-hidden">
      {/* If on Welcome page, display full immersion hero screen */}
      {activeRole === 'welcome' ? (
        <WelcomePage />
      ) : activeRole === 'not_found' ? (
        <>
          <Navbar />
          <NotFoundPage />
        </>
      ) : (
        <>
          <Navbar />
          <DemoTourBar />
          <main className="flex-1 bg-[#f6faf6] w-full max-w-full overflow-x-hidden">
            {activeRole === 'farmer' && <FarmerPortal />}
            {activeRole === 'buyer' && <BuyerMarketplace />}
            {activeRole === 'driver' && <DriverPortal />}
            {activeRole === 'admin' && <AdminLogisticsMap />}
          </main>
          <footer className="border-t border-emerald-900/10 bg-white py-4 px-6 text-center text-xs text-slate-500 w-full">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="font-medium text-emerald-950">
                {t('footer_text')}
              </span>
              <span className="text-slate-400 text-[11px]">
                {t('pilot_region')} • {t('tech_stack_footer')}
              </span>
            </div>
          </footer>
        </>
      )}

      {/* Global Toast Alert Overlay */}
      <ToastContainer />
    </div>
  );
}
