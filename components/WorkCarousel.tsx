"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── All carousel items ───────────────────────────────────────────────────────

type CardItem = {
  id: string;
  type: "job" | "github" | "workflow";
  index: number; // for display numbering
  title: string;
  subtitle: string;
  meta: string;
  desc: string;
  skills: string[];
  Githuburl?: string;
  url?: string;
  workflowData?: { nodes: WFNode[]; edges: WFEdge[] };
};

type WFNode = { id: string; label: string; kind: string; x: number; y: number };
type WFEdge = { from: string; to: string };

const CARDS: CardItem[] = [
  // ── GITHUB ────────────────────────────────────────────────────────────────
  {
    id: "gh-1",
    type: "github",
    index: 5,
    title: "Deskcon Engineering",
    subtitle: "github.com",
    meta: "SvelteKit · CSS · JS",
    desc: "The Deskcon-engeenering-site is a web project designed to serve as the online presence for an engineering firm or related professional service. The primary purpose, as stated in the repository, is to create an Engineering website.The project is built using Svelte.",
    skills: [
      "Svelte",
      "Vite",
      "TypeScript",
      "JavaScript",
      "CSS3",
      "npm",
      "ESLint",
      "Prettier",
    ],
    Githuburl: "https://github.com/AbdullahSalimee/Deskcon-engeenering-site",
    url: "https://deskcon.vercel.app/",
  },

  {
    id: "gh-2",
    type: "github",
    index: 7,
    title: "Themic",
    subtitle: "github.com",
    meta: "React · JavaScript · CSS",
    desc: "Themic is a powerful React + Vite theme design studio that streamlines the process of visual customization and deployment. It provides an intuitive interface for building, styling, and managing custom themes with real-time preview capabilities. The tool is built with modern frontend technologies and supports easy deployment to platforms like Vercel, Netlify, and GitHub Pages.",
    skills: ["React", "Vite", "JavaScript", "CSS3", "HTML5", "Tailwind CSS"],
    Githuburl: "https://github.com/AbdullahSalimee/Themic",
    url: "https://theme-studio-topaz.vercel.app/",
  },
  {
    id: "gh-3",
    type: "github",
    index: 8,
    title: "Graphix",
    subtitle: "github.com",
    meta: "Next.js · TypeScript · Tailwind CSS",
    desc: "Graphix is a modern, interactive graph visualization and creation tool built with Next.js that transforms ideas into stunning, high-performance graphs with AI magic. It features an intuitive drag-and-drop canvas for creating nodes and edges, real-time graph manipulation, multiple layout algorithms (force-directed, circular, grid), and comprehensive customization options for node colors, sizes, labels, and styles. ",
    skills: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "React",
      "JavaScript",
      "CSS3",
      "HTML5",
      "Ploty.js",
    ],
    Githuburl: "https://github.com/AbdullahSalimee/graphix",
    url: "https://graphix.devlinesolutions.com/",
  },
  {
    id: "gh-4",
    type: "github",
    index: 9,
    title: "Taste",
    subtitle: "github.com",
    meta: "Next.js · TypeScript · Tailwind CSS",
    desc: "Taste is a modern, full-stack web application built with Next.js that helps users discover and explore culinary experiences. The platform leverages the power of Next.js App Router, TypeScript for type safety, and Tailwind CSS for beautiful, responsive styling. While the specific features are still being developed",
    skills: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "React",
      "JavaScript",
      "CSS3",
      "HTML5",
      "TMDB",
    ],
    url: "https://taste-jade.vercel.app/",
    Githuburl: "https://github.com/AbdullahSalimee/Taste",
  },
  {
    id: "gh-5",
    type: "github",
    index: 10,
    title: "Academy Management System",
    subtitle: "github.com",
    meta: "Next.js · TypeScript · Supabase",
    desc: "Academy1 is a comprehensive, full-stack academy management system built with Next.js 14, TypeScript, Tailwind CSS, and Supabase. It streamlines the complete administrative workflow for educational institutions, including student admissions, attendance tracking, fee management, test creation, and result analysis. ",
    skills: [
      "Next.js",
      "TypeScript",
      "Supabase",
      "Tailwind CSS",
      "React",
      "JavaScript",
      "PostgreSQL",
      "CSS3",
    ],
    Githuburl: "https://github.com/AbdullahSalimee/academy1",
    url: "https://ams-ruddy-five.vercel.app/",
  },
  {
    id: "gh-6",
    type: "github",
    index: 9,
    title: "Taste — Food App",
    subtitle: "Collab · github.com",
    meta: "SvelteKit · CSS · JS",
    desc: "Food discovery and recipe app built collaboratively. Appetizing UI with smooth interactions and a mobile-first design.",
    skills: ["Svelte", "SvelteKit", "CSS3", "JavaScript"],
    Githuburl: "https://github.com/furqanahmed1872/taste",
  },

  // ── JOBS ──────────────────────────────────────────────────────────────────
  {
    id: "job-1",
    type: "job",
    index: 1,
    title: "AI Workflow Engineer",
    subtitle: "Freelance",
    meta: "2024 – Present",
    desc: "Built end-to-end AI automation workflows connecting LLMs to Supabase. Designed multi-step agent systems and shipped real-time Next.js dashboards.",
    skills: [
      "n8n",
      "Next.js",
      "Supabase",
      "OpenAI API",
      "Tailwind CSS",
      "shadcn/ui",
      "TypeScript",
    ],
  },
  {
    id: "job-2",
    type: "job",
    index: 2,
    title: "Frontend Developer",
    subtitle: "Project-based",
    meta: "2023 – 2024",
    desc: "Pixel-perfect UI from Figma designs in React & Svelte. Complex data-driven interfaces, reusable component libraries, REST & GraphQL APIs.",
    skills: [
      "React",
      "Svelte",
      "Figma",
      "CSS",
      "shadcn/ui",
      "REST APIs",
      "Tailwind CSS",
      "Framer Motion",
    ],
  },
  {
    id: "job-3",
    type: "job",
    index: 3,
    title: "AI Agent Developer",
    subtitle: "Self-initiated",
    meta: "2023 – Present",
    desc: "Multi-agent systems with tool calling & memory. Agentic RAG pipelines, local LLM fine-tuning, browser automation integrated into AI pipelines.",
    skills: [
      "AI Agents",
      "LangChain",
      "Supabase",
      "Python",
      "Node.js",
      "Vector DBs",
      "n8n",
      "OpenAI",
    ],
  },
  {
    id: "job-4",
    type: "job",
    index: 4,
    title: "Systems & UI Generalist",
    subtitle: "Various Clients",
    meta: "2022 – 2023",
    desc: "Full-stack Next.js + Express apps with maintainable architecture. Complex UIs with Tailwind & custom CSS, webhook-driven event systems.",
    skills: [
      "Next.js",
      "Express",
      "Node.js",
      "HTML/CSS",
      "JavaScript",
      "C++",
      "Git",
      "Figma",
    ],
  },
  // ── WORKFLOWS ─────────────────────────────────────────────────────────────
  {
    id: "wf-1",
    type: "workflow",
    index: 10,
    title: "HeyGen Video Generator",
    subtitle: "n8n Automation",
    meta: "HeyGen API · Polling Loop",
    desc: "Automates AI talking-avatar video creation. Takes a script, fires HeyGen, polls for completion, then stores the final video GithubURL — all without human touch.",
    skills: ["n8n", "HeyGen API", "HTTP Request", "Loop", "Wait"],
    workflowData: {
      nodes: [
        { id: "loop", label: "Loop Items", kind: "loop", x: 60, y: 90 },
        { id: "gen", label: "Generate Video", kind: "http", x: 220, y: 90 },
        { id: "wait1", label: "Wait 60s", kind: "wait", x: 380, y: 90 },
        { id: "status", label: "Check Status", kind: "http", x: 540, y: 90 },
        { id: "if", label: "Completed?", kind: "if", x: 700, y: 90 },
        { id: "setV", label: "Set Video Data", kind: "set", x: 860, y: 50 },
        { id: "wait2", label: "Wait 10s", kind: "wait", x: 700, y: 180 },
      ],
      edges: [
        { from: "loop", to: "gen" },
        { from: "gen", to: "wait1" },
        { from: "wait1", to: "status" },
        { from: "status", to: "if" },
        { from: "if", to: "setV" },
        { from: "if", to: "wait2" },
        { from: "wait2", to: "status" },
      ],
    },
  },
  {
    id: "wf-2",
    type: "workflow",
    index: 11,
    title: "AI Content Pipeline",
    subtitle: "n8n Automation",
    meta: "GPT-4.1 · HeyGen · Google",
    desc: "Full content factory: reads keywords from Sheets → GPT-4 writes 20 location scripts → HeyGen renders avatar videos for each → Drive upload. Runs fully unattended.",
    skills: [
      "n8n",
      "OpenAI GPT-4.1",
      "HeyGen",
      "Google Sheets",
      "Google Drive",
      "LangChain",
    ],
    workflowData: {
      nodes: [
        { id: "trig", label: "Trigger", kind: "trigger", x: 40, y: 100 },
        { id: "sheets", label: "Get Keywords", kind: "sheets", x: 180, y: 100 },
        { id: "edit", label: "Edit Fields", kind: "set", x: 320, y: 100 },
        { id: "code2", label: "Take First", kind: "code", x: 460, y: 100 },
        { id: "agent", label: "AI Agent", kind: "agent", x: 600, y: 100 },
        { id: "llm", label: "GPT-4.1-mini", kind: "llm", x: 600, y: 210 },
        { id: "parse", label: "Parse Scripts", kind: "code", x: 750, y: 60 },
        { id: "flat", label: "Flatten", kind: "code", x: 750, y: 160 },
        { id: "updSh", label: "Update Sheet", kind: "sheets", x: 900, y: 160 },
        { id: "store", label: "Store Keyword", kind: "set", x: 900, y: 60 },
        { id: "sloop", label: "Script Loop", kind: "loop", x: 1040, y: 60 },
        { id: "markU", label: "Mark Used", kind: "sheets", x: 1180, y: 20 },
        { id: "httpG", label: "Gen Video", kind: "http", x: 1180, y: 90 },
        { id: "wait", label: "Wait 1s", kind: "wait", x: 1320, y: 90 },
        { id: "check", label: "Check Status", kind: "http", x: 1460, y: 90 },
        { id: "done", label: "Completed?", kind: "if", x: 1600, y: 90 },
        { id: "setV", label: "Set Video", kind: "set", x: 1740, y: 50 },
        { id: "wait2", label: "Wait 10s", kind: "wait", x: 1600, y: 180 },
        { id: "dl", label: "Download", kind: "http", x: 1880, y: 50 },
        { id: "drive", label: "Upload Drive", kind: "drive", x: 2020, y: 50 },
      ],
      edges: [
        { from: "trig", to: "sheets" },
        { from: "sheets", to: "edit" },
        { from: "edit", to: "code2" },
        { from: "code2", to: "agent" },
        { from: "llm", to: "agent" },
        { from: "agent", to: "parse" },
        { from: "agent", to: "flat" },
        { from: "flat", to: "updSh" },
        { from: "parse", to: "store" },
        { from: "store", to: "sloop" },
        { from: "sloop", to: "markU" },
        { from: "sloop", to: "httpG" },
        { from: "httpG", to: "wait" },
        { from: "wait", to: "check" },
        { from: "check", to: "done" },
        { from: "done", to: "setV" },
        { from: "done", to: "wait2" },
        { from: "wait2", to: "check" },
        { from: "setV", to: "dl" },
        { from: "dl", to: "drive" },
        { from: "drive", to: "sloop" },
      ],
    },
  },
];

