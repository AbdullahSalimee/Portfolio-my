export type WorkEntry = {
  title: string;
  company: string;
  period: string;
  exp: string[];
  skills: string[];
};

export const works: WorkEntry[] = [
  {
    title: "AI Workflow Engineer",
    company: "Freelance",
    period: "Contract  2024 – Present",
    exp: [
      "Built end-to-end AI automation workflows using n8n, connecting LLMs to Supabase and external APIs.",
      "Designed and shipped AI agent systems capable of multi-step reasoning and tool use.",
      "Delivered beautiful frontend dashboards in Next.js with real-time data from Supabase.",
      "Integrated OpenAI, Anthropic, and open-source models into production pipelines.",
    ],
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
    title: "Frontend Developer",
    company: "Project-based",
    period: "Freelance  2023 – 2024",
    exp: [
      "Delivered pixel-perfect UI implementations from Figma designs in React and Svelte.",
      "Built complex data-driven interfaces with smooth animations and micro-interactions.",
      "Created reusable component libraries with shadcn/ui and custom Tailwind variants.",
      "Worked with REST and GraphQL APIs, authentication via Supabase and JWT.",
    ],
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
    title: "AI Agent Developer",
    company: "Self-initiated",
    period: "Personal Projects  2023 – Present",
    exp: [
      "Engineered multi-agent systems with tool calling, memory, and structured output.",
      "Built agentic RAG pipelines using vector databases and Supabase pgvector.",
      "Experimented with local LLM setups and fine-tuning approaches for specialized tasks.",
      "Developed browser automation and scraping systems integrated into AI pipelines.",
    ],
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
    title: "Systems & UI Generalist",
    company: "Various Clients",
    period: "Contract  2022 – 2023",
    exp: [
      "Shipped full-stack web apps using Next.js and Express with clean, maintainable architecture.",
      "Styled complex UIs using both Tailwind CSS and custom plain CSS for precise control.",
      "Integrated third-party APIs and built webhook-driven event systems.",
      "Mentored junior developers on component design patterns and accessibility standards.",
    ],
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
];

export const allSkills: string[] = [
  "React",
  "Next.js",
  "Svelte",
  "TypeScript",
  "JavaScript",
  "HTML5",
  "CSS3",
  "Tailwind CSS",
  "shadcn/ui",
  "Framer Motion",
  "Node.js",
  "Express",
  "Supabase",
  "REST APIs",
  "n8n",
  "AI Agents",
  "OpenAI API",
  "LangChain",
  "Figma",
  "Git",
  "C++",
  "C",
  "Python",
  "PostgreSQL",
];
