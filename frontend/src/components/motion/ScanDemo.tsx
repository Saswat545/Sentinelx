import React, { useEffect, useState } from 'react';
import { AnimatePresence, animate, motion, useReducedMotion } from 'framer-motion';

const ADDRESS = '0x7a250d5630b4cf539739df2c5dacb4c659f2488d';

const signals = [
  { label: 'Owner can raise sell fee', severity: 'High', tone: 'bg-orange-500', value: 'fee = 92%' },
  { label: 'Mint function not renounced', severity: 'High', tone: 'bg-orange-500', value: 'owner = 0x7a25…' },
  { label: 'Blacklist mapping present', severity: 'Medium', tone: 'bg-amber-500', value: '_blocked[addr]' },
  { label: 'No timelock on proxy', severity: 'Medium', tone: 'bg-amber-500', value: 'upgradeTo()' },
];

const STEPS = ['Reading verified source', 'Extracting 53 signals', 'Scoring with XGBoost'];

/**
 * A looping scan panel used as the hero visual. It walks the same three stages
 * the scanner runs, so the animation explains the product instead of decorating it.
 */
export function ScanDemo() {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(reduceMotion ? 3 : 0);
  const [score, setScore] = useState(reduceMotion ? 82 : 0);

  useEffect(() => {
    if (reduceMotion) return;

    const timers: number[] = [];
    const cycle = () => {
      setStep(0);
      setScore(0);
      timers.push(window.setTimeout(() => setStep(1), 900));
      timers.push(window.setTimeout(() => setStep(2), 1700));
      timers.push(
        window.setTimeout(() => {
          setStep(3);
          animate(0, 82, {
            duration: 1.2,
            ease: [0.22, 1, 0.36, 1],
            onUpdate: (value) => setScore(Math.round(value)),
          });
        }, 2400),
      );
    };

    cycle();
    const loop = window.setInterval(cycle, 7200);
    return () => {
      timers.forEach(clearTimeout);
      clearInterval(loop);
    };
  }, [reduceMotion]);

  const visibleSignals = step >= 3 ? 4 : step >= 2 ? 2 : 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-gray-400">
          Live scan
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-gray-500">
          <span className={`h-1.5 w-1.5 rounded-full ${step > 0 ? 'bg-emerald-500' : 'bg-gray-300'}`} />
          {step > 0 ? 'running' : 'idle'}
        </span>
      </div>

      <div className="px-5 py-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-gray-400">Contract</p>
        <p className="mt-1 break-all font-mono text-xs text-gray-700">{ADDRESS}</p>

        <div className="mt-4 space-y-2">
          {STEPS.map((label, index) => {
            const done = step > index + 1;
            const active = step === index + 1;
            return (
              <div key={label} className="flex items-center gap-2.5">
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-300 ${
                    done ? 'bg-emerald-500' : active ? 'bg-[#0149FD]' : 'bg-gray-200'
                  }`}
                />
                <span
                  className={`text-xs transition-colors duration-300 ${
                    done || active ? 'text-gray-700' : 'text-gray-400'
                  }`}
                >
                  {label}
                </span>
                {done && <span className="font-mono text-[10px] text-gray-400">done</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-gray-200 px-5 py-3">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-gray-400">
            Risk score
          </span>
          <span className="font-mono text-sm tabular-nums text-gray-900">
            {score}
            <span className="text-gray-400">/100</span>
          </span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-gray-100">
          <motion.div
            className="h-full rounded-full bg-red-500"
            animate={{ width: `${score}%` }}
            transition={{ duration: reduceMotion ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      <AnimatePresence initial={false}>
        {visibleSignals > 0 && (
          <motion.ul
            key="signals"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="divide-y divide-gray-100 overflow-hidden border-t border-gray-200"
          >
            {signals.slice(0, visibleSignals).map((signal) => (
              <li key={signal.label} className="flex items-center justify-between gap-3 px-5 py-2.5">
                <span className="flex items-center gap-2 text-xs text-gray-700">
                  <span className={`h-1.5 w-1.5 rounded-full ${signal.tone}`} />
                  {signal.label}
                </span>
                <span className="font-mono text-[10px] text-gray-400">{signal.value}</span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
