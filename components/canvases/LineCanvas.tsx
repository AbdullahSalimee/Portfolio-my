"use client";

import { useEffect, useRef } from "react";

export default function LineCanvas() {
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

    ctx.strokeStyle = "rgba(240,240,240,0.15)";
    ctx.lineWidth = 0.5;
    let t = 0;
    let frameId: number;

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      t += 0.008;
      for (let i = 0; i < 8; i++) {
        const y = H * 0.3 + i * 12;
        ctx!.beginPath();
        for (let x = 0; x < W; x += 2) {
          const dy = Math.sin(x * 0.008 + t + i * 0.3) * 20;
          i === 0 ? ctx!.moveTo(x, y + dy) : ctx!.lineTo(x, y + dy);
          ctx!.lineTo(x, y + dy);
        }
        ctx!.strokeStyle = `rgba(240,240,240,${0.06 + i * 0.01})`;
        ctx!.stroke();
      }
      frameId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return <canvas id="line-canvas" ref={canvasRef}></canvas>;
}
