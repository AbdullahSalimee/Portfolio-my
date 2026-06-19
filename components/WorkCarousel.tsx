"use client";

import { useState } from "react";
import { works } from "@/lib/work-data";
import SkillsBubbles from "./SkillsBubbles";

export default function WorkCarousel() {
  const [current, setCurrent] = useState(0);
  const w = works[current];

  const showWork = (idx: number) => {
    const next = (idx + works.length) % works.length;
    setCurrent(next);
  };

  return (
    <>
      <div className="work-layout" id="work-layout">
        <div className="work-detail" id="work-detail">
          <h2>{w.title}</h2>
          <div className="company">{w.company}</div>
          <div className="period">{w.period}</div>
          <h3>Experience</h3>
          <ul>
            {w.exp.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
        <SkillsBubbles skills={w.skills} key={current} />
      </div>
      <div className="carousel-controls">
        <button
          className="carousel-btn"
          id="prev-btn"
          onClick={() => showWork(current - 1)}
          aria-label="Previous"
        >
          &#8592;
        </button>
        <div className="carousel-dots" id="dots">
          {works.map((_, i) => (
            <div
              key={i}
              className={"dot" + (i === current ? " active" : "")}
              onClick={() => showWork(i)}
            ></div>
          ))}
        </div>
        <button
          className="carousel-btn"
          id="next-btn"
          onClick={() => showWork(current + 1)}
          aria-label="Next"
        >
          &#8594;
        </button>
      </div>
    </>
  );
}
