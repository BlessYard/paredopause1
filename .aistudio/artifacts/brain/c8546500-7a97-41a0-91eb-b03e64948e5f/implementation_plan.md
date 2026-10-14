# ParetoPause - Productivity Timer, Ambient Lo-Fi & Social Streak PWA

ParetoPause is an offline-first, mobile-optimized Progressive Web App that adapts the 80/20 principle and interval discipline to work, study, and rest sessions. It combines precision countdown timers, background Web Audio chimes, synchronized YouTube Lo-Fi & ambient focus music, vibration cues, and screen-lock persistence with a streak tracker and competitive friends leaderboard.

## Master Vibe-Coding Prompt (Copy-Paste Ready)

> **"Build an offline-first, mobile-first Progressive Web App called ParetoPause for structured productivity, study/work sets, and rest intervals, styled with an authoritative deep navy primary (`#092677`), rich crimson focus accent (`#af1b3f`), crisp white daylight canvas (`#ffffff`), and dark slate substrate (`#090d16`). The application must support Pareto 80/20 Deep Work (50m Focus / 10m Pause), Pomodoro (25m / 5m), Study Sprint (40m / 10m), and fully customizable minute/second intervals with configurable set counts (1 to 8+) and a toggle between automatic set chaining and step-by-step confirmation. The active timer screen must feature an animated SVG circular progress ring, non-jittering tabular countdown digits (`tabular-nums font-mono`), and interactive set timeline dots, powered by a resilient Web Audio synthesizer (generating gym bell, marimba, triple beep, and zen bowl timbres) with a continuous ultra-low keep-alive buffer and audio-context clock scheduling (`ctx.currentTime + remaining`) so completion alarms reliably fire even when the mobile screen is locked or the app is backgrounded, supplemented by the Vibration API, Wake Lock API, and background notifications. Incorporate an integrated Ambient Audio Engine featuring an embedded YouTube Player for curated Lo-Fi study beats and custom user-pasted YouTube stream/video links, synchronized with the timer to automatically play during focus periods and gently pause or crossfade to break sounds during rest periods, with independent volume controls and an offline-resilient procedural Web Audio ambient noise generator (brown, pink, and binaural focus noise) when offline. Users track daily consecutive streaks, total focus minutes, and completed sets with 100% offline local persistence, coupled with a social leaderboard displaying weekly streak rankings, friend leagues, custom user handles, tier badges (Novice, Consistent, Deep Worker, Pareto Master), and friend invite codes. The PWA must include a service worker with precaching, an installable Web App Manifest with maskable icons, an in-app install banner with iOS Safari share-sheet instructions and Android 1-click prompts, and a comprehensive options modal for sound auditioning, ambient stream selection, volume balance, and custom timer management."**

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following product specifications and technical foundations have been updated based on your feedback:

- **YouTube Lo-Fi & Ambient Music Player**:
  - Embedded YouTube IFrame player that allows users to pick curated productivity streams (Lofi Girl 24/7, Chill Study Beats, Cozy Coffee Shop, Synthwave Focus) or paste any custom YouTube video/playlist URL.
  - **Auto-Sync with Session Phases**: Music automatically plays during Focus/Work sessions and smoothly pauses or switches to a gentle breath cue during Rest intervals.
  - **Offline Procedural Noise Fallback**: If the device loses internet connection, the app gracefully switches to procedural Web Audio noise (Brownian noise, Pink noise, and 40Hz Gamma binaural waves) so deep work audio is never interrupted offline.
  - **Dual-Mixer Volume Control**: Dedicated sliders for Ambient/YouTube Volume vs End-of-Set Completion Chime Volume to prevent alarms from being drowned out.
- **Confirmed Color Palette**: Deep Navy/Indigo (`#092677`) as the primary brand authority, Rich Crimson/Wine (`#af1b3f`) as the active focus/pause accent, and Crisp Light Canvas (`#ffffff`) with an adaptive high-contrast dark slate substrate (`#090d16`).
- **Productivity Modes & Intervals**: Includes Pareto 80/20 Deep Work (50m Focus / 10m Pause), Pomodoro (25m / 5m), and Study Sprint (40m / 10m), combined with freeform custom timer configuration.
- **Background Execution & Offline Reliability**: Uses a native Web Audio clock-scheduled oscillator engine paired with an inaudible keep-alive buffer source so sound alarms fire accurately even with the screen off or when backgrounded on mobile devices.
- **Social Leaderboard & Streak Strategy**: Dual-tier streak architecture: 100% functional offline local progress (daily streaks, total focus minutes, sets completed) synced with a responsive social leaderboard where users can compete with friends, compare weekly streaks, and share challenge achievements.

---

## 1. Overview & Core Concept

