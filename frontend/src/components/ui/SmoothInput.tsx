import {
  useCallback,
  useEffect,
  useRef,
  type ChangeEvent,
  type InputHTMLAttributes,
} from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';

/**
 * Text input whose caret is a spring-driven bar, so it glides to each new
 * position instead of teleporting. The native caret is hidden and replaced by
 * a measured overlay; selection and scroll position stay native.
 */

const IS_FIREFOX =
  typeof navigator !== 'undefined' && /firefox|fxios/i.test(navigator.userAgent);
const PASSWORD_CHAR = IS_FIREFOX ? '\u25CF' : '\u2022';

export type SmoothInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  type?: 'text' | 'email' | 'password' | 'search';
  wrapperClassName?: string;
  invalid?: boolean;
};

export function SmoothInput({
  type = 'text',
  wrapperClassName = '',
  invalid = false,
  className = '',
  value,
  onChange,
  onFocus,
  onBlur,
  onClick,
  onKeyUp,
  onSelect,
  ...props
}: SmoothInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const caretX = useMotionValue(0);
  const caretOpacity = useMotionValue(0);
  const reducedMotion = useReducedMotion();
  const springX = useSpring(
    caretX,
    reducedMotion
      ? { stiffness: 10000, damping: 100, mass: 0.1 }
      : { stiffness: 520, damping: 34, mass: 0.6 },
  );

  const measurePrefix = useCallback((text: string) => {
    const input = inputRef.current;
    const measure = measureRef.current;
    if (!input || !measure) return null;

    const styles = window.getComputedStyle(input);
    measure.style.font = `${styles.fontStyle} ${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`;
    measure.style.letterSpacing = styles.letterSpacing;
    measure.textContent = text;

    const paddingLeft = parseFloat(styles.paddingLeft) || 0;
    return text.length > 0 ? measure.offsetWidth + paddingLeft : paddingLeft - 1;
  }, []);

  const syncCaret = useCallback(() => {
    const input = inputRef.current;
    if (!input || document.activeElement !== input) return;

    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    if (start !== end) {
      caretOpacity.set(0);
      return;
    }

    const prefix =
      input.type === 'password' ? PASSWORD_CHAR.repeat(start) : input.value.slice(0, start);
    const width = measurePrefix(prefix);
    if (width === null) return;

    const styles = window.getComputedStyle(input);
    const paddingLeft = parseFloat(styles.paddingLeft) || 0;
    const paddingRight = parseFloat(styles.paddingRight) || 0;
    const position = width - input.scrollLeft;
    const max = input.clientWidth - paddingRight;

    if (position < paddingLeft - 1 || position > max + 1) {
      caretOpacity.set(0);
      return;
    }

    caretX.set(Math.min(position, max));
    caretOpacity.set(1);
  }, [caretOpacity, caretX, measurePrefix]);

  // Re-measure when the value changes, fonts land, or the field is resized.
  // The synchronous pass matters: rAF is throttled in background tabs and can
  // otherwise leave the caret at its old position.
  useEffect(() => {
    syncCaret();
    const id = requestAnimationFrame(syncCaret);
    return () => cancelAnimationFrame(id);
  }, [value, type, syncCaret]);

  useEffect(() => {
    const input = inputRef.current;
    const root = rootRef.current;
    if (!input || !root) return;

    const onSelectionChange = () => {
      if (document.activeElement === input) requestAnimationFrame(syncCaret);
    };

    document.addEventListener('selectionchange', onSelectionChange);
    document.fonts?.addEventListener('loadingdone', syncCaret);
    input.addEventListener('scroll', syncCaret);

    const observer = new ResizeObserver(syncCaret);
    observer.observe(root);

    return () => {
      document.removeEventListener('selectionchange', onSelectionChange);
      document.fonts?.removeEventListener('loadingdone', syncCaret);
      input.removeEventListener('scroll', syncCaret);
      observer.disconnect();
    };
  }, [syncCaret]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    syncCaret();
    requestAnimationFrame(syncCaret);
  };

  return (
    <div ref={rootRef} className={`relative ${wrapperClassName}`}>
      <input
        {...props}
        ref={inputRef}
        type={type}
        value={value}
        onChange={handleChange}
        onFocus={(event) => {
          onFocus?.(event);
          syncCaret();
          requestAnimationFrame(syncCaret);
        }}
        onBlur={(event) => {
          caretOpacity.set(0);
          onBlur?.(event);
        }}
        onClick={(event) => {
          onClick?.(event);
          requestAnimationFrame(syncCaret);
        }}
        onKeyUp={(event) => {
          onKeyUp?.(event);
          requestAnimationFrame(syncCaret);
        }}
        onSelect={(event) => {
          onSelect?.(event);
          requestAnimationFrame(syncCaret);
        }}
        aria-invalid={invalid || undefined}
        className={`w-full bg-transparent outline-none ${className}`}
        style={{ caretColor: 'transparent' }}
      />

      <span
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none invisible absolute left-0 top-0 whitespace-pre"
      />

      <motion.span
        aria-hidden="true"
        // left-0 matters: without it the span keeps its static inline position
        // (after the full-width input) and the caret renders at the far edge.
        className="pointer-events-none absolute left-0 top-1/2 h-[1.15em] w-[1.5px] -translate-y-1/2 rounded-full bg-[#0149FD]"
        style={{ x: springX, opacity: caretOpacity }}
      />
    </div>
  );
}
