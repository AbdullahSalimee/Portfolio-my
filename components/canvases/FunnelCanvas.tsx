"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  vx: number;
  vy: number;
  size: number;
  shade: number;
};

type Pt = { x: number; y: number };

export default function FunnelCanvas() {
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
      buildParticles();
    }

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

    const COUNT = 420; // reduced from 460

    function lerpPt(a: Pt, b: Pt, u: number): Pt {
      return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u };
    }
    function pointsOnEllipse(
      cx: number,
      cy: number,
      rx: number,
      ry: number,
      rot: number,
      count: number,
    ) {
      const pts: Pt[] = [];
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const lx = Math.cos(a) * rx,
          ly = Math.sin(a) * ry;
        pts.push({
          x: cx + lx * Math.cos(rot) - ly * Math.sin(rot),
          y: cy + lx * Math.sin(rot) + ly * Math.cos(rot),
        });
      }
      return pts;
    }
    function pointsOnArc(
      cx: number,
      cy: number,
      r: number,
      a0: number,
      a1: number,
      count: number,
      jitter = 0.012,
    ) {
      const pts: Pt[] = [];
      for (let i = 0; i < count; i++) {
        const a = a0 + (a1 - a0) * Math.random();
        const rr = r + (Math.random() - 0.5) * jitter;
        pts.push({ x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr });
      }
      return pts;
    }
    function pointsOnPolyline(verts: Pt[], count: number, jitter = 0.015) {
      const segLens: number[] = [];
      let total = 0;
      for (let i = 0; i < verts.length - 1; i++) {
        const d = Math.hypot(
          verts[i + 1].x - verts[i].x,
          verts[i + 1].y - verts[i].y,
        );
        segLens.push(d);
        total += d;
      }
      const pts: Pt[] = [];
      for (let i = 0; i < count; i++) {
        let target = Math.random() * total;
        let seg = 0;
        while (seg < segLens.length - 1 && target > segLens[seg]) {
          target -= segLens[seg];
          seg++;
        }
        const u = segLens[seg] > 0 ? target / segLens[seg] : 0;
        const base = lerpPt(verts[seg], verts[seg + 1], u);
        pts.push({
          x: base.x + (Math.random() - 0.5) * jitter,
          y: base.y + (Math.random() - 0.5) * jitter,
        });
      }
      return pts;
    }
    function pointsOnBezier(
      p0: Pt,
      p1: Pt,
      p2: Pt,
      p3: Pt,
      count: number,
      jitter = 0.015,
    ) {
      const pts: Pt[] = [];
      for (let i = 0; i < count; i++) {
        const u = Math.random(),
          v = 1 - u;
        const x =
          v * v * v * p0.x +
          3 * v * v * u * p1.x +
          3 * v * u * u * p2.x +
          u * u * u * p3.x;
        const y =
          v * v * v * p0.y +
          3 * v * v * u * p1.y +
          3 * v * u * u * p2.y +
          u * u * u * p3.y;
        pts.push({
          x: x + (Math.random() - 0.5) * jitter,
          y: y + (Math.random() - 0.5) * jitter,
        });
      }
      return pts;
    }
    function filledBlob(
      cx: number,
      cy: number,
      rx: number,
      ry: number,
      count: number,
    ) {
      const pts: Pt[] = [];
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2,
          r = Math.sqrt(Math.random());
        pts.push({
          x: cx + Math.cos(a) * rx * r,
          y: cy + Math.sin(a) * ry * r,
        });
      }
      return pts;
    }
    function ringPoints(
      cx: number,
      cy: number,
      r: number,
      count: number,
      jitter = 0.02,
    ) {
      const pts: Pt[] = [];
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2,
          rr = r + (Math.random() - 0.5) * jitter;
        pts.push({ x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr });
      }
      return pts;
    }

    function reactPoints(n: number): Pt[] {
      const nucleus = Math.floor(n * 0.05),
        perOrbit = Math.floor((n - nucleus) / 3);
      const pts: Pt[] = filledBlob(0, 0, 0.09, 0.09, nucleus);
      for (let ring = 0; ring < 3; ring++)
        pts.push(
          ...pointsOnEllipse(0, 0, 0.95, 0.36, (ring * Math.PI) / 3, perOrbit),
        );
      return pts;
    }
    function nextPoints(n: number): Pt[] {
      const leftBar = [
        { x: -0.78, y: -0.85 },
        { x: -0.78, y: 0.85 },
      ];
      const rightBar = [
        { x: 0.78, y: -0.85 },
        { x: 0.78, y: 0.85 },
      ];
      const diagOuter = [
        { x: -0.78, y: -0.85 },
        { x: 0.78, y: 0.85 },
      ];
      const diagInner = [
        { x: -0.6, y: -0.85 },
        { x: 0.78, y: 0.6 },
      ];
      const nBars = Math.floor(n * 0.32),
        nDiag = n - nBars * 2;
      const pts: Pt[] = [];
      pts.push(...pointsOnPolyline(leftBar, nBars, 0.05));
      pts.push(...pointsOnPolyline(rightBar, nBars, 0.05));
      pts.push(...pointsOnPolyline(diagOuter, Math.floor(nDiag / 2), 0.04));
      pts.push(...pointsOnPolyline(diagInner, Math.ceil(nDiag / 2), 0.04));
      return pts;
    }
    function tsPoints(n: number): Pt[] {
      const half = Math.floor(n / 2),
        pts: Pt[] = [];
      pts.push(
        ...pointsOnPolyline(
          [
            { x: -0.95, y: -0.78 },
            { x: -0.15, y: -0.78 },
          ],
          Math.floor(half * 0.4),
          0.05,
        ),
      );
      pts.push(
        ...pointsOnPolyline(
          [
            { x: -0.55, y: -0.78 },
            { x: -0.55, y: 0.78 },
          ],
          Math.floor(half * 0.6),
          0.05,
        ),
      );
      pts.push(
        ...pointsOnPolyline(
          [
            { x: 0.82, y: -0.78 },
            { x: 0.18, y: -0.78 },
            { x: 0.18, y: -0.1 },
            { x: 0.82, y: -0.1 },
            { x: 0.82, y: 0.78 },
            { x: 0.18, y: 0.78 },
          ],
          n - pts.length,
          0.05,
        ),
      );
      return pts;
    }
    function nodePoints(n: number): Pt[] {
      const hexVerts: Pt[] = [];
      for (let i = 0; i <= 6; i++) {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        hexVerts.push({ x: Math.cos(a) * 0.92, y: Math.sin(a) * 0.92 });
      }
      const outline = Math.floor(n * 0.7),
        fill = n - outline;
      const pts = pointsOnPolyline(hexVerts, outline, 0.03);
      pts.push(...filledBlob(0, 0, 0.5, 0.5, fill));
      return pts;
    }
    function tailwindPoints(n: number): Pt[] {
      function wave(yOff: number, ampSign: number, count: number) {
        const verts: Pt[] = [];
        for (let i = 0; i <= 24; i++) {
          const u = i / 24,
            x = -0.95 + u * 1.9;
          verts.push({
            x,
            y:
              yOff +
              Math.sin(u * Math.PI * 1.3) * 0.3 * ampSign * (1 - u * 0.3),
          });
        }
        return pointsOnPolyline(verts, count, 0.035);
      }
      const half = Math.floor(n / 2),
        pts: Pt[] = [];
      pts.push(...wave(-0.25, 1, half));
      pts.push(...wave(0.25, -1, n - half));
      return pts;
    }
    function pythonPoints(n: number): Pt[] {
      const half = Math.floor(n / 2),
        pts: Pt[] = [];
      pts.push(...filledBlob(-0.18, -0.32, 0.55, 0.42, half));
      pts.push(...filledBlob(0.18, 0.32, 0.55, 0.42, n - half));
      return pts;
    }
    function gitPoints(n: number): Pt[] {
      const trunk = [
        { x: -0.35, y: -0.85 },
        { x: -0.35, y: 0.85 },
      ];
      const branch = [
        { x: -0.35, y: -0.1 },
        { x: 0.55, y: -0.75 },
      ];
      const nLine = Math.floor(n * 0.55),
        pts: Pt[] = [];
      pts.push(...pointsOnPolyline(trunk, Math.floor(nLine * 0.6), 0.035));
      pts.push(...pointsOnPolyline(branch, Math.floor(nLine * 0.4), 0.035));
      const nodeCount = n - pts.length,
        perNode = Math.floor(nodeCount / 3);
      [
        { x: -0.35, y: -0.85 },
        { x: -0.35, y: 0.85 },
        { x: 0.62, y: -0.85 },
      ].forEach((center, i) => {
        pts.push(
          ...pointsOnEllipse(
            center.x,
            center.y,
            0.16,
            0.16,
            0,
            i === 2 ? nodeCount - perNode * 2 : perNode,
          ),
        );
      });
      return pts;
    }
    function n8nPoints(n: number): Pt[] {
      const nodeCenters = [
        { x: -0.8, y: 0.55 },
        { x: 0.05, y: -0.7 },
        { x: 0.82, y: 0.45 },
      ];
      const nodeR = 0.22,
        perNode = Math.floor(n * 0.18),
        pts: Pt[] = [];
      nodeCenters.forEach((c) =>
        pts.push(...ringPoints(c.x, c.y, nodeR, perNode, 0.025)),
      );
      const remaining = n - pts.length;
      pts.push(
        ...pointsOnPolyline(
          [nodeCenters[0], nodeCenters[1]],
          Math.floor(remaining / 2),
          0.025,
        ),
      );
      pts.push(
        ...pointsOnPolyline(
          [nodeCenters[1], nodeCenters[2]],
          remaining - Math.floor(remaining / 2),
          0.025,
        ),
      );
      return pts;
    }
    function sveltePoints(n: number): Pt[] {
      const upper = pointsOnBezier(
        { x: -0.75, y: -0.15 },
        { x: -0.95, y: -0.85 },
        { x: 0.55, y: -0.95 },
        { x: 0.6, y: -0.25 },
        Math.floor(n * 0.32),
        0.04,
      );
      const upperInner = pointsOnBezier(
        { x: -0.5, y: -0.15 },
        { x: -0.6, y: -0.6 },
        { x: 0.3, y: -0.65 },
        { x: 0.32, y: -0.22 },
        Math.floor(n * 0.18),
        0.035,
      );
      const lower = pointsOnBezier(
        { x: 0.75, y: 0.15 },
        { x: 0.95, y: 0.85 },
        { x: -0.55, y: 0.95 },
        { x: -0.6, y: 0.25 },
        Math.floor(n * 0.32),
        0.04,
      );
      const lowerInner = pointsOnBezier(
        { x: 0.5, y: 0.15 },
        { x: 0.6, y: 0.6 },
        { x: -0.3, y: 0.65 },
        { x: -0.32, y: 0.22 },
        n - upper.length - upperInner.length - lower.length,
        0.035,
      );
      return [...upper, ...upperInner, ...lower, ...lowerInner];
    }
    function htmlPoints(n: number): Pt[] {
      const shield = [
        { x: -0.85, y: -0.9 },
        { x: 0.85, y: -0.9 },
        { x: 0.7, y: 0.55 },
        { x: 0, y: 0.92 },
        { x: -0.7, y: 0.55 },
      ];
      const outlineCount = Math.floor(n * 0.6);
      const pts = pointsOnPolyline([...shield, shield[0]], outlineCount, 0.03);
      const remaining = n - pts.length;
      pts.push(
        ...pointsOnPolyline(
          [
            { x: 0.05, y: -0.25 },
            { x: -0.32, y: 0.05 },
            { x: 0.05, y: 0.35 },
          ],
          Math.floor(remaining / 2),
          0.03,
        ),
      );
      pts.push(
        ...pointsOnPolyline(
          [
            { x: -0.05, y: -0.25 },
            { x: 0.32, y: 0.05 },
            { x: -0.05, y: 0.35 },
          ],
          remaining - Math.floor(remaining / 2),
          0.03,
        ),
      );
      return pts;
    }
    function cssPoints(n: number): Pt[] {
      const shield = [
        { x: -0.85, y: -0.9 },
        { x: 0.85, y: -0.9 },
        { x: 0.7, y: 0.55 },
        { x: 0, y: 0.92 },
        { x: -0.7, y: 0.55 },
      ];
      const outlineCount = Math.floor(n * 0.6);
      const pts = pointsOnPolyline([...shield, shield[0]], outlineCount, 0.03);
      const hashLines = [
        [
          { x: -0.22, y: -0.3 },
          { x: -0.34, y: 0.38 },
        ],
        [
          { x: 0.1, y: -0.3 },
          { x: -0.02, y: 0.38 },
        ],
        [
          { x: -0.38, y: -0.05 },
          { x: 0.22, y: -0.05 },
        ],
        [
          { x: -0.42, y: 0.18 },
          { x: 0.18, y: 0.18 },
        ],
      ];
      const remaining = n - pts.length,
        perLine = Math.floor(remaining / hashLines.length);
      hashLines.forEach((line, i) =>
        pts.push(
          ...pointsOnPolyline(
            line,
            i === hashLines.length - 1
              ? remaining - perLine * (hashLines.length - 1)
              : perLine,
            0.02,
          ),
        ),
      );
      return pts;
    }
    function supabasePoints(n: number): Pt[] {
      const bolt = [
        { x: 0.25, y: -0.95 },
        { x: -0.55, y: 0.15 },
        { x: -0.05, y: 0.15 },
        { x: -0.25, y: 0.95 },
        { x: 0.55, y: -0.15 },
        { x: 0.05, y: -0.15 },
      ];
      const outline = Math.floor(n * 0.55);
      const pts = pointsOnPolyline([...bolt, bolt[0]], outline, 0.03);
      pts.push(...filledBlob(0, 0, 0.45, 0.6, n - pts.length));
      return pts;
    }
    function githubPoints(n: number): Pt[] {
      const head = pointsOnBezier(
        { x: -0.75, y: 0.1 },
        { x: -0.85, y: -0.7 },
        { x: 0.85, y: -0.7 },
        { x: 0.75, y: 0.1 },
        Math.floor(n * 0.3),
        0.035,
      );
      const headLower = pointsOnBezier(
        { x: 0.75, y: 0.1 },
        { x: 0.6, y: 0.85 },
        { x: -0.6, y: 0.85 },
        { x: -0.75, y: 0.1 },
        Math.floor(n * 0.25),
        0.035,
      );
      const earLeft = [
        { x: -0.6, y: -0.55 },
        { x: -0.95, y: -0.95 },
        { x: -0.4, y: -0.75 },
      ];
      const earRight = [
        { x: 0.6, y: -0.55 },
        { x: 0.95, y: -0.95 },
        { x: 0.4, y: -0.75 },
      ];
      const remaining1 = n - head.length - headLower.length;
      const earCount = Math.floor(remaining1 * 0.4);
      const pts = [...head, ...headLower];
      pts.push(...pointsOnPolyline([...earLeft, earLeft[0]], earCount, 0.025));
      pts.push(
        ...pointsOnPolyline([...earRight, earRight[0]], earCount, 0.025),
      );
      const eyeCount = n - pts.length;
      pts.push(
        ...ringPoints(-0.32, -0.05, 0.1, Math.floor(eyeCount / 2), 0.02),
      );
      pts.push(
        ...ringPoints(
          0.32,
          -0.05,
          0.1,
          eyeCount - Math.floor(eyeCount / 2),
          0.02,
        ),
      );
      return pts;
    }

    const SHAPES: { fn: (n: number) => Pt[]; label: string }[] = [
      { fn: reactPoints, label: "react" },
      { fn: nextPoints, label: "next.js" },
      { fn: tsPoints, label: "typescript" },
      { fn: nodePoints, label: "node.js" },
      { fn: tailwindPoints, label: "tailwind css" },
      { fn: pythonPoints, label: "python" },
      { fn: gitPoints, label: "git" },
      { fn: n8nPoints, label: "n8n" },
      { fn: sveltePoints, label: "svelte" },
      { fn: htmlPoints, label: "html5" },
      { fn: cssPoints, label: "css3" },
      { fn: supabasePoints, label: "supabase" },
      { fn: githubPoints, label: "github" },
    ];
    let shapeIdx = 0;
    let particles: Particle[] = [];

    // Inline localToWorld to avoid array allocation per frame
    const scale_ref = { v: 0 };

    function buildParticles() {
      const cx = W / 2,
        cy = H / 2;
      const scale = Math.min(W, H) * 0.28;
      scale_ref.v = scale;
      const localPts = SHAPES[shapeIdx].fn(COUNT);
      particles = localPts.map((tpt) => ({
        x: W / 2 + (Math.random() - 0.5) * 60 * dpr,
        y: H / 2 + (Math.random() - 0.5) * 60 * dpr,
        tx: cx + tpt.x * scale,
        ty: cy + tpt.y * scale,
        vx: 0,
        vy: 0,
        size: 0.7 + Math.random() * 1.2,
        shade: 0.3 + Math.random() * 0.55,
      }));
    }

    resize();
    window.addEventListener("resize", resize);

    const CYCLE = { converge: 130, hold: 230, disperse: 90, scatter: 90 };
    let phase: "scatter" | "converge" | "hold" | "disperse" = "converge";
    let phaseT = 0;

    function setTargetsToShape() {
      const cx = W / 2,
        cy = H / 2,
        scale = Math.min(W, H) * 0.28;
      const localPts = SHAPES[shapeIdx].fn(COUNT);
      particles.forEach((p, i) => {
        p.tx = cx + localPts[i].x * scale;
        p.ty = cy + localPts[i].y * scale;
      });
    }
    function randomizeScatter() {
      particles.forEach((p) => {
        const a = Math.random() * Math.PI * 2,
          r = Math.random() * Math.min(W, H) * 0.42;
        p.tx = W / 2 + Math.cos(a) * r;
        p.ty = H / 2 + Math.sin(a) * r;
      });
    }

    let t = 0;
    let frameId: number;
    let lastTime = 0;
    const FRAME_MS = 1000 / 60;

    function draw(now: number) {
      frameId = requestAnimationFrame(draw);
      const delta = now - lastTime;
      if (delta < FRAME_MS - 1) return;
      lastTime = now - (delta % FRAME_MS);

      ctx!.clearRect(0, 0, W, H);
      t += 0.016;
      phaseT += 1;

      if (phase === "converge" && phaseT > CYCLE.converge) {
        phase = "hold";
        phaseT = 0;
      } else if (phase === "hold" && phaseT > CYCLE.hold) {
        phase = "disperse";
        phaseT = 0;
        randomizeScatter();
      } else if (phase === "disperse" && phaseT > CYCLE.disperse) {
        phase = "scatter";
        phaseT = 0;
        randomizeScatter();
      } else if (phase === "scatter" && phaseT > CYCLE.scatter) {
        phase = "converge";
        phaseT = 0;
        shapeIdx = (shapeIdx + 1) % SHAPES.length;
        setTargetsToShape();
      }

      const ease = phase === "hold" ? 0.075 : 0.05;

      ctx!.beginPath(); // batch all particles into one fill call per alpha group isn't trivial, but we can avoid repeated fillStyle changes by just drawing them all
      particles.forEach((p) => {
        let tx = p.tx,
          ty = p.ty;
        if (phase === "scatter") {
          tx += Math.sin(t * 0.5 + p.x * 0.01) * 24 * dpr;
          ty += Math.cos(t * 0.4 + p.y * 0.01) * 24 * dpr;
        }
        const dx = tx - p.x,
          dy = ty - p.y;
        p.vx += dx * ease * 0.045;
        p.vy += dy * ease * 0.045;

        if (pointer.active) {
          const pdx = p.x - pointer.x,
            pdy = p.y - pointer.y;
          const pd = Math.hypot(pdx, pdy);
          const radius = (phase === "hold" ? 85 : 100) * dpr;
          if (pd < radius && pd > 1) {
            const strength = phase === "hold" ? 0.6 : 0.85;
            const force = (1 - pd / radius) * strength;
            p.vx += (pdx / pd) * force;
            p.vy += (pdy / pd) * force;
          }
        }
        p.vx *= 0.87;
        p.vy *= 0.87;
        p.x += p.vx;
        p.y += p.vy;

        const holdPulse =
          phase === "hold" ? 0.1 + 0.08 * Math.sin(t * 2 + p.x * 0.05) : 0;
        const alpha = Math.min(p.shade + holdPulse, 1);
        ctx!.beginPath();
        ctx!.fillStyle = `rgba(240,240,240,${alpha})`;
        ctx!.arc(p.x, p.y, p.size * dpr, 0, Math.PI * 2);
        ctx!.fill();
      });

      if (phase === "hold") {
        const fadeIn = Math.min(1, phaseT / 40);
        const fadeOut = Math.min(1, (CYCLE.hold - phaseT) / 40);
        const labelAlpha = Math.min(fadeIn, fadeOut) * 0.4;
        if (labelAlpha > 0.01) {
          ctx!.font = `${Math.round(13 * dpr)}px 'Space Mono', monospace`;
          ctx!.textAlign = "center";
          ctx!.textBaseline = "middle";
          ctx!.fillStyle = `rgba(240,240,240,${labelAlpha})`;
          ctx!.fillText(
            SHAPES[shapeIdx].label,
            W / 2,
            H / 2 + Math.min(W, H) * 0.28 * 0.62,
          );
        }
      }
    }
    frameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return <canvas id="funnel-canvas" ref={canvasRef}></canvas>;
}
