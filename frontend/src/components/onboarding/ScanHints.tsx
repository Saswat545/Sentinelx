// SentinelX — scanner hints (driver.js `hints` entry).
// Pulsing beacons on the scan page: they never block the task, open a themed
// popover on click, and stop offering themselves once one has been opened.
// Mounted with `visible` tied to the resting scanner state so a beacon is
// never attached to an element that unmounts (mode switches, analysis run).

import { useEffect, useRef } from 'react';
import { hints, type Hints } from 'driver.js/hints';
import { areHintsSeen, markHintsSeen, prefersReducedMotion } from './onboarding';

export function ScanHints({ visible }: { visible: boolean }) {
  const hintsRef = useRef<Hints | null>(null);

  useEffect(() => {
    if (!visible || areHintsSeen()) return;

    const instance = hints({
      beacon: { animate: !prefersReducedMotion() },
      onOpen: () => markHintsSeen(),
      hints: [
        {
          id: 'scan-mode',
          element: '#scan-mode-tabs',
          popover: {
            title: 'Two ways to scan',
            description:
              'Paste an Etherscan-verified address, or switch to raw Solidity when the source was never verified.',
            side: 'bottom',
          },
        },
        {
          id: 'scan-input',
          element: '#scan-input',
          popover: {
            title: 'Paste anything',
            description:
              'A 0x address or a DEXScreener / Etherscan URL — the contract address is extracted for you.',
            side: 'bottom',
          },
        },
        {
          id: 'scan-examples',
          element: '#scan-examples',
          popover: {
            title: 'Just exploring?',
            description:
              'Try one of the pre-audited example contracts to see a full report.',
            side: 'top',
          },
        },
      ],
    });

    hintsRef.current = instance;
    instance.show();

    return () => {
      instance.hide();
      hintsRef.current = null;
    };
  }, [visible]);

  return null;
}
