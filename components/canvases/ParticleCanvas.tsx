"use client";

import { useEffect, useRef } from "react";

type Orbit = {
  name: string;
  r: number;
  tilt: number;
  angle: number;
  speed: number;
  trail: { x: number; y: number; a: number }[];
};

const TECHS = [
  "React",
  "Next.js",
  "Svelte",
  "TypeScript",
  "Supabase",
  "n8n",
  "Node.js",
  "Tailwind",
  "Python",
  "LangChain",
  "OpenAI",
  "Framer Motion",
];

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W: number,
      H: number,
      t = 0;

    // Cached gradient objects — rebuilt only on resize
    let outerGlowGrad: RadialGradient | null = null;
    let diskGrad: CanvasGradient | null = null;
    // Pre-built offscreen canvas for the accretion disk (rebuilt on resize)
    let diskCanvas: HTMLCanvasElement | null = null;
    let diskCtx: CanvasRenderingContext2D | null = null;

    function resize() {
      W = c!.width = c!.offsetWidth * dpr;
      H = c!.height = c!.offsetHeight * dpr;
      buildCachedGrads();
    }

    function buildCachedGrads() {
      const cx = W / 2,
        cy = H / 2;
      const core = 16 * dpr;
      const disk = 46 * dpr;

      outerGlowGrad = ctx!.createRadialGradient(
        cx,
        cy,
        core * 0.5,
        cx,
        cy,
        disk * 2.4,
      );
      outerGlowGrad.addColorStop(0, "rgba(225,235,255,0.16)");
      outerGlowGrad.addColorStop(0.3, "rgba(190,210,255,0.06)");
      outerGlowGrad.addColorStop(1, "rgba(190,210,255,0)");

      // Pre-render the static parts of the accretion disk to an offscreen canvas
      // We'll just spin this with a transform instead of redrawing 56 gradients/frame
      const size = Math.round(disk * 2.8);
      diskCanvas = document.createElement("canvas");
      diskCanvas.width = size * 2;
      diskCanvas.height = size * 2;
      diskCtx = diskCanvas.getContext("2d");
      if (!diskCtx) return;
      const dc = diskCtx;
      const ox = size,
        oy = size;

      const tilt = 0.34;
      for (let pass = 0; pass < 2; pass++) {
        const startA = pass === 0 ? Math.PI : 0;
        const endA = pass === 0 ? Math.PI * 2 : Math.PI;
        const segs = 36; // reduced from 56 — imperceptible difference
        for (let i = 0; i < segs; i++) {
          const a0 = startA + ((endA - startA) * i) / segs;
          const a1 = startA + ((endA - startA) * (i + 1)) / segs;
          const am = (a0 + a1) / 2;
          const rr0 = core * 1.12,
            rr1 = disk;
          const x0 = Math.cos(a0) * rr0,
            y0 = Math.sin(a0) * rr0 * tilt;
          const x1 = Math.cos(a1) * rr1,
            y1 = Math.sin(a1) * rr1 * tilt;
          const x2 = Math.cos(a0) * rr1,
            y2 = Math.sin(a0) * rr1 * tilt;
          const brightness =
            0.25 +
            0.75 * Math.max(0, Math.sin(am - Math.PI / 2) * -1 + 1) * 0.5;
          const lightness = 82 + brightness * 14;
          const sat = 25 - brightness * 15;
          const alpha =
            pass === 0 ? 0.1 + brightness * 0.14 : 0.2 + brightness * 0.55;
          const grad = dc.createLinearGradient(
            ox + x0,
            oy + y0,
            ox + x1,
            oy + y1,
          );
          grad.addColorStop(0, `hsla(210,${sat}%,${lightness}%,${alpha})`);
          grad.addColorStop(1, `hsla(210,${sat}%,${lightness}%,0)`);
          dc.beginPath();
          dc.moveTo(ox + x0, oy + y0);
          dc.lineTo(ox + x1, oy + y1);
          dc.lineTo(ox + x2, oy + y2);
          dc.closePath();
          dc.fillStyle = grad;
          dc.fill();
        }
        if (pass === 0) {
          dc.beginPath();
          dc.arc(ox, oy, core, 0, Math.PI * 2);
          dc.fillStyle = "#000";
          dc.fill();
        }
      }
    }

    resize();
    window.addEventListener("resize", resize);

    // Sparse starfield
    const stars = Array.from({ length: 50 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.4 + Math.random() * 1.0,
      phase: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 1.2,
    }));

    const orbits: Orbit[] = TECHS.map((name, i) => {
      const tier = i < 4 ? 0 : i < 8 ? 1 : 2;
      const baseR = [120, 175, 230][tier];
      return {
        name,
        r: baseR + (i % 4) * 11,
        tilt: [0.3, 0.4, 0.24][tier],
        angle: (i / TECHS.length) * Math.PI * 2,
        speed: (0.0035 + Math.random() * 0.0025) * (i % 2 === 0 ? 1 : -1),
        trail: [],
      };
    });

    const redNodes = new Set([8, 9, 10]);

    function drawStars() {
      // Batch all stars in one fill per alpha group — approximate by drawing all at once
      stars.forEach((s) => {
        const twinkle =
          0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 18 * s.speed + s.phase));
        ctx!.globalAlpha = twinkle * 0.5;
        ctx!.beginPath();
        ctx!.arc(s.x * W, s.y * H, s.r * dpr, 0, Math.PI * 2);
        ctx!.fill();
      });
      ctx!.globalAlpha = 1;
    }

    function drawBlackHole() {
      const cx = W / 2,
        cy = H / 2;
      const core = 16 * dpr;
      const disk = 46 * dpr;
      const spin = t * 0.6;

      // Outer glow — cached gradient, no per-frame creation
      if (outerGlowGrad) {
        ctx!.beginPath();
        ctx!.fillStyle = outerGlowGrad;
        ctx!.arc(cx, cy, disk * 2.4, 0, Math.PI * 2);
        ctx!.fill();
      }

      // Draw pre-rendered disk rotated via transform
      if (diskCanvas) {
        const size = diskCanvas.width / 2;
        ctx!.save();
        ctx!.translate(cx, cy);
        ctx!.rotate(spin);
        ctx!.drawImage(diskCanvas, -size, -size);
        ctx!.restore();
      }

      // Front core cover (always on top of disk)
      ctx!.save();
      ctx!.translate(cx, cy);
      ctx!.beginPath();
      ctx!.arc(0, 0, core, 0, Math.PI * 2);
      ctx!.fillStyle = "#000";
      ctx!.fill();

      const pulse = 0.82 + 0.18 * Math.sin(t * 4.2);
      ctx!.beginPath();
      ctx!.arc(0, 0, core * 1.03, 0, Math.PI * 2);
      ctx!.strokeStyle = `rgba(255,255,255,${0.85 * pulse})`;
      ctx!.lineWidth = 1 * dpr;
      ctx!.shadowColor = "rgba(255,255,255,0.8)";
      ctx!.shadowBlur = (5 + 3 * pulse) * dpr;
      ctx!.stroke();
      ctx!.shadowBlur = 0;

      ctx!.beginPath();
      ctx!.arc(0, 0, core * 1.18, 0, Math.PI * 2);
      ctx!.strokeStyle = "rgba(220,235,255,0.18)";
      ctx!.lineWidth = 0.6 * dpr;
      ctx!.stroke();
      ctx!.restore();
    }

    function drawOrbitRings() {
      // Batch all orbit rings into one path
      ctx!.beginPath();
      orbits.forEach((o) => {
        for (let i = 0; i <= 80; i++) {
          // reduced from 120
          const a = (i / 80) * Math.PI * 2;
          const x = W / 2 + Math.cos(a) * o.r * dpr;
          const y = H / 2 + Math.sin(a) * o.r * o.tilt * dpr;
          i === 0 ? ctx!.moveTo(x, y) : ctx!.lineTo(x, y);
        }
      });
      ctx!.strokeStyle = "rgba(225,235,255,0.09)";
      ctx!.lineWidth = 0.6 * dpr;
      ctx!.stroke();
    }

    function drawNodes() {
      ctx!.font = `${Math.round(11 * dpr)}px 'Space Mono', monospace`;

      orbits.forEach((o, idx) => {
        o.angle += o.speed;
        const x = W / 2 + Math.cos(o.angle) * o.r * dpr;
        const y = H / 2 + Math.sin(o.angle) * o.r * o.tilt * dpr;
        const depth = Math.sin(o.angle) * 0.5 + 0.5;
        const alpha = 0.25 + depth * 0.6;
        const isRed = redNodes.has(idx);

        o.trail.unshift({ x, y, a: alpha });
        if (o.trail.length > 8) o.trail.pop(); // reduced from 10

        // Trail — batch per color
        for (let i = o.trail.length - 1; i > 0; i--) {
          const p0 = o.trail[i],
            p1 = o.trail[i - 1];
          const fade = (1 - i / o.trail.length) * p0.a * 0.55;
          ctx!.beginPath();
          ctx!.moveTo(p0.x, p0.y);
          ctx!.lineTo(p1.x, p1.y);
          ctx!.strokeStyle = isRed
            ? `rgba(255,140,110,${fade})`
            : `rgba(225,235,255,${fade})`;
          ctx!.lineWidth = (0.4 + depth * 1.1) * dpr;
          ctx!.stroke();
        }

        // Node dot — skip gradient glow, just draw a dot with alpha
        ctx!.beginPath();
        ctx!.fillStyle = isRed
          ? `rgba(255,190,160,${alpha})`
          : `rgba(255,255,255,${alpha})`;
        ctx!.arc(x, y, (1.6 + depth * 1.6) * dpr, 0, Math.PI * 2);
        ctx!.fill();

        // Connector tick
        const dirX = Math.cos(o.angle),
          dirY = Math.sin(o.angle) * o.tilt;
        const dirLen = Math.hypot(dirX, dirY) || 1;
        const ux = dirX / dirLen,
          uy = dirY / dirLen;
        const lineLen = (10 + depth * 6) * dpr;
        const lx = x + ux * lineLen,
          ly = y + uy * lineLen;
        ctx!.beginPath();
        ctx!.moveTo(x, y);
        ctx!.lineTo(lx, ly);
        ctx!.strokeStyle = isRed
          ? `rgba(255,160,130,${alpha * 0.45})`
          : `rgba(225,235,255,${alpha * 0.35})`;
        ctx!.lineWidth = 0.5 * dpr;
        ctx!.stroke();

        // Label
        ctx!.textBaseline = "middle";
        const pad = 7 * dpr;
        const flipFade = Math.min(1, Math.abs(ux) / 0.18);
        const labelAlpha = (0.3 + depth * 0.5) * flipFade;
        if (labelAlpha > 0.01) {
          ctx!.fillStyle = `rgba(225,235,255,${labelAlpha})`;
          if (ux < 0) {
            ctx!.textAlign = "right";
            ctx!.fillText(o.name, lx - pad, ly);
          } else {
            ctx!.textAlign = "left";
            ctx!.fillText(o.name, lx + pad, ly);
          }
        }
      });
    }

    let frameId: number;
    // Star color set once
    ctx.fillStyle = "rgba(225,235,255,1)";

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      t += 0.006;
      drawStars();
      drawOrbitRings();
      drawBlackHole();
      drawNodes();
      frameId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return <canvas id="particle-canvas" ref={canvasRef} />;
}
