import React, { useEffect, useState } from 'react';

interface Props {
  onComplete: () => void;
}

export const ParetoMotionIntro: React.FC<Props> = ({ onComplete }) => {
  // Phase sequence:
  // 0: Deep silence, pitch black screen
  // 1: Organic breathing ring forms with brand logo colors (#092677 Navy & #af1b3f Crimson)
  // 2: 80/20 Pareto pulse - 80% Navy #092677 + 20% Crimson #af1b3f activates with Pause bars
  // 3: Clean typographic reveal: "Pareto" (Navy/White) "Pause" (Crimson #af1b3f)
  // 4: Dissolve into app (or set name step)
  const [phase, setPhase] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Phase 1: Ring emergence with logo colors
    const t1 = setTimeout(() => setPhase(1), 50);

    // Phase 2: Pareto 80/20 & Pause bars activation
    const t2 = setTimeout(() => setPhase(2), 1100);

    // Phase 3: Typographic brand reveal
    const t3 = setTimeout(() => setPhase(3), 1900);

    // Phase 4: Begin crossfade out
    const t4 = setTimeout(() => {
      setPhase(4);
      setIsFadingOut(true);
    }, 3100);

    // Completion callback to proceed
    const t5 = setTimeout(() => {
      onComplete();
    }, 3700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-50 bg-[#000000] flex flex-col items-center justify-center select-none overflow-hidden cursor-pointer transition-opacity duration-600 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="ParetoPause Intro Animation (Click anywhere to skip)"
      role="banner"
    >
      {/* Meditative Ambient Radial Glow using logo colors (#092677 & #af1b3f) */}
      <div
        className={`absolute w-[440px] h-[440px] rounded-full pointer-events-none transition-all duration-1000 ease-out ${
          phase >= 1 ? 'opacity-70 scale-100' : 'opacity-0 scale-50'
        }`}
        style={{
          background:
            phase >= 2
              ? 'radial-gradient(circle, rgba(175, 27, 63, 0.3) 0%, rgba(9, 38, 119, 0.35) 45%, rgba(0, 0, 0, 0) 72%)'
              : 'radial-gradient(circle, rgba(9, 38, 119, 0.4) 0%, rgba(175, 27, 63, 0.15) 50%, rgba(0, 0, 0, 0) 70%)',
        }}
      />

      {/* Main Center Content */}
      <div className="relative flex flex-col items-center justify-center z-10">
        {/* Organic Pebble Ring with Brand Logo Colors */}
        <div
          className={`relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center transition-all duration-1000 ease-out ${
            phase === 0
              ? 'opacity-0 scale-75'
              : phase === 1
              ? 'opacity-100 scale-100'
              : phase >= 2
              ? 'opacity-100 scale-105'
              : 'opacity-100 scale-100'
          }`}
        >
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full animate-opal-breathe transition-transform duration-700"
            style={{
              filter:
                phase >= 2
                  ? 'drop-shadow(0 0 28px rgba(175, 27, 63, 0.6)) drop-shadow(0 0 35px rgba(9, 38, 119, 0.7))'
                  : 'drop-shadow(0 0 20px rgba(9, 38, 119, 0.5))',
            }}
          >
            <defs>
              {/* Brand Navy 80% Arc Gradient (#092677) */}
              <linearGradient id="logoNavyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e40af" />
                <stop offset="45%" stopColor="#092677" />
                <stop offset="100%" stopColor="#06184a" />
              </linearGradient>

              {/* Brand Crimson 20% Arc Gradient (#af1b3f) */}
              <linearGradient id="logoCrimsonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e11d48" />
                <stop offset="50%" stopColor="#af1b3f" />
                <stop offset="100%" stopColor="#780e28" />
              </linearGradient>
            </defs>

            {/* Base 80% Ring in Brand Navy Blue (#092677) */}
            <path
              d="M 100, 38
                 C 142, 36 166, 62 165, 100
                 C 164, 140 140, 164 100, 165
                 C 58, 166 35, 140 36, 100
                 C 37, 60 60, 40 100, 38 Z
                 M 100, 72
                 C 83, 72 70, 84 70, 100
                 C 70, 116 83, 128 100, 128
                 C 117, 128 130, 116 130, 100
                 C 130, 84 117, 72 100, 72 Z"
              fill="url(#logoNavyGradient)"
              fillRule="evenodd"
              className="transition-opacity duration-700"
            />

            {/* Vital 20% Arc in Signature Brand Crimson (#af1b3f) */}
            <path
              d="M 100, 38
                 C 126, 37 150, 50 162, 74
                 L 128, 88
                 C 123, 78 112, 72 100, 72 Z"
              fill="url(#logoCrimsonGradient)"
              className={`transition-all duration-700 ease-out ${
                phase >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
              style={{
                transformOrigin: '100px 100px',
                filter: 'drop-shadow(0 0 14px rgba(225, 29, 72, 0.9))',
              }}
            />

            {/* Dual Pause Bars in Logo Colors inside the bowl */}
            <g
              className={`transition-all duration-700 ${
                phase >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
              }`}
              style={{ transformOrigin: '100px 100px' }}
            >
              <rect x="91" y="88" width="6" height="24" rx="2" fill="#ffffff" />
              <rect x="103" y="88" width="6" height="24" rx="2" fill="#af1b3f" />
            </g>
          </svg>
        </div>

        {/* Clean Typographic Reveal in Logo Colors */}
        <div
          className={`mt-8 text-center transition-all duration-700 ease-out ${
            phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-0.5">
            <span className="text-white">Pareto</span>
            <span className="text-[#af1b3f] drop-shadow-[0_0_16px_rgba(175,27,63,0.7)]">
              Pause
            </span>
          </h1>

          <p className="text-[10px] sm:text-[11px] tracking-[0.25em] uppercase font-bold text-slate-400 mt-2 font-mono">
            80% Results · 20% Effort
          </p>
        </div>
      </div>

      {/* Subtle Skip Hint */}
      <div
        className={`absolute bottom-8 text-center transition-opacity duration-500 text-xs font-semibold text-slate-500 hover:text-slate-300 ${
          phase >= 2 ? 'opacity-70' : 'opacity-0'
        }`}
      >
        <span>Tap anywhere to continue</span>
      </div>
    </div>
  );
};
