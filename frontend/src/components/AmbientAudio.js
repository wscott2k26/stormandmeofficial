import React, { useEffect, useRef, useState } from "react";
import { CloudRain, Music2 } from "lucide-react";

const RECORDED_PIANO_URL =
  "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Gymnopedie%20No%201.mp3";

export default function AmbientAudio() {
  const [rainOn, setRainOn] = useState(false);
  const [pianoOn, setPianoOn] = useState(false);
  const [starting, setStarting] = useState(false);

  const ctxRef = useRef(null);
  const rainGainRef = useRef(null);
  const rainNodesRef = useRef([]);
  const pianoAudioRef = useRef(null);
  const pianoFadeRef = useRef(null);

  const fadeRain = (target, seconds = 1.25) => {
    const ctx = ctxRef.current;
    const gainNode = rainGainRef.current;
    if (!ctx || !gainNode) return;

    const now = ctx.currentTime;
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(Math.max(gainNode.gain.value, 0.0001), now);
    gainNode.gain.linearRampToValueAtTime(target, now + seconds);
  };

  const fadeRecordedPiano = (target, duration = 1600, pauseWhenDone = false) => {
    const audio = pianoAudioRef.current;
    if (!audio) return;

    window.cancelAnimationFrame(pianoFadeRef.current);
    const startVolume = audio.volume;
    const startedAt = performance.now();

    const frame = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      audio.volume = Math.max(0, Math.min(1, startVolume + (target - startVolume) * eased));

      if (progress < 1) {
        pianoFadeRef.current = window.requestAnimationFrame(frame);
      } else if (pauseWhenDone) {
        audio.pause();
      }
    };

    pianoFadeRef.current = window.requestAnimationFrame(frame);
  };

  const ensureRainAudio = async () => {
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
    master.gain.value = 0.88;
    master.connect(ctx.destination);

    const rainGain = ctx.createGain();
    rainGain.gain.value = 0;
    rainGain.connect(master);
    rainGainRef.current = rainGain;

    const duration = 12;
    const rainBuffer = ctx.createBuffer(2, ctx.sampleRate * duration, ctx.sampleRate);

    for (let channel = 0; channel < 2; channel += 1) {
      const data = rainBuffer.getChannelData(channel);
      let slow = 0;
      let slower = 0;

      for (let i = 0; i < data.length; i += 1) {
        const white = Math.random() * 2 - 1;
        slow = slow * 0.988 + white * 0.012;
        slower = slower * 0.999 + white * 0.001;
        data[i] = slow * 0.2 + slower * 0.11;
      }

      // Scattered close droplets keep the rain from sounding like television static.
      for (let drop = 0; drop < 520; drop += 1) {
        const start = Math.floor(Math.random() * (data.length - 1800));
        const length = 180 + Math.floor(Math.random() * 900);
        const strength = 0.012 + Math.random() * 0.038;
        const pitch = 240 + Math.random() * 820;
        const decay = 13 + Math.random() * 18;

        for (let j = 0; j < length && start + j < data.length; j += 1) {
          const t = j / ctx.sampleRate;
          const envelope = Math.exp(-t * decay);
          data[start + j] += Math.sin(2 * Math.PI * pitch * t) * envelope * strength;
        }
      }
    }

    const rainSource = ctx.createBufferSource();
    rainSource.buffer = rainBuffer;
    rainSource.loop = true;

    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 75;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 2800;
    lowpass.Q.value = 0.18;

    const warmth = ctx.createBiquadFilter();
    warmth.type = "lowshelf";
    warmth.frequency.value = 340;
    warmth.gain.value = 4.5;

    rainSource.connect(highpass).connect(lowpass).connect(warmth).connect(rainGain);
    rainSource.start();

    rainNodesRef.current = [rainSource, highpass, lowpass, warmth, rainGain, master];
    return true;
  };

  const toggleRain = async () => {
    setStarting(true);
    try {
      const ready = await ensureRainAudio();
      if (!ready) return;

      const next = !rainOn;
      setRainOn(next);
      fadeRain(next ? 0.72 : 0, next ? 1.2 : 0.8);
    } finally {
      setStarting(false);
    }
  };

  const togglePiano = async () => {
    const audio = pianoAudioRef.current;
    if (!audio) return;

    setStarting(true);
    try {
      if (pianoOn) {
        setPianoOn(false);
        fadeRecordedPiano(0, 1000, true);
        return;
      }

      audio.volume = 0;
      await audio.play();
      setPianoOn(true);
      fadeRecordedPiano(0.2, 1900);
    } catch (error) {
      console.warn("Recorded piano could not start:", error);
      setPianoOn(false);
    } finally {
      setStarting(false);
    }
  };

  useEffect(() => {
    const audio = new Audio(RECORDED_PIANO_URL);
    audio.loop = true;
    audio.preload = "metadata";
    audio.volume = 0;
    audio.setAttribute("playsinline", "");
    pianoAudioRef.current = audio;

    return () => {
      window.cancelAnimationFrame(pianoFadeRef.current);
      audio.pause();
      audio.src = "";

      rainNodesRef.current.forEach((node) => {
        try {
          node.stop?.();
        } catch (_) {}
        try {
          node.disconnect?.();
        } catch (_) {}
      });

      try {
        ctxRef.current?.close();
      } catch (_) {}
    };
  }, []);

  const buttonClass =
    "inline-flex min-w-[116px] items-center justify-center gap-2 rounded-full border border-white/15 bg-black/70 px-4 py-3 text-xs font-semibold text-white shadow-xl backdrop-blur-md transition hover:bg-black/85 disabled:cursor-wait disabled:opacity-60";

  return (
    <div
      className="fixed bottom-5 right-5 z-[80] flex flex-col items-end gap-2"
      aria-label="Ambient sound controls"
    >
      <button
        type="button"
        onClick={togglePiano}
        disabled={starting}
        className={`${buttonClass} ${pianoOn ? "border-storm-gold ring-1 ring-storm-gold/40" : ""}`}
        aria-pressed={pianoOn}
        aria-label={pianoOn ? "Turn recorded piano music off" : "Turn recorded piano music on"}
        title="Turn slow recorded piano on or off"
      >
        <Music2 className="h-4 w-4" />
        <span>{pianoOn ? "Piano On" : "Piano Off"}</span>
      </button>

      <button
        type="button"
        onClick={toggleRain}
        disabled={starting}
        className={`${buttonClass} ${rainOn ? "border-storm-blue ring-1 ring-storm-blue/40" : ""}`}
        aria-pressed={rainOn}
        aria-label={rainOn ? "Turn rain sound off" : "Turn rain sound on"}
        title="Turn gentle rain on or off"
      >
        <CloudRain className="h-4 w-4" />
        <span>{rainOn ? "Rain On" : "Rain Off"}</span>
      </button>
    </div>
  );
}
