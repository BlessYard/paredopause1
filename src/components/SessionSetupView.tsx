import React, { useState } from 'react';
import {
  Play,
  Clock,
  Music,
  Link,
  Flame,
  CheckCircle2,
  Bell,
  Volume2,
  VolumeX,
  Square,
} from 'lucide-react';
import {
  SessionConfig,
  SessionMode,
  TimerSettings,
  UserStats,
  ChimeSoundId,
} from '../types';
import { AMBIENT_PRESETS } from './YouTubeAmbientPlayer';
import {
  playChimeSound,
  startProceduralAmbient,
  stopProceduralAmbient,
  unlockAudio,
} from '../services/audioEngine';

interface Props {
  config: SessionConfig;
  settings: TimerSettings;
  onUpdateConfig: (updated: Partial<SessionConfig>) => void;
  onUpdateSettings: (updated: Partial<TimerSettings>) => void;
  onStartSession: () => void;
  onOpenLeaderboard: () => void;
  userStats: UserStats;
}

const SET_OPTIONS = [1, 2, 3, 4, 5, 6, 8];

const CHIME_CHOICES: { id: ChimeSoundId; name: string }[] = [
  { id: 'zen', name: 'Zen Bowl' },
  { id: 'bell', name: 'Gym Bell' },
  { id: 'marimba', name: 'Marimba' },
  { id: 'triple', name: 'Triple Beep' },
  { id: 'rising', name: 'Rising Chime' },
];

