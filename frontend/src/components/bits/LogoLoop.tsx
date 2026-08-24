import { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react';
import './LogoLoop.css';

const ANIMATION_CONFIG = { SMOOTH_TAU: 0.25, MIN_COPIES: 2, COPY_HEADROOM: 2 };

interface LogoItem {
  node?: React.ReactNode;
  src?: string;
  alt?: string;
  title?: string;
  href?: string;
  ariaLabel?: string;
  width?: number;
  height?: number;
  srcSet?: string;
  sizes?: string;
}

interface LogoLoopProps {
  logos: LogoItem[];
  speed?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  width?: string | number;
  logoHeight?: number;
  gap?: number;
  hoverSpeed?: number;
  pauseOnHover?: boolean;
  fadeOut?: boolean;
  fadeOutColor?: string;
  scaleOnHover?: boolean;
  renderItem?: (item: LogoItem, key: React.Key) => React.ReactNode;
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const LogoLoop = memo(function LogoLoop({
  logos,
  speed = 120,
  direction = 'left',
  width = '100%',
  logoHeight = 28,
  gap = 32,
  pauseOnHover,
  hoverSpeed,
  fadeOut = false,
  fadeOutColor,
  scaleOnHover = false,
  renderItem,
  ariaLabel = 'Partner logos',
  className,
  style,
}: LogoLoopProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const seqRef = useRef<HTMLUListElement>(null);

  const [seqWidth, setSeqWidth] = useState(0);
  const [copyCount, setCopyCount] = useState(ANIMATION_CONFIG.MIN_COPIES);
  const [isHovered, setIsHovered] = useState(false);

  const effectiveHoverSpeed = useMemo(() => {
    if (hoverSpeed !== undefined) return hoverSpeed;
    if (pauseOnHover === true) return 0;
    return 0;
  }, [hoverSpeed, pauseOnHover]);

  const isVertical = direction === 'up' || direction === 'down';

  const targetVelocity = useMemo(() => {
    const magnitude = Math.abs(speed);
    const directionMultiplier = isVertical ? (direction === 'up' ? 1 : -1) : (direction === 'left' ? 1 : -1);
    const speedMultiplier = speed < 0 ? -1 : 1;
    return magnitude * directionMultiplier * speedMultiplier;
  }, [speed, direction, isVertical]);

  const updateDimensions = useCallback(() => {
    const containerWidth = containerRef.current?.clientWidth ?? 0;
    const sequenceRect = seqRef.current?.getBoundingClientRect?.();
    const sequenceWidth = sequenceRect?.width ?? 0;
    if (sequenceWidth > 0) {
      setSeqWidth(Math.ceil(sequenceWidth));
      const copiesNeeded = Math.ceil(containerWidth / sequenceWidth) + ANIMATION_CONFIG.COPY_HEADROOM;
      setCopyCount(Math.max(ANIMATION_CONFIG.MIN_COPIES, copiesNeeded));
    }
  }, []);

  useEffect(() => {
    const ro = new ResizeObserver(updateDimensions);
    if (containerRef.current) ro.observe(containerRef.current);
    if (seqRef.current) ro.observe(seqRef.current);
    updateDimensions();
    return () => ro.disconnect();
  }, [updateDimensions, logos, gap, logoHeight]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const seqSize = seqWidth;
    let raf = 0;
    let offset = 0;
    let velocity = 0;
    let lastTimestamp: number | null = null;

    const animate = (timestamp: number) => {
      if (lastTimestamp === null) lastTimestamp = timestamp;
      const dt = Math.max(0, timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      const target = isHovered && effectiveHoverSpeed !== undefined ? effectiveHoverSpeed : targetVelocity;
      velocity += (target - velocity) * (1 - Math.exp(-dt / ANIMATION_CONFIG.SMOOTH_TAU));

      if (seqSize > 0) {
        offset = ((offset + velocity * dt) % seqSize + seqSize) % seqSize;
        track.style.transform = `translate3d(${-offset}px, 0, 0)`;
      }
      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [targetVelocity, seqWidth, isHovered, effectiveHoverSpeed]);

  const renderLogoItem = useCallback(
    (item: LogoItem, key: React.Key) => {
      if (renderItem) return <li className="logoloop__item" key={key}>{renderItem(item, key)}</li>;
      const isNodeItem = 'node' in item && item.node;
      const content = isNodeItem ? (
        <span className="logoloop__node" aria-hidden={!!item.href}>{item.node}</span>
      ) : item.src ? (
        <img src={item.src} alt={item.alt ?? ''} title={item.title} width={item.width} height={item.height} loading="lazy" decoding="async" draggable={false} />
      ) : null;
      const itemContent = item.href ? (
        <a className="logoloop__link" href={item.href} aria-label={item.ariaLabel || item.title || ''} target="_blank" rel="noreferrer noopener">{content}</a>
      ) : content;
      return <li className="logoloop__item" key={key}>{itemContent}</li>;
    },
    [renderItem],
  );

  const logoLists = useMemo(
    () =>
      Array.from({ length: copyCount }, (_, ci) => (
        <ul className="logoloop__list" key={`copy-${ci}`} ref={ci === 0 ? seqRef : undefined} aria-hidden={ci > 0 ? true : undefined}>
          {logos.map((item, ii) => renderLogoItem(item, `${ci}-${ii}`))}
        </ul>
      )),
    [copyCount, logos, renderLogoItem],
  );

  const rootClassName = useMemo(
    () => ['logoloop', isVertical ? 'logoloop--vertical' : 'logoloop--horizontal', fadeOut && 'logoloop--fade', className].filter(Boolean).join(' '),
    [isVertical, fadeOut, className],
  );

  return (
    <div ref={containerRef} className={rootClassName} style={{ width: typeof width === 'number' ? `${width}px` : width, '--logoloop-gap': `${gap}px`, '--logoloop-logoHeight': `${logoHeight}px`, ...(fadeOutColor && { '--logoloop-fadeColor': fadeOutColor }), ...style } as React.CSSProperties} role="region" aria-label={ariaLabel}>
      <div className="logoloop__track" ref={trackRef} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        {logoLists}
      </div>
    </div>
  );
});

export default LogoLoop;
