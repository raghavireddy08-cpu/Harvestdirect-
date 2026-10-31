import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { LANGUAGES } from '../i18n/translations';
import {
  ShoppingBag,
  User,
  Store,
  Shield,
  ChevronDown,
  Globe,
  LogOut,
  MapPin,
} from 'lucide-react';
import { UserRoleModal } from './UserRoleModal';

interface NavbarProps {
  currentTab: 'browse' | 'orders' | 'farmer_hub' | 'admin' | 'tests';
  setCurrentTab: (tab: 'browse' | 'orders' | 'farmer_hub' | 'admin' | 'tests') => void;
  onOpenCart: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenCart }) => {
  const {
    currentRole,
    activeFarmer,
    activeBuyer,
    cartCount,
    logout,
    language,
    setLanguage,
    t,
  } = useMarketplace();

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const getPersonaLabel = () => {
    if (currentRole === 'farmer') return activeFarmer.farmName;
    if (currentRole === 'buyer') return activeBuyer.name;
    return 'Admin';
  };

  const getRoleIcon = () => {
    if (currentRole === 'farmer') return <Store className="w-3.5 h-3.5 text-amber-700" />;
    if (currentRole === 'buyer') return <User className="w-3.5 h-3.5 text-emerald-700" />;
    return <Shield className="w-3.5 h-3.5 text-stone-700" />;
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          {/* Zone 1: Brand title, one line wordmark */}
          <button
            onClick={() => setCurrentTab(currentRole === 'farmer' ? 'farmer_hub' : currentRole === 'admin' ? 'admin' : 'browse')}
            className="text-left flex items-center gap-2 group whitespace-nowrap shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-serif text-lg font-bold shadow-xs">
              H
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-stone-900 font-serif">
                {t('appTitle')}
              </span>
              <span className="hidden sm:inline text-xs text-stone-400 ml-2">Marketplace</span>
            </div>
          </button>

          {/* Zone 2: 4-5 single-line navigation links adapted to active role */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-stone-600">
            {currentRole === 'buyer' && (
              <>
                <button
                  onClick={() => setCurrentTab('browse')}
                  className={`transition-colors whitespace-nowrap shrink-0 ${
                    currentTab === 'browse'
                      ? 'text-emerald-800 font-bold border-b-2 border-emerald-800 pb-0.5'
                      : 'hover:text-stone-900'
                  }`}
                >
                  {t('browseProduce')}
                </button>
                <button
                  onClick={() => setCurrentTab('orders')}
                  className={`transition-colors whitespace-nowrap shrink-0 ${
                    currentTab === 'orders'
                      ? 'text-emerald-800 font-bold border-b-2 border-emerald-800 pb-0.5'
                      : 'hover:text-stone-900'
                  }`}
                >
                  {t('myOrders')}
                </button>
              </>
            )}

            {currentRole === 'farmer' && (
              <>
                <button
                  onClick={() => setCurrentTab('farmer_hub')}
                  className={`transition-colors whitespace-nowrap shrink-0 ${
                    currentTab === 'farmer_hub'
                      ? 'text-emerald-800 font-bold border-b-2 border-emerald-800 pb-0.5'
                      : 'hover:text-stone-900'
                  }`}
                >
                  {t('sellProducts')}
                </button>
                <button
                  onClick={() => setCurrentTab('browse')}
                  className={`transition-colors whitespace-nowrap shrink-0 ${
                    currentTab === 'browse'
                      ? 'text-emerald-800 font-bold border-b-2 border-emerald-800 pb-0.5'
                      : 'hover:text-stone-900'
                  }`}
                >
                  {t('browseProduce')}
                </button>
              </>
            )}

            {currentRole === 'admin' && (
              <>
                <button
                  onClick={() => setCurrentTab('admin')}
                  className={`transition-colors whitespace-nowrap shrink-0 ${
                    currentTab === 'admin'
                      ? 'text-emerald-800 font-bold border-b-2 border-emerald-800 pb-0.5'
                      : 'hover:text-stone-900'
                  }`}
                >
                  {t('adminDesk')}
                </button>
                <button
                  onClick={() => setCurrentTab('browse')}
                  className={`transition-colors whitespace-nowrap shrink-0 ${
                    currentTab === 'browse'
                      ? 'text-emerald-800 font-bold border-b-2 border-emerald-800 pb-0.5'
                      : 'hover:text-stone-900'
                  }`}
                >
                  {t('browseProduce')}
                </button>
              </>
            )}

            <button
              onClick={() => setCurrentTab('tests')}
              className={`transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'tests'
                  ? 'text-emerald-800 font-bold border-b-2 border-emerald-800 pb-0.5'
                  : 'hover:text-stone-900'
              }`}
            >
              {t('systemTests')}
            </button>
          </nav>

          {/* Zone 3: Language Selector + Cart + Persona + Logout */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Language Selector */}
            <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-1">
              <Globe className="w-3.5 h-3.5 text-stone-600 ml-1" />
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as any)}
                className="bg-transparent text-xs font-semibold text-stone-800 focus:outline-hidden cursor-pointer pr-1"
                aria-label="Language"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>

            {/* Shopping Bag Trigger (mainly for buyers) */}
            <button
              onClick={onOpenCart}
              className="relative p-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              aria-label={`View shopping cart with ${cartCount} items`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-medium">{t('cart')}</span>
              {cartCount > 0 && (
                <span className="bg-white text-emerald-900 text-[11px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Persona Switcher Trigger */}
            <button
              onClick={() => setIsRoleModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 transition-colors text-xs text-stone-800 whitespace-nowrap shrink-0"
              title="Switch user perspective or farm"
            >
              {getRoleIcon()}
              <span className="hidden sm:inline font-medium max-w-[110px] truncate">{getPersonaLabel()}</span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            </button>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-1.5 rounded-lg border border-stone-200 hover:bg-rose-50 text-stone-500 hover:text-rose-700 transition-colors shrink-0"
              title={t('logout')}
              aria-label="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile secondary navigation strip */}
        <div className="flex md:hidden items-center justify-between px-4 py-2 border-t border-stone-100 text-xs text-stone-600 overflow-x-auto gap-4">
          <button
            onClick={() => setCurrentTab('browse')}
            className={`whitespace-nowrap ${currentTab === 'browse' ? 'text-emerald-800 font-bold' : ''}`}
          >
            {t('browseProduce')}
          </button>
          <button
            onClick={() => setCurrentTab('orders')}
            className={`whitespace-nowrap ${currentTab === 'orders' ? 'text-emerald-800 font-bold' : ''}`}
          >
            {t('myOrders')}
          </button>
          <button
            onClick={() => setCurrentTab('farmer_hub')}
            className={`whitespace-nowrap ${currentTab === 'farmer_hub' ? 'text-emerald-800 font-bold' : ''}`}
          >
            {t('farmerDashboard')}
          </button>
          <button
            onClick={() => setCurrentTab('admin')}
            className={`whitespace-nowrap ${currentTab === 'admin' ? 'text-emerald-800 font-bold' : ''}`}
          >
            {t('adminDesk')}
          </button>
          <button
            onClick={() => setCurrentTab('tests')}
            className={`whitespace-nowrap ${currentTab === 'tests' ? 'text-emerald-800 font-bold' : ''}`}
          >
            {t('systemTests')}
          </button>
        </div>
      </header>

      <UserRoleModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
      />
    </>
  );
};