- **What It Does**: ParetoPause guides knowledge workers, students, and focused creators through structured sets of deep focus and intentional rest. Users configure the number of sets, toggle auto-chaining, immerse themselves in synchronized YouTube Lo-Fi beats or generative background noise, and experience uninterrupted countdowns with customizable completion chimes (Marimba, Gym Bell, Triple Beep, Zen Bowl), haptic vibrations, and background notifications.
- **Target Audience**: Students, developers, writers, and remote professionals who want distraction-free interval timing and atmospheric focus music that works reliably on mobile.
- **Key Value**: Unlike generic web timers that pause when mobile screens lock, ParetoPause leverages PWA caching, WakeLock API, sample-accurate Web Audio synthesis, and YouTube IFrame synchronization to maintain flow state throughout the workday.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Session Setup & Music Selection Flow**:
   - The user selects session mode (Pareto 80/20, Pomodoro, Study Sprint, or Custom Intervals).
   - Selects number of sets (1 to 8+ sets) and toggle for Automatic Chaining vs Step-by-Step.
   - Chooses ambient sound mode: Curated YouTube Lo-Fi, Custom YouTube Link, or Offline Brown/Pink Noise, with quick play/preview.
   - Taps "Start Focus Session" with an optional 3-second breathing countdown.
2. **Active Focus & Rest Flow**:
   - Dynamic circular SVG progress ring shows remaining time in tabular typography.
   - YouTube audio stream activates seamlessly; a compact floating ambient player pill allows quick pause/play or track switching.
   - Set progress timeline dots illustrate completed, active, and upcoming sets.
   - Responsive controls allow Instant Pause/Resume, Reset, Next Set Skip, and Duration Adjustment.
   - When focus ends: YouTube audio gently pauses, multi-harmonic completion chime sounds, phone haptics pulse, and notification fires if backgrounded.
3. **Session Completion & Streak Celebration**:
   - Completion celebration screen recaps total focus time, sets completed, and updated streak count.
   - Instant options to log session, restart, or view updated rank on the leaderboard.
4. **Leaderboard & Social League Flow**:
   - Tabbed view showing "Weekly Streaks", "Total Focus Hours", and "Friend Circles".
   - Ability to set a custom display handle/avatar, view tier badges (Novice, Consistent, Deep Worker, Pareto Master), and copy an invite code for friends.
5. **Settings & Audio Customization Modal**:
   - Dual-mixer controls: Ambient/Lo-Fi volume slider and Completion Chime volume slider.
   - Sound auditioning, keep-awake toggle, vibration pattern toggle, notification preferences, and custom timer duration manager.

### Visual Identity & Theme

- **Color Tokens**:
  - Primary Brand: `#092677` (Deep Indigo Navy)
  - Focal Accent: `#af1b3f` (Crimson Wine)
  - Surface Background (Light): `#ffffff` / Soft Tint `#f5f7fc`
  - Surface Background (Dark): `#090d16` / Elevated Card `#121826`
  - Success / Recovery: `#10b981` (Emerald)
  - Focus Energy: `#f59e0b` (Amber)
- **Typography**:
  - Display & Headings: `Plus Jakarta Sans` / `Outfit` (bold, geometric, authoritative)
  - Body & Labels: `DM Sans` (clean, highly legible touch interfaces)
  - Timer Digits & Metrics: Tabular Monospace (`tabular-nums font-mono`) preventing jitter during rapid countdowns
- **Ergonomics & Touch Targets**:
  - Mobile bottom action bar within natural thumb reach ($\ge 48\text{px}$ touch targets).
  - PWA install button banner in top header with guided iOS Safari instructions and Android 1-click install.

---

## 3. Key Product Decisions & Trade-Offs

- **YouTube IFrame API Integration with Graceful Offline Fallback**:
  - *Chosen Approach*: Embed a lightweight YouTube IFrame player controlled programmatically via postMessage/IFrame API. When online, it streams 24/7 Lo-Fi stations or user links. If offline, the app automatically switches to synthetic procedural Web Audio noise (Brown/Pink noise and 40Hz Gamma waves).
  - *Why*: YouTube provides millions of free, high-quality Lo-Fi study beats without costly hosting or licensing. The offline procedural fallback ensures the app remains 100% functional without internet connectivity as requested.
- **Web Audio Clock Scheduling vs JavaScript Timers**:
  - *Chosen Approach*: Schedule audio alarms directly on the Web Audio context clock (`ctx.currentTime + delay`) and maintain a continuous near-silent keep-alive buffer when the timer is active.
  - *Why*: Mobile browsers aggressively throttle `setInterval` and `requestAnimationFrame` when the tab is backgrounded or the screen turns off. Web Audio clock scheduling runs in a hardware-synchronized audio thread, ensuring the chime rings exactly on time.
