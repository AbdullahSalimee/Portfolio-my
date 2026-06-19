"use client";

import { useEffect, useRef } from "react";

type Particle = {
  angle: number;
  radius: number;
  size: number;
  brightness: number;
  isStar: boolean;
  twinklePhase: number;
  twinkleSpeed: number;
  lensX: number;
  lensY: number;
  lensSwirl: number;
};

export default function SpiralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let W: number, H: number;

    const pointer = { x: -9999, y: -9999, active: 0, strength: 0 };
    function onMove(e: MouseEvent) {
      const rect = c!.getBoundingClientRect();
      pointer.x = (e.clientX - rect.left) * dpr;
      pointer.y = (e.clientY - rect.top) * dpr;
      pointer.active = 1;
    }
    function onLeave() {
      pointer.active = 0;
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    let cx = 0,
      cy = 0;
    let particles: Particle[] = [];

    // Pre-rendered star glow sprite — drawn once, reused via drawImage
    // every frame instead of creating a radial gradient per star.
    let glowSprite: HTMLCanvasElement | null = null;
    function buildGlowSprite() {
      const size = 28;
      glowSprite = document.createElement("canvas");
      glowSprite.width = size;
      glowSprite.height = size;
      const gctx = glowSprite.getContext("2d")!;
      const grad = gctx.createRadialGradient(
        size / 2,
        size / 2,
        0,
        size / 2,
        size / 2,
        size / 2,
      );
      grad.addColorStop(0, "rgba(255,255,255,0.9)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      gctx.fillStyle = grad;
      gctx.fillRect(0, 0, size, size);
    }

    function buildParticles() {
      cx = W / 2;
      cy = H / 2;
      const maxR = Math.max(W, H) * 0.6;
      const COUNT = 800; // cut from 2200 — biggest perf win
      const STAR_RATIO = 0.05;

      particles = Array.from({ length: COUNT }, () => {
        const radius = Math.pow(Math.random(), 1.8) * maxR;
        const armOffset = (radius / maxR) * 3.2;
        const arm = Math.floor(Math.random() * 3) * ((Math.PI * 2) / 3);
        const angle = arm + armOffset + (Math.random() - 0.5) * 0.9;
        const isStar = Math.random() < STAR_RATIO;

        return {
          angle,
          radius,
          size: isStar ? 0.9 + Math.random() * 1.3 : 0.5 + Math.random() * 0.8,
          brightness: isStar
            ? 0.6 + Math.random() * 0.4
            : 0.1 + Math.random() * 0.2,
          isStar,
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.02 + Math.random() * 0.02,
          lensX: 0,
          lensY: 0,
          lensSwirl: 0,
        };
      });
    }

    function resize() {
      W = c!.width = c!.offsetWidth * dpr;
      H = c!.height = c!.offsetHeight * dpr;
      buildParticles();
      buildGlowSprite();
    }
    resize();
    window.addEventListener("resize", resize);

    let t = 0;
    let galaxyRotation = 0;
    let frameId: number;

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      t += 1;

      // genuine whole-galaxy spin — visible, continuous
      galaxyRotation += 0.0011;

      pointer.strength += ((pointer.active ? 1 : 0) - pointer.strength) * 0.06;
      const lensRadius = 170 * dpr;
      const lensActive = pointer.strength > 0.01;
      const lensRadiusSq = lensRadius * lensRadius;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        const totalAngle = p.angle + galaxyRotation;
        const cosA = Math.cos(totalAngle);
        const sinA = Math.sin(totalAngle);
        const baseX = cx + cosA * p.radius;
        const baseY = cy + sinA * p.radius * 0.6;

        let fx = baseX;
        let fy = baseY;

        // only do the (expensive-ish) lens math for particles that could
        // plausibly be within range — cheap squared-distance pre-check
        if (lensActive) {
          const dx0 = baseX - pointer.x;
          const dy0 = baseY - pointer.y;
          const distSq = dx0 * dx0 + dy0 * dy0;

          if (distSq < lensRadiusSq) {
            const dist = Math.sqrt(distSq) || 0.001;
            const falloff = 1 - dist / lensRadius;
            const pull = falloff * falloff * 34 * dpr * pointer.strength;
            const targetLensX = -(dx0 / dist) * pull;
            const targetLensY = -(dy0 / dist) * pull;
            const targetSwirl = falloff * falloff * 1.1 * pointer.strength;

            p.lensX += (targetLensX - p.lensX) * 0.08;
            p.lensY += (targetLensY - p.lensY) * 0.08;
            p.lensSwirl += (targetSwirl - p.lensSwirl) * 0.08;
          } else if (p.lensSwirl !== 0 || p.lensX !== 0) {
            p.lensX *= 0.92;
            p.lensY *= 0.92;
            p.lensSwirl *= 0.92;
          }

          if (p.lensX !== 0 || p.lensY !== 0) {
            fx += p.lensX;
            fy += p.lensY;
          }
          if (p.lensSwirl > 0.001) {
            const ddx = fx - pointer.x;
            const ddy = fy - pointer.y;
            const a = p.lensSwirl * 0.5;
            const c2 = Math.cos(a),
              s2 = Math.sin(a);
            fx = pointer.x + ddx * c2 - ddy * s2;
            fy = pointer.y + ddx * s2 + ddy * c2;
          }
        } else if (p.lensX !== 0 || p.lensY !== 0 || p.lensSwirl !== 0) {
          p.lensX *= 0.92;
          p.lensY *= 0.92;
          p.lensSwirl *= 0.92;
          fx += p.lensX;
          fy += p.lensY;
        }

        const twinkle = p.isStar
          ? 0.6 + 0.4 * Math.sin(t * p.twinkleSpeed + p.twinklePhase)
          : 1;
        const alpha = p.brightness * twinkle;
        const size = p.size * dpr * (p.isStar ? twinkle * 0.6 + 0.7 : 1);

        if (p.isStar && glowSprite) {
          const gs = size * 7;
          ctx!.globalAlpha = alpha * 0.5;
          ctx!.drawImage(glowSprite, fx - gs / 2, fy - gs / 2, gs, gs);
          ctx!.globalAlpha = 1;
        }

        ctx!.beginPath();
        ctx!.fillStyle = `rgba(240,240,240,${Math.min(1, alpha)})`;
        ctx!.arc(fx, fy, Math.max(0.4, size), 0, Math.PI * 2);
        ctx!.fill();
      }

      // soft core glow — single gradient per frame, not per particle
      const coreGlow = ctx!.createRadialGradient(
        cx,
        cy,
        0,
        cx,
        cy,
        Math.min(W, H) * 0.12,
      );
      coreGlow.addColorStop(0, "rgba(240,240,240,0.05)");
      coreGlow.addColorStop(1, "rgba(240,240,240,0)");
      ctx!.beginPath();
      ctx!.fillStyle = coreGlow;
      ctx!.arc(cx, cy, Math.min(W, H) * 0.12, 0, Math.PI * 2);
      ctx!.fill();

      if (pointer.strength > 0.02) {
        ctx!.beginPath();
        ctx!.arc(pointer.x, pointer.y, lensRadius * 0.5, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(240,240,240,${0.05 * pointer.strength})`;
        ctx!.lineWidth = 0.6 * dpr;
        ctx!.stroke();

        if (glowSprite) {
          const gs = 24 * dpr;
          ctx!.globalAlpha = 0.25 * pointer.strength;
          ctx!.drawImage(
            glowSprite,
            pointer.x - gs / 2,
            pointer.y - gs / 2,
            gs,
            gs,
          );
          ctx!.globalAlpha = 1;
        }
      }

      frameId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return <canvas id="spiral-canvas" ref={canvasRef}></canvas>;
}
