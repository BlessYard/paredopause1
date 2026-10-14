import React, { useState } from 'react';
import {
  Flame,
  Award,
  Users,
  Copy,
  Check,
  UserPlus,
  ArrowLeft,
  Clock,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { UserStats, FriendEntry } from '../types';

interface Props {
  userStats: UserStats;
  onUpdateUserStats: (updated: UserStats) => void;
  onBack: () => void;
}

const DEFAULT_FRIENDS: FriendEntry[] = [
  {
    id: 'f-1',
    name: 'Elena Rostova',
    avatarColor: '#af1b3f',
    streak: 18,
    totalMinutes: 1420,
    weeklyScore: 420,
    badge: 'Pareto Master' as const,
  },
  {
    id: 'f-2',
    name: 'Marcus Chen',
    avatarColor: '#092677',
    streak: 12,
    totalMinutes: 1180,
    weeklyScore: 350,
    badge: 'Deep Worker' as const,
  },
  {
    id: 'f-3',
    name: 'Sarah Jenkins',
    avatarColor: '#10b981',
    streak: 8,
    totalMinutes: 890,
    weeklyScore: 280,
    badge: 'Deep Worker' as const,
  },
  {
    id: 'f-4',
    name: 'Kenji Sato',
    avatarColor: '#f59e0b',
    streak: 5,
    totalMinutes: 640,
    weeklyScore: 210,
    badge: 'Consistent' as const,
  },
  {
    id: 'f-5',
    name: 'Chloe Dubois',
    avatarColor: '#8b5cf6',
    streak: 4,
    totalMinutes: 490,
    weeklyScore: 160,
    badge: 'Consistent' as const,
  },
  {
    id: 'f-6',
    name: 'David Kim',
    avatarColor: '#06b6d4',
    streak: 2,
    totalMinutes: 280,
    weeklyScore: 90,
    badge: 'Novice' as const,
  },
];

export const LeaderboardView: React.FC<Props> = ({
  userStats,
  onUpdateUserStats,
  onBack,
}) => {
  const [tab, setTab] = useState<'streaks' | 'hours' | 'friends'>('streaks');
  const [copied, setCopied] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userStats.displayName);
  const [newFriendCode, setNewFriendCode] = useState('');
  const [addedMessage, setAddedMessage] = useState<string | null>(null);
  const [friendsList, setFriendsList] = useState<FriendEntry[]>(DEFAULT_FRIENDS);

  const getTierBadge = (streak: number): FriendEntry['badge'] => {
    if (streak >= 14) return 'Pareto Master';
    if (streak >= 7) return 'Deep Worker';
    if (streak >= 3) return 'Consistent';
    return 'Novice';
  };

  const currentUserEntry: FriendEntry = {
    id: userStats.userId,
    name: `${userStats.displayName} (You)`,
    avatarColor: userStats.avatarSeed,
    streak: userStats.currentStreak,
    totalMinutes: userStats.totalMinutes,
    weeklyScore: userStats.weeklyScore,
    isCurrentUser: true,
    badge: getTierBadge(userStats.currentStreak),
  };

  const allEntries = [...friendsList, currentUserEntry];

  // Sorted list based on active tab
  const sortedEntries = [...allEntries].sort((a, b) => {
    if (tab === 'streaks') return b.streak - a.streak;
    if (tab === 'hours') return b.totalMinutes - a.totalMinutes;
    return b.weeklyScore - a.weeklyScore;
  });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(userStats.friendCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      onUpdateUserStats({ ...userStats, displayName: tempName.trim() });
      setIsEditingName(false);
    }
  };

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendCode.trim()) return;

    const names = ['Alex Rivera', 'Maya Thorne', 'Liam Vance', 'Samira Khan', 'Jordan Lee'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const colors = ['#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomStreak = Math.floor(Math.random() * 9) + 1;

    const newFriend: FriendEntry = {
      id: `friend-${Date.now()}`,
      name: `${randomName} (${newFriendCode.toUpperCase().slice(0, 6)})`,
      avatarColor: randomColor,
      streak: randomStreak,
      totalMinutes: randomStreak * 75,
      weeklyScore: randomStreak * 30,
      badge: getTierBadge(randomStreak),
    };

    setFriendsList([newFriend, ...friendsList]);
    setNewFriendCode('');
    setAddedMessage(`Added ${randomName} to your league!`);
    setTimeout(() => setAddedMessage(null), 3000);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-6">
      {/* Top Bar with back button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Timer</span>
        </button>

        <span className="text-xs font-bold uppercase tracking-wider text-[#092677] dark:text-blue-400">
          Leaderboard & Leagues
        </span>
      </div>

      {/* User Streak & Stats Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#092677] via-[#0b2f91] to-[#af1b3f] text-white p-6 shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg border-2 border-white/20"
              style={{ backgroundColor: userStats.avatarSeed }}
            >
              {userStats.displayName.charAt(0).toUpperCase()}
            </div>

            <div>
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="px-2 py-0.5 rounded-md bg-white/20 text-white font-bold text-sm w-36 outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleSaveName}
                      className="px-2 py-0.5 rounded-md bg-white text-[#092677] text-xs font-bold"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <h2
                    onClick={() => setIsEditingName(true)}
                    className="font-extrabold text-xl tracking-tight cursor-pointer hover:underline flex items-center gap-1.5"
                    title="Click to edit name"
                  >
                    {userStats.displayName}
                  </h2>
                )}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs">
                  {currentUserEntry.badge}
                </span>
              </div>
              <p className="text-xs text-white/80 mt-0.5">
                Friend Code: <span className="font-mono font-bold tracking-wider">{userStats.friendCode}</span>
              </p>
            </div>
          </div>

          {/* Metric cards */}
          <div className="flex items-center gap-3">
            <div className="flex-1 sm:flex-initial px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
              <div className="flex items-center justify-center gap-1 text-amber-300 font-extrabold text-2xl font-mono">
                <Flame className="w-5 h-5 fill-current animate-bounce" />
                <span>{userStats.currentStreak}</span>
              </div>
              <span className="text-[11px] font-medium text-white/80 uppercase tracking-wider block">
                Day Streak
              </span>
            </div>

            <div className="flex-1 sm:flex-initial px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
              <div className="flex items-center justify-center gap-1 text-white font-extrabold text-2xl font-mono">
                <Clock className="w-4 h-4 text-emerald-300" />
                <span>{userStats.totalMinutes}</span>
              </div>
              <span className="text-[11px] font-medium text-white/80 uppercase tracking-wider block">
                Minutes
              </span>
            </div>
          </div>
        </div>

        {/* Copy Friend Code Action */}
        <div className="relative z-10 mt-5 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-white/80">Invite friends to your study league:</span>
          <button
            type="button"
            onClick={handleCopyCode}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-[#092677] font-bold text-xs hover:bg-slate-100 transition-all active:scale-95 shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Code Copied!' : 'Copy Invite Code'}</span>
          </button>
        </div>
      </div>

      {/* Add Friend Form */}
      <form
        onSubmit={handleAddFriend}
        className="flex items-center gap-2 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
      >
        <UserPlus className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
        <input
          type="text"
          value={newFriendCode}
          onChange={(e) => setNewFriendCode(e.target.value)}
          placeholder="Enter a friend's code (e.g. PP-FOCUS)"
          className="flex-1 bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none font-mono py-1.5"
        />
        <button
          type="submit"
          disabled={!newFriendCode.trim()}
          className="px-3.5 py-1.5 rounded-xl bg-[#092677] hover:bg-[#071e5e] disabled:opacity-40 text-white font-bold text-xs transition-all shrink-0"
        >
          Add Friend
        </button>
      </form>

      {addedMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{addedMessage}</span>
        </div>
      )}

      {/* Leaderboard Tabs */}
      <div className="flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setTab('streaks')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            tab === 'streaks'
              ? 'bg-white dark:bg-slate-800 text-[#092677] dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-500 fill-current" />
          <span>Daily Streaks</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('hours')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            tab === 'hours'
              ? 'bg-white dark:bg-slate-800 text-[#092677] dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          <span>Total Minutes</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('friends')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            tab === 'friends'
              ? 'bg-white dark:bg-slate-800 text-[#092677] dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-[#af1b3f]" />
          <span>Weekly League</span>
        </button>
      </div>

      {/* Ranked List */}
      <div className="space-y-2">
        {sortedEntries.map((entry, index) => {
          const rank = index + 1;
          const isTop3 = rank <= 3;
          const isUser = entry.isCurrentUser;

          return (
            <div
              key={entry.id}
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                isUser
                  ? 'bg-[#092677]/10 dark:bg-[#092677]/30 border-[#092677] dark:border-blue-500 ring-1 ring-[#092677]'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Rank indicator */}
                <div className="w-7 text-center font-extrabold text-sm font-mono shrink-0">
                  {rank === 1 ? (
                    <Trophy className="w-5 h-5 text-amber-500 fill-current mx-auto" />
                  ) : rank === 2 ? (
                    <Trophy className="w-4 h-4 text-slate-400 fill-current mx-auto" />
                  ) : rank === 3 ? (
                    <Trophy className="w-4 h-4 text-amber-700 fill-current mx-auto" />
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500">#{rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-xs"
                  style={{ backgroundColor: entry.avatarColor }}
                >
                  {entry.name.charAt(0).toUpperCase()}
                </div>

                {/* Name & Badge */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-sm font-bold truncate ${isUser ? 'text-[#092677] dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                      {entry.name}
                    </span>
                    {isTop3 && (
                      <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
                    {entry.badge}
                  </span>
                </div>
              </div>

              {/* Stat Metric */}
              <div className="text-right shrink-0">
                {tab === 'streaks' && (
                  <div className="flex items-center gap-1 font-mono font-extrabold text-base text-amber-600 dark:text-amber-400">
                    <Flame className="w-4 h-4 fill-current" />
                    <span>{entry.streak}d</span>
                  </div>
                )}
                {tab === 'hours' && (
                  <div className="font-mono font-extrabold text-base text-slate-800 dark:text-slate-100">
                    {entry.totalMinutes}m
                  </div>
                )}
                {tab === 'friends' && (
                  <div className="font-mono font-extrabold text-base text-[#af1b3f]">
                    {entry.weeklyScore} pts
                  </div>
                )}
                <span className="text-[10px] text-slate-400 block uppercase">
                  {tab === 'streaks' ? 'Streak' : tab === 'hours' ? 'Focus time' : 'Weekly XP'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Encouragement footer */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/60 text-center text-xs text-slate-500 dark:text-slate-400">
        Streaks advance with each completed focus set today. Don't break the chain! 🔥
      </div>
    </div>
  );
};
