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
  dailyGoalMinutes: number; // user-set daily target of deep work minutes (e.g. 60, 100, 120, 180)
  todayMinutes: number; // deep work minutes completed today
  todayDate: string; // ISO date YYYY-MM-DD for resetting daily progress
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

export interface RoomMember {
  userId: string;
  displayName: string;
  avatarColor: string;
  phase: SessionPhase;
  currentSet: number;
  totalSets: number;
  remainingSeconds: number;
  isRunning: boolean;
  lastActive: number;
  status: 'focusing' | 'resting' | 'paused' | 'idle' | 'offline';
}

export interface RoomCheer {
  id: string;
  fromName: string;
  emoji: string;
  timestamp: number;
}

export interface StudyRoom {
  roomId: string;
  roomName: string;
  members: RoomMember[];
  recentCheers: RoomCheer[];
}

export type TaskCategory = 'complex_creative' | 'analytical_friction' | 'admin_light';

export interface StrategistTask {
  id: string;
  title: string;
  category: TaskCategory;
  estimatedMinutes?: number;
}

export interface MeetingSlot {
  id: string;
  title: string;
  startTime: string; // "10:00"
  endTime: string;   // "10:30"
}

export interface FocusBlock {
  blockId: string;
  taskTitle: string;
  category: TaskCategory;
  durationMinutes: number; // 50-60 for complex/creative, 25 for analytical/high-friction
  startTime: string; // "09:30"
  endTime: string;   // "10:20"
  circadianPhase: 'morning_peak' | 'afternoon_second_wind' | 'recovery_break';
  rationale: string;
}

export interface ChronoScheduleOutput {
  executiveSummary: string;
  wakeTime: string;
  circadianPeaks: {
    morningAlertnessPeak: string;
    postLunchDip: string; // "1:00 PM - 3:00 PM (Strictly protected from deep focus)"
    afternoonSecondWind: string;
  };
  paretoFocusBlocks: FocusBlock[];
  totalDeepWorkMinutes: number;
  totalBreakMinutes: number;
  unassignedTasks?: string[];
  recommendationNote: string;
}

export interface ProductivityDirectorResult {
  oneTask: string;
  firstStep2Min: string;
  ignoreList: string[];
  rationale: string;
  timerDurationMinutes: number; // 25 or 50
}

export interface ParetoThreeTasksInput {
  task1: string;
  task2: string;
  task3: string;
}
