import { useRef, useEffect, useState } from 'react';
import { Renderer, Program, Triangle, Mesh } from 'ogl';
import './LightRays.css';

const DEFAULT_COLOR = '#ffffff';

const hexToRgb = (hex: string) => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255] : [1, 1, 1];
};

type RaysOrigin = 'top-center' | 'top-left' | 'top-right' | 'right' | 'left' | 'bottom-center' | 'bottom-right' | 'bottom-left';

const getAnchorAndDir = (origin: RaysOrigin, w: number, h: number) => {
  const outside = 0.2;
  switch (origin) {
    case 'top-left': return { anchor: [0, -outside * h], dir: [0, 1] };
    case 'top-right': return { anchor: [w, -outside * h], dir: [0, 1] };
    case 'left': return { anchor: [-outside * w, 0.5 * h], dir: [1, 0] };
    case 'right': return { anchor: [(1 + outside) * w, 0.5 * h], dir: [-1, 0] };
    case 'bottom-left': return { anchor: [0, (1 + outside) * h], dir: [0, -1] };
    case 'bottom-center': return { anchor: [0.5 * w, (1 + outside) * h], dir: [0, -1] };
    case 'bottom-right': return { anchor: [w, (1 + outside) * h], dir: [0, -1] };
    default: return { anchor: [0.5 * w, -outside * h], dir: [0, 1] };
  }
};

interface LightRaysProps {
  raysOrigin?: RaysOrigin;
  raysColor?: string;
  raysSpeed?: number;
  lightSpread?: number;
  rayLength?: number;
  pulsating?: boolean;
  fadeDistance?: number;
  saturation?: number;
  followMouse?: boolean;
  mouseInfluence?: number;
  noiseAmount?: number;
  distortion?: number;
  className?: string;
}

