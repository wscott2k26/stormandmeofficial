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
    <div
      className={`cinematic-clouds ${motion ? "clouds-storm" : "clouds-calm"}`}
      aria-hidden="true"
    >
      <div className="cloud-sky-tint" />
      <div className="cloud-band cloud-band-far" />
      <div className="cloud-band cloud-band-mid" />
      <div className="cloud-band cloud-band-near" />

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

        .cloud-sky-tint,
        .cloud-band,
        .city-light-field {
          position: absolute;
          pointer-events: none;
        }

        .cloud-sky-tint {
          inset: 0;
          z-index: 0;
          background: linear-gradient(180deg, rgba(18, 31, 51, 0.10) 0%, transparent 70%);
          transition: opacity 3.6s ease, filter 3.6s ease;
        }

        .cloud-band {
          left: -45%;
          width: 205%;
          transform: translate3d(0, 0, 0);
          transform-origin: center top;
          will-change: transform, opacity;
          transition: opacity 3.8s ease, filter 3.8s ease;
          -webkit-mask-image: linear-gradient(to bottom, #000 0%, #000 67%, transparent 100%);
          mask-image: linear-gradient(to bottom, #000 0%, #000 67%, transparent 100%);
          mix-blend-mode: screen;
        }

        .cloud-band-far {
          z-index: 1;
          top: -16%;
          height: 70%;
          background:
            radial-gradient(ellipse 18% 30% at 7% 45%, rgba(170, 184, 204, 0.82) 0%, rgba(92, 110, 138, 0.56) 42%, rgba(35, 50, 74, 0.18) 62%, transparent 76%),
            radial-gradient(ellipse 24% 35% at 27% 38%, rgba(154, 171, 195, 0.84) 0%, rgba(84, 103, 132, 0.56) 44%, rgba(32, 48, 72, 0.18) 63%, transparent 77%),
            radial-gradient(ellipse 21% 31% at 50% 48%, rgba(166, 181, 201, 0.80) 0%, rgba(91, 109, 136, 0.52) 43%, rgba(34, 49, 72, 0.17) 62%, transparent 76%),
            radial-gradient(ellipse 25% 36% at 72% 36%, rgba(149, 166, 190, 0.82) 0%, rgba(80, 99, 128, 0.55) 45%, rgba(30, 46, 70, 0.18) 64%, transparent 78%),
            radial-gradient(ellipse 20% 31% at 92% 47%, rgba(161, 177, 199, 0.80) 0%, rgba(89, 107, 135, 0.52) 44%, rgba(32, 48, 72, 0.17) 62%, transparent 76%);
          filter: blur(18px) contrast(1.14);
          animation: cloudDriftFar 78s linear infinite;
        }

        .cloud-band-mid {
          z-index: 2;
          top: -8%;
          height: 62%;
          background:
            radial-gradient(ellipse 17% 27% at 5% 39%, rgba(142, 159, 184, 0.86) 0%, rgba(72, 91, 121, 0.59) 45%, rgba(25, 41, 63, 0.19) 63%, transparent 76%),
            radial-gradient(ellipse 23% 32% at 25% 49%, rgba(154, 171, 194, 0.84) 0%, rgba(81, 99, 127, 0.58) 45%, rgba(28, 43, 66, 0.19) 64%, transparent 77%),
            radial-gradient(ellipse 19% 29% at 48% 35%, rgba(138, 155, 181, 0.88) 0%, rgba(68, 87, 117, 0.60) 46%, rgba(24, 39, 62, 0.19) 64%, transparent 77%),
            radial-gradient(ellipse 25% 34% at 70% 48%, rgba(151, 168, 192, 0.83) 0%, rgba(79, 97, 126, 0.57) 45%, rgba(28, 43, 66, 0.18) 64%, transparent 77%),
            radial-gradient(ellipse 19% 28% at 91% 36%, rgba(141, 158, 184, 0.86) 0%, rgba(71, 90, 120, 0.58) 46%, rgba(25, 40, 63, 0.19) 64%, transparent 76%);
          filter: blur(14px) contrast(1.18);
          animation: cloudDriftMid 61s linear infinite;
        }

        .cloud-band-near {
          z-index: 3;
          top: 2%;
          height: 54%;
          background:
            radial-gradient(ellipse 19% 27% at 9% 33%, rgba(188, 200, 216, 0.64) 0%, rgba(108, 124, 148, 0.40) 46%, transparent 73%),
            radial-gradient(ellipse 26% 32% at 35% 43%, rgba(174, 187, 205, 0.67) 0%, rgba(99, 116, 141, 0.41) 47%, transparent 74%),
            radial-gradient(ellipse 20% 28% at 61% 31%, rgba(191, 203, 218, 0.61) 0%, rgba(111, 126, 150, 0.38) 46%, transparent 73%),
            radial-gradient(ellipse 25% 31% at 85% 42%, rgba(176, 190, 208, 0.65) 0%, rgba(101, 118, 143, 0.40) 47%, transparent 74%);
          filter: blur(25px);
          animation: cloudDriftNear 49s ease-in-out infinite alternate;
        }

        .clouds-storm .cloud-band-far { opacity: 0.64; }
        .clouds-storm .cloud-band-mid { opacity: 0.57; }
        .clouds-storm .cloud-band-near { opacity: 0.31; }

        .clouds-calm .cloud-sky-tint {
          opacity: 0.05;
          filter: brightness(1.4) saturate(0.65);
        }

        .clouds-calm .cloud-band {
          filter: blur(27px) brightness(1.45) saturate(0.45);
        }

        .clouds-calm .cloud-band-far { opacity: 0.13; }
        .clouds-calm .cloud-band-mid { opacity: 0.085; }
        .clouds-calm .cloud-band-near { opacity: 0.045; }

        .city-light-field {
          inset: 0;
          z-index: 5;
          opacity: 0.78;
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
          background: rgba(255, 222, 144, 0.94);
          box-shadow:
            0 0 4px rgba(255, 214, 120, 0.82),
            0 0 11px rgba(255, 190, 76, 0.34);
          animation: cityLightFlicker var(--light-duration) ease-in-out var(--light-delay) infinite;
          opacity: 0.48;
        }

        .street-light {
          background: rgba(255, 206, 113, 0.98);
          box-shadow:
            0 0 5px rgba(255, 216, 131, 0.86),
            0 0 16px rgba(255, 172, 65, 0.40),
            0 8px 18px rgba(255, 172, 65, 0.14);
        }

        @keyframes cloudDriftFar {
          from { transform: translate3d(-6%, 0, 0) scale(1.02); }
          to { transform: translate3d(32%, 1.5%, 0) scale(1.06); }
        }

        @keyframes cloudDriftMid {
          from { transform: translate3d(30%, 0, 0) scale(1.01); }
          to { transform: translate3d(-8%, 2%, 0) scale(1.05); }
        }

        @keyframes cloudDriftNear {
          from { transform: translate3d(-3%, -1%, 0) scale(1.03); }
          to { transform: translate3d(18%, 3%, 0) scale(1.08); }
        }

        @keyframes cityLightFlicker {
          0%, 7%, 13%, 37%, 44%, 72%, 100% { opacity: 0.48; filter: brightness(1); }
          9% { opacity: 0.72; filter: brightness(1.22); }
          40% { opacity: 0.36; filter: brightness(0.86); }
          75% { opacity: 0.63; filter: brightness(1.15); }
        }

        @media (max-width: 768px) {
          .cloud-band {
            left: -70%;
            width: 242%;
          }

          .cloud-band-far {
            top: -11%;
            height: 58%;
          }

          .cloud-band-mid {
            top: -4%;
            height: 52%;
          }

          .cloud-band-near { display: none; }
          .clouds-storm .cloud-band-far { opacity: 0.50; }
          .clouds-storm .cloud-band-mid { opacity: 0.44; }
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
