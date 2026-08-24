import React, { useRef, useState, useEffect, ReactNode } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import './ScrollExpand.css';

interface ScrollExpandProps {
  src?: string;
  alt?: string;
  title?: string;
  children?: ReactNode;
  scrollHint?: string;
  useWindowScroll?: boolean;
  startWidth?: number;
  startHeight?: number;
  startRadius?: number;
  endRadius?: number;
  mediaZoom?: number;
  scrollDistance?: number;
  holdDistance?: number;
  smoothing?: number;
  overlayScrim?: number;
  enabled?: boolean;
  className?: string;
}

export default function ScrollExpand({
  src = '',
  alt = '',
  title = '',
  children,
  scrollHint = 'Scroll to expand',
  useWindowScroll = false,
  startWidth = 60,
  startHeight = 50,
  startRadius = 24,
  endRadius = 0,
  mediaZoom = 1.2,
  scrollDistance = 1.0,
  holdDistance = 0.3,
  smoothing = 0.1,
  overlayScrim = 0.4,
  enabled = true,
  className = '',
}: ScrollExpandProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: useWindowScroll ? ['start start', 'end end'] : ['start end', 'end start'],
  });

  useEffect(() => {
    if (!enabled) return;
    const unsubscribe = scrollYProgress.on('change', (v) => setProgress(v));
    return () => unsubscribe();
  }, [scrollYProgress, enabled]);

  const expandProgress = Math.min(1, Math.max(0, (progress - 0.1) / (scrollDistance * 0.6)));
  const scaleProgress = Math.min(1, Math.max(0, (progress - 0.3) / (scrollDistance * 0.5)));

  const currentWidth = startWidth + (100 - startWidth) * expandProgress;
  const currentHeight = startHeight + (100 - startHeight) * expandProgress;
  const currentRadius = startRadius + (endRadius - startRadius) * expandProgress;
  const currentScale = 1 + (mediaZoom - 1) * scaleProgress;
  const currentScrim = overlayScrim * (1 - expandProgress);

  return (
    <div ref={containerRef} className={`scroll-expand-container ${className}`}>
      <div className="scroll-expand-viewport">
        <div
          className="scroll-expand-frame"
          style={{
            width: `${currentWidth}%`,
            height: `${currentHeight}%`,
            borderRadius: `${currentRadius}px`,
            transform: `scale(${currentScale})`,
          }}
        >
          {src && (
            <img src={src} alt={alt} className="scroll-expand-image" loading="lazy" />
          )}
          <div className="scroll-expand-scrim" style={{ opacity: currentScrim }} />
          {title && (
            <div className="scroll-expand-title" style={{ opacity: 1 - expandProgress }}>
              <h3>{title}</h3>
            </div>
          )}
          {scrollHint && expandProgress < 0.5 && (
            <div className="scroll-expand-hint" style={{ opacity: 1 - expandProgress * 3 }}>
              <span>{scrollHint}</span>
              <svg className="scroll-expand-hint-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          )}
          {children && (
            <div className="scroll-expand-content" style={{ opacity: expandProgress }}>
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
