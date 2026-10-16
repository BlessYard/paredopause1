import React from 'react';
import {
  X,
  Users,
  Brain,
  Sliders,
  Volume2,
  VolumeX,
  Flame,
  Pencil,
  Sparkles,
  ShieldCheck,
  BellOff,
} from 'lucide-react';
import { UserStats, TimerSettings } from '../types';
import { playChimeSound } from '../services/audioEngine';
import { DailyProgressRing } from './DailyProgressRing';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userStats: UserStats;
  settings: TimerSettings;
  onUpdateSettings: (settings: Partial<TimerSettings>) => void;
  onOpenRoom: () => void;
  onOpenStrategist: () => void;
  onOpenSettings: () => void;
  onOpenEditName: () => void;
  onOpenNotificationShield: () => void;
  onOpenOnboarding?: () => void;
  onReplayIntro: () => void;
  isOnline: boolean;
}

export const AppMenuModal: React.FC<Props> = ({
  isOpen,
  onClose,
  userStats,
  settings,
  onUpdateSettings,
  onOpenRoom,
  onOpenStrategist,
  onOpenSettings,
  onOpenEditName,
  onOpenNotificationShield,
  onOpenOnboarding,
  onReplayIntro,
  isOnline,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm h-full max-h-screen bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#092677] text-white flex items-center justify-center font-black text-xs">
              P
            </div>
            <span className="font-extrabold text-sm text-[#092677] dark:text-white">
              Navigation Menu
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-5 space-y-4 flex-1">
          {/* User Profile Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-xs"
                  style={{ backgroundColor: userStats.avatarSeed }}
                >
                  {userStats.displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight truncate max-w-[150px]">
                    {userStats.displayName}
                  </h4>
                  <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                    {userStats.friendCode}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenEditName();
                }}
                className="px-2 py-1 rounded-lg text-[11px] font-bold text-[#092677] dark:text-blue-400 hover:bg-white dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-600 flex items-center gap-1 cursor-pointer"
              >
                <Pencil className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>

            {/* Visual Progress Ring in Profile Card */}
            <div className="pt-2 border-t border-slate-200/70 dark:border-slate-700/60">
              <DailyProgressRing
                variant="compact"
                size="sm"
                todayMinutes={userStats.todayMinutes || 0}
                dailyGoalMinutes={userStats.dailyGoalMinutes || 120}
                currentStreak={userStats.currentStreak || 1}
                className="bg-white/80 dark:bg-slate-900/60 shadow-none border-slate-200/60 dark:border-slate-700/60"
              />
            </div>
          </div>

          {/* Primary Nav Actions */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">
              Features & Modes
            </span>

            {/* Live Study Room */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenRoom();
              }}
              className="w-full p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#092677] dark:hover:border-blue-400 flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-[#092677] dark:text-blue-400 group-hover:scale-105 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      Live Study Room
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Study with peers in real-time
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-400 group-hover:text-[#092677] font-bold">
                →
              </span>
            </button>

            {/* Executive Chronobiology Strategist */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenStrategist();
              }}
              className="w-full p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      Chronobiology Strategist
                    </span>
                    <span className="text-[9px] font-black uppercase text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950 px-1 rounded">
                      AI
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Circadian focus scheduling
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-400 group-hover:text-indigo-600 font-bold">
                →
              </span>
            </button>

            {/* Settings Modal */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="w-full p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-400 flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:scale-105 transition-transform">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 dark:text-white block">
                    Preferences & Settings
                  </span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Durations, wake lock & chimes
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-400 group-hover:text-slate-700 font-bold">
                →
              </span>
            </button>

            {/* Notification Shield (Stop Phone Notifications) */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenNotificationShield();
              }}
              className="w-full p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-rose-400 flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-[#af1b3f] group-hover:scale-105 transition-transform">
                  <BellOff className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      Notification Shield
                    </span>
                    <span className="text-[9px] font-black uppercase text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950 px-1 rounded">
                      DND
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Stop phone alerts & silence notifications
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-400 group-hover:text-rose-600 font-bold">
                →
              </span>
            </button>

            {/* Replay Motion Graphics Intro */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onReplayIntro();
              }}
              className="w-full p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-400 flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 dark:text-white block">
                    Replay Motion Graphics
                  </span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Opal startup intro
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-400 group-hover:text-slate-700 font-bold">
                →
              </span>
            </button>

            {/* Run Setup Wizard (Name & Settings) */}
            {onOpenOnboarding && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenOnboarding();
                }}
                className="w-full p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#092677] dark:hover:border-blue-400 flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-[#092677] dark:text-blue-400 group-hover:scale-105 transition-transform">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white block">
                      Setup Wizard
                    </span>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Re-run name & settings onboarding
                    </p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 group-hover:text-[#092677] font-bold">
                  →
                </span>
              </button>
            )}
          </div>

          {/* Quick Controls */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">
              Quick Controls
            </span>

            {/* Sound Toggle */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {settings.sound ? (
                  <Volume2 className="w-4 h-4 text-[#af1b3f]" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Chime Alarms
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {settings.sound ? 'Sound enabled' : 'Muted'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const nextSound = !settings.sound;
                  onUpdateSettings({ sound: nextSound });
                  if (nextSound) {
                    playChimeSound(settings.chimeSoundId, settings.chimeVolume);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  settings.sound
                    ? 'bg-[#af1b3f] text-white shadow-xs'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {settings.sound ? 'Mute' : 'Unmute'}
              </button>
            </div>

            {/* Offline Status indicator */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>PWA Offline Engine</span>
              </span>
              <span
                className={`font-mono font-bold ${
                  isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'
                }`}
              >
                {isOnline ? 'Online Ready' : 'Offline Mode'}
              </span>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-[10px] text-slate-400 font-medium">
            ParetoPause • 80% results from 20% effort
          </p>
        </div>
      </div>
    </div>
  );
};
