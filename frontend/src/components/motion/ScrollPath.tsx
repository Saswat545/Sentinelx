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
 * A squiggle that draws itself as the section scrolls, with the steps beside
 * it revealing in sequence. No pinning: the section keeps its normal height,
 * so scroll position never jumps and nothing below it moves.
 */
export function ScrollPath({ eyebrow, title, intro, steps }: ScrollPathProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 80%', 'end 55%'],
  });
  const draw = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-24 lg:py-32">
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#0149FD]">
            {eyebrow}
          </p>
          <h2 className="mt-4 text-balance text-3xl font-semibold leading-[1.12] tracking-[-0.025em] text-gray-900 sm:text-[40px]">
            {title}
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-gray-600">{intro}</p>
        </div>

        <div ref={sectionRef} className="mt-16 grid gap-12 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-20">
          <div className="relative hidden lg:block">
            <div className="sticky top-32 h-[620px]">
              <svg
                viewBox="0 0 200 620"
                fill="none"
                className="h-full w-full"
                aria-hidden="true"
                preserveAspectRatio="xMidYMin meet"
              >
                <path
                  d="M100 4C100 74 36 96 36 164C36 232 168 250 168 318C168 386 52 404 52 472C52 540 100 552 100 616"
                  stroke="#EDEFF3"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <motion.path
                  d="M100 4C100 74 36 96 36 164C36 232 168 250 168 318C168 386 52 404 52 472C52 540 100 552 100 616"
                  stroke="#0149FD"
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{ pathLength: reducedMotion ? 1 : draw }}
                />
              </svg>
            </div>
          </div>

          <ol className="relative space-y-14 sm:space-y-20">
            {steps.map((step, index) => (
              <motion.li
                key={step.title}
                initial={reducedMotion ? false : { opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="border-l border-gray-200 pl-6 sm:pl-8 lg:border-l-0 lg:pl-0"
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-gray-400">
                  {String(index + 1).padStart(2, '0')} · {step.label}
                </p>
                <h3 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-xl text-[15px] leading-[1.7] text-gray-600">{step.body}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
