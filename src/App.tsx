import React, { useState, useEffect } from 'react';
import { MarketplaceProvider, useMarketplace } from './context/MarketplaceContext';
import { Navbar } from './components/Navbar';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { HeroSection } from './components/HeroSection';
import { ProductCatalog } from './components/ProductCatalog';
import { CartDrawer } from './components/CartDrawer';
import { FarmerDashboard } from './components/FarmerDashboard';
import { BuyerDashboard } from './components/BuyerDashboard';
import { AdminModerationView } from './components/AdminModerationView';
import { AutomatedTestsView } from './components/AutomatedTestsView';
import { LoginPage } from './components/LoginPage';
import { Toast } from './components/Toast';
import { ShieldCheck } from 'lucide-react';

function MarketplaceApp() {
  const { isLoggedIn, currentRole, allFarmers, products, t } = useMarketplace();

  // Set initial tab based on role
  const [currentTab, setCurrentTab] = useState<'browse' | 'orders' | 'farmer_hub' | 'admin' | 'tests'>(() => {
    if (currentRole === 'farmer') return 'farmer_hub';
    if (currentRole === 'admin') return 'admin';
    return 'browse';
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // When role changes (e.g. after login), update view tab accordingly
  useEffect(() => {
    if (currentRole === 'farmer') {
      setCurrentTab('farmer_hub');
    } else if (currentRole === 'admin') {
      setCurrentTab('admin');
    } else {
      setCurrentTab('browse');
    }
  }, [currentRole, isLoggedIn]);

  const handleOrderSuccess = (orderIds: string[]) => {
    setCurrentTab('orders');
  };

  const handleExploreClick = () => {
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      setCurrentTab('browse');
    }
  };

  // If user is not logged in, show dedicated Login Page first
  if (!isLoggedIn) {
    return (
      <>
        <LoginPage />
        <Toast />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfbf9] text-stone-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Prototype delivery disclaimer banner */}
      <DisclaimerBanner />

      {/* Main 3-zone Top Bar Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Main Tab Content based on Role */}
      <main className="flex-1">
        {currentTab === 'browse' && (
          <div>
            <HeroSection
              onExploreClick={handleExploreClick}
              farmCount={allFarmers.length}
              productCount={products.filter(p => p.status === 'active').length}
            />
            <ProductCatalog />
          </div>
        )}

        {currentTab === 'orders' && (
          <BuyerDashboard onBrowseProduce={() => setCurrentTab('browse')} />
        )}

        {currentTab === 'farmer_hub' && <FarmerDashboard />}

        {currentTab === 'admin' && <AdminModerationView />}

        {currentTab === 'tests' && <AutomatedTestsView />}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Toast Notification Container */}
      <Toast />

      {/* Clean editorial footer */}
      <footer className="mt-16 bg-stone-950 text-stone-400 border-t border-stone-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-stone-800/80">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-emerald-700 text-white flex items-center justify-center font-serif text-sm font-bold">
                  H
                </div>
                <span className="text-sm font-bold font-serif text-stone-100">{t('appTitle')}</span>
              </div>
              <p className="text-stone-400 text-xs leading-relaxed">
                Direct farm produce network connecting local growers directly with households, chefs, and retailers with transparent pricing in Indian Rupees (₹).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-stone-200 text-xs mb-3 uppercase tracking-wider">
                Marketplace Links
              </h4>
              <ul className="space-y-2 text-stone-400">
                <li>
                  <button onClick={() => setCurrentTab('browse')} className="hover:text-stone-100 transition-colors">
                    {t('browseProduce')}
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentTab('orders')} className="hover:text-stone-100 transition-colors">
                    {t('myOrders')}
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentTab('farmer_hub')} className="hover:text-stone-100 transition-colors">
                    {t('farmerDashboard')}
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentTab('admin')} className="hover:text-stone-100 transition-colors">
                    {t('adminDesk')}
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-stone-200 text-xs mb-3 uppercase tracking-wider">
                Registered Family Farms
              </h4>
              <ul className="space-y-1.5 text-stone-400">
                {allFarmers.map(f => (
                  <li key={f.id} className="truncate">
                    <span className="text-stone-300 font-medium">{f.farmName}</span>
                    <span className="text-stone-500 text-[11px] ml-1">({f.location.split(',')[0]})</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-stone-200 text-xs mb-3 uppercase tracking-wider">
                Languages & Tests
              </h4>
              <p className="text-stone-400 text-xs leading-relaxed">
                Available in English, తెలుగు (Telugu), हिन्दी (Hindi), ಕನ್ನಡ (Kannada), and தமிழ் (Tamil).
              </p>
              <div className="mt-3">
                <button
                  onClick={() => setCurrentTab('tests')}
                  className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t('systemTests')}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-500 text-[11px]">
            <div>© {new Date().getFullYear()} HarvestDirect Marketplace. Farmgate Direct Network.</div>
            <div className="flex items-center gap-4">
              <span>Prices in Indian Rupees (₹)</span>
              <span>·</span>
              <span>100% Direct Farmer Pricing</span>
              <span>·</span>
              <span>Doorstep Delivery Address Verification</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <MarketplaceProvider>
      <MarketplaceApp />
    </MarketplaceProvider>
  );
}