export const SessionSetupView: React.FC<Props> = ({
  config,
  settings,
  onUpdateConfig,
  onUpdateSettings,
  onStartSession,
  onOpenLeaderboard,
  userStats,
}) => {
  const [showCustomInput, setShowCustomInput] = useState(config.ambientSource === 'custom-youtube');
  const [ambientTesting, setAmbientTesting] = useState(false);

  const selectMode = (mode: SessionMode) => {
    if (mode === 'pareto') {
      onUpdateConfig({ mode, workDuration: 50 * 60, restDuration: 10 * 60 });
    } else if (mode === 'pomodoro') {
      onUpdateConfig({ mode, workDuration: 25 * 60, restDuration: 5 * 60 });
    } else if (mode === 'sprint') {
      onUpdateConfig({ mode, workDuration: 40 * 60, restDuration: 10 * 60 });
    } else {
      onUpdateConfig({ mode });
    }
  };

  const formatMin = (sec: number) => Math.round(sec / 60);

  // Total session calculation
  const totalWorkMinutes = (config.workDuration * config.totalSets) / 60;
  const totalRestMinutes = (config.restDuration * (config.totalSets - 1)) / 60;
  const totalDurationMinutes = totalWorkMinutes + totalRestMinutes;

  const handleTestChime = () => {
    unlockAudio();
    playChimeSound(settings.chimeSoundId, settings.chimeVolume);
  };

  const handleToggleAmbientTest = () => {
    unlockAudio();
    if (ambientTesting) {
      stopProceduralAmbient();
      setAmbientTesting(false);
    } else {
      const type =
        config.ambientSource === 'rainy-cafe'
          ? 'rainy-cafe'
          : config.ambientSource === 'offline-brown'
          ? 'offline-brown'
          : config.ambientSource === 'offline-binaural'
          ? 'offline-binaural'
          : 'lofi-beats';
      startProceduralAmbient(type, settings.ambientVolume);
      setAmbientTesting(true);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 space-y-6">
      {/* Brand & Streak Pill Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#092677] dark:text-white flex items-center gap-1.5">
            Pareto<span className="text-[#af1b3f]">Pause</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">80% Focus · 20% Rest · 100% Flow</p>
        </div>

        {/* Streak Pill */}
        <button
          type="button"
          onClick={onOpenLeaderboard}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold shadow-2xs hover:scale-105 active:scale-95 transition-all"
        >
          <Flame className="w-3.5 h-3.5 fill-current text-amber-500 animate-pulse" />
          <span>{userStats.currentStreak} Day Streak</span>
        </button>
      </div>

      {/* Preset Mode Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Focus Discipline Mode
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              {
                id: 'pareto',
                title: 'Pareto 80/20',
                desc: '50 min Focus · 10 min Rest',
                badge: 'Recommended',
              },
              {
                id: 'pomodoro',
                title: 'Pomodoro',
                desc: '25 min Focus · 5 min Rest',
                badge: 'Classic',
              },
              {
                id: 'sprint',
                title: 'Study Sprint',
                desc: '40 min Focus · 10 min Rest',
                badge: 'Intense',
              },
              {
                id: 'custom',
                title: 'Custom Intervals',
                desc: `${formatMin(config.workDuration)}m Focus · ${formatMin(config.restDuration)}m Rest`,
                badge: 'Freeform',
              },
            ] as const
          ).map((m) => {
            const isSelected = config.mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => selectMode(m.id)}
                className={`p-3.5 rounded-2xl text-left border transition-all touch-press ${
                  isSelected
                    ? 'bg-[#092677] text-white border-[#092677] shadow-md ring-2 ring-[#092677]/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-black ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    {m.title}
                  </span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <p className={`text-[11px] leading-snug ${isSelected ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                  {m.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Duration Sliders (Visible when Custom is chosen) */}
      {config.mode === 'custom' && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in duration-200 shadow-xs">
          <div>
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              <span>🎯 Focus Work Duration</span>
              <span className="font-mono text-sm text-[#092677] dark:text-blue-400">
                {formatMin(config.workDuration)} min
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="90"
              step="5"
              value={formatMin(config.workDuration)}
              onChange={(e) => onUpdateConfig({ workDuration: parseInt(e.target.value, 10) * 60 })}
              className="w-full h-2 accent-[#092677] bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              <span>☕ Rest & Pause Duration</span>
              <span className="font-mono text-sm text-[#af1b3f]">
                {formatMin(config.restDuration)} min
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="30"
              step="1"
              value={formatMin(config.restDuration)}
              onChange={(e) => onUpdateConfig({ restDuration: parseInt(e.target.value, 10) * 60 })}
              className="w-full h-2 accent-[#af1b3f] bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Number of Sets */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Number of Sets
          </label>
          <span className="text-xs text-slate-500">
            {config.totalSets} {config.totalSets === 1 ? 'set' : 'sets'} planned
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {SET_OPTIONS.map((count) => {
            const isSelected = config.totalSets === count;
            return (
              <button
                key={count}
                type="button"
                onClick={() => onUpdateConfig({ totalSets: count })}
                className={`py-3 rounded-xl font-mono text-sm font-black transition-all touch-press ${
                  isSelected
                    ? 'bg-[#af1b3f] text-white shadow-md scale-105'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                {count}
              </button>
            );
          })}
        </div>
      </div>

      {/* USER SOUND CONTROL SECTION (Decide Chimes and Background Music) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-[#af1b3f]" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Sound & Audio Controls
            </span>
          </div>
          <span className="text-[11px] text-slate-500">Configure your sound</span>
        </div>

        {/* 1. Timer Completion Chime Toggle & Test */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
              <Bell className="w-4 h-4 text-[#092677] dark:text-blue-400" />
              <span>Chime Alarm on Completion</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestChime}
                disabled={!settings.sound}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-bold disabled:opacity-30 transition-colors"
                title="Hear this chime right now"
              >
                <Play className="w-2.5 h-2.5 fill-current text-[#092677] dark:text-blue-400" />
                <span>Test Chime</span>
              </button>
              <input
                type="checkbox"
                checked={settings.sound}
                onChange={(e) => onUpdateSettings({ sound: e.target.checked })}
                className="w-5 h-5 accent-[#092677] rounded cursor-pointer"
              />
            </div>
          </div>

          {settings.sound && (
            <div className="pt-1.5 space-y-2">
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {CHIME_CHOICES.map((chime) => (
                  <button
                    key={chime.id}
                    type="button"
                    onClick={() => {
                      onUpdateSettings({ chimeSoundId: chime.id });
                      unlockAudio();
                      playChimeSound(chime.id, settings.chimeVolume);
                    }}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all ${
                      settings.chimeSoundId === chime.id
                        ? 'bg-[#092677] text-white border-[#092677]'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {chime.name}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] font-semibold text-slate-500 shrink-0">Chime Vol:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.chimeVolume}
                  onChange={(e) => onUpdateSettings({ chimeVolume: parseFloat(e.target.value) })}
                  className="w-full h-1.5 accent-[#092677] bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] font-mono text-slate-400 w-7 text-right">
                  {Math.round(settings.chimeVolume * 100)}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 2. Background Focus Music / Lo-Fi Audio */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
              <Music className="w-4 h-4 text-[#af1b3f]" />
              <span>Background Focus Music</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleAmbientTest}
                disabled={config.ambientSource === 'none'}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-bold disabled:opacity-30 transition-colors"
                title="Hear sample background sound right now"
              >
                {ambientTesting ? (
                  <>
                    <Square className="w-2.5 h-2.5 fill-current text-red-500" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Play className="w-2.5 h-2.5 fill-current text-[#af1b3f]" />
                    <span>Test Sound</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (config.ambientSource === 'none') {
                    onUpdateConfig({ ambientSource: 'lofi-girl' });
                  } else {
                    onUpdateConfig({ ambientSource: 'none' });
                    stopProceduralAmbient();
                    setAmbientTesting(false);
                  }
                }}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                  config.ambientSource !== 'none'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {config.ambientSource !== 'none' ? 'Music ON' : 'Music OFF'}
              </button>
            </div>
          </div>

          {config.ambientSource !== 'none' && (
            <div className="pt-1.5 space-y-2">
              <div className="grid grid-cols-2 gap-1.5">
                {AMBIENT_PRESETS.filter((p) => p.id !== 'none').slice(0, 4).map((preset) => {
                  const isSelected = config.ambientSource === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        onUpdateConfig({ ambientSource: preset.id });
                        setShowCustomInput(false);
                        if (ambientTesting) {
                          stopProceduralAmbient();
                          setAmbientTesting(false);
                        }
                      }}
                      className={`p-2 rounded-xl text-left border text-xs transition-all ${
                        isSelected
                          ? 'bg-[#af1b3f]/10 dark:bg-[#af1b3f]/25 border-[#af1b3f] text-[#af1b3f] dark:text-rose-300 font-bold'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="truncate text-[11px] font-bold">{preset.title}</div>
                      <div className="text-[10px] text-slate-500 truncate">{preset.subtitle}</div>
                    </button>
                  );
                })}
              </div>

              {/* YouTube stream / custom link options */}
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onUpdateConfig({ ambientSource: 'chill-study' });
                    setShowCustomInput(false);
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-lg border text-[11px] font-bold ${
                    config.ambientSource === 'chill-study'
                      ? 'bg-[#092677] text-white border-[#092677]'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  YouTube Lofi Girl
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateConfig({ ambientSource: 'custom-youtube' });
                    setShowCustomInput(true);
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-lg border text-[11px] font-bold flex items-center justify-center gap-1 ${
                    config.ambientSource === 'custom-youtube'
                      ? 'bg-[#092677] text-white border-[#092677]'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Link className="w-3 h-3" />
                  <span>Custom URL</span>
                </button>
              </div>

              {showCustomInput && (
                <div className="pt-1.5">
                  <input
                    type="text"
                    value={config.customYoutubeUrl}
                    onChange={(e) => onUpdateConfig({ customYoutubeUrl: e.target.value })}
                    placeholder="Paste YouTube Video or Stream URL"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#092677]"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] font-semibold text-slate-500 shrink-0">Music Vol:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.ambientVolume}
                  onChange={(e) => onUpdateSettings({ ambientVolume: parseFloat(e.target.value) })}
                  className="w-full h-1.5 accent-[#af1b3f] bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] font-mono text-slate-400 w-7 text-right">
                  {Math.round(settings.ambientVolume * 100)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Auto-chain Toggle */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
            🔁 Continuous Set Chaining
          </span>
          <span className="text-[11px] text-slate-500">
            {config.autoChain
              ? 'Automatically advances to breaks and next sets'
              : 'Prompts you before starting each subsequent set'}
          </span>
        </div>
        <input
          type="checkbox"
          checked={config.autoChain}
          onChange={(e) => onUpdateConfig({ autoChain: e.target.checked })}
          className="w-5 h-5 accent-[#092677] rounded cursor-pointer"
        />
      </div>

      {/* Session Summary Pill */}
      <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#092677] dark:text-blue-400" />
          <span>Total Session Budget:</span>
        </div>
        <span className="font-mono font-bold text-slate-900 dark:text-white">
          {Math.floor(totalDurationMinutes / 60) > 0 ? `${Math.floor(totalDurationMinutes / 60)}h ` : ''}
          {Math.round(totalDurationMinutes % 60)}m
        </span>
      </div>

      {/* Primary Action Button */}
      <button
        type="button"
        onClick={() => {
          if (ambientTesting) {
            stopProceduralAmbient();
            setAmbientTesting(false);
          }
          unlockAudio();
          onStartSession();
        }}
        className="w-full py-4 rounded-2xl bg-[#092677] hover:bg-[#071e5e] active:scale-98 text-white font-extrabold text-base tracking-wide flex items-center justify-center gap-2.5 shadow-lg shadow-[#092677]/25 transition-all touch-press cursor-pointer"
      >
        <Play className="w-5 h-5 fill-current" />
        <span>Start Focus Session</span>
      </button>
    </div>
  );
};
