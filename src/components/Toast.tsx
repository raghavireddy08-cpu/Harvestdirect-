import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { CheckCircle2, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage, hideToast } = useMarketplace();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md bg-stone-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center justify-between gap-3 text-xs border border-stone-800">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="leading-snug">{toastMessage}</span>
      </div>
      <button
        onClick={hideToast}
        className="text-stone-400 hover:text-white p-0.5"
        aria-label="Dismiss message"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
