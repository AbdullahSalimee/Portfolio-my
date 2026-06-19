"use client";

import { useEffect, useRef } from "react";

export default function LineCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let W: number, H: number;
    let frameId: number;
    let t = 0;

    const ptr = { x: -1, y: -1, sx: -1, sy: -1, active: false };
    const onMove = (e: MouseEvent) => {
      const r = c!.getBoundingClientRect();
      ptr.x = (e.clientX - r.left) * dpr;
      ptr.y = (e.clientY - r.top) * dpr;
      ptr.active = true;
    };
    const onLeave = () => {
      ptr.active = false;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    // Cached offscreen sprites — rebuilt on resize
    let vignetteCanvas: HTMLCanvasElement | null = null;
    let nibGlowSprite: HTMLCanvasElement | null = null;

    function buildVignette() {
      vignetteCanvas = document.createElement("canvas");
      vignetteCanvas.width = W;
      vignetteCanvas.height = H;
      const vc = vignetteCanvas.getContext("2d")!;
      const g = vc.createRadialGradient(
        W / 2,
        H / 2,
        Math.min(W, H) * 0.18,
        W / 2,
        H / 2,
        Math.max(W, H) * 0.82,
      );
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(1, "rgba(0,0,0,0.6)");
      vc.fillStyle = g;
      vc.fillRect(0, 0, W, H);
    }

    function buildNibGlow() {
      const r = 22 * dpr;
      const size = Math.ceil(r * 2 + 4);
      nibGlowSprite = document.createElement("canvas");
      nibGlowSprite.width = size;
      nibGlowSprite.height = size;
      const nc = nibGlowSprite.getContext("2d")!;
      const g = nc.createRadialGradient(
        size / 2,
        size / 2,
        0,
        size / 2,
        size / 2,
        r,
      );
      g.addColorStop(0, "rgba(240,240,240,0.22)");
      g.addColorStop(1, "rgba(240,240,240,0)");
      nc.fillStyle = g;
      nc.arc(size / 2, size / 2, r, 0, Math.PI * 2);
      nc.fill();
    }

    type Step = {
      pts: { x: number; y: number }[];
      drawn: number;
      alpha: number;
      done: boolean;
    };

    type Construction = {
      steps: Step[];
      currentStep: number;
      phase: "drawing" | "holding" | "fading";
      holdTimer: number;
      buildFn: () => Step[];
    };

    let construction: Construction | null = null;
    let nibX = 0,
      nibY = 0;
    let nibTargetX = 0,
      nibTargetY = 0;

    function makeCircleSteps(
      cx: number,
      cy: number,
      r: number,
      segs = 90,
    ): Step[] {
      const pts: { x: number; y: number }[] = [];
      for (let i = 0; i <= segs; i++) {
        const a = (i / segs) * Math.PI * 2 - Math.PI / 2;
        pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
      }
      return [{ pts, drawn: 0, alpha: 1, done: false }];
    }

    function makeGridSteps(
      cx: number,
      cy: number,
      size: number,
      div: number,
    ): Step[] {
      const steps: Step[] = [];
      const half = size / 2;
      const step = size / div;
      for (let i = 0; i <= div; i++) {
        const y = cy - half + i * step;
        steps.push({
          pts: [
            { x: cx - half, y },
            { x: cx + half, y },
          ],
          drawn: 0,
          alpha: 1,
          done: false,
        });
      }
      for (let i = 0; i <= div; i++) {
        const x = cx - half + i * step;
        steps.push({
          pts: [
            { x, y: cy - half },
            { x, y: cy + half },
          ],
          drawn: 0,
          alpha: 1,
          done: false,
        });
      }
      return steps;
    }

    function makeConcentricSteps(cx: number, cy: number): Step[] {
      const steps: Step[] = [];
      const radii = [30, 60, 95, 135, 180].map((r) => r * dpr);
      radii.forEach((r) => {
        const pts: { x: number; y: number }[] = [];
        for (let i = 0; i <= 90; i++) {
          const a = (i / 90) * Math.PI * 2 - Math.PI / 2;
          pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
        }
        steps.push({ pts, drawn: 0, alpha: 1, done: false });
      });
      const reach = 190 * dpr;
      steps.push({
        pts: [
          { x: cx - reach, y: cy },
          { x: cx + reach, y: cy },
        ],
        drawn: 0,
        alpha: 1,
        done: false,
      });
      steps.push({
        pts: [
          { x: cx, y: cy - reach },
          { x: cx, y: cy + reach },
        ],
        drawn: 0,
        alpha: 1,
        done: false,
      });
      return steps;
    }

    function makeSpiralSteps(cx: number, cy: number): Step[] {
      const pts: { x: number; y: number }[] = [];
      const turns = 4,
        segs = 200;
      for (let i = 0; i <= segs; i++) {
        const u = i / segs;
        const a = u * Math.PI * 2 * turns - Math.PI / 2;
        const r = u * 160 * dpr;
        pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
      }
      return [{ pts, drawn: 0, alpha: 1, done: false }];
    }

    function makeTriangleWebSteps(cx: number, cy: number): Step[] {
      const steps: Step[] = [];
      const n = 6,
        R = 160 * dpr;
      const verts: { x: number; y: number }[] = [];
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        verts.push({ x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R });
      }
      steps.push({
        pts: [...verts, verts[0]],
        drawn: 0,
        alpha: 1,
        done: false,
      });
      for (let i = 0; i < n; i++) {
        for (let j = i + 2; j < n; j++) {
          steps.push({
            pts: [verts[i], verts[j]],
            drawn: 0,
            alpha: 1,
            done: false,
          });
        }
      }
      verts.forEach((v) => {
        steps.push({
          pts: [{ x: cx, y: cy }, v],
          drawn: 0,
          alpha: 1,
          done: false,
        });
      });
      return steps;
    }

    const builders = [
      () => makeConcentricSteps(W / 2, H / 2),
      () => makeGridSteps(W / 2, H / 2, Math.min(W, H) * 0.52, 6),
      () => makeSpiralSteps(W / 2, H / 2),
      () => makeTriangleWebSteps(W / 2, H / 2),
      () => makeCircleSteps(W / 2, H / 2, Math.min(W, H) * 0.3),
    ];
    let builderIdx = 0;

    function spawnConstruction() {
      const buildFn = builders[builderIdx % builders.length];
      builderIdx++;
      const steps = buildFn();
      nibTargetX = steps[0].pts[0].x;
      nibTargetY = steps[0].pts[0].y;
      nibX = nibTargetX;
      nibY = nibTargetY;
      construction = {
        steps,
        currentStep: 0,
        phase: "drawing",
        holdTimer: 0,
        buildFn,
      };
    }

    function resize() {
      W = c!.width = c!.offsetWidth * dpr;
      H = c!.height = c!.offsetHeight * dpr;
      buildVignette();
      buildNibGlow();
      construction = null;
      spawnConstruction();
    }

    const NIB_SPEED = 3.8;

    function updateConstruction() {
      if (!construction) return;
      const con = construction;
      if (con.phase === "drawing") {
        const step = con.steps[con.currentStep];
        if (!step) {
          con.phase = "holding";
          return;
        }
        const totalLen = step.pts.length - 1;
        step.drawn = Math.min(1, step.drawn + NIB_SPEED / (totalLen * 8));
        const tipIdx = Math.min(
          step.pts.length - 1,
          Math.floor(step.drawn * (step.pts.length - 1)),
        );
        nibTargetX = step.pts[tipIdx].x;
        nibTargetY = step.pts[tipIdx].y;
        if (step.drawn >= 1) {
          step.done = true;
          con.currentStep++;
          if (con.currentStep >= con.steps.length) {
            con.phase = "holding";
            con.holdTimer = 0;
          }
        }
      } else if (con.phase === "holding") {
        con.holdTimer++;
        if (con.holdTimer > 140) con.phase = "fading";
      } else if (con.phase === "fading") {
        let allGone = true;
        con.steps.forEach((s) => {
          s.alpha -= 0.008;
          if (s.alpha > 0) allGone = false;
        });
        if (allGone) spawnConstruction();
      }
    }

    function drawConstruction() {
      if (!construction) return;
      construction.steps.forEach((step) => {
        if (step.drawn <= 0 || step.alpha <= 0) return;
        const visibleEnd = Math.floor(step.drawn * (step.pts.length - 1));
        if (visibleEnd < 1) return;
        ctx!.beginPath();
        ctx!.moveTo(step.pts[0].x, step.pts[0].y);
        for (let i = 1; i <= visibleEnd; i++) {
          ctx!.lineTo(step.pts[i].x, step.pts[i].y);
        }
        ctx!.strokeStyle = `rgba(240,240,240,${step.alpha * 0.55})`;
        ctx!.lineWidth = 0.8 * dpr;
        ctx!.lineCap = "round";
        ctx!.lineJoin = "round";
        ctx!.stroke();
      });
    }

    function drawNib() {
      if (!construction || construction.phase === "fading") return;

      let nx = nibX,
        ny = nibY;
      if (ptr.active) {
        const dx = ptr.sx - nibX,
          dy = ptr.sy - nibY;
        const d = Math.hypot(dx, dy);
        const R = 180 * dpr;
        if (d < R) {
          const pull = (1 - d / R) ** 2 * 0.12;
          nx += dx * pull;
          ny += dy * pull;
        }
      }

      // Use cached glow sprite instead of creating gradient per frame
      if (nibGlowSprite) {
        const r = 22 * dpr;
        ctx!.drawImage(nibGlowSprite, nx - r - 2, ny - r - 2);
      }

      ctx!.beginPath();
      ctx!.arc(nx, ny, 6 * dpr, 0, Math.PI * 2);
      ctx!.strokeStyle = "rgba(240,240,240,0.18)";
      ctx!.lineWidth = 0.6 * dpr;
      ctx!.stroke();

      ctx!.beginPath();
      ctx!.arc(nx, ny, 2 * dpr, 0, Math.PI * 2);
      ctx!.fillStyle = "rgba(240,240,240,0.9)";
      ctx!.fill();
    }

    function drawVignette() {
      if (vignetteCanvas) ctx!.drawImage(vignetteCanvas, 0, 0);
    }

    let lastTime = 0;
    const FRAME_MS = 1000 / 60;

    function draw(now: number) {
      frameId = requestAnimationFrame(draw);
      const delta = now - lastTime;
      if (delta < FRAME_MS - 1) return;
      lastTime = now - (delta % FRAME_MS);

      ctx!.clearRect(0, 0, W, H);
      t += 0.01;

      ptr.sx += (ptr.x - ptr.sx) * 0.07;
      ptr.sy += (ptr.y - ptr.sy) * 0.07;
      nibX += (nibTargetX - nibX) * 0.14;
      nibY += (nibTargetY - nibY) * 0.14;

      updateConstruction();
      drawConstruction();
      drawNib();
      drawVignette();
    }

    resize();
    window.addEventListener("resize", resize);
    frameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return <canvas id="line-canvas" ref={canvasRef} />;
}
