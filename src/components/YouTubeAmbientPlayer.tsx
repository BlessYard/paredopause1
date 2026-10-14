import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Music, WifiOff, Disc3, Play, Square, ExternalLink } from 'lucide-react';
import { AmbientSourceId, AmbientPreset } from '../types';
import {
  startProceduralAmbient,
  stopProceduralAmbient,
  setProceduralAmbientVolume,
  unlockAudio,
} from '../services/audioEngine';

export const AMBIENT_PRESETS: AmbientPreset[] = [
  {
    id: 'lofi-girl',
    title: 'Lo-Fi Chill Beats (Built-in Synth)',
    subtitle: 'Warm 7th chords & gentle vinyl texture',
    isOfflineAvailable: true,
  },
  {
    id: 'rainy-cafe',
    title: 'Rainy Cafe Ambience',
    subtitle: 'Gentle rainfall acoustics & warm room roar',
    isOfflineAvailable: true,
  },
  {
    id: 'offline-brown',
    title: 'Brown Focus Noise',
    subtitle: 'Deep low-pass masking for deep concentration',
    isOfflineAvailable: true,
  },
  {
    id: 'offline-binaural',
    title: '40Hz Gamma Focus Waves',
    subtitle: 'Binaural cognitive rhythm',
    isOfflineAvailable: true,
  },
  {
    id: 'chill-study',
    title: 'YouTube Lofi Girl Stream',
    subtitle: 'Online 24/7 stream via YouTube',
    youtubeId: 'jfKfPfyJRdk',
    isOfflineAvailable: false,
  },
  {
    id: 'custom-youtube',
    title: 'Custom YouTube Link',
    subtitle: 'Paste any YouTube video or live stream',
    isOfflineAvailable: false,
  },
  {
    id: 'none',
    title: 'Silent (No Sound)',
    subtitle: 'Concentrate in quiet silence',
    isOfflineAvailable: true,
  },
];

interface Props {
  sourceId: AmbientSourceId;
  customUrl: string;
  isPlaying: boolean;
  isWorkPhase: boolean;
  volume: number; // 0 to 1
  soundEnabled: boolean;
  pauseMusicDuringBreaks?: boolean;
  onVolumeChange: (vol: number) => void;
  onSelectSource: (id: AmbientSourceId) => void;
  onToggleSoundEnabled: (enabled: boolean) => void;
}

