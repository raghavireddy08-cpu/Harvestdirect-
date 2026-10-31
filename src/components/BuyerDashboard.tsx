import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { OrderStatus } from '../types';
import {
  Package,
  XCircle,
  MapPin,
  AlertTriangle,
  ShoppingBag,
  Edit2,
} from 'lucide-react';
import { translateProduceName, translateUnitName } from '../i18n/translations';

interface BuyerDashboardProps {
  onBrowseProduce: () => void;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({ onBrowseProduce }) => {
  const {
    activeBuyer,
    orders,
    cancelOrder,
    allFarmers,
    updateBuyerDeliveryAddress,
    language,
    t,
  } = useMarketplace();

  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState('Change of family meal plans');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [newAddressText, setNewAddressText] = useState(activeBuyer.deliveryAddress);

  // Filter orders for active buyer
  const buyerOrders = orders.filter(o => o.buyerId === activeBuyer.id);

  const handleConfirmCancel = (orderId: string) => {
    cancelOrder(orderId, cancellationReason);
    setCancellingOrderId(null);
  };

  const handleSaveAddress = () => {
    if (newAddressText.trim()) {
      updateBuyerDeliveryAddress(newAddressText.trim());
      setIsEditingAddress(false);
    }
  };

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'requested':
        return 0;
      case 'accepted':
        return 1;
      case 'ready':
        return 2;
      case 'completed':
        return 3;
      case 'cancelled':
        return -1;
    }
  };

  const steps = [
    { label: t('statusRequested'), desc: 'Sent to farmer' },
    { label: t('statusAccepted'), desc: 'Harvest confirmed' },
    { label: t('statusReady'), desc: 'Packed for delivery' },
    { label: t('statusCompleted'), desc: 'Delivered to you' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Buyer Header Banner & Noted Delivery Address */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="text-xs text-stone-500 uppercase tracking-wider font-semibold">
            {t('buyerTrackerTitle')}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            {activeBuyer.name}
          </h1>
          <div className="text-xs text-stone-600 flex items-center gap-2 flex-wrap">
            <span className="capitalize font-semibold text-emerald-800">{activeBuyer.type} Buyer</span>
            <span>·</span>
            <span>{t('phoneNumber')}: {activeBuyer.phone}</span>
          </div>

          {/* Prominently Noted Delivery Address */}
          <div className="mt-3 pt-3 border-t border-stone-100 flex items-start gap-2 text-xs">
            <MapPin className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-900">{t('registeredDeliveryAddress')}</span>
                <button
                  onClick={() => setIsEditingAddress(!isEditingAddress)}
                  className="text-[11px] text-emerald-800 font-semibold hover:underline flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>{isEditingAddress ? t('closeAddressBtn') : t('updateAddressBtn')}</span>
                </button>
              </div>

              {isEditingAddress ? (
                <div className="mt-2 space-y-2">
                  <textarea
                    rows={2}
                    value={newAddressText}
                    onChange={e => setNewAddressText(e.target.value)}
                    className="w-full max-w-lg p-2 text-xs border border-stone-300 rounded-lg"
                  />
                  <div>
                    <button
                      onClick={handleSaveAddress}
                      className="px-3 py-1 bg-emerald-800 text-white rounded text-xs font-semibold"
                    >
                      {t('saveAddressBtn')}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-stone-700 mt-0.5 leading-relaxed">
                  {activeBuyer.deliveryAddress}
                </p>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onBrowseProduce}
          className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs shrink-0"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{t('browseProduce')}</span>
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold font-serif text-stone-900">
          {t('yourFarmOrders')} ({buyerOrders.length})
        </h2>

        {buyerOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
            <Package className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="text-base font-semibold text-stone-800">{t('noOrdersYet')}</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              {t('noOrdersDesc')}
            </p>
            <button
              onClick={onBrowseProduce}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:underline"
            >
              {t('exploreCatalogBtn')}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {buyerOrders.map(order => {
              const currentStep = getStepIndex(order.status);
              const isCancelled = order.status === 'cancelled';
              const farmer = allFarmers.find(f => f.id === order.farmerId);

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden"
                >
                  {/* Top order summary bar in ₹ */}
                  <div className="bg-stone-50/80 px-6 py-4 border-b border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-stone-900 text-sm">
                          {t('orderNumber', { id: order.id })}
                        </span>
                        <span className="text-stone-400">·</span>
                        <span className="font-semibold text-stone-700">{order.farmName}</span>
                      </div>
                      <div className="text-stone-500 mt-1">
                        {t('placedOn')}{' '}
                        {new Date(order.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div>
                        <div className="text-stone-500 text-[11px]">{t('totalAmount')}</div>
                        <div className="font-bold text-stone-900 text-base tabular-nums">
                          ₹{order.total.toFixed(2)}
                        </div>
                      </div>

                      {/* Cancel Order Trigger */}
                      {!isCancelled && order.status !== 'completed' && (
                        <button
                          onClick={() => setCancellingOrderId(order.id)}
                          className="px-3 py-1.5 border border-stone-300 hover:border-rose-400 text-stone-600 hover:text-rose-700 text-xs font-medium rounded-lg transition-colors"
                        >
                          {t('cancelOrder')}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Visual Status Progress Stepper */}
                  <div className="px-6 py-6 border-b border-stone-100">
                    {isCancelled ? (
                      <div className="p-3.5 bg-stone-100 rounded-xl border border-stone-200 text-xs flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 text-stone-800">
                          <XCircle className="w-4 h-4 text-stone-500" />
                          <span className="font-semibold">{t('orderCancelledNotice')}</span>
                          <span className="text-stone-600">{order.cancellationReason || 'Cancelled'}</span>
                        </div>
                        <span className="text-emerald-800 text-[11px] font-medium">
                          {t('stockRestoredNotice')}
                        </span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        {steps.map((st, idx) => {
                          const isDone = currentStep >= idx;
                          const isCurrent = currentStep === idx;

                          return (
                            <div key={st.label} className="relative">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                                    isDone
                                      ? 'bg-emerald-800 text-white'
                                      : 'bg-stone-200 text-stone-500'
                                  }`}
                                >
                                  {isDone ? '✓' : idx + 1}
                                </div>
                                <div className="min-w-0">
                                  <div
                                    className={`text-xs font-semibold truncate ${
                                      isCurrent
                                        ? 'text-emerald-900'
                                        : isDone
                                        ? 'text-stone-800'
                                        : 'text-stone-400'
                                    }`}
                                  >
                                    {st.label}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Items table in ₹ */}
                    <div className="md:col-span-7 space-y-3">
                      <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                        {t('orderedProduceItems')}
                      </h4>
                      <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden text-xs">
                        {order.items.map(item => {
                          const localizedName = translateProduceName(item.productName, language);
                          const localizedUnit = translateUnitName(item.unit, language);

                          return (
                            <div
                              key={item.productId}
                              className="p-3 flex items-center justify-between bg-white text-stone-700"
                            >
                              <div>
                                <div className="font-semibold text-stone-900">{localizedName}</div>
                                <div className="text-stone-500 text-[11px] mt-0.5">
                                  {item.quantity} {localizedUnit} @ ₹{item.unitPrice.toFixed(2)} / {localizedUnit}
                                </div>
                              </div>
                              <span className="font-bold text-stone-900 tabular-nums">
                                ₹{item.subtotal.toFixed(2)}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-2 flex justify-between text-xs text-stone-600">
                        <span>{t('deliveryFee')}</span>
                        <span>{order.deliveryFee === 0 ? t('freeDeliveryThreshold') : `₹${order.deliveryFee.toFixed(2)}`}</span>
                      </div>
                    </div>

                    {/* Delivery Destination & Farm Contact */}
                    <div className="md:col-span-5 bg-stone-50/80 p-4 rounded-xl border border-stone-200/80 text-xs space-y-3">
                      <h4 className="font-bold text-stone-900">{t('doorstepDeliveryDetails')}</h4>

                      <div className="space-y-2 text-stone-600">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-stone-900">{t('notedDestinationAddress')}</span>
                            <div className="text-stone-700 mt-0.5 leading-relaxed">
                              {order.buyerContact.deliveryAddress}
                            </div>
                          </div>
                        </div>

                        {order.fulfillmentType === 'pickup' && (
                          <div className="pt-2 border-t border-stone-200 text-stone-500">
                            <span className="font-medium text-stone-800">{t('farmgatePickupAt')}</span>
                            {order.farmerPickupAddress}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-stone-200 space-y-1 text-stone-500 text-[11px]">
                        <div>
                          <span className="font-medium text-stone-700">Payment: </span>
                          <span className="capitalize">{order.paymentMethod.replace(/_/g, ' ')}</span>
                        </div>
                        {farmer && (
                          <div>
                            <span className="font-medium text-stone-700">Farmer: </span>
                            {farmer.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancellation Modal */}
      {cancellingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-stone-200 max-w-md w-full p-6 text-xs space-y-4">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>{t('cancelOrder')} #{cancellingOrderId}?</span>
            </div>
            <p className="text-stone-600 leading-relaxed">
              {t('stockRestoredNotice')}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCancellingOrderId(null)}
                className="px-3 py-1.5 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 font-medium"
              >
                {t('closeAddressBtn')}
              </button>
              <button
                onClick={() => handleConfirmCancel(cancellingOrderId)}
                className="px-4 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-semibold"
              >
                {t('cancelOrder')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
