import { ChimeSoundId } from '../types';

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let keepAliveSrc: AudioBufferSourceNode | null = null;
let activeAlarmNodes: AudioNode[] = [];

// Ambient synthesizer nodes
let ambientGainNode: GainNode | null = null;
let ambientIntervalId: number | null = null;
let ambientActiveNodes: AudioNode[] = [];

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export async function unlockAudio(): Promise<boolean> {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    // Play a 1ms micro-buffer to satisfy mobile iOS/Android strict gesture policy
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
    return true;
  } catch (_) {
    return false;
  }
}

// Global one-time listener to automatically unlock audio on the very first user interaction
if (typeof window !== 'undefined') {
  const handleFirstInteraction = () => {
    unlockAudio();
    window.removeEventListener('click', handleFirstInteraction);
    window.removeEventListener('touchstart', handleFirstInteraction);
    window.removeEventListener('keydown', handleFirstInteraction);
  };
  window.addEventListener('click', handleFirstInteraction, { passive: true });
  window.addEventListener('touchstart', handleFirstInteraction, { passive: true });
  window.addEventListener('keydown', handleFirstInteraction, { passive: true });
}

function getMasterOutput(ctx: AudioContext): GainNode {
  if (masterGain && masterGain.context === ctx) {
    return masterGain;
  }
  const gain = ctx.createGain();
  gain.gain.value = 0.95;
  gain.connect(ctx.destination);
  masterGain = gain;
  return masterGain;
}

interface NoteDef {
  f?: number;
  from?: number;
  to?: number;
  t: number; // offset in seconds
  d: number; // duration in seconds
}

interface SoundPreset {
  type: OscillatorType;
  peak: number;
  partials: { r: number; g: number }[];
  notes: NoteDef[];
}

const CHIME_PRESETS: Record<ChimeSoundId, SoundPreset> = {
  zen: {
    type: 'sine',
    peak: 0.5,
    partials: [
      { r: 1, g: 1 },
      { r: 2.76, g: 0.35 },
      { r: 5.4, g: 0.18 },
      { r: 8.9, g: 0.08 },
    ],
    notes: [
      { f: 432, t: 0, d: 2.2 },
      { f: 648, t: 0.12, d: 2.5 },
    ],
  },
  bell: {
    type: 'sine',
    peak: 0.45,
    partials: [
      { r: 1, g: 1 },
      { r: 2.01, g: 0.5 },
      { r: 2.76, g: 0.32 },
      { r: 3.94, g: 0.2 },
    ],
    notes: [
      { f: 660, t: 0, d: 1.2 },
      { f: 660, t: 0.3, d: 1.5 },
    ],
  },
  marimba: {
    type: 'sine',
    peak: 0.55,
    partials: [
      { r: 1, g: 1 },
      { r: 3, g: 0.4 },
      { r: 6, g: 0.12 },
    ],
    notes: [
      { f: 784, t: 0, d: 0.4 },
      { f: 1047, t: 0.12, d: 0.6 },
    ],
  },
  triple: {
    type: 'square',
    peak: 0.35,
    partials: [
      { r: 1, g: 1 },
      { r: 2, g: 0.15 },
    ],
    notes: [
      { f: 880, t: 0, d: 0.12 },
      { f: 880, t: 0.18, d: 0.12 },
      { f: 1175, t: 0.36, d: 0.25 },
    ],
  },
  rising: {
    type: 'sine',
    peak: 0.45,
    partials: [
      { r: 1, g: 1 },
      { r: 2, g: 0.2 },
    ],
    notes: [
      { from: 440, to: 880, t: 0, d: 0.35 },
      { from: 880, to: 1320, t: 0.28, d: 0.45 },
    ],
  },
};

/**
 * Schedules a multi-harmonic tone directly on the Web Audio context clock.
 */
function scheduleVoice(
  ctx: AudioContext,
  preset: SoundPreset,
  note: NoteDef,
  startTime: number,
  volume: number,
  output: AudioNode
): AudioNode[] {
  const attack = 0.01;
  const created: AudioNode[] = [];

  preset.partials.forEach((partial) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = preset.type;

    if (note.from != null && note.to != null) {
      osc.frequency.setValueAtTime(note.from * partial.r, startTime);
      osc.frequency.exponentialRampToValueAtTime(note.to * partial.r, startTime + note.d);
    } else if (note.f != null) {
      osc.frequency.setValueAtTime(note.f * partial.r, startTime);
    }

    const peakGain = Math.max(0.0001, preset.peak * partial.g * volume);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(peakGain, startTime + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + note.d);

    osc.connect(gain).connect(output);
    osc.start(startTime);
    osc.stop(startTime + note.d + 0.08);

    created.push(osc, gain);
  });

  return created;
}