export const YouTubeAmbientPlayer: React.FC<Props> = ({
  sourceId,
  customUrl,
  isPlaying,
  isWorkPhase,
  volume,
  soundEnabled,
  pauseMusicDuringBreaks = true,
  onVolumeChange,
  onToggleSoundEnabled,
}) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [manualPreviewPlaying, setManualPreviewPlaying] = useState(false);

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

  const extractVideoId = (input: string): string => {
    if (!input) return 'jfKfPfyJRdk';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = input.match(regExp);
    return match && match[2].length === 11 ? match[2] : input.trim();
  };

  const currentPreset = AMBIENT_PRESETS.find((p) => p.id === sourceId) || AMBIENT_PRESETS[0];
  const isYouTube = sourceId === 'chill-study' || sourceId === 'custom-youtube';
  const activeYoutubeId =
    sourceId === 'custom-youtube'
      ? extractVideoId(customUrl)
      : currentPreset.youtubeId || 'jfKfPfyJRdk';

  // Should sound play right now?
  // Automatically stops on break if pauseMusicDuringBreaks is true, and automatically resumes on work phase!
  const isPlayingActivePhase = isPlaying && (isWorkPhase || !pauseMusicDuringBreaks);
  const shouldPlayAmbient = soundEnabled && volume > 0 && sourceId !== 'none' && (manualPreviewPlaying || isPlayingActivePhase);

  // Handle built-in synthesized procedural sounds (100% reliable)
  useEffect(() => {
    if (!isYouTube && sourceId !== 'none') {
      if (shouldPlayAmbient) {
        unlockAudio();
        const soundType =
          sourceId === 'rainy-cafe'
            ? 'rainy-cafe'
            : sourceId === 'offline-brown'
            ? 'offline-brown'
            : sourceId === 'offline-binaural'
            ? 'offline-binaural'
            : 'lofi-beats';
        startProceduralAmbient(soundType, volume);
      } else {
        stopProceduralAmbient();
      }
    } else {
      stopProceduralAmbient();
    }

    return () => {
      stopProceduralAmbient();
    };
  }, [shouldPlayAmbient, sourceId, isYouTube, volume]);

  // Adjust volume
  useEffect(() => {
    if (!isYouTube) {
      setProceduralAmbientVolume(soundEnabled ? volume : 0);
    } else if (iframeRef.current && iframeRef.current.contentWindow) {
      const targetVol = soundEnabled ? Math.round(volume * 100) : 0;
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'setVolume', args: [targetVol] }),
        '*'
      );
    }
  }, [volume, soundEnabled, isYouTube]);

  // YouTube play/pause postMessage
  useEffect(() => {
    if (!isYouTube) return;
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;

    if (shouldPlayAmbient) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'playVideo' }),
        '*'
      );
    } else {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'pauseVideo' }),
        '*'
      );
    }
  }, [shouldPlayAmbient, isYouTube]);

  if (sourceId === 'none') {
    return (
      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
        Background sound is currently turned off.
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {/* Mini Ambient Player Card */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                shouldPlayAmbient
                  ? 'bg-[#af1b3f] text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}
            >
              {shouldPlayAmbient ? (
                <Disc3 className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />
              ) : (
                <Music className="w-4 h-4" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {currentPreset.title}
                </span>
                {!isOnline && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] text-amber-600 font-semibold px-1 py-0.5 rounded-md bg-amber-50">
                    <WifiOff className="w-2.5 h-2.5" /> Offline
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-500 truncate block">
                {shouldPlayAmbient
                  ? '🎯 Deep focus · Music playing'
                  : isPlaying && !isWorkPhase
                  ? '☕ Break time · Music paused (resumes next set)'
                  : 'Paused (press Test or start timer)'}
              </span>
            </div>
          </div>

          {/* Quick Sound Enable/Disable Toggle */}
          <button
            type="button"
            onClick={() => {
              unlockAudio();
              onToggleSoundEnabled(!soundEnabled);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              soundEnabled
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700'
            }`}
          >
            {soundEnabled ? 'Sound ON' : 'Sound OFF'}
          </button>
        </div>

        {/* Volume & Preview Row */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 flex-1">
            <button
              type="button"
              onClick={() => onToggleSoundEnabled(!soundEnabled)}
              className="text-slate-500 hover:text-slate-800 dark:hover:text-white"
            >
              {soundEnabled && volume > 0 ? (
                <Volume2 className="w-4 h-4 text-[#af1b3f]" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundEnabled ? volume : 0}
              onChange={(e) => {
                unlockAudio();
                onToggleSoundEnabled(true);
                onVolumeChange(parseFloat(e.target.value));
              }}
              className="w-full h-1.5 accent-[#af1b3f] bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              aria-label="Background audio volume"
            />
            <span className="text-[10px] font-mono text-slate-400 w-8 text-right">
              {soundEnabled ? Math.round(volume * 100) : 0}%
            </span>
          </div>

          {/* Manual test/preview toggle */}
          <button
            type="button"
            onClick={() => {
              unlockAudio();
              setManualPreviewPlaying(!manualPreviewPlaying);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shrink-0 transition-colors"
          >
            {manualPreviewPlaying ? (
              <>
                <Square className="w-3 h-3 fill-current text-red-500" /> Stop Preview
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current text-emerald-600" /> Test Sound
              </>
            )}
          </button>
        </div>

        {/* If YouTube is selected, render a visible mini-player card with direct play affordance */}
        {isYouTube && (
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black aspect-video max-h-36 relative">
              <iframe
                ref={iframeRef}
                src={`https://www.youtube-nocookie.com/embed/${activeYoutubeId}?enablejsapi=1&autoplay=${shouldPlayAmbient ? 1 : 0}&controls=1&fs=0&loop=1&playlist=${activeYoutubeId}&origin=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.origin : ''
                )}`}
                title="YouTube Lo-Fi Focus Player"
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                onLoad={() => {
                  if (shouldPlayAmbient && iframeRef.current && iframeRef.current.contentWindow) {
                    iframeRef.current.contentWindow.postMessage(
                      JSON.stringify({ event: 'command', func: 'playVideo' }),
                      '*'
                    );
                  }
                }}
              />
            </div>
            <div className="flex justify-between items-center mt-1.5 text-[11px] text-slate-500">
              <span>Tap play above if your browser blocks auto-play</span>
              <a
                href={`https://www.youtube.com/watch?v=${activeYoutubeId}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[#092677] dark:text-blue-400 hover:underline font-semibold"
              >
                <span>Open YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
