"use client";

import CustomCursor from "@/components/CustomCursor";
import Frame from "@/components/Frame";
import Nav from "@/components/Nav";

export default function AboutPage() {
  return (
    <>
      <CustomCursor />
      <Frame />
      <Nav />

      <div className="snap-container" id="snap">
        <div className="page" id="about-page">
          <div className="about-content">
            <p>
              <span>Hi, I&apos;m Abdullah!</span>
            </p>
            <p>
              I&apos;m a <span>Frontend Engineer</span> obsessed with building beautiful,
              high-performance interfaces. I live at the intersection of clean UI and
              intelligent systems.
            </p>
            <p>
              From pixel-perfect components in <span>React, Next.js, and Svelte</span> to
              AI-powered workflows with <span>n8n and AI agents</span> — I build things that
              feel great and scale well.
            </p>
            <p>
              I&apos;m deeply comfortable with <span>Supabase</span>, modern backend APIs, and
              turning Figma designs into production-ready interfaces. Libraries like{" "}
              <span>shadcn/ui</span> are home turf.
            </p>
            <p>Question → Design → Build → Repeat. That&apos;s how I see it.</p>
            <div className="socials">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                GitHub ↗
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                LinkedIn ↗
              </a>
              <a href="mailto:hello@abdullahsalimee.dev">Email ↗</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
