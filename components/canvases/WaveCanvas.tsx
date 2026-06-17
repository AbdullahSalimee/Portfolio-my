"use client";

import { useEffect, useRef } from "react";

export default function WaveCanvas() {
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
    let frameId: number;

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      t += 0.02;
      const pts = 300;
      for (let j = 0; j < 3; j++) {
        ctx!.beginPath();
        for (let i = 0; i < pts; i++) {
          const x = (i / pts) * W;
          const y = H / 2 + Math.sin((i / pts) * Math.PI * 3 + t + j * 0.4) * 60 * (1 - (i / pts) * 0.4);
          const size = 0.8 + Math.random() * 1.2;
          ctx!.fillStyle = `rgba(240,240,240,${0.08 + Math.sin(i * 0.1 + t) * 0.06})`;
          ctx!.fillRect(x, y, size, size);
        }
      }
      frameId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return <canvas id="wave-canvas" ref={canvasRef}></canvas>;
}
