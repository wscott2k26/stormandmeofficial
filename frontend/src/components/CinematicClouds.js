import React from "react";
import { useStorm } from "../context/StormContext";

const CITY_LIGHTS = [
  { x: "58%", y: "33%", size: "3px", delay: "-2.1s", duration: "8.8s" },
  { x: "63%", y: "38%", size: "2px", delay: "-5.4s", duration: "11.2s" },
  { x: "68%", y: "31%", size: "3px", delay: "-1.3s", duration: "9.7s" },
  { x: "72%", y: "42%", size: "2px", delay: "-7.1s", duration: "12.6s" },
  { x: "77%", y: "35%", size: "3px", delay: "-3.8s", duration: "10.4s" },
  { x: "82%", y: "46%", size: "2px", delay: "-8.2s", duration: "13.1s" },
  { x: "87%", y: "39%", size: "3px", delay: "-4.4s", duration: "9.2s" },
  { x: "92%", y: "49%", size: "2px", delay: "-6.6s", duration: "11.8s" },
  { x: "61%", y: "57%", size: "4px", delay: "-2.8s", duration: "12.2s", street: true },
  { x: "70%", y: "63%", size: "4px", delay: "-8.4s", duration: "14.4s", street: true },
  { x: "80%", y: "69%", size: "5px", delay: "-5.1s", duration: "13.6s", street: true },
  { x: "89%", y: "76%", size: "5px", delay: "-9.7s", duration: "15.2s", street: true },
];

export default function CinematicClouds() {
  const { motion } = useStorm();

  return (
    <div className={`cinematic-clouds ${motion ? "clouds-storm" : "clouds-calm"}`} aria-hidden="true">
      <div className="cloud-mass cloud-one" />
      <div className="cloud-mass cloud-two" />
      <div className="cloud-mass cloud-three" />
      <div className="cloud-mass cloud-four" />

      <div className="city-light-field">
        {CITY_LIGHTS.map((light) => (
          <span
            key={`${light.x}-${light.y}`}
            className={`city-light ${light.street ? "street-light" : ""}`}
            style={{
              "--light-x": light.x,
              "--light-y": light.y,
              "--light-size": light.size,
              "--light-delay": light.delay,
              "--light-duration": light.duration,
            }}
          />
        ))}
      </div>

      <style>{`
        .cinematic-clouds {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
          z-index: 1;
        }

        .cloud-mass {
          position: absolute;
          left: 0;
          width: 48vw;
          min-width: 520px;
          height: 20vh;
          min-height: 150px;
          border-radius: 50%;
          background:
            radial-gradient(ellipse at 16% 62%, rgba(139, 153, 174, 0.76) 0%, rgba(82, 97, 121, 0.62) 23%, transparent 51%),
            radial-gradient(ellipse at 40% 42%, rgba(158, 171, 190, 0.78) 0%, rgba(92, 107, 130, 0.64) 25%, transparent 54%),
            radial-gradient(ellipse at 66% 58%, rgba(132, 147, 169, 0.75) 0%, rgba(73, 89, 113, 0.60) 24%, transparent 52%),
            radial-gradient(ellipse at 86% 43%, rgba(150, 165, 185, 0.72) 0%, rgba(85, 101, 125, 0.58) 25%, transparent 53%);
          filter: blur(13px) contrast(1.15);
          will-change: transform, opacity;
          opacity: 0.42;
          transition: opacity 3.4s ease, filter 3.4s ease;
        }

        .cloud-one {
          top: 7%;
          animation: driftRight 42s linear infinite;
          animation-delay: -19s;
        }

        .cloud-two {
          top: 23%;
          width: 56vw;
          opacity: 0.34;
          transform: scale(1.12);
          animation: driftLeft 56s linear infinite;
          animation-delay: -31s;
        }

        .cloud-three {
          top: -5%;
          width: 64vw;
          opacity: 0.30;
          filter: blur(18px) contrast(1.08);
          animation: driftRightWide 72s linear infinite;
          animation-delay: -47s;
        }

        .cloud-four {
          top: 35%;
          width: 42vw;
          opacity: 0.24;
          filter: blur(20px);
          animation: driftLeftShort 49s ease-in-out infinite alternate;
          animation-delay: -21s;
        }

        .clouds-calm .cloud-mass {
          opacity: 0.08;
          filter: blur(22px) brightness(1.25) saturate(0.55);
        }

        .city-light-field {
          position: absolute;
          inset: 0;
          z-index: 5;
          pointer-events: none;
          opacity: 0.82;
          transition: opacity 3s ease;
        }

        .clouds-calm .city-light-field { opacity: 0.20; }

        .city-light {
          position: absolute;
          left: var(--light-x);
          top: var(--light-y);
          width: var(--light-size);
          height: var(--light-size);
          border-radius: 999px;
          background: rgba(255, 224, 151, 0.96);
          box-shadow:
            0 0 5px rgba(255, 217, 128, 0.88),
            0 0 13px rgba(255, 188, 72, 0.42);
          animation: cityLightFlicker var(--light-duration) ease-in-out var(--light-delay) infinite;
          opacity: 0.52;
        }

        .street-light {
          background: rgba(255, 207, 116, 1);
          box-shadow:
            0 0 6px rgba(255, 220, 139, 0.92),
            0 0 19px rgba(255, 174, 65, 0.46),
            0 8px 22px rgba(255, 174, 65, 0.16);
        }

        @keyframes driftRight {
          from { transform: translate3d(-38vw, 0, 0) scale(1.02); }
          to { transform: translate3d(112vw, 2vh, 0) scale(1.07); }
        }

        @keyframes driftLeft {
          from { transform: translate3d(108vw, 0, 0) scale(1.12); }
          to { transform: translate3d(-48vw, 1vh, 0) scale(1.05); }
        }

        @keyframes driftRightWide {
          from { transform: translate3d(-55vw, -1vh, 0) scale(1.08); }
          to { transform: translate3d(105vw, 3vh, 0) scale(1.14); }
        }

        @keyframes driftLeftShort {
          from { transform: translate3d(58vw, -1vh, 0) scale(1.0); }
          to { transform: translate3d(6vw, 3vh, 0) scale(1.10); }
        }

        @keyframes cityLightFlicker {
          0%, 7%, 13%, 37%, 44%, 72%, 100% { opacity: 0.52; filter: brightness(1); }
          9% { opacity: 0.78; filter: brightness(1.24); }
          40% { opacity: 0.38; filter: brightness(0.84); }
          75% { opacity: 0.68; filter: brightness(1.16); }
        }

        @media (max-width: 768px) {
          .cloud-mass {
            min-width: 410px;
            width: 78vw;
            height: 18vh;
            min-height: 125px;
          }
          .cloud-three { display: none; }
          .cloud-four { opacity: 0.17; }
          .city-light:nth-child(n + 9) { display: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .cloud-mass,
          .city-light { animation: none !important; }
          .cloud-one { transform: translate3d(6vw, 0, 0); }
          .cloud-two { transform: translate3d(42vw, 0, 0); }
          .cloud-three { transform: translate3d(18vw, 0, 0); }
          .cloud-four { transform: translate3d(55vw, 0, 0); }
        }
      `}</style>
    </div>
  );
}
