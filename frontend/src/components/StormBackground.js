import React, { useEffect, useRef } from "react";
import { useStorm } from "../context/StormContext";

export default function StormBackground() {
  const { motion } = useStorm();
  const canvasRef = useRef(null);
  const lightningRef = useRef(null);
  const boltRef = useRef(null);
  const rafRef = useRef(null);
  const dropsRef = useRef([]);

  const playThunder = (strong) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const duration = strong ? 3.8 : 2.8;
      const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        last = last * 0.985 + white * 0.015;
        const t = i / ctx.sampleRate;
        const envelope = Math.exp(-t * (strong ? 0.9 : 1.2));
        data[i] = last * envelope * (strong ? 0.9 : 0.6);
      }
      const source = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      source.buffer = buffer;
      filter.type = "lowpass";
      filter.frequency.value = strong ? 180 : 140;
      gain.gain.value = 0.22;
      source.connect(filter).connect(gain).connect(ctx.destination);
      source.start();
      source.onended = () => ctx.close();
    } catch (_) {
      // Browsers may block sound until the visitor has interacted with the page.
    }
  };

  useEffect(() => {
    if (!motion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const isMobile = window.innerWidth < 768;
    let w = 0;
    let h = 0;

    const makeDrop = () => {
      const vy = 8 + Math.random() * 11;
      const vx = 3 + Math.random() * 4;
      return {
        x: Math.random() * (w + 300) - 150,
        y: Math.random() * h - h,
        vx,
        vy,
        trail: 1.5 + Math.random() * 2.1,
        opacity: 0.2 + Math.random() * 0.45,
        width: Math.random() > 0.75 ? 1.5 : 0.9,
      };
    };

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      dropsRef.current = Array.from({ length: isMobile ? 120 : 260 }, makeDrop);
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";
      for (const d of dropsRef.current) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(190,214,245,${d.opacity})`;
        ctx.lineWidth = d.width;
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.vx * d.trail, d.y - d.vy * d.trail);
        ctx.stroke();
        d.x += d.vx;
        d.y += d.vy;
        if (d.y > h + 50 || d.x > w + 80) {
          const nd = makeDrop();
          Object.assign(d, nd, { y: -20 - Math.random() * 120 });
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

  useEffect(() => {
    if (!motion) return;
    const el = lightningRef.current;
    const boltCanvas = boltRef.current;
    if (!el || !boltCanvas) return;
    const ctx = boltCanvas.getContext("2d");
    let w = (boltCanvas.width = window.innerWidth);
    let h = (boltCanvas.height = window.innerHeight);
    const onResize = () => {
      w = boltCanvas.width = window.innerWidth;
      h = boltCanvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    let timer;
    let fadeRaf;

    const buildBolt = () => {
      const startX = w * (0.18 + Math.random() * 0.64);
      const endY = h * (0.34 + Math.random() * 0.28);
      let x = startX;
      let y = 0;
      const main = [[x, y]];
      const step = endY / (10 + Math.random() * 6);
      while (y < endY) {
        y += step;
        x += (Math.random() - 0.5) * 48;
        main.push([x, y]);
      }
      return main;
    };

    const drawBolt = (strong) => {
      const points = buildBolt();
      let alpha = strong ? 0.7 : 0.38;
      const frame = () => {
        ctx.clearRect(0, 0, w, h);
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.shadowColor = "rgba(180,215,255,0.8)";
        ctx.shadowBlur = strong ? 18 : 10;
        ctx.strokeStyle = `rgba(220,235,255,${alpha})`;
        ctx.lineWidth = strong ? 1.8 : 1.1;
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
        ctx.stroke();
        ctx.restore();
        alpha -= strong ? 0.045 : 0.06;
        if (alpha > 0) fadeRaf = requestAnimationFrame(frame);
        else ctx.clearRect(0, 0, w, h);
      };
      frame();
    };

    const flash = () => {
      const strong = Math.random() < 0.22;
      el.classList.remove("flash-soft", "flash-strong");
      void el.offsetWidth;
      el.classList.add(strong ? "flash-strong" : "flash-soft");
      if (Math.random() < 0.55) drawBolt(strong);
      setTimeout(() => playThunder(strong), 900 + Math.random() * 900);
      timer = setTimeout(flash, 22000 + Math.random() * 36000);
    };

    timer = setTimeout(flash, 9000 + Math.random() * 9000);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(fadeRaf);
      window.removeEventListener("resize", onResize);
    };
  }, [motion]);

  return (
    <div className={`weather-world ${motion ? "is-storm" : "is-calm"}`} aria-hidden="true">
      <div className="sun-wash" />
      <div className="sun-rays" />
      <div className="rainbow-arc" />
      <div className="calm-haze" />
      {motion && (
        <>
          <canvas ref={canvasRef} className="storm-rain" data-testid="storm-rain-canvas" />
          <div ref={lightningRef} className="storm-lightning" data-testid="storm-lightning" />
          <canvas ref={boltRef} className="storm-bolt" data-testid="storm-bolt" />
        </>
      )}
    </div>
  );
}
