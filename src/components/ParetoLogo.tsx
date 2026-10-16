import React from 'react';

export interface ParetoLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'inline' | 'stacked' | 'mark';
  theme?: 'auto' | 'light' | 'dark';
}

/**
 * ParetoLogo
 * Signature brand mark utilizing the user's authentic palette:
 * - Brand Navy Blue: #092677 (Pareto 80% foundation)
 * - Brand Crimson Red: #af1b3f (Pause 20% vital vital pulse)
 * 
 * Built with rock-solid vector geometry & flexbox layout so it is NEVER scattered or misaligned.
 */
export const ParetoLogo: React.FC<ParetoLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'inline',
}) => {
  // Dimensions for the emblem mark
  const emblemDim = {
    xs: { w: 22, h: 26, viewBox: '0 0 64 76' },
    sm: { w: 28, h: 33, viewBox: '0 0 64 76' },
    md: { w: 36, h: 42, viewBox: '0 0 64 76' },
    lg: { w: 48, h: 57, viewBox: '0 0 64 76' },
    xl: { w: 64, h: 76, viewBox: '0 0 64 76' },
  }[size];

  // Font sizing for text lockups
  const textSizes = {
    xs: { text: 'text-sm', sub: 'text-[11px]', gap: 'gap-1.5' },
    sm: { text: 'text-base', sub: 'text-xs', gap: 'gap-2' },
    md: { text: 'text-xl', sub: 'text-sm', gap: 'gap-2.5' },
    lg: { text: 'text-2xl', sub: 'text-base', gap: 'gap-3' },
    xl: { text: 'text-4xl', sub: 'text-xl', gap: 'gap-3.5' },
  }[size];

  // Vector Emblem: Letter 'P' with Navy Stem (#092677), Crimson Loop (#af1b3f), and Pause Bars (||)
  const Emblem = (
    <svg
      width={emblemDim.w}
      height={emblemDim.h}
      viewBox={emblemDim.viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 select-none transition-transform group-hover:scale-105"
      aria-label="ParetoPause Emblem"
    >
      {/* Navy Foundation Stem of 'P' (#092677) */}
      <rect
        x="6"
        y="4"
        width="14"
        height="68"
        rx="3.5"
        fill="#092677"
        className="transition-colors"
      />

      {/* Top connector bar uniting stem to loop */}
      <rect x="18" y="4" width="16" height="11" fill="#092677" />

      {/* Bottom connector bar uniting stem to loop */}
      <rect x="18" y="37" width="16" height="11" fill="#092677" />

      {/* Crimson Bowl/Loop of 'P' (#af1b3f) */}
      <path
        d="M26 4 H42 C53.0457 4 62 12.9543 62 24 C62 35.0457 53.0457 44 42 44 H26 V33 H42 C46.9706 33 51 28.9706 51 24 C51 19.0294 46.9706 15 42 15 H26 V4 Z"
        fill="#af1b3f"
      />

      {/* Pause Bars inside the 'P' bowl (||) in signature Navy */}
      <rect x="29" y="17" width="4.5" height="14" rx="1.5" fill="#092677" />
      <rect x="37" y="17" width="4.5" height="14" rx="1.5" fill="#092677" />
    </svg>
  );

  if (variant === 'mark') {
    return (
      <div className={`inline-flex items-center justify-center select-none ${className}`}>
        {Emblem}
      </div>
    );
  }

  // Variant: Stacked (Creative shared 'P' design: P+areto / P+ause)
  if (variant === 'stacked') {
    return (
      <div className={`inline-flex items-center select-none ${textSizes.gap} ${className}`}>
        {Emblem}
        <div className="flex flex-col justify-between py-0.5 leading-none font-extrabold tracking-tight">
          <span className={`${textSizes.sub} text-[#092677] dark:text-white font-black tracking-tight`}>
            areto
          </span>
          <span className={`${textSizes.sub} text-[#af1b3f] font-black tracking-tight mt-1`}>
            ause
          </span>
        </div>
      </div>
    );
  }

  // Default Variant: Inline ("ParetoPause")
  return (
    <div className={`inline-flex items-center select-none ${textSizes.gap} ${className}`}>
      {Emblem}
      <div className={`font-extrabold tracking-tight leading-none ${textSizes.text}`}>
        <span className="text-[#092677] dark:text-white">Pareto</span>
        <span className="text-[#af1b3f]">Pause</span>
      </div>
    </div>
  );
};
