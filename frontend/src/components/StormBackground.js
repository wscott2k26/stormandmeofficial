import React, { useEffect, useRef } from "react";
import { useStorm } from "../context/StormContext";

export default function StormBackground() {
  const { motion } = useStorm();
  const canvasRef = useRef(null);
  const lightningRef = useRef(null);
  const rafRef = useRef(null);
  const dropsRef = useRef([]);

  // Rain canvas
  useEffect(() => {
    if (!motion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const isMobile = window.innerWidth < 768;

    let w, h;
    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const count = isMobile ? 90 : 220;
      dropsRef.current = Array.from({ length: count }, () => makeDrop(w, h));
    };
    const makeDrop = (w, h) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      len: 8 + Math.random() * 18,
      speed: 4 + Math.random() * 8,
      opacity: 0.15 + Math.random() * 0.4,
      wind: 0.6 + Math.random() * 0.8,
    });

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";
      for (const d of dropsRef.current) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(180, 205, 235, ${d.opacity})`;
        ctx.lineWidth = d.len > 18 ? 1.4 : 0.9;
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + d.wind, d.y + d.len);
        ctx.stroke();
        d.y += d.speed;
        d.x += d.wind * 0.5;
        if (d.y > h) { d.y = -d.len; d.x = Math.random() * w; }
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [motion]);

  // Lightning
  useEffect(() => {
    if (!motion) return;
    const el = lightningRef.current;
    if (!el) return;
    let timer;
    const flash = () => {
      const strong = Math.random() < 0.3;
      el.classList.remove("flash-soft", "flash-strong");
      // reflow to restart animation
      void el.offsetWidth;
      el.classList.add(strong ? "flash-strong" : "flash-soft");
      timer = setTimeout(flash, 12000 + Math.random() * 13000);
    };
    timer = setTimeout(flash, 6000 + Math.random() * 6000);
    return () => clearTimeout(timer);
  }, [motion]);

  if (!motion) {
    return (
      <div
        className="storm-rain"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(120% 80% at 50% -10%, rgba(59,130,246,0.10), transparent 60%), linear-gradient(180deg,#060d18,#04070d)",
        }}
      />
    );
  }

  return (
    <>
      <canvas ref={canvasRef} className="storm-rain" aria-hidden="true" data-testid="storm-rain-canvas" />
      <div ref={lightningRef} className="storm-lightning" aria-hidden="true" data-testid="storm-lightning" />
    </>
  );
}
