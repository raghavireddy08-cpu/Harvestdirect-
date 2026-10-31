import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

export const DisclaimerBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  const { t } = useMarketplace();

  if (dismissed) return null;

  return (
    <div className="bg-amber-50/90 border-b border-amber-200/80 text-amber-950 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold flex items-center gap-1.5 text-amber-900 shrink-0">
            <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
            {t('disclaimerPrototypeNotice')}
          </span>
          <span className="hidden md:inline text-amber-800 font-medium">
            {t('disclaimerSimulated')}
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-700 hover:text-amber-900 transition-colors p-1 shrink-0"
          title={t('dismissNotice')}
          aria-label={t('dismissNotice')}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

