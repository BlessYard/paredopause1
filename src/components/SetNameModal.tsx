import React, { useState } from 'react';
import { User, Check, ArrowRight } from 'lucide-react';
import { UserStats } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userStats: UserStats;
  onSaveName: (name: string, avatarColor?: string) => void;
}

const AVATAR_COLORS = [
  '#092677', // Brand Navy
  '#af1b3f', // Brand Crimson
  '#0f766e', // Teal
  '#b45309', // Amber
  '#4338ca', // Indigo
  '#047857', // Emerald
];

export const SetNameModal: React.FC<Props> = ({
  isOpen,
  onClose,
  userStats,
  onSaveName,
}) => {
  const [name, setName] = useState(
    userStats.displayName === 'Focus Pioneer' ? '' : userStats.displayName
  );
  const [selectedColor, setSelectedColor] = useState(userStats.avatarSeed || '#092677');

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalName = name.trim() || 'Focus Pioneer';
    onSaveName(finalName, selectedColor);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#090d16] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Avatar preview */}
        <div className="flex justify-center mb-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-black/10 transition-transform hover:scale-105"
            style={{ backgroundColor: selectedColor }}
          >
            {(name.trim() || 'P').charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-5">
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
            Welcome to ParetoPause
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            What is your name? Used for your daily focus streak & study room.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name input */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
              Your Name / Nickname
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex, Sarah, David"
              maxLength={28}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-[#092677] focus:ring-2 focus:ring-[#092677]/15 transition-all"
            />
          </div>

          {/* Color palette */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
              Choose Badge Color
            </label>
            <div className="flex items-center justify-center gap-2.5">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                    selectedColor === c ? 'scale-115 ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-slate-900' : 'hover:scale-105 opacity-80'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                >
                  {selectedColor === c && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-[#092677] hover:bg-[#071e5e] active:scale-98 text-white font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-[#092677]/25 transition-all cursor-pointer"
            >
              <span>Save & Start Focusing</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer"
            >
              Skip for now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
