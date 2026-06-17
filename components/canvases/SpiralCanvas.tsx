"use client";

import { useEffect, useRef } from "react";

type SpiralPoint = {
  ox: number;
  oy: number;
  size: number;
  life: number;
};

export default function SpiralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    let W: number, H: number;
    function resize() {
      W = c!.width = c!.offsetWidth;
      H = c!.height = c!.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    let t = 0;
    const pts: SpiralPoint[] = [];
    for (let i = 0; i < 600; i++) {
      const a = i * 0.15,
        r = i * 0.4;
      pts.push({
        ox: Math.cos(a) * r,
        oy: Math.sin(a) * r * 0.5,
        size: 0.5 + Math.random(),
        life: Math.random() * Math.PI * 2,
      });
    }

    let frameId: number;

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      t += 0.01;
      pts.forEach((p) => {
        p.life += 0.015;
        const x = W * 0.55 + p.ox,
          y = H * 0.4 + p.oy;
        const alpha = 0.15 + 0.25 * Math.sin(p.life);
        ctx!.beginPath();
        ctx!.arc(x, y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(240,240,240,${alpha})`;
        ctx!.fill();
      });
      frameId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return <canvas id="spiral-canvas" ref={canvasRef}></canvas>;
}
