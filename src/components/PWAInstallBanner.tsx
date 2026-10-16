import React, { useState } from 'react';
import { Download, Share, PlusSquare, X, Smartphone, Monitor, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { ParetoLogo } from './ParetoLogo';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'ios' | 'android' | 'desktop'>(() => {
    if (isIOS) return 'ios';
    if (typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent)) return 'android';
    return 'desktop';
  });

  if (isInstalled) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
        <CheckCircle2 className="w-3 h-3" />
        Installed
      </span>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-[#af1b3f] hover:bg-[#931433] active:scale-95 transition-all shadow-xs cursor-pointer"
        title="Install ParetoPause to home screen"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>

      {/* PWA Installation Instructions Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              aria-label="Close install guide"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header with Logo */}
            <div className="flex items-center gap-3 mb-4">
              <ParetoLogo size="sm" />
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
              ParetoPause is a Progressive Web App (PWA) designed to run offline and full-screen without internet.
            </p>

            {/* Platform Selector Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('ios')}
                className={`py-1.5 px-2 rounded-lg text-center transition-all ${
                  activeTab === 'ios'
                    ? 'bg-white dark:bg-slate-700 text-[#092677] dark:text-white shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                iPhone / iPad
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('android')}
                className={`py-1.5 px-2 rounded-lg text-center transition-all ${
                  activeTab === 'android'
                    ? 'bg-white dark:bg-slate-700 text-[#092677] dark:text-white shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Android
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('desktop')}
                className={`py-1.5 px-2 rounded-lg text-center transition-all ${
                  activeTab === 'desktop'
                    ? 'bg-white dark:bg-slate-700 text-[#092677] dark:text-white shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Mac / PC
              </button>
            </div>

            {/* Step-by-Step for chosen platform */}
            {activeTab === 'ios' && (
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#092677] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                    1
                  </span>
                  <p className="leading-snug">
                    Open in <strong>Safari</strong> and tap the <Share className="w-3.5 h-3.5 inline text-blue-500 mx-0.5" /> <strong>Share</strong> icon.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#092677] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                    2
                  </span>
                  <p className="leading-snug">
                    Scroll down and tap <PlusSquare className="w-3.5 h-3.5 inline text-slate-700 dark:text-slate-200 mx-0.5" /> <strong>Add to Home Screen</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#092677] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                    3
                  </span>
                  <p className="leading-snug">
                    Tap <strong>Add</strong> in the top-right. Launch it like a native app with zero address bar!
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'android' && (
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#092677] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                    1
                  </span>
                  <p className="leading-snug">
                    In Chrome, tap the <strong>three dots (⋮)</strong> in the top-right corner.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#092677] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                    2
                  </span>
                  <p className="leading-snug">
                    Select <Download className="w-3.5 h-3.5 inline text-emerald-600 mx-0.5" /> <strong>Install app</strong> or <strong>Add to Home screen</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#092677] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                    3
                  </span>
                  <p className="leading-snug">
                    Confirm <strong>Install</strong>. The icon will appear on your home screen and drawer.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'desktop' && (
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#092677] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                    1
                  </span>
                  <p className="leading-snug">
                    In Chrome or Edge, look for the <Download className="w-3.5 h-3.5 inline text-blue-600 mx-0.5" /> <strong>Install</strong> icon in the right side of the address bar.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#092677] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                    2
                  </span>
                  <p className="leading-snug">
                    Click <strong>Install ParetoPause</strong> to run in its own dedicated, distraction-free desktop window.
                  </p>
                </div>
              </div>
            )}

            {isInstallable && (
              <button
                type="button"
                onClick={async () => {
                  await install();
                  setShowModal(false);
                }}
                className="w-full mt-4 py-2.5 rounded-xl bg-[#af1b3f] hover:bg-[#931433] text-white font-bold text-xs transition-colors shadow-xs"
              >
                Trigger 1-Click Install
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="w-full mt-2 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
