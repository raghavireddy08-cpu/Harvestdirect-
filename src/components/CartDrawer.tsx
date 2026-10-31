import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  Banknote,
  FileText,
  MapPin,
  Edit2,
} from 'lucide-react';
import { CartItem } from '../types';
import { translateProduceName, translateUnitName } from '../i18n/translations';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (orderIds: string[]) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onOrderSuccess }) => {
  const {
    cart,
    products,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    placeOrder,
    activeBuyer,
    allFarmers,
    updateBuyerDeliveryAddress,
    language,
    t,
  } = useMarketplace();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_pickup' | 'simulated_card' | 'invoice_on_delivery'>('cash_on_pickup');
  const [buyerNotes, setBuyerNotes] = useState('');
  const [customDeliveryAddress, setCustomDeliveryAddress] = useState(activeBuyer.deliveryAddress);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [fulfillmentChoices, setFulfillmentChoices] = useState<Record<string, 'pickup' | 'delivery'>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Group items by farm
  const itemsByFarmer: Record<string, CartItem[]> = {};
  cart.forEach(item => {
    const fId = item.product.farmerId;
    if (!itemsByFarmer[fId]) itemsByFarmer[fId] = [];
    itemsByFarmer[fId].push(item);
  });

  const farmerIds = Object.keys(itemsByFarmer);

  // Delivery fee logic: Free delivery over ₹500
  let aggregateDeliveryFee = 0;
  farmerIds.forEach(fId => {
    const farmerItems = itemsByFarmer[fId];
    const farmerSubtotal = farmerItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const hasDelivery = farmerItems.some(item => {
      const choice = fulfillmentChoices[item.product.id] || item.fulfillmentChoice;
      return choice === 'delivery';
    });

    if (hasDelivery) {
      if (farmerSubtotal < 500) {
        aggregateDeliveryFee += farmerItems[0].product.deliveryFee || 50;
      }
    }
  });

  const finalTotal = cartTotal + aggregateDeliveryFee;

  const handleFulfillmentToggle = (productId: string, choice: 'pickup' | 'delivery') => {
    setFulfillmentChoices(prev => ({
      ...prev,
      [productId]: choice,
    }));
  };

  const handleSaveAddress = () => {
    if (customDeliveryAddress.trim()) {
      updateBuyerDeliveryAddress(customDeliveryAddress.trim());
      setIsEditingAddress(false);
    }
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const addressToUse = customDeliveryAddress.trim() || activeBuyer.deliveryAddress;
    if (!addressToUse) {
      setErrorMessage(t('doorstepDeliveryAddress'));
      setIsSubmitting(false);
      return;
    }

    try {
      const res = placeOrder({
        paymentMethod,
        buyerNotes: buyerNotes.trim(),
        fulfillmentChoices,
        deliveryAddress: addressToUse,
      });

      if (res.success) {
        setIsCheckingOut(false);
        onClose();
        onOrderSuccess(res.orderIds);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during order request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col justify-between">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-800" />
            <h2 className="text-lg font-serif font-bold text-stone-900">{t('yourBag')}</h2>
            <span className="text-xs text-stone-500 font-medium">
              ({t('itemsCount', { count: cart.length })})
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 transition-colors p-1"
            aria-label="Close cart drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Delivery Destination Reminder Banner */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-800" />
                <span>{t('notedDestinationTitle')}</span>
              </span>
              <button
                type="button"
                onClick={() => setIsEditingAddress(!isEditingAddress)}
                className="text-[11px] font-semibold text-emerald-800 hover:underline flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                <span>{isEditingAddress ? t('doneAddressBtn') : t('changeAddressBtn')}</span>
              </button>
            </div>

            {isEditingAddress ? (
              <div className="space-y-1.5 pt-1">
                <textarea
                  rows={2}
                  value={customDeliveryAddress}
                  onChange={e => setCustomDeliveryAddress(e.target.value)}
                  className="w-full p-2 border border-emerald-300 rounded-lg bg-white text-xs"
                  placeholder={t('doorstepDeliveryAddress')}
                />
                <button
                  type="button"
                  onClick={handleSaveAddress}
                  className="px-2.5 py-1 bg-emerald-800 text-white rounded text-[11px] font-medium"
                >
                  {t('saveAddressBtn')}
                </button>
              </div>
            ) : (
              <p className="text-stone-700 leading-relaxed font-medium">
                {activeBuyer.deliveryAddress || 'No address set.'}
              </p>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-stone-700">{t('emptyBagTitle')}</p>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                {t('emptyBagDesc')}
              </p>
              <button
                onClick={onClose}
                className="mt-2 text-xs font-semibold text-emerald-800 hover:underline"
              >
                {t('exploreCatalogBtn')}
              </button>
            </div>
          ) : !isCheckingOut ? (
            <div className="space-y-6">
              {farmerIds.map(fId => {
                const farmerItems = itemsByFarmer[fId];
                const farm = allFarmers.find(f => f.id === fId);
                const farmSubtotal = farmerItems.reduce(
                  (sum, item) => sum + item.product.price * item.quantity,
                  0
                );

                return (
                  <div
                    key={fId}
                    className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-xs"
                  >
                    {/* Farm header */}
                    <div className="bg-stone-50/80 px-4 py-2.5 border-b border-stone-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-stone-900">{farm?.farmName || farmerItems[0].product.farmName}</span>
                        <span className="text-stone-500 ml-1.5">({farm?.location || 'Local'})</span>
                      </div>
                      <div className="font-semibold text-stone-800 tabular-nums">
                        {t('subtotal')} ₹{farmSubtotal.toFixed(2)}
                      </div>
                    </div>

                    {/* Farm items */}
                    <div className="divide-y divide-stone-100 p-3">
                      {farmerItems.map(item => {
                        const currentStock = products.find(p => p.id === item.product.id)?.availableQuantity || 0;
                        const isAtStockLimit = item.quantity >= currentStock;
                        const choice = fulfillmentChoices[item.product.id] || item.fulfillmentChoice;
                        const localizedName = translateProduceName(item.product.name, language);
                        const localizedUnit = translateUnitName(item.product.unit, language);

                        return (
                          <div key={item.product.id} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3">
                            <img
                              src={item.product.photoUrl}
                              alt={localizedName}
                              className="w-14 h-14 object-cover rounded-lg bg-stone-100 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="text-xs font-semibold text-stone-900 truncate">
                                  {localizedName}
                                </h4>
                                <button
                                  onClick={() => removeFromCart(item.product.id)}
                                  className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                                  title="Remove from cart"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="text-xs text-stone-500 mt-0.5">
                                ₹{item.product.price.toFixed(2)} / {localizedUnit}
                              </div>

                              {/* Fulfillment choice per item */}
                              {item.product.fulfillment === 'both' && (
                                <div className="mt-1.5 flex items-center gap-2 text-[11px]">
                                  <button
                                    onClick={() => handleFulfillmentToggle(item.product.id, 'delivery')}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                                      choice === 'delivery'
                                        ? 'bg-emerald-100 text-emerald-900 font-semibold'
                                        : 'text-stone-500 hover:bg-stone-100'
                                    }`}
                                  >
                                    {t('localDeliveryTag')}
                                  </button>
                                  <button
                                    onClick={() => handleFulfillmentToggle(item.product.id, 'pickup')}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                                      choice === 'pickup'
                                        ? 'bg-amber-100 text-amber-900 font-semibold'
                                        : 'text-stone-500 hover:bg-stone-100'
                                    }`}
                                  >
                                    {t('farmPickupTag')}
                                  </button>
                                </div>
                              )}

                              {/* Stepper & Subtotal */}
                              <div className="flex items-center justify-between mt-2 pt-1">
                                <div className="flex items-center border border-stone-200 rounded-md bg-stone-50">
                                  <button
                                    onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                                    className="p-1 text-stone-600 hover:text-stone-900"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="w-8 text-center text-xs font-semibold tabular-nums">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                                    disabled={isAtStockLimit}
                                    className="p-1 text-stone-600 hover:text-stone-900 disabled:opacity-20"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>

                                <span className="text-xs font-bold text-stone-900 tabular-nums">
                                  ₹{(item.product.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              <div className="flex justify-end">
                <button
                  onClick={clearCart}
                  className="text-xs text-stone-500 hover:text-rose-600 transition-colors"
                >
                  {t('clearAllItems')}
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form View */
            <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <h3 className="text-sm font-bold text-stone-900">{t('doorstepDeliveryDetails')}</h3>
                <button
                  type="button"
                  onClick={() => setIsCheckingOut(false)}
                  className="text-xs text-emerald-800 hover:underline"
                >
                  ← {t('yourBag')}
                </button>
              </div>

              {/* Delivery Address Summary */}
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-800" />
                    <span>{t('doorstepDeliveryAddress')}:</span>
                  </span>
                  <span className="text-emerald-800 font-semibold capitalize">{activeBuyer.type}</span>
                </div>
                <div className="font-semibold text-stone-900">{activeBuyer.name} ({activeBuyer.phone})</div>
                <div className="text-stone-700">{customDeliveryAddress || activeBuyer.deliveryAddress}</div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-800 block">
                  {t('disclaimerSimulated')}
                </label>
                <div className="space-y-2">
                  <label
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      paymentMethod === 'cash_on_pickup'
                        ? 'border-emerald-700 bg-emerald-50/50'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_pickup"
                      checked={paymentMethod === 'cash_on_pickup'}
                      onChange={() => setPaymentMethod('cash_on_pickup')}
                      className="mt-0.5 text-emerald-700 focus:ring-emerald-600"
                    />
                    <div className="text-xs">
                      <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                        <Banknote className="w-3.5 h-3.5 text-emerald-700" />
                        Cash on Delivery (COD) / UPI on Handoff
                      </div>
                      <div className="text-stone-500 mt-0.5">
                        Pay the delivery partner directly via UPI scanner or Cash upon inspecting produce.
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      paymentMethod === 'simulated_card'
                        ? 'border-emerald-700 bg-emerald-50/50'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="simulated_card"
                      checked={paymentMethod === 'simulated_card'}
                      onChange={() => setPaymentMethod('simulated_card')}
                      className="mt-0.5 text-emerald-700 focus:ring-emerald-600"
                    />
                    <div className="text-xs">
                      <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-stone-700" />
                        Simulated Instant Online Pay (Demo UPI / NetBanking)
                      </div>
                      <div className="text-stone-500 mt-0.5">
                        Demo instant authorization without entering real bank credentials.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Special notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">
                  {t('deliveryAddressNote')}
                </label>
                <textarea
                  value={buyerNotes}
                  onChange={e => setBuyerNotes(e.target.value)}
                  placeholder="e.g. Near Apollo pharmacy, leave with watchman, or call on arrival..."
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </form>
          )}
        </div>

        {/* Drawer Footer */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-stone-200 bg-stone-50/60 space-y-3">
            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>{t('subtotal')}</span>
                <span className="font-semibold text-stone-900 tabular-nums">
                  ₹{cartTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t('deliveryFee')}</span>
                <span className="font-semibold text-stone-900 tabular-nums">
                  {aggregateDeliveryFee === 0 ? t('freeDeliveryThreshold') : `₹${aggregateDeliveryFee.toFixed(2)}`}
                </span>
              </div>
              <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-bold text-stone-900">
                <span>{t('totalDue')}</span>
                <span className="tabular-nums font-serif text-base text-emerald-950">
                  ₹{finalTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {!isCheckingOut ? (
              <button
                onClick={() => setIsCheckingOut(true)}
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <span>{t('proceedToOrder')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Reserving Produce Stock...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t('confirmOrder')} (₹{finalTotal.toFixed(2)})</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
