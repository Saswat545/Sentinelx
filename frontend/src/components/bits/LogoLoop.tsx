import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  memo,
} from 'react';

import {
  SiEthereum,
  SiSolidity,
  SiOpenzeppelin,
  SiChainlink,
  SiPolygon,
} from 'react-icons/si';

import './LogoLoop.css';

const ANIMATION_CONFIG = {
  SMOOTH_TAU: 0.35,
  MIN_COPIES: 2,
  COPY_HEADROOM: 2,
};

interface LogoItem {
  node?: React.ReactNode;
  title?: string;
  href?: string;
  ariaLabel?: string;
}

interface LogoLoopProps {
  logos: LogoItem[];
  speed?: number;
  direction?: 'left' | 'right';
  width?: string | number;
  logoHeight?: number;
  gap?: number;
  hoverSpeed?: number;
  pauseOnHover?: boolean;
  fadeOut?: boolean;
  fadeOutColor?: string;
  scaleOnHover?: boolean;
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const LogoLoop = memo(function LogoLoop({
  logos,
  speed = 35,
  direction = 'left',
  width = '100%',
  logoHeight = 30,
  gap = 70,
  hoverSpeed,
  pauseOnHover = false,
  fadeOut = false,
  fadeOutColor = '#050505',
  scaleOnHover = false,
  ariaLabel = 'SentinelX security ecosystem',
  className = '',
  style,
}: LogoLoopProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const seqRef = useRef<HTMLUListElement>(null);

  const [seqWidth, setSeqWidth] = useState(0);
  const [copyCount, setCopyCount] = useState(
    ANIMATION_CONFIG.MIN_COPIES
  );

  const [isHovered, setIsHovered] = useState(false);

  /*
   * Calculate how many copies are required
   * to create a seamless infinite loop.
   */
  const updateDimensions = useCallback(() => {
    const containerWidth =
      containerRef.current?.clientWidth ?? 0;

    const sequenceWidth =
      seqRef.current?.getBoundingClientRect().width ?? 0;

    if (sequenceWidth > 0) {
      setSeqWidth(Math.ceil(sequenceWidth));

      const copiesNeeded =
        Math.ceil(containerWidth / sequenceWidth) +
        ANIMATION_CONFIG.COPY_HEADROOM;

      setCopyCount(
        Math.max(
          ANIMATION_CONFIG.MIN_COPIES,
          copiesNeeded
        )
      );
    }
  }, []);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(
      updateDimensions
    );

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    if (seqRef.current) {
      resizeObserver.observe(seqRef.current);
    }

    updateDimensions();

    return () => {
      resizeObserver.disconnect();
    };
  }, [updateDimensions, logos, gap, logoHeight]);

