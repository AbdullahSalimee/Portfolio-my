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
          <div className="about-grid">
            {/* Left column — intro */}
            <div className="about-intro">
              <div className="about-eyebrow">Who I am</div>
              <h1 className="about-name">
                Abdullah
                <br />
                <span className="about-name-dim">Salimee</span>
              </h1>
              <div className="about-role">
                Frontend Engineer &amp; UI Architect
              </div>

              <p className="about-bio">
                I build interfaces that feel inevitable — where the design
                disappears and what remains is the experience. I live at the
                intersection of clean UI and intelligent systems.
              </p>
              <p className="about-bio">
                From pixel-perfect components in{" "}
                <span className="about-accent">React, Next.js, and Svelte</span>{" "}
                to AI-powered workflows with{" "}
                <span className="about-accent">n8n and AI agents</span> — I ship
                things that feel great and scale well.
              </p>

              <div className="socials">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub ↗
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn ↗
                </a>
                <a href="mailto:hello@abdullahsalimee.dev">Email ↗</a>
              </div>
            </div>

            {/* Right column — details */}
            <div className="about-details">
              <div className="about-block">
                <div className="about-block-label">Approach</div>
                <div className="about-block-text">
                  Question → Design → Build → Repeat. I care about the gap
                  between a Figma file and something that actually ships — and I
                  close it. I'm deeply comfortable with{" "}
                  <span className="about-accent">Supabase</span>, modern backend
                  APIs, and turning static designs into production-ready
                  interfaces. Libraries like{" "}
                  <span className="about-accent">shadcn/ui</span> are home turf.
                </div>
              </div>

              <div className="about-block">
                <div className="about-block-label">What I'm building now</div>
                <div className="about-block-text">
                  AI agent systems capable of multi-step reasoning, tool use,
                  and real-time feedback loops. Connecting LLMs to live data
                  with <span className="about-accent">n8n</span> and{" "}
                  <span className="about-accent">LangChain</span>, making AI
                  pipelines actually useful in production — not just demos.
                </div>
              </div>

              <div className="about-block">
                <div className="about-block-label">Background</div>
                <div className="about-block-text">
                  Started with C and C++, got serious about the web, and never
                  looked back. I've shipped across freelance, contract, and
                  personal projects — always with a preference for systems that
                  are maintainable three months later.
                </div>
              </div>

              <div className="about-availability">
                <div className="about-avail-dot"></div>
                <span>Available for freelance &amp; contract work</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
