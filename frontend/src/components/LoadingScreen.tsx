import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CrowdCanvas } from './bits/CrowdCanvas';

type LoadingScreenProps = {
  /** How long the brand moment holds before it starts leaving, in ms. */
  duration?: number;
  onDone?: () => void;
};

const WORDMARK = 'SentinelX';

const EASE = [0.22, 1, 0.36, 1] as const;

export function LoadingScreen({ duration = 2600, onDone }: LoadingScreenProps) {
  const [leaving, setLeaving] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hold = reduced ? Math.min(duration, 900) : duration;

    const start = performance.now();
    let frame = 0;

    const tick = () => {
      const ratio = Math.min(1, (performance.now() - start) / hold);
      setProgress(ratio);
      if (ratio < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const leaveAt = window.setTimeout(() => setLeaving(true), hold);
    const doneAt = window.setTimeout(() => onDone?.(), hold + (reduced ? 120 : 460));

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(leaveAt);
      window.clearTimeout(doneAt);
    };
  }, [duration, onDone]);

  return (
    <AnimatePresence>
      {!leaving && (
        <motion.div
          key="splash"
          role="status"
          aria-live="polite"
          aria-label="Loading SentinelX"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(8px)' }}
          transition={{ duration: 0.44, ease: EASE }}
          className="fixed inset-0 z-[100] overflow-hidden bg-[#05070C]"
        >
          {/* Ambient light behind the mark, no layout cost */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-[58%] rounded-full opacity-70 blur-3xl"
            style={{
              background:
                'radial-gradient(circle, rgba(1,73,253,0.30) 0%, rgba(1,73,253,0.08) 42%, transparent 70%)',
            }}
          />

          <CrowdCanvas stripHeight="42vh" opacity={0.85} />

          <div className="relative z-10 flex h-full flex-col items-center justify-center px-6">
            <motion.div
              initial={{ scale: 0.86, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="relative"
            >
              <img
                src="/brand/dark/Icon mark.png"
                alt=""
                className="h-14 w-14 object-contain brightness-0 invert"
                onError={(event) => {
                  (event.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </motion.div>

            <div className="mt-7 flex overflow-hidden">
              {WORDMARK.split('').map((char, index) => (
                <motion.span
                  key={`${char}-${index}`}
                  initial={{ y: 34, opacity: 0, filter: 'blur(10px)' }}
                  animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                  transition={{ duration: 0.75, delay: 0.18 + index * 0.055, ease: EASE }}
                  className="font-display text-3xl font-semibold tracking-[-0.04em] text-white sm:text-[40px]"
                >
                  {char === 'X' ? <span className="text-[#4C7BFF]">X</span> : char}
                </motion.span>
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85, duration: 0.6 }}
              className="mt-4 font-mono text-[10px] uppercase tracking-[0.32em] text-white/35"
            >
              Smart contract risk
            </motion.p>

            {/* Progress hairline: says how long the wait is, rather than an
                indefinite spinner. */}
            <div className="mt-10 h-px w-40 overflow-hidden bg-white/10" aria-hidden="true">
              <motion.div
                className="h-px bg-[#4C7BFF]"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
