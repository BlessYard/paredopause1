import { ProductivityDirectorResult } from '../types';

/**
 * Local deterministic 80/20 prioritization engine
 */
export function prioritizeTasksLocally(
  rawInput: string | string[],
  currentTime: string,
  energyLevel: number,
  timerDurationMinutes: number = 25
): ProductivityDirectorResult {
  let taskList: string[] = [];

  if (Array.isArray(rawInput)) {
    taskList = rawInput.map((t) => t.trim()).filter(Boolean);
  } else {
    taskList = rawInput
      .split(/[\n,;•\-*]+/)
      .map((t) => t.replace(/^\d+[\.\)]\s*/, '').trim())
      .filter((t) => t.length > 1);
  }

  if (taskList.length === 0) {
    taskList = [
      'Draft core executive proposal & architecture',
      'Clear unread inbox emails',
      'Review low-priority slack channels',
    ];
  }

  // 80/20 heuristic scoring:
  // Complex, high-impact tasks (containing words like draft, write, design, build, strategy, architecture, pitch, report, feature) score higher.
  // Low-impact maintenance (inbox, email, slack, clean, organize, browse) score lower.
  const highLeverageKeywords = [
    'strategy',
    'architect',
    'design',
    'build',
    'write',
    'draft',
    'code',
    'solve',
    'pitch',
    'launch',
    'revenue',
    'client',
    'core',
    'proposal',
    'model',
    'plan',
    'feature',
  ];

  const lowLeverageKeywords = ['inbox', 'email', 'slack', 'browse', 'clean', 'triage', 'sync', 'chat', 'organize'];

  const scored = taskList.map((task) => {
    const lower = task.toLowerCase();
    let score = 5;
    highLeverageKeywords.forEach((w) => {
      if (lower.includes(w)) score += 4;
    });
    lowLeverageKeywords.forEach((w) => {
      if (lower.includes(w)) score -= 3;
    });
    // If energy level is high (>=7), favor complex creative work.
    // If energy level is low (<5), favor a quick win or clear friction.
    if (energyLevel >= 7 && score > 6) score += 2;
    return { task, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const selectedOne = scored[0].task;
  const remaining = scored.slice(1).map((s) => s.task);

  // Generate hyper-specific 2-minute starting action
  let firstStep = `Open your primary workspace (document, editor, or canvas) and type the first single sentence or bullet point outline.`;
  const lowerOne = selectedOne.toLowerCase();
  if (lowerOne.includes('write') || lowerOne.includes('draft') || lowerOne.includes('proposal')) {
    firstStep = `Open a blank page, write the title '${selectedOne}', and draft 3 bullet points of what must be decided.`;
  } else if (lowerOne.includes('code') || lowerOne.includes('architect') || lowerOne.includes('build')) {
    firstStep = `Open your project, create the core file/function signature, and write a 2-line comment describing the goal.`;
  } else if (lowerOne.includes('review') || lowerOne.includes('audit') || lowerOne.includes('financial')) {
    firstStep = `Pull up the primary spreadsheet/dashboard and highlight the top 3 anomaly rows to inspect.`;
  } else if (lowerOne.includes('design') || lowerOne.includes('plan')) {
    firstStep = `Grab a notepad or blank canvas and sketch the single main user interaction flow.`;
  }

  // Generate strict ignore list
  const ignoreList = [
    ...remaining,
    'Email notifications & unread badge checks',
    'Slack / Discord / Messaging pings',
    'Twitter / LinkedIn / Social feeds',
    'Non-urgent meeting scheduling',
  ].slice(0, 5);

  const rationale = `The Pareto Principle states that 80% of your career and project results stem from 20% of your efforts. At energy level ${energyLevel}/10 (${currentTime}), '${selectedOne}' is your primary needle-mover. Completing this single ${timerDurationMinutes}-minute block creates maximum leverage.`;

  return {
    oneTask: selectedOne,
    firstStep2Min: firstStep,
    ignoreList,
    rationale,
    timerDurationMinutes,
  };
}

/**
 * Requests 80/20 prioritization from the server endpoint (Gemini-powered),
 * falling back gracefully to the local engine.
 */
export async function request8020Prioritization(
  rawInput: string | string[],
  currentTime: string,
  energyLevel: number,
  timerDurationMinutes: number = 25
): Promise<ProductivityDirectorResult> {
  try {
    const res = await fetch('/api/director/prioritize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rawTasks: rawInput,
        currentTime,
        energyLevel,
        timerDurationMinutes,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.oneTask && data.firstStep2Min) {
        return data as ProductivityDirectorResult;
      }
    }
  } catch (_) {
    // Fall back to local prioritization
  }

  return prioritizeTasksLocally(rawInput, currentTime, energyLevel, timerDurationMinutes);
}
