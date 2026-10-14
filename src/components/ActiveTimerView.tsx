import React, { useEffect, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Home,
  Plus,
  Minus,
  SlidersHorizontal,
} from 'lucide-react';
import { SessionConfig, SessionPhase, TimerSettings } from '../types';
import { YouTubeAmbientPlayer } from './YouTubeAmbientPlayer';

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
}

const RING_RADIUS = 100;
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
}) => {
  const [showAdjustMenu, setShowAdjustMenu] = useState(false);

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

  const totalPhaseDuration = phase === 'work' ? config.workDuration : config.restDuration;
  const progressFraction = totalPhaseDuration > 0 ? remainingSeconds / totalPhaseDuration : 0;
  const strokeDashoffset = CIRCUMFERENCE * (1 - Math.max(0, Math.min(1, progressFraction)));

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isEnding = remainingSeconds <= 5 && remainingSeconds > 0;
  const isWork = phase === 'work';

  return (
    <div className="w-full max-w-md mx-auto px-4 py-3 flex flex-col justify-between min-h-[82vh]">
      {/* Top Bar Navigation & Set Counter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <button
            type="button"
            onClick={onHome}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Return to Setup"
          >
            <Home className="w-5 h-5" />
          </button>

          {/* Stepper for sets */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onUpdateTotalSets(Math.max(currentSet, config.totalSets - 1))}
              disabled={config.totalSets <= currentSet || config.totalSets <= 1}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none"
              title="One fewer set"
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="text-center">
              <span className="font-mono font-black text-sm text-[#092677] dark:text-blue-400">
                Set {currentSet} of {config.totalSets}
              </span>
              <span className="text-[10px] text-slate-400 block -mt-0.5">
                {isWork ? 'Deep Focus Phase' : 'Recharge Break'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onUpdateTotalSets(config.totalSets + 1)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800"
              title="Add one more set"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowAdjustMenu(!showAdjustMenu)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Adjust time"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Timeline dots representing completed / active / pending sets */}
        <div className="flex items-center justify-center gap-1.5 px-4 py-1">
          {Array.from({ length: config.totalSets }).map((_, idx) => {
            const setIndex = idx + 1;
            const isCompleted = setIndex < currentSet;
            const isCurrent = setIndex === currentSet;

            return (
              <div key={idx} className="flex items-center">
                <div
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                    isCompleted
                      ? 'bg-[#af1b3f] ring-2 ring-[#af1b3f]/30'
                      : isCurrent
                      ? 'bg-[#092677] ring-4 ring-[#092677]/20 scale-125'
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
                {idx < config.totalSets - 1 && (
                  <div
                    className={`h-0.5 w-4 sm:w-6 transition-colors ${
                      isCompleted ? 'bg-[#af1b3f]' : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Adjust Duration Drawer */}
      {showAdjustMenu && (
        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg animate-in fade-in space-y-2">
          <div className="text-xs font-bold text-slate-600 dark:text-slate-400 text-center">
            Quick Adjust Current Phase
          </div>
          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => onAdjustDuration(-60)}
              className="py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold hover:bg-slate-200"
            >
              -1 min
            </button>
            <button
              type="button"
              onClick={() => onAdjustDuration(60)}
              className="py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold hover:bg-slate-200"
            >
              +1 min
            </button>
            <button
              type="button"
              onClick={() => onAdjustDuration(300)}
              className="py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold hover:bg-slate-200"
            >
              +5 min
            </button>
            <button
              type="button"
              onClick={() => onAdjustDuration(600)}
              className="py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold hover:bg-slate-200"
            >
              +10 min
            </button>
          </div>
        </div>
      )}

      {/* Circular SVG Timer Stage */}
      <div className="flex flex-col items-center justify-center my-auto py-4">
        {/* Phase Pill */}
        <div
          className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wide uppercase mb-6 shadow-xs ${
            isWork
              ? 'bg-[#092677]/10 dark:bg-blue-950/40 text-[#092677] dark:text-blue-300 border border-[#092677]/20'
              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200'
          }`}
        >
          {isWork ? '🎯 Focus Set' : '☕ Rest & Pause'}
        </div>

        {/* Ring */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 240 240">
            {/* Background track */}
            <circle
              cx="120"
              cy="120"
              r={RING_RADIUS}
              className="stroke-slate-200 dark:stroke-slate-800"
              strokeWidth="14"
              fill="none"
            />
            {/* Animated progress ring */}
            <circle
              cx="120"
              cy="120"
              r={RING_RADIUS}
              stroke={isEnding ? '#ef4444' : isWork ? '#af1b3f' : '#10b981'}
              strokeWidth="14"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              className="transition-[stroke-dashoffset] duration-200 ease-linear"
            />
          </svg>

          {/* Center Digital Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
            <span
              className={`font-mono-numbers text-5xl sm:text-6xl font-black tracking-tight ${
                isEnding ? 'text-red-500 animate-pulse' : 'text-slate-900 dark:text-white'
              }`}
            >
              {formattedTime}
            </span>

            <span className="text-xs font-semibold text-slate-500 mt-1">
              {isRunning ? 'Counting down' : 'Paused'}
            </span>
          </div>
        </div>
      </div>

      {/* Floating Ambient Lo-Fi / Noise Player with Chime Toggle */}
      <div className="mb-4 space-y-2">
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
          onToggleSoundEnabled={(enabled) => onUpdateAmbientVolume(enabled ? (settings.ambientVolume > 0 ? settings.ambientVolume : 0.65) : 0)}
        />
      </div>

      {/* Bottom Control Bar */}
      <div className="grid grid-cols-3 gap-3 items-center">
        {/* Reset Button */}
        <button
          type="button"
          onClick={onReset}
          className="flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 active:scale-95 transition-all shadow-2xs"
          title="Reset timer"
        >
          <RotateCcw className="w-5 h-5" />
          <span className="text-[10px] font-bold">Reset</span>
        </button>

        {/* Big Primary Play/Pause Button */}
        <button
          type="button"
          onClick={onTogglePlayPause}
          className={`flex flex-col items-center justify-center gap-1 py-4 px-3 rounded-2xl text-white font-extrabold shadow-lg active:scale-95 transition-all cursor-pointer ${
            isRunning
              ? 'bg-[#af1b3f] hover:bg-[#931433] shadow-[#af1b3f]/30'
              : 'bg-[#092677] hover:bg-[#071e5e] shadow-[#092677]/30'
          }`}
          title={isRunning ? 'Pause timer (Space)' : 'Start timer (Space)'}
        >
          {isRunning ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-0.5" />}
          <span className="text-[11px] font-black">{isRunning ? 'Pause' : 'Resume'}</span>
        </button>

        {/* Skip to Next Set Button */}
        <button
          type="button"
          onClick={onSkip}
          className="flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 active:scale-95 transition-all shadow-2xs"
          title="Skip to next phase"
        >
          <SkipForward className="w-5 h-5" />
          <span className="text-[10px] font-bold">Skip</span>
        </button>
      </div>

      {/* Keyboard shortcut hint on desktop */}
      <div className="hidden sm:block text-center mt-2 text-[11px] text-slate-400">
        Press <kbd className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[10px]">Space</kbd> to toggle play/pause
      </div>
    </div>
  );
};
