import React, {
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

import './ScrollExpand.css';

interface ScrollExpandProps {
  src?: string;
  alt?: string;
  title?: string;
  children?: ReactNode;
  scrollHint?: string;

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

const clamp = (
  value: number,
  min: number,
  max: number
) => Math.min(Math.max(value, min), max);

const smoothstep = (
  edge0: number,
  edge1: number,
  value: number
) => {
  const t = clamp(
    (value - edge0) /
      (edge1 - edge0 || 0.0001),
    0,
    1
  );

  return t * t * (3 - 2 * t);
};

export default function ScrollExpand({
  src = '',
  alt = '',
  title = '',
  children,

  scrollHint = 'Scroll to explore',

  startWidth = 48,
  startHeight = 58,

  startRadius = 24,
  endRadius = 0,

  mediaZoom = 1.12,

  /*
   * IMPORTANT
   *
   * 3 = slow cinematic expansion
   * 4 = very slow
   */
  scrollDistance = 3,

  holdDistance = 0.5,

  smoothing = 0.08,

  overlayScrim = 0.25,

  enabled = true,

  className = '',
}: ScrollExpandProps) {
  const containerRef =
    useRef<HTMLDivElement>(null);

  const [progress, setProgress] =
    useState(0);

  /*
   * We calculate the progress ourselves.
   *
   * This avoids the problem you were having
   * with the target reaching the end too quickly.
   */
  useEffect(() => {
    if (!enabled) {
      setProgress(1);
      return;
    }

    let animationFrame = 0;

    let current = 0;
    let target = 0;

    const updateTarget = () => {
      const container =
        containerRef.current;

      if (!container) return;

      const rect =
        container.getBoundingClientRect();

      /*
       * The amount of scrolling available
       * for the actual expansion.
       */
      const scrollDistancePx =
        window.innerHeight *
        scrollDistance;

      /*
       * When the section reaches the top
       * of the viewport, progress starts.
       */
      const scrolled =
        -rect.top;

      target = clamp(
        scrolled / scrollDistancePx,
        0,
        1
      );
    };

    const animate = () => {
      /*
       * Smooth interpolation.
       */
      current +=
        (target - current) *
        (1 - Math.exp(
          -1 /
            (60 * smoothing)
        ));

      if (
        Math.abs(target - current) <
        0.0005
      ) {
        current = target;
      }

      setProgress(current);

      animationFrame =
        requestAnimationFrame(animate);
    };

    const onScroll = () => {
      updateTarget();
    };

    const onResize = () => {
      updateTarget();
    };

    updateTarget();

    window.addEventListener(
      'scroll',
      onScroll,
      { passive: true }
    );

    window.addEventListener(
      'resize',
      onResize
    );

    animationFrame =
      requestAnimationFrame(animate);

    return () => {
      window.removeEventListener(
        'scroll',
        onScroll
      );

      window.removeEventListener(
        'resize',
        onResize
      );

      cancelAnimationFrame(
        animationFrame
      );
    };
  }, [
    enabled,
    scrollDistance,
    smoothing,
  ]);

  /*
   * Smooth expansion curve.
   */
  const expansion =
    smoothstep(
      0,
      1,
      progress
    );

  /*
   * Frame size.
   */
  const width =
    startWidth +
    (100 - startWidth) *
      expansion;

  const height =
    startHeight +
    (100 - startHeight) *
      expansion;

  /*
   * Rounded corners.
   */
  const radius =
    startRadius +
    (endRadius - startRadius) *
      expansion;

  /*
   * Media zoom.
   */
  const mediaScale =
    mediaZoom +
    (1 - mediaZoom) *
      expansion;

  /*
   * Title leaves before the frame
   * becomes completely full screen.
   */
  const titleProgress =
    smoothstep(
      0.12,
      0.55,
      progress
    );

  /*
   * Scroll hint disappears quickly.
   */
  const hintProgress =
    smoothstep(
      0,
      0.12,
      progress
    );

  /*
   * Content only appears once
   * the frame is almost completely open.
   */
  const contentProgress =
    smoothstep(
      0.72,
      0.95,
      progress
    );

  /*
   * Scrim.
   */
  const scrimOpacity =
    overlayScrim *
    (1 - expansion);

  return (
    <section
      ref={containerRef}
      className={`scroll-expand-container ${className}`}
      style={{
        /*
         * THIS IS WHAT CREATES
         * THE LONG SCROLL JOURNEY.
         */
        minHeight: `${
          (1 +
            scrollDistance +
            holdDistance) *
          100
        }vh`,
      }}
    >
      <div className="scroll-expand-stage">

        {/* =================================
            EXPANDING FRAME
        ================================= */}

        <div
          className="scroll-expand-frame"
          style={{
            width: `${width}%`,
            height: `${height}%`,
            borderRadius: `${radius}px`,
          }}
        >
          {src && (
            <img
              src={src}
              alt={alt}
              className="scroll-expand-image"
              style={{
                transform:
                  `scale(${mediaScale})`,
              }}
            />
          )}

          <div
            className="scroll-expand-scrim"
            style={{
              opacity:
                scrimOpacity,
            }}
          />

          {/* CONTENT */}
          {children && (
            <div
              className="scroll-expand-content"
              style={{
                opacity:
                  contentProgress,

                transform:
                  `translateY(${
                    30 *
                    (1 -
                      contentProgress)
                  }px)`,
              }}
            >
              {children}
            </div>
          )}
        </div>

        {/* =================================
            TITLE
        ================================= */}

        {title && (
          <div
            className="scroll-expand-title"
            style={{
              opacity:
                1 -
                titleProgress,

              transform:
                `translate(-50%, -50%) translateY(${
                  -40 *
                  titleProgress
                }px) scale(${
                  1 +
                  0.05 *
                  titleProgress
                })`,
            }}
          >
            {title}
          </div>
        )}

        {/* =================================
            SCROLL HINT
        ================================= */}

        {scrollHint && (
          <div
            className="scroll-expand-hint"
            style={{
              opacity:
                1 -
                hintProgress,

              transform:
                `translateX(-50%) translateY(${
                  10 *
                  hintProgress
                }px)`,
            }}
          >
            <span>
              {scrollHint}
            </span>

            <span className="scroll-expand-arrow">
              ↓
            </span>
          </div>
        )}

      </div>
    </section>
  );
}