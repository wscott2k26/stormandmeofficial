import React from "react";
import { useLocation } from "react-router-dom";
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
  const location = useLocation();

  if (location.pathname !== "/") return null;

  return (
    <div
      className={`cinematic-clouds ${motion ? "clouds-storm" : "clouds-calm"}`}
      aria-hidden="true"
    >
      <div className="cloud-sky-tint" />
      <div className="cloud-band cloud-band-far" />
      <div className="cloud-band cloud-band-mid" />
      <div className="cloud-band cloud-band-near" />

      <div className="city-light-field">
        {CITY_LIGHTS.map((light, index) => (
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
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          pointer-events: none;
          z-index: 1;
        }

        .cloud-sky-tint,
        .cloud-band,
        .city-light-field {
          position: absolute;
          pointer-events: none;
        }

        .cloud-sky-tint {
          inset: 0;
          z-index: 0;
          background:
            linear-gradient(180deg, rgba(7, 17, 34, 0.24) 0%, rgba(18, 34, 56, 0.08) 48%, transparent 74%);
          transition: opacity 3.6s ease, filter 3.6s ease;
        }

        .cloud-band {
          left: -48vw;
          width: 205vw;
          transform: translate3d(0, 0, 0);
          transform-origin: center top;
          will-change: transform, opacity;
          transition: opacity 3.8s ease, filter 3.8s ease;
          -webkit-mask-image: linear-gradient(to bottom, #000 0%, #000 62%, transparent 100%);
          mask-image: linear-gradient(to bottom, #000 0%, #000 62%, transparent 100%);
          mix-blend-mode: screen;
        }

        .cloud-band-far {
          z-index: 1;
          top: -15vh;
          height: 66vh;
          background:
            radial-gradient(ellipse 18% 30% at 7% 45%, rgba(167, 181, 201, 0.72) 0%, rgba(94, 111, 137, 0.48) 42%, rgba(34, 49, 72, 0.18) 61%, transparent 75%),
            radial-gradient(ellipse 24% 35% at 27% 38%, rgba(148, 164, 187, 0.76) 0%, rgba(82, 101, 129, 0.50) 44%, rgba(31, 47, 70, 0.17) 63%, transparent 77%),
            radial-gradient(ellipse 21% 31% at 50% 48%, rgba(158, 174, 195, 0.70) 0%, rgba(88, 106, 132, 0.46) 43%, rgba(32, 48, 70, 0.16) 62%, transparent 76%),
            radial-gradient(ellipse 25% 36% at 72% 36%, rgba(143, 160, 184, 0.74) 0%, rgba(78, 97, 124, 0.49) 45%, rgba(29, 45, 68, 0.17) 64%, transparent 78%),
            radial-gradient(ellipse 20% 31% at 92% 47%, rgba(157, 173, 195, 0.70) 0%, rgba(87, 105, 132, 0.46) 44%, rgba(31, 47, 70, 0.16) 62%, transparent 76%);
          filter: blur(22px) contrast(1.08);
          animation: cloudDriftFar 148s linear infinite;
        }

        .cloud-band-mid {
          z-index: 2;
          top: -7vh;
          height: 58vh;
          background:
            radial-gradient(ellipse 17% 27% at 5% 39%, rgba(137, 153, 177, 0.78) 0%, rgba(69, 88, 117, 0.52) 45%, rgba(25, 40, 62, 0.18) 63%, transparent 76%),
            radial-gradient(ellipse 23% 32% at 25% 49%, rgba(149, 165, 188, 0.76) 0%, rgba(78, 96, 123, 0.51) 45%, rgba(27, 42, 64, 0.18) 64%, transparent 77%),
            radial-gradient(ellipse 19% 29% at 48% 35%, rgba(132, 149, 174, 0.80) 0%, rgba(65, 84, 113, 0.53) 46%, rgba(23, 38, 60, 0.18) 64%, transparent 77%),
            radial-gradient(ellipse 25% 34% at 70% 48%, rgba(146, 163, 187, 0.75) 0%, rgba(76, 94, 122, 0.50) 45%, rgba(27, 42, 64, 0.17) 64%, transparent 77%),
            radial-gradient(ellipse 19% 28% at 91% 36%, rgba(136, 153, 178, 0.78) 0%, rgba(68, 87, 116, 0.51) 46%, rgba(24, 39, 61, 0.18) 64%, transparent 76%);
          filter: blur(17px) contrast(1.12);
          animation: cloudDriftMid 104s linear infinite;
        }

        .cloud-band-near {
          z-index: 3;
          top: 3vh;
          height: 50vh;
          background:
            radial-gradient(ellipse 19% 27% at 9% 33%, rgba(181, 193, 210, 0.55) 0%, rgba(103, 119, 143, 0.34) 46%, transparent 73%),
            radial-gradient(ellipse 26% 32% at 35% 43%, rgba(166, 180, 200, 0.58) 0%, rgba(94, 111, 136, 0.35) 47%, transparent 74%),
            radial-gradient(ellipse 20% 28% at 61% 31%, rgba(185, 197, 213, 0.52) 0%, rgba(106, 121, 145, 0.32) 46%, transparent 73%),
            radial-gradient(ellipse 25% 31% at 85% 42%, rgba(169, 183, 202, 0.56) 0%, rgba(96, 113, 138, 0.34) 47%, transparent 74%);
          filter: blur(30px);
          animation: cloudDriftNear 82s ease-in-out infinite alternate;
        }

        .clouds-storm .cloud-band-far { opacity: 0.56; }
        .clouds-storm .cloud-band-mid { opacity: 0.50; }
        .clouds-storm .cloud-band-near { opacity: 0.28; }

        .clouds-calm .cloud-sky-tint {
          opacity: 0.08;
          filter: brightness(1.4) saturate(0.65);
        }

        .clouds-calm .cloud-band {
          filter: blur(28px) brightness(1.45) saturate(0.45);
        }

        .clouds-calm .cloud-band-far { opacity: 0.13; }
        .clouds-calm .cloud-band-mid { opacity: 0.085; }
        .clouds-calm .cloud-band-near { opacity: 0.045; }

        .city-light-field {
          inset: 0;
          z-index: 5;
          opacity: 0.72;
          transition: opacity 3s ease;
        }

        .clouds-calm .city-light-field { opacity: 0.18; }

        .city-light {
          position: absolute;
          left: var(--light-x);
          top: var(--light-y);
          width: var(--light-size);
          height: var(--light-size);
          border-radius: 999px;
          background: rgba(255, 222, 144, 0.9);
          box-shadow:
            0 0 4px rgba(255, 214, 120, 0.78),
            0 0 10px rgba(255, 190, 76, 0.30);
          animation: cityLightFlicker var(--light-duration) ease-in-out var(--light-delay) infinite;
          opacity: 0.46;
        }

        .street-light {
          background: rgba(255, 206, 113, 0.95);
          box-shadow:
            0 0 5px rgba(255, 216, 131, 0.82),
            0 0 16px rgba(255, 172, 65, 0.36),
            0 8px 18px rgba(255, 172, 65, 0.12);
        }

        @keyframes cloudDriftFar {
          from { transform: translate3d(-5vw, 0, 0) scale(1.02); }
          to { transform: translate3d(39vw, 1.5vh, 0) scale(1.06); }
        }

        @keyframes cloudDriftMid {
          from { transform: translate3d(36vw, 0, 0) scale(1.01); }
          to { transform: translate3d(-9vw, 2vh, 0) scale(1.05); }
        }

        @keyframes cloudDriftNear {
          from { transform: translate3d(-3vw, -1vh, 0) scale(1.03); }
          to { transform: translate3d(20vw, 3vh, 0) scale(1.08); }
        }

        @keyframes cityLightFlicker {
          0%, 7%, 13%, 37%, 44%, 72%, 100% { opacity: 0.46; filter: brightness(1); }
          9% { opacity: 0.66; filter: brightness(1.18); }
          40% { opacity: 0.34; filter: brightness(0.86); }
          75% { opacity: 0.58; filter: brightness(1.12); }
        }

        @media (max-width: 768px) {
          .cloud-band {
            left: -70vw;
            width: 242vw;
          }

          .cloud-band-far {
            top: -11vh;
            height: 55vh;
          }

          .cloud-band-mid {
            top: -4vh;
            height: 49vh;
          }

          .cloud-band-near { display: none; }
          .clouds-storm .cloud-band-far { opacity: 0.44; }
          .clouds-storm .cloud-band-mid { opacity: 0.39; }
          .city-light:nth-child(n + 9) { display: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .cloud-band,
          .city-light {
            animation: none !important;
          }

          .cloud-band {
            transform: translate3d(0, 0, 0) scale(1.04);
          }

          .city-light { opacity: 0.48; }
          .cloud-sky-tint,
          .cloud-band,
          .city-light-field { transition-duration: 0.01ms; }
        }
      `}</style>
    </div>
  );
}
