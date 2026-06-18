"use client";

import { useEffect, useRef } from "react";

type Cell = {
  char: string;
  opacity: number;
  bright: boolean;
  col: number;
  row: number;
  falling: boolean;
  fx: number;
  fy: number;
  fvx: number;
  fvy: number;
  flife: number;
  fred: number;
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
    const COL_W = 14; // slightly wider — fewer columns = fewer draw calls
    const ROW_H = 18;
    const REVEAL_R = 48;
    const REVEAL_FADE = 32;
    const BURN_R = 38;

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

    const onMove = (e: MouseEvent) => {
      const r = c!.getBoundingClientRect();
      const x = e.clientX - r.left,
        y = e.clientY - r.top;
      mouseRef.current = { x, y, inside: x >= 0 && x <= W && y >= 0 && y <= H };
    };
    const onLeave = () => {
      mouseRef.current.inside = false;
    };
    document.addEventListener("mousemove", onMove);
    c.addEventListener("mouseleave", onLeave);

    function influence(px: number, py: number): number {
      if (!mouseRef.current.inside) return 1;
      const d = Math.hypot(px - mouseRef.current.x, py - mouseRef.current.y);
      if (d < REVEAL_R) return 0;
      if (d < REVEAL_R + REVEAL_FADE) return (d - REVEAL_R) / REVEAL_FADE;
      return 1;
    }

    let glitchAccum = 0;
    function glitch(dt: number) {
      glitchAccum += dt;
      if (glitchAccum > 80) {
        // less frequent
        glitchAccum = 0;
        const n = Math.floor(cells.length * 0.008);
        for (let k = 0; k < n; k++) {
          const cell = cells[Math.floor(Math.random() * cells.length)];
          if (!cell.falling) cell.char = randChar();
        }
      }
    }

    function detachCell(cell: Cell, px: number, py: number) {
      if (cell.falling) return;
      cell.falling = true;
      cell.fx = px;
      cell.fy = py;
      const mx = mouseRef.current.x,
        my = mouseRef.current.y;
      const dx = px - mx,
        dy = py - my;
      const d = Math.hypot(dx, dy) || 1;
      const spd = 1.5 + Math.random() * 2.5;
      cell.fvx = (dx / d) * spd + (Math.random() - 0.5) * 1.5;
      cell.fvy = (dy / d) * spd - Math.random() * 2.0;
      cell.flife = 1;
      cell.fred = 1;
    }

    let lastT = 0,
      frameId: number;
    const GRAVITY = 0.22;

    // Reusable bucket arrays for batching draws by style
    // We batch: bright cells, dim cells (by opacity bucket), falling cells
    const brightCells: Cell[] = [];
    const dimCells: Cell[] = [];

    function frame(now: number) {
      const dt = Math.min(now - lastT, 32);
      lastT = now;

      ctx.clearRect(0, 0, W, H);
      ctx.font = `${FONT_SIZE}px 'Space Mono', monospace`;
      ctx.textBaseline = "top";

      glitch(dt);

      const mx = mouseRef.current.x,
        my = mouseRef.current.y;
      const inside = mouseRef.current.inside;

      // Update columns
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

          if (inside && cell.opacity > 0.05) {
            const px = col * COL_W + COL_W * 0.5;
            const py = row * ROW_H + ROW_H * 0.5;
            if (Math.hypot(px - mx, py - my) < BURN_R)
              detachCell(cell, col * COL_W, row * ROW_H);
          }
        }
      }

      // --- BATCHED DRAW: sort into bright vs dim, then draw each group with one fillStyle ---
      brightCells.length = 0;
      dimCells.length = 0;

      for (let col = 0; col < COLS; col++) {
        const px = col * COL_W + 1;
        const start = col * ROWS;
        for (let row = 0; row < ROWS; row++) {
          const cell = cells[start + row];
          if (cell.falling || cell.opacity < 0.008) continue;
          const py = row * ROW_H;
          const inf = influence(px + COL_W * 0.5, py + ROW_H * 0.5);
          const a = cell.opacity * inf;
          if (a < 0.008) continue;
          if (cell.bright) brightCells.push(cell);
          else dimCells.push(cell);
        }
      }

      // Draw bright cells
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.globalAlpha = 1;
      for (const cell of brightCells) {
        const px = cell.col * COL_W + 1;
        const py = cell.row * ROW_H;
        const inf = influence(px + COL_W * 0.5, py + ROW_H * 0.5);
        ctx.globalAlpha = inf * 0.92;
        ctx.fillText(cell.char, px, py);
      }

      // Draw dim cells — group by rounded opacity to minimize fillStyle thrash
      // Sort by opacity bucket (4 buckets) so we set fillStyle less often
      dimCells.sort((a, b) => (a.opacity > b.opacity ? -1 : 1));
      let lastBucket = -1;
      for (const cell of dimCells) {
        const px = cell.col * COL_W + 1;
        const py = cell.row * ROW_H;
        const inf = influence(px + COL_W * 0.5, py + ROW_H * 0.5);
        const a = cell.opacity * inf;
        // Bucket opacity into 5 bands to reduce fillStyle changes
        const bucket = Math.round(a * 4);
        if (bucket !== lastBucket) {
          const v = Math.floor(140 + (bucket / 4) * 80);
          ctx.fillStyle = `rgb(${v},${v},${v})`;
          ctx.globalAlpha = 0.62;
          lastBucket = bucket;
        }
        ctx.fillText(cell.char, px, py);
      }
      ctx.globalAlpha = 1;

      // Falling cells
      for (const cell of cells) {
        if (!cell.falling) continue;
        cell.fvy += (GRAVITY * dt) / 16;
        cell.fvx *= 0.992;
        cell.fx += (cell.fvx * dt) / 16;
        cell.fy += (cell.fvy * dt) / 16;
        cell.flife -= dt * 0.018;
        cell.fred -= dt * 0.008;
        if (cell.flife <= 0 || cell.fy > H + 40) {
          cell.falling = false;
          cell.opacity = 0;
          cell.bright = false;
          cell.fred = 0;
          cell.char = randChar();
          continue;
        }
        const e = cell.flife * cell.flife;
        const red = Math.max(0, cell.fred);
        ctx.fillStyle = `rgba(${Math.floor(220 + red * 35)},${Math.floor(30 + (1 - red) * 180)},${Math.floor(30 + (1 - red) * 180)},${(e * 0.88).toFixed(2)})`;
        ctx.fillText(cell.char, cell.fx, cell.fy);
      }

      // Cursor
      if (inside) {
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(mx, my, REVEAL_R, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(240,240,240,0.18)";
        ctx.lineWidth = 0.7;
        ctx.stroke();

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
