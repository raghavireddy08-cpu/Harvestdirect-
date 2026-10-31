import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { OrderStatus, ProductListing } from '../types';
import {
  Store,
  Plus,
  Package,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Edit2,
  Eye,
  EyeOff,
  User,
  MapPin,
  Sparkles,
  ShoppingBag,
  Check,
} from 'lucide-react';
import { NewListingModal } from './NewListingModal';
import { translateProduceName, translateCategoryName, translateUnitName } from '../i18n/translations';
import {
  TOMATOES_IMAGE_URL,
  GREENS_IMAGE_URL,
  CARROT_IMAGE_URL,
  POTATO_IMAGE_URL,
  ONION_IMAGE_URL,
  LEMON_IMAGE_URL,
} from '../data/mockData';

export const FarmerDashboard: React.FC = () => {
  const {
    activeFarmer,
    products,
    orders,
    updateListing,
    toggleListingStatus,
    updateOrderStatus,
    cancelOrder,
    addListing,
    language,
    t,
  } = useMarketplace();

  // User requested: "in farmer change the dashboard to sell the products"
  // Default to 'selling' tab so farmer directly manages and lists products for sale
  const [activeTab, setActiveTab] = useState<'selling' | 'orders'>('selling');
  const [orderFilter, setOrderFilter] = useState<OrderStatus | 'all'>('all');
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [newPriceValue, setNewPriceValue] = useState('');
  const [quickAddedCrop, setQuickAddedCrop] = useState<string | null>(null);

  // Filter products and orders belonging to this active farmer
  const farmerProducts = products.filter(p => p.farmerId === activeFarmer.id);
  const farmerOrders = orders.filter(o => o.farmerId === activeFarmer.id);

  // Sales metrics in ₹
  const completedOrders = farmerOrders.filter(o => o.status === 'completed');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.subtotal, 0);

  const pendingOrders = farmerOrders.filter(
    o => o.status === 'requested' || o.status === 'accepted' || o.status === 'ready'
  );
  const pendingValue = pendingOrders.reduce((sum, o) => sum + o.subtotal, 0);

  const unitsSold = completedOrders.reduce((totalUnits, o) => {
    return totalUnits + o.items.reduce((s, item) => s + item.quantity, 0);
  }, 0);

  const filteredOrders = farmerOrders.filter(o => {
    if (orderFilter === 'all') return true;
    return o.status === orderFilter;
  });

  const handleStockAdjust = (product: ProductListing, delta: number) => {
    const updatedQty = Math.max(0, product.availableQuantity + delta);
    updateListing(product.id, { availableQuantity: updatedQty });
  };

  const handleSavePrice = (productId: string) => {
    const val = parseFloat(newPriceValue);
    if (!isNaN(val) && val > 0) {
      updateListing(productId, { price: val });
    }
    setEditingPriceId(null);
  };

  // Quick 1-Click Selling templates for farmers
  const quickSellOptions = [
    {
      name: 'Tomatoes',
      category: 'Vegetables' as const,
      price: 35,
      unit: 'kg',
      photoUrl: TOMATOES_IMAGE_URL,
      defaultStock: 50,
      description: 'Vine-ripened fresh juicy farm tomatoes harvested today morning.',
    },
    {
      name: 'Carrots',
      category: 'Vegetables' as const,
      price: 45,
      unit: 'kg',
      photoUrl: CARROT_IMAGE_URL,
      defaultStock: 40,
      description: 'Sweet, crisp, freshly pulled deep orange carrots.',
    },
    {
      name: 'Potatoes',
      category: 'Grains & Roots' as const,
      price: 28,
      unit: 'kg',
      photoUrl: POTATO_IMAGE_URL,
      defaultStock: 80,
      description: 'Starchy golden farm potatoes, unpolished and freshly unearthed.',
    },
    {
      name: 'Onions',
      category: 'Vegetables' as const,
      price: 32,
      unit: 'kg',
      photoUrl: ONION_IMAGE_URL,
      defaultStock: 60,
      description: 'Pungent, dry-cured pink onions with tight papery skins.',
    },
    {
      name: 'Spinach (Palak)',
      category: 'Herbs & Microgreens' as const,
      price: 20,
      unit: 'bunch',
      photoUrl: GREENS_IMAGE_URL,
      defaultStock: 35,
      description: 'Crisp green tender broad-leaf spinach bunches harvested at dawn.',
    },
    {
      name: 'Lemons',
      category: 'Fruits' as const,
      price: 5,
      unit: 'piece',
      photoUrl: LEMON_IMAGE_URL,
      defaultStock: 100,
      description: 'Juicy thin-skinned yellow kagzi lemons freshly plucked.',
    },
  ];

  const handleQuickSell = (crop: typeof quickSellOptions[0]) => {
    // If farmer already has this crop listed, increase stock by default stock
    const existing = farmerProducts.find(
      p => p.name.toLowerCase() === crop.name.toLowerCase() && p.status !== 'removed'
    );

    if (existing) {
      updateListing(existing.id, {
        availableQuantity: existing.availableQuantity + crop.defaultStock,
        status: 'active',
      });
      setQuickAddedCrop(crop.name);
      setTimeout(() => setQuickAddedCrop(null), 2500);
    } else {
      // Add as new produce listing to sell
      const res = addListing({
        name: crop.name,
        category: crop.category,
        description: crop.description,
        photoUrl: crop.photoUrl,
        unit: crop.unit,
        price: crop.price,
        availableQuantity: crop.defaultStock,
        harvestDate: new Date().toISOString().split('T')[0],
        availabilityWindow: 'Fresh morning harvest; ready for immediate dispatch',
        fulfillment: 'both',
        deliveryFee: 40,
        isOrganic: true,
      });

      if (res.success) {
        setQuickAddedCrop(crop.name);
        setTimeout(() => setQuickAddedCrop(null), 2500);
      }
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'requested':
        return (
          <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" />
            {t('statusRequested')}
          </span>
        );
      case 'accepted':
        return (
          <span className="text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            {t('statusAccepted')}
          </span>
        );
      case 'ready':
        return (
          <span className="text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1">
            <Package className="w-3 h-3 text-indigo-600" />
            {t('statusReady')}
          </span>
        );
      case 'completed':
        return (
          <span className="text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            {t('statusCompleted')}
          </span>
        );
      case 'cancelled':
        return (
          <span className="text-stone-700 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1">
            <XCircle className="w-3 h-3 text-stone-500" />
            {t('statusCancelled')}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Farmer Selling Hub Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            <Store className="w-4 h-4 text-emerald-400" />
            <span>{t('sellCropsTitle')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white">
            {activeFarmer.farmName}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl leading-relaxed">
            {t('sellCropBanner')}
          </p>
        </div>

        {/* Primary Action: Sell New Product */}
        <button
          onClick={() => setIsListingModalOpen(true)}
          className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('sellNewProductBtn')}</span>
        </button>
      </div>

      {/* Quick 1-Click Crops to Sell Tray */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>{t('quickSellStaples')}</span>
          </div>
          <span className="text-[11px] text-stone-500 hidden sm:inline">
            Click any crop below to instantly put it on sale or replenish stock
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {quickSellOptions.map(crop => {
            const isJustAdded = quickAddedCrop === crop.name;
            const existing = farmerProducts.find(
              p => p.name.toLowerCase() === crop.name.toLowerCase() && p.status === 'active'
            );
            const localizedName = translateProduceName(crop.name, language);
            const localizedUnit = translateUnitName(crop.unit, language);

            return (
              <button
                key={crop.name}
                type="button"
                onClick={() => handleQuickSell(crop)}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                  isJustAdded
                    ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600'
                    : existing
                    ? 'border-emerald-200 bg-emerald-50/30 hover:border-emerald-500 hover:bg-white'
                    : 'border-stone-200 bg-stone-50/70 hover:border-emerald-600 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <img
                    src={crop.photoUrl}
                    alt={crop.name}
                    className="w-8 h-8 rounded-lg object-cover bg-stone-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-stone-900 truncate">{localizedName}</div>
                    <div className="text-[11px] font-semibold text-emerald-800 tabular-nums">
                      ₹{crop.price}/{localizedUnit}
                    </div>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-stone-200/60 flex items-center justify-between text-[10px]">
                  {isJustAdded ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Live on Sale!
                    </span>
                  ) : existing ? (
                    <span className="text-emerald-800 font-medium">
                      + Add {crop.defaultStock}{localizedUnit}
                    </span>
                  ) : (
                    <span className="text-stone-600 font-medium">+ Put on Sale</span>
                  )}
                  <span className="font-bold text-stone-900">+{crop.defaultStock}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Sales Metric Strip in ₹ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <div className="text-xs text-stone-500 font-medium flex items-center justify-between">
            <span>{t('salesRevenue')}</span>
            <TrendingUp className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold text-stone-900 mt-2 font-serif tabular-nums">
            ₹{totalRevenue.toFixed(2)}
          </div>
          <div className="text-[11px] text-stone-500 mt-0.5">
            {completedOrders.length} settled buyer sales
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <div className="text-xs text-stone-500 font-medium flex items-center justify-between">
            <span>{t('pendingRevenue')}</span>
            <Clock className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-2xl font-bold text-stone-900 mt-2 font-serif tabular-nums">
            ₹{pendingValue.toFixed(2)}
          </div>
          <div className="text-[11px] text-stone-500 mt-0.5">
            {pendingOrders.length} buyer orders awaiting dispatch
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <div className="text-xs text-stone-500 font-medium flex items-center justify-between">
            <span>{t('unitsSold')}</span>
            <Package className="w-4 h-4 text-blue-700" />
          </div>
          <div className="text-2xl font-bold text-stone-900 mt-2 font-serif tabular-nums">
            {unitsSold}
          </div>
          <div className="text-[11px] text-stone-500 mt-0.5">Kg & bunches sold</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <div className="text-xs text-stone-500 font-medium flex items-center justify-between">
            <span>{t('activeListings')}</span>
            <Store className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold text-stone-900 mt-2 font-serif tabular-nums">
            {farmerProducts.filter(p => p.status === 'active').length} / {farmerProducts.length}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">Live on sale in marketplace</div>
        </div>
      </div>

      {/* Main Tabs: Selling Products (Default) vs Incoming Buyer Orders */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="border-b border-stone-200 px-6 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('selling')}
              className={`pb-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'selling'
                  ? 'border-emerald-800 text-emerald-900'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t('cropsOnSaleTab')} ({farmerProducts.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'orders'
                  ? 'border-emerald-800 text-emerald-900'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>{t('incomingOrdersTab')} ({farmerOrders.length})</span>
            </button>
          </div>

          {activeTab === 'selling' && (
            <button
              onClick={() => setIsListingModalOpen(true)}
              className="mb-3 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('publishProduce')}</span>
            </button>
          )}
        </div>

        {/* Tab 1: PRODUCE FOR SALE (Selling Hub) */}
        {activeTab === 'selling' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between text-xs text-stone-500 pb-2">
              <span>
                Manage your live produce selling prices in ₹, adjust harvest quantities, and control marketplace availability.
              </span>
              <span className="font-medium text-stone-700">
                {farmerProducts.filter(p => p.status === 'active').length} actively selling
              </span>
            </div>

            {farmerProducts.length === 0 ? (
              <div className="py-16 text-center space-y-3 bg-stone-50/50 rounded-xl border border-dashed border-stone-300">
                <Store className="w-12 h-12 text-stone-400 mx-auto" />
                <h3 className="text-base font-bold text-stone-800">No Produce Currently Listed for Sale</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Start selling by clicking "+ Sell New Product" or choose one of the quick 1-click staples above.
                </p>
                <button
                  onClick={() => setIsListingModalOpen(true)}
                  className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900"
                >
                  {t('publishProduce')}
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-500 font-semibold bg-stone-50/50">
                      <th className="py-3 px-4">Produce on Sale</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price in ₹</th>
                      <th className="py-3 px-4">{t('availableStock')}</th>
                      <th className="py-3 px-4">{t('harvestTransparency')}</th>
                      <th className="py-3 px-4">{t('fulfillmentFilterLabel')}</th>
                      <th className="py-3 px-4">Selling Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {farmerProducts.map(prod => {
                      const localizedName = translateProduceName(prod.name, language);
                      const localizedCat = translateCategoryName(prod.category, language);
                      const localizedUnit = translateUnitName(prod.unit, language);

                      return (
                        <tr key={prod.id} className="hover:bg-stone-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={prod.photoUrl}
                                alt={localizedName}
                                className="w-11 h-11 object-cover rounded-lg bg-stone-100 border border-stone-200"
                              />
                              <div>
                                <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                                  <span>{localizedName}</span>
                                  {prod.isOrganic && (
                                    <span className="text-[9px] bg-emerald-100 text-emerald-900 px-1 py-0.2 rounded font-semibold uppercase">
                                      Organic
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-stone-500">Unit: {localizedUnit}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-stone-600">{localizedCat}</td>

                          {/* Editable Selling Price in ₹ */}
                          <td className="py-3 px-4">
                            {editingPriceId === prod.id ? (
                              <div className="flex items-center gap-1">
                                <span className="text-stone-500">₹</span>
                                <input
                                  type="number"
                                  step="1"
                                  value={newPriceValue}
                                  onChange={e => setNewPriceValue(e.target.value)}
                                  className="w-16 p-1 border rounded text-xs tabular-nums font-bold"
                                />
                                <button
                                  onClick={() => handleSavePrice(prod.id)}
                                  className="px-2 py-1 bg-emerald-800 text-white rounded text-[10px] font-semibold"
                                >
                                  Save
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-stone-900 tabular-nums text-sm">
                                  ₹{prod.price.toFixed(2)}
                                </span>
                                <span className="text-[11px] text-stone-400">/{localizedUnit}</span>
                                <button
                                  onClick={() => {
                                    setEditingPriceId(prod.id);
                                    setNewPriceValue(prod.price.toString());
                                  }}
                                  className="text-stone-400 hover:text-stone-700 ml-1 p-0.5 rounded hover:bg-stone-100"
                                  title={t('editPrice')}
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </td>

                          {/* Live Quick Stock Adjuster */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleStockAdjust(prod, -5)}
                                className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-xs"
                                title="Decrease stock by 5"
                              >
                                -5
                              </button>
                              <span className="font-bold tabular-nums text-stone-900 min-w-9 text-center text-xs">
                                {prod.availableQuantity}
                              </span>
                              <button
                                onClick={() => handleStockAdjust(prod, 5)}
                                className="w-6 h-6 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-xs border border-emerald-200"
                                title="Increase stock by 5"
                              >
                                +5
                              </button>
                              <button
                                onClick={() => handleStockAdjust(prod, 25)}
                                className="px-1.5 h-6 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-[10px] border border-emerald-200"
                                title="Increase stock by 25"
                              >
                                +25
                              </button>
                              <span className="text-stone-500 text-[11px] ml-1">{localizedUnit}</span>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-stone-600">{prod.harvestDate}</td>

                          <td className="py-3 px-4 capitalize text-stone-600">
                            {prod.fulfillment === 'both' ? t('pickupOrDeliveryTag') : prod.fulfillment === 'pickup' ? t('farmPickupTag') : t('localDeliveryTag')}
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                                prod.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : prod.status === 'paused'
                                  ? 'bg-stone-100 text-stone-600'
                                  : 'bg-amber-50 text-amber-800'
                              }`}
                            >
                              {prod.status === 'active' ? 'Live on Sale' : prod.status}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => toggleListingStatus(prod.id)}
                              className="px-2.5 py-1 text-[11px] border border-stone-200 hover:bg-stone-50 rounded text-stone-700 inline-flex items-center gap-1 cursor-pointer"
                            >
                              {prod.status === 'active' ? (
                                <>
                                  <EyeOff className="w-3 h-3 text-stone-500" />
                                  <span>{t('pauseBtn')}</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3 h-3 text-emerald-700" />
                                  <span>{t('activateBtn')}</span>
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: INCOMING BUYER ORDERS */}
        {activeTab === 'orders' && (
          <div className="p-6 space-y-6">
            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-stone-500 mr-1">{t('sortByLabel')}</span>
              {(['all', 'requested', 'accepted', 'ready', 'completed', 'cancelled'] as const).map(
                st => (
                  <button
                    key={st}
                    onClick={() => setOrderFilter(st)}
                    className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                      orderFilter === st
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {st}
                  </button>
                )
              )}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="py-12 text-center text-stone-500 text-xs">
                No buyer orders found under "{orderFilter}".
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map(order => (
                  <div
                    key={order.id}
                    className="border border-stone-200 rounded-xl p-5 hover:border-stone-300 transition-colors bg-white space-y-4 shadow-2xs"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-stone-900 text-sm">
                          {t('orderNumber', { id: order.id })}
                        </span>
                        {getStatusBadge(order.status)}
                        <span className="text-stone-400">·</span>
                        <span className="text-stone-500">
                          {new Date(order.createdAt).toLocaleString(language === 'en' ? 'en-US' : 'en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-stone-500">{t('fulfillmentFilterLabel')}</span>
                        <span className="font-semibold text-stone-800 capitalize">
                          {order.fulfillmentType === 'pickup' ? t('farmPickupTag') : t('localDeliveryTag')}
                        </span>
                      </div>
                    </div>

                    {/* Buyer Information & Noted Delivery Address */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-stone-600 bg-stone-50/60 p-3 rounded-lg border border-stone-200/60">
                      <div>
                        <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-stone-700" />
                          <span>{order.buyerName}</span>
                          {order.buyerBusinessName && (
                            <span className="text-stone-500 font-normal">({order.buyerBusinessName})</span>
                          )}
                        </div>
                        <div className="text-stone-500 mt-1 flex items-center gap-2">
                          <span className="capitalize font-medium text-emerald-800">{order.buyerType}</span>
                          <span>·</span>
                          <span className="tabular-nums">{order.buyerContact.phone}</span>
                        </div>
                        {/* Delivery address noted */}
                        <div className="mt-2 text-stone-800 flex items-start gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-800 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-emerald-950">{t('doorstepDeliveryAddress')}: </span>
                            <span>{order.buyerContact.deliveryAddress}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-stone-700">
                          <span className="font-medium">Payment Method: </span>
                          <span className="capitalize">{order.paymentMethod.replace(/_/g, ' ')}</span>
                          <span className="text-stone-400 ml-1">({order.paymentStatus})</span>
                        </div>
                        {order.buyerNotes && (
                          <div className="text-stone-600 mt-1 italic">
                            "{order.buyerNotes}"
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Items Table in ₹ */}
                    <div className="text-xs">
                      <div className="font-semibold text-stone-800 mb-2">{t('orderedProduceItems')}:</div>
                      <div className="divide-y divide-stone-100 border border-stone-200 rounded-lg overflow-hidden">
                        {order.items.map(item => {
                          const localizedName = translateProduceName(item.productName, language);
                          const localizedUnit = translateUnitName(item.unit, language);

                          return (
                            <div
                              key={item.productId}
                              className="p-2.5 flex items-center justify-between bg-white text-stone-700"
                            >
                              <div>
                                <span className="font-medium text-stone-900">{localizedName}</span>
                                <span className="text-stone-500 ml-2">
                                  ({item.quantity} {localizedUnit} @ ₹{item.unitPrice.toFixed(2)}/{localizedUnit})
                                </span>
                              </div>
                              <span className="font-bold text-stone-900 tabular-nums">
                                ₹{item.subtotal.toFixed(2)}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex justify-between items-center pt-2 px-1 text-xs">
                        <span className="text-stone-500">{t('totalAmount')}</span>
                        <span className="text-sm font-bold text-stone-900 tabular-nums">
                          ₹{order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Action Controls for Order State Transitions */}
                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between flex-wrap gap-2">
                      <div className="text-[11px] text-stone-500">
                        {order.status === 'cancelled' ? (
                          <span className="text-stone-500">
                            {t('stockRestoredNotice')}
                          </span>
                        ) : (
                          <span>Direct producer fulfillment workflow.</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {order.status === 'requested' && (
                          <>
                            <button
                              onClick={() => cancelOrder(order.id, 'Farmer declined request')}
                              className="px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                            >
                              {t('declineCancelOrder')}
                            </button>
                            <button
                              onClick={() => updateOrderStatus(order.id, 'accepted', 'Farmer confirmed harvest inventory')}
                              className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{t('acceptOrder')}</span>
                            </button>
                          </>
                        )}

                        {order.status === 'accepted' && (
                          <>
                            <button
                              onClick={() => cancelOrder(order.id, 'Harvest issue')}
                              className="px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                            >
                              {t('cancelOrder')}
                            </button>
                            <button
                              onClick={() => updateOrderStatus(order.id, 'ready', 'Packed and ready for delivery/pickup')}
                              className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <Package className="w-3.5 h-3.5" />
                              <span>{t('markReady')}</span>
                            </button>
                          </>
                        )}

                        {order.status === 'ready' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'completed', 'Delivered')}
                            className="px-4 py-1.5 text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{t('markCompleted')}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <NewListingModal
        isOpen={isListingModalOpen}
        onClose={() => setIsListingModalOpen(false)}
      />
    </div>
  );
};
