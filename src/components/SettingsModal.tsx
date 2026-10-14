import React, { useState } from 'react';
import { X, Play, Sliders, Bell, Volume2, Plus, Trash2, ShieldCheck, Sun } from 'lucide-react';
import { TimerSettings, ChimeSoundId } from '../types';
import { playChimeSound } from '../services/audioEngine';
import { requestNotificationPermission, isNotificationAvailable } from '../services/notificationService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: TimerSettings;
  onUpdateSettings: (newSettings: TimerSettings) => void;
}

export const SettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'sound' | 'timers'>('general');
  const [newTimerMinutes, setNewTimerMinutes] = useState('15');

  if (!isOpen) return null;

  const update = <K extends keyof TimerSettings>(key: K, value: TimerSettings[K]) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  const handleAudition = (id: ChimeSoundId) => {
    playChimeSound(id, settings.chimeVolume);
  };

  const handleAddTimer = () => {
    const mins = parseInt(newTimerMinutes, 10);
    if (!isNaN(mins) && mins > 0) {
      const secs = mins * 60;
      if (!settings.customTimers.includes(secs)) {
        const updated = [...settings.customTimers, secs].sort((a, b) => a - b);
        update('customTimers', updated);
      }
    }
  };

  const handleRemoveTimer = (secs: number) => {
    if (settings.customTimers.length <= 1) return;
    update(
      'customTimers',
      settings.customTimers.filter((s) => s !== secs)
    );
  };

  const handleResetTimers = () => {
    update('customTimers', [300, 600, 900, 1500, 1800, 2400, 3000, 3600]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full sm:max-w-lg bg-white dark:bg-[#090d16] border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#af1b3f]" />
            <h2 className="font-bold text-slate-900 dark:text-white text-lg">Settings & Audio</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-2 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'general'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            General
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sound')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'sound'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sound & Mixer
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('timers')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'timers'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Intervals
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Sun className="w-5 h-5 text-amber-500" />
                  <div>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 block">
                      Keep Screen Awake
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Prevents mobile display from sleeping during active timers
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.keepAwake}
                  onChange={(e) => update('keepAwake', e.target.checked)}
                  className="w-5 h-5 accent-[#af1b3f] rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 cursor-pointer">
                <div>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 block">
                    Preparation Countdown (3, 2, 1)
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Gives you 3 seconds to take a breath before each focus set
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.prepCountdown}
                  onChange={(e) => update('prepCountdown', e.target.checked)}
                  className="w-5 h-5 accent-[#af1b3f] rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 cursor-pointer">
                <div>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 block">
                    Vibrate on Completion
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Provides rhythmic haptic pulses when a set or break finishes
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.vibrate}
                  onChange={(e) => update('vibrate', e.target.checked)}
                  className="w-5 h-5 accent-[#af1b3f] rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 cursor-pointer">
                <div>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 block">
                    Auto-Pause Music During Breaks
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Music automatically stops on break and resumes when your next focus set begins
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.pauseMusicDuringBreaks}
                  onChange={(e) => update('pauseMusicDuringBreaks', e.target.checked)}
                  className="w-5 h-5 accent-[#af1b3f] rounded cursor-pointer"
                />
              </label>

              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#092677] dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 dark:text-blue-200">
                  <p className="font-semibold mb-0.5">Background Persistence Enabled</p>
                  <p>
                    Audio alarms are hardware-scheduled on the Web Audio context clock. Even if your screen turns off, completion chimes will ring accurately.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sound' && (
            <div className="space-y-5">
              {/* Chime selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-[#af1b3f]" />
                    Completion Chime Timbre
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAudition(settings.chimeSoundId)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#af1b3f] hover:underline"
                  >
                    <Play className="w-3 h-3 fill-current" /> Audition Chime
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { id: 'zen', name: 'Zen Bowl', sub: 'Warm resonant harmonics' },
                      { id: 'bell', name: 'Gym Bell', sub: 'Athletic boxing tone' },
                      { id: 'marimba', name: 'Marimba', sub: 'Warm wooden melody' },
                      { id: 'triple', name: 'Triple Beep', sub: 'Crisp electronic' },
                      { id: 'rising', name: 'Rising Chime', sub: 'Uplifting octave' },
                    ] as const
                  ).map((sound) => (
                    <button
                      key={sound.id}
                      type="button"
                      onClick={() => {
                        update('chimeSoundId', sound.id);
                        playChimeSound(sound.id, settings.chimeVolume);
                      }}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        settings.chimeSoundId === sound.id
                          ? 'bg-[#092677]/10 dark:bg-[#092677]/30 border-[#092677] dark:border-blue-500 ring-1 ring-[#092677]'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                        {sound.name}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {sound.sub}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dual Mixer */}
              <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    <span>🔔 Completion Chime Volume</span>
                    <span className="font-mono">{Math.round(settings.chimeVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.chimeVolume}
                    onChange={(e) => update('chimeVolume', parseFloat(e.target.value))}
                    className="w-full h-2 accent-[#092677] bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    <span>🎧 Ambient / Lo-Fi Beats Volume</span>
                    <span className="font-mono">{Math.round(settings.ambientVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.ambientVolume}
                    onChange={(e) => update('ambientVolume', parseFloat(e.target.value))}
                    className="w-full h-2 accent-[#af1b3f] bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Notifications */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <Bell className="w-4 h-4 text-[#092677]" />
                    <div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 block">
                        Background Lockscreen Notifications
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Shows target finish time when your device is locked
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notify}
                    onChange={async (e) => {
                      if (e.target.checked && !isNotificationAvailable()) {
                        const granted = await requestNotificationPermission();
                        update('notify', granted);
                      } else {
                        update('notify', e.target.checked);
                      }
                    }}
                    className="w-5 h-5 accent-[#af1b3f] rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'timers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Custom Interval Quick-Picks
                </span>
                <button
                  type="button"
                  onClick={handleResetTimers}
                  className="text-xs text-[#af1b3f] hover:underline font-medium"
                >
                  Reset Defaults
                </button>
              </div>

              {/* List of current presets */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {settings.customTimers.map((secs) => {
                  const m = Math.floor(secs / 60);
                  const s = secs % 60;
                  const label = s > 0 ? `${m}m ${s}s` : `${m} min`;
                  return (
                    <div
                      key={secs}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                    >
                      <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-100">
                        {label}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTimer(secs)}
                        className="text-slate-400 hover:text-red-500 p-1"
                        title="Delete interval"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Add custom minute interval */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={newTimerMinutes}
                  onChange={(e) => setNewTimerMinutes(e.target.value)}
                  placeholder="Minutes"
                  className="w-24 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-sm"
                />
                <span className="text-xs text-slate-500 font-medium">Minutes</span>
                <button
                  type="button"
                  onClick={handleAddTimer}
                  className="ml-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#092677] text-white text-xs font-semibold hover:bg-[#071e5e]"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Interval
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
          <span>ParetoPause PWA • v1.0</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
