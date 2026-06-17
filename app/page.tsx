"use client";

import CustomCursor from "@/components/CustomCursor";
import Frame from "@/components/Frame";
import Nav from "@/components/Nav";
import ParticleCanvas from "@/components/canvases/ParticleCanvas";
import WaveCanvas from "@/components/canvases/WaveCanvas";
import LineCanvas from "@/components/canvases/LineCanvas";
import SpiralCanvas from "@/components/canvases/SpiralCanvas";
import FunnelCanvas from "@/components/canvases/FunnelCanvas";

export default function Home() {
  return (
    <>
      <CustomCursor />
      <Frame />

      <Nav />

      <div className="snap-container" id="snap">
        {/* HOME */}
        <div className="page" id="home">
          <ParticleCanvas />
          <div>
            <div className="hero-name">
              ABDULLAH
              <br />
              SALIMEE
            </div>
            <div className="hero-title">Frontend Engineer &amp; UI Architect</div>
          </div>
          <div className="hero-sub">
            Here&apos;s my approach, whether it&apos;s building
            <br />
            interfaces or intelligent systems.
          </div>
          <div className="hero-tagline">Build. Integrate. Ship.</div>
        </div>

        {/* SECTION 2 */}
        <div className="page" id="s2">
          <WaveCanvas />
          <div className="section-top-left">
            <strong>UI-first thinking matters.</strong>
            <br />
            Clean code isn&apos;t enough —<br />
            <strong>what you build</strong> and <strong>how it feels</strong> is everything.
          </div>
          <div className="section-quote">Consistency is the foundation of trust</div>
        </div>

        {/* SECTION 3 */}
        <div className="page" id="s3">
          <LineCanvas />
          <div className="section-top-right">
            AI can generate. AI can refactor.
            <br />
            But <strong>design taste</strong> and <strong>system thinking</strong>?
            <br />
            That&apos;s still on us.
          </div>
          <div className="section-quote">Do we need code..? or experiences?</div>
        </div>

        {/* SECTION 4 */}
        <div className="page" id="s4">
          <SpiralCanvas />
          <div className="section-top-left">
            Interfaces change. Requirements shift.
            <br />
            Building with <strong>adaptability</strong> baked in.
          </div>
          <div className="section-quote">Cause &amp; Effect</div>
        </div>

        {/* SECTION 5 */}
        <div className="page" id="s5">
          <FunnelCanvas />
          <div className="section-top-right">
            Adapting to the pace of modern
            <br />
            development environments.
            <br />
            <strong>Sounds interesting? Let&apos;s connect..</strong>
          </div>
          <div className="section-quote">You bring the vision, I&apos;ll build the thing</div>
        </div>
      </div>
    </>
  );
}
