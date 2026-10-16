import React, { useState } from 'react';
import { X, Sparkles, Target, Zap, ArrowRight, ShieldCheck, Flame, EyeOff } from 'lucide-react';
import { ProductivityDirectorResult } from '../types';
import { request8020Prioritization } from '../services/productivityDirectorService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectTaskAndApply: (chosenTask: string) => void;
}

export const ParetoModeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectTaskAndApply,
}) => {
  const [task1, setTask1] = useState('Core Architecture & High-Leverage Strategy');
  const [task2, setTask2] = useState('Client Review & Contract Audit');
  const [task3, setTask3] = useState('Clear unread email inbox & slack notifications');
  const [energyLevel, setEnergyLevel] = useState(8);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ProductivityDirectorResult | null>(null);

  if (!isOpen) return null;

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    const tasks = [task1, task2, task3].filter((t) => t.trim().length > 0);
    if (tasks.length === 0) return;

    setIsAnalyzing(true);
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    try {
      const prioritized = await request8020Prioritization(tasks, nowTime, energyLevel, 50);
      setResult(prioritized);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirm = () => {
    const chosen = result?.oneTask || task1 || 'Pareto 80/20 Deep Work';
    onSelectTaskAndApply(chosen);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#092677] text-white flex items-center justify-center font-black text-xs shadow-md shadow-[#092677]/20 shrink-0">
              80/20
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                Pareto 80/20 Mode
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                50m Focus · 10m Pause
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-left">
          {/* Rule Callout */}
          <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60">
            <p className="text-xs font-black text-[#092677] dark:text-blue-300">
              Pareto 80/20 Rule: 80% of results come from 20% of effort.
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
              Enter 3 tasks you want to tackle today. We'll pick the one high-leverage task you must complete during this 50-minute block.
            </p>
          </div>

          {!result ? (
            <form onSubmit={handleAnalyze} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">
                  Task 1
                </label>
                <input
                  type="text"
                  value={task1}
                  onChange={(e) => setTask1(e.target.value)}
                  placeholder="Task 1..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-[#092677]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">
                  Task 2
                </label>
                <input
                  type="text"
                  value={task2}
                  onChange={(e) => setTask2(e.target.value)}
                  placeholder="Task 2..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-[#092677]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">
                  Task 3
                </label>
                <input
                  type="text"
                  value={task3}
                  onChange={(e) => setTask3(e.target.value)}
                  placeholder="Task 3..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-[#092677]"
                />
              </div>

              {/* Energy Level */}
              <div className="pt-1 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Current Energy Level (1-10):
                </span>
                <div className="flex items-center gap-1.5">
                  {[5, 7, 8, 9, 10].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setEnergyLevel(level)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                        energyLevel === level
                          ? 'bg-[#092677] text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isAnalyzing || (!task1.trim() && !task2.trim())}
                  className="w-full py-3.5 rounded-2xl bg-[#092677] hover:bg-[#071e5e] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#092677]/25 transition-all cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                      <span>Identifying High-Leverage 80/20 Task...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-300" />
                      <span>Pick the ONE High-Leverage Task</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              {/* The Chosen ONE Task */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800">
                <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  <Target className="w-4 h-4 text-amber-600" />
                  <span>1. The ONE Task to Focus on (50-Min Block)</span>
                </div>
                <p className="text-sm font-black text-slate-900 dark:text-white mt-1">
                  {result.oneTask}
                </p>
                <p className="text-[11px] text-amber-900/80 dark:text-amber-300/80 mt-1">
                  {result.rationale}
                </p>
              </div>

              {/* 2-Minute First Step */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  <Flame className="w-4 h-4 text-emerald-600" />
                  <span>2. First 2 Minutes (Friction Elimination Step)</span>
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-1">
                  {result.firstStep2Min}
                </p>
              </div>

              {/* Strict Ignore List */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  <EyeOff className="w-4 h-4 text-rose-500" />
                  <span>3. Exactly What to Ignore During This Block</span>
                </div>
                <ul className="mt-1.5 space-y-1">
                  {result.ignoreList.map((item, idx) => (
                    <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex-1 py-3.5 rounded-2xl bg-[#092677] hover:bg-[#071e5e] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#092677]/25 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>Lock in & Select 50m Pareto Focus</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="px-4 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                >
                  Edit Tasks
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
