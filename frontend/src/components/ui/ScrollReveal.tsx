import { useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ScrollReveal.css';

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: string;
  scrollContainerRef?: React.RefObject<HTMLElement | null>;

  enableBlur?: boolean;

  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;

  containerClassName?: string;
  textClassName?: string;

  rotationEnd?: string;
  wordAnimationEnd?: string;
}

const ScrollReveal = ({
  children,
  scrollContainerRef,

  enableBlur = true,

  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,

  containerClassName = '',
  textClassName = '',

  /*
   * Increased animation distance.
   * The reveal will now take longer while scrolling.
   */
  rotationEnd = 'bottom 35%',
  wordAnimationEnd = 'bottom 35%',

}: ScrollRevealProps) => {

  const containerRef =
    useRef<HTMLHeadingElement>(null);

  const splitText = useMemo(() => {

    const text =
      typeof children === 'string'
        ? children
        : '';

    return text
      .split(/(\s+)/)
      .map((word, index) => {

        if (word.match(/^\s+$/)) {
          return word;
        }

        return (
          <span
            className="word"
            key={index}
          >
            {word}
          </span>
        );
      });

  }, [children]);

  useEffect(() => {

    const el = containerRef.current;

    if (!el) return;

    const scroller =
      scrollContainerRef?.current ?? window;

    /*
     * ROTATION
     */

    gsap.fromTo(
      el,

      {
        transformOrigin: '0% 50%',
        rotate: baseRotation,
      },

      {
        ease: 'none',

        rotate: 0,

        scrollTrigger: {
          trigger: el,

          scroller,

          /*
           * Start earlier
           */
          start: 'top bottom',

          /*
           * Finish later
           */
          end: rotationEnd,

          /*
           * Smoothly follows the scroll
           */
          scrub: true,
        },
      }
    );


    const wordElements =
      el.querySelectorAll('.word');


    /*
     * WORD OPACITY REVEAL
     */

    gsap.fromTo(
      wordElements,

      {
        opacity: baseOpacity,

        willChange: 'opacity',
      },

      {
        ease: 'none',

        opacity: 1,

        /*
         * Slightly slower word separation
         */
        stagger: 0.08,

        scrollTrigger: {
          trigger: el,

          scroller,

          /*
           * Start when the text is entering
           * the viewport.
           */
          start: 'top bottom-=10%',

          /*
           * Finish much later.
           */
          end: wordAnimationEnd,

          /*
           * Animation follows scroll position.
           */
          scrub: true,
        },
      }
    );


    /*
     * BLUR REVEAL
     */

    if (enableBlur) {

      gsap.fromTo(
        wordElements,

        {
          filter: `blur(${blurStrength}px)`,
        },

        {
          ease: 'none',

          filter: 'blur(0px)',

          stagger: 0.08,

          scrollTrigger: {
            trigger: el,

            scroller,

            start: 'top bottom-=10%',

            end: wordAnimationEnd,

            scrub: true,
          },
        }
      );

    }


    /*
     * CLEANUP
     */

    return () => {

      ScrollTrigger
        .getAll()
        .forEach(trigger => {
          trigger.kill();
        });

    };

  }, [
    scrollContainerRef,
    enableBlur,
    baseRotation,
    baseOpacity,
    rotationEnd,
    wordAnimationEnd,
    blurStrength,
  ]);


  return (
    <h2
      ref={containerRef}
      className={`scroll-reveal ${containerClassName}`}
    >

      <p
        className={`scroll-reveal-text ${textClassName}`}
      >
        {splitText}
      </p>

    </h2>
  );
};

export default ScrollReveal;