"use client";

import { useEffect, useRef } from "react";

type Node = {
  ox: number;
  oy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
};

export default function SpiralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;

    // Cap DPR at 1 — no reason to render at 2x for a canvas effect
    const dpr = 1;
    let W = 0,
      H = 0;

    const ptr = {
      x: -9999,
      y: -9999,
      active: false,
      vx: 0,
      vy: 0,
      px: 0,
      py: 0,
    };

    const onMove = (e: MouseEvent) => {
      const r = c!.getBoundingClientRect();
      const nx = e.clientX - r.left;
      const ny = e.clientY - r.top;
      ptr.vx = nx - ptr.px;
      ptr.vy = ny - ptr.py;
      ptr.px = nx;
      ptr.py = ny;
      ptr.x = nx;
      ptr.y = ny;
      ptr.active = true;
    };
    const onLeave = () => {
      ptr.active = false;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    // ── Grid ──────────────────────────────────────────────────────
    // Larger spacing = far fewer nodes = much faster
    const SPACING = 72;
    let cols = 0,
      rows = 0,
      nodes: Node[] = [];
    const tensions = new Float32Array(8000);

    function build() {
      cols = Math.ceil(W / SPACING) + 2;
      rows = Math.ceil(H / SPACING) + 2;
      nodes = [];
      for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
          const x = -SPACING + gx * SPACING;
          const y = -SPACING + gy * SPACING;
          nodes.push({
            ox: x,
            oy: y,
            x,
            y,
            vx: 0,
            vy: 0,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
    }

    function resize() {
      W = c!.width = c!.offsetWidth;
      H = c!.height = c!.offsetHeight;
      build();
    }
    resize();
    window.addEventListener("resize", resize);

    function nIdx(gx: number, gy: number) {
      if (gx < 0 || gy < 0 || gx >= cols || gy >= rows) return -1;
      return gy * cols + gx;
    }

    const STIFF = 0.025;
    const DAMP = 0.88;
    const PUSH_R = 110;
    const PUSH_STR = 1.6;

    let t = 0,
      frameId: number;

    function frame() {
      ctx.clearRect(0, 0, W, H);
      t += 0.014;

      const pSpeed = Math.hypot(ptr.vx, ptr.vy);

      // ── Physics ─────────────────────────────────────────────────
      const n = nodes.length;
      for (let i = 0; i < n; i++) {
        const nd = nodes[i];
        const breathe = Math.sin(t * 0.55 + nd.phase) * 1.8;

        nd.vx += (nd.ox - nd.x) * STIFF;
        nd.vy += (nd.oy + breathe - nd.y) * STIFF;

        if (ptr.active) {
          const dx = nd.x - ptr.x,
            dy = nd.y - ptr.y;
          const d = Math.hypot(dx, dy);
          if (d < PUSH_R && d > 1) {
            const f =
              (1 - d / PUSH_R) ** 2 * PUSH_STR * (1 + Math.min(pSpeed / 6, 2));
            nd.vx += (dx / d) * f;
            nd.vy += (dy / d) * f;
          }
        }

        nd.vx *= DAMP;
        nd.vy *= DAMP;
        nd.x += nd.vx;
        nd.y += nd.vy;

        tensions[i] = Math.min(1, Math.hypot(nd.x - nd.ox, nd.y - nd.oy) / 28);
      }
      ptr.vx *= 0.8;
      ptr.vy *= 0.8;

      // ── Draw lines — BATCHED into ONE path per pass ──────────────
      // Pass A: all normal grid edges (horizontal + vertical) in one stroke
      ctx.beginPath();
      for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
          const i = nIdx(gx, gy);
          if (i < 0) continue;
          const a = nodes[i];

          const ri = nIdx(gx + 1, gy);
          if (ri >= 0) {
            const b = nodes[ri];
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
          }
          const di = nIdx(gx, gy + 1);
          if (di >= 0) {
            const b = nodes[di];
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
          }
        }
      }
      // Single stroke for ALL lines — massive perf gain
      ctx.strokeStyle = "rgba(240,240,240,0.18)";
      ctx.lineWidth = 0.7;
      ctx.stroke();

      // Pass B: tension overlay — only for nodes under stress
      // Still one batched path
      ctx.beginPath();
      let hasTension = false;
      for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
          const i = nIdx(gx, gy);
          if (i < 0 || tensions[i] < 0.12) continue;
          const a = nodes[i];
          const tns = tensions[i];

          const ri = nIdx(gx + 1, gy);
          if (ri >= 0) {
            const b = nodes[ri];
            const et = Math.max(tns, tensions[ri]);
            if (et > 0.12) {
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              hasTension = true;
            }
          }
          const di = nIdx(gx, gy + 1);
          if (di >= 0) {
            const b = nodes[di];
            const et = Math.max(tns, tensions[di]);
            if (et > 0.12) {
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              hasTension = true;
            }
          }
        }
      }
      if (hasTension) {
        ctx.strokeStyle = "rgba(255,255,255,0.28)";
        ctx.lineWidth = 1.0;
        ctx.stroke();
      }

      // ── Nodes — batched arcs, two passes (dim + bright) ─────────
      // Dim base nodes — one fill call
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const nd = nodes[i];
        if (tensions[i] > 0.12) continue;
        ctx.moveTo(nd.x + 1.4, nd.y);
        ctx.arc(nd.x, nd.y, 1.4, 0, Math.PI * 2);
      }
      ctx.fillStyle = "rgba(240,240,240,0.28)";
      ctx.fill();

      // Bright tensioned nodes — one fill call
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const nd = nodes[i];
        const tns = tensions[i];
        if (tns <= 0.12) continue;
        const r = 1.4 + tns * 2.8;
        ctx.moveTo(nd.x + r, nd.y);
        ctx.arc(nd.x, nd.y, r, 0, Math.PI * 2);
      }
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.fill();

      // ── Subtle vignette ─────────────────────────────────────────
      const vig = ctx.createRadialGradient(
        W / 2,
        H / 2,
        Math.min(W, H) * 0.25,
        W / 2,
        H / 2,
        Math.max(W, H) * 0.72,
      );
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,0,0.22)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      frameId = requestAnimationFrame(frame);
    }
    frame();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return <canvas id="spiral-canvas" ref={canvasRef} />;
}
