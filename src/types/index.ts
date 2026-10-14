export type SessionMode = 'pareto' | 'pomodoro' | 'sprint' | 'custom';

export type SessionPhase = 'work' | 'rest';

export type AmbientSourceId =
  | 'lofi-girl'
  | 'chill-study'
  | 'rainy-cafe'
  | 'synthwave-focus'
  | 'custom-youtube'
  | 'offline-brown'
  | 'offline-binaural'
  | 'none';

export interface AmbientPreset {
  id: AmbientSourceId;
  title: string;
  subtitle: string;
  youtubeId?: string;
  isOfflineAvailable?: boolean;
}

export type ChimeSoundId = 'zen' | 'marimba' | 'bell' | 'triple' | 'rising';

export interface SessionConfig {
  mode: SessionMode;
  workDuration: number; // in seconds
  restDuration: number; // in seconds
  totalSets: number;
  autoChain: boolean;
  prepCountdown: boolean;
  ambientSource: AmbientSourceId;
  customYoutubeUrl: string;
}

export interface TimerSettings {
  keepAwake: boolean;
  vibrate: boolean;
  sound: boolean;
  chimeSoundId: ChimeSoundId;
  chimeVolume: number; // 0 to 1
  ambientVolume: number; // 0 to 1
  notify: boolean;
  notifySound: boolean;
  prepCountdown: boolean;
  pauseMusicDuringBreaks: boolean;
  customTimers: number[]; // array of seconds
}

export interface UserStats {
  userId: string;
  displayName: string;
  avatarSeed: string;
  currentStreak: number;
  bestStreak: number;
  totalMinutes: number;
  totalSetsCompleted: number;
  weeklyScore: number;
  lastActiveDate: string; // ISO date YYYY-MM-DD
  friendCode: string;
  joinedDate: string;
}

export interface FriendEntry {
  id: string;
  name: string;
  avatarColor: string;
  streak: number;
  totalMinutes: number;
  weeklyScore: number;
  isCurrentUser?: boolean;
  badge: 'Novice' | 'Consistent' | 'Deep Worker' | 'Pareto Master';
}
