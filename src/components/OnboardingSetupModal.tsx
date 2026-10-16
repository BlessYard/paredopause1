import React, { useState } from 'react';
import {
  Check,
  ArrowRight,
  ChevronLeft,
  Sliders,
  BellOff,
  Music,
  Sun,
  ShieldCheck,
} from 'lucide-react';
import { UserStats, SessionConfig, TimerSettings, AmbientSourceId } from '../types';
import { AMBIENT_PRESETS } from './YouTubeAmbientPlayer';
import { ParetoLogo } from './ParetoLogo';

interface Props {
  isOpen: boolean;
  onComplete: (updatedStats: Partial<UserStats>, updatedConfig: Partial<SessionConfig>, updatedSettings: Partial<TimerSettings>) => void;
  userStats: UserStats;
  currentConfig: SessionConfig;
  currentSettings: TimerSettings;
}

const AVATAR_COLORS = [
  '#092677', // Brand Navy
  '#af1b3f', // Brand Crimson
  '#0f766e', // Teal
  '#b45309', // Amber
  '#4338ca', // Indigo
  '#047857', // Emerald
];

export const OnboardingSetupModal: React.FC<Props> = ({
  isOpen,
  onComplete,
  userStats,
  currentConfig,
  currentSettings,
}) => {
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: Profile & Name
  const [name, setName] = useState(
    userStats.displayName === 'Focus Pioneer' ? '' : userStats.displayName
  );
  const [selectedColor, setSelectedColor] = useState(userStats.avatarSeed || '#092677');

  // Step 2: Essential Settings
  const [mode, setMode] = useState<'pareto' | 'pomodoro'>(
    currentConfig.mode === 'pomodoro' ? 'pomodoro' : 'pareto'
  );
  const [dailyGoal, setDailyGoal] = useState<number>(userStats.dailyGoalMinutes || 120);
  const [ambientSource, setAmbientSource] = useState<AmbientSourceId>(currentConfig.ambientSource || 'lofi-girl');
  const [keepAwake, setKeepAwake] = useState<boolean>(currentSettings.keepAwake);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(currentSettings.sound);

  if (!isOpen) return null;

  const handleNextToSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStep(2);
  };

  const handleFinishOnboarding = () => {
    const finalName = name.trim() || 'Focus Pioneer';
    const isPareto = mode === 'pareto';

    const updatedStats: Partial<UserStats> = {
      displayName: finalName,
      avatarSeed: selectedColor,
      dailyGoalMinutes: dailyGoal,
    };

    const updatedConfig: Partial<SessionConfig> = {
      mode,
      workDuration: isPareto ? 50 * 60 : 25 * 60,
      restDuration: isPareto ? 10 * 60 : 5 * 60,
      ambientSource,
    };

    const updatedSettings: Partial<TimerSettings> = {
      keepAwake,
      sound: soundEnabled,
    };

    onComplete(updatedStats, updatedConfig, updatedSettings);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-3xl bg-white dark:bg-[#090d16] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 text-left max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ParetoLogo size="xs" variant="inline" />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
              Welcome
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-400">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === 1 ? 'bg-[#092677] text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
              }`}
            >
              1
            </span>
            <span>·</span>
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === 2 ? 'bg-[#092677] text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
              }`}
            >
              2
            </span>
          </div>
        </div>

        {/* STEP 1: ADD YOUR NAME */}
        {step === 1 && (
          <form onSubmit={handleNextToSettings} className="space-y-5 animate-in fade-in duration-150">
            {/* Avatar Preview */}
            <div className="flex justify-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-black/10 transition-transform hover:scale-105"
                style={{ backgroundColor: selectedColor }}
              >
                {(name.trim() || 'P').charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Header copy */}
            <div className="text-center space-y-1">
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                What should we call you?
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Add your name to personalize your streak and study room presence.
              </p>
            </div>

            {/* Name Input */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                Your Name / Nickname
              </label>
              <input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex, Sarah, David"
                maxLength={28}
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-[#092677] focus:ring-2 focus:ring-[#092677]/15 transition-all shadow-2xs"
              />
            </div>

            {/* Color Swatch Picker */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-2">
                Choose Profile Badge Color
              </label>
              <div className="flex items-center justify-center gap-3">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className={`w-8 h-8 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                      selectedColor === c
                        ? 'scale-115 ring-2 ring-offset-2 ring-[#092677] dark:ring-offset-slate-900 shadow-xs'
                        : 'hover:scale-105 opacity-80'
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Select color ${c}`}
                  >
                    {selectedColor === c && <Check className="w-4 h-4 text-white stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Action to Step 2 */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-[#092677] hover:bg-[#071e5e] active:scale-98 text-white font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-[#092677]/25 transition-all cursor-pointer"
              >
                <span>Continue to Edit Settings</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: EDIT YOUR SETTINGS BEFORE REACHING DASHBOARD */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Edit Your Focus Settings
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Set up your default interval rhythm, daily goal, and sound before reaching the dashboard.
              </p>
            </div>

            {/* Focus Rhythm Mode */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                Default Focus Rhythm
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode('pareto')}
                  className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                    mode === 'pareto'
                      ? 'bg-[#092677] text-white border-[#092677] shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-black">Pareto 80/20</div>
                  <div className="text-[10px] font-mono opacity-80 mt-0.5">50m Focus · 10m Pause</div>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('pomodoro')}
                  className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                    mode === 'pomodoro'
                      ? 'bg-[#092677] text-white border-[#092677] shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-black">Pomodoro</div>
                  <div className="text-[10px] font-mono opacity-80 mt-0.5">25m Focus · 5m Pause</div>
                </button>
              </div>
            </div>

            {/* Daily Goal Target */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                Daily Focus Goal
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[60, 90, 120, 180].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDailyGoal(mins)}
                    className={`py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      dailyGoal === mins
                        ? 'bg-[#092677] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            {/* Ambient Sound Selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                Default Ambience
              </label>
              <div className="grid grid-cols-2 gap-2">
                {AMBIENT_PRESETS.slice(0, 4).map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setAmbientSource(preset.id)}
                    className={`p-2.5 rounded-xl text-left border text-xs font-bold truncate transition-all cursor-pointer ${
                      ambientSource === preset.id
                        ? 'bg-[#092677] text-white border-[#092677] shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Phone Shield Toggles */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2.5">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Keep Screen Awake
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Stops display from sleeping during timer
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={keepAwake}
                  onChange={(e) => setKeepAwake(e.target.checked)}
                  className="w-4 h-4 accent-[#092677] rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-200/60 dark:border-slate-700">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Completion Chimes
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Play audio chime when focus set ends
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="w-4 h-4 accent-[#092677] rounded cursor-pointer"
                />
              </label>
            </div>

            {/* Navigation Actions */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3.5 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleFinishOnboarding}
                className="flex-1 py-3.5 rounded-2xl bg-[#092677] hover:bg-[#071e5e] active:scale-98 text-white font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-[#092677]/25 transition-all cursor-pointer"
              >
                <span>Enter Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
