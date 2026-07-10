import React, { useEffect, useRef } from "react";
import { useStorm } from "../context/StormContext";

export default function StormBackground() {
  const { motion } = useStorm();
  const canvasRef = useRef(null);
  const lightningRef = useRef(null);
  const boltRef = useRef(null);
  const rafRef = useRef(null);
  const dropsRef = useRef([]);

  // Rain canvas — strong diagonal / sideways rain, full screen
  useEffect(() => {
    if (!motion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const isMobile = window.innerWidth < 768;

    let w = 0;
    let h = 0;

    const makeDrop = () => {
      const vy = 9 + Math.random() * 12;       // vertical speed
      const vx = 3.5 + Math.random() * 4.5;     // horizontal speed (sideways slant)
      return {
        x: Math.random() * (w + 300) - 150,
        y: Math.random() * h - h,               // stagger above the screen
        vx,
        vy,
        trail: 1.6 + Math.random() * 2.2,        // streak length multiplier
        opacity: 0.25 + Math.random() * 0.5,
        width: Math.random() > 0.7 ? 1.6 : 1,
      };
    };

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const count = isMobile ? 130 : 300;
      dropsRef.current = Array.from({ length: count }, makeDrop);
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";
      for (const d of dropsRef.current) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(190, 214, 245, ${d.opacity})`;
        ctx.lineWidth = d.width;
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.vx * d.trail, d.y - d.vy * d.trail);
        ctx.stroke();

        d.x += d.vx;
        d.y += d.vy;

        if (d.y - d.vy * d.trail > h || d.x - d.vx * d.trail > w + 50) {
          const nd = makeDrop();
          d.x = Math.random() * (w + 200) - 200;
          d.y = -20 - Math.random() * 100;
          d.vx = nd.vx; d.vy = nd.vy; d.trail = nd.trail; d.opacity = nd.opacity; d.width = nd.width;
        }
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [motion]);

  // Lightning — random gentle sky glow + occasional subtle bolt strikes
  useEffect(() => {
    if (!motion) return;
    const el = lightningRef.current;
    const boltCanvas = boltRef.current;
    if (!el || !boltCanvas) return;
    const ctx = boltCanvas.getContext("2d");
    let w = (boltCanvas.width = window.innerWidth);
    let h = (boltCanvas.height = window.innerHeight);
    const onResize = () => { w = boltCanvas.width = window.innerWidth; h = boltCanvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);

    let timer;
    let fadeRaf;

    const buildBolt = () => {
      const startX = w * (0.15 + Math.random() * 0.7);
      const endY = h * (0.4 + Math.random() * 0.35);
      let x = startX, y = 0;
      const main = [[x, y]];
      const step = endY / (9 + Math.random() * 6);
      while (y < endY) {
        y += step;
        x += (Math.random() - 0.5) * 55;
        main.push([x, y]);
      }
      const branches = [];
      if (Math.random() < 0.55) {
        const bi = Math.floor(main.length * (0.35 + Math.random() * 0.35));
        let bx = main[bi][0], by = main[bi][1];
        const bpts = [[bx, by]];
        const bEnd = by + h * (0.12 + Math.random() * 0.18);
        while (by < bEnd) { by += 26 + Math.random() * 22; bx += (Math.random() - 0.5) * 46; bpts.push([bx, by]); }
        branches.push(bpts);
      }
      return { main, branches };
    };

    const drawBolt = (strong) => {
      const { main, branches } = buildBolt();
      let alpha = strong ? 0.85 : 0.5;
      const trace = (arr) => {
        ctx.beginPath();
        ctx.moveTo(arr[0][0], arr[0][1]);
        for (let i = 1; i < arr.length; i++) ctx.lineTo(arr[i][0], arr[i][1]);
        ctx.stroke();
      };
      const frame = () => {
        ctx.clearRect(0, 0, w, h);
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.shadowColor = "rgba(147,197,253,0.9)";
        ctx.shadowBlur = strong ? 22 : 12;
        ctx.strokeStyle = `rgba(205,228,255,${alpha})`;
        ctx.lineWidth = strong ? 2.2 : 1.3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        trace(main);
        branches.forEach(trace);
        ctx.restore();
        alpha -= strong ? 0.05 : 0.07;
        if (alpha > 0) fadeRaf = requestAnimationFrame(frame);
        else ctx.clearRect(0, 0, w, h);
      };
      frame();
    };

    const flash = () => {
      const strong = Math.random() < 0.3;
      el.classList.remove("flash-soft", "flash-strong");
      void el.offsetWidth; // restart animation
      el.classList.add(strong ? "flash-strong" : "flash-soft");
      if (Math.random() < 0.8) drawBolt(strong); // most flashes include a subtle strike
      timer = setTimeout(flash, 12000 + Math.random() * 13000);
    };
    timer = setTimeout(flash, 3500 + Math.random() * 4000);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(fadeRaf);
      window.removeEventListener("resize", onResize);
    };
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
      <canvas ref={boltRef} className="storm-bolt" aria-hidden="true" data-testid="storm-bolt" />
    </>
  );
}
