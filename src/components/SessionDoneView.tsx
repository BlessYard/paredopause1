import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Flame, Trophy, RotateCcw, Home, Clock, Award } from 'lucide-react';
import { SessionConfig, UserStats } from '../types';

interface Props {
  config: SessionConfig;
  userStats: UserStats;
  onRestart: () => void;
  onHome: () => void;
  onOpenLeaderboard: () => void;
}

export const SessionDoneView: React.FC<Props> = ({
  config,
  userStats,
  onRestart,
  onHome,
  onOpenLeaderboard,
}) => {
  useEffect(() => {
    // Fire celebratory confetti on mount
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#092677', '#af1b3f', '#10b981', '#f59e0b'],
      });
    } catch (_) {}
  }, []);

  const totalMinutes = Math.round((config.workDuration * config.totalSets) / 60);

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8 flex flex-col items-center justify-center text-center space-y-6">
      {/* Celebration Icon */}
      <div className="relative">
        <div className="w-24 h-24 rounded-3xl bg-linear-to-br from-[#092677] to-[#af1b3f] flex items-center justify-center text-white shadow-2xl shadow-[#af1b3f]/30 animate-bounce">
          <Trophy className="w-12 h-12 text-amber-300" />
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Session Complete!
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          You mastered all {config.totalSets} focus sets with Pareto discipline.
        </p>
      </div>

      {/* Recap Stats Cards */}
      <div className="grid grid-cols-3 gap-3 w-full">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-center gap-1 text-amber-500 font-extrabold text-xl font-mono">
            <Flame className="w-4 h-4 fill-current" />
            <span>{userStats.currentStreak}d</span>
          </div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block mt-0.5">
            Daily Streak
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-center gap-1 text-[#092677] dark:text-blue-400 font-extrabold text-xl font-mono">
            <Clock className="w-4 h-4" />
            <span>{totalMinutes}m</span>
          </div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block mt-0.5">
            Focus Logged
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-center gap-1 text-[#af1b3f] font-extrabold text-xl font-mono">
            <Award className="w-4 h-4" />
            <span>{config.totalSets}</span>
          </div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block mt-0.5">
            Sets Done
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 w-full pt-4">
        <button
          type="button"
          onClick={onRestart}
          className="w-full py-4 rounded-2xl bg-[#092677] hover:bg-[#071e5e] active:scale-98 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-[#092677]/25 transition-all cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Restart Same Session</span>
        </button>

        <button
          type="button"
          onClick={onOpenLeaderboard}
          className="w-full py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-xs"
        >
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>View Updated Leaderboard</span>
        </button>

        <button
          type="button"
          onClick={onHome}
          className="w-full py-3 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Return to Setup</span>
        </button>
      </div>
    </div>
  );
};
