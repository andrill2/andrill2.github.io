import { CSSProperties, useEffect, useMemo, useState } from "react";

type BackgroundWork = { image: string; title: string };

/** Decorative project wall used only by the Feneco home. */
export default function HomeProjectBackground({ works }: { works: BackgroundWork[] }) {
  const [offset, setOffset] = useState(0);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tiles = useMemo(() => Array.from({ length: 24 }, (_, index) => works[(index + offset) % works.length]), [works, offset]);

  useEffect(() => {
    if (reduced || works.length === 0) return;
    const changeWork = window.setInterval(() => setOffset(value => (value + 1) % works.length), 4200);
    const move = (event: PointerEvent) => setPointer({ x: (event.clientX / window.innerWidth - .5) * 2, y: (event.clientY / window.innerHeight - .5) * 2 });
    window.addEventListener("pointermove", move, { passive: true });
    return () => { window.clearInterval(changeWork); window.removeEventListener("pointermove", move); };
  }, [reduced, works.length]);

  if (!works.length) return null;
  const style = {
    "--home-pointer-x": `${pointer.x * window.innerWidth / 2 + window.innerWidth / 2}px`,
    "--home-pointer-y": `${pointer.y * window.innerHeight / 2 + window.innerHeight / 2}px`,
    "--home-shift-x": `${pointer.x * 18}px`,
    "--home-shift-y": `${pointer.y * 14}px`,
  } as CSSProperties;
  const wall = (className = "") => <div className={`home-project-background__wall ${className}`}>{tiles.map((work, index) => <figure key={`${className}-${work.title}-${index}`}><img src={work.image.startsWith("/") ? `${import.meta.env.BASE_URL}${work.image.slice(1)}` : work.image} alt="" /></figure>)}</div>;
  return <div className="home-project-background" style={style} aria-hidden="true">{wall()}<div className="home-project-background__lens">{wall("home-project-background__wall--cyan")}{wall("home-project-background__wall--magenta")}</div></div>;
}