export default function LightRays({
  raysOrigin = 'top-center',
  raysColor = DEFAULT_COLOR,
  raysSpeed = 1,
  lightSpread = 1,
  rayLength = 2,
  pulsating = false,
  fadeDistance = 1.0,
  saturation = 1.0,
  followMouse = true,
  mouseInfluence = 0.1,
  noiseAmount = 0.0,
  distortion = 0.0,
  className = '',
}: LightRaysProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const uniformsRef = useRef<Record<string, any>>(null);
  const rendererRef = useRef<Renderer>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const smoothMouseRef = useRef({ x: 0.5, y: 0.5 });
  const animationIdRef = useRef<number>(null);
  const meshRef = useRef<Mesh>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;
    if (cleanupRef.current) { cleanupRef.current(); cleanupRef.current = null; }

    const init = async () => {
      if (!containerRef.current) return;
      await new Promise(r => setTimeout(r, 10));
      if (!containerRef.current) return;

      const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 2), alpha: true });
      rendererRef.current = renderer;
      const gl = renderer.gl;
      gl.canvas.style.width = '100%';
      gl.canvas.style.height = '100%';
      while (containerRef.current.firstChild) containerRef.current.removeChild(containerRef.current.firstChild);
      containerRef.current.appendChild(gl.canvas);

      const vert = `attribute vec2 position;varying vec2 vUv;void main(){vUv=position*0.5+0.5;gl_Position=vec4(position,0.0,1.0);}`;
      const frag = `precision highp float;
uniform float iTime;uniform vec2 iResolution;uniform vec2 rayPos;uniform vec2 rayDir;
uniform vec3 raysColor;uniform float raysSpeed;uniform float lightSpread;uniform float rayLength;
uniform float pulsating;uniform float fadeDistance;uniform float saturation;
uniform vec2 mousePos;uniform float mouseInfluence;uniform float noiseAmount;uniform float distortion;
varying vec2 vUv;
float noise(vec2 st){return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);}
float rayStrength(vec2 raySource,vec2 rayRefDirection,vec2 coord,float seedA,float seedB,float speed){
  vec2 s2c=coord-raySource;vec2 dn=normalize(s2c);float ca=dot(dn,rayRefDirection);
  float da=ca+distortion*sin(iTime*2.0+length(s2c)*0.01)*0.2;
  float sf=pow(max(da,0.0),1.0/max(lightSpread,0.001));
  float dist=length(s2c);float md=iResolution.x*rayLength;
  float lf=clamp((md-dist)/md,0.0,1.0);
  float ff=clamp((iResolution.x*fadeDistance-dist)/(iResolution.x*fadeDistance),0.5,1.0);
  float pu=pulsating>0.5?(0.8+0.2*sin(iTime*speed*3.0)):1.0;
  float bs=clamp((0.45+0.15*sin(da*seedA+iTime*speed))+(0.3+0.2*cos(-da*seedB+iTime*speed)),0.0,1.0);
  return bs*lf*ff*sf*pu;
}
void mainImage(out vec4 fc,in vec2 fc2){vec2 c=vec2(fc2.x,iResolution.y-fc2.y);vec2 frd=rayDir;
if(mouseInfluence>0.0){vec2 msp=mousePos*iResolution.xy;vec2 md=normalize(msp-rayPos);frd=normalize(mix(rayDir,md,mouseInfluence));}
vec4 r1=vec4(1.0)*rayStrength(rayPos,frd,c,36.2214,21.11349,1.5*raysSpeed);
vec4 r2=vec4(1.0)*rayStrength(rayPos,frd,c,22.3991,18.0234,1.1*raysSpeed);
fc=r1*0.5+r2*0.4;
if(noiseAmount>0.0){float n=noise(c*0.01+iTime*0.1);fc.rgb*=(1.0-noiseAmount+noiseAmount*n);}
float br=1.0-(c.y/iResolution.y);fc.x*=0.1+br*0.8;fc.y*=0.3+br*0.6;fc.z*=0.5+br*0.5;
if(saturation!=1.0){float g=dot(fc.rgb,vec3(0.299,0.587,0.114));fc.rgb=mix(vec3(g),fc.rgb,saturation);}
fc.rgb*=raysColor;}
void main(){vec4 c;mainImage(c,gl_FragCoord.xy);gl_FragColor=c;}`;

      const uniforms = {
        iTime: { value: 0 }, iResolution: { value: [1, 1] },
        rayPos: { value: [0, 0] }, rayDir: { value: [0, 1] },
        raysColor: { value: hexToRgb(raysColor) }, raysSpeed: { value: raysSpeed },
        lightSpread: { value: lightSpread }, rayLength: { value: rayLength },
        pulsating: { value: pulsating ? 1.0 : 0.0 }, fadeDistance: { value: fadeDistance },
        saturation: { value: saturation }, mousePos: { value: [0.5, 0.5] },
        mouseInfluence: { value: mouseInfluence }, noiseAmount: { value: noiseAmount },
        distortion: { value: distortion },
      };
      uniformsRef.current = uniforms;

      const geometry = new Triangle(gl);
      const program = new Program(gl, { vertex: vert, fragment: frag, uniforms });
      const mesh = new Mesh(gl, { geometry, program });
      meshRef.current = mesh;

      const updatePlacement = () => {
        if (!containerRef.current || !renderer) return;
        renderer.dpr = Math.min(window.devicePixelRatio, 2);
        const { clientWidth: wCSS, clientHeight: hCSS } = containerRef.current;
        renderer.setSize(wCSS, hCSS);
        const dpr = renderer.dpr;
        const w = wCSS * dpr, h = hCSS * dpr;
        uniforms.iResolution.value = [w, h];
        const { anchor, dir } = getAnchorAndDir(raysOrigin, w, h);
        uniforms.rayPos.value = anchor;
        uniforms.rayDir.value = dir;
      };

      const loop = (t: number) => {
        if (!rendererRef.current || !uniformsRef.current || !meshRef.current) return;
        uniforms.iTime.value = t * 0.001;
        if (followMouse && mouseInfluence > 0.0) {
          smoothMouseRef.current.x = smoothMouseRef.current.x * 0.92 + mouseRef.current.x * 0.08;
          smoothMouseRef.current.y = smoothMouseRef.current.y * 0.92 + mouseRef.current.y * 0.08;
          uniforms.mousePos.value = [smoothMouseRef.current.x, smoothMouseRef.current.y];
        }
        try { renderer.render({ scene: mesh }); animationIdRef.current = requestAnimationFrame(loop); }
        catch { return; }
      };

      window.addEventListener('resize', updatePlacement);
      updatePlacement();
      animationIdRef.current = requestAnimationFrame(loop);

      cleanupRef.current = () => {
        if (animationIdRef.current) { cancelAnimationFrame(animationIdRef.current); animationIdRef.current = null; }
        window.removeEventListener('resize', updatePlacement);
        try { gl.getExtension('WEBGL_lose_context')?.loseContext(); const cv = gl.canvas as HTMLCanvasElement; cv?.parentNode?.removeChild(cv); } catch {}
        rendererRef.current = null; uniformsRef.current = null; meshRef.current = null;
      };
    };

    init().catch(() => {});
    return () => { if (cleanupRef.current) { cleanupRef.current(); cleanupRef.current = null; } };
  }, [isVisible, raysOrigin, raysColor, raysSpeed, lightSpread, rayLength, pulsating, fadeDistance, saturation, followMouse, mouseInfluence, noiseAmount, distortion]);

  useEffect(() => {
    if (!uniformsRef.current || !containerRef.current || !rendererRef.current) return;
    const u = uniformsRef.current, r = rendererRef.current;
    u.raysColor.value = hexToRgb(raysColor); u.raysSpeed.value = raysSpeed;
    u.lightSpread.value = lightSpread; u.rayLength.value = rayLength;
    u.pulsating.value = pulsating ? 1.0 : 0.0; u.fadeDistance.value = fadeDistance;
    u.saturation.value = saturation; u.mouseInfluence.value = mouseInfluence;
    u.noiseAmount.value = noiseAmount; u.distortion.value = distortion;
    const { clientWidth: wCSS, clientHeight: hCSS } = containerRef.current;
    const dpr = r.dpr;
    const { anchor, dir } = getAnchorAndDir(raysOrigin, wCSS * dpr, hCSS * dpr);
    u.rayPos.value = anchor; u.rayDir.value = dir;
  }, [raysColor, raysSpeed, lightSpread, raysOrigin, rayLength, pulsating, fadeDistance, saturation, mouseInfluence, noiseAmount, distortion]);

  useEffect(() => {
    if (!followMouse) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !rendererRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current = { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [followMouse]);

  return <div ref={containerRef} className={`light-rays-container ${className}`.trim()} />;
}
