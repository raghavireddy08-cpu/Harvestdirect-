import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ProductCategory, FulfillmentOption } from '../types';
import { X, Sprout, Plus, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { TOMATOES_IMAGE_URL, GREENS_IMAGE_URL, HONEY_IMAGE_URL } from '../data/mockData';

interface NewListingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewListingModal: React.FC<NewListingModalProps> = ({ isOpen, onClose }) => {
  const { addListing, activeFarmer, t } = useMarketplace();

  const [name, setName] = useState('');
  const [varietyDetails, setVarietyDetails] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Vegetables');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState(GREENS_IMAGE_URL);
  const [unit, setUnit] = useState('kg');
  const [price, setPrice] = useState('40.00');
  const [availableQuantity, setAvailableQuantity] = useState('50');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [availabilityWindow, setAvailabilityWindow] = useState('Fresh dawn harvest; available while stock lasts');
  const [fulfillment, setFulfillment] = useState<FulfillmentOption>('both');
  const [deliveryFee, setDeliveryFee] = useState('50.00');
  const [isOrganic, setIsOrganic] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedPrice = parseFloat(price);
    const parsedQty = parseInt(availableQuantity, 10);
    const parsedDeliveryFee = parseFloat(deliveryFee);

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError('Please provide a valid price per unit in Indian Rupees (₹).');
      return;
    }

    if (isNaN(parsedQty) || parsedQty <= 0) {
      setError('Please provide an available stock quantity greater than 0.');
      return;
    }

    const res = addListing({
      name: name.trim(),
      varietyDetails: varietyDetails.trim() || undefined,
      category,
      description: description.trim(),
      photoUrl: photoUrl.trim() || GREENS_IMAGE_URL,
      unit: unit.trim(),
      price: parsedPrice,
      availableQuantity: parsedQty,
      harvestDate,
      availabilityWindow: availabilityWindow.trim(),
      fulfillment,
      deliveryFee: isNaN(parsedDeliveryFee) ? 0 : parsedDeliveryFee,
      isOrganic,
    });

    if (res.success) {
      onClose();
    } else {
      setError(res.message);
    }
  };

  const imagePresets = [
    { label: 'Fresh Greens', url: GREENS_IMAGE_URL },
    { label: 'Tomatoes', url: TOMATOES_IMAGE_URL },
    { label: 'Honey & Pantry', url: HONEY_IMAGE_URL },
    { label: 'Carrots', url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80' },
    { label: 'Potatoes', url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80' },
    { label: 'Lemons', url: 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&w=600&q=80' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-2xl w-full p-6 my-8 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2">
              <Sprout className="w-5 h-5 text-emerald-800" />
              <h2 className="text-lg font-serif font-bold text-stone-900">{t('publishProduce')}</h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Publishing as <span className="font-semibold text-stone-700">{activeFarmer.farmName}</span>
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

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          {/* Produce Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-stone-800 block mb-1">
                Produce Name (Simplified) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Carrots, Tomatoes, Potatoes, Spinach..."
                className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-700 text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-800 block mb-1">
                Variety / Native Tag (Optional)
              </label>
              <input
                type="text"
                value={varietyDetails}
                onChange={e => setVarietyDetails(e.target.value)}
                placeholder="e.g. Desi Naatu, Sweet Sharbati, Jyoti..."
                className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-700 text-xs"
              />
            </div>
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-stone-800 block mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ProductCategory)}
                className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-700 text-xs bg-white"
              >
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Herbs & Microgreens">Herbs & Microgreens</option>
                <option value="Dairy & Eggs">Dairy & Eggs</option>
                <option value="Pantry & Honey">Pantry & Honey</option>
                <option value="Grains & Roots">Grains & Roots</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-stone-800 block mb-1">Unit of Measure</label>
              <input
                type="text"
                required
                value={unit}
                onChange={e => setUnit(e.target.value)}
                placeholder="e.g. kg, bunch, crate (10 kg), dozen, jar (500g)"
                className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-700 text-xs"
              />
            </div>
          </div>

          {/* Price in ₹ & Available Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-stone-800 block mb-1">
                Price per Unit (₹ INR) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="1"
                min="1"
                required
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="40"
                className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-700 text-xs tabular-nums"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-800 block mb-1">
                Available Quantity <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="1"
                min="1"
                required
                value={availableQuantity}
                onChange={e => setAvailableQuantity(e.target.value)}
                placeholder="50"
                className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-700 text-xs tabular-nums"
              />
            </div>
          </div>

          {/* Harvest Date & Availability Window */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-stone-800 block mb-1">Harvest Date</label>
              <input
                type="date"
                required
                value={harvestDate}
                onChange={e => setHarvestDate(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-700 text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-800 block mb-1">Availability Window</label>
              <input
                type="text"
                value={availabilityWindow}
                onChange={e => setAvailabilityWindow(e.target.value)}
                placeholder="e.g. Cut fresh to order; stores 10 days"
                className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-700 text-xs"
              />
            </div>
          </div>

          {/* Fulfillment & Delivery Fee in ₹ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-stone-800 block mb-1">Fulfillment Option</label>
              <select
                value={fulfillment}
                onChange={e => setFulfillment(e.target.value as FulfillmentOption)}
                className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-700 text-xs bg-white"
              >
                <option value="both">Both Pickup & Doorstep Delivery</option>
                <option value="pickup">Farmgate Pickup Only</option>
                <option value="delivery">Doorstep Delivery Only</option>
              </select>
            </div>

            {fulfillment !== 'pickup' && (
              <div>
                <label className="font-semibold text-stone-800 block mb-1">Delivery Fee (₹)</label>
                <input
                  type="number"
                  step="5"
                  min="0"
                  value={deliveryFee}
                  onChange={e => setDeliveryFee(e.target.value)}
                  placeholder="50"
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-700 text-xs tabular-nums"
                />
              </div>
            )}
          </div>

          {/* Photo Presets & URL */}
          <div>
            <label className="font-semibold text-stone-800 block mb-1">Produce Photo URL</label>
            <input
              type="text"
              value={photoUrl}
              onChange={e => setPhotoUrl(e.target.value)}
              placeholder="Paste photo URL or pick preset below"
              className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-700 text-xs mb-2"
            />
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-stone-500 text-[11px]">Quick presets:</span>
              {imagePresets.map(preset => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setPhotoUrl(preset.url)}
                  className={`px-2 py-0.5 rounded text-[11px] border transition-colors ${
                    photoUrl === preset.url
                      ? 'bg-emerald-800 text-white border-emerald-800'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="font-semibold text-stone-800 block mb-1">Cultivation Notes & Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe farming practices, natural feed, taste profile, and storage recommendations..."
              className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-700 text-xs"
            />
          </div>

          {/* Organic Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isOrganic"
              checked={isOrganic}
              onChange={e => setIsOrganic(e.target.checked)}
              className="rounded text-emerald-700 focus:ring-emerald-600"
            />
            <label htmlFor="isOrganic" className="font-medium text-stone-700 text-xs cursor-pointer">
              Grown using natural/organic farming practices (Jeevamrutha, Panchagavya, zero synthetic pesticides)
            </label>
          </div>

          {/* Submit buttons */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-semibold shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Publish Listing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
