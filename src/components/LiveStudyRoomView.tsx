import React, { useEffect, useState } from 'react';
import {
  Users,
  Copy,
  Check,
  Share2,
  ArrowLeft,
  Flame,
  Clock,
  Sparkles,
  Wifi,
  Play,
  RotateCcw,
} from 'lucide-react';
import { RoomMember, RoomCheer, StudyRoom, UserStats, SessionPhase } from '../types';
import { sendHeartbeat, sendRoomCheer, subscribeToLocalRoomBroadcast } from '../services/roomService';
import { triggerHaptic } from '../services/notificationService';

import { Pencil, Check as CheckIcon } from 'lucide-react';

interface Props {
  userStats: UserStats;
  currentPhase: SessionPhase;
  currentSet: number;
  totalSets: number;
  remainingSeconds: number;
  isRunning: boolean;
  onBack: () => void;
  onStartSession: () => void;
  onUpdateUserStats?: (updated: Partial<UserStats>) => void;
}

const PRESET_ROOMS = [
  { id: 'CAMPUS-LIBRARY', name: '🏛️ Campus Library' },
  { id: 'COFFEE-SHOP', name: '☕ Coffee Shop Study' },
  { id: 'DEEP-WORK-LAB', name: '🚀 Deep Work Sprint' },
];

