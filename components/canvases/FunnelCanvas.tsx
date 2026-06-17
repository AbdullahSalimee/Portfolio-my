"use client";

import { useEffect, useRef } from "react";

type Trail = { x: number; y: number };

export default function FunnelCanvas() {
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
    const ball = { x: 0, y: 0, trail: [] as Trail[] };
    let frameId: number;

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      t += 0.02;
      const cx = W / 2,
        cy = H / 2;

      ctx!.strokeStyle = "rgba(240,240,240,0.25)";
      ctx!.lineWidth = 0.6;
      for (let i = 0; i < 20; i++) {
        const r1 = 120 - i * 3,
          r2 = 30;
        ctx!.beginPath();
        ctx!.ellipse(cx, cy + 80, r1, r2, 0, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(240,240,240,${0.04 + i * 0.008})`;
        ctx!.stroke();
      }

      const bAngle = t * 0.8,
        bR = 80 - (t % 8) * 8;
      ball.x = cx + Math.cos(bAngle) * Math.max(bR, 5);
      ball.y = cy - 100 + (t % 8) * 20;
      ball.trail.push({ x: ball.x, y: ball.y });
      if (ball.trail.length > 60) ball.trail.shift();
      ctx!.beginPath();
      ball.trail.forEach((p, i) => {
        i === 0 ? ctx!.moveTo(p.x, p.y) : ctx!.lineTo(p.x, p.y);
      });
      ctx!.strokeStyle = "rgba(240,240,240,0.4)";
      ctx!.lineWidth = 0.8;
      ctx!.stroke();
      ctx!.beginPath();
      ctx!.arc(ball.x, ball.y, 4, 0, Math.PI * 2);
      ctx!.fillStyle = "rgba(240,240,240,0.8)";
      ctx!.fill();

      frameId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return <canvas id="funnel-canvas" ref={canvasRef}></canvas>;
}
