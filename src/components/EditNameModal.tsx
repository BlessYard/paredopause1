import React, { useState, useEffect } from 'react';
import { X, Check, User, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  currentName: string;
  currentAvatarColor: string;
  onSave: (newName: string, newAvatarColor?: string) => void;
  onClose: () => void;
}

const PALETTE = ['#092677', '#af1b3f', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

export const EditNameModal: React.FC<Props> = ({
  isOpen,
  currentName,
  currentAvatarColor,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(currentName);
  const [selectedColor, setSelectedColor] = useState(currentAvatarColor);

  useEffect(() => {
    setName(currentName);
    setSelectedColor(currentAvatarColor);
  }, [currentName, currentAvatarColor, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) {
      onSave(trimmed, selectedColor);
      onClose();
    }
  };

  const previewInitial = (name.trim() || 'U').charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white dark:bg-[#090d16] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#092677] dark:text-blue-400 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
            Edit Your Name
          </h3>
        </div>

        {/* Live Preview */}
        <div className="flex items-center gap-3 p-3 mb-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-sm shrink-0 transition-colors"
            style={{ backgroundColor: selectedColor }}
          >
            {previewInitial}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Preview
            </span>
            <span className="text-sm font-black text-slate-900 dark:text-white truncate block">
              {name.trim() || 'Your Name'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Your Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              maxLength={30}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-semibold outline-none focus:border-[#092677] focus:ring-2 focus:ring-[#092677]/20 transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Choose Avatar Color
            </label>
            <div className="flex items-center gap-2">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                    selectedColor === c ? 'ring-2 ring-offset-2 ring-[#092677] scale-110 shadow-xs' : 'opacity-80 hover:opacity-100'
                  }`}
                  aria-label={`Select color ${c}`}
                >
                  {selectedColor === c && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 py-2.5 rounded-xl bg-[#092677] hover:bg-[#071e5e] disabled:opacity-40 text-white font-extrabold text-xs transition-all shadow-md shadow-[#092677]/20 flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Save Name</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
