import React, { useEffect, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  FastForward,
  Home,
  Plus,
  Minus,
  Sparkles,
  SlidersHorizontal,
  BellOff,
} from 'lucide-react';
import { SessionConfig, SessionPhase, TimerSettings } from '../types';
import { YouTubeAmbientPlayer } from './YouTubeAmbientPlayer';
import { triggerHaptic } from '../services/notificationService';

interface Props {
  config: SessionConfig;
  settings: TimerSettings;
  currentSet: number;
  phase: SessionPhase;
  remainingSeconds: number;
  isRunning: boolean;
  onTogglePlayPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  onAdjustDuration: (deltaSeconds: number) => void;
  onHome: () => void;
  onUpdateTotalSets: (newTotal: number) => void;
  onUpdateAmbientVolume: (vol: number) => void;
  onSelectAmbientSource: (id: any) => void;
  focusTaskTitle?: string;
  onOpenNotificationShield?: () => void;
}

const RING_RADIUS = 96;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export const ActiveTimerView: React.FC<Props> = ({
  config,
  settings,
  currentSet,
  phase,
  remainingSeconds,
  isRunning,
  onTogglePlayPause,
  onReset,
  onSkip,
  onAdjustDuration,
  onHome,
  onUpdateTotalSets,
  onUpdateAmbientVolume,
  onSelectAmbientSource,
  focusTaskTitle,
  onOpenNotificationShield,
}) => {
  const [showAdjust, setShowAdjust] = useState(false);

  // Keyboard shortcut listener (Spacebar to toggle play/pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        const target = e.target as HTMLElement;
        if (target && ['input', 'textarea', 'select'].includes(target.tagName.toLowerCase())) {
          return;
        }
        e.preventDefault();
        onTogglePlayPause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTogglePlayPause]);

  const getOrdinal = (n: number) => {
    if (n === 1) return '1st';
    if (n === 2) return '2nd';
    if (n === 3) return '3rd';
    return `${n}th`;
  };

  const isWork = phase === 'work';
  const isFinalSet = currentSet >= config.totalSets;
  const totalPhaseDuration = isWork ? config.workDuration : config.restDuration;
  const progressFraction = totalPhaseDuration > 0 ? remainingSeconds / totalPhaseDuration : 0;
  const strokeDashoffset = CIRCUMFERENCE * (1 - Math.max(0, Math.min(1, progressFraction)));

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isEnding = remainingSeconds <= 5 && remainingSeconds > 0;

  const handleHeroAction = () => {
    triggerHaptic(80);
    onSkip(); // advances to the next phase / set
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-2 flex flex-col justify-between min-h-[82vh]">
      {/* Top Bar Navigation: Clean and Minimal */}
      <div className="flex items-center justify-between py-2">
        <button
          type="button"
          onClick={onHome}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Return to Setup"
        >
          <Home className="w-5 h-5" />
        </button>

        {/* Set Counter Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <button
            type="button"
            onClick={() => onUpdateTotalSets(Math.max(currentSet, config.totalSets - 1))}
            disabled={config.totalSets <= currentSet || config.totalSets <= 1}
            className="p-0.5 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:pointer-events-none"
            title="Fewer sets"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <span className="font-mono text-xs font-bold text-[#092677] dark:text-blue-400">
            Set {currentSet} of {config.totalSets}
          </span>

          <button
            type="button"
            onClick={() => onUpdateTotalSets(config.totalSets + 1)}
            className="p-0.5 rounded text-slate-400 hover:text-slate-700"
            title="More sets"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowAdjust(!showAdjust)}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Adjust time"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Timeline Dots: Clean Progress Indicator */}
      <div className="flex items-center justify-center gap-1.5 py-1">
        {Array.from({ length: config.totalSets }).map((_, idx) => {
          const setIndex = idx + 1;
          const isCompleted = setIndex < currentSet;
          const isCurrent = setIndex === currentSet;

          return (
            <div key={idx} className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-500 ring-2 ring-emerald-500/30'
                    : isCurrent
                    ? isWork
                      ? 'bg-[#092677] dark:bg-blue-500 ring-4 ring-[#092677]/20 scale-125'
                      : 'bg-emerald-500 ring-4 ring-emerald-500/20 scale-125'
                    : 'bg-slate-200 dark:bg-slate-800'
                }`}
              />
              {idx < config.totalSets - 1 && (
                <div
                  className={`h-0.5 w-4 sm:w-6 transition-colors ${
                    isCompleted ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Adjust Duration Drawer */}
      {showAdjust && (
        <div className="p-3 my-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md animate-in fade-in space-y-2">
          <div className="text-xs font-bold text-slate-600 dark:text-slate-400 text-center">
            Adjust Timer
          </div>
          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => onAdjustDuration(-60)}
              className="py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold hover:bg-slate-200"
            >
              -1m
            </button>
            <button
              type="button"
              onClick={() => onAdjustDuration(60)}
              className="py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold hover:bg-slate-200"
            >
              +1m
            </button>
            <button
              type="button"
              onClick={() => onAdjustDuration(300)}
              className="py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold hover:bg-slate-200"
            >
              +5m
            </button>
            <button
              type="button"
              onClick={() => onAdjustDuration(600)}
              className="py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold hover:bg-slate-200"
            >
              +10m
            </button>
          </div>
        </div>
      )}

      {/* Main Focus / Set Stage (Clean like the sample!) */}
      <div className="flex flex-col items-center justify-center my-auto py-2 text-center space-y-4">
        {/* Clean Headline matching the sample */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300">
            {isWork ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#af1b3f] animate-pulse" />
                <span>Deep Work Focus</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Rest & Recovery</span>
              </>
            )}
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {isWork ? `Do your ${getOrdinal(currentSet)} set` : 'Take your break'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            {isWork
              ? 'Focus deeply on your work rep. Tap below when finished.'
              : 'Hydrate, stretch, and let your mind refresh before the next set.'}
          </p>

          {isWork && focusTaskTitle && (
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#092677] dark:text-blue-300 bg-blue-50 dark:bg-slate-800 border border-blue-200/80 dark:border-slate-700 max-w-xs truncate mx-auto">
                <span className="truncate">{focusTaskTitle}</span>
              </span>
            </div>
          )}

          {/* Notification Shield / Phone DND trigger */}
          {onOpenNotificationShield && (
            <div className="pt-1.5">
              <button
                type="button"
                onClick={onOpenNotificationShield}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold text-[#af1b3f] dark:text-rose-400 bg-rose-50/80 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 border border-rose-200/80 dark:border-rose-900/60 transition-colors cursor-pointer"
                title="Silence phone notifications & enable DND"
              >
                <BellOff className="w-3 h-3" />
                <span>Silence Phone Notifications</span>
              </button>
            </div>
          )}
        </div>

        {/* Clean Circular Timer Ring */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 240 240">
            {/* Background track */}
            <circle
              cx="120"
              cy="120"
              r={RING_RADIUS}
              className="stroke-slate-200/80 dark:stroke-slate-800/80"
              strokeWidth="12"
              fill="none"
            />
            {/* Animated progress ring */}
            <circle
              cx="120"
              cy="120"
              r={RING_RADIUS}
              stroke={isEnding ? '#ef4444' : isWork ? '#092677' : '#10b981'}
              strokeWidth="12"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              className="transition-[stroke-dashoffset] duration-200 ease-linear"
            />
          </svg>

          {/* Central Countdown Digits */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
            <span
              className={`font-mono tabular-nums text-5xl sm:text-6xl font-black tracking-tight ${
                isEnding
                  ? 'text-red-500 animate-pulse'
                  : isWork
                  ? 'text-[#092677] dark:text-blue-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {formattedTime}
            </span>
            <span className="text-[11px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">
              {isRunning ? 'Timer Running' : 'Paused'}
            </span>
          </div>
        </div>
      </div>

      {/* Floating Ambient Lo-Fi Player (clean and compact) */}
      <div className="my-2">
        <YouTubeAmbientPlayer
          sourceId={config.ambientSource}
          customUrl={config.customYoutubeUrl}
          isPlaying={isRunning}
          isWorkPhase={isWork}
          volume={settings.ambientVolume}
          soundEnabled={settings.ambientVolume > 0 && config.ambientSource !== 'none'}
          pauseMusicDuringBreaks={settings.pauseMusicDuringBreaks}
          onVolumeChange={onUpdateAmbientVolume}
          onSelectSource={onSelectAmbientSource}
          onToggleSoundEnabled={(enabled) =>
            onUpdateAmbientVolume(enabled ? (settings.ambientVolume > 0 ? settings.ambientVolume : 0.65) : 0)
          }
        />
      </div>

      {/* Primary Action Button (The Sample CTA: "I did my set") */}
      <div className="space-y-2 pt-2">
        <button
          type="button"
          onClick={handleHeroAction}
          className={`w-full py-4 px-6 rounded-2xl font-black text-lg tracking-wide shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2.5 cursor-pointer touch-press ${
            isWork
              ? 'bg-[#22d3a7] hover:bg-[#1bb892] text-[#04130f] shadow-[#22d3a7]/30'
              : 'bg-[#092677] hover:bg-[#071e5e] text-white shadow-[#092677]/30'
          }`}
        >
          {isWork ? (
            <>
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              <span>I did my set</span>
            </>
          ) : (
            <>
              <FastForward className="w-6 h-6" />
              <span>{isFinalSet ? 'Complete Session' : 'Start Next Set'}</span>
            </>
          )}
        </button>

        {/* Secondary Quiet Utility Row: Play/Pause & Reset */}
        <div className="flex items-center justify-between px-2 pt-1 text-slate-500 text-xs font-bold">
          <button
            type="button"
            onClick={onTogglePlayPause}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 text-amber-500 fill-current" />
                <span>Pause timer</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-emerald-500 fill-current" />
                <span>Resume timer</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset current set</span>
          </button>
        </div>
      </div>
    </div>
  );
};