- **Offline-First PWA Architecture with Service Worker**:
  - *Chosen Approach*: `vite-plugin-pwa` with precached assets, Web App Manifest (`display: standalone`, 192px/512px icons, maskable support), and localStorage/IndexedDB persistence.
  - *Why*: Allows zero-latency launches, offline usage on airplanes or gym/study zones without Wi-Fi, and home screen installation.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                         ParetoPause PWA                                │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                     Top Navigation & PWA Header                │   │
│   │   [Brand Logo]         [Install PWA]      [⚙ Settings Modal]   │   │
│   └────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                       Active Screen Router                     │   │
│   │                                                                │   │
│   │   ┌───────────────┐  ┌───────────────┐  ┌──────────────────┐   │   │
│   │   │ Session Setup │  │ Active Timer  │  │   Leaderboard    │   │   │
│   │   │ - Pareto 80/20│  │ - SVG Ring    │  │ - Friend Streaks │   │   │
│   │   │ - Pomodoro    │  │ - Set Dots    │  │ - Weekly Rank    │   │   │
│   │   │ - Lo-Fi Picker│  │ - Lo-Fi Mini  │  │ - Achievements   │   │   │
│   │   └───────────────┘  └───────────────┘  └──────────────────┘   │   │
│   └────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│   ┌──────────────────────────┐      ┌──────────────────────────────┐   │
│   │     Audio & Hardware     │      │     Data & Offline Storage   │   │
│   │  - YouTube IFrame Player │      │  - IndexedDB / localStorage  │   │
│   │  - Procedural Noise Gen  │      │  - Daily streak calculation  │   │
│   │  - Multi-harmonic synth  │      │  - Friend circle cache       │   │
│   │  - Background keep-alive │      │  - Service Worker cache      │   │
│   │  - Vibration & Wake Lock │      │  - Custom presets & favorites│   │
│   └──────────────────────────┘      └──────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

### Core State & Data Schema

- **`SessionConfig`**:
  - `mode`: `'pareto'` (50m/10m) | `'pomodoro'` (25m/5m) | `'sprint'` (40m/10m) | `'custom'`
  - `workDuration`: number (seconds)
  - `restDuration`: number (seconds)
  - `totalSets`: number
  - `autoChain`: boolean
  - `prepCountdown`: boolean
  - `ambientSource`: `'lofi-beats'` | `'coffee-shop'` | `'synthwave'` | `'custom-youtube'` | `'offline-noise'` | `'none'`
  - `customYoutubeId`: string
- **`RuntimeTimerState`**:
  - `phase`: `'work'` | `'rest'`
  - `currentSet`: number
  - `remainingSeconds`: number
  - `isRunning`: boolean
  - `isPaused`: boolean
  - `ambientPlaying`: boolean
- **`UserStats & LeaderboardEntry`**:
  - `userId`: string
  - `displayName`: string
  - `avatarColor`: string
  - `currentStreak`: number (consecutive days)
  - `bestStreak`: number
  - `totalMinutesFocused`: number
  - `weeklyScore`: number
  - `lastActiveDate`: ISO string
  - `friendCode`: string

---

## 5. Phased Roadmap

1. **Phase 1: Core Timer Engine & Web Audio Synthesis**
   - Multi-timbre Web Audio chimes (Triple Beep, Zen Bowl, Marimba, Bell, Rising Chime).
   - Background keep-alive audio loop and clock-scheduled end alarms.
   - Circular SVG countdown display with tabular digits and set progress timeline dots.
2. **Phase 2: YouTube Lo-Fi & Ambient Focus Audio Engine**
   - Embedded YouTube Player with curated station presets (Lo-Fi Girl, Chill Beats, Cozy Coffee) and custom URL parser.
   - Timer auto-sync: music plays on focus, auto-pauses on breaks.
   - Offline procedural noise generator (Brown/Pink noise and 40Hz Gamma binaural waves).
   - Dual-mixer volume controls (ambient vs completion chimes).
3. **Phase 3: Productivity Interval Presets & Custom Configuration**
   - Pareto 80/20, Pomodoro, and Study Sprint modes.
   - Custom timer duration builder (quick-add and editing of minute/second intervals).
   - Auto-chaining vs Step-by-Step toggle with preparation countdown.
4. **Phase 4: Streak Engine & Social Leaderboard**
   - Daily streak tracking algorithm (calculating consecutive active days, freezes, and milestones).
   - Interactive Leaderboard view featuring global rankings, friend leagues, and weekly focus leaderboards.
   - Custom user profile handle, avatar customizer, and sharable friend invite system.
5. **Phase 5: PWA Installation, Haptics & Background Notifications**
   - Service worker precaching and manifest setup with maskable icons.
   - In-app install banner with explicit Chromium prompt and iOS Safari instructions.
   - Vibration cues and background notification integration.
