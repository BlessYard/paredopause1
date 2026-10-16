import React, { useState } from 'react';
import {
  Play,
  Flame,
  Music,
  Users,
  CheckCircle2,
  Sliders,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Link as LinkIcon,
  Bell,
  Check,
  Clock,
  Target,
  ArrowRight,
  Volume2,
  Pencil,
  User,
  Brain,
  Zap,
  EyeOff,
  Sun,
  Moon,
  ShieldAlert,
  Copy,
  Code2,
} from 'lucide-react';
import {
  SessionConfig,
  TimerSettings,
  UserStats,
  ProductivityDirectorResult,
  ChronoScheduleOutput,
} from '../types';
import { AMBIENT_PRESETS } from './YouTubeAmbientPlayer';
import { ParetoLogo } from './ParetoLogo';
import { DailyGoalTracker } from './DailyGoalTracker';
import { DailyProgressRing } from './DailyProgressRing';
import { unlockAudio } from '../services/audioEngine';
import { ParetoModeModal } from './ParetoModeModal';
import { request8020Prioritization } from '../services/productivityDirectorService';
import { format12h } from '../services/chronobiologyEngine';

interface Props {
  config: SessionConfig;
  settings: TimerSettings;
  onUpdateConfig: (updated: Partial<SessionConfig>) => void;
  onUpdateSettings: (updated: Partial<TimerSettings>) => void;
  onStartSession: () => void;
  onOpenRoom: () => void;
  onOpenStrategist: () => void;
  userStats: UserStats;
  onUpdateUserStats: (updated: Partial<UserStats>) => void;
  activeTaskTitle?: string;
  onSetActiveTaskTitle?: (title: string) => void;
  chronoSchedule?: ChronoScheduleOutput | null;
}

export type SetupStep = 'mode' | 'sets' | 'ambience';

