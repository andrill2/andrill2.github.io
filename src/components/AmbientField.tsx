import { useEffect, useRef } from "react";

/** Lightweight, decorative Canvas 2D field. It never receives pointer events. */
export default function AmbientField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    let frame = 0;
    let width = 0, height = 0, dpr = 1;
    const pointer = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };
    const ripples: { x:number; y:number; born:number }[] = [];
    const resize = () => {
      const rect = canvas.getBoundingClientRect(); dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = rect.width; height = rect.height; canvas.width = width * dpr; canvas.height = height * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const move = (event: PointerEvent) => {
      pointer.targetX = event.clientX; pointer.targetY = event.clientY;
      const last = ripples[ripples.length - 1];
      if (!last || Math.hypot(last.x - event.clientX, last.y - event.clientY) > 90) {
        ripples.push({ x:event.clientX, y:event.clientY, born:performance.now() });
      }
    };
    const draw = (time: number) => {
      pointer.x += (pointer.targetX - pointer.x) * .055; pointer.y += (pointer.targetY - pointer.y) * .055;
      context.clearRect(0, 0, width, height);
      const t = time * .00008;
      for (let index = 0; index < 3; index++) {
        const x = width * (.2 + index * .31) + Math.sin(t + index * 2.1) * width * .07;
        const y = height * (.22 + index * .25) + Math.cos(t * 1.3 + index) * height * .06;
        const dx = x - pointer.x, dy = y - pointer.y;
        const influence = Math.max(0, 1 - Math.hypot(dx, dy) / 310);
        const gradient = context.createRadialGradient(x + dx * influence * .11, y + dy * influence * .11, 0, x, y, Math.max(width, height) * .22);
        gradient.addColorStop(0, `rgba(223, 255, 55, ${.075 + influence * .055})`);
        gradient.addColorStop(1, "rgba(223, 255, 55, 0)");
        context.fillStyle = gradient; context.fillRect(0, 0, width, height);
      }
      while (ripples.length && time - ripples[0].born > 1450) ripples.shift();
      ripples.forEach(ripple => {
        const age = (time - ripple.born) / 1450;
        context.beginPath(); context.arc(ripple.x, ripple.y, 16 + age * 175, 0, Math.PI * 2);
        context.strokeStyle = `rgba(223, 255, 55, ${(1 - age) * .16})`;
        context.lineWidth = 1.25 - age * .55; context.stroke();
      });
      frame = requestAnimationFrame(draw);
    };
    resize(); window.addEventListener("resize", resize); window.addEventListener("pointermove", move, { passive: true }); frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); window.removeEventListener("pointermove", move); };
  }, []);
  return <canvas ref={canvasRef} className="ambient-field" aria-hidden="true" />;
}
