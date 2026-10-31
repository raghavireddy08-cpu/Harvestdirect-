import React, { useState } from 'react';
import { ProductListing } from '../types';
import { useMarketplace } from '../context/MarketplaceContext';
import { translateProduceName, translateCategoryName, translateUnitName } from '../i18n/translations';
import {
  X,
  Calendar,
  Store,
  Truck,
  MapPin,
  Clock,
  Plus,
  Minus,
  Check,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: ProductListing | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { allFarmers, addToCart, language, t } = useMarketplace();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [fulfillmentChoice, setFulfillmentChoice] = useState<'pickup' | 'delivery'>(
    product?.fulfillment === 'delivery' ? 'delivery' : 'pickup'
  );

  if (!product) return null;

  const farmer = allFarmers.find(f => f.id === product.farmerId);
  const isSoldOut = product.availableQuantity <= 0 || product.status !== 'active';
  const displayName = translateProduceName(product.name, language);
  const displayCategory = translateCategoryName(product.category, language);
  const displayUnit = translateUnitName(product.unit, language);

  const handleIncrement = () => {
    if (quantity < product.availableQuantity) {
      setQuantity(q => q + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  const handleAddToCart = () => {
    if (isSoldOut) return;
    const res = addToCart(product, quantity, fulfillmentChoice);
    if (res.success) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    }
  };

  const formattedHarvest = new Date(product.harvestDate + 'T00:00:00').toLocaleDateString(
    language === 'en' ? 'en-US' : 'en-IN',
    {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-3xl w-full overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="font-semibold text-stone-800">{product.farmName}</span>
            <span aria-hidden="true">·</span>
            <span>{displayCategory}</span>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 transition-colors p-1"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* Left Column: Image and Produce Details */}
          <div>
            <div className="aspect-4/3 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 relative mb-4">
              <img
                src={product.photoUrl}
                alt={displayName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {product.isOrganic && (
                <div className="absolute top-3 left-3 bg-emerald-800 text-white text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded shadow-xs">
                  {t('organicBadge')}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-stone-900 font-serif leading-snug">
                {displayName}
              </h2>
              <p className="text-sm text-stone-600 leading-relaxed">
                {product.description}
              </p>

              {/* Harvest Transparency Block */}
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-stone-700">
                  <span className="flex items-center gap-1.5 font-medium text-stone-900">
                    <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                    {t('harvestTransparency')}
                  </span>
                  <span className="font-semibold">{formattedHarvest}</span>
                </div>
                <div className="flex items-center justify-between text-stone-700">
                  <span className="flex items-center gap-1.5 font-medium text-stone-900">
                    <Clock className="w-3.5 h-3.5 text-emerald-700" />
                    {t('availabilityWindow')}
                  </span>
                  <span>{product.availabilityWindow}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Grower Profile & Contiguous Purchase Module */}
          <div className="flex flex-col justify-between space-y-6">
            {/* Farmer Card */}
            {farmer && (
              <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100 text-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-stone-900">{farmer.farmName}</h3>
                    <div className="text-stone-600 mt-0.5">{farmer.name}</div>
                  </div>
                  <div className="text-right text-stone-500">
                    <div className="font-medium text-emerald-800 tabular-nums">★ {farmer.rating.toFixed(1)}</div>
                    <div className="text-[10px]">{farmer.reviewsCount} verified orders</div>
                  </div>
                </div>

                <p className="text-stone-600 leading-relaxed text-[11px]">{farmer.bio}</p>

                <div className="pt-2 border-t border-emerald-200/50 space-y-1.5 text-[11px] text-stone-600">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-stone-800">{t('farmgatePickupAt')}</span>
                      {farmer.pickupAddress} ({farmer.pickupHours})
                    </div>
                  </div>
                  {farmer.supportsDelivery && (
                    <div className="flex items-start gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-stone-800">{t('deliveryRouteAt')}</span>
                        {farmer.deliveryTerms}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Purchase Module */}
            <div className="p-5 bg-stone-50 rounded-xl border border-stone-200 space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-xs text-stone-500 font-medium">{t('directFarmPrice')}</div>
                  <div className="text-2xl font-bold text-stone-900 tabular-nums">
                    ₹{product.price.toFixed(2)}
                    <span className="text-sm font-normal text-stone-500 ml-1">/ {displayUnit}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-stone-500 font-medium">{t('availableStock')}</div>
                  <div className="text-sm font-bold text-emerald-800 tabular-nums">
                    {product.availableQuantity} {displayUnit}
                  </div>
                </div>
              </div>

              {/* Fulfillment choice selector */}
              {product.fulfillment === 'both' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 block">
                    {t('selectFulfillment')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFulfillmentChoice('pickup')}
                      className={`p-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                        fulfillmentChoice === 'pickup'
                          ? 'border-emerald-700 bg-white text-emerald-900 ring-1 ring-emerald-700'
                          : 'border-stone-200 bg-stone-100 text-stone-600 hover:bg-stone-200/60'
                      }`}
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>{t('farmPickupTag')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFulfillmentChoice('delivery')}
                      className={`p-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                        fulfillmentChoice === 'delivery'
                          ? 'border-emerald-700 bg-white text-emerald-900 ring-1 ring-emerald-700'
                          : 'border-stone-200 bg-stone-100 text-stone-600 hover:bg-stone-200/60'
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>{t('localDeliveryTag')}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Quantity selector & Add to cart */}
              {!isSoldOut ? (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-700">{t('orderQuantity')}</span>
                    <div className="flex items-center border border-stone-300 rounded-lg bg-white p-1">
                      <button
                        onClick={handleDecrement}
                        disabled={quantity <= 1}
                        className="p-1 text-stone-600 hover:text-stone-900 disabled:opacity-30"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center text-sm font-bold text-stone-900 tabular-nums">
                        {quantity}
                      </span>
                      <button
                        onClick={handleIncrement}
                        disabled={quantity >= product.availableQuantity}
                        className="p-1 text-stone-600 hover:text-stone-900 disabled:opacity-30"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-stone-600 pt-1">
                    <span>{t('estimatedSubtotal')}</span>
                    <span className="font-bold text-stone-900 tabular-nums text-sm">
                      ₹{(product.price * quantity).toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className={`w-full py-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                      justAdded
                        ? 'bg-emerald-900 text-white'
                        : 'bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs'
                    }`}
                  >
                    {justAdded ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{t('addedSuccess')}</span>
                      </>
                    ) : (
                      <span>
                        {t('addToCartBtn')} ({quantity} {displayUnit})
                      </span>
                    )}
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-stone-100 text-center text-xs text-stone-500 rounded-lg">
                  {t('unavailableBtn')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
