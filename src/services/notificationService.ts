let wakeLock: WakeLockSentinel | null = null;

export async function requestWakeLock(): Promise<boolean> {
  if ('wakeLock' in navigator) {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => {
        wakeLock = null;
      });
      return true;
    } catch (_) {
      return false;
    }
  }
  return false;
}

export function releaseWakeLock(): void {
  if (wakeLock) {
    wakeLock.release().catch(() => {});
    wakeLock = null;
  }
}

export function triggerHaptic(pattern: number | number[] = 80): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (_) {}
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  try {
    const res = await Notification.requestPermission();
    return res === 'granted';
  } catch (_) {
    return false;
  }
}

export function isNotificationAvailable(): boolean {
  return 'Notification' in window && Notification.permission === 'granted';
}

export async function showTimerNotification(
  phase: 'work' | 'rest',
  remainingSec: number,
  currentSet: number,
  totalSets: number
): Promise<void> {
  if (!isNotificationAvailable() || !document.hidden) return;

  const endMs = Date.now() + Math.max(0, remainingSec) * 1000;
  const timeStr = new Date(endMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const title = phase === 'work' ? '🎯 ParetoPause: Focus Session' : '☕ ParetoPause: Rest & Recharge';
  const body = `Set ${currentSet}/${totalSets} • Finish at ${timeStr}`;

  if ('serviceWorker' in navigator) {
    const reg = await navigator.serviceWorker.ready.catch(() => null);
    if (reg && document.hidden) {
      reg.showNotification(title, {
        tag: 'paretopause-timer',
        body,
        silent: true,
        icon: '/icon.svg',
      });
      return;
    }
  }

  try {
    new Notification(title, {
      tag: 'paretopause-timer',
      body,
      silent: true,
      icon: '/icon.svg',
    });
  } catch (_) {}
}

export async function showCompletionNotification(phase: 'work' | 'rest'): Promise<void> {
  if (!isNotificationAvailable() || !document.hidden) return;

  const title = phase === 'work' ? '🎉 Focus Set Complete!' : '🔔 Break Over — Time to Focus';
  const body = phase === 'work' ? 'Great effort! Take a well-deserved Pareto pause.' : 'Ready for the next set? Jump back in!';

  if ('serviceWorker' in navigator) {
    const reg = await navigator.serviceWorker.ready.catch(() => null);
    if (reg) {
      reg.showNotification(title, {
        tag: 'paretopause-done',
        body,
        icon: '/icon.svg',
      });
      return;
    }
  }

  try {
    new Notification(title, {
      tag: 'paretopause-done',
      body,
      icon: '/icon.svg',
    });
  } catch (_) {}
}

export async function clearNotifications(): Promise<void> {
  if ('serviceWorker' in navigator) {
    const reg = await navigator.serviceWorker.ready.catch(() => null);
    if (reg) {
      const notifs = await reg.getNotifications({ tag: 'paretopause-timer' });
      notifs.forEach((n) => n.close());
    }
  }
}
