import React from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { triggerHaptic } from '../services/notificationService';

interface Props {
  currentSet: number;
  totalSets: number;
  onDoneSet: () => void;
  onBack: () => void;
}

export const DoSetView: React.FC<Props> = ({
  currentSet,
  totalSets,
  onDoneSet,
  onBack,
}) => {
  const getOrdinal = (n: number) => {
    if (n === 1) return '1st';
    if (n === 2) return '2nd';
    if (n === 3) return '3rd';
    return `${n}th`;
  };

  const handleDone = () => {
    triggerHaptic(80);
    onDoneSet();
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8 flex flex-col justify-between items-center min-h-[75vh] text-center">
      {/* Top Bar with back */}
      <div className="w-full flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-xl text-slate-400 hover:text-white transition-colors"
          title="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <span className="font-mono text-xs font-bold text-slate-400">
          Set {currentSet} of {totalSets}
        </span>

        <div className="w-5" />
      </div>

      {/* Animated Pulsing Energy Stage */}
      <div className="flex flex-col items-center justify-center my-auto space-y-6">
        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full border-2 border-[#22d3a7]/30 animate-ping opacity-40" />
          <div className="absolute -inset-4 rounded-full bg-linear-to-r from-[#092677]/20 via-[#22d3a7]/20 to-[#af1b3f]/20 blur-xl animate-pulse" />

          {/* Central energetic core */}
          <div className="relative z-10 w-32 h-32 rounded-full bg-linear-to-br from-[#171b26] to-[#0f1219] border border-[#22d3a7]/40 shadow-2xl flex items-center justify-center">
            {/* Stylized Pause/Focus icon */}
            <div className="flex items-center gap-3">
              <div className="w-4 h-14 rounded-full bg-[#092677]" />
              <div className="w-4 h-14 rounded-full bg-[#af1b3f]" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            Do your {getOrdinal(currentSet)} set
          </h2>
          <p className="text-sm text-slate-400 mt-1.5">
            Focus deeply on your work or study rep. Tap below when finished.
          </p>
        </div>
      </div>

      {/* Bottom Action CTA */}
      <div className="w-full space-y-2">
        <button
          type="button"
          onClick={handleDone}
          className="w-full py-4 px-6 rounded-2xl bg-[#22d3a7] hover:bg-[#1bb892] active:scale-97 text-[#04130f] font-black text-lg tracking-wide shadow-lg shadow-[#22d3a7]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
          <span>I did my set</span>
        </button>
        <p className="text-[11px] text-slate-500">Press Space or tap button to validate</p>
      </div>
    </div>
  );
};
