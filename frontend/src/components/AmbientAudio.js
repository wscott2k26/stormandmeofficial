import React, { useEffect, useRef, useState } from "react";
import { CloudRain, Music2 } from "lucide-react";

const RECORDED_PIANO_URL =
  "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Gymnopedie%20No%201.mp3";
const RECORDED_RAIN_URL =
  "https://assets.mixkit.co/active_storage/sfx/1253/1253.wav";

export default function AmbientAudio() {
  const [rainOn, setRainOn] = useState(false);
  const [pianoOn, setPianoOn] = useState(false);
  const [starting, setStarting] = useState(false);

  const rainAudioRef = useRef(null);
  const pianoAudioRef = useRef(null);
  const rainFadeRef = useRef(null);
  const pianoFadeRef = useRef(null);

  const fadeRain = (target, duration = 1400, pauseWhenDone = false) => {
    const audio = rainAudioRef.current;
    if (!audio) return;

    window.cancelAnimationFrame(rainFadeRef.current);
    const startVolume = audio.volume;
    const startedAt = window.performance.now();

    const frame = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      audio.volume = Math.max(
        0,
        Math.min(1, startVolume + (target - startVolume) * eased)
      );

      if (progress < 1) {
        rainFadeRef.current = window.requestAnimationFrame(frame);
      } else if (pauseWhenDone) {
        audio.pause();
      }
    };

    rainFadeRef.current = window.requestAnimationFrame(frame);
  };

  const fadePiano = (target, duration = 1600, pauseWhenDone = false) => {
    const audio = pianoAudioRef.current;
    if (!audio) return;

    window.cancelAnimationFrame(pianoFadeRef.current);
    const startVolume = audio.volume;
    const startedAt = window.performance.now();

    const frame = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      audio.volume = Math.max(
        0,
        Math.min(1, startVolume + (target - startVolume) * eased)
      );

      if (progress < 1) {
        pianoFadeRef.current = window.requestAnimationFrame(frame);
      } else if (pauseWhenDone) {
        audio.pause();
      }
    };

    pianoFadeRef.current = window.requestAnimationFrame(frame);
  };

  const toggleRain = async () => {
    const audio = rainAudioRef.current;
    if (!audio) return;

    setStarting(true);
    try {
      if (rainOn) {
        setRainOn(false);
        fadeRain(0, 900, true);
        return;
      }

      audio.volume = 0;
      await audio.play();
      setRainOn(true);
      fadeRain(0.34, 1600);
    } catch (error) {
      console.warn("Recorded rain could not start:", error);
      setRainOn(false);
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
        fadePiano(0, 1000, true);
        return;
      }

      audio.volume = 0;
      await audio.play();
      setPianoOn(true);
      fadePiano(0.2, 1900);
    } catch (error) {
      console.warn("Recorded piano could not start:", error);
      setPianoOn(false);
    } finally {
      setStarting(false);
    }
  };

  useEffect(() => {
    const rain = new window.Audio(RECORDED_RAIN_URL);
    rain.loop = true;
    rain.preload = "metadata";
    rain.volume = 0;
    rain.setAttribute("playsinline", "");
    rainAudioRef.current = rain;

    const piano = new window.Audio(RECORDED_PIANO_URL);
    piano.loop = true;
    piano.preload = "metadata";
    piano.volume = 0;
    piano.setAttribute("playsinline", "");
    pianoAudioRef.current = piano;

    return () => {
      window.cancelAnimationFrame(rainFadeRef.current);
      window.cancelAnimationFrame(pianoFadeRef.current);

      rain.pause();
      rain.src = "";
      piano.pause();
      piano.src = "";
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
        aria-label={rainOn ? "Turn recorded rain off" : "Turn recorded rain on"}
        title="Turn real recorded rain on or off"
      >
        <CloudRain className="h-4 w-4" />
        <span>{rainOn ? "Rain On" : "Rain Off"}</span>
      </button>
    </div>
  );
}
