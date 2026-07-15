import React, { useEffect, useRef, useState } from "react";
import { CloudRain, Music2 } from "lucide-react";

export default function AmbientAudio() {
  const [rainOn, setRainOn] = useState(false);
  const [pianoOn, setPianoOn] = useState(false);
  const [starting, setStarting] = useState(false);

  const ctxRef = useRef(null);
  const rainGainRef = useRef(null);
  const pianoGainRef = useRef(null);
  const persistentNodesRef = useRef([]);
  const pianoTimerRef = useRef(null);

  const fadeGain = (gainNode, target, seconds = 1.6) => {
    const ctx = ctxRef.current;
    if (!ctx || !gainNode) return;

    const now = ctx.currentTime;
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(Math.max(gainNode.gain.value, 0.0001), now);
    gainNode.gain.linearRampToValueAtTime(target, now + seconds);
  };

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
    master.gain.value = 0.54;
    master.connect(ctx.destination);

    // Soft rain bed: heavily filtered noise with a warm, distant character.
    const rainGain = ctx.createGain();
    rainGain.gain.value = 0;
    rainGain.connect(master);
    rainGainRef.current = rainGain;

    const rainBuffer = ctx.createBuffer(2, ctx.sampleRate * 8, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel += 1) {
      const data = rainBuffer.getChannelData(channel);
      let slow = 0;
      let slower = 0;

      for (let i = 0; i < data.length; i += 1) {
        const white = Math.random() * 2 - 1;
        slow = slow * 0.992 + white * 0.008;
        slower = slower * 0.9992 + white * 0.0008;
        data[i] = slow * 0.11 + slower * 0.07;
      }
    }

    const rainSource = ctx.createBufferSource();
    rainSource.buffer = rainBuffer;
    rainSource.loop = true;

    const rainHighpass = ctx.createBiquadFilter();
    rainHighpass.type = "highpass";
    rainHighpass.frequency.value = 90;

    const rainLowpass = ctx.createBiquadFilter();
    rainLowpass.type = "lowpass";
    rainLowpass.frequency.value = 1500;
    rainLowpass.Q.value = 0.25;

    const rainWarmth = ctx.createBiquadFilter();
    rainWarmth.type = "lowshelf";
    rainWarmth.frequency.value = 330;
    rainWarmth.gain.value = 4;

    rainSource
      .connect(rainHighpass)
      .connect(rainLowpass)
      .connect(rainWarmth)
      .connect(rainGain);
    rainSource.start();

    // Piano bus with a small synthetic room so the arrangement feels spacious.
    const pianoGain = ctx.createGain();
    pianoGain.gain.value = 0;
    pianoGain.connect(master);
    pianoGainRef.current = pianoGain;

    const convolver = ctx.createConvolver();
    const impulseLength = Math.floor(ctx.sampleRate * 2.7);
    const impulse = ctx.createBuffer(2, impulseLength, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel += 1) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < impulseLength; i += 1) {
        const decay = Math.pow(1 - i / impulseLength, 2.5);
        data[i] = (Math.random() * 2 - 1) * decay * 0.22;
      }
    }
    convolver.buffer = impulse;

    const roomGain = ctx.createGain();
    roomGain.gain.value = 0.24;
    pianoGain.connect(convolver).connect(roomGain).connect(master);

    const playPianoVoice = (frequency, start, level = 0.032, duration = 7.2) => {
      const fundamental = ctx.createOscillator();
      const warmth = ctx.createOscillator();
      const shimmer = ctx.createOscillator();
      const noteGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      fundamental.type = "triangle";
      warmth.type = "sine";
      shimmer.type = "sine";
      fundamental.frequency.value = frequency;
      warmth.frequency.value = frequency / 2;
      shimmer.frequency.value = frequency * 2;

      filter.type = "lowpass";
      filter.frequency.value = 1250;
      filter.Q.value = 0.4;

      noteGain.gain.setValueAtTime(0.0001, start);
      noteGain.gain.exponentialRampToValueAtTime(level, start + 0.035);
      noteGain.gain.exponentialRampToValueAtTime(level * 0.38, start + 1.2);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      fundamental.connect(noteGain);
      warmth.connect(noteGain);
      shimmer.connect(noteGain);
      noteGain.connect(filter).connect(pianoGain);

      fundamental.start(start);
      warmth.start(start);
      shimmer.start(start);
      fundamental.stop(start + duration + 0.1);
      warmth.stop(start + duration + 0.1);
      shimmer.stop(start + duration + 0.1);
    };

    const progression = [
      { chord: [130.81, 164.81, 196.0, 246.94], melody: [329.63, 392.0] },
      { chord: [110.0, 130.81, 164.81, 196.0], melody: [261.63, 329.63] },
      { chord: [87.31, 130.81, 174.61, 220.0], melody: [261.63, 293.66] },
      { chord: [98.0, 146.83, 196.0, 220.0], melody: [246.94, 293.66] },
    ];
    let phraseIndex = 0;

    const playPhrase = () => {
      const activeCtx = ctxRef.current;
      if (!activeCtx || activeCtx.state === "closed") return;

      const phrase = progression[phraseIndex % progression.length];
      const now = activeCtx.currentTime + 0.05;

      phrase.chord.forEach((frequency, index) => {
        playPianoVoice(frequency, now + index * 0.12, 0.025, 7.6);
      });
      playPianoVoice(phrase.melody[0], now + 1.45, 0.021, 4.8);
      playPianoVoice(phrase.melody[1], now + 3.85, 0.019, 4.4);

      phraseIndex += 1;
    };

    playPhrase();
    pianoTimerRef.current = window.setInterval(playPhrase, 7200);

    persistentNodesRef.current = [
      rainSource,
      rainHighpass,
      rainLowpass,
      rainWarmth,
      rainGain,
      pianoGain,
      convolver,
      roomGain,
      master,
    ];

    return true;
  };

  const toggleRain = async () => {
    setStarting(true);
    try {
      const ready = await ensureAudio();
      if (!ready) return;

      const next = !rainOn;
      setRainOn(next);
      fadeGain(rainGainRef.current, next ? 0.34 : 0);
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
      fadeGain(pianoGainRef.current, next ? 0.8 : 0, 2.2);
    } finally {
      setStarting(false);
    }
  };

  useEffect(() => {
    return () => {
      window.clearInterval(pianoTimerRef.current);
      persistentNodesRef.current.forEach((node) => {
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
        aria-label={pianoOn ? "Turn piano music off" : "Turn piano music on"}
        title="Turn slow piano music on or off"
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
