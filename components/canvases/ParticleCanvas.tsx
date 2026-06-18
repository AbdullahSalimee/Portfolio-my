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

    const dpr = window.devicePixelRatio || 1;
    let W: number,
      H: number,
      t = 0;

    function resize() {
      W = c!.width = c!.offsetWidth * dpr;
      H = c!.height = c!.offsetHeight * dpr;
    }
    resize();
    window.addEventListener("resize", resize);

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

    // --- Background starfield (sparse, twinkling, purely cinematic) ---
    const STAR_COUNT = 70;
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.4 + Math.random() * 1.1,
      phase: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 1.2,
    }));

    function drawStars() {
      stars.forEach((s) => {
        const twinkle =
          0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 18 * s.speed + s.phase));
        ctx!.beginPath();
        ctx!.fillStyle = `rgba(225, 235, 255, ${twinkle * 0.5})`;
        ctx!.arc(s.x * W, s.y * H, s.r * dpr, 0, Math.PI * 2);
        ctx!.fill();
      });
    }

    // --- Black hole core ---------------------------------------------
    const CORE_R = 16; // event horizon radius, in CSS px (scaled by dpr at draw time)
    const DISK_R = 46; // outer extent of the accretion disk glow

    function drawBlackHole() {
      const cx = W / 2;
      const cy = H / 2;
      const core = CORE_R * dpr;
      const disk = DISK_R * dpr;

      // Wide, dim vignette-style glow — sets the "space" mood without
      // washing out the scene. Cool white/blue, very low alpha at edges.
      const outerGlow = ctx!.createRadialGradient(
        cx,
        cy,
        core * 0.5,
        cx,
        cy,
        disk * 2.4,
      );
      outerGlow.addColorStop(0, "rgba(225, 235, 255, 0.16)");
      outerGlow.addColorStop(0.3, "rgba(190, 210, 255, 0.06)");
      outerGlow.addColorStop(1, "rgba(190, 210, 255, 0)");
      ctx!.beginPath();
      ctx!.fillStyle = outerGlow;
      ctx!.arc(cx, cy, disk * 2.4, 0, Math.PI * 2);
      ctx!.fill();

      // Accretion disk: thin tilted ellipse, brighter on the side that
      // would be sweeping toward the viewer (simple Doppler-style fake).
      // Pure white-hot at the inner edge, cooling to pale blue-white out.
      const tilt = 0.34;
      const spin = t * 0.6;

      ctx!.save();
      ctx!.translate(cx, cy);

      for (let pass = 0; pass < 2; pass++) {
        // pass 0: back half of disk (drawn first, dimmer)
        // pass 1: front half of disk (drawn after core, brighter)
        const startA = pass === 0 ? Math.PI : 0;
        const endA = pass === 0 ? Math.PI * 2 : Math.PI;
        const segs = 56;
        for (let i = 0; i < segs; i++) {
          const a0 = startA + ((endA - startA) * i) / segs;
          const a1 = startA + ((endA - startA) * (i + 1)) / segs;
          const am = (a0 + a1) / 2 + spin;

          const rr0 = core * 1.12;
          const rr1 = disk;

          const x0 = Math.cos(a0 + spin) * rr0;
          const y0 = Math.sin(a0 + spin) * rr0 * tilt;
          const x1 = Math.cos(a1 + spin) * rr1;
          const y1 = Math.sin(a1 + spin) * rr1 * tilt;
          const x2 = Math.cos(a0 + spin) * rr1;
          const y2 = Math.sin(a0 + spin) * rr1 * tilt;

          // brightness peaks at the "approaching" side (am near -PI/2)
          const brightness =
            0.25 +
            0.75 * Math.max(0, Math.sin(am - Math.PI / 2) * -1 + 1) * 0.5;
          // cool white-blue throughout — brighter side leans pure white,
          // dimmer side cools toward a soft blue
          const lightness = 82 + brightness * 14;
          const sat = 25 - brightness * 15;
          const alpha =
            pass === 0 ? 0.1 + brightness * 0.14 : 0.2 + brightness * 0.55;

          const grad = ctx!.createLinearGradient(x0, y0, x1, y1);
          grad.addColorStop(0, `hsla(210, ${sat}%, ${lightness}%, ${alpha})`);
          grad.addColorStop(1, `hsla(210, ${sat}%, ${lightness}%, 0)`);

          ctx!.beginPath();
          ctx!.moveTo(x0, y0);
          ctx!.lineTo(x1, y1);
          ctx!.lineTo(x2, y2);
          ctx!.closePath();
          ctx!.fillStyle = grad;
          ctx!.fill();
        }

        if (pass === 0) {
          // Event horizon: pure black core, drawn between the two disk
          // passes so the front half of the disk occludes it correctly.
          ctx!.beginPath();
          ctx!.arc(0, 0, core, 0, Math.PI * 2);
          ctx!.fillStyle = "#000";
          ctx!.fill();

          // Photon-ring rim: crisp bright white, the classic "lensed
          // light bent around the horizon" look, with a faint secondary
          // ring just outside it for extra depth. A slow pulse keeps it
          // feeling alive rather than static.
          const pulse = 0.82 + 0.18 * Math.sin(t * 4.2);
          ctx!.beginPath();
          ctx!.arc(0, 0, core * 1.03, 0, Math.PI * 2);
          ctx!.strokeStyle = `rgba(255, 255, 255, ${0.85 * pulse})`;
          ctx!.lineWidth = 1 * dpr;
          ctx!.shadowColor = "rgba(255, 255, 255, 0.8)";
          ctx!.shadowBlur = (5 + 3 * pulse) * dpr;
          ctx!.stroke();
          ctx!.shadowBlur = 0;

          ctx!.beginPath();
          ctx!.arc(0, 0, core * 1.18, 0, Math.PI * 2);
          ctx!.strokeStyle = "rgba(220, 235, 255, 0.18)";
          ctx!.lineWidth = 0.6 * dpr;
          ctx!.stroke();
        }
      }

      ctx!.restore();
    }

    // --- Orbiting tech labels ------------------------------------------
    function drawOrbitRings() {
      orbits.forEach((o) => {
        ctx!.beginPath();
        for (let i = 0; i <= 120; i++) {
          const a = (i / 120) * Math.PI * 2;
          const x = W / 2 + Math.cos(a) * o.r * dpr;
          const y = H / 2 + Math.sin(a) * o.r * o.tilt * dpr;
          i === 0 ? ctx!.moveTo(x, y) : ctx!.lineTo(x, y);
        }
        ctx!.strokeStyle = "rgba(225, 235, 255, 0.09)";
        ctx!.lineWidth = 0.6 * dpr;
        ctx!.stroke();
      });
    }

    function drawNodes() {
      ctx!.font = `${Math.round(11 * dpr)}px 'Space Mono', monospace`;

      orbits.forEach((o) => {
        o.angle += o.speed;
        const x = W / 2 + Math.cos(o.angle) * o.r * dpr;
        const y = H / 2 + Math.sin(o.angle) * o.r * o.tilt * dpr;
        const depth = Math.sin(o.angle) * 0.5 + 0.5; // 0 = far side, 1 = near side
        const alpha = 0.25 + depth * 0.6;

        // Maintain a short motion trail for a comet-like streak
        o.trail.unshift({ x, y, a: alpha });
        if (o.trail.length > 10) o.trail.pop();

        // Trail (faint streak behind the node, fading out) — cool white
        for (let i = o.trail.length - 1; i > 0; i--) {
          const p0 = o.trail[i];
          const p1 = o.trail[i - 1];
          const fade = (1 - i / o.trail.length) * p0.a * 0.55;
          ctx!.beginPath();
          ctx!.moveTo(p0.x, p0.y);
          ctx!.lineTo(p1.x, p1.y);
          ctx!.strokeStyle = `rgba(225, 235, 255, ${fade})`;
          ctx!.lineWidth = (0.4 + depth * 1.1) * dpr;
          ctx!.stroke();
        }

        // Soft glow halo behind the node
        const glowR = (5 + depth * 5) * dpr;
        const glow = ctx!.createRadialGradient(x, y, 0, x, y, glowR);
        glow.addColorStop(0, `rgba(235, 242, 255, ${alpha * 0.55})`);
        glow.addColorStop(1, "rgba(235, 242, 255, 0)");
        ctx!.beginPath();
        ctx!.fillStyle = glow;
        ctx!.arc(x, y, glowR, 0, Math.PI * 2);
        ctx!.fill();

        // Node core — bright white, with a touch of shadow-blur for a
        // gentle bloom (cinematic point-light look)
        ctx!.beginPath();
        ctx!.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx!.shadowColor = "rgba(255, 255, 255, 0.6)";
        ctx!.shadowBlur = 4 * dpr;
        ctx!.arc(x, y, (1.6 + depth * 1.6) * dpr, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.shadowBlur = 0;

        // Connector tick — fixed length and a fixed outward direction,
        // independent of which side of the orbit we're on, so it never
        // snaps. Direction is simply "away from center".
        const dirX = Math.cos(o.angle);
        const dirY = Math.sin(o.angle) * o.tilt;
        const dirLen = Math.hypot(dirX, dirY) || 1;
        const ux = dirX / dirLen;
        const uy = dirY / dirLen;

        const lineLen = (10 + depth * 6) * dpr;
        const lx = x + ux * lineLen;
        const ly = y + uy * lineLen;
        ctx!.beginPath();
        ctx!.moveTo(x, y);
        ctx!.lineTo(lx, ly);
        ctx!.strokeStyle = `rgba(225, 235, 255, ${alpha * 0.35})`;
        ctx!.lineWidth = 0.5 * dpr;
        ctx!.stroke();

        // Label: anchored left or right of the tick depending on which
        // side of the black hole the node is on. The flip itself is
        // unavoidable (a left-side label reads naturally rightward,
        // a right-side label needs to anchor from its own right edge),
        // but we smooth the transition by fading the label out as it
        // approaches the flip point (ux near 0) and back in after,
        // so there's no visible snap — just a brief fade.
        ctx!.textBaseline = "middle";
        const pad = 7 * dpr;
        const flipFade = Math.min(1, Math.abs(ux) / 0.18); // 0 near the flip, 1 away from it
        const labelAlpha = (0.3 + depth * 0.5) * flipFade;

        if (labelAlpha > 0.01) {
          if (ux < 0) {
            ctx!.textAlign = "right";
            ctx!.fillStyle = `rgba(225, 235, 255, ${labelAlpha})`;
            ctx!.fillText(o.name, lx - pad, ly);
          } else {
            ctx!.textAlign = "left";
            ctx!.fillStyle = `rgba(225, 235, 255, ${labelAlpha})`;
            ctx!.fillText(o.name, lx + pad, ly);
          }
        }
      });
    }

    let frameId: number;

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
