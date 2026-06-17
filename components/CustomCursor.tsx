"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cur = cursorRef.current;
    const ring = ringRef.current;
    if (!cur || !ring) return;

    let mx = 0,
      my = 0,
      rx = 0,
      ry = 0;
    let frameId: number;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      cur.style.left = mx + "px";
      cur.style.top = my + "px";
    };

    function animRing() {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      if (ring) {
        ring.style.left = rx + "px";
        ring.style.top = ry + "px";
      }
      frameId = requestAnimationFrame(animRing);
    }

    document.addEventListener("mousemove", onMove);
    frameId = requestAnimationFrame(animRing);

    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <>
      <div id="cursor" ref={cursorRef}></div>
      <div id="cursor-ring" ref={ringRef}></div>
    </>
  );
}
