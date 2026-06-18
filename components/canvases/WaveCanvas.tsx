"use client";

import { useEffect, useRef } from "react";

export default function WaveCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let W: number, H: number;

    function resize() {
      W = c!.width = c!.offsetWidth * dpr;
      H = c!.height = c!.offsetHeight * dpr;
      buildGradients();
    }

    // Pointer tracking — drives a subtle ripple distortion in the waves
    const pointer = { x: -9999, y: -9999, active: 0 };
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

    type Layer = {
      baseY: number;
      amp: number;
      freq: number;
      speed: number;
      phase: number;
      shade: number;
      width: number;
      grad?: CanvasGradient;
      isRed?: boolean;
    };

    const LAYERS = 4;
    const layers: Layer[] = Array.from({ length: LAYERS }, (_, i) => {
      const depth = i / (LAYERS - 1);
      return {
        baseY: 0.42 + depth * 0.1,
        amp: 26 + depth * 46,
        freq: 1.6 + i * 0.35,
        speed: 0.25 + depth * 0.4,
        phase: i * 1.3,
        shade: 0.12 + depth * 0.5,
        width: 0.6 + depth * 1.1,
        isRed: i === 1, // Second layer gets red tint
      };
    });

    function buildGradients() {
      layers.forEach((layer) => {
        const grad = ctx!.createLinearGradient(0, 0, W, 0);
        if (layer.isRed) {
          const s = layer.shade;
          grad.addColorStop(0, `rgba(255, 180, 160, ${s * 0.15})`);
          grad.addColorStop(0.5, `rgba(255, 150, 130, ${s})`);
          grad.addColorStop(1, `rgba(255, 180, 160, ${s * 0.15})`);
        } else {
          const s = layer.shade;
          grad.addColorStop(0, `rgba(240,240,240,${s * 0.15})`);
          grad.addColorStop(0.5, `rgba(240,240,240,${s})`);
          grad.addColorStop(1, `rgba(240,240,240,${s * 0.15})`);
        }
        layer.grad = grad;
      });
    }

    resize();
    window.addEventListener("resize", resize);

    type Particle = {
      x: number;
      y: number;
      r: number;
      drift: number;
      bob: number;
      bobPhase: number;
      alpha: number;
      isRed?: boolean;
    };
    const PCOUNT = 36;
    const particles: Particle[] = Array.from({ length: PCOUNT }, (_, i) => ({
      x: Math.random(),
      y: Math.random() * 0.5,
      r: 0.4 + Math.random() * 1.3,
      drift: 0.00006 + Math.random() * 0.00012,
      bob: 4 + Math.random() * 10,
      bobPhase: Math.random() * Math.PI * 2,
      alpha: 0.05 + Math.random() * 0.22,
      isRed: i % 6 === 0, // Every 6th particle is red
    }));

    // Pre-rendered grain tile — drawn once, reused every frame instead
    // of generating random noise per pixel each draw call.
    const grainCanvas = document.createElement("canvas");
    grainCanvas.width = 128;
    grainCanvas.height = 128;
    const gctx = grainCanvas.getContext("2d")!;
    for (let i = 0; i < 500; i++) {
      gctx.fillStyle = `rgba(240,240,240,${Math.random() * 0.04})`;
      gctx.fillRect(Math.random() * 128, Math.random() * 128, 1, 1);
    }
    let grainPattern: CanvasPattern | null = null;

    function waveY(layer: Layer, x: number, t: number) {
      const n =
        Math.sin(x * layer.freq + t * layer.speed + layer.phase) * 0.6 +
        Math.sin(x * layer.freq * 2.1 + t * layer.speed * 1.4 + layer.phase) *
          0.25 +
        Math.sin(x * layer.freq * 0.45 - t * layer.speed * 0.7 + layer.phase) *
          0.15;
      let y = layer.baseY * H + n * layer.amp * dpr;

      const dist = Math.abs(x - pointer.x);
      const radius = 220 * dpr;
      if (pointer.active && dist < radius) {
        const falloff = 1 - dist / radius;
        y -= Math.sin(falloff * Math.PI) * 18 * dpr * falloff;
      }
      return y;
    }

    let t = 0;
    let frameId: number;

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      t += 0.012;

      layers.forEach((layer) => {
        const step = 6 * dpr;
        ctx!.beginPath();
        for (let x = 0; x <= W; x += step) {
          const y = waveY(layer, x, t);
          x === 0 ? ctx!.moveTo(x, y) : ctx!.lineTo(x, y);
        }
        ctx!.strokeStyle = layer.grad!;
        ctx!.lineWidth = layer.width * dpr;
        ctx!.stroke();
      });

      particles.forEach((p) => {
        p.x += p.drift;
        if (p.x > 1.05) p.x = -0.05;
        const x = p.x * W;
        const y = p.y * H * 0.7 + Math.sin(t * 0.6 + p.bobPhase) * p.bob * dpr;
        ctx!.beginPath();
        if (p.isRed) {
          ctx!.fillStyle = `rgba(255, 150, 130, ${p.alpha * 1.5})`;
        } else {
          ctx!.fillStyle = `rgba(240,240,240,${p.alpha})`;
        }
        ctx!.arc(x, y, p.r * dpr, 0, Math.PI * 2);
        ctx!.fill();
      });

      if (!grainPattern)
        grainPattern = ctx!.createPattern(grainCanvas, "repeat");
      if (grainPattern) {
        ctx!.fillStyle = grainPattern;
        ctx!.fillRect(0, 0, W, H);
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

  return <canvas id="wave-canvas" ref={canvasRef}></canvas>;
}