export const SessionSetupView: React.FC<Props> = ({
  config,
  settings,
  onUpdateConfig,
  onUpdateSettings,
  onStartSession,
  onOpenRoom,
  onOpenStrategist,
  userStats,
  onUpdateUserStats,
  activeTaskTitle,
  onSetActiveTaskTitle,
  chronoSchedule,
}) => {
  const [step, setStep] = useState<SetupStep>('mode');
  const [showCustomUrl, setShowCustomUrl] = useState(config.ambientSource === 'custom-youtube');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userStats.displayName);

  // Pareto 80/20 interactive modal state
  const [isParetoModalOpen, setIsParetoModalOpen] = useState(false);

  // 80/20 Productivity Director State
  const [todoListText, setTodoListText] = useState(
    activeTaskTitle ||
      '1. Finalize system architecture proposal\n2. Client contract risk audit\n3. Clear 35 unread email inbox items\n4. Slack channels triage'
  );
  const [directorCurrentTime, setDirectorCurrentTime] = useState(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
  const [directorEnergyLevel, setDirectorEnergyLevel] = useState(8);
  const [isPrioritizing, setIsPrioritizing] = useState(false);
  const [directorResult, setDirectorResult] = useState<ProductivityDirectorResult | null>(null);

  const formatMin = (sec: number) => Math.round(sec / 60);

  const selectMode = (mode: SessionConfig['mode']) => {
    if (mode === 'pareto') {
      onUpdateConfig({ mode: 'pareto', workDuration: 50 * 60, restDuration: 10 * 60 });
      setIsParetoModalOpen(true);
    } else if (mode === 'pomodoro') {
      onUpdateConfig({ mode: 'pomodoro', workDuration: 25 * 60, restDuration: 5 * 60 });
    } else if (mode === 'custom') {
      onUpdateConfig({ mode: 'custom' });
    }
  };

  const handlePrioritizeWithAI = async () => {
    if (!todoListText.trim()) return;
    setIsPrioritizing(true);
    const duration = config.mode === 'pareto' ? 50 : 25;
    try {
      const result = await request8020Prioritization(
        todoListText,
        directorCurrentTime,
        directorEnergyLevel,
        duration
      );
      setDirectorResult(result);
      if (onSetActiveTaskTitle) {
        onSetActiveTaskTitle(result.oneTask);
      }
    } finally {
      setIsPrioritizing(false);
    }
  };

  const handleStart = () => {
    unlockAudio();
    onStartSession();
  };

  const isMusicOn = config.ambientSource !== 'none';
  const totalWorkMinutes = Math.round((config.workDuration * config.totalSets) / 60);
  const totalRestMinutes = Math.round((config.restDuration * (config.totalSets - 1)) / 60);
  const totalSessionMinutes = totalWorkMinutes + totalRestMinutes;

  const dailyGoal = userStats.dailyGoalMinutes || 120;
  const todayMins = userStats.todayMinutes || 0;
  const goalPercent = Math.min(100, Math.round((todayMins / dailyGoal) * 100));

  const STEPS: { id: SetupStep; label: string; stepNumber: number }[] = [
    { id: 'mode', label: 'Mode', stepNumber: 1 },
    { id: 'sets', label: 'Sets & Goal', stepNumber: 2 },
    { id: 'ambience', label: 'Ambience', stepNumber: 3 },
  ];

  const currentStepIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="w-full max-w-md mx-auto px-4 py-3 flex flex-col justify-between min-h-[82vh]">
      <div>
        {/* Clean Step Progress Indicator (Organized after clicking Next from Landing Page) */}
        {step !== 'mode' && (
          <div className="mb-5 bg-slate-50 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200/70 dark:border-slate-800 animate-in fade-in">
            <div className="grid grid-cols-3 gap-1">
              {STEPS.map((s, idx) => {
                const isActive = s.id === step;
                const isPast = idx < currentStepIndex;

                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStep(s.id)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#092677] text-white shadow-xs'
                        : isPast
                        ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                        isActive
                          ? 'bg-white text-[#092677]'
                          : isPast
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isPast ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : s.stepNumber}
                    </span>
                    <span className="truncate">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 1: LANDING - MOST IMPORTANT FIRST (Focus Mode Selection)
           ========================================================================= */}
        {/* =========================================================================
            STEP 1: LANDING - ONLY TWO THINGS ON THE LANDING PAGE
            Thing 1: Focus Rhythm Mode Selection (with Pareto 80/20 interactive modal)
            Thing 2: What are you planning to work on? (80/20 Productivity Director)
           ========================================================================= */}
        {step === 'mode' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Visual Daily Progress Ring Component */}
            <DailyProgressRing
              todayMinutes={userStats.todayMinutes || 0}
              dailyGoalMinutes={userStats.dailyGoalMinutes || 120}
              sessionProjectedMinutes={totalWorkMinutes}
              currentStreak={userStats.currentStreak || 1}
              onUpdateGoal={(newGoal) => onUpdateUserStats({ dailyGoalMinutes: newGoal })}
              onAdjustTodayMinutes={(delta) =>
                onUpdateUserStats({
                  todayMinutes: Math.max(0, (userStats.todayMinutes || 0) + delta),
                })
              }
            />

            {/* THING 1: FOCUS MODE SELECTION */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    1. Focus Rhythm
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                    Select Focus Mode
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-[#092677] dark:text-blue-400 font-mono">
                  {config.mode === 'pareto'
                    ? '50m Deep · 10m Pause'
                    : config.mode === 'pomodoro'
                    ? '25m Sprint · 5m Pause'
                    : 'Custom Intervals'}
                </span>
              </div>

              {/* Pills */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Pareto 80/20 Pill */}
                <button
                  type="button"
                  onClick={() => selectMode('pareto')}
                  className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer relative overflow-hidden group ${
                    config.mode === 'pareto'
                      ? 'bg-[#092677] text-white border-[#092677] shadow-md shadow-[#092677]/20 ring-2 ring-[#092677]/20 scale-[1.01]'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:border-[#092677]/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black tracking-tight">Pareto 80/20</span>
                    <span
                      className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md ${
                        config.mode === 'pareto'
                          ? 'bg-amber-400 text-slate-900'
                          : 'bg-[#092677]/10 text-[#092677] dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      Featured
                    </span>
                  </div>
                  <div className="text-[11px] font-mono font-bold">50m Focus · 10m Rest</div>
                  <p
                    className={`text-[10px] mt-1 ${
                      config.mode === 'pareto' ? 'text-blue-100' : 'text-slate-500'
                    }`}
                  >
                    Click to pick your 80/20 task
                  </p>
                </button>

                {/* Classic Pomodoro Pill */}
                <button
                  type="button"
                  onClick={() => selectMode('pomodoro')}
                  className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer relative overflow-hidden group ${
                    config.mode === 'pomodoro'
                      ? 'bg-[#092677] text-white border-[#092677] shadow-md shadow-[#092677]/20 ring-2 ring-[#092677]/20 scale-[1.01]'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:border-[#092677]/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black tracking-tight">Pomodoro</span>
                  </div>
                  <div className="text-[11px] font-mono font-bold">25m Focus · 5m Rest</div>
                  <p
                    className={`text-[10px] mt-1 ${
                      config.mode === 'pomodoro' ? 'text-blue-100' : 'text-slate-500'
                    }`}
                  >
                    Brisk sprint rhythm
                  </p>
                </button>
              </div>

              {/* Custom mode link */}
              <div className="flex items-center justify-between pt-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => selectMode(config.mode === 'custom' ? 'pareto' : 'custom')}
                  className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-[#092677] dark:hover:text-blue-400 font-semibold transition-colors cursor-pointer"
                >
                  {config.mode === 'custom'
                    ? 'Using custom intervals'
                    : 'Need custom intervals?'}
                </button>

                {activeTaskTitle && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 truncate max-w-[170px]">
                    Task: {activeTaskTitle}
                  </span>
                )}
              </div>
            </div>

            {/* THING 2: STRICT 80/20 PRODUCTIVITY DIRECTOR CARD ("this div") */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-white via-slate-50 to-blue-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/25 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4 text-left relative">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-xs font-black text-[#092677] dark:text-blue-400 uppercase tracking-wider">
                    80/20 Productivity Director
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#092677]/10 text-[#092677] dark:bg-blue-950 dark:text-blue-300">
                    AI Prioritizer
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug tracking-tight">
                  Act as a strict 80/20 productivity director. Here are the things on my plate today:
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  What are you planning to work on during these sets? (Paste your to-do list)
                </p>
              </div>

              {/* Textarea for to-do list */}
              <div className="relative">
                <textarea
                  value={todoListText}
                  onChange={(e) => setTodoListText(e.target.value)}
                  placeholder="[Insert your tasks / to-do list here]&#10;&#10;e.g.&#10;1. Finalize system architecture proposal&#10;2. Client contract risk audit&#10;3. Clear 35 unread emails&#10;4. Slack channels triage"
                  rows={4}
                  className="w-full px-3.5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-[#092677] focus:ring-2 focus:ring-[#092677]/15 transition-all resize-none shadow-2xs leading-relaxed"
                />
                {todoListText && (
                  <button
                    type="button"
                    onClick={() => setTodoListText('')}
                    className="absolute top-2.5 right-2.5 text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Structured Metadata: Current Time & Energy Level (Clean, no overflow) */}
              <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 space-y-3">
                {/* Row 1: Current Time */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Current time
                  </span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={directorCurrentTime}
                      onChange={(e) => setDirectorCurrentTime(e.target.value)}
                      placeholder="e.g. 08:30 AM"
                      className="w-28 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 text-center outline-none focus:border-[#092677]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setDirectorCurrentTime(
                          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        )
                      }
                      title="Sync to current system time"
                      className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 cursor-pointer transition-colors"
                    >
                      Now
                    </button>
                  </div>
                </div>

                {/* Row 2: Energy Level (1-10) */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Energy level (1-10)
                    </span>
                    <span className="text-[11px] font-mono font-bold text-[#092677] dark:text-blue-400">
                      {directorEnergyLevel}/10 {directorEnergyLevel >= 8 ? '· High' : directorEnergyLevel >= 5 ? '· Moderate' : '· Low'}
                    </span>
                  </div>

                  {/* 10-column full-width grid — fits container width perfectly */}
                  <div className="grid grid-cols-10 gap-1 w-full">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setDirectorEnergyLevel(level)}
                        className={`h-8 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center ${
                          directorEnergyLevel === level
                            ? 'bg-[#092677] text-white shadow-xs scale-105 ring-1 ring-[#092677]'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        aria-label={`Energy level ${level}`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Prioritize Button: [ Prioritize with 80/20 AI ] */}
              <button
                type="button"
                onClick={handlePrioritizeWithAI}
                disabled={isPrioritizing || !todoListText.trim()}
                className="w-full py-3.5 rounded-2xl bg-[#092677] hover:bg-[#071e5e] active:scale-98 text-white font-black text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-[#092677]/25 transition-all cursor-pointer disabled:opacity-40"
              >
                {isPrioritizing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Prioritizing with 80/20 AI...</span>
                  </>
                ) : (
                  <span>Prioritize with 80/20 AI</span>
                )}
              </button>

              {/* Strict 80/20 Director Output Display: "Tell me: 1. ... 2. ... 3. ..." */}
              {directorResult && (
                <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300/90 dark:border-amber-800/90 space-y-3.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-amber-200/80 dark:border-amber-800/60 pb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300">
                      Tell me:
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                      {directorResult.timerDurationMinutes}m Timer Target
                    </span>
                  </div>

                  {/* 1. The ONE task I must set a 25-minute timer for right now */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-black uppercase tracking-wider text-amber-950 dark:text-amber-200">
                      1. The ONE task I must set a {directorResult.timerDurationMinutes}-minute timer for right now:
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/80">
                      <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                        {directorResult.oneTask}
                      </p>
                      <p className="text-[11px] text-amber-900/80 dark:text-amber-300/80 mt-1">
                        {directorResult.rationale}
                      </p>
                    </div>
                  </div>

                  {/* 2. The specific first step to take in the first 2 minutes */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                      2. The specific first step to take in the first 2 minutes:
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {directorResult.firstStep2Min}
                      </p>
                    </div>
                  </div>

                  {/* 3. Exactly what to ignore until this timer ends */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-black uppercase tracking-wider text-rose-900 dark:text-rose-300">
                      3. Exactly what to ignore until this timer ends:
                    </div>
                    <div className="p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60">
                      <ul className="space-y-1.5">
                        {directorResult.ignoreList.map((item, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Quick Lock-in Action */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (onSetActiveTaskTitle) {
                          onSetActiveTaskTitle(directorResult.oneTask);
                        }
                        setStep('sets');
                      }}
                      className="w-full py-3 rounded-xl bg-[#092677] hover:bg-[#071e5e] text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-[#092677]/20 cursor-pointer transition-all"
                    >
                      <span>Lock In Task & Plan Sets →</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pareto 80/20 Interactive Task Mode Modal */}
        <ParetoModeModal
          isOpen={isParetoModalOpen}
          onClose={() => setIsParetoModalOpen(false)}
          onSelectTaskAndApply={(chosenTask) => {
            if (onSetActiveTaskTitle) {
              onSetActiveTaskTitle(chosenTask);
            }
          }}
        />

        {/* =========================================================================
            STEP 2: SETS & DAILY FOCUS GOAL TRACKER
           ========================================================================= */}
        {step === 'sets' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="text-left">
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Plan Your Sets
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Select your set count and see how it moves your daily deep work goal.
              </p>
            </div>

            {/* Custom Sliders if Custom Mode is Active */}
            {config.mode === 'custom' && (
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-2xs">
                <div>
                  <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                    <span className="text-slate-800 dark:text-slate-200">🎯 Focus Work Duration</span>
                    <span className="font-mono text-[#092677] dark:text-blue-400 font-black">
                      {formatMin(config.workDuration)}m
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="90"
                    step="5"
                    value={formatMin(config.workDuration)}
                    onChange={(e) =>
                      onUpdateConfig({ workDuration: parseInt(e.target.value, 10) * 60 })
                    }
                    className="w-full h-2 accent-[#092677] bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                    <span className="text-slate-800 dark:text-slate-200">☕ Rest Break Duration</span>
                    <span className="font-mono text-[#af1b3f] font-black">
                      {formatMin(config.restDuration)}m
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="1"
                    value={formatMin(config.restDuration)}
                    onChange={(e) =>
                      onUpdateConfig({ restDuration: parseInt(e.target.value, 10) * 60 })
                    }
                    className="w-full h-2 accent-[#af1b3f] bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Number of Sets Selector */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-2xs">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Session Sets
                </label>
                <span className="font-mono text-xs font-bold text-[#092677] dark:text-blue-400">
                  {config.totalSets} {config.totalSets === 1 ? 'set' : 'sets'} ({totalWorkMinutes}m focus)
                </span>
              </div>

              <div className="grid grid-cols-6 gap-2">
                {[1, 2, 3, 4, 5, 6].map((count) => {
                  const isSelected = config.totalSets === count;
                  return (
                    <button
                      key={count}
                      type="button"
                      onClick={() => onUpdateConfig({ totalSets: count })}
                      className={`py-3 rounded-xl font-mono text-sm font-black transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#af1b3f] text-white shadow-md scale-105'
                          : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      {count}
                    </button>
                  );
                })}
              </div>

              <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Total time commitment:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  ~{totalSessionMinutes} mins ({totalWorkMinutes}m work + {totalRestMinutes}m break)
                </span>
              </div>
            </div>

            {/* Daily Focus Goal Progress Ring */}
            <DailyProgressRing
              todayMinutes={userStats.todayMinutes || 0}
              dailyGoalMinutes={userStats.dailyGoalMinutes || 120}
              sessionProjectedMinutes={totalWorkMinutes}
              currentStreak={userStats.currentStreak || 1}
              onUpdateGoal={(newGoal) => onUpdateUserStats({ dailyGoalMinutes: newGoal })}
              onAdjustTodayMinutes={(delta) =>
                onUpdateUserStats({
                  todayMinutes: Math.max(0, (userStats.todayMinutes || 0) + delta),
                })
              }
            />

            {/* Circadian Peaks & Focus Windows (Organized on Home Page after clicking Next) */}
            {chronoSchedule ? (
              <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-50/90 via-white to-blue-50/70 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900 shadow-sm space-y-3.5 text-left animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                      Optimal Circadian Schedule
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    Wake {format12h(chronoSchedule.wakeTime)}
                  </span>
                </div>

                {/* 3 Circadian Peaks */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-300 mb-0.5">
                      <Sun className="w-3 h-3" />
                      <span>Morning Peak</span>
                    </div>
                    <div className="text-xs font-black text-slate-900 dark:text-white">
                      {chronoSchedule.circadianPeaks.morningAlertnessPeak.split('(')[0]}
                    </div>
                    <div className="text-[9px] text-amber-700/80 dark:text-amber-400/80 mt-0.5 font-medium">
                      50m Creative Focus
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-rose-800 dark:text-rose-300 mb-0.5">
                      <ShieldAlert className="w-3 h-3 text-rose-600" />
                      <span>Post-Lunch Dip</span>
                    </div>
                    <div className="text-xs font-black text-rose-800 dark:text-rose-300">
                      1:00 PM - 3:00 PM
                    </div>
                    <div className="text-[9px] text-rose-700/80 dark:text-rose-400/80 mt-0.5 font-bold">
                      Strictly Protected
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-800 dark:text-indigo-300 mb-0.5">
                      <Moon className="w-3 h-3" />
                      <span>2nd Wind Peak</span>
                    </div>
                    <div className="text-xs font-black text-slate-900 dark:text-white">
                      {chronoSchedule.circadianPeaks.afternoonSecondWind.split('(')[0]}
                    </div>
                    <div className="text-[9px] text-indigo-700/80 dark:text-indigo-400/80 mt-0.5 font-medium">
                      Analytical Speed
                    </div>
                  </div>
                </div>

                {/* Scheduled Blocks */}
                {chronoSchedule.paretoFocusBlocks.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Scheduled Focus Timer Blocks ({chronoSchedule.totalDeepWorkMinutes}m Total)
                    </span>
                    {chronoSchedule.paretoFocusBlocks.map((b) => (
                      <div
                        key={b.blockId}
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                      >
                        <div className="min-w-0 pr-2">
                          <span className="font-bold text-slate-900 dark:text-white truncate block">
                            {b.taskTitle}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {format12h(b.startTime)} - {format12h(b.endTime)} ({b.durationMinutes}m {b.category === 'complex_creative' ? 'Pareto' : 'Sprint'})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (onSetActiveTaskTitle) onSetActiveTaskTitle(b.taskTitle);
                            onUpdateConfig({
                              workDuration: b.durationMinutes * 60,
                              restDuration: b.durationMinutes >= 50 ? 10 * 60 : 5 * 60,
                            });
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#092677] hover:bg-[#071e5e] text-white text-[10px] font-bold shrink-0 cursor-pointer shadow-xs"
                        >
                          Select Block
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between">
                <div className="text-left">
                  <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 block">
                    🧠 Chronobiology Strategist Add-on
                  </span>
                  <span className="text-[11px] text-indigo-700/80 dark:text-indigo-400/80">
                    Map focus windows to your wake time & circadian alertness peaks
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onOpenStrategist}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shrink-0 cursor-pointer shadow-xs"
                >
                  Configure
                </button>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            STEP 3: ATMOSPHERE & SOUND - FINAL STEP BEFORE STARTING
           ========================================================================= */}
        {step === 'ambience' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="text-left">
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Atmosphere & Sound
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Tune your acoustic environment for maximum concentration.
              </p>
            </div>

            {/* Ambient Sound Card */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
              {/* Music On/Off Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-[#af1b3f]" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Focus Ambient Sound
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (isMusicOn) {
                      onUpdateConfig({ ambientSource: 'none' });
                    } else {
                      onUpdateConfig({ ambientSource: 'lofi-girl' });
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isMusicOn
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {isMusicOn ? 'Music ON' : 'Music OFF'}
                </button>
              </div>

              {/* Sound Presets */}
              {isMusicOn && (
                <div className="pt-1 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {AMBIENT_PRESETS.filter((p) => p.id !== 'none').slice(0, 4).map((preset) => {
                      const isSelected = config.ambientSource === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            onUpdateConfig({ ambientSource: preset.id });
                            setShowCustomUrl(false);
                          }}
                          className={`py-2 px-2.5 rounded-xl text-left border text-xs font-bold truncate transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#092677] text-white border-[#092677] shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          {preset.title}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom YouTube link input */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomUrl(!showCustomUrl);
                        if (!showCustomUrl) {
                          onUpdateConfig({ ambientSource: 'custom-youtube' });
                        }
                      }}
                      className={`text-[11px] font-bold flex items-center gap-1 transition-colors ${
                        showCustomUrl
                          ? 'text-[#092677] dark:text-blue-400'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>Custom YouTube Stream / URL</span>
                    </button>
                  </div>

                  {showCustomUrl && (
                    <input
                      type="text"
                      value={config.customYoutubeUrl}
                      onChange={(e) =>
                        onUpdateConfig({
                          customYoutubeUrl: e.target.value,
                          ambientSource: 'custom-youtube',
                        })
                      }
                      placeholder="Paste YouTube Video or Stream Link"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#092677]"
                    />
                  )}
                </div>
              )}

              {/* Chime alarm toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#092677] dark:text-blue-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    End-of-set chime alarm
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.sound}
                  onChange={(e) => onUpdateSettings({ sound: e.target.checked })}
                  className="w-4 h-4 accent-[#092677] rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Ready Session Overview Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 dark:from-slate-900 dark:to-slate-900/90 border border-blue-200/60 dark:border-slate-800 text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  Session Plan
                </span>
                <span className="text-xs font-bold text-[#092677] dark:text-blue-400">
                  {config.mode === 'pareto'
                    ? 'Pareto 80/20'
                    : config.mode === 'pomodoro'
                    ? 'Pomodoro'
                    : 'Custom'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-1 text-center font-mono">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block">
                    Deep Work
                  </span>
                  <span className="text-sm font-black text-[#092677] dark:text-blue-400">
                    {totalWorkMinutes}m
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block">
                    Rest
                  </span>
                  <span className="text-sm font-black text-[#af1b3f]">
                    {totalRestMinutes}m
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block">
                    Sets
                  </span>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                    {config.totalSets}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                🎵 {isMusicOn ? `Playing ${config.ambientSource}` : 'Silent Focus'} · 🎯 Adds +{totalWorkMinutes}m towards your daily goal
              </p>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          BOTTOM NAVIGATION AREA: Step controls & Start CTA
         ========================================================================= */}
      <div className="space-y-3 pt-4">
        {step === 'mode' && (
          <button
            type="button"
            onClick={() => setStep('sets')}
            className="w-full py-4 rounded-2xl bg-[#092677] hover:bg-[#071e5e] active:scale-98 text-white font-extrabold text-base tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-[#092677]/25 transition-all cursor-pointer touch-press"
          >
            <span>Next: Plan Sets & Goal</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}

        {step === 'sets' && (
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setStep('mode')}
              className="py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Mode</span>
            </button>
            <button
              type="button"
              onClick={() => setStep('ambience')}
              className="py-3.5 rounded-2xl bg-[#092677] hover:bg-[#071e5e] text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-md shadow-[#092677]/20 transition-all cursor-pointer"
            >
              <span>Next: Ambience</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 'ambience' && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleStart}
              className="w-full py-4 rounded-2xl bg-[#092677] hover:bg-[#071e5e] active:scale-98 text-white font-extrabold text-base tracking-wide flex items-center justify-center gap-2.5 shadow-xl shadow-[#092677]/30 transition-all cursor-pointer touch-press"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Start Focus Session</span>
            </button>
            <button
              type="button"
              onClick={() => setStep('sets')}
              className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              ← Back to Sets & Goal
            </button>
          </div>
        )}

        {/* Clean Secondary Links (Organized after clicking Next) */}
        {step !== 'mode' && (
          <div className="flex items-center justify-between px-2 pt-1 text-xs animate-in fade-in">
            <button
              type="button"
              onClick={onOpenRoom}
              className="flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-400 hover:text-[#092677] dark:hover:text-blue-400 transition-colors cursor-pointer py-1.5 px-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Users className="w-4 h-4 text-[#092677] dark:text-blue-400" />
              <span>Live Room</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
            </button>

            <button
              type="button"
              onClick={onOpenStrategist}
              className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 transition-colors cursor-pointer py-1.5 px-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-800"
            >
              <Brain className="w-4 h-4 text-indigo-600" />
              <span>Strategist Add-on</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
