import React, { useState } from 'react';
import {
  Flame,
  CheckCircle2,
  Sparkles,
  Sliders,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface DailyProgressRingProps {
  todayMinutes: number;
  dailyGoalMinutes: number;
  sessionProjectedMinutes?: number;
  currentStreak?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'card' | 'compact' | 'ring-only';
  onUpdateGoal?: (newGoal: number) => void;
  onAdjustTodayMinutes?: (delta: number) => void;
  className?: string;
}

const PRESET_GOALS = [45, 60, 90, 120, 150, 180, 240];

/**
 * DailyProgressRing
 * High-precision circular progress visualization representing user's daily focus progress
 * (todayMinutes / dailyGoalMinutes) with projected session arc, streak pill, and goal calibration.
 */
export const DailyProgressRing: React.FC<DailyProgressRingProps> = ({
  todayMinutes = 0,
  dailyGoalMinutes = 120,
  sessionProjectedMinutes = 0,
  currentStreak = 1,
  size = 'md',
  variant = 'card',
  onUpdateGoal,
  onAdjustTodayMinutes,
  className = '',
}) => {
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  const goal = Math.max(15, dailyGoalMinutes || 120);
  const minutes = Math.max(0, todayMinutes || 0);
  const percent = Math.round((minutes / goal) * 100);
  const isGoalReached = minutes >= goal;
  const remainingMinutes = Math.max(0, goal - minutes);

  // SVG Geometry Constants
  // Center: 60, 60. Radius: 48. Circumference: 2 * PI * 48 = 301.59
  const radius = 48;
  const circumference = 2 * Math.PI * radius;

  // Fraction clamped between 0 and 1 for the circular arc
  const progressFraction = Math.min(1, minutes / goal);
  const strokeDashoffset = circumference * (1 - progressFraction);

  // Projected progress calculation
  const projectedTotal = minutes + Math.max(0, sessionProjectedMinutes);
  const projectedFraction = Math.min(1, projectedTotal / goal);
  const projectedOffset = circumference * (1 - projectedFraction);

  // Size configurations
  const dim = {
    sm: { box: 80, stroke: 7, text: 'text-base', subText: 'text-[9px]' },
    md: { box: 104, stroke: 9, text: 'text-2xl', subText: 'text-[10px]' },
    lg: { box: 128, stroke: 10, text: 'text-3xl', subText: 'text-xs' },
  }[size];

  // Ring SVG Component
  const RingSVG = (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: dim.box, height: dim.box }}
    >
      <svg
        width={dim.box}
        height={dim.box}
        viewBox="0 0 120 120"
        className="-rotate-90 select-none overflow-visible"
      >
        <defs>
          {/* Brand In-Progress Gradient: Navy (#092677) to Crimson (#af1b3f) */}
          <linearGradient id="dailyGoalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#092677" />
            <stop offset="65%" stopColor="#af1b3f" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>

          {/* Goal Completed Celebration Gradient: Emerald to Teal */}
          <linearGradient id="goalMetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>

          {/* Projected Arc Gradient */}
          <linearGradient id="projectedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#af1b3f" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#092677" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Outer Background Track */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="currentColor"
          strokeWidth={dim.stroke}
          fill="none"
          className="text-slate-200/80 dark:text-slate-800"
        />

        {/* Projected Future Session Arc (Ghost ring) */}
        {!isGoalReached && sessionProjectedMinutes > 0 && projectedFraction > progressFraction && (
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="url(#projectedGradient)"
            strokeWidth={dim.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={projectedOffset}
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-700 ease-out"
          />
        )}

        {/* Main Progress Ring */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke={isGoalReached ? 'url(#goalMetGradient)' : 'url(#dailyGoalGradient)'}
          strokeWidth={dim.stroke}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-700 ease-out"
          style={{
            filter: isGoalReached
              ? 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.4))'
              : 'drop-shadow(0 0 6px rgba(175, 27, 63, 0.25))',
          }}
        />
      </svg>

      {/* Center Metrics Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
        <span
          className={`font-mono font-black tracking-tight leading-none ${dim.text} ${
            isGoalReached
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-900 dark:text-white'
          }`}
        >
          {minutes}
          <span className="text-[10px] font-sans font-bold text-slate-400 ml-0.5">m</span>
        </span>
        <span className={`font-mono font-bold text-slate-400 dark:text-slate-500 mt-0.5 ${dim.subText}`}>
          {percent}%
        </span>
      </div>
    </div>
  );

  // Variant: Just the ring
  if (variant === 'ring-only') {
    return <div className={`inline-block ${className}`}>{RingSVG}</div>;
  }

  // Variant: Compact row layout
  if (variant === 'compact') {
    return (
      <div
        className={`flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs ${className}`}
      >
        {RingSVG}
        <div className="flex-1 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-900 dark:text-white">
              Daily Focus Goal
            </span>
            <span className="font-mono text-xs font-bold text-[#092677] dark:text-blue-400">
              {minutes}/{goal}m
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {isGoalReached ? '🎉 Goal accomplished!' : `${remainingMinutes}m remaining`}
          </p>
        </div>
      </div>
    );
  }

  // Default Variant: Full Featured Card for Main Setup Dashboard
  return (
    <div
      className={`p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs text-left relative overflow-hidden transition-all ${className}`}
    >
      {/* Background Accent glow */}
      <div
        className={`absolute -top-12 -right-12 w-36 h-36 rounded-full pointer-events-none blur-2xl transition-opacity duration-700 ${
          isGoalReached ? 'bg-emerald-500/10 opacity-100' : 'bg-[#092677]/8 opacity-70'
        }`}
      />

      {/* Top Header Row */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs transition-colors ${
              isGoalReached
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400'
                : 'bg-[#092677]/10 text-[#092677] dark:bg-blue-950/60 dark:text-blue-300'
            }`}
          >
            {isGoalReached ? (
              <Sparkles className="w-4 h-4 fill-current animate-spin-slow" />
            ) : (
              <span className="font-mono text-[11px] font-black">{percent}%</span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                Daily Focus Progress
              </h3>
              {isGoalReached && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide bg-emerald-500 text-white animate-pulse">
                  Goal Met
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              Today's deep work vs. your target
            </p>
          </div>
        </div>

        {/* Goal Edit Button & Streak */}
        <div className="flex items-center gap-1.5">
          {onUpdateGoal && (
            <button
              type="button"
              onClick={() => setIsEditingGoal(!isEditingGoal)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                isEditingGoal
                  ? 'bg-[#092677] text-white border-[#092677]'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
              }`}
              title="Change daily goal"
            >
              <Sliders className="w-3 h-3" />
              <span>{goal}m Target</span>
              {isEditingGoal ? (
                <ChevronUp className="w-3 h-3 ml-0.5" />
              ) : (
                <ChevronDown className="w-3 h-3 ml-0.5" />
              )}
            </button>
          )}

          {currentStreak > 0 && (
            <div
              className="px-2 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center gap-1 text-[11px] font-bold"
              title={`${currentStreak} day streak`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-current" />
              <span>{currentStreak}d</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Body: Progress Ring + Stat Readout */}
      <div className="flex items-center gap-4 py-1">
        {/* The SVG Visual Progress Ring */}
        {RingSVG}

        {/* Progress Narrative */}
        <div className="flex-1 space-y-1.5 min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {minutes}
              <span className="text-xs font-medium text-slate-400 ml-0.5">m logged</span>
            </span>
            <span className="text-xs text-slate-400 font-medium truncate">
              / {goal}m goal
            </span>
          </div>

          {/* Contextual Status */}
          {isGoalReached ? (
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
              <span>Target crushed! Focus streak extended.</span>
            </div>
          ) : (
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                {remainingMinutes}m remaining today
              </div>
              {sessionProjectedMinutes > 0 && (
                <div className="text-[11px] font-medium text-[#af1b3f] dark:text-rose-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#af1b3f] animate-pulse" />
                  <span>+{sessionProjectedMinutes}m planned in this session</span>
                </div>
              )}
            </div>
          )}

          {/* Quick Progress Indicator Bar */}
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className={`h-full transition-all duration-500 ${
                isGoalReached
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-[#092677] to-[#af1b3f]'
              }`}
              style={{ width: `${Math.min(100, percent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Collapsible Goal Settings Drawer */}
      {isEditingGoal && onUpdateGoal && (
        <div className="mt-3.5 pt-3.5 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Adjust Daily Goal:
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onUpdateGoal(Math.max(15, goal - 15))}
                disabled={goal <= 15}
                className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center disabled:opacity-30 transition-colors cursor-pointer"
                title="Decrease 15 min"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="font-mono text-xs font-black text-slate-900 dark:text-white px-1.5 min-w-10 text-center">
                {goal}m
              </span>
              <button
                type="button"
                onClick={() => onUpdateGoal(Math.min(600, goal + 15))}
                disabled={goal >= 600}
                className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center disabled:opacity-30 transition-colors cursor-pointer"
                title="Increase 15 min"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
            {PRESET_GOALS.map((preset) => {
              const isSelected = goal === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onUpdateGoal(preset)}
                  className={`py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
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

          {/* Quick Calibration: Manually add/remove minutes */}
          {onAdjustTodayMinutes && (
            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span>Calibrate today's logged minutes:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onAdjustTodayMinutes(-15)}
                  disabled={minutes <= 0}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 text-[10px] font-bold cursor-pointer"
                >
                  -15m
                </button>
                <button
                  type="button"
                  onClick={() => onAdjustTodayMinutes(15)}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold cursor-pointer"
                >
                  +15m
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingGoal(false)}
                  className="px-2.5 py-0.5 rounded-lg bg-[#092677] text-white text-[10px] font-bold ml-1 hover:bg-[#071e5e] cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
