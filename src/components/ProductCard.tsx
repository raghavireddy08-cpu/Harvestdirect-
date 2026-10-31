import React, { useState } from 'react';
import { ProductListing } from '../types';
import { useMarketplace } from '../context/MarketplaceContext';
import { translateProduceName, translateCategoryName, translateUnitName } from '../i18n/translations';
import { Plus, Minus, Check, Store, Truck, Calendar } from 'lucide-react';

interface ProductCardProps {
  product: ProductListing;
  onSelect: (product: ProductListing) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { addToCart, language, t } = useMarketplace();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [fulfillmentChoice, setFulfillmentChoice] = useState<'pickup' | 'delivery'>(
    product.fulfillment === 'delivery' ? 'delivery' : 'pickup'
  );

  const isSoldOut = product.availableQuantity <= 0 || product.status !== 'active';
  const displayName = translateProduceName(product.name, language);
  const displayCategory = translateCategoryName(product.category, language);
  const displayUnit = translateUnitName(product.unit, language);

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity < product.availableQuantity) {
      setQuantity(q => q + 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSoldOut) return;

    const res = addToCart(product, quantity, fulfillmentChoice);
    if (res.success) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1800);
    }
  };

  const formattedHarvest = new Date(product.harvestDate + 'T00:00:00').toLocaleDateString(
    language === 'en' ? 'en-US' : 'en-IN',
    {
      month: 'short',
      day: 'numeric',
    }
  );

  return (
    <div
      onClick={() => onSelect(product)}
      className="group bg-white rounded-xl border border-stone-200/90 hover:border-stone-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Product Image Slot with Fallback */}
      <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden">
        <img
          src={product.photoUrl}
          alt={displayName}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Top Floating Badge for Organic / Flag status */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          {product.isOrganic && (
            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 bg-emerald-800 text-white rounded-sm shadow-xs">
              {t('organicBadge')}
            </span>
          )}
          {product.status === 'flagged' && (
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-amber-600 text-white rounded-sm">
              {t('underReviewBadge')}
            </span>
          )}
        </div>

        {/* Fulfillment indicator at bottom right of image */}
        <div className="absolute bottom-2.5 right-2.5 bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-sm flex items-center gap-1">
          {product.fulfillment === 'pickup' && (
            <>
              <Store className="w-3 h-3 text-emerald-400" />
              <span>{t('farmPickupTag')}</span>
            </>
          )}
          {product.fulfillment === 'delivery' && (
            <>
              <Truck className="w-3 h-3 text-blue-400" />
              <span>{t('localDeliveryTag')}</span>
            </>
          )}
          {product.fulfillment === 'both' && (
            <>
              <Store className="w-3 h-3 text-emerald-400" />
              <span>{t('pickupOrDeliveryTag')}</span>
            </>
          )}
        </div>
      </div>

      {/* Card Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata Line */}
          <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1 flex-wrap">
            <span className="font-medium text-stone-700">{product.farmName}</span>
            <span aria-hidden="true">·</span>
            <span>{displayCategory}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-0.5">
              <Calendar className="w-3 h-3 text-stone-400" />
              {t('harvestedDateLabel')} {formattedHarvest}
            </span>
          </div>

          {/* Product Name */}
          <h3 className="text-base font-semibold text-stone-900 group-hover:text-emerald-800 transition-colors line-clamp-1">
            {displayName}
          </h3>

          <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Stock Area */}
        <div className="mt-4 pt-3 border-t border-stone-100">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-lg font-bold text-stone-900 tabular-nums">
                ₹{product.price.toFixed(2)}
              </span>
              <span className="text-xs text-stone-500 ml-1">/ {displayUnit}</span>
            </div>

            <div className="text-right">
              {isSoldOut ? (
                <span className="text-xs font-semibold text-rose-700">{t('soldOut')}</span>
              ) : product.availableQuantity < 15 ? (
                <span className="text-xs font-semibold text-amber-700 tabular-nums">
                  {t('onlyLeft', { count: product.availableQuantity })} {displayUnit}
                </span>
              ) : (
                <span className="text-xs text-emerald-700 font-medium tabular-nums">
                  {product.availableQuantity} {displayUnit} {t('inStock')}
                </span>
              )}
            </div>
          </div>

          {/* Action Row: Stepper and Add Button */}
          <div className="flex items-center gap-2">
            {!isSoldOut ? (
              <>
                <div
                  className="flex items-center border border-stone-200 rounded-lg bg-stone-50/70 p-0.5"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    onClick={handleDecrement}
                    disabled={quantity <= 1}
                    className="p-1.5 text-stone-600 hover:text-stone-900 disabled:opacity-30 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-7 text-center text-xs font-bold text-stone-900 tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrement}
                    disabled={quantity >= product.availableQuantity}
                    className="p-1.5 text-stone-600 hover:text-stone-900 disabled:opacity-30 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    justAdded
                      ? 'bg-emerald-900 text-white'
                      : 'bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs'
                  }`}
                >
                  {justAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{t('addedSuccess')}</span>
                    </>
                  ) : (
                    <span>{t('addToOrder')}</span>
                  )}
                </button>
              </>
            ) : (
              <button
                disabled
                className="w-full py-2 px-3 text-xs font-medium text-stone-400 bg-stone-100 rounded-lg cursor-not-allowed"
              >
                {t('unavailableBtn')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