  /*
   * Infinite animation
   */
  useEffect(() => {
    const track = trackRef.current;

    if (!track || seqWidth <= 0) return;

    let animationFrame = 0;
    let offset = 0;
    let velocity = 0;
    let lastTimestamp: number | null = null;

    const directionMultiplier =
      direction === 'left' ? 1 : -1;

    const normalVelocity =
      Math.abs(speed) * directionMultiplier;

    const hoverVelocity =
      hoverSpeed !== undefined
        ? Math.abs(hoverSpeed) * directionMultiplier
        : pauseOnHover
        ? 0
        : normalVelocity;

    const animate = (timestamp: number) => {
      if (lastTimestamp === null) {
        lastTimestamp = timestamp;
      }

      const dt =
        Math.max(
          0,
          timestamp - lastTimestamp
        ) / 1000;

      lastTimestamp = timestamp;

      const targetVelocity = isHovered
        ? hoverVelocity
        : normalVelocity;

      /*
       * Smooth acceleration / deceleration
       */
      velocity +=
        (targetVelocity - velocity) *
        (1 -
          Math.exp(
            -dt /
              ANIMATION_CONFIG.SMOOTH_TAU
          ));

      offset =
        ((offset +
          velocity * dt) %
          seqWidth +
          seqWidth) %
        seqWidth;

      track.style.transform = `translate3d(${-offset}px, 0, 0)`;

      animationFrame =
        requestAnimationFrame(animate);
    };

    animationFrame =
      requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [
    speed,
    direction,
    seqWidth,
    isHovered,
    hoverSpeed,
    pauseOnHover,
  ]);

  /*
   * Render individual logo
   */
  const renderLogoItem = useCallback(
    (item: LogoItem, key: React.Key) => {
      const content = (
        <span
          className={`logoloop__logo ${
            scaleOnHover
              ? 'logoloop__logo--hover'
              : ''
          }`}
        >
          {item.node ? (
            <span className="logoloop__icon">
              {item.node}
            </span>
          ) : (
            <span className="logoloop__name">
              {item.title}
            </span>
          )}
        </span>
      );

      return (
        <li
          className="logoloop__item"
          key={key}
        >
          {item.href ? (
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="logoloop__link"
              aria-label={
                item.ariaLabel ||
                item.title ||
                ''
              }
            >
              {content}
            </a>
          ) : (
            content
          )}
        </li>
      );
    },
    [scaleOnHover]
  );

  /*
   * Create duplicated logo sequences.
   */
  const logoLists = useMemo(() => {
    return Array.from(
      { length: copyCount },
      (_, copyIndex) => (
        <ul
          className="logoloop__list"
          key={`copy-${copyIndex}`}
          ref={
            copyIndex === 0
              ? seqRef
              : undefined
          }
          aria-hidden={
            copyIndex > 0
              ? true
              : undefined
          }
        >
          {logos.map((logo, index) =>
            renderLogoItem(
              logo,
              `${copyIndex}-${index}`
            )
          )}
        </ul>
      )
    );
  }, [
    copyCount,
    logos,
    renderLogoItem,
  ]);

  const rootClassName = [
    'logoloop',
    fadeOut
      ? 'logoloop--fade'
      : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={containerRef}
      className={rootClassName}
      style={
        {
          width:
            typeof width === 'number'
              ? `${width}px`
              : width,

          '--logoloop-gap': `${gap}px`,
          '--logoloop-logoHeight': `${logoHeight}px`,
          '--logoloop-fadeColor':
            fadeOutColor,

          ...style,
        } as React.CSSProperties
      }
      role="region"
      aria-label={ariaLabel}
    >
      <div
        ref={trackRef}
        className="logoloop__track"
        onMouseEnter={() =>
          setIsHovered(true)
        }
        onMouseLeave={() =>
          setIsHovered(false)
        }
      >
        {logoLists}
      </div>
    </div>
  );
});

/*
 * SentinelX ecosystem logos
 *
 * These are deliberately focused on:
 * Ethereum
 * Smart Contracts
 * Security
 * Infrastructure
 */
export const sentinelXLogos: LogoItem[] = [
  {
    title: 'Hardhat',
    node: (
      <span className="custom-brand custom-brand--hardhat">
        ◆
      </span>
    ),
  },

  {
    title: 'Foundry',
    node: (
      <span className="custom-brand custom-brand--foundry">
        F
      </span>
    ),
  },

  {
    title: 'Etherscan',
    node: (
      <span className="custom-brand custom-brand--etherscan">
        E
      </span>
    ),
  },

  {
    title: 'Ethereum',
    node: <SiEthereum />,
  },

  {
    title: 'Solidity',
    node: <SiSolidity />,
  },

  {
    title: 'EVM',
    node: (
      <span className="custom-brand custom-brand--evm">
        EVM
      </span>
    ),
  },

  {
    title: 'OpenZeppelin',
    node: <SiOpenzeppelin />,
  },

  {
    title: 'MetaMask',
    node: (
      <span className="custom-brand custom-brand--metamask">
        M
      </span>
    ),
  },

  {
    title: 'Chainlink',
    node: <SiChainlink />,
  },

  {
    title: 'Base',
    node: (
      <span className="custom-brand custom-brand--base">
        BASE
      </span>
    ),
  },

  {
    title: 'Arbitrum',
    node: (
      <span className="custom-brand custom-brand--arbitrum">
        A
      </span>
    ),
  },

  {
    title: 'Polygon',
    node: <SiPolygon />,
  },
];

export default LogoLoop;