import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useStorm } from "../context/StormContext";

const KEY = "storm-audio-enabled";

export default function AmbientAudio() {
  const { motion } = useStorm();
  const [enabled, setEnabled] = useState(() => localStorage.getItem(KEY) === "on");
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
    if (ctxRef.current) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    await ctx.resume();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = 0.34;
    master.connect(ctx.destination);
    masterRef.current = master;

    const rainGain = ctx.createGain();
    rainGain.gain.value = motion ? 0.72 : 0;
    rainGain.connect(master);
    rainGainRef.current = rainGain;

    const buffer = ctx.createBuffer(2, ctx.sampleRate * 5, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel += 1) {
      const data = buffer.getChannelData(channel);
      let previous = 0;
      for (let i = 0; i < data.length; i += 1) {
        const white = Math.random() * 2 - 1;
        previous = previous * 0.82 + white * 0.18;
        data[i] = previous * 0.48;
      }
    }
    const rain = ctx.createBufferSource();
    rain.buffer = buffer;
    rain.loop = true;
    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 700;
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 7600;
    rain.connect(highpass).connect(lowpass).connect(rainGain);
    rain.start();
    nodesRef.current.push(rain, highpass, lowpass);

    const pianoGain = ctx.createGain();
    pianoGain.gain.value = motion ? 0 : 0.6;
    pianoGain.connect(master);
    pianoGainRef.current = pianoGain;

    const notes = [261.63, 329.63, 392.0, 493.88, 440.0, 349.23, 293.66, 392.0];
    let index = 0;
    const playNote = () => {
      if (!ctxRef.current || !pianoGainRef.current) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const overtone = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      osc.type = "sine";
      overtone.type = "sine";
      osc.frequency.value = notes[index % notes.length];
      overtone.frequency.value = notes[index % notes.length] * 2;
      filter.type = "lowpass";
      filter.frequency.value = 1800;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.8);
      osc.connect(gain);
      overtone.connect(gain);
      gain.connect(filter).connect(pianoGain);
      osc.start(now);
      overtone.start(now);
      osc.stop(now + 5);
      overtone.stop(now + 5);
      index += 1;
    };
    playNote();
    pianoTimerRef.current = setInterval(playNote, 4200);
  };

  useEffect(() => {
    localStorage.setItem(KEY, enabled ? "on" : "off");
    if (enabled) buildAudio();
    else stopAll();
    return undefined;
  }, [enabled]);

  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx || !rainGainRef.current || !pianoGainRef.current) return;
    const now = ctx.currentTime;
    rainGainRef.current.gain.cancelScheduledValues(now);
    pianoGainRef.current.gain.cancelScheduledValues(now);
    rainGainRef.current.gain.linearRampToValueAtTime(motion ? 0.72 : 0, now + 3);
    pianoGainRef.current.gain.linearRampToValueAtTime(motion ? 0 : 0.6, now + 3);
  }, [motion]);

  useEffect(() => stopAll, []);

  return (
    <button
      type="button"
      onClick={() => setEnabled((value) => !value)}
      className="fixed bottom-5 right-5 z-[80] inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/55 px-4 py-3 text-xs font-semibold text-white shadow-xl backdrop-blur-md transition hover:bg-black/75"
      aria-label={enabled ? "Turn ambient sound off" : "Turn ambient sound on"}
      title={enabled ? "Sound on — click to mute" : "Turn on rain and piano ambience"}
    >
      {enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      <span className="hidden sm:inline">{enabled ? (motion ? "Rain ambience" : "Peaceful piano") : "Sound off"}</span>
    </button>
  );
}
