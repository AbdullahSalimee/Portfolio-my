"use client";

import CustomCursor from "@/components/CustomCursor";
import Frame from "@/components/Frame";
import Nav from "@/components/Nav";
import WorkCarousel from "@/components/WorkCarousel";
import SkillsGrid from "@/components/SkillsGrid";

export default function WorkPage() {
  return (
    <>
      <CustomCursor />
      <Frame />
      <Nav />

      <div className="snap-container" id="snap">
        {/* WORK */}
        <div className="page" id="work-page" style={{ paddingBottom: 40 }}>
          <WorkCarousel />
        </div>

        {/* SKILLS */}
        <div className="page" id="skills-page">
          <SkillsGrid />
          <div className="skills-heading">
            <div
              className="section-quote"
              style={{ position: "static", bottom: "auto", left: "auto" }}
            >
              The Stack
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
