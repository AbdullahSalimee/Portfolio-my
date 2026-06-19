"use client";

import { useEffect, useRef } from "react";

type Drop = {
  x: number;
  y: number;
  vy: number;
  size: number;
  trail: { x: number; y: number }[];
  landed: boolean;
  generation: number;
};

type Ripple = {
  x: number;
  y: number;
  r: number;
  maxR: number;
  age: number;
  maxAge: number;
  generation: number;
  children: number;
  maxChildren: number;
};

type Splash = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
};

export default function InkRipple() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0,
      H = 0,
      t = 0;
    let frameId: number;

    const drops: Drop[] = [];
    const ripples: Ripple[] = [];
    const splashes: Splash[] = [];

    function resize() {
      W = canvas.width = canvas.offsetWidth * dpr;
      H = canvas.height = canvas.offsetHeight * dpr;
    }
    resize();
    window.addEventListener("resize", resize);

    const WW = () => W / dpr;
    const HH = () => H / dpr;
    const surfaceY = () => HH() * 0.58;

    function easeOut(t: number) {
      return 1 - Math.pow(1 - t, 3);
    }

    function spawnDrop(x: number, startY: number, size: number, gen: number) {
      if (gen > 3) return;
      drops.push({
        x,
        y: startY,
        vy: 1.5 + Math.random() * 2,
        size,
        trail: [],
        landed: false,
        generation: gen,
      });
    }

    function spawnSplash(
      x: number,
      y: number,
      count: number,
      intensity: number,
    ) {
      for (let i = 0; i < count; i++) {
        const angle = -Math.PI + Math.random() * Math.PI * 2;
        const speed = (1 + Math.random() * 3) * intensity;
        splashes.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 3,
          life: 1,
          size: 1 + Math.random() * 2,
        });
      }
    }

    spawnDrop(WW() / 2, HH() * 0.05, 5, 0);
    let lastAutoSpawn = 0;

    function simulate() {
      t++;

      const allDone =
        drops.length === 0 && ripples.every((r) => r.age > r.maxAge * 0.8);
      if (allDone && t - lastAutoSpawn > 130) {
        lastAutoSpawn = t;
        spawnDrop(
          WW() * (0.25 + Math.random() * 0.5),
          HH() * 0.02,
          4 + Math.random() * 3,
          0,
        );
      }

      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        if (d.landed) {
          drops.splice(i, 1);
          continue;
        }
        d.vy += 0.18;
        d.y += d.vy;
        d.trail.unshift({ x: d.x, y: d.y });
        if (d.trail.length > 18) d.trail.pop();

        if (d.y >= surfaceY()) {
          d.landed = true;
          spawnSplash(d.x, surfaceY(), 8 + d.generation * 2, d.size * 0.4);
          const maxR = 60 + d.size * 10 - d.generation * 8;
          ripples.push({
            x: d.x,
            y: surfaceY(),
            r: 0,
            maxR,
            age: 0,
            maxAge: 120 + maxR * 0.8,
            generation: d.generation,
            children: 0,
            maxChildren: Math.max(0, 3 - d.generation),
          });
        }
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        const rip = ripples[i];
        rip.age++;
        rip.r = rip.maxR * easeOut(Math.min(1, rip.age / (rip.maxAge * 0.6)));

        if (rip.children < rip.maxChildren) {
          const threshold = (rip.children + 1) / (rip.maxChildren + 1);
          if (rip.age / rip.maxAge > threshold * 0.4) {
            rip.children++;
            const angle = Math.random() * Math.PI * 2;
            spawnDrop(
              rip.x + Math.cos(angle) * rip.r * 0.7,
              surfaceY() - 8,
              3 - rip.generation * 0.6,
              rip.generation + 1,
            );
          }
        }

        if (rip.age > rip.maxAge) ripples.splice(i, 1);
      }

      for (let i = splashes.length - 1; i >= 0; i--) {
        const s = splashes[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.22;
        s.vx *= 0.94;
        s.life -= 0.03;
        if (s.life < 0) splashes.splice(i, 1);
      }
    }

    function render() {
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.scale(dpr, dpr);

      const sy = surfaceY();

      // Surface line
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(WW(), sy);
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Water body
      const wg = ctx.createLinearGradient(0, sy, 0, HH());
      wg.addColorStop(0, "rgba(255,255,255,0.05)");
      wg.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = wg;
      ctx.fillRect(0, sy, WW(), HH() - sy);

      // Ripples — perspective ellipses
      for (const rip of ripples) {
        const progress = rip.age / rip.maxAge;
        const alpha = (1 - progress) * (0.7 - rip.generation * 0.15);
        if (alpha <= 0) continue;
        for (let k = 0; k < 3; k++) {
          const rr = rip.r * (1 - k * 0.18);
          if (rr <= 0) continue;
          ctx.beginPath();
          ctx.ellipse(rip.x, rip.y, rr, rr * 0.3, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255,255,255,${alpha * (1 - k * 0.3)})`;
          ctx.lineWidth = 1.2 - k * 0.3;
          ctx.stroke();
        }
      }

      // Splashes
      for (const s of splashes) {
        if (s.y > sy + 4) continue;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.life * 0.7})`;
        ctx.fill();
      }

      // Trails
      for (const d of drops) {
        for (let k = 1; k < d.trail.length; k++) {
          ctx.beginPath();
          ctx.moveTo(d.trail[k - 1].x, d.trail[k - 1].y);
          ctx.lineTo(d.trail[k].x, d.trail[k].y);
          ctx.strokeStyle = `rgba(255,255,255,${(1 - k / d.trail.length) * 0.35})`;
          ctx.lineWidth = d.size * 0.35 * (1 - k / d.trail.length);
          ctx.stroke();
        }
      }

      // Drops — teardrop shape
      for (const d of drops) {
        const stretch = Math.min(d.vy * 0.5, 3);
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.beginPath();
        ctx.ellipse(
          0,
          stretch * 0.5,
          d.size * 0.6,
          d.size + stretch,
          0,
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = `rgba(255,255,255,${0.85 - d.generation * 0.15})`;
        ctx.fill();
        // Highlight
        ctx.beginPath();
        ctx.ellipse(
          -d.size * 0.15,
          -d.size * 0.2,
          d.size * 0.18,
          d.size * 0.28,
          -0.4,
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
    }

    function animate() {
      simulate();
      render();
      frameId = requestAnimationFrame(animate);
    }

    animate();

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      spawnDrop(e.clientX - rect.left, 0, 5 + Math.random() * 3, 0);
    };
    canvas.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("click", onClick);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        cursor: "crosshair",
      }}
    />
  );
}
