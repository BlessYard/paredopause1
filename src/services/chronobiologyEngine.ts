import {
  ChronoScheduleOutput,
  FocusBlock,
  MeetingSlot,
  StrategistTask,
  TaskCategory,
} from '../types';

/**
 * Converts "HH:MM" string (24h) to minutes from midnight
 */
export function timeToMinutes(timeStr: string): number {
  const parts = timeStr.trim().split(':');
  if (parts.length < 2) return 0;
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
}

/**
 * Converts minutes from midnight to "HH:MM" (24h) string
 */
export function minutesToTime(totalMinutes: number): string {
  const clamped = Math.max(0, Math.min(24 * 60 - 1, totalMinutes));
  const hours = Math.floor(clamped / 60);
  const minutes = clamped % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Formats "HH:MM" into friendly 12h format e.g. "9:30 AM"
 */
export function format12h(timeStr: string): string {
  const mins = timeToMinutes(timeStr);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
}

/**
 * Checks if interval [startA, endA] overlaps with interval [startB, endB]
 */
function intervalsOverlap(startA: number, endA: number, startB: number, endB: number): boolean {
  return Math.max(startA, startB) < Math.min(endA, endB);
}

/**
 * Generates an optimal chronobiology schedule locally adhering strictly to:
 * 1. Never schedule deep focus blocks during the post-lunch dip (1:00 PM - 3:00 PM).
 * 2. Assign 50–60 minute blocks for complex/creative work and 25-minute blocks for high-friction or analytical tasks.
 * 3. Keep the output actionable, concise, and structured as JSON.
 */
export function generateLocalChronoSchedule(
  wakeTimeStr: string,
  meetings: MeetingSlot[],
  tasks: StrategistTask[]
): ChronoScheduleOutput {
  const wakeMinutes = timeToMinutes(wakeTimeStr || '07:00');

  // Circadian Landmarks
  // Morning Alertness Peak: ~2h after waking up to 12:30 PM (e.g. 09:00 - 12:30)
  const morningPeakStart = Math.max(wakeMinutes + 90, 8 * 60 + 30); // earliest 8:30 AM
  const morningPeakEnd = 12 * 60 + 45; // 12:45 PM

  // Post-Lunch Dip: 1:00 PM (13:00) to 3:00 PM (15:00) -> STRICTLY PROTECTED!
  const postLunchDipStart = 13 * 60; // 1:00 PM (780 mins)
  const postLunchDipEnd = 15 * 60;   // 3:00 PM (900 mins)

  // Late-Afternoon Second Wind: 3:30 PM to 6:30 PM
  const secondWindStart = 15 * 60 + 30; // 3:30 PM
  const secondWindEnd = 18 * 60 + 30;   // 6:30 PM

  // Parse meetings into blocked intervals
  const blockedIntervals: { start: number; end: number; label: string }[] = meetings
    .map((m) => ({
      start: timeToMinutes(m.startTime),
      end: timeToMinutes(m.endTime),
      label: m.title || 'Meeting',
    }))
    .filter((m) => m.end > m.start);

  // Add the strictly protected Post-Lunch Dip as a blocked interval for deep work!
  blockedIntervals.push({
    start: postLunchDipStart,
    end: postLunchDipEnd,
    label: 'Post-Lunch Dip (Protected — Digestion & Light Admin Only)',
  });

  // Sort tasks: Prioritize complex/creative tasks for morning peak (80/20 Pareto principle)
  const prioritizedTasks = [...tasks].sort((a, b) => {
    if (a.category === 'complex_creative' && b.category !== 'complex_creative') return -1;
    if (a.category !== 'complex_creative' && b.category === 'complex_creative') return 1;
    return 0;
  });

  const focusBlocks: FocusBlock[] = [];
  const unassignedTasks: string[] = [];

  // Helper to test if a candidate slot [start, end] is free of conflicts
  const isSlotFree = (start: number, end: number) => {
    for (const b of blockedIntervals) {
      if (intervalsOverlap(start, end, b.start, b.end)) {
        return false;
      }
    }
    return true;
  };

  // Helper to find next available slot within a window
  const findSlot = (windowStart: number, windowEnd: number, duration: number, step = 10) => {
    for (let t = windowStart; t + duration <= windowEnd; t += step) {
      if (isSlotFree(t, t + duration)) {
        return t;
      }
    }
    return null;
  };

  let totalDeepWorkMinutes = 0;

  for (const task of prioritizedTasks) {
    if (task.category === 'admin_light') {
      // Light admin tasks can be scheduled in the post-lunch dip or unassigned
      continue;
    }

    // Rule 2: 50-60 min for complex/creative, 25 min for high-friction/analytical
    const duration = task.category === 'complex_creative' ? 50 : 25;

    let scheduledStart: number | null = null;
    let phase: FocusBlock['circadianPhase'] = 'morning_peak';
    let rationale = '';

    if (task.category === 'complex_creative') {
      // 1. Try Morning Peak first (Cognitive Peak)
      scheduledStart = findSlot(morningPeakStart, morningPeakEnd, duration);
      if (scheduledStart !== null) {
        phase = 'morning_peak';
        rationale = 'Scheduled during Morning Alertness Peak (high vigilance & neurochemical focus).';
      } else {
        // 2. Try Afternoon Second Wind (Core body temp peak)
        scheduledStart = findSlot(secondWindStart, secondWindEnd, duration);
        if (scheduledStart !== null) {
          phase = 'afternoon_second_wind';
          rationale = 'Scheduled during Late-Afternoon Second Wind avoiding the post-lunch dip.';
        }
      }
    } else {
      // Analytical / High-friction (25m block)
      // Can slot in afternoon second wind or morning peak
      scheduledStart = findSlot(secondWindStart, secondWindEnd, duration);
      if (scheduledStart !== null) {
        phase = 'afternoon_second_wind';
        rationale = 'Scheduled during Afternoon Second Wind in a high-intensity 25m sprint.';
      } else {
        scheduledStart = findSlot(morningPeakStart, morningPeakEnd, duration);
        if (scheduledStart !== null) {
          phase = 'morning_peak';
          rationale = 'Scheduled during Morning Alertness window as a 25m Pomodoro sprint.';
        }
      }
    }

    if (scheduledStart !== null) {
      const scheduledEnd = scheduledStart + duration;
      // Mark slot as occupied with a 10m buffer/rest
      blockedIntervals.push({
        start: scheduledStart,
        end: scheduledEnd + 10,
        label: task.title,
      });

      focusBlocks.push({
        blockId: `block-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        taskTitle: task.title,
        category: task.category,
        durationMinutes: duration,
        startTime: minutesToTime(scheduledStart),
        endTime: minutesToTime(scheduledEnd),
        circadianPhase: phase,
        rationale,
      });

      totalDeepWorkMinutes += duration;
    } else {
      unassignedTasks.push(task.title);
    }
  }

  // Sort blocks chronologically
  focusBlocks.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  const morningStr = `${format12h(minutesToTime(morningPeakStart))} - ${format12h(minutesToTime(morningPeakEnd))}`;
  const afternoonStr = `${format12h(minutesToTime(secondWindStart))} - ${format12h(minutesToTime(secondWindEnd))}`;

  return {
    executiveSummary: `Generated ${focusBlocks.length} optimal focus blocks (${totalDeepWorkMinutes}m total deep work). 1:00 PM - 3:00 PM is strictly preserved for digestive recovery and light admin. High-impact Pareto tasks are scheduled during the morning vigilance peak.`,
    wakeTime: wakeTimeStr,
    circadianPeaks: {
      morningAlertnessPeak: `${morningStr} (Peak Cortisol & Vigilance)`,
      postLunchDip: '1:00 PM - 3:00 PM (Strictly protected: No deep focus blocks)',
      afternoonSecondWind: `${afternoonStr} (Core Temperature & Reaction Time Peak)`,
    },
    paretoFocusBlocks: focusBlocks,
    totalDeepWorkMinutes,
    totalBreakMinutes: focusBlocks.length * 10,
    unassignedTasks: unassignedTasks.length > 0 ? unassignedTasks : undefined,
    recommendationNote:
      '80/20 Rule Applied: Tackle your 50m complex/creative block first before any meetings or inbox triage. Protect 1:00 PM - 3:00 PM for walks, lunch, and light admin.',
  };
}

/**
 * Requests the Chronobiology schedule from the server (using Gemini if available),
 * falling back gracefully to the local engine.
 */
export async function requestChronoSchedule(
  wakeTimeStr: string,
  meetings: MeetingSlot[],
  tasks: StrategistTask[]
): Promise<ChronoScheduleOutput> {
  try {
    const res = await fetch('/api/strategist/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wakeTime: wakeTimeStr, meetings, tasks }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.paretoFocusBlocks && Array.isArray(data.paretoFocusBlocks)) {
        return data as ChronoScheduleOutput;
      }
    }
  } catch (_) {
    // Fall back to local engine below
  }

  return generateLocalChronoSchedule(wakeTimeStr, meetings, tasks);
}
