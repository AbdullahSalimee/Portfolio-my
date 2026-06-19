"use client";

import { useEffect, useRef } from "react";

type Bubble = {
  label: string;
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  rot: number;
  rotSpeed: number;
};

export default function SkillsBubbles({ skills }: { skills: string[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = c.offsetWidth * dpr;
    c.height = c.offsetHeight * dpr;
    ctx.scale(dpr, dpr);
    const W = c.offsetWidth,
      H = c.offsetHeight;

    const bubbles: Bubble[] = skills.map((s, i) => {
      const angle = (i / skills.length) * Math.PI * 2 - Math.PI / 2;
      const r = 110 + Math.random() * 40;
      return {
        label: s,
        x: W / 2 + Math.cos(angle) * r,
        y: H / 2 + Math.sin(angle) * r * 0.75,
        radius: 32 + Math.random() * 16,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        rot: 0,
        rotSpeed: (Math.random() - 0.5) * 0.01,
      };
    });

    let lastTime = 0;
    const FRAME_MS = 1000 / 60;

    function draw(now: number) {
      animRef.current = requestAnimationFrame(draw);
      const delta = now - lastTime;
      if (delta < FRAME_MS - 1) return;
      lastTime = now - (delta % FRAME_MS);

      ctx!.clearRect(0, 0, W, H);
      bubbles.forEach((b) => {
        b.x += b.vx;
        b.y += b.vy;
        b.rot += b.rotSpeed;
        if (b.x - b.radius < 0 || b.x + b.radius > W) b.vx *= -1;
        if (b.y - b.radius < 0 || b.y + b.radius > H) b.vy *= -1;

        ctx!.beginPath();
        ctx!.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx!.fillStyle = "#f0f0f0";
        ctx!.fill();

        ctx!.save();
        ctx!.translate(b.x, b.y);
        ctx!.rotate(b.rot);
        ctx!.fillStyle = "#080808";
        ctx!.font = `600 ${Math.max(8, b.radius * 0.35)}px Space Grotesk, sans-serif`;
        ctx!.textAlign = "center";
        ctx!.textBaseline = "middle";
        ctx!.fillText(b.label.length > 8 ? b.label.slice(0, 8) : b.label, 0, 0);
        ctx!.restore();
      });
    }
    animRef.current = requestAnimationFrame(draw);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [skills]);

  return (
    <div className="skills-canvas-wrap">
      <canvas id="skills-canvas" ref={canvasRef}></canvas>
    </div>
  );
}
