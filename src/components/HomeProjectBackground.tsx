import { CSSProperties, useEffect, useMemo, useState } from "react";

type BackgroundWork = { image: string; title: string };

/** Decorative project wall used only by the Feneco home. */
export default function HomeProjectBackground({ works }: { works: BackgroundWork[] }) {
  const [offset, setOffset] = useState(0);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [desktop, setDesktop] = useState(() => typeof window !== "undefined" && window.matchMedia("(min-width: 821px)").matches);
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tiles = useMemo(() => Array.from({ length: 24 }, (_, index) => works[(index + offset) % works.length]), [works, offset]);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 821px)");
    const update = () => setDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!desktop || reduced || works.length === 0) return;
    const changeWork = window.setInterval(() => setOffset(value => (value + 1) % works.length), 4200);
    const move = (event: PointerEvent) => setPointer({ x: (event.clientX / window.innerWidth - .5) * 2, y: (event.clientY / window.innerHeight - .5) * 2 });
    window.addEventListener("pointermove", move, { passive: true });
    return () => { window.clearInterval(changeWork); window.removeEventListener("pointermove", move); };
  }, [desktop, reduced, works.length]);

  if (!works.length) return null;
  // A parede é decorativa. No celular ela vira textura CSS: evita baixar os
  // screenshots externos que o Lighthouse detectou atrás da lente.
  if (!desktop) return <div className="home-project-background home-project-background--mobile" aria-hidden="true" />;
  const style = {
    "--home-pointer-x": `${pointer.x * window.innerWidth / 2 + window.innerWidth / 2}px`,
    "--home-pointer-y": `${pointer.y * window.innerHeight / 2 + window.innerHeight / 2}px`,
    "--home-shift-x": `${pointer.x * 18}px`,
    "--home-shift-y": `${pointer.y * 14}px`,
  } as CSSProperties;
  const wall = (className = "") => <div className={`home-project-background__wall ${className}`}>{tiles.map((work, index) => <figure key={`${className}-${work.title}-${index}`}><img src={work.image.startsWith("/") ? `${import.meta.env.BASE_URL}${work.image.slice(1)}` : work.image} alt="" decoding="async" /></figure>)}</div>;
  return <div className="home-project-background" style={style} aria-hidden="true">{wall()}<div className="home-project-background__lens">{wall("home-project-background__wall--cyan")}{wall("home-project-background__wall--magenta")}</div></div>;
}
