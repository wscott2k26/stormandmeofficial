import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
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
    rainGain.gain.value = motion ? 0.9 : 0;
    rainGain.connect(master);
    rainGainRef.current = rainGain;

    const buffer = ctx.createBuffer(2, ctx.sampleRate * 6, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel += 1) {
      const data = buffer.getChannelData(channel);
      let previous = 0;
      for (let i = 0; i < data.length; i += 1) {
        const white = Math.random() * 2 - 1;
        previous = previous * 0.76 + white * 0.24;
        const distantRumble = Math.sin((i / ctx.sampleRate) * Math.PI * 0.7) * 0.035;
        data[i] = previous * 0.62 + distantRumble;
      }
    }

    const rain = ctx.createBufferSource();
    rain.buffer = buffer;
    rain.loop = true;
    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 420;
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 8200;
    rain.connect(highpass).connect(lowpass).connect(rainGain);
    rain.start();
    nodesRef.current.push(rain, highpass, lowpass);

    const pianoGain = ctx.createGain();
    pianoGain.gain.value = motion ? 0 : 0.38;
    pianoGain.connect(master);
    pianoGainRef.current = pianoGain;

    // Slow, spacious C-major / A-minor pattern in a lower register.
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

    rainGainRef.current.gain.linearRampToValueAtTime(motion ? 0.9 : 0, now + 3.5);
    pianoGainRef.current.gain.linearRampToValueAtTime(motion ? 0 : 0.38, now + 4.5);
  }, [motion]);

  useEffect(() => stopAll, []);

  return (
    <button
      type="button"
      onClick={toggleAudio}
      disabled={starting}
      className="fixed bottom-5 right-5 z-[80] inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/65 px-4 py-3 text-xs font-semibold text-white shadow-xl backdrop-blur-md transition hover:bg-black/80 disabled:opacity-70"
      aria-label={enabled ? "Turn ambient sound off" : "Turn ambient sound on"}
      title={enabled ? "Sound on — click to mute" : "Turn on rain and piano ambience"}
    >
      {enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      <span className="hidden sm:inline">
        {starting ? "Starting sound..." : enabled ? (motion ? "Rain ambience" : "Soft piano") : "Tap for sound"}
      </span>
    </button>
  );
}
