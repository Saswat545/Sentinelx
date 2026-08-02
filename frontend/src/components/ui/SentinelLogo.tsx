import React, { useState } from 'react';

export type LogoVariant = 'horizontal' | 'stacked' | 'icon' | 'monochrome';

interface SentinelLogoProps {
  variant?: LogoVariant;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  theme?: 'dark' | 'light';
}

export const SentinelLogo: React.FC<SentinelLogoProps> = ({
  variant = 'horizontal',
  className = '',
  size = 'md',
  showSubtitle = true,
  theme = 'dark',
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeStyles = {
    sm: {
      horizontal: 'h-7 w-auto',
      stacked: 'h-16 w-auto',
      icon: 'h-6 w-6',
      monochrome: 'h-7 w-auto',
    },
    md: {
      horizontal: 'h-9 w-auto',
      stacked: 'h-24 w-auto',
      icon: 'h-8 w-8',
      monochrome: 'h-9 w-auto',
    },
    lg: {
      horizontal: 'h-12 w-auto',
      stacked: 'h-32 w-auto',
      icon: 'h-12 w-12',
      monochrome: 'h-12 w-auto',
    },
    xl: {
      horizontal: 'h-16 w-auto',
      stacked: 'h-44 w-auto',
      icon: 'h-16 w-16',
      monochrome: 'h-16 w-auto',
    },
  };

  const imagePaths = {
    horizontal: `/brand/${theme}/Horizontal logo.png`,
    stacked: `/brand/${theme}/Stacked logo.png`,
    icon: `/brand/light/Icon mark.png`,
    monochrome: `/brand/${theme}/Monochrome version.png`,
  };

  const fallbackTextSizes = {
    sm: { text: 'text-sm', sub: 'text-[9px]' },
    md: { text: 'text-lg', sub: 'text-[10px]' },
    lg: { text: 'text-2xl', sub: 'text-[11px]' },
    xl: { text: 'text-4xl', sub: 'text-[13px]' },
  };

  const currentSize = fallbackTextSizes[size];

  if (!imageError) {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <img
          src={imagePaths[variant]}
          alt="SentinelX Logo"
          className={`${sizeStyles[size][variant]} object-contain drop-shadow-sm transition-opacity duration-200`}
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // Graceful SVG Fallback if image path fails
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className="p-1.5 bg-gray-900 rounded-xl border border-gray-800 shrink-0">
        <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
          <path d="M20 3L6 9V19C6 28.5 12.2 35.8 20 38C27.8 35.8 34 28.5 34 19V9L20 3Z" fill="#111827" stroke="#2563EB" strokeWidth="2.5" />
          <path d="M13 14L27 26M27 14L13 26" stroke="#3B82F6" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      </div>
      <div className="flex flex-col text-left">
        <span className={`font-extrabold text-white tracking-tight leading-none ${currentSize.text}`}>
          Sentinel<span className="text-blue-500">X</span>
        </span>
        {showSubtitle && (
          <span className={`font-mono text-gray-400 tracking-widest uppercase font-medium mt-1 ${currentSize.sub}`}>
            Security Intelligence
          </span>
        )}
      </div>
    </div>
  );
};
