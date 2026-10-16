import React, { useState } from 'react';
import {
  X,
  Brain,
  Sun,
  Moon,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  Copy,
  Check,
  ShieldAlert,
  ArrowRight,
  Flame,
  Code2,
  Zap,
} from 'lucide-react';
import {
  ChronoScheduleOutput,
  MeetingSlot,
  SessionConfig,
  StrategistTask,
  TaskCategory,
} from '../types';
import {
  format12h,
  generateLocalChronoSchedule,
  requestChronoSchedule,
} from '../services/chronobiologyEngine';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApplyScheduleToTimer: (
    suggestedConfig: Partial<SessionConfig>,
    schedule?: ChronoScheduleOutput,
    taskTitle?: string
  ) => void;
}

const DEFAULT_TASKS: StrategistTask[] = [
  {
    id: 't-1',
    title: 'Core Architecture & Strategy',
    category: 'complex_creative',
  },
  {
    id: 't-2',
    title: 'Product Roadmap & 80/20 Prioritization',
    category: 'complex_creative',
  },
  {
    id: 't-3',
    title: 'Financial Model & Metrics Audit',
    category: 'analytical_friction',
  },
];

const DEFAULT_MEETINGS: MeetingSlot[] = [
  {
    id: 'm-1',
    title: 'Executive Sync',
    startTime: '10:00',
    endTime: '10:30',
  },
  {
    id: 'm-2',
    title: 'Client Review',
    startTime: '14:00',
    endTime: '14:30',
  },
];