/**
 * Auditions or plays a chime immediately with guaranteed audio context wake.
 */
export function playChimeSound(soundId: ChimeSoundId, volume = 1): void {
  const ctx = getAudioContext();
  const play = () => {
    const preset = CHIME_PRESETS[soundId] || CHIME_PRESETS.zen;
    const out = getMasterOutput(ctx);
    const now = ctx.currentTime + 0.03;

    preset.notes.forEach((note) => {
      scheduleVoice(ctx, preset, note, now + note.t, Math.max(0, Math.min(1, volume)), out);
    });
  };

  if (ctx.state === 'suspended') {
    ctx.resume().then(play).catch(play);
  } else {
    play();
  }
}

/**
 * Schedules the completion alarm on the sample-accurate audio clock delaySec in the future.
 */
export function scheduleAlarm(delaySec: number, soundId: ChimeSoundId, volume = 1): void {
  cancelAlarm();
  if (volume <= 0) return;

  const ctx = getAudioContext();
  const preset = CHIME_PRESETS[soundId] || CHIME_PRESETS.zen;
  const out = getMasterOutput(ctx);
  const triggerTime = ctx.currentTime + Math.max(0, delaySec);

  preset.notes.forEach((note) => {
    const nodes = scheduleVoice(ctx, preset, note, triggerTime + note.t, volume, out);
    activeAlarmNodes.push(...nodes);
  });
}

export function cancelAlarm(): void {
  activeAlarmNodes.forEach((node) => {
    try {
      if ('stop' in node && typeof (node as OscillatorNode).stop === 'function') {
        (node as OscillatorNode).stop();
      }
      node.disconnect();
    } catch (_) {}
  });
  activeAlarmNodes = [];
}

/**
 * Sub-audible keep-alive loop to prevent mobile browsers from suspending the Web Audio pipeline.
 */
export function startKeepAlive(): void {
  const ctx = getAudioContext();
  if (keepAliveSrc) return;

  try {
    const buffer = ctx.createBuffer(1, Math.round(ctx.sampleRate * 0.5), ctx.sampleRate);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < channelData.length; i++) {
      channelData[i] = (Math.random() * 2 - 1) * 0.002;
    }

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    const gain = ctx.createGain();
    gain.gain.value = 0.0005; // Virtually silent, keeps audio pipeline warm

    src.connect(gain).connect(ctx.destination);
    src.start();
    keepAliveSrc = src;
  } catch (_) {}
}

export function stopKeepAlive(): void {
  if (!keepAliveSrc) return;
  try {
    keepAliveSrc.stop();
    keepAliveSrc.disconnect();
  } catch (_) {}
  keepAliveSrc = null;
}

/**
 * Procedural Lo-Fi Chords & Focus Music Synthesizer (100% offline, guaranteed to play in every browser).
 * Synthesizes warm 7th chords, mellow Rhodes tones, and gentle vinyl texture.
 */
