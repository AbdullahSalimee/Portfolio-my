# Abdullah Salimee — Portfolio (Next.js)

A scroll-snapped, canvas-animated portfolio site converted from a single static HTML file into a proper Next.js 16 (App Router) project with TypeScript and Tailwind CSS.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build for production

```bash
npm run build
npm run start
```

## Project structure

```
app/
  layout.tsx          Root layout, fonts, metadata
  globals.css          All custom design tokens & styles (canvas page, nav, sections, etc.)
  page.tsx              Assembles the full one-page scroll experience
components/
  CustomCursor.tsx       Custom dot + ring cursor that follows the mouse
  Frame.tsx                Fixed decorative border frame
  Nav.tsx                    Fixed nav with active-section highlighting on scroll
  WorkCarousel.tsx       Work experience carousel (prev/next + dots)
  SkillsBubbles.tsx       Floating animated skill bubbles tied to the active work entry
  SkillsGrid.tsx             Full "Stack" grid section
  canvases/
    ParticleCanvas.tsx   Hero section - orbiting particles + wireframe cube
    WaveCanvas.tsx          Section 2 - animated dot waves
    LineCanvas.tsx           Section 3 - animated wavy lines
    SpiralCanvas.tsx        Section 4 - spiral particle field
    FunnelCanvas.tsx        Section 5 - funnel wireframe + orbiting ball
lib/
  work-data.ts                Work history & full skills list (single source of truth)
```

## Notes

- All canvas animations are implemented as client components ("use client") using useEffect + requestAnimationFrame, with cleanup on unmount so animations don't leak when navigating away.
- Fonts (Space Grotesk, Space Mono) are loaded via a standard Google Fonts <link> tag in app/layout.tsx. If you'd rather self-host them for better performance, swap this for next/font/google.
- The design system (colors, spacing, type scale) lives entirely in app/globals.css as plain CSS custom properties - this mirrors the original single-file design closely since the layout is highly bespoke (canvas-driven, snap-scrolling) rather than a typical utility-class layout.
- Update the content in lib/work-data.ts to change work history or the skills list, and edit app/page.tsx directly for hero/section copy and the About section.
- Social links in the About section (GitHub, LinkedIn, email) are placeholders - update them in app/page.tsx.
