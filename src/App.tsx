import React, { useEffect, useRef, useState } from 'react';
import {
  Sliders,
  Trophy,
  WifiOff,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  SessionConfig,
  SessionPhase,
  TimerSettings,
  UserStats,
  AmbientSourceId,
} from './types';
import {
  getAudioContext,
  playChimeSound,
  scheduleAlarm,
  cancelAlarm,
  startKeepAlive,
  stopKeepAlive,
  playCountdownBeep,
  unlockAudio,
} from './services/audioEngine';
import {
  requestWakeLock,
  releaseWakeLock,
  triggerHaptic,
  showTimerNotification,
  showCompletionNotification,
  clearNotifications,
} from './services/notificationService';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { SettingsModal } from './components/SettingsModal';
import { SessionSetupView } from './components/SessionSetupView';
import { ActiveTimerView } from './components/ActiveTimerView';
import { SessionDoneView } from './components/SessionDoneView';
import { LeaderboardView } from './components/LeaderboardView';

const STORAGE_CONFIG = 'paretopause.config.v1';
const STORAGE_SETTINGS = 'paretopause.settings.v1';
const STORAGE_STATS = 'paretopause.stats.v1';

const DEFAULT_CONFIG: SessionConfig = {
  mode: 'pareto',
  workDuration: 50 * 60,
  restDuration: 10 * 60,
  totalSets: 3,
  autoChain: true,
  prepCountdown: true,
  ambientSource: 'lofi-girl',
  customYoutubeUrl: '',
};

const DEFAULT_SETTINGS: TimerSettings = {
  keepAwake: true,
  vibrate: true,
  sound: true,
  chimeSoundId: 'zen',
  chimeVolume: 0.9,
  ambientVolume: 0.65,
  notify: true,
  notifySound: true,
  prepCountdown: true,
  pauseMusicDuringBreaks: true,
  customTimers: [300, 600, 900, 1500, 1800, 2400, 3000, 3600],
};

function getInitialUserStats(): UserStats {
  try {
    const raw = localStorage.getItem(STORAGE_STATS);
    if (raw) return JSON.parse(raw);
  } catch (_) {}

  const randomColor = ['#af1b3f', '#092677', '#10b981', '#f59e0b', '#8b5cf6'][
    Math.floor(Math.random() * 5)
  ];
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();

  return {
    userId: `user-${Date.now()}`,
    displayName: 'Focus Pioneer',
    avatarSeed: randomColor,
    currentStreak: 1,
    bestStreak: 1,
    totalMinutes: 0,
    totalSetsCompleted: 0,
    weeklyScore: 50,
    lastActiveDate: new Date().toISOString().split('T')[0],
    friendCode: `PARETO-${randomSuffix}`,
    joinedDate: new Date().toISOString(),
  };
}

