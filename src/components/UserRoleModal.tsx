import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { User, Store, Shield, RefreshCw, X, Check, Building2, Utensils, Home } from 'lucide-react';
import { BuyerType } from '../types';

interface UserRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserRoleModal: React.FC<UserRoleModalProps> = ({ isOpen, onClose }) => {
  const {
    currentRole,
    currentFarmerId,
    currentBuyerId,
    allFarmers,
    allBuyers,
    loginAsFarmer,
    loginAsBuyer,
    loginAsAdmin,
    resetToSeedData,
    t,
  } = useMarketplace();

  if (!isOpen) return null;

  const getBuyerIcon = (type: BuyerType) => {
    switch (type) {
      case 'restaurant':
        return <Utensils className="w-4 h-4 text-emerald-700" />;
      case 'retailer':
      case 'wholesaler':
        return <Building2 className="w-4 h-4 text-amber-700" />;
      case 'household':
      default:
        return <Home className="w-4 h-4 text-blue-700" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-stone-200 max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div>
            <h3 className="text-lg font-semibold text-stone-900 font-display">Switch Active Role & Persona</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Experience the marketplace from different user perspectives: direct farmer, registered buyer, or moderator.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 transition-colors p-1"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Farmers */}
        <div className="mt-5">
          <div className="flex items-center gap-2 mb-3">
            <Store className="w-4 h-4 text-emerald-700" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700">
              Farmer & Grower Accounts ({allFarmers.length} Local Producers)
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {allFarmers.map(farmer => {
              const isSelected = currentRole === 'farmer' && currentFarmerId === farmer.id;
              return (
                <button
                  key={farmer.id}
                  onClick={() => {
                    loginAsFarmer(farmer.id);
                    onClose();
                  }}
                  className={`text-left p-3 rounded-lg border transition-all flex items-start justify-between ${
                    isSelected
                      ? 'border-emerald-700 bg-emerald-50/50 ring-1 ring-emerald-700'
                      : 'border-stone-200 hover:border-emerald-600 bg-white hover:bg-stone-50/60'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-xs text-stone-900">{farmer.farmName}</div>
                    <div className="text-[11px] text-stone-500 mt-0.5">{farmer.name}</div>
                    <div className="text-[10px] text-stone-500 mt-1 flex items-center gap-1.5">
                      <span>{farmer.location}</span>
                      <span>·</span>
                      <span className="text-emerald-700 font-medium">{farmer.farmingPractices[0]}</span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Buyers */}
        <div className="mt-6 pt-5 border-t border-stone-200">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-stone-700" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700">
              Buyer Accounts (Households, Restaurants, Retailers & Wholesalers)
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {allBuyers.map(buyer => {
              const isSelected = currentRole === 'buyer' && currentBuyerId === buyer.id;
              return (
                <button
                  key={buyer.id}
                  onClick={() => {
                    loginAsBuyer({
                      id: buyer.id,
                      name: buyer.name,
                      phone: buyer.phone,
                      email: buyer.email,
                      deliveryAddress: buyer.deliveryAddress,
                      type: buyer.type,
                      businessName: buyer.businessName,
                    });
                    onClose();
                  }}
                  className={`text-left p-3 rounded-lg border transition-all flex items-start justify-between ${
                    isSelected
                      ? 'border-emerald-700 bg-emerald-50/50 ring-1 ring-emerald-700'
                      : 'border-stone-200 hover:border-emerald-600 bg-white hover:bg-stone-50/60'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5">{getBuyerIcon(buyer.type)}</div>
                    <div>
                      <div className="font-semibold text-xs text-stone-900">{buyer.name}</div>
                      <div className="text-[11px] text-stone-500">{buyer.businessName || buyer.type}</div>
                      <div className="text-[10px] text-stone-400 mt-1 capitalize">
                        Type: {buyer.type} · Destination: {buyer.deliveryAddress.slice(0, 25)}...
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Admin & Reset */}
        <div className="mt-6 pt-5 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              loginAsAdmin();
              onClose();
            }}
            className={`w-full sm:w-auto px-4 py-2 text-xs font-medium rounded-lg border transition-colors flex items-center justify-center gap-2 ${
              currentRole === 'admin'
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Marketplace Admin Moderation Desk
          </button>

          <button
            onClick={() => {
              resetToSeedData();
              onClose();
            }}
            className="w-full sm:w-auto px-3 py-2 text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Initial Demo Data
          </button>
        </div>
      </div>
    </div>
  );
};
