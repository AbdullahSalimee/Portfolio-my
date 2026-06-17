import { allSkills } from "@/lib/work-data";

export default function SkillsGrid() {
  return (
    <div className="skills-grid" id="skills-grid">
      {allSkills.map((s) => (
        <div className="skill-cell" key={s}>
          {s}
        </div>
      ))}
    </div>
  );
}
