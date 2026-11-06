import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Reveal on scroll. One idea, one animation: fade up out of a slight blur.
 * Elements start in their resting state when the visitor prefers reduced motion.
 */
export function Reveal({
  children,
  delay = 0,
  distance = 18,
  className = '',
  as = 'div',
}: {
  children: React.ReactNode;
  delay?: number;
  distance?: number;
  className?: string;
  as?: 'div' | 'li' | 'section';
}) {
  const reduceMotion = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;

  if (reduceMotion) {
    return <MotionTag className={className}>{children}</MotionTag>;
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: distance, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}