export const ChronobiologyStrategistModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onApplyScheduleToTimer,
}) => {
  const [wakeTime, setWakeTime] = useState('07:00');
  const [tasks, setTasks] = useState<StrategistTask[]>(DEFAULT_TASKS);
  const [meetings, setMeetings] = useState<MeetingSlot[]>(DEFAULT_MEETINGS);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>('complex_creative');

  // New meeting form state
  const [newMeetingTitle, setNewMeetingTitle] = useState('');
  const [newMeetingStart, setNewMeetingStart] = useState('11:00');
  const [newMeetingEnd, setNewMeetingEnd] = useState('11:30');

  // Schedule output state
  const [isGenerating, setIsGenerating] = useState(false);
  const [scheduleOutput, setScheduleOutput] = useState<ChronoScheduleOutput | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'json'>('visual');

  if (!isOpen) return null;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setTasks((prev) => [
      ...prev,
      {
        id: `task-${Date.now()}`,
        title: newTaskTitle.trim(),
        category: newTaskCategory,
      },
    ]);
    setNewTaskTitle('');
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeetingTitle.trim()) return;
    setMeetings((prev) => [
      ...prev,
      {
        id: `meeting-${Date.now()}`,
        title: newMeetingTitle.trim(),
        startTime: newMeetingStart,
        endTime: newMeetingEnd,
      },
    ]);
    setNewMeetingTitle('');
  };

  const handleDeleteMeeting = (id: string) => {
    setMeetings((prev) => prev.filter((m) => m.id !== id));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await requestChronoSchedule(wakeTime, meetings, tasks);
      setScheduleOutput(result);
    } catch (_) {
      const fallback = generateLocalChronoSchedule(wakeTime, meetings, tasks);
      setScheduleOutput(fallback);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyJson = () => {
    if (!scheduleOutput) return;
    navigator.clipboard.writeText(JSON.stringify(scheduleOutput, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleApplyToTimer = () => {
    if (!scheduleOutput || scheduleOutput.paretoFocusBlocks.length === 0) return;
    const firstBlock = scheduleOutput.paretoFocusBlocks[0];
    const durationSeconds = firstBlock.durationMinutes * 60;
    const isPareto = firstBlock.durationMinutes >= 50;

    onApplyScheduleToTimer(
      {
        mode: isPareto ? 'pareto' : 'pomodoro',
        workDuration: durationSeconds,
        restDuration: isPareto ? 10 * 60 : 5 * 60,
        totalSets: Math.max(1, scheduleOutput.paretoFocusBlocks.length),
      },
      scheduleOutput,
      firstBlock.taskTitle
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[92vh] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#092677] text-white flex items-center justify-center shadow-md shadow-[#092677]/20">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  Executive Chronobiology Strategist
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-[#092677] dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Add-On
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                80/20 Pareto & Circadian Peak Focus Window Optimizer
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Section 1: Wake Time & Circadian Calibration */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>1. Your Wake Time</span>
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-[#092677]"
              />
              <div className="flex items-center gap-1.5">
                {['06:00', '06:30', '07:00', '07:30', '08:00'].map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setWakeTime(time)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      wakeTime === time
                        ? 'bg-[#092677] text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {format12h(time)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Meetings & Commitments (Avoid Collisions) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>2. Scheduled Meetings ({meetings.length})</span>
              </label>
              <span className="text-[10px] text-slate-400 font-medium">Blocks deep focus</span>
            </div>

            {/* Existing Meetings List */}
            <div className="space-y-1.5">
              {meetings.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-600">
                      {format12h(m.startTime)} - {format12h(m.endTime)}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {m.title}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteMeeting(m.id)}
                    className="p-1 text-slate-400 hover:text-red-500 rounded-md transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Quick Add Meeting Form */}
            <form onSubmit={handleAddMeeting} className="flex flex-wrap items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Add meeting (e.g. Sprint Sync)"
                value={newMeetingTitle}
                onChange={(e) => setNewMeetingTitle(e.target.value)}
                className="flex-1 min-w-[140px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white outline-none"
              />
              <div className="flex items-center gap-1 text-xs">
                <input
                  type="time"
                  value={newMeetingStart}
                  onChange={(e) => setNewMeetingStart(e.target.value)}
                  className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="time"
                  value={newMeetingEnd}
                  onChange={(e) => setNewMeetingEnd(e.target.value)}
                  className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={!newMeetingTitle.trim()}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>
          </div>

          {/* Section 3: Task List with Rule-based Classification */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>3. Tasks & Cognitive Demand ({tasks.length})</span>
              </label>
              <span className="text-[10px] text-slate-400">50m deep focus or 25m sprint</span>
            </div>

            <div className="space-y-1.5">
              {tasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider shrink-0 ${
                        t.category === 'complex_creative'
                          ? 'bg-blue-100 dark:bg-blue-950 text-[#092677] dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      }`}
                    >
                      {t.category === 'complex_creative' ? '50m Complex' : '25m Sprint'}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {t.title}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteTask(t.id)}
                    className="p-1 text-slate-400 hover:text-red-500 rounded-md transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Quick Add Task Form */}
            <form onSubmit={handleAddTask} className="flex flex-wrap items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Enter task name..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-1 min-w-[150px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white outline-none"
              />
              <select
                value={newTaskCategory}
                onChange={(e) => setNewTaskCategory(e.target.value as TaskCategory)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none"
              >
                <option value="complex_creative">Complex/Creative (50m)</option>
                <option value="analytical_friction">Analytical/High-Friction (25m)</option>
              </select>
              <button
                type="submit"
                disabled={!newTaskTitle.trim()}
                className="px-3.5 py-1.5 rounded-xl bg-[#092677] hover:bg-[#071e5e] text-white text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </form>
          </div>

          {/* Generate Button CTA */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || tasks.length === 0}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#092677] to-indigo-700 hover:from-[#071e5e] hover:to-indigo-800 active:scale-98 text-white font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-[#092677]/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Computing Optimal Circadian Peaks...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Determine Optimal Focus Windows (JSON)</span>
                </>
              )}
            </button>
          </div>

          {/* Output Presentation Section */}
          {scheduleOutput && (
            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in duration-300">
              {/* Tab Selector & Copy JSON Button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setActiveTab('visual')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      activeTab === 'visual'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Visual Schedule
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('json')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                      activeTab === 'json'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Structured JSON</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#092677] bg-slate-100 dark:bg-slate-800 rounded-lg transition-all cursor-pointer"
                >
                  {copiedJson ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600">Copied JSON!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
              </div>

              {/* Visual Schedule View */}
              {activeTab === 'visual' && (
                <div className="space-y-4">
                  {/* Circadian Peaks Summary Banner */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Morning Alertness */}
                    <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
                      <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 text-xs font-bold mb-1">
                        <Sun className="w-3.5 h-3.5" />
                        <span>Morning Peak</span>
                      </div>
                      <p className="text-xs font-black text-slate-900 dark:text-white">
                        {scheduleOutput.circadianPeaks.morningAlertnessPeak.split('(')[0]}
                      </p>
                      <p className="text-[10px] text-amber-800/80 dark:text-amber-300/80">
                        High Vigilance (50m Pareto blocks)
                      </p>
                    </div>

                    {/* Post-Lunch Dip - Strictly Protected */}
                    <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60">
                      <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300 text-xs font-bold mb-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                        <span>Post-Lunch Dip</span>
                      </div>
                      <p className="text-xs font-black text-rose-800 dark:text-rose-300">
                        1:00 PM - 3:00 PM
                      </p>
                      <p className="text-[10px] text-rose-700/90 dark:text-rose-300/80 font-bold">
                        Strictly Protected: No Deep Focus
                      </p>
                    </div>

                    {/* Afternoon Second Wind */}
                    <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60">
                      <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-1">
                        <Moon className="w-3.5 h-3.5" />
                        <span>Afternoon 2nd Wind</span>
                      </div>
                      <p className="text-xs font-black text-slate-900 dark:text-white">
                        {scheduleOutput.circadianPeaks.afternoonSecondWind.split('(')[0]}
                      </p>
                      <p className="text-[10px] text-indigo-800/80 dark:text-indigo-300/80">
                        High Motor/Analytical Speed
                      </p>
                    </div>
                  </div>

                  {/* Focus Blocks List */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Scheduled Focus Timer Windows ({scheduleOutput.paretoFocusBlocks.length})
                    </p>

                    {scheduleOutput.paretoFocusBlocks.length === 0 ? (
                      <p className="text-xs text-slate-500 p-3 bg-slate-50 rounded-xl">
                        No available slots found without conflicting with meetings or protected
                        lunch dip.
                      </p>
                    ) : (
                      scheduleOutput.paretoFocusBlocks.map((block, idx) => (
                        <div
                          key={block.blockId}
                          className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs flex items-center justify-between gap-3"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-black text-[#092677] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-lg border border-blue-200/60 dark:border-blue-900">
                                {format12h(block.startTime)} - {format12h(block.endTime)}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                  block.category === 'complex_creative'
                                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                                    : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                                }`}
                              >
                                {block.durationMinutes}m {block.category === 'complex_creative' ? 'Pareto' : 'Sprint'}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              #{idx + 1}: {block.taskTitle}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {block.rationale}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Summary Note */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-[11px] text-slate-600 dark:text-slate-400">
                    <p>
                      <strong>Recommendation:</strong> {scheduleOutput.recommendationNote}
                    </p>
                  </div>
                </div>
              )}

              {/* Raw JSON View */}
              {activeTab === 'json' && (
                <div className="relative">
                  <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-72 border border-slate-800 leading-relaxed">
                    {JSON.stringify(scheduleOutput, null, 2)}
                  </pre>
                </div>
              )}

              {/* Action Buttons: Apply to Timer or Next */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleApplyToTimer}
                  className="w-full sm:flex-1 py-3.5 rounded-2xl bg-[#092677] hover:bg-[#071e5e] active:scale-98 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#092677]/25 transition-all cursor-pointer"
                >
                  <Flame className="w-4 h-4 text-amber-400 fill-current" />
                  <span>Apply Schedule to Pareto Timer & Continue</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-sm cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
