import React, { useEffect, useRef, useState } from "react";
import { CloudRain, Music2, VolumeX } from "lucide-react";
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

  const buildRainBuffer = (ctx) => {
    const duration = 12;
    const buffer = ctx.createBuffer(2, ctx.sampleRate * duration, ctx.sampleRate);

    for (let channel = 0; channel < 2; channel += 1) {
      const data = buffer.getChannelData(channel);

      // Soft distant rain bed: low-level, smoothed noise instead of harsh white noise.
      let smooth = 0;
      for (let i = 0; i < data.length; i += 1) {
        const white = Math.random() * 2 - 1;
        smooth = smooth * 0.965 + white * 0.035;
        data[i] = smooth * 0.12;
      }

      // Individual droplets hitting glass and pavement.
      const dropCount = 1050;
      for (let d = 0; d < dropCount; d += 1) {
        const start = Math.floor(Math.random() * (data.length - 2200));
        const length = 120 + Math.floor(Math.random() * 1100);
        const strength = 0.025 + Math.random() * 0.15;
        const pitch = 900 + Math.random() * 3900;
        const decay = 5 + Math.random() * 15;

        for (let j = 0; j < length && start + j < data.length; j += 1) {
          const t = j / ctx.sampleRate;
          const envelope = Math.exp(-t * decay);
          const ping = Math.sin(2 * Math.PI * pitch * t) * envelope;
          const splash = (Math.random() * 2 - 1) * envelope * 0.5;
          data[start + j] += (ping * 0.45 + splash) * strength;
        }
      }
    }

    return buffer;
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
    rainGain.gain.value = motion ? 0.82 : 0;
    rainGain.connect(master);
    rainGainRef.current = rainGain;

    const rain = ctx.createBufferSource();
    rain.buffer = buildRainBuffer(ctx);
    rain.loop = true;

    const rainLow = ctx.createBiquadFilter();
    rainLow.type = "lowpass";
    rainLow.frequency.value = 5200;
    rainLow.Q.value = 0.35;

    const rainWarmth = ctx.createBiquadFilter();
    rainWarmth.type = "lowshelf";
    rainWarmth.frequency.value = 700;
    rainWarmth.gain.value = 5;

    const rainAir = ctx.createBiquadFilter();
    rainAir.type = "highshelf";
    rainAir.frequency.value = 4800;
    rainAir.gain.value = -8;

    rain.connect(rainLow).connect(rainWarmth).connect(rainAir).connect(rainGain);
    rain.start();
    nodesRef.current.push(rain, rainLow, rainWarmth, rainAir);

    const pianoGain = ctx.createGain();
    pianoGain.gain.value = motion ? 0 : 0.42;
    pianoGain.connect(master);
    pianoGainRef.current = pianoGain;

    // Slow, spacious C-major / A-minor pattern.
    const notes = [220.0, 261.63, 329.63, 392.0, 329.63, 293.66, 261.63, 196.0];
    let index = 0;

    const playNote = () => {
      const activeCtx = ctxRef.current;
      const activePianoGain = pianoGainRef.current;
      if (!activeCtx || !activePianoGain) return;

      const now = activeCtx.currentTime;
      const fundamental = activeCtx.createOscillator();
      const softBody = activeCtx.createOscillator();
      const gain = activeCtx.createGain();
      const filter = activeCtx.createBiquadFilter();

      fundamental.type = "sine";
      softBody.type = "triangle";
      fundamental.frequency.value = notes[index % notes.length];
      softBody.frequency.value = notes[index % notes.length] / 2;
      filter.type = "lowpass";
      filter.frequency.value = 1050;
      filter.Q.value = 0.4;

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.055, now + 0.45);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 7.2);

      fundamental.connect(gain);
      softBody.connect(gain);
      gain.connect(filter).connect(activePianoGain);

      fundamental.start(now);
      softBody.start(now);
      fundamental.stop(now + 7.4);
      softBody.stop(now + 7.4);
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

    rainGainRef.current.gain.linearRampToValueAtTime(motion ? 0.82 : 0, now + 3.5);
    pianoGainRef.current.gain.linearRampToValueAtTime(motion ? 0 : 0.42, now + 3.5);
  }, [motion]);

  useEffect(() => stopAll, []);

  const ActiveIcon = motion ? CloudRain : Music2;

  return (
    <button
      type="button"
      onClick={toggleAudio}
      disabled={starting}
      className="fixed bottom-5 right-5 z-[80] inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/65 px-4 py-3 text-xs font-semibold text-white shadow-xl backdrop-blur-md transition hover:bg-black/80 disabled:opacity-70"
      aria-label={enabled ? "Turn ambient sound off" : "Turn ambient sound on"}
      title={enabled ? "Sound on — click to mute" : "Turn on rain and piano ambience"}
    >
      {enabled ? <ActiveIcon className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      <span className="hidden sm:inline">
        {starting ? "Starting sound..." : enabled ? (motion ? "Rain on window" : "Peaceful piano") : "Tap for sound"}
      </span>
    </button>
  );
}
