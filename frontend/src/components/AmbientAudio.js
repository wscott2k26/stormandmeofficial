import React, { useEffect, useRef, useState } from "react";
import { CloudRain, Music2 } from "lucide-react";

export default function AmbientAudio() {
  const [rainOn, setRainOn] = useState(false);
  const [pianoOn, setPianoOn] = useState(false);
  const [starting, setStarting] = useState(false);
  const ctxRef = useRef(null);
  const rainGainRef = useRef(null);
  const pianoGainRef = useRef(null);
  const nodesRef = useRef([]);
  const pianoTimerRef = useRef(null);

  const buildAudio = async () => {
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

    const rainGain = ctx.createGain();
    rainGain.gain.value = 0;
    rainGain.connect(master);
    rainGainRef.current = rainGain;

    const buffer = ctx.createBuffer(2, ctx.sampleRate * 6, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel += 1) {
      const data = buffer.getChannelData(channel);
      let smooth = 0;
      for (let i = 0; i < data.length; i += 1) {
        const white = Math.random() * 2 - 1;
        smooth = smooth * 0.94 + white * 0.06;
        data[i] = smooth * 0.24;
      }
    }

    const rain = ctx.createBufferSource();
    rain.buffer = buffer;
    rain.loop = true;

    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 120;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 1800;

    rain.connect(highpass).connect(lowpass).connect(rainGain);
    rain.start();
    nodesRef.current.push(rain, highpass, lowpass);

    const pianoGain = ctx.createGain();
    pianoGain.gain.value = 0;
    pianoGain.connect(master);
    pianoGainRef.current = pianoGain;

    const notes = [130.81, 164.81, 196.0, 220.0, 196.0, 174.61, 146.83, 164.81];
    let noteIndex = 0;

    const playNote = () => {
      const activeCtx = ctxRef.current;
      const activePianoGain = pianoGainRef.current;
      if (!activeCtx || !activePianoGain) return;

      const now = activeCtx.currentTime;
      const tone = activeCtx.createOscillator();
      const body = activeCtx.createOscillator();
      const noteGain = activeCtx.createGain();
      const filter = activeCtx.createBiquadFilter();
      const frequency = notes[noteIndex % notes.length];

      tone.type = "sine";
      body.type = "triangle";
      tone.frequency.value = frequency;
      body.frequency.value = frequency * 2;
      filter.type = "lowpass";
      filter.frequency.value = 950;

      noteGain.gain.setValueAtTime(0.0001, now);
      noteGain.gain.exponentialRampToValueAtTime(0.045, now + 0.8);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 8.5);

      tone.connect(noteGain);
      body.connect(noteGain);
      noteGain.connect(filter).connect(activePianoGain);
      tone.start(now);
      body.start(now);
      tone.stop(now + 8.7);
      body.stop(now + 8.7);
      noteIndex += 1;
    };

    playNote();
    pianoTimerRef.current = window.setInterval(playNote, 8200);
    return true;
  };

  const fadeTo = (gainRef, value) => {
    const ctx = ctxRef.current;
    const gainNode = gainRef.current;
    if (!ctx || !gainNode) return;
    const now = ctx.currentTime;
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    gainNode.gain.linearRampToValueAtTime(value, now + 1.5);
  };

  const toggleRain = async () => {
    setStarting(true);
    try {
      const ready = await buildAudio();
      if (!ready) return;
      const next = !rainOn;
      setRainOn(next);
      fadeTo(rainGainRef, next ? 0.28 : 0);
    } finally {
      setStarting(false);
    }
  };

  const togglePiano = async () => {
    setStarting(true);
    try {
      const ready = await buildAudio();
      if (!ready) return;
      const next = !pianoOn;
      setPianoOn(next);
      fadeTo(pianoGainRef, next ? 0.34 : 0);
    } finally {
      setStarting(false);
    }
  };

  useEffect(() => {
    return () => {
      window.clearInterval(pianoTimerRef.current);
      nodesRef.current.forEach((node) => {
        try { node.stop?.(); } catch (_) {}
        try { node.disconnect?.(); } catch (_) {}
      });
      try { ctxRef.current?.close(); } catch (_) {}
    };
  }, []);

  const baseClass = "inline-flex min-w-[116px] items-center justify-center gap-2 rounded-full border border-white/15 bg-black/70 px-4 py-3 text-xs font-semibold text-white shadow-xl backdrop-blur-md transition hover:bg-black/85 disabled:opacity-60";

  return (
    <div className="fixed bottom-5 right-5 z-[90] flex flex-col items-end gap-2" aria-label="Ambient sound controls">
      <button
        type="button"
        onClick={togglePiano}
        disabled={starting}
        className={`${baseClass} ${pianoOn ? "border-storm-gold bg-storm-gold/15" : ""}`}
        aria-pressed={pianoOn}
        aria-label={pianoOn ? "Turn slow piano off" : "Turn slow piano on"}
      >
        <Music2 className="h-4 w-4" />
        <span>Piano {pianoOn ? "On" : "Off"}</span>
      </button>

      <button
        type="button"
        onClick={toggleRain}
        disabled={starting}
        className={`${baseClass} ${rainOn ? "border-storm-blue bg-storm-blue/15" : ""}`}
        aria-pressed={rainOn}
        aria-label={rainOn ? "Turn soft rain off" : "Turn soft rain on"}
      >
        <CloudRain className="h-4 w-4" />
        <span>Rain {rainOn ? "On" : "Off"}</span>
      </button>
    </div>
  );
}
