import { useEffect, useState } from "react";
import { FOX_PATH } from "./FenecoLogo";

export default function IntroAnimation({ onReveal }: { onReveal: () => void }) {
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const reveal = window.setTimeout(() => { setLeaving(true); onReveal(); }, 2400);
    return () => window.clearTimeout(reveal);
  }, [onReveal]);
  return <div className={`intro ${leaving ? "intro--leaving" : ""}`} aria-label="Andril Esteves">
    <svg viewBox="0 0 1080 1350" role="img" aria-label="Feneco, marca de Andril Esteves" className="intro__fox">
      <path d={FOX_PATH} className="intro__stroke" pathLength="1" />
      <path d={FOX_PATH} className="intro__fill" />
    </svg>
    <p><span>ANDRIL ESTEVES</span><span>DESIGN · MOTION · 3D · CÓDIGO</span></p>
    <button type="button" onClick={() => { setLeaving(true); onReveal(); }}>Pular animação</button>
  </div>;
}
