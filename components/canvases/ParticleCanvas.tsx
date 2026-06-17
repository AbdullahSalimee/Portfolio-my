"use client";

import { useEffect, useRef } from "react";

type Point = {
  x: number;
  y: number;
  bx: number;
  by: number;
  a: number;
  r: number;
  speed: number;
  size: number;
  life: number;
};

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    let W: number, H: number;
    const pts: Point[] = [];

    function resize() {
      W = c!.width = c!.offsetWidth;
      H = c!.height = c!.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 280; i++) {
      const a = Math.random() * Math.PI * 2,
        r = 160 + Math.random() * 100;
      pts.push({
        x: 0,
        y: 0,
        bx: Math.cos(a) * r,
        by: Math.sin(a) * r,
        a,
        r,
        speed: 0.002 + Math.random() * 0.002,
        size: 0.5 + Math.random() * 1.2,
        life: Math.random() * Math.PI * 2,
      });
    }

    const S = 28;
    const cube: [number, number, number][] = [
      [-S, -S, -S],
      [S, -S, -S],
      [S, S, -S],
      [-S, S, -S],
      [-S, -S, S],
      [S, -S, S],
      [S, S, S],
      [-S, S, S],
    ];
    const edges = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 4],
      [0, 4],
      [1, 5],
      [2, 6],
      [3, 7],
    ];
    let rot = 0;

    function proj([x, y, z]: [number, number, number]): [number, number] {
      const f = 300 / (300 + z * 0.3 + 200);
      return [W / 2 + x * f, H / 2 + y * f];
    }
    function rotY(p: [number, number, number], a: number): [number, number, number] {
      return [
        p[0] * Math.cos(a) - p[2] * Math.sin(a),
        p[1],
        p[0] * Math.sin(a) + p[2] * Math.cos(a),
      ];
    }

    let frameId: number;

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      const cx = W / 2,
        cy = H / 2;
      rot += 0.006;

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.a += p.speed;
        p.life += 0.02;
        p.x = cx + Math.cos(p.a) * p.r;
        p.y = cy + Math.sin(p.a) * p.r * 0.35;
        const alpha = 0.3 + 0.4 * Math.sin(p.life);
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(240,240,240,${alpha})`;
        ctx!.fill();
      }

      const verts = cube.map((v) => proj(rotY(v, rot)));
      ctx!.strokeStyle = "rgba(240,240,240,0.7)";
      ctx!.lineWidth = 0.8;
      edges.forEach(([a, b]) => {
        ctx!.beginPath();
        ctx!.moveTo(verts[a][0], verts[a][1]);
        ctx!.lineTo(verts[b][0], verts[b][1]);
        ctx!.stroke();
      });

      ctx!.strokeStyle = "rgba(240,240,240,0.3)";
      ctx!.lineWidth = 0.5;
      ctx!.beginPath();
      ctx!.moveTo(cx - 200, cy);
      ctx!.lineTo(cx + 200, cy);
      ctx!.stroke();
      ctx!.beginPath();
      ctx!.moveTo(cx, cy - 10);
      ctx!.lineTo(cx, cy + 10);
      ctx!.stroke();
      ctx!.beginPath();
      ctx!.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx!.fillStyle = "rgba(240,240,240,0.6)";
      ctx!.fill();

      frameId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return <canvas id="particle-canvas" ref={canvasRef}></canvas>;
}
