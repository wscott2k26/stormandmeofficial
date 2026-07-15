import React, { useEffect, useRef, useState } from "react";
import { CloudRain, Music2 } from "lucide-react";
import { useStorm } from "../context/StormContext";

const KEY = "storm-audio-enabled";

export default function AmbientAudio() {
  const { motion } = useStorm();
  const [enabled, setEnabled] = useState(false);
  const [starting, setStarting] = useState(false);
  const ctxRef = useRef(null);
  const masterRef = useRef(null);
  const rainGainRef = useRef(null);
  const pianoGainRef = useRef(null);
  const nodesRef = useRef([]);
  const pianoTimerRef = useRef(null);

  const stopAll = () => {
    clearInterval(pianoTimerRef.current);
    pianoTimerRef.current = null;
    nodesRef.current.forEach((node) => {
      try { node.stop?.(); } catch (_) {}
      try { node.disconnect?.(); } catch (_) {}
    });
    nodesRef.current = [];
    if (ctxRef.current) {
      try { ctxRef.current.close(); } catch (_) {}
    }
    ctxRef.current = null;
    masterRef.current = null;
    rainGainRef.current = null;
    pianoGainRef.current = null;
  };

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
    master.gain.value = 0.46;
    master.connect(ctx.destination);
    masterRef.current = master;

    const rainGain = ctx.createGain();
    rainGain.gain.value = motion ? 0.52 : 0;
    rainGain.connect(master);
    rainGainRef.current = rainGain;

    const buffer = ctx.createBuffer(2, ctx.sampleRate * 6, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel += 1) {
      const data = buffer.getChannelData(channel);
      let previous = 0;
      for (let i = 0; i < data.length; i += 1) {
        const white = Math.random() * 2 - 1;
        previous = previous * 0.82 + white * 0.18;
        data[i] = previous * 0.40;
      }
    }

    const rain = ctx.createBufferSource();
    rain.buffer = buffer;
    rain.loop = true;
    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 180;
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 2600;
    rain.connect(highpass).connect(lowpass).connect(rainGain);
    rain.start();
    nodesRef.current.push(rain, highpass, lowpass);

    const pianoGain = ctx.createGain();
    pianoGain.gain.value = motion ? 0 : 0.38;
    pianoGain.connect(master);
    pianoGainRef.current = pianoGain;

    const notes = [130.81, 164.81, 196.0, 220.0, 196.0, 174.61, 146.83, 164.81];
    let index = 0;

    const playNote = () => {
      const activeCtx = ctxRef.current;
      const activePianoGain = pianoGainRef.current;
      if (!activeCtx || !activePianoGain) return;

      const now = activeCtx.currentTime;
      const osc = activeCtx.createOscillator();
      const overtone = activeCtx.createOscillator();
      const gain = activeCtx.createGain();
      const filter = activeCtx.createBiquadFilter();
      const frequency = notes[index % notes.length];

      osc.type = "sine";
      overtone.type = "triangle";
      osc.frequency.value = frequency;
      overtone.frequency.value = frequency * 2;
      filter.type = "lowpass";
      filter.frequency.value = 1050;
      filter.Q.value = 0.7;

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.055, now + 0.75);
      gain.gain.exponentialRampToValueAtTime(0.018, now + 3.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 8.6);

      osc.connect(gain);
      overtone.connect(gain);
      gain.connect(filter).connect(activePianoGain);
      osc.start(now);
      overtone.start(now);
      osc.stop(now + 8.8);
      overtone.stop(now + 8.8);
      index += 1;
    };

    playNote();
    pianoTimerRef.current = setInterval(playNote, 7600);
    return true;
  };

  const toggleAudio = async () => {
    if (enabled) {
      stopAll();
      setEnabled(false);
      localStorage.setItem(KEY, "off");
      return;
    }

    setStarting(true);
    try {
      const started = await buildAudio();
      if (started) {
        setEnabled(true);
        localStorage.setItem(KEY, "on");
      }
    } finally {
      setStarting(false);
    }
  };

  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx || !rainGainRef.current || !pianoGainRef.current) return;
    const now = ctx.currentTime;

    rainGainRef.current.gain.cancelScheduledValues(now);
    rainGainRef.current.gain.setValueAtTime(rainGainRef.current.gain.value, now);
    pianoGainRef.current.gain.cancelScheduledValues(now);
    pianoGainRef.current.gain.setValueAtTime(pianoGainRef.current.gain.value, now);

    rainGainRef.current.gain.linearRampToValueAtTime(motion ? 0.52 : 0, now + 3.5);
    pianoGainRef.current.gain.linearRampToValueAtTime(motion ? 0 : 0.38, now + 4.5);
  }, [motion]);

  useEffect(() => stopAll, []);

  const buttonClass = "inline-flex min-w-[116px] items-center justify-center gap-2 rounded-full border border-white/15 bg-black/70 px-4 py-3 text-xs font-semibold text-white shadow-xl backdrop-blur-md transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="fixed bottom-5 right-5 z-[80] flex flex-col items-end gap-2" aria-label="Ambient sound controls">
      <button
        type="button"
        onClick={toggleAudio}
        disabled={motion || starting}
        className={`${buttonClass} ${enabled && !motion ? "border-storm-gold" : ""}`}
        aria-pressed={enabled && !motion}
        aria-label={enabled && !motion ? "Turn piano off" : "Turn piano on after the storm"}
        title={motion ? "Switch to the calm sky to hear piano" : "Turn slow piano on or off"}
      >
        <Music2 className="h-4 w-4" />
        <span>{enabled && !motion ? "Piano On" : "Piano Off"}</span>
      </button>

      <button
        type="button"
        onClick={toggleAudio}
        disabled={!motion || starting}
        className={`${buttonClass} ${enabled && motion ? "border-storm-blue" : ""}`}
        aria-pressed={enabled && motion}
        aria-label={enabled && motion ? "Turn rain sound off" : "Turn rain sound on"}
        title={!motion ? "Bring the storm back to hear rain" : "Turn soft rain on or off"}
      >
        <CloudRain className="h-4 w-4" />
        <span>{enabled && motion ? "Rain On" : "Rain Off"}</span>
      </button>
    </div>
  );
}