export const LiveStudyRoomView: React.FC<Props> = ({
  userStats,
  currentPhase,
  currentSet,
  totalSets,
  remainingSeconds,
  isRunning,
  onBack,
  onStartSession,
  onUpdateUserStats,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userStats.displayName);
  const [roomId, setRoomId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const queryRoom = params.get('room');
      if (queryRoom) return queryRoom.toUpperCase();
    }
    return 'CAMPUS-LIBRARY';
  });

  const [customRoomInput, setCustomRoomInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [room, setRoom] = useState<StudyRoom>({
    roomId,
    roomName: roomId.replace(/-/g, ' '),
    members: [],
    recentCheers: [],
  });

  const [floatingCheers, setFloatingCheers] = useState<{ id: string; emoji: string; from: string }[]>([]);

  // Real-time heartbeat loop every 3 seconds
  useEffect(() => {
    let isMounted = true;

    const tick = async () => {
      try {
        const updated = await sendHeartbeat(roomId, {
          userId: userStats.userId,
          displayName: userStats.displayName,
          avatarColor: userStats.avatarSeed,
          phase: currentPhase,
          currentSet,
          totalSets,
          remainingSeconds,
          isRunning,
        });
        if (isMounted) {
          setRoom(updated);
        }
      } catch (_) {}
    };

    tick();
    const interval = setInterval(tick, 3000);

    // Subscribe to instant BroadcastChannel updates across tabs/windows
    const unsubscribe = subscribeToLocalRoomBroadcast(
      roomId,
      (updatedRoom) => {
        if (isMounted) setRoom(updatedRoom);
      },
      (cheer) => {
        if (isMounted) {
          addFloatingCheer(cheer.emoji, cheer.fromName);
        }
      }
    );

    return () => {
      isMounted = false;
      clearInterval(interval);
      unsubscribe();
    };
  }, [roomId, userStats, currentPhase, currentSet, totalSets, remainingSeconds, isRunning]);

  const addFloatingCheer = (emoji: string, from: string) => {
    const id = `float-${Date.now()}-${Math.random()}`;
    setFloatingCheers((prev) => [...prev, { id, emoji, from }]);
    triggerHaptic(50);
    setTimeout(() => {
      setFloatingCheers((prev) => prev.filter((item) => item.id !== id));
    }, 2500);
  };

  const handleSendCheer = async (emoji: string) => {
    triggerHaptic(60);
    addFloatingCheer(emoji, userStats.displayName);
    await sendRoomCheer(roomId, userStats.displayName, emoji);
  };

  const handleCopyInviteLink = () => {
    const link = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(roomId)}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    triggerHaptic(40);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleJoinCustomRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitized = customRoomInput.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '-');
    if (sanitized) {
      setRoomId(sanitized);
      setCustomRoomInput('');
      window.history.replaceState({}, '', `?room=${sanitized}`);
    }
  };

  const formatMinSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const activeFocusCount = room.members.filter((m) => m.status === 'focusing').length;

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 space-y-6 relative">
      {/* Floating live cheer bubbles */}
      <div className="fixed inset-0 pointer-events-none z-50 flex flex-col items-center justify-end pb-28 overflow-hidden">
        {floatingCheers.map((c) => (
          <div
            key={c.id}
            className="animate-in fade-in slide-in-from-bottom duration-500 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#092677]/90 text-white text-xs font-bold shadow-lg backdrop-blur-md mb-2"
          >
            <span className="text-xl">{c.emoji}</span>
            <span>{c.from} cheered!</span>
          </div>
        ))}
      </div>

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Timer</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{room.members.length} Studying Live</span>
        </div>
      </div>

      {/* Room Hero Banner */}
      <div className="rounded-3xl bg-linear-to-br from-[#092677] to-[#121826] text-white p-6 shadow-xl border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-5 h-5 text-amber-400" />
              <span className="text-xs uppercase font-extrabold tracking-widest text-white/70">
                Live Study Room
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">{room.roomName}</h2>
            <p className="text-xs text-white/70 mt-0.5">
              Room Code: <span className="font-mono font-bold tracking-wider text-amber-300">{roomId}</span>
            </p>
          </div>

          {/* Copy Invite Link CTA */}
          <button
            type="button"
            onClick={handleCopyInviteLink}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#af1b3f] hover:bg-[#931433] text-white text-xs font-extrabold tracking-wide shadow-md transition-all active:scale-95 cursor-pointer self-start sm:self-center"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedLink ? 'Invite Link Copied!' : 'Share Room Link'}</span>
          </button>
        </div>

        {/* Quick Room Switcher Pills */}
        <div className="pt-2 border-t border-white/15 flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-white/60">Switch Room:</span>
          {PRESET_ROOMS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setRoomId(p.id);
                window.history.replaceState({}, '', `?room=${p.id}`);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                roomId === p.id
                  ? 'bg-white text-[#092677] shadow-xs'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Room Input Form */}
      <form
        onSubmit={handleJoinCustomRoom}
        className="flex items-center gap-2 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
      >
        <span className="text-xs text-slate-400 font-mono pl-2">#</span>
        <input
          type="text"
          value={customRoomInput}
          onChange={(e) => setCustomRoomInput(e.target.value)}
          placeholder="Join or create private room (e.g. EXAM-CRAM)"
          className="flex-1 bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none font-mono py-1.5"
        />
        <button
          type="submit"
          disabled={!customRoomInput.trim()}
          className="px-3.5 py-1.5 rounded-xl bg-[#092677] hover:bg-[#071e5e] disabled:opacity-40 text-white font-bold text-xs transition-all shrink-0"
        >
          Enter Room
        </button>
      </form>

      {/* Live Member Presence Grid */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-500">
          <span>Active Participants in Room</span>
          <span className="text-emerald-600 font-mono">{activeFocusCount} Focusing Now</span>
        </div>

        {room.members.length <= 1 && (
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 text-center">
            <p className="font-semibold text-slate-800 dark:text-slate-100">You are the first participant in this room.</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Share your room code <span className="font-mono font-bold text-[#092677] dark:text-blue-400">{roomId}</span> with study buddies to sync focus sessions!
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {room.members.map((member) => {
            const isUser = member.userId === userStats.userId;
            const isFocusing = member.status === 'focusing';
            const isResting = member.status === 'resting';
            const isPaused = member.status === 'paused';
            const isOffline = member.status === 'offline';

            return (
              <div
                key={member.userId}
                className={`p-4 rounded-2xl border transition-all relative overflow-hidden ${
                  isUser
                    ? 'bg-[#092677]/5 dark:bg-[#092677]/20 border-[#092677] ring-1 ring-[#092677]/30'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Header: Avatar, Name, Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-xs shrink-0"
                      style={{ backgroundColor: member.avatarColor }}
                    >
                      {member.displayName.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        {isUser && isEditingName ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={tempName}
                              onChange={(e) => setTempName(e.target.value)}
                              className="px-1.5 py-0.5 text-xs font-bold rounded border border-[#092677] bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none w-28"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (tempName.trim() && onUpdateUserStats) {
                                  onUpdateUserStats({ displayName: tempName.trim() });
                                  setIsEditingName(false);
                                }
                              }}
                              className="p-1 rounded bg-[#092677] text-white hover:bg-[#071e5e]"
                              title="Save name"
                            >
                              <CheckIcon className="w-3 h-3 stroke-[3]" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {member.displayName}
                            </span>
                            {isUser && (
                              <>
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-[#092677] text-white">
                                  You
                                </span>
                                {onUpdateUserStats && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setTempName(userStats.displayName);
                                      setIsEditingName(true);
                                    }}
                                    className="p-0.5 text-slate-400 hover:text-[#092677] transition-colors"
                                    title="Edit your name"
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        Set {member.currentSet} of {member.totalSets}
                      </span>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="shrink-0">
                    {isFocusing && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Focusing
                      </span>
                    )}
                    {isResting && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300">
                        ☕ Resting
                      </span>
                    )}
                    {isPaused && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        ⏸ Paused
                      </span>
                    )}
                    {isOffline && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-400">
                        ⚪ Away
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress / Live Countdown readout */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-[#092677] dark:text-blue-400" />
                    <span>{isFocusing ? 'Time Remaining:' : isResting ? 'Break Remaining:' : 'Timer:'}</span>
                  </div>
                  <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                    {formatMinSec(member.remainingSeconds)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Cheers Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
          <span>Cheer on Room Buddies</span>
          <span className="text-[10px] text-slate-400">Tap to send haptic cheers</span>
        </div>
        <div className="flex items-center justify-around gap-2 pt-1">
          {[
            { emoji: '🔥', label: 'Keep Going' },
            { emoji: '👏', label: 'Great Set' },
            { emoji: '☕', label: 'Relax' },
            { emoji: '⚡', label: 'Flow State' },
            { emoji: '💪', label: 'Beast Mode' },
          ].map((c) => (
            <button
              key={c.emoji}
              type="button"
              onClick={() => handleSendCheer(c.emoji)}
              className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 transition-all cursor-pointer"
            >
              <span className="text-2xl">{c.emoji}</span>
              <span className="text-[9px] text-slate-500 font-medium">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Start Timer CTA if user is not running */}
      {!isRunning && (
        <button
          type="button"
          onClick={() => {
            onStartSession();
          }}
          className="w-full py-4 rounded-2xl bg-[#092677] hover:bg-[#071e5e] active:scale-98 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-[#092677]/25 transition-all cursor-pointer"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Start Your Timer in this Room</span>
        </button>
      )}
    </div>
  );
};