// ─── Node colours ─────────────────────────────────────────────────────────────
const NODE_COLORS: Record<string, string> = {
  trigger: "#e07b39",
  http: "#4a9eff",
  wait: "#6b7280",
  if: "#c084fc",
  set: "#34d399",
  loop: "#facc15",
  code: "#60a5fa",
  agent: "#f472b6",
  llm: "#fb923c",
  sheets: "#34d399",
  drive: "#4ade80",
};
const NODE_ICONS: Record<string, string> = {
  trigger: "▶",
  http: "↗",
  wait: "⏱",
  if: "◇",
  set: "✎",
  loop: "⟳",
  code: "</>",
  agent: "✦",
  llm: "◉",
  sheets: "▤",
  drive: "☁",
};

// ─── responsive helper ────────────────────────────────────────────────────────
function useIsMobile(breakpoint = 720) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isMobile;
}

// ─── Skill bubbles canvas ─────────────────────────────────────────────────────
function SkillBubblesCanvas({
  skills,
  seed,
}: {
  skills: string[];
  seed: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    c.width = c.offsetWidth;
    c.height = c.offsetHeight;
    const W = c.width,
      H = c.height;

    // seed-deterministic initial placement
    function seededRand(s: number) {
      const x = Math.sin(s + seed) * 10000;
      return x - Math.floor(x);
    }

    type Bubble = {
      label: string;
      x: number;
      y: number;
      r: number;
      vx: number;
      vy: number;
      phase: number;
      hue: number;
    };

    // scale bubble radius down a touch on small canvases so labels still fit
    const sizeScale = Math.min(1, Math.max(0.62, W / 360));

    const bubbles: Bubble[] = skills.map((s, i) => {
      const angle = (i / skills.length) * Math.PI * 2 - Math.PI / 2;
      const dist = (80 + seededRand(i * 3 + 1) * 60) * sizeScale;
      return {
        label: s,
        x: W / 2 + Math.cos(angle) * dist,
        y: H / 2 + Math.sin(angle) * dist * 0.75,
        r: (26 + seededRand(i * 7 + 2) * 18) * sizeScale,
        vx: (seededRand(i * 11) - 0.5) * 0.4,
        vy: (seededRand(i * 13) - 0.5) * 0.4,
        phase: seededRand(i * 5) * Math.PI * 2,
        hue: Math.round(seededRand(i * 17) * 60),
      };
    });

    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.012;

      bubbles.forEach((b) => {
        b.x += b.vx + Math.sin(t * 0.7 + b.phase) * 0.15;
        b.y += b.vy + Math.cos(t * 0.5 + b.phase) * 0.12;
        if (b.x - b.r < 8 || b.x + b.r > W - 8) b.vx *= -1;
        if (b.y - b.r < 8 || b.y + b.r > H - 8) b.vy *= -1;

        const pulse = 0.85 + 0.15 * Math.sin(t * 1.2 + b.phase);
        const r = b.r * pulse;

        // glow
        const grd = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r * 1.8);
        grd.addColorStop(0, `rgba(240,240,240,0.06)`);
        grd.addColorStop(1, `rgba(240,240,240,0)`);
        ctx.beginPath();
        ctx.arc(b.x, b.y, r * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // bubble
        ctx.beginPath();
        ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240,240,240,0.07)`;
        ctx.strokeStyle = `rgba(240,240,240,${0.18 * pulse})`;
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();

        // label
        const fs = Math.max(8, r * 0.38);
        ctx.font = `600 ${fs}px 'Space Grotesk', sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = `rgba(240,240,240,${0.7 * pulse})`;
        const maxChars = Math.floor(r * 0.22);
        ctx.fillText(
          b.label.length > maxChars
            ? b.label.slice(0, maxChars) + "…"
            : b.label,
          b.x,
          b.y,
        );
      });

      animRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [skills, seed]);

  return (
    <canvas
      ref={ref}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}

