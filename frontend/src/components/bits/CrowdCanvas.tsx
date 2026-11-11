import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * A crowd of figures walking along the bottom of a panel.
 *
 * The original effect ships a photographed sprite sheet. We draw the sprites
 * instead: 15 columns x 7 rows of minimal figures, so the file stays original,
 * on brand, and has no external asset to load or 404.
 */

const FRAMES = 15;
const ROWS = 7;
const PEEP_W = 26;
const PEEP_H = 36;

const TINTS = ['#243040', '#2C3949', '#344354', '#3D4E61', '#46596E', '#4F6479', '#586E85'];
const ACCENT = '#3E6BFF';

function drawPeep(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tint: string,
  phase: number,
  scale: number,
) {
  const swing = Math.sin(phase);
  const bob = Math.cos(phase * 2) * 0.6;

  ctx.save();
  ctx.translate(x + PEEP_W / 2, y + bob);
  ctx.scale(scale, scale);
  ctx.fillStyle = tint;

  // legs
  const legLen = 9;
  ctx.fillRect(-3.2 + swing * 1.4, 2, 2.1, legLen - Math.abs(swing) * 1.2);
  ctx.fillRect(1.1 - swing * 1.4, 2, 2.1, legLen - Math.abs(swing) * 1.2);

  // torso
  ctx.beginPath();
  ctx.roundRect(-4.4, -7.5, 8.8, 10.5, 3);
  ctx.fill();

  // head
  ctx.beginPath();
  ctx.arc(0, -11.4, 3.7, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function buildSpriteSheet(): HTMLCanvasElement {
  const sheet = document.createElement('canvas');
  sheet.width = FRAMES * PEEP_W;
  sheet.height = ROWS * PEEP_H;

  const ctx = sheet.getContext('2d');
  if (!ctx) return sheet;

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < FRAMES; col += 1) {
      const phase = (col / FRAMES) * Math.PI * 2;
      const isAccent = col === FRAMES - 1 && row % 3 === 1;
      const scale = 0.82 + row * 0.035;
      drawPeep(
        ctx,
        col * PEEP_W,
        row * PEEP_H,
        isAccent ? ACCENT : TINTS[row % TINTS.length],
        phase,
        scale,
      );
    }
  }

  return sheet;
}

type Peep = {
  image: HTMLImageElement;
  rect: [number, number, number, number];
  width: number;
  height: number;
  x: number;
  y: number;
  anchorY: number;
  scaleX: number;
  walk: gsap.core.Timeline | null;
};

const randomRange = (min: number, max: number) => min + Math.random() * (max - min);
const randomIndex = (length: number) => Math.floor(Math.random() * length);

export type CrowdCanvasProps = {
  /** 0-1 tint strength of the whole layer. */
  opacity?: number;
  /** How tall the walking strip is, in viewport height units. */
  stripHeight?: string;
};

export function CrowdCanvas({ opacity = 1, stripHeight = '46vh' }: CrowdCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const image = new Image();
    const stage = { width: 0, height: 0 };
    const allPeeps: Peep[] = [];
    const available: Peep[] = [];
    const crowd: Peep[] = [];
    let disposed = false;

    const createPeeps = () => {
      const rectWidth = image.naturalWidth / FRAMES;
      const rectHeight = image.naturalHeight / ROWS;

      for (let i = 0; i < FRAMES * ROWS; i += 1) {
        const col = i % FRAMES;
        const row = Math.floor(i / FRAMES);
        const peep: Peep = {
          image,
          rect: [col * rectWidth, row * rectHeight, rectWidth, rectHeight],
          width: rectWidth,
          height: rectHeight,
          x: 0,
          y: 0,
          anchorY: 0,
          scaleX: 1,
          walk: null,
        };
        allPeeps.push(peep);
      }
    };

    const render = () => {
      if (disposed) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(devicePixelRatio || 1, devicePixelRatio || 1);
      crowd.forEach((peep) => {
        ctx.save();
        ctx.translate(peep.x, peep.y);
        ctx.scale(peep.scaleX, 1);
        ctx.drawImage(
          peep.image,
          peep.rect[0],
          peep.rect[1],
          peep.rect[2],
          peep.rect[3],
          0,
          0,
          peep.width,
          peep.height,
        );
        ctx.restore();
      });
      ctx.restore();
    };

    const addPeep = () => {
      if (!available.length || disposed) return;
      const peep = available.splice(randomIndex(available.length), 1)[0];

      const direction = Math.random() > 0.5 ? 1 : -1;
      const offsetY = 100 - 250 * gsap.parseEase('power2.in')(Math.random());
      const startY = stage.height - peep.height + offsetY;
      const startX = direction === 1 ? -peep.width : stage.width + peep.width;
      const endX = direction === 1 ? stage.width : -peep.width;

      peep.scaleX = direction;
      peep.x = startX;
      peep.y = startY;
      peep.anchorY = startY;

      const xDuration = randomRange(9, 15);
      const tl = gsap.timeline({
        onComplete: () => {
          if (disposed) return;
          const index = crowd.indexOf(peep);
          if (index >= 0) crowd.splice(index, 1);
          available.push(peep);
          addPeep();
        },
      });
      tl.timeScale(randomRange(0.55, 1.25));
      tl.to(peep, { duration: xDuration, x: endX, ease: 'none' }, 0);
      tl.to(peep, { duration: 0.26, repeat: xDuration / 0.26, yoyo: true, y: startY - 6 }, 0);

      peep.walk = tl;
      crowd.push(peep);
      crowd.sort((a, b) => a.anchorY - b.anchorY);
    };

    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height) return;

      stage.width = width;
      stage.height = height;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;

      crowd.forEach((peep) => peep.walk?.kill());
      crowd.length = 0;
      available.length = 0;
      available.push(...allPeeps);
      available.forEach(() => addPeep());
    };

    const start = () => {
      if (disposed) return;
      createPeeps();
      resize();
      gsap.ticker.add(render);
    };

    image.onload = start;
    image.src = buildSpriteSheet().toDataURL('image/png');

    const observer = new ResizeObserver(() => resize());
    observer.observe(canvas);

    return () => {
      disposed = true;
      observer.disconnect();
      image.onload = null;
      gsap.ticker.remove(render);
      crowd.forEach((peep) => peep.walk?.kill());
      crowd.length = 0;
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden"
      style={{ height: stripHeight, opacity }}
    >
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#05070C] to-transparent" />
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
