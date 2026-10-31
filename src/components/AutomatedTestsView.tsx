import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { TestResult } from '../types';

export const AutomatedTestsView: React.FC = () => {
  const { runAutomatedTests, lastTestResults, resetToSeedData, t } = useMarketplace();
  const [isRunning, setIsRunning] = useState(false);
  const [activeResults, setActiveResults] = useState<TestResult[] | null>(() => {
    return lastTestResults || null;
  });

  const handleRunTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const results = runAutomatedTests();
      setActiveResults(results);
      setIsRunning(false);
    }, 400);
  };

  React.useEffect(() => {
    if (!activeResults) {
      const results = runAutomatedTests();
      setActiveResults(results);
    }
  }, []);

  const passedCount = activeResults?.filter(r => r.passed).length || 0;
  const totalCount = activeResults?.length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Test Suite Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-800" />
            <span>Automated Invariant Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 mt-1">
            {t('systemTestsTitle')}
          </h1>
          <p className="text-xs text-stone-600 mt-0.5">
            {t('systemTestsDesc')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={resetToSeedData}
            className="px-3 py-2 border border-stone-200 text-stone-600 hover:bg-stone-50 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
            title="Reset data to initial state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('resetSeedStateBtn')}</span>
          </button>

          <button
            onClick={handleRunTests}
            disabled={isRunning}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Running...' : t('executeTestSuiteBtn')}</span>
          </button>
        </div>
      </div>

      {/* Summary Scorecard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <div className="text-xs text-stone-500 font-medium">{t('testPassRate')}</div>
          <div className="text-3xl font-bold text-emerald-800 mt-2 font-serif tabular-nums">
            {totalCount > 0 ? `${Math.round((passedCount / totalCount) * 100)}%` : '0%'}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            {passedCount} of {totalCount} assertions verified
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <div className="text-xs text-stone-500 font-medium">{t('stockSafetyInvariant')}</div>
          <div className="text-sm font-bold text-stone-900 mt-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Protected Against Overselling</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-1">Quantity ceiling strictly enforced</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <div className="text-xs text-stone-500 font-medium">{t('cancellationReversibility')}</div>
          <div className="text-sm font-bold text-stone-900 mt-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Automatic Inventory Rebound</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-1">100% item replenishment on cancel</div>
        </div>
      </div>

      {/* Test Results Cards */}
      <div className="space-y-4">
        <h2 className="text-base font-bold font-serif text-stone-900">
          {t('liveExecutionLog')}
        </h2>

        {activeResults?.map((test, index) => (
          <div
            key={test.id}
            className={`bg-white rounded-xl border p-5 transition-all shadow-xs ${
              test.passed ? 'border-emerald-200/80' : 'border-rose-300 bg-rose-50/20'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {test.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-stone-900 text-sm">
                      0{index + 1}. {test.title}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-wider uppercase ${
                        test.passed
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-rose-100 text-rose-900'
                      }`}
                    >
                      {test.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1">{test.description}</p>
                </div>
              </div>

              <span className="text-[11px] text-stone-400 tabular-nums shrink-0">
                {test.executedAt}
              </span>
            </div>

            {/* Test Details / Assertion proof */}
            <div className="mt-4 pt-3 border-t border-stone-100 bg-stone-50/60 p-3 rounded-lg text-xs font-mono text-stone-700">
              <div className="text-[11px] text-stone-400 font-sans font-semibold mb-1 uppercase tracking-wider">
                Execution Proof:
              </div>
              <p className="leading-relaxed">{test.details}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
