"use client";

import { useEffect, useRef } from "react";

type Cell = {
  char: string;
  opacity: number;
  bright: boolean;
  col: number;
  row: number;
  // falling state
  falling: boolean;
  fx: number; // world x when detached
  fy: number; // world y when detached
  fvx: number;
  fvy: number;
  flife: number; // 1→0
  fred: number; // red intensity 0→1
};

type Column = {
  headY: number;
  speed: number;
  active: boolean;
  pauseT: number;
};

export default function LineCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999, inside: false });

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;

    let W = 0,
      H = 0;

    const FONT_SIZE = 12;
    const COL_W = 11;
    const ROW_H = 17;
    const REVEAL_R = 48; // hard inner radius — no circle shown until mouse enters
    const REVEAL_FADE = 32;
    const BURN_R = 38; // chars inside this get red + fall

    let COLS = 0,
      ROWS = 0;
    let cells: Cell[] = [];
    let columns: Column[] = [];

    const CHARS =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const CODE_CHARS = "{}[]()<>/\\|;:=+-*&^%$#@!01∑∆∏√≠≈";

    function randChar() {
      const pool = Math.random() < 0.32 ? CODE_CHARS : CHARS;
      return pool[Math.floor(Math.random() * pool.length)];
    }

    function build() {
      COLS = Math.ceil(W / COL_W);
      ROWS = Math.ceil(H / ROW_H) + 3;
      cells = [];
      columns = [];
      for (let col = 0; col < COLS; col++) {
        columns.push({
          headY: -(Math.random() * H),
          speed: 48 + Math.random() * 72,
          active: Math.random() > 0.38,
          pauseT: Math.random() * 3500,
        });
        for (let row = 0; row < ROWS; row++) {
          cells.push({
            char: randChar(),
            opacity: 0,
            bright: false,
            col,
            row,
            falling: false,
            fx: 0,
            fy: 0,
            fvx: 0,
            fvy: 0,
            flife: 0,
            fred: 0,
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

    // ── Mouse — document level, only mark inside when over canvas ─
    const onMove = (e: MouseEvent) => {
      const r = c!.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      mouseRef.current = { x, y, inside: x >= 0 && x <= W && y >= 0 && y <= H };
    };
    const onLeave = () => {
      mouseRef.current.inside = false;
    };
    document.addEventListener("mousemove", onMove);
    c.addEventListener("mouseleave", onLeave);

    // ── Influence: 1 = full noise, 0 = erased ────────────────────
    function influence(px: number, py: number): number {
      if (!mouseRef.current.inside) return 1;
      const d = Math.sqrt(
        (px - mouseRef.current.x) ** 2 + (py - mouseRef.current.y) ** 2,
      );
      if (d < REVEAL_R) return 0;
      if (d < REVEAL_R + REVEAL_FADE) return (d - REVEAL_R) / REVEAL_FADE;
      return 1;
    }

    // ── Glitch ────────────────────────────────────────────────────
    let glitchAccum = 0;
    function glitch(dt: number) {
      glitchAccum += dt;
      if (glitchAccum > 55) {
        glitchAccum = 0;
        const n = Math.floor(cells.length * 0.012);
        for (let k = 0; k < n; k++) {
          const cell = cells[Math.floor(Math.random() * cells.length)];
          if (!cell.falling) cell.char = randChar();
        }
      }
    }

    // ── Detach a cell — it falls under gravity ────────────────────
    function detachCell(cell: Cell, px: number, py: number) {
      if (cell.falling) return;
      cell.falling = true;
      cell.fx = px;
      cell.fy = py;
      // burst outward from cursor + random
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const dx = px - mx;
      const dy = py - my;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const spd = 1.5 + Math.random() * 2.5;
      cell.fvx = (dx / d) * spd + (Math.random() - 0.5) * 1.5;
      cell.fvy = (dy / d) * spd - Math.random() * 2.0;
      cell.flife = 1;
      cell.fred = 1;
    }

    // ── Render loop ───────────────────────────────────────────────
    let lastT = 0,
      frameId: number;
    const GRAVITY = 0.22;

    function frame(now: number) {
      const dt = Math.min(now - lastT, 32);
      lastT = now;

      ctx.clearRect(0, 0, W, H);
      ctx.font = `${FONT_SIZE}px 'Space Mono', monospace`;
      ctx.textBaseline = "top";

      glitch(dt);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const inside = mouseRef.current.inside;

      // ── Update columns ──────────────────────────────────────────
      for (let col = 0; col < COLS; col++) {
        const column = columns[col];

        if (!column.active) {
          column.pauseT -= dt;
          if (column.pauseT <= 0) {
            column.active = true;
            column.headY = -ROW_H * 2;
            column.speed = 48 + Math.random() * 72;
          }
          continue;
        }

        column.headY += (column.speed * dt) / 1000;
        if (column.headY > H + ROW_H * 3) {
          column.active = false;
          column.pauseT = 400 + Math.random() * 3000;
        }

        const trailLen = H * 0.52;
        const start = col * ROWS;

        for (let row = 0; row < ROWS; row++) {
          const cell = cells[start + row];
          if (cell.falling) continue;

          const cellY = row * ROW_H;
          const dist = column.headY - cellY;

          if (dist < 0) {
            cell.opacity = 0;
            cell.bright = false;
          } else if (dist < ROW_H * 1.2) {
            cell.opacity = 1;
            cell.bright = true;
          } else {
            cell.opacity = Math.max(0, 1 - dist / trailLen) * 0.5;
            cell.bright = false;
          }

          // Check burn zone — detach if inside cursor radius
          if (inside && cell.opacity > 0.05) {
            const px = col * COL_W + COL_W * 0.5;
            const py = row * ROW_H + ROW_H * 0.5;
            const d = Math.sqrt((px - mx) ** 2 + (py - my) ** 2);
            if (d < BURN_R) {
              detachCell(cell, col * COL_W, row * ROW_H);
            }
          }
        }
      }

      // ── Draw static cells ───────────────────────────────────────
      for (let col = 0; col < COLS; col++) {
        const start = col * ROWS;
        const px = col * COL_W + 1;

        for (let row = 0; row < ROWS; row++) {
          const cell = cells[start + row];
          if (cell.falling || cell.opacity < 0.008) continue;

          const py = row * ROW_H;
          const inf = influence(px + COL_W * 0.5, py + ROW_H * 0.5);
          const a = cell.opacity * inf;
          if (a < 0.008) continue;

          if (cell.bright) {
            ctx.fillStyle = `rgba(255,255,255,${(a * 0.92).toFixed(3)})`;
          } else {
            const v = Math.floor(180 + cell.opacity * 60);
            ctx.fillStyle = `rgba(${v},${v},${v},${(a * 0.62).toFixed(3)})`;
          }
          ctx.fillText(cell.char, px, py);
        }
      }

      // ── Draw + physics for falling cells ────────────────────────
      for (const cell of cells) {
        if (!cell.falling) continue;

        cell.fvy += (GRAVITY * dt) / 16;
        cell.fvx *= 0.992;
        cell.fx += (cell.fvx * dt) / 16;
        cell.fy += (cell.fvy * dt) / 16;
        cell.flife -= dt * 0.018;
        cell.fred -= dt * 0.008;

        if (cell.flife <= 0 || cell.fy > H + 40) {
          // Respawn as a fresh static cell
          cell.falling = false;
          cell.opacity = 0;
          cell.bright = false;
          cell.fred = 0;
          cell.char = randChar();
          continue;
        }

        const e = cell.flife * cell.flife;
        const red = Math.max(0, cell.fred);
        const r = Math.floor(220 + red * 35);
        const g = Math.floor(30 + (1 - red) * 180);
        const b = Math.floor(30 + (1 - red) * 180);
        const a = e * 0.88;

        ctx.fillStyle = `rgba(${r},${g},${b},${a.toFixed(3)})`;
        ctx.fillText(cell.char, cell.fx, cell.fy);
      }

      // ── Cursor — only draw ring if inside ──────────────────────
      if (inside) {
        // Inner boundary ring
        ctx.beginPath();
        ctx.arc(mx, my, REVEAL_R, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(240,240,240,0.18)";
        ctx.lineWidth = 0.7;
        ctx.stroke();

        // Crosshair — gapped arms
        const ARM = 10,
          GAP = 5;
        ctx.strokeStyle = "rgba(240,240,240,0.32)";
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(mx - ARM - GAP, my);
        ctx.lineTo(mx - GAP, my);
        ctx.moveTo(mx + GAP, my);
        ctx.lineTo(mx + ARM + GAP, my);
        ctx.moveTo(mx, my - ARM - GAP);
        ctx.lineTo(mx, my - GAP);
        ctx.moveTo(mx, my + GAP);
        ctx.lineTo(mx, my + ARM + GAP);
        ctx.stroke();

        // Center dot
        ctx.beginPath();
        ctx.arc(mx, my, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.fill();
      }

      frameId = requestAnimationFrame(frame);
    }

    frameId = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("mousemove", onMove);
      c!.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <canvas
      id="line-canvas"
      ref={canvasRef}
      style={{ pointerEvents: "auto", cursor: "none" }}
    />
  );
}
