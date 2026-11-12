import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

export type PathStep = {
  label: string;
  title: string;
  body: string;
};

type ScrollPathProps = {
  eyebrow: string;
  title: string;
  intro: string;
  steps: PathStep[];
};

/**
 * The steps sit on a single rail: one line is always visible, a second is drawn
 * as the section scrolls, and each node is positioned inside its own list item.
 * Because the node belongs to the step, the guide cannot drift away from the
 * heading it is meant to mark, which the old fixed-height squiggle did.
 */
export function ScrollPath({ eyebrow, title, intro, steps }: ScrollPathProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ['start 75%', 'end 65%'],
  });
  const draw = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-24 lg:py-32">
        <div className="max-w-2xl">
          <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[#0149FD]">
            {eyebrow}
          </p>
          <h2 className="mt-4 text-balance text-[28px] font-semibold leading-[1.12] tracking-[-0.025em] text-gray-900 sm:text-[34px]">
            {title}
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-gray-600">{intro}</p>
        </div>

        <div ref={listRef} className="relative mt-14">
          <span aria-hidden="true" className="absolute inset-y-0 left-0 w-px bg-gray-200" />
          <motion.span
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-px origin-top bg-[#0149FD]"
            style={{ scaleY: reducedMotion ? 1 : draw }}
          />

          <ol className="space-y-14 sm:space-y-20">
            {steps.map((step, index) => (
              <motion.li
                key={step.title}
                initial={reducedMotion ? false : { opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="relative pl-6 sm:pl-8"
              >
                <span
                  aria-hidden="true"
                  className="absolute -left-[5px] top-[7px] h-[10px] w-[10px] rounded-full border-2 border-white bg-[#0149FD]"
                />
                <p className="font-mono text-[12px] font-medium uppercase tracking-[0.16em] text-gray-500">
                  {String(index + 1).padStart(2, '0')} · {step.label}
                </p>
                <h3 className="mt-3 text-[20px] font-semibold tracking-[-0.02em] text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-xl text-[16px] leading-[1.7] text-gray-600">{step.body}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
