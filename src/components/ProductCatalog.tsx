import React, { useState, useMemo } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ProductListing } from '../types';
import { ProductCard } from './ProductCard';
import { ProductDetailModal } from './ProductDetailModal';
import { translateCategoryName } from '../i18n/translations';
import {
  Search,
  Store,
  X,
} from 'lucide-react';

interface ProductCatalogProps {
  onSelectFarm?: (farmId: string) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = () => {
  const { products, allFarmers, language, t } = useMarketplace();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedFarmId, setSelectedFarmId] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [fulfillmentFilter, setFulfillmentFilter] = useState<'all' | 'pickup' | 'delivery'>('all');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'harvest' | 'price_asc' | 'price_desc' | 'stock'>('harvest');
  const [selectedProduct, setSelectedProduct] = useState<ProductListing | null>(null);

  const categories = [
    'All',
    'Vegetables',
    'Fruits',
    'Herbs & Microgreens',
    'Dairy & Eggs',
    'Pantry & Honey',
    'Grains & Roots',
  ];

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        // Only show active and flagged listings (hide removed)
        if (p.status === 'removed' || p.status === 'paused') return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchFarm = p.farmName.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchCategory = p.category.toLowerCase().includes(q);
          if (!matchName && !matchFarm && !matchDesc && !matchCategory) return false;
        }

        // Category
        if (selectedCategory !== 'All' && p.category !== selectedCategory) {
          return false;
        }

        // Specific Farm
        if (selectedFarmId !== 'all' && p.farmerId !== selectedFarmId) {
          return false;
        }

        // Price limit
        if (p.price > maxPrice) {
          return false;
        }

        // Fulfillment
        if (fulfillmentFilter === 'pickup' && p.fulfillment === 'delivery') return false;
        if (fulfillmentFilter === 'delivery' && p.fulfillment === 'pickup') return false;

        // Organic filter
        if (organicOnly && !p.isOrganic) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'harvest') {
          return new Date(b.harvestDate).getTime() - new Date(a.harvestDate).getTime();
        }
        if (sortBy === 'price_asc') {
          return a.price - b.price;
        }
        if (sortBy === 'price_desc') {
          return b.price - a.price;
        }
        if (sortBy === 'stock') {
          return b.availableQuantity - a.availableQuantity;
        }
        return 0;
      });
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedFarmId,
    maxPrice,
    fulfillmentFilter,
    organicOnly,
    sortBy,
  ]);

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedFarmId('all');
    setMaxPrice(500);
    setFulfillmentFilter('all');
    setOrganicOnly(false);
    setSortBy('harvest');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedCategory !== 'All' ||
    selectedFarmId !== 'all' ||
    maxPrice < 500 ||
    fulfillmentFilter !== 'all' ||
    organicOnly;

  return (
    <div id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Farm Quick Filter Strip */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-700">
            <Store className="w-4 h-4 text-emerald-800" />
            <span>{t('participatingGrowers')}</span>
          </div>
          <span className="text-xs text-stone-500">
            {t('selectFarmToView')}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            onClick={() => setSelectedFarmId('all')}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedFarmId === 'all'
                ? 'border-emerald-800 bg-emerald-50/70 ring-1 ring-emerald-800'
                : 'border-stone-200 hover:border-emerald-600 bg-white hover:bg-stone-50'
            }`}
          >
            <div className="text-xs font-bold text-stone-900">{t('allLocalFarms')}</div>
            <div className="text-[11px] text-stone-500 mt-0.5">{allFarmers.length} Family Growers</div>
            <div className="text-[10px] text-emerald-700 font-medium mt-1">{t('fullRegionalCatalog')}</div>
          </button>

          {allFarmers.map(farmer => (
            <button
              key={farmer.id}
              onClick={() => setSelectedFarmId(farmer.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedFarmId === farmer.id
                  ? 'border-emerald-800 bg-emerald-50/70 ring-1 ring-emerald-800'
                  : 'border-stone-200 hover:border-emerald-600 bg-white hover:bg-stone-50'
              }`}
            >
              <div className="text-xs font-bold text-stone-900 truncate">{farmer.farmName}</div>
              <div className="text-[11px] text-stone-500 truncate mt-0.5">{farmer.location}</div>
              <div className="text-[10px] text-emerald-800 font-medium mt-1 flex items-center justify-between">
                <span>{farmer.distanceKm} {t('kmAway')}</span>
                <span>★ {farmer.rating.toFixed(1)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Search and Filters Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
        {/* Search Row */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 text-xs border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-700 bg-stone-50/40"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 text-xs w-full md:w-auto">
            <span className="text-stone-500 whitespace-nowrap">{t('sortByLabel')}</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="p-2 border border-stone-300 rounded-lg bg-white text-xs font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
            >
              <option value="harvest">{t('sortFreshness')}</option>
              <option value="price_asc">{t('sortPriceLowHigh')}</option>
              <option value="price_desc">{t('sortPriceHighLow')}</option>
              <option value="stock">{t('sortStock')}</option>
            </select>
          </div>
        </div>

        {/* Category Segmented Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map(cat => {
            const isSelected = selectedCategory === cat;
            const count =
              cat === 'All'
                ? products.filter(p => p.status === 'active').length
                : products.filter(p => p.status === 'active' && p.category === cat).length;
            const localizedCat = translateCategoryName(cat, language);

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
                }`}
              >
                <span>{localizedCat}</span>
                <span className="text-[10px] opacity-80 tabular-nums">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Detailed Controls Row: Price, Fulfillment & Organic Toggle */}
        <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-4 text-xs text-stone-600">
          <div className="flex flex-wrap items-center gap-5">
            {/* Fulfillment Filter */}
            <div className="flex items-center gap-2">
              <span className="font-medium text-stone-700">{t('fulfillmentFilterLabel')}</span>
              <div className="flex items-center border border-stone-200 rounded-lg p-0.5 bg-stone-50">
                <button
                  onClick={() => setFulfillmentFilter('all')}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                    fulfillmentFilter === 'all'
                      ? 'bg-white text-stone-900 shadow-2xs'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  {t('filterAll')}
                </button>
                <button
                  onClick={() => setFulfillmentFilter('pickup')}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                    fulfillmentFilter === 'pickup'
                      ? 'bg-white text-stone-900 shadow-2xs'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  {t('filterPickup')}
                </button>
                <button
                  onClick={() => setFulfillmentFilter('delivery')}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                    fulfillmentFilter === 'delivery'
                      ? 'bg-white text-stone-900 shadow-2xs'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  {t('filterDelivery')}
                </button>
              </div>
            </div>

            {/* Organic Only Checkbox */}
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={organicOnly}
                onChange={e => setOrganicOnly(e.target.checked)}
                className="rounded text-emerald-800 focus:ring-emerald-700"
              />
              <span className="font-medium text-stone-800">{t('certifiedOrganicOnly')}</span>
            </label>

            {/* Price Max Slider */}
            <div className="flex items-center gap-2">
              <span className="font-medium text-stone-700">{t('maxPriceLabel')}</span>
              <input
                type="range"
                min="20"
                max="500"
                step="10"
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-24 accent-emerald-800"
              />
              <span className="font-semibold text-stone-900 tabular-nums">
                ₹{maxPrice}
              </span>
            </div>
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="text-emerald-800 hover:underline font-medium text-xs flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              {t('resetAllFilters')}
            </button>
          )}
        </div>
      </div>

      {/* Produce Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs text-stone-500">
            {t('showingProduceItems', { count: filteredProducts.length })}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
            <Store className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="text-base font-semibold text-stone-800">{t('noProduceFound')}</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              {t('noProduceFoundDesc')}
            </p>
            <button
              onClick={resetAllFilters}
              className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 transition-colors"
            >
              {t('resetAllFilters')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={p => setSelectedProduct(p)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};
