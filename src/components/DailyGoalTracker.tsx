import React, { useState } from 'react';
import {
  Target,
  Sparkles,
  Sliders,
  Check,
  Plus,
  Minus,
  CheckCircle2,
  Flame,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { UserStats, SessionConfig } from '../types';

interface Props {
  userStats: UserStats;
  config: SessionConfig;
  onUpdateUserStats: (updated: Partial<UserStats>) => void;
}

const PRESET_GOALS = [45, 60, 90, 120, 150, 180, 240];

export const DailyGoalTracker: React.FC<Props> = ({
  userStats,
  config,
  onUpdateUserStats,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const goal = userStats.dailyGoalMinutes || 120;
  const todayMinutes = userStats.todayMinutes || 0;
  const isGoalReached = todayMinutes >= goal;
  const percent = Math.min(100, Math.round((todayMinutes / goal) * 100));
  const rawPercent = Math.round((todayMinutes / goal) * 100);
  const remaining = Math.max(0, goal - todayMinutes);

  // Minutes that the currently configured session will yield (work duration * total sets)
  const sessionFocusMinutes = Math.round(
    (config.workDuration * config.totalSets) / 60
  );
  const projectedTotal = todayMinutes + sessionFocusMinutes;
  const projectedPercent = Math.min(
    100,
    Math.round((projectedTotal / goal) * 100)
  );
  const projectedBarWidth = Math.max(
    0,
    projectedPercent - percent
  );

  const handleSetGoal = (newGoal: number) => {
    const clamped = Math.max(15, Math.min(600, newGoal));
    onUpdateUserStats({ dailyGoalMinutes: clamped });
  };

  const handleAdjustTodayMinutes = (delta: number) => {
    const next = Math.max(0, todayMinutes + delta);
    onUpdateUserStats({ todayMinutes: next });
  };

  return (
    <div className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs transition-all">
      {/* Top Header Row */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
              isGoalReached
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                : 'bg-blue-50 text-[#092677] dark:bg-blue-950/50 dark:text-blue-300'
            }`}
          >
            {isGoalReached ? (
              <Sparkles className="w-4 h-4 fill-current animate-spin-slow" />
            ) : (
              <Target className="w-4 h-4" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-800 dark:text-slate-100 tracking-tight">
                Daily Focus Goal
              </span>
              {isGoalReached && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wide bg-emerald-500 text-white animate-pulse">
                  Goal Met
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              Deep work target for today
            </p>
          </div>
        </div>

        {/* Goal Edit Button & Percent Badge */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 border transition-all cursor-pointer ${
              isEditing
                ? 'bg-[#092677] text-white border-[#092677]'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
            }`}
            title="Adjust daily target"
          >
            <Sliders className="w-3 h-3" />
            <span>{goal}m</span>
            {isEditing ? (
              <ChevronUp className="w-3 h-3 ml-0.5" />
            ) : (
              <ChevronDown className="w-3 h-3 ml-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Focus Number & Progress Status */}
      <div className="flex items-baseline justify-between mb-2">
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {todayMinutes}
            <span className="text-xs font-medium text-slate-400 ml-0.5">m</span>
          </span>
          <span className="text-xs font-medium text-slate-400">
            / {goal}m daily target
          </span>
        </div>

        <div className="text-right">
          <span
            className={`font-mono text-xs font-black ${
              isGoalReached
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-[#092677] dark:text-blue-400'
            }`}
          >
            {rawPercent}%
          </span>
        </div>
      </div>

      {/* Visual Multi-Segment Progress Bar */}
      <div className="relative w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/80 dark:border-slate-700/60 flex">
        {/* Current Completed Progress */}
        <div
          className={`h-full transition-all duration-500 ease-out ${
            isGoalReached
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
              : 'bg-gradient-to-r from-[#092677] to-[#af1b3f]'
          }`}
          style={{ width: `${percent}%` }}
        />

        {/* Projected Progress from upcoming session */}
        {!isGoalReached && projectedBarWidth > 0 && (
          <div
            className="h-full bg-[#af1b3f]/35 dark:bg-blue-400/30 transition-all duration-300 relative overflow-hidden"
            style={{ width: `${projectedBarWidth}%` }}
            title={`+${sessionFocusMinutes}m from this session`}
          >
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.25)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.25)_50%,rgba(255,255,255,0.25)_75%,transparent_75%,transparent)] bg-[length:10px_10px] animate-pulse" />
          </div>
        )}
      </div>

      {/* Status & Session Contribution Caption */}
      <div className="mt-2 flex items-center justify-between text-[11px]">
        {isGoalReached ? (
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Target reached! Superb focus streak today.</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {remaining}m remaining
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-[#092677] dark:text-blue-400 font-medium">
              +{sessionFocusMinutes}m in this session
            </span>
          </div>
        )}

        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <Flame className="w-3 h-3 text-amber-500" />
          <span>{userStats.currentStreak}d streak</span>
        </div>
      </div>

      {/* Collapsible Goal Customizer Drawer */}
      {isEditing && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Set Daily Deep Work Target:
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleSetGoal(goal - 15)}
                disabled={goal <= 15}
                className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 flex items-center justify-center disabled:opacity-40 transition-colors"
                title="Decrease 15 min"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="font-mono text-xs font-black px-1 text-slate-800 dark:text-slate-200 min-w-10 text-center">
                {goal}m
              </span>
              <button
                type="button"
                onClick={() => handleSetGoal(goal + 15)}
                disabled={goal >= 600}
                className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 flex items-center justify-center disabled:opacity-40 transition-colors"
                title="Increase 15 min"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Quick Target Chips */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
            {PRESET_GOALS.map((preset) => {
              const isSelected = goal === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSetGoal(preset)}
                  className={`py-1.5 px-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#092677] text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  {preset}m
                </button>
              );
            })}
          </div>

          {/* Quick calibration: manual adjustment */}
          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 dark:text-slate-400">
            <span>Calibrate today's logged minutes:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleAdjustTodayMinutes(-15)}
                disabled={todayMinutes <= 0}
                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 disabled:opacity-30 text-[10px] font-bold"
              >
                -15m
              </button>
              <button
                type="button"
                onClick={() => handleAdjustTodayMinutes(15)}
                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-[10px] font-bold"
              >
                +15m
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-2.5 py-0.5 rounded bg-[#092677] text-white text-[10px] font-bold ml-1 hover:bg-[#071e5e]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
