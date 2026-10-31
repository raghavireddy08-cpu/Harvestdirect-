import React from 'react';
import { HERO_IMAGE_URL } from '../data/mockData';
import { ArrowDown, Sprout, MapPin } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

interface HeroSectionProps {
  onExploreClick: () => void;
  farmCount: number;
  productCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreClick,
  farmCount,
  productCount,
}) => {
  const { t } = useMarketplace();

  return (
    <section className="relative overflow-hidden bg-stone-900 text-stone-100 border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Editorial Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 tracking-wide uppercase">
              <Sprout className="w-4 h-4 text-emerald-400" />
              <span>{t('heroBadge')}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-white leading-tight" style={{ textWrap: 'balance' }}>
              {t('heroTitle')}
            </h1>

            <p className="text-base sm:text-lg text-stone-300 max-w-2xl leading-relaxed">
              {t('heroDescription')}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={onExploreClick}
                className="px-6 py-3 bg-emerald-700 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm text-sm cursor-pointer"
              >
                <span>{t('heroBrowseBtn')}</span>
                <ArrowDown className="w-4 h-4" />
              </button>

              <div className="text-xs text-stone-400 flex items-center gap-2">
                <span className="font-semibold text-white tabular-nums">{farmCount}</span> {t('activeFamilyFarms')}
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-white tabular-nums">{productCount}</span> {t('seasonalHarvests')}
              </div>
            </div>

            {/* Feature metric pillars */}
            <div className="pt-6 border-t border-stone-800 grid grid-cols-3 gap-4 text-xs text-stone-300">
              <div>
                <div className="font-semibold text-white text-sm">{t('heroPillar1Title')}</div>
                <div className="text-stone-400 mt-0.5">{t('heroPillar1Desc')}</div>
              </div>
              <div>
                <div className="font-semibold text-white text-sm">{t('heroPillar2Title')}</div>
                <div className="text-stone-400 mt-0.5">{t('heroPillar2Desc')}</div>
              </div>
              <div>
                <div className="font-semibold text-white text-sm">{t('heroPillar3Title')}</div>
                <div className="text-stone-400 mt-0.5">{t('heroPillar3Desc')}</div>
              </div>
            </div>
          </div>

          {/* Right Hero Image Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-stone-700/60 shadow-2xl aspect-4/3 lg:aspect-auto lg:h-[380px] bg-stone-800">
              <img
                src={HERO_IMAGE_URL}
                alt="Freshly harvested produce crate"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-xs text-stone-200">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t('morningHarvestLugs')}</span>
                  </div>
                  <span className="text-stone-300">Chevella & Hosur</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
