import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { LANGUAGES } from '../i18n/translations';
import {
  User,
  Store,
  Shield,
  MapPin,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Globe,
  AlertCircle,
  KeyRound,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const {
    loginAsBuyer,
    loginAsFarmer,
    loginAsAdmin,
    allFarmers,
    allBuyers,
    language,
    setLanguage,
    t,
  } = useMarketplace();

  // Active form view: 'buyer' | 'farmer' | 'admin'
  const [selectedRole, setSelectedRole] = useState<'buyer' | 'farmer' | 'admin'>('buyer');

  // 1. BUYER DETAILS (Name, Number, Address, Gmail)
  const [buyerName, setBuyerName] = useState(allBuyers[0]?.name || 'Sravanthi Rao');
  const [buyerPhone, setBuyerPhone] = useState(allBuyers[0]?.phone || '+91 99890 11223');
  const [buyerAddress, setBuyerAddress] = useState(
    allBuyers[0]?.deliveryAddress || 'Flat 402, Sai Teja Residency, Gachibowli, Hyderabad, Telangana 500032'
  );
  const [buyerGmail, setBuyerGmail] = useState(allBuyers[0]?.email || 'sravanthi.rao@gmail.com');
  const [buyerPresetId, setBuyerPresetId] = useState<string>(allBuyers[0]?.id || 'custom');

  // 2. FARMER DETAILS (Name, Number, Address)
  const [farmerName, setFarmerName] = useState(allFarmers[0]?.name || 'Ramesh Reddy');
  const [farmerPhone, setFarmerPhone] = useState(allFarmers[0]?.phone || '+91 98490 12345');
  const [farmerAddress, setFarmerAddress] = useState(
    allFarmers[0]?.pickupAddress || 'Survey No. 42, Main Road, Chevella, Telangana 501503'
  );
  const [farmName, setFarmName] = useState(allFarmers[0]?.farmName || 'Sri Krishna Natural Farms');
  const [farmerPresetId, setFarmerPresetId] = useState<string>(allFarmers[0]?.id || 'custom');

  // 3. ADMIN DETAILS (Password)
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  // Quick preset selector for Buyer
  const handleSelectBuyerPreset = (presetId: string) => {
    setBuyerPresetId(presetId);
    if (presetId === 'custom') {
      setBuyerName('');
      setBuyerPhone('+91 ');
      setBuyerAddress('');
      setBuyerGmail('');
    } else {
      const b = allBuyers.find(item => item.id === presetId);
      if (b) {
        setBuyerName(b.name);
        setBuyerPhone(b.phone);
        setBuyerAddress(b.deliveryAddress);
        setBuyerGmail(b.email);
      }
    }
  };

  // Quick preset selector for Farmer
  const handleSelectFarmerPreset = (presetId: string) => {
    setFarmerPresetId(presetId);
    if (presetId === 'custom') {
      setFarmerName('');
      setFarmerPhone('+91 ');
      setFarmerAddress('');
      setFarmName('');
    } else {
      const f = allFarmers.find(item => item.id === presetId);
      if (f) {
        setFarmerName(f.name);
        setFarmerPhone(f.phone);
        setFarmerAddress(f.pickupAddress);
        setFarmName(f.farmName);
      }
    }
  };

  // Form Submissions
  const handleBuyerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim()) return;
    if (!buyerPhone.trim()) return;
    if (!buyerAddress.trim()) return;
    if (!buyerGmail.trim()) return;

    loginAsBuyer({
      id: buyerPresetId !== 'custom' ? buyerPresetId : undefined,
      name: buyerName.trim(),
      phone: buyerPhone.trim(),
      deliveryAddress: buyerAddress.trim(),
      email: buyerGmail.trim(),
      type: 'household',
    });
  };

  const handleFarmerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmerName.trim()) return;
    if (!farmerPhone.trim()) return;

    loginAsFarmer({
      id: farmerPresetId !== 'custom' ? farmerPresetId : undefined,
      name: farmerName.trim(),
      phone: farmerPhone.trim(),
      farmName: farmName.trim() || `${farmerName.trim()}'s Farm`,
    });
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);

    const res = loginAsAdmin(adminPassword);
    if (!res.success) {
      setAdminError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f6f3] flex flex-col justify-between text-stone-900">
      {/* Top Header Strip with Language Switcher */}
      <header className="bg-white border-b border-stone-200 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-serif text-lg font-bold shadow-xs">
            H
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-stone-900 font-serif">
              {t('appTitle')}
            </span>
            <span className="hidden sm:inline text-xs text-stone-500 ml-2">
              · {t('appSubtitle')}
            </span>
          </div>
        </div>

        {/* Global Language Selector Dropdown */}
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-800" />
          <span className="text-xs text-stone-500 hidden sm:inline">{t('selectLanguage')}:</span>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value as any)}
            className="text-xs font-semibold bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-emerald-700 text-stone-800 cursor-pointer"
            aria-label="Change Language"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.nativeName} ({lang.name})
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Main Login Card Body */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col justify-center">
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-2xl sm:text-4xl font-bold font-serif text-stone-900">
            {t('loginTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto">
            {t('loginSubtitle')}
          </p>
        </div>

        {/* Role Selector 3 Buttons */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-stone-200/80 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setSelectedRole('buyer')}
            className={`py-3 px-3 rounded-lg text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-2 ${
              selectedRole === 'buyer'
                ? 'bg-white text-emerald-900 shadow-sm ring-1 ring-stone-300'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <User className="w-4 h-4 text-emerald-700" />
            <span>{t('buyer')}</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole('farmer')}
            className={`py-3 px-3 rounded-lg text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-2 ${
              selectedRole === 'farmer'
                ? 'bg-white text-emerald-900 shadow-sm ring-1 ring-stone-300'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Store className="w-4 h-4 text-amber-700" />
            <span>{t('farmer')}</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole('admin')}
            className={`py-3 px-3 rounded-lg text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-2 ${
              selectedRole === 'admin'
                ? 'bg-white text-emerald-900 shadow-sm ring-1 ring-stone-300'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Shield className="w-4 h-4 text-stone-700" />
            <span>{t('admin')}</span>
          </button>
        </div>

        {/* Dynamic Form based on Selected Role */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-md p-6 sm:p-8">
          {/* ======================================================== */}
          {/* 1. BUYER LOGIN: Asks Name, Number, Address, Gmail        */}
          {/* ======================================================== */}
          {selectedRole === 'buyer' && (
            <form onSubmit={handleBuyerSubmit} className="space-y-5 text-xs">
              <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-stone-900 font-serif flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-800" />
                    <span>{t('buyerAccountDetails')}</span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {t('buyerAccountSubtitle')}
                  </p>
                </div>
              </div>

              {/* Quick sample persona fill */}
              <div>
                <label className="text-[11px] font-semibold text-stone-500 block mb-1">
                  {t('quickLoadDemoBuyer')}
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {allBuyers.map(b => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleSelectBuyerPreset(b.id)}
                      className={`px-2.5 py-1 rounded-md text-[11px] border transition-colors ${
                        buyerPresetId === b.id
                          ? 'bg-emerald-800 text-white border-emerald-800 font-semibold'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {b.name} ({b.type})
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleSelectBuyerPreset('custom')}
                    className={`px-2.5 py-1 rounded-md text-[11px] border transition-colors ${
                      buyerPresetId === 'custom'
                        ? 'bg-emerald-800 text-white border-emerald-800 font-semibold'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {t('enterNewDetails')}
                  </button>
                </div>
              </div>

              {/* 1. NAME */}
              <div>
                <label className="font-bold text-stone-800 block mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-stone-600" />
                  <span>{t('fullName')} <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={e => setBuyerName(e.target.value)}
                  placeholder="e.g. Sravanthi Rao"
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-700 text-xs bg-stone-50/30"
                />
              </div>

              {/* 2. NUMBER & 3. GMAIL in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 2. NUMBER */}
                <div>
                  <label className="font-bold text-stone-800 block mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-stone-600" />
                    <span>{t('phoneNumber')} <span className="text-rose-500">*</span></span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={buyerPhone}
                    onChange={e => setBuyerPhone(e.target.value)}
                    placeholder="+91 99890 11223"
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-700 text-xs tabular-nums bg-stone-50/30"
                  />
                </div>

                {/* 3. GMAIL */}
                <div>
                  <label className="font-bold text-stone-800 block mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-stone-600" />
                    <span>{t('gmailAddress')} <span className="text-rose-500">*</span></span>
                  </label>
                  <input
                    type="email"
                    required
                    value={buyerGmail}
                    onChange={e => setBuyerGmail(e.target.value)}
                    placeholder="e.g. sravanthi.rao@gmail.com"
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-700 text-xs bg-stone-50/30"
                  />
                </div>
              </div>

              {/* 4. ADDRESS */}
              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-1.5">
                <label className="font-bold text-emerald-950 block flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-800" />
                  <span>{t('doorstepDeliveryAddress')} <span className="text-rose-600">*</span></span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={buyerAddress}
                  onChange={e => setBuyerAddress(e.target.value)}
                  placeholder="Enter complete house/flat number, building name, street, area, city, pincode..."
                  className="w-full p-2.5 rounded-lg border border-emerald-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-700 text-xs"
                />
                <p className="text-[11px] text-emerald-800">
                  {t('deliveryAddressNote')}
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-sm transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t('continueAsBuyer')}</span>
              </button>
            </form>
          )}

          {/* ======================================================== */}
          {/* 2. FARMER LOGIN: Asks Name, Number, Address               */}
          {/* ======================================================== */}
          {selectedRole === 'farmer' && (
            <form onSubmit={handleFarmerSubmit} className="space-y-5 text-xs">
              <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-stone-900 font-serif flex items-center gap-2">
                    <Store className="w-4 h-4 text-amber-800" />
                    <span>{t('farmerAccountDetails')}</span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {t('farmerAccountSubtitle')}
                  </p>
                </div>
              </div>

              {/* Quick sample farmer fill */}
              <div>
                <label className="text-[11px] font-semibold text-stone-500 block mb-1">
                  {t('quickLoadDemoFarmer')}
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {allFarmers.map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => handleSelectFarmerPreset(f.id)}
                      className={`px-2.5 py-1 rounded-md text-[11px] border transition-colors ${
                        farmerPresetId === f.id
                          ? 'bg-amber-800 text-white border-amber-800 font-semibold'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {f.name} ({f.farmName})
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleSelectFarmerPreset('custom')}
                    className={`px-2.5 py-1 rounded-md text-[11px] border transition-colors ${
                      farmerPresetId === 'custom'
                        ? 'bg-amber-800 text-white border-amber-800 font-semibold'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {t('enterNewFarmer')}
                  </button>
                </div>
              </div>

              {/* 1. FARMER NAME & FARM NAME */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-stone-800 block mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-stone-600" />
                    <span>{t('farmerName')} <span className="text-rose-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    required
                    value={farmerName}
                    onChange={e => setFarmerName(e.target.value)}
                    placeholder="e.g. Ramesh Reddy"
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-700 text-xs bg-stone-50/30"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-800 block mb-1 flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-stone-600" />
                    <span>{t('farmBrandName')}</span>
                  </label>
                  <input
                    type="text"
                    value={farmName}
                    onChange={e => setFarmName(e.target.value)}
                    placeholder="e.g. Sri Krishna Natural Farms"
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-700 text-xs bg-stone-50/30"
                  />
                </div>
              </div>

              {/* 2. NUMBER */}
              <div>
                <label className="font-bold text-stone-800 block mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-stone-600" />
                  <span>{t('phoneNumber')} <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="tel"
                  required
                  value={farmerPhone}
                  onChange={e => setFarmerPhone(e.target.value)}
                  placeholder="+91 98490 12345"
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-700 text-xs tabular-nums bg-stone-50/30"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded-xl text-sm transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t('continueAsFarmer')}</span>
              </button>
            </form>
          )}

          {/* ======================================================== */}
          {/* 3. ADMIN LOGIN: Asks Password                           */}
          {/* ======================================================== */}
          {selectedRole === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-5 text-xs">
              <div className="border-b border-stone-100 pb-3">
                <h2 className="text-base font-bold text-stone-900 font-serif flex items-center gap-2">
                  <Shield className="w-4 h-4 text-stone-800" />
                  <span>{t('adminSecurityAuth')}</span>
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  {t('adminSecuritySubtitle')}
                </p>
              </div>

              {adminError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{adminError}</span>
                </div>
              )}

              {/* Password Field */}
              <div>
                <label className="font-bold text-stone-800 block mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-stone-700" />
                  <span>{t('adminPassword')} <span className="text-rose-500">*</span></span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    placeholder={t('adminPassPlaceholder')}
                    className="w-full p-2.5 pr-10 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-stone-800 text-xs bg-stone-50/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Demo Hint */}
              <div className="p-3 bg-stone-100 rounded-lg border border-stone-200 text-stone-600 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-3.5 h-3.5 text-stone-500" />
                  <span>{t('demoPasskeyHint')} <strong className="font-mono text-stone-900">admin123</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => setAdminPassword('admin123')}
                  className="text-stone-800 font-semibold hover:underline text-[11px]"
                >
                  {t('autoFillBtn')}
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-sm transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t('authorizeAdminBtn')}</span>
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 border-t border-stone-200 text-[11px] text-stone-500">
        {t('footerPlatformInfo')}
      </footer>
    </div>
  );
};