export default function App() {
  // Navigation screen
  const [currentScreen, setCurrentScreen] = useState<'setup' | 'timer' | 'done' | 'leaderboard'>('setup');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Core state
  const [config, setConfig] = useState<SessionConfig>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_CONFIG);
      return raw ? { ...DEFAULT_CONFIG, ...JSON.parse(raw) } : DEFAULT_CONFIG;
    } catch (_) {
      return DEFAULT_CONFIG;
    }
  });

  const [settings, setSettings] = useState<TimerSettings>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_SETTINGS);
      return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
    } catch (_) {
      return DEFAULT_SETTINGS;
    }
  });

  const [userStats, setUserStats] = useState<UserStats>(getInitialUserStats);

  // Runtime timer state
  const [phase, setPhase] = useState<SessionPhase>('work');
  const [currentSet, setCurrentSet] = useState(1);
  const [remainingSeconds, setRemainingSeconds] = useState(config.workDuration);
  const [isRunning, setIsRunning] = useState(false);

  // Preparation countdown state (3, 2, 1, GO)
  const [prepCount, setPrepCount] = useState<number | null>(null);

  const lastTickRef = useRef<number>(0);
  const timerLoopRef = useRef<number | null>(null);

  // Persistence effects
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CONFIG, JSON.stringify(config));
    } catch (_) {}
  }, [config]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(settings));
    } catch (_) {}
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_STATS, JSON.stringify(userStats));
    } catch (_) {}
  }, [userStats]);

  // Online / offline detector
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Background / Visibility change handler: update lockscreen notifications
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        clearNotifications();
        if (isRunning && settings.keepAwake) {
          requestWakeLock();
        }
      } else if (isRunning) {
        showTimerNotification(phase, remainingSeconds, currentSet, config.totalSets);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isRunning, phase, remainingSeconds, currentSet, config.totalSets, settings.keepAwake]);

  // Streak engine: increments streak once per day upon completing deep focus work
  const recordFocusWorkCompleted = (workSec: number) => {
    const today = new Date().toISOString().split('T')[0];
    const minutesAdded = Math.round(workSec / 60);

    setUserStats((prev) => {
      let newStreak = prev.currentStreak;
      if (prev.lastActiveDate !== today) {
        // Check if yesterday
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (prev.lastActiveDate === yesterday) {
          newStreak += 1;
        } else if (prev.lastActiveDate < yesterday) {
          newStreak = 1; // Reset streak if missed a day
        }
      }

      return {
        ...prev,
        currentStreak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
        totalMinutes: prev.totalMinutes + minutesAdded,
        totalSetsCompleted: prev.totalSetsCompleted + 1,
        weeklyScore: prev.weeklyScore + Math.max(10, Math.round(minutesAdded / 2)),
        lastActiveDate: today,
      };
    });
  };

  // Timer loop
  useEffect(() => {
    if (!isRunning) {
      if (timerLoopRef.current) {
        clearInterval(timerLoopRef.current);
        timerLoopRef.current = null;
      }
      cancelAlarm();
      stopKeepAlive();
      releaseWakeLock();
      return;
    }

    startKeepAlive();
    if (settings.keepAwake) {
      requestWakeLock();
    }

    // Schedule audio alarm ahead on Web Audio hardware clock
    if (settings.sound) {
      scheduleAlarm(remainingSeconds, settings.chimeSoundId, settings.chimeVolume);
    }

    lastTickRef.current = performance.now();

    timerLoopRef.current = window.setInterval(() => {
      const now = performance.now();
      const dt = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      setRemainingSeconds((prev) => {
        const next = prev - dt;
        if (next <= 0) {
          // Phase finished!
          handlePhaseCompletion();
          return 0;
        }
        return next;
      });
    }, 200);

    return () => {
      if (timerLoopRef.current) {
        clearInterval(timerLoopRef.current);
        timerLoopRef.current = null;
      }
      cancelAlarm();
    };
  }, [isRunning, phase]);

  // Handle phase completion
  const handlePhaseCompletion = () => {
    setIsRunning(false);

    // Audio & Haptic feedback
    if (settings.sound) {
      playChimeSound(settings.chimeSoundId, settings.chimeVolume);
    }
    if (settings.vibrate) {
      triggerHaptic([200, 100, 200, 100, 250]);
    }
    showCompletionNotification(phase);

    if (phase === 'work') {
      // Completed a work set
      recordFocusWorkCompleted(config.workDuration);

      if (config.autoChain) {
        // Automatically advance to rest
        setPhase('rest');
        setRemainingSeconds(config.restDuration);
        setIsRunning(true);
      } else {
        // Step-by-step
        setPhase('rest');
        setRemainingSeconds(config.restDuration);
      }
    } else {
      // Completed a rest set
      if (currentSet >= config.totalSets) {
        // Entire session completed!
        stopKeepAlive();
        releaseWakeLock();
        setCurrentScreen('done');
      } else {
        // Advance to next set
        const nextSetNum = currentSet + 1;
        setCurrentSet(nextSetNum);
        setPhase('work');
        setRemainingSeconds(config.workDuration);

        if (config.autoChain) {
          setIsRunning(true);
        }
      }
    }
  };

  // Start Session handler
  // Start Session handler: immediately activates timer and unlocks audio on the user click gesture
  const handleStartSession = () => {
    unlockAudio(); // Unlock audio context on direct user gesture
    setCurrentSet(1);
    setPhase('work');
    setRemainingSeconds(config.workDuration);
    setCurrentScreen('timer');
    setIsRunning(true);

    if (settings.prepCountdown) {
      // 3-2-1 breathing overlay
      setPrepCount(3);
      playCountdownBeep(false);
      if (settings.vibrate) triggerHaptic(40);

      const interval = setInterval(() => {
        setPrepCount((prev) => {
          if (prev === null) {
            clearInterval(interval);
            return null;
          }
          if (prev <= 1) {
            clearInterval(interval);
            playCountdownBeep(true);
            if (settings.vibrate) triggerHaptic(120);
            setTimeout(() => {
              setPrepCount(null);
            }, 450);
            return 0;
          }
          playCountdownBeep(false);
          if (settings.vibrate) triggerHaptic(40);
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleTogglePlayPause = () => {
    getAudioContext();
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    const dur = phase === 'work' ? config.workDuration : config.restDuration;
    setRemainingSeconds(dur);
    setIsRunning(false);
  };

  const handleSkip = () => {
    handlePhaseCompletion();
  };

  const handleAdjustDuration = (deltaSec: number) => {
    setRemainingSeconds((prev) => Math.max(10, prev + deltaSec));
  };

  const handleUpdateConfig = (updated: Partial<SessionConfig>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-[#090d16] dark:text-slate-100 flex flex-col justify-between selection:bg-[#af1b3f]/20 selection:text-[#af1b3f]">
      {/* Offline Status Warning Bar */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-[11px] font-bold py-1 px-4 text-center flex items-center justify-center gap-1.5 shadow-xs">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode Active • Audio alarms & procedural noise work 100% offline</span>
        </div>
      )}

      {/* Top Bar adheres to Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#090d16]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
          {/* Zone 1: Brand wordmark */}
          <button
            type="button"
            onClick={() => {
              if (currentScreen === 'timer' && isRunning) {
                // If running, prompt or toggle
                setCurrentScreen('setup');
              } else {
                setCurrentScreen('setup');
              }
            }}
            className="flex items-center gap-2 text-left"
          >
            <div className="w-7 h-7 rounded-lg bg-[#092677] text-white flex items-center justify-center font-black text-sm shadow-xs">
              P
            </div>
            <span className="font-extrabold text-base tracking-tight text-[#092677] dark:text-white">
              Pareto<span className="text-[#af1b3f]">Pause</span>
            </span>
          </button>

          {/* Zone 2: PWA Install & Leaderboard navigation */}
          <div className="flex items-center gap-2">
            <PWAInstallBanner />

            <button
              type="button"
              onClick={() => setCurrentScreen('leaderboard')}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentScreen === 'leaderboard'
                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="View Leaderboard"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500 fill-current" />
              <span className="hidden sm:inline">Leaderboard</span>
            </button>

            {/* Global Sound Quick Toggle */}
            <button
              type="button"
              onClick={() => {
                const nextSound = !settings.sound;
                setSettings((prev) => ({ ...prev, sound: nextSound }));
                if (nextSound) {
                  playChimeSound(settings.chimeSoundId, settings.chimeVolume);
                }
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                settings.sound
                  ? 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  : 'text-red-500 bg-red-50 dark:bg-red-950/40'
              }`}
              title={settings.sound ? 'Mute All Sounds' : 'Unmute Sounds'}
            >
              {settings.sound ? <Volume2 className="w-4 h-4 text-[#af1b3f]" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Zone 3: Settings modal trigger */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Settings"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Dynamic View Area */}
      <main className="flex-1 flex flex-col justify-center py-2">
        {currentScreen === 'setup' && (
          <SessionSetupView
            config={config}
            settings={settings}
            onUpdateConfig={handleUpdateConfig}
            onUpdateSettings={(updated) => setSettings((prev) => ({ ...prev, ...updated }))}
            onStartSession={handleStartSession}
            onOpenLeaderboard={() => setCurrentScreen('leaderboard')}
            userStats={userStats}
          />
        )}

        {currentScreen === 'timer' && (
          <ActiveTimerView
            config={config}
            settings={settings}
            currentSet={currentSet}
            phase={phase}
            remainingSeconds={Math.ceil(remainingSeconds)}
            isRunning={isRunning}
            onTogglePlayPause={handleTogglePlayPause}
            onReset={handleReset}
            onSkip={handleSkip}
            onAdjustDuration={handleAdjustDuration}
            onHome={() => setCurrentScreen('setup')}
            onUpdateTotalSets={(newTotal) => setConfig((prev) => ({ ...prev, totalSets: newTotal }))}
            onUpdateAmbientVolume={(vol) => setSettings((prev) => ({ ...prev, ambientVolume: vol }))}
            onSelectAmbientSource={(id: AmbientSourceId) => setConfig((prev) => ({ ...prev, ambientSource: id }))}
          />
        )}

        {currentScreen === 'done' && (
          <SessionDoneView
            config={config}
            userStats={userStats}
            onRestart={handleStartSession}
            onHome={() => setCurrentScreen('setup')}
            onOpenLeaderboard={() => setCurrentScreen('leaderboard')}
          />
        )}

        {currentScreen === 'leaderboard' && (
          <LeaderboardView
            userStats={userStats}
            onUpdateUserStats={setUserStats}
            onBack={() => setCurrentScreen(isRunning ? 'timer' : 'setup')}
          />
        )}
      </main>

      {/* 3-2-1 Breathing Preparation Overlay */}
      {prepCount !== null && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#092677]/95 text-white backdrop-blur-md animate-in fade-in duration-200">
          <p className="text-sm font-bold uppercase tracking-widest text-white/70 mb-2">
            Take a deep breath...
          </p>
          <div className="font-mono text-8xl font-black text-amber-300 animate-pulse">
            {prepCount === 0 ? 'GO !' : prepCount}
          </div>
          <p className="text-xs text-white/60 mt-4">Deep work focus commencing</p>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
      />
    </div>
  );
}
