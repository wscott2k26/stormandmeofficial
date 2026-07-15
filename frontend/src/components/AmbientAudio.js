import React, { useEffect, useRef, useState } from "react";
import { CloudRain, Music2 } from "lucide-react";

export default function AmbientAudio() {
  const [rainOn, setRainOn] = useState(false);
  const [pianoOn, setPianoOn] = useState(false);
  const [starting, setStarting] = useState(false);

  const ctxRef = useRef(null);
  const masterRef = useRef(null);
  const rainGainRef = useRef(null);
  const pianoGainRef = useRef(null);
  const nodesRef = useRef([]);
  const pianoTimerRef = useRef(null);

  const ensureAudio = async () => {
    if (ctxRef.current) {
      if (ctxRef.current.state === "suspended") await ctxRef.current.resume();
      return true;
    }

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return false;

    const ctx = new AudioCtx();
    await ctx.resume();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = 0.42;
    master.connect(ctx.destination);
    masterRef.current = master;

    const rainGain = ctx.createGain();
    rainGain.gain.value = 0;
    rainGain.connect(master);
    rainGainRef.current = rainGain;

    const pianoGain = ctx.createGain();
    pianoGain.gain.value = 0;
    pianoGain.connect(master);
    pianoGainRef.current = pianoGain;

    const duration = 14;
    const buffer = ctx.createBuffer(2, ctx.sampleRate * duration, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel += 1) {
      const data = buffer.getChannelData(channel);
      let slow = 0;
      let slower = 0;
      for (let i = 0; i < data.length; i += 1) {
        const white = Math.random() * 2 - 1;
        slow = slow * 0.995 + white * 0.005;
        slower = slower * 0.9995 + white * 0.0005;
        data[i] = slow * 0.032 + slower * 0.022;
      }

      for (let d = 0; d < 170; d += 1) {
        const start = Math.floor(Math.random() * (data.length - 1800));
        const length = 260 + Math.floor(Math.random() * 900);
        const strength = 0.004 + Math.random() * 0.018;
        const pitch = 180 + Math.random() * 620;
        const decay = 8 + Math.random() * 10;
        for (let j = 0; j < length && start + j < data.length; j += 1) {
          const t = j / ctx.sampleRate;
          const envelope = Math.exp(-t * decay);
          const drop = Math.sin(2 * Math.PI * pitch * t) * envelope;
          data[start + j] += drop * strength;
        }
      }
    }

    const rain = ctx.createBufferSource();
    rain.buffer = buffer;
    rain.loop = true;

    const rainLowpass = ctx.createBiquadFilter();
    rainLowpass.type = "lowpass";
    rainLowpass.frequency.value = 1350;
    rainLowpass.Q.value = 0.2;

    const rainHighpass = ctx.createBiquadFilter();
    rainHighpass.type = "highpass";
    rainHighpass.frequency.value = 70;

    const rainWarmth = ctx.createBiquadFilter();
    rainWarmth.type = "lowshelf";
    rainWarmth.frequency.value = 360;
    rainWarmth.gain.value = 5;

    rain.connect(rainHighpass).connect(rainLowpass).connect(rainWarmth).connect(rainGain);
    rain.start();
    nodesRef.current.push(rain, rainHighpass, rainLowpass, rainWarmth);

    const notes = [196.0, 261.63, 329.63, 293.66, 220.0, 261.63, 392.0, 329.63];
    let index = 0;

    const playNote = () => {
      const activeCtx = ctxRef.current;
      const activeGain = pianoGainRef.current;
      if (!activeCtx || !activeGain) return;

      const now = activeCtx.currentTime;
      const fundamental = activeCtx.createOscillator();
      const body = activeCtx.createOscillator();
      const noteGain = activeCtx.createGain();
      const filter = activeCtx.createBiquadFilter();

      fundamental.type = "sine";
      body.type = "triangle";
      fundamental.frequency.value = notes[index % notes.length];
      body.frequency.value = notes[index % notes.length] / 2;
      filter.type = "lowpass";
      filter.frequency.value = 900;
      filter.Q.value = 0.25;

      noteGain.gain.setValueAtTime(0.0001, now);
      noteGain.gain.exponentialRampToValueAtTime(0.042, now + 0.7);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 8.8);

      fundamental.connect(noteGain);
      body.connect(noteGain);
      noteGain.connect(filter).connect(activeGain);

      fundamental.start(now);
      body.start(now);
      fundamental.stop(now + 9);
      body.stop(now + 9);
      index += 1;
    };

    playNote();
    pianoTimerRef.current = setInterval(playNote, 9000);
    return true;
  };

  const fadeGain = (gainNode, target, seconds = 1.8) => {
    const ctx = ctxRef.current;
    if (!ctx || !gainNode) return;
    const now = ctx.currentTime;
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    gainNode.gain.linearRampToValueAtTime(target, now + seconds);
  };

  const toggleRain = async () => {
    setStarting(true);
    try {
      const ready = await ensureAudio();
      if (!ready) return;
      const next = !rainOn;
      setRainOn(next);
      fadeGain(rainGainRef.current, next ? 0.18 : 0);
    } finally {
      setStarting(false);
    }
  };

  const togglePiano = async () => {
    setStarting(true);
    try {
      const ready = await ensureAudio();
      if (!ready) return;
      const next = !pianoOn;
      setPianoOn(next);
      fadeGain(pianoGainRef.current, next ? 0.30 : 0);
    } finally {
      setStarting(false);
    }
  };

  useEffect(() => {
    return () => {
      clearInterval(pianoTimerRef.current);
      nodesRef.current.forEach((node) => {
        try { node.stop?.(); } catch (_) {}
        try { node.disconnect?.(); } catch (_) {}
      });
      try { ctxRef.current?.close(); } catch (_) {}
    };
  }, []);

  const buttonClass = "inline-flex h-11 min-w-[112px] items-center justify-center gap-2 rounded-full border border-white/15 bg-black/70 px-4 text-xs font-semibold text-white shadow-xl backdrop-blur-md transition hover:bg-black/85 disabled:opacity-60";

  return (
    <div className="fixed bottom-5 right-5 z-[2147483647] flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={togglePiano}
        disabled={starting}
        className={`${buttonClass} ${pianoOn ? "ring-2 ring-storm-gold/60" : ""}`}
        aria-label={pianoOn ? "Turn piano off" : "Turn piano on"}
        title={pianoOn ? "Slow piano on" : "Turn on slow piano"}
      >
        <Music2 className="h-5 w-5" />
        <span>{pianoOn ? "Piano On" : "Piano Off"}</span>
      </button>

      <button
        type="button"
        onClick={toggleRain}
        disabled={starting}
        className={`${buttonClass} ${rainOn ? "ring-2 ring-storm-blue/60" : ""}`}
        aria-label={rainOn ? "Turn rain sound off" : "Turn rain sound on"}
        title={rainOn ? "Soft rain on" : "Turn on soft rain"}
      >
        <CloudRain className="h-5 w-5" />
        <span>{rainOn ? "Rain On" : "Rain Off"}</span>
      </button>
    </div>
  );
}