// ─── n8n Flow Renderer ────────────────────────────────────────────────────────
function WorkflowDiagram({
  data,
  isMobile,
}: {
  data: { nodes: WFNode[]; edges: WFEdge[] };
  isMobile?: boolean;
}) {
  const [hov, setHov] = useState<string | null>(null);
  const NW = 112,
    NH = 40,
    PAD = 24;
  const xs = data.nodes.map((n) => n.x);
  const ys = data.nodes.map((n) => n.y);
  const minX = Math.min(...xs) - PAD;
  const minY = Math.min(...ys) - PAD;
  const vw = Math.max(...xs) + NW + PAD - minX;
  const vh = Math.max(...ys) + NH + PAD - minY;

  // On mobile, render at a fixed shorter pixel height (same viewBox, so the
  // diagram scales down as a whole) and let the wrapper handle horizontal scroll.
  const renderHeight = isMobile ? Math.min(vh, 260) : vh;
  const renderWidth = isMobile ? (vw * renderHeight) / vh : vw;

  function getNode(id: string) {
    return data.nodes.find((n) => n.id === id);
  }

  return (
    <div
      className="wf-scroll"
      style={{ width: "100%", overflow: "auto", flex: 1 }}
    >
      <svg
        viewBox={`0 0 ${vw} ${vh}`}
        width={renderWidth}
        height={renderHeight}
        style={{ display: "block" }}
      >
        <defs>
          <pattern
            id="wfdots"
            width={20}
            height={20}
            patternUnits="userSpaceOnUse"
          >
            <circle cx={1} cy={1} r={0.7} fill="rgba(240,240,240,0.05)" />
          </pattern>
          <marker
            id="arr"
            markerWidth={6}
            markerHeight={6}
            refX={5}
            refY={3}
            orient="auto"
          >
            <path d="M0,0 L0,6 L6,3 z" fill="rgba(240,240,240,0.3)" />
          </marker>
        </defs>
        <rect width={vw} height={vh} fill="url(#wfdots)" />

        {data.edges.map((e, i) => {
          const f = getNode(e.from),
            t = getNode(e.to);
          if (!f || !t) return null;
          const isLLM = e.from === "llm";
          const x1 = isLLM ? f.x - minX + NW / 2 : f.x - minX + NW;
          const y1 = isLLM ? f.y - minY : f.y - minY + NH / 2;
          const x2 = isLLM ? t.x - minX + NW / 2 : t.x - minX;
          const y2 = isLLM ? t.y - minY + NH : t.y - minY + NH / 2;
          const active = hov === e.from || hov === e.to;
          const mx = (x1 + x2) / 2;

          return (
            <path
              key={i}
              d={
                isLLM
                  ? `M${x1},${y1} C${x1},${(y1 + y2) / 2} ${x2},${(y1 + y2) / 2} ${x2},${y2}`
                  : `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`
              }
              fill="none"
              stroke={
                active ? "rgba(240,240,240,0.55)" : "rgba(240,240,240,0.18)"
              }
              strokeWidth={active ? 1.8 : 1}
              markerEnd="url(#arr)"
              strokeDasharray={isLLM ? "4 3" : undefined}
            />
          );
        })}

        {data.nodes.map((n) => {
          const nx = n.x - minX,
            ny = n.y - minY;
          const col = NODE_COLORS[n.kind] || "#aaa";
          const active = hov === n.id;
          return (
            <g
              key={n.id}
              onMouseEnter={() => setHov(n.id)}
              onMouseLeave={() => setHov(null)}
              style={{ cursor: "default" }}
            >
              {active && (
                <rect
                  x={nx - 3}
                  y={ny - 3}
                  width={NW + 6}
                  height={NH + 6}
                  rx={6}
                  fill="none"
                  stroke={col}
                  strokeWidth={1.5}
                  opacity={0.35}
                />
              )}
              <rect
                x={nx}
                y={ny}
                width={NW}
                height={NH}
                rx={4}
                fill={
                  active ? "rgba(240,240,240,0.07)" : "rgba(240,240,240,0.03)"
                }
                stroke={active ? col : "rgba(240,240,240,0.12)"}
                strokeWidth={active ? 1.5 : 1}
              />
              <rect
                x={nx}
                y={ny}
                width={3}
                height={NH}
                rx={3}
                fill={col}
                opacity={0.85}
              />
              <text
                x={nx + 13}
                y={ny + NH / 2 + 4}
                fill={col}
                fontSize={10}
                textAnchor="middle"
                fontFamily="monospace"
              >
                {NODE_ICONS[n.kind] || "○"}
              </text>
              <text
                x={nx + 22}
                y={ny + NH / 2 - 3}
                fill="rgba(240,240,240,0.85)"
                fontSize={8.5}
                fontFamily="'Space Mono',monospace"
              >
                {n.label.length > 14 ? n.label.slice(0, 13) + "…" : n.label}
              </text>
              <text
                x={nx + 22}
                y={ny + NH / 2 + 8}
                fill={col}
                fontSize={7}
                fontFamily="'Space Mono',monospace"
                opacity={0.6}
              >
                {n.kind}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Type badge ───────────────────────────────────────────────────────────────
const TYPE_LABELS: Record<string, string> = {
  job: "EXPERIENCE",
  github: "OPEN SOURCE",
  workflow: "AUTOMATION",
};
const TYPE_COLORS: Record<string, string> = {
  job: "#f0f0f0",
  github: "#60a5fa",
  workflow: "#e07b39",
};

// ─── Main carousel ────────────────────────────────────────────────────────────
export default function WorkCarousel() {
  const [idx, setIdx] = useState(0);
  const [entering, setEntering] = useState(false);
  const [dir, setDir] = useState<1 | -1>(1);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const total = CARDS.length;
  const isMobile = useIsMobile();

  const go = useCallback(
    (newDir: 1 | -1) => {
      setDir(newDir);
      setEntering(true);
      setTimeout(() => {
        setIdx((prev) => (((prev + newDir) % total) + total) % total);
        setEntering(false);
      }, 320);
    },
    [total],
  );

  // auto-advance every 2s
  useEffect(() => {
    if (overlayOpen) return;
    timerRef.current = setTimeout(() => go(1), 1000000000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [idx, overlayOpen, go]);

  const card = CARDS[idx];
  const accentColor = TYPE_COLORS[card.type];

  // Overlay (workflow full-view or github detail)
  function handleCardClick() {
    if (card.type === "job") return;
    if (card.type === "github" && overlayOpen) {
      window.open(card.Githuburl!, "_blank");
      return;
    }
    setOverlayOpen(true);
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Overlay ─────────────────────────────────────────────────────── */}
      {overlayOpen && (
        <div
          onClick={(e) => e.target === e.currentTarget && setOverlayOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 500,
            background: "rgba(8,8,8,0.96)",
            display: "flex",
            flexDirection: "column",
            padding: isMobile ? "20px 16px" : "32px 40px",
            overflowY: "auto",
            animation: "fadeIn 0.2s ease",
          }}
        >
          {/* overlay header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 12,
              marginBottom: isMobile ? 16 : 20,
              flexWrap: isMobile ? "wrap" : "nowrap",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  color: accentColor,
                  marginBottom: 6,
                }}
              >
                {TYPE_LABELS[card.type]}
              </div>
              <div
                style={{
                  fontSize: isMobile ? 18 : 22,
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                {card.title}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(240,240,240,0.4)",
                  fontFamily: "'Space Mono',monospace",
                  marginTop: 4,
                }}
              >
                {card.meta}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                flexWrap: "wrap",
                marginLeft: isMobile ? 0 : "auto",
              }}
            >
              {card.type === "github" && (
                <a
                  href={card.Githuburl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: "'Space Mono',monospace",
                    fontSize: 11,
                    letterSpacing: "0.08em",
                    color: accentColor,
                    border: `1px solid ${accentColor}40`,
                    padding: "7px 16px",
                    borderRadius: 2,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  OPEN GITHUB ↗
                </a>
              )}

              {card.url && (
                <a
                  href={card.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: "'Space Mono',monospace",
                    fontSize: 11,
                    letterSpacing: "0.08em",
                    color: "red",
                    border: `1px solid red`,
                    padding: "7px 16px",
                    borderRadius: 2,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  OPEN SITE ↗
                </a>
              )}
              <button
                onClick={() => setOverlayOpen(false)}
                style={{
                  background: "none",
                  border: "1px solid rgba(240,240,240,0.15)",
                  color: "rgba(240,240,240,0.6)",
                  width: 36,
                  height: 36,
                  flexShrink: 0,
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: 20,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* workflow diagram */}
          {card.type === "workflow" && card.workflowData && (
            <>
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(240,240,240,0.5)",
                  lineHeight: 1.7,
                  marginBottom: 16,
                  maxWidth: 600,
                }}
              >
                {card.desc}
              </p>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  overflow: "hidden",
                  border: "1px solid rgba(240,240,240,0.07)",
                  borderRadius: 4,
                  background: "#04040a",
                  padding: isMobile ? "16px 12px" : 24,
                }}
              >
                <WorkflowDiagram data={card.workflowData} isMobile={isMobile} />
              </div>
              <div
                style={{
                  marginTop: 14,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                {Array.from(
                  new Set(card.workflowData.nodes.map((n) => n.kind)),
                ).map((k) => (
                  <span
                    key={k}
                    style={{ display: "flex", alignItems: "center", gap: 5 }}
                  >
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 2,
                        background: NODE_COLORS[k] || "#aaa",
                        display: "inline-block",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 9,
                        fontFamily: "'Space Mono',monospace",
                        color: "rgba(240,240,240,0.35)",
                      }}
                    >
                      {k}
                    </span>
                  </span>
                ))}
              </div>
            </>
          )}

          {/* github overlay */}
          {card.type === "github" && (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              <p
                style={{
                  fontSize: 14,
                  color: "rgba(240,240,240,0.55)",
                  lineHeight: 1.8,
                  maxWidth: 580,
                }}
              >
                {card.desc}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {card.skills.map((s) => (
                  <span
                    key={s}
                    style={{
                      border: "1px solid rgba(240,240,240,0.12)",
                      borderRadius: 2,
                      padding: "4px 10px",
                      fontSize: 11,
                      fontFamily: "'Space Mono',monospace",
                      color: "rgba(240,240,240,0.45)",
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: 220,
                  height: isMobile ? 240 : 300,
                }}
              >
                <SkillBubblesCanvas
                  skills={card.skills}
                  seed={card.index * 31}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Card area ───────────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns:
            card.type === "workflow" ? "1fr" : isMobile ? "1fr" : "1fr 1fr",
          gridTemplateRows:
            isMobile && card.type !== "workflow" ? "auto 220px" : undefined,
          gap: 0,
          overflowY: isMobile ? "auto" : "hidden",
          overflowX: "hidden",
          position: "relative",
          cursor: card.type !== "job" ? "pointer" : "default",
          opacity: entering ? 0 : 1,
          transform: entering ? `translateX(${dir * 24}px)` : "translateX(0px)",
          transition: "opacity 0.32s ease, transform 0.32s ease",
        }}
        onClick={handleCardClick}
      >
        {/* LEFT: text */}
        <div
          style={{
            padding: isMobile ? "20px 0 20px 0" : "0 0 24px 0",
            display: "flex",
            flexDirection: "column",
            justifyContent: isMobile ? "flex-start" : "space-between",
            gap: isMobile ? 16 : 0,
            overflow: isMobile ? "visible" : "hidden",
          }}
        >
          {/* top meta row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: isMobile ? 14 : 18,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 9,
                letterSpacing: "0.18em",
                color: accentColor,
                border: `1px solid ${accentColor}50`,
                padding: "3px 9px",
                borderRadius: 2,
                whiteSpace: "nowrap",
              }}
            >
              {TYPE_LABELS[card.type]}
            </span>
            <span
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 10,
                color: "rgba(240,240,240,0.3)",
                letterSpacing: "0.08em",
              }}
            >
              {card.meta}
            </span>
          </div>

          {/* big title */}
          <div>
            <div
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: isMobile
                  ? "clamp(20px,7vw,28px)"
                  : "clamp(18px,2.4vw,34px)",
                fontWeight: 700,
                lineHeight: 1.15,
                letterSpacing: "-0.01em",
                marginBottom: 6,
              }}
            >
              {card.title}
            </div>
            <div
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 11,
                color: accentColor,
                letterSpacing: "0.1em",
                marginBottom: 14,
              }}
            >
              {card.subtitle}
            </div>
            <p
              style={{
                fontSize: 12,
                lineHeight: 1.75,
                color: "rgba(240,240,240,0.5)",
                maxWidth: isMobile ? "100%" : 440,
              }}
            >
              {card.desc}
            </p>
          </div>

          {/* skills row (for non-workflow on left pane) */}
          {card.type !== "workflow" && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                marginTop: 16,
              }}
            >
              {card.skills.map((s) => (
                <span
                  key={s}
                  style={{
                    border: "1px solid rgba(240,240,240,0.1)",
                    borderRadius: 2,
                    padding: "3px 8px",
                    fontSize: 10,
                    fontFamily: "'Space Mono',monospace",
                    color: "rgba(240,240,240,0.4)",
                    letterSpacing: "0.06em",
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          {/* click hint for non-job */}
          {card.type !== "job" && (
            <div
              style={{
                marginTop: 14,
                fontSize: 9,
                fontFamily: "'Space Mono',monospace",
                color: accentColor,
                letterSpacing: "0.12em",
                opacity: 0.6,
              }}
            >
              {card.type === "workflow"
                ? "CLICK — OPEN FLOW DIAGRAM ↗"
                : "CLICK — VIEW PROJECT ↗"}
            </div>
          )}
        </div>

        {/* RIGHT: bubbles canvas (job & github) OR workflow mini-view */}
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            height: isMobile ? 220 : undefined,
            minHeight: isMobile ? 220 : undefined,
            display: card.type === "workflow" ? "none" : "block",
          }}
        >
          <SkillBubblesCanvas skills={card.skills} seed={card.index * 31} />
        </div>

        {/* Workflow inline mini-diagram */}
        {card.type === "workflow" && card.workflowData && (
          <div
            style={{
              flex: 1,
              display: "flex",
              overflow: "hidden",
              border: "1px solid rgba(240,240,240,0.07)",
              borderRadius: 4,
              background: "rgba(4,4,10,0.6)",
              padding: isMobile ? "12px 14px" : "16px 20px",
              marginTop: 12,
              pointerEvents: "none",
            }}
          >
            <WorkflowDiagram data={card.workflowData} isMobile={isMobile} />
          </div>
        )}
      </div>

      {/* ── Nav controls ────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: isMobile ? 8 : 0,
          paddingTop: 16,
          borderTop: "1px solid rgba(240,240,240,0.07)",
          flexShrink: 0,
        }}
      >
        {/* left arrow */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            go(-1);
          }}
          style={{
            background: "none",
            border: "1px solid rgba(240,240,240,0.15)",
            color: "rgba(240,240,240,0.7)",
            width: 32,
            height: 32,
            flexShrink: 0,
            borderRadius: "50%",
            cursor: "pointer",
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "border-color 0.2s",
          }}
          aria-label="Previous"
        >
          ←
        </button>

        {/* dot strip */}
        <div
          style={{
            display: "flex",
            gap: 5,
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "center",
            minWidth: 0,
          }}
        >
          {CARDS.map((c, i) => {
            const isCur = i === idx;
            const col = TYPE_COLORS[c.type];
            return (
              <div
                key={c.id}
                onClick={(e) => {
                  e.stopPropagation();
                  const d = i > idx ? 1 : -1;
                  setDir(d as 1 | -1);
                  setEntering(true);
                  setTimeout(() => {
                    setIdx(i);
                    setEntering(false);
                  }, 320);
                }}
                title={c.title}
                style={{
                  width: isCur ? (isMobile ? 22 : 32) : 6,
                  height: 4,
                  borderRadius: 2,
                  background: isCur ? col : "rgba(240,240,240,0.15)",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
              />
            );
          })}
        </div>

        {/* counter + right arrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "'Space Mono',monospace",
              fontSize: 10,
              color: "rgba(240,240,240,0.3)",
              letterSpacing: "0.08em",
              whiteSpace: "nowrap",
            }}
          >
            {String(idx + 1).padStart(2, "0")} /{" "}
            {String(total).padStart(2, "0")}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            style={{
              background: "none",
              border: "1px solid rgba(240,240,240,0.15)",
              color: "rgba(240,240,240,0.7)",
              width: 32,
              height: 32,
              flexShrink: 0,
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "border-color 0.2s",
            }}
            aria-label="Next"
          >
            →
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

        .wf-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(240,240,240,0.22) transparent;
        }
        .wf-scroll::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .wf-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .wf-scroll::-webkit-scrollbar-thumb {
          background: rgba(240,240,240,0.18);
          border-radius: 3px;
        }
        .wf-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(240,240,240,0.32);
        }
        .wf-scroll::-webkit-scrollbar-corner {
          background: transparent;
        }
      `}</style>
    </div>
  );
}