export function startProceduralAmbient(
  type: 'lofi-beats' | 'rainy-cafe' | 'offline-brown' | 'offline-binaural',
  volume = 0.5
): void {
  stopProceduralAmbient();
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const masterAmbGain = ctx.createGain();
  const targetGain = Math.max(0.01, volume * 0.85);
  masterAmbGain.gain.setValueAtTime(targetGain, ctx.currentTime);
  masterAmbGain.connect(getMasterOutput(ctx));
  ambientGainNode = masterAmbGain;

  if (type === 'lofi-beats') {
    // Generates mellow Lo-Fi electric piano chord progressions (Fmaj7 -> Em7 -> Dm7 -> Cmaj7)
    const chords = [
      [349.23, 440.0, 523.25, 659.25], // Fmaj7
      [329.63, 392.0, 493.88, 587.33], // Em7
      [293.66, 349.23, 440.0, 523.25], // Dm7
      [261.63, 329.63, 392.0, 493.88], // Cmaj7
    ];
    let chordIdx = 0;

    const playChord = () => {
      if (!ambientGainNode) return;
      const currentChord = chords[chordIdx % chords.length];
      chordIdx++;

      currentChord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(950 + idx * 120, ctx.currentTime);

        const startTime = ctx.currentTime + idx * 0.03;
        noteGain.gain.setValueAtTime(0.001, startTime);
        noteGain.gain.linearRampToValueAtTime(0.35, startTime + 0.08);
        noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + 3.8);

        osc.connect(filter).connect(noteGain).connect(masterAmbGain);
        osc.start(startTime);
        osc.stop(startTime + 3.9);

        ambientActiveNodes.push(osc, noteGain, filter);
      });
    };

    // Play immediately and repeat every 4 seconds
    playChord();
    ambientIntervalId = window.setInterval(playChord, 4000);

    // Add continuous soft vinyl crackle texture
    const vinylBuffer = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
    const data = vinylBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const crackle = Math.random() < 0.003 ? (Math.random() * 2 - 1) * 0.4 : 0;
      data[i] = (Math.random() * 2 - 1) * 0.015 + crackle;
    }
    const vinylSrc = ctx.createBufferSource();
    vinylSrc.buffer = vinylBuffer;
    vinylSrc.loop = true;
    const vinylFilter = ctx.createBiquadFilter();
    vinylFilter.type = 'bandpass';
    vinylFilter.frequency.value = 1800;
    const vinylGain = ctx.createGain();
    vinylGain.gain.value = 0.08;
    vinylSrc.connect(vinylFilter).connect(vinylGain).connect(masterAmbGain);
    vinylSrc.start();
    ambientActiveNodes.push(vinylSrc, vinylFilter, vinylGain);
  } else if (type === 'rainy-cafe') {
    // Continuous relaxing rainfall noise with gentle low-frequency rumble
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.03 * white) / 1.03;
      data[i] = last * 2.5 + (Math.random() * 2 - 1) * 0.05;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1200;

    src.connect(filter).connect(masterAmbGain);
    src.start();
    ambientActiveNodes.push(src, filter);
  } else if (type === 'offline-brown') {
    // Deep Brownian focus noise
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 450;
    src.connect(filter).connect(masterAmbGain);
    src.start();
    ambientActiveNodes.push(src, filter);
  } else if (type === 'offline-binaural') {
    // 40Hz Gamma waves for cognitive focus
    const oscL = ctx.createOscillator();
    const oscR = ctx.createOscillator();
    oscL.type = 'sine';
    oscR.type = 'sine';
    oscL.frequency.value = 200;
    oscR.frequency.value = 240; // 40Hz difference

    const merger = ctx.createChannelMerger(2);
    oscL.connect(merger, 0, 0);
    oscR.connect(merger, 0, 1);
    merger.connect(masterAmbGain);

    oscL.start();
    oscR.start();
    ambientActiveNodes.push(oscL, oscR, merger);
  }
}

export function setProceduralAmbientVolume(volume: number): void {
  if (ambientGainNode) {
    const ctx = getAudioContext();
    const target = Math.max(0.0001, volume * 0.6);
    ambientGainNode.gain.cancelScheduledValues(ctx.currentTime);
    ambientGainNode.gain.linearRampToValueAtTime(target, ctx.currentTime + 0.1);
  }
}

export function stopProceduralAmbient(): void {
  if (ambientIntervalId) {
    clearInterval(ambientIntervalId);
    ambientIntervalId = null;
  }
  ambientActiveNodes.forEach((node) => {
    try {
      if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
        (node as AudioScheduledSourceNode).stop();
      }
      node.disconnect();
    } catch (_) {}
  });
  ambientActiveNodes = [];

  if (ambientGainNode) {
    try {
      ambientGainNode.disconnect();
    } catch (_) {}
    ambientGainNode = null;
  }
}

/**
 * Audio cue for the 3-2-1 breathing/preparation countdown.
 */
export function playCountdownBeep(isGo = false, volume = 0.7): void {
  const ctx = getAudioContext();
  const out = getMasterOutput(ctx);
  const now = ctx.currentTime + 0.01;
  const vol = Math.max(0, Math.min(1, volume));

  if (isGo) {
    scheduleVoice(
      ctx,
      { type: 'sine', peak: 0.5, partials: [{ r: 1, g: 1 }, { r: 2, g: 0.3 }], notes: [] },
      { from: 660, to: 1040, t: 0, d: 0.35 },
      now,
      vol,
      out
    );
  } else {
    scheduleVoice(
      ctx,
      { type: 'sine', peak: 0.3, partials: [{ r: 1, g: 1 }], notes: [] },
      { f: 580, t: 0, d: 0.12 },
      now,
      vol,
      out
    );
  }
}
