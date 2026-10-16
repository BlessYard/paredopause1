import React, { useState } from 'react';
import {
  X,
  Shield,
  ShieldCheck,
  BellOff,
  Smartphone,
  CheckCircle2,
  ExternalLink,
  Maximize2,
  Lock,
} from 'lucide-react';
import { TimerSettings } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: TimerSettings;
  onUpdateSettings: (settings: Partial<TimerSettings>) => void;
}

export const NotificationShieldModal: React.FC<Props> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'ios' | 'android' | 'shield'>('ios');
  const [fullscreenActive, setFullscreenActive] = useState(
    typeof document !== 'undefined' && !!document.fullscreenElement
  );

  if (!isOpen) return null;

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setFullscreenActive(true);
      } else {
        await document.exitFullscreen();
        setFullscreenActive(false);
      }
    } catch (_) {}
  };

  const handleOpenIOSShortcuts = () => {
    // Attempt to open iOS shortcuts or focus settings
    window.location.href = 'shortcuts://';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-3xl bg-white dark:bg-[#090d16] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          aria-label="Close notification shield guide"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center text-[#af1b3f] shrink-0">
            <BellOff className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
              <span>Phone Notification Shield</span>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Active Focus
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Stop phone interruptions & silence incoming notifications
            </p>
          </div>
        </div>

        {/* In-App Automated Shields */}
        <div className="mb-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
          <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            1. Automated In-App Shields
          </div>

          {/* Fullscreen Notification Blocker */}
          <div className="flex items-center justify-between">
            <div className="pr-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-[#092677] dark:text-blue-400" />
                <span>Immersive Fullscreen Shield</span>
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Hides phone status bar & prevents notification banners sliding down
              </p>
            </div>
            <button
              type="button"
              onClick={toggleFullscreen}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                fullscreenActive
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#092677] text-white hover:bg-[#071e5e]'
              }`}
            >
              {fullscreenActive ? 'Active' : 'Turn On'}
            </button>
          </div>

          {/* Silence Mid-Session Pings */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
            <div className="pr-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Zero Mid-Session Distractions</span>
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Silence all system pings until your timer finishes
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded-md">
              Protected
            </span>
          </div>
        </div>

        {/* Phone OS Do Not Disturb Guide */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              2. Stop OS Phone Notifications (DND)
            </span>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('ios')}
                className={`px-2 py-0.5 rounded-md transition-all ${
                  activeTab === 'ios'
                    ? 'bg-white dark:bg-slate-700 text-[#092677] dark:text-white shadow-2xs font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                iPhone / iPad
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('android')}
                className={`px-2 py-0.5 rounded-md transition-all ${
                  activeTab === 'android'
                    ? 'bg-white dark:bg-slate-700 text-[#092677] dark:text-white shadow-2xs font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Android
              </button>
            </div>
          </div>

          {/* iOS Guide */}
          {activeTab === 'ios' && (
            <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/60 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#092677] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                  1
                </span>
                <p className="leading-snug">
                  Swipe down from top-right corner to open <strong>iOS Control Center</strong>.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#092677] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                  2
                </span>
                <p className="leading-snug">
                  Tap <strong>Focus</strong> (moon icon) and select <strong>Do Not Disturb</strong> or <strong>Work</strong>.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#092677] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                  3
                </span>
                <p className="leading-snug">
                  All WhatsApp, Instagram, Slack, texts, and calls will now be 100% silenced during your focus block.
                </p>
              </div>

              <div className="pt-1.5">
                <button
                  type="button"
                  onClick={handleOpenIOSShortcuts}
                  className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#092677] dark:text-blue-400 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  <span>Open iOS Focus / Shortcuts</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Android Guide */}
          {activeTab === 'android' && (
            <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/60 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#092677] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                  1
                </span>
                <p className="leading-snug">
                  Swipe down from the top of your screen to open <strong>Quick Settings</strong>.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#092677] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                  2
                </span>
                <p className="leading-snug">
                  Tap the <strong>Do Not Disturb (DND)</strong> tile to silence all calls, texts, and app banners.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#092677] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                  3
                </span>
                <p className="leading-snug">
                  You can also turn on <strong>Digital Wellbeing Focus Mode</strong> to pause distracting apps.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Done Button */}
        <div className="mt-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-[#092677] hover:bg-[#071e5e] text-white font-bold text-xs shadow-md shadow-[#092677]/20 transition-all cursor-pointer"
          >
            Got It — Shield My Focus
          </button>
        </div>
      </div>
    </div>
  );
};
