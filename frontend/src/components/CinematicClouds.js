import React from "react";
import { useStorm } from "../context/StormContext";

const CITY_LIGHTS = [
  { x: "56.8%", y: "47.5%", size: "2px", delay: "-3.2s", duration: "12.4s" },
  { x: "60.4%", y: "43.8%", size: "2px", delay: "-7.8s", duration: "14.2s" },
  { x: "63.7%", y: "50.6%", size: "1.8px", delay: "-5.1s", duration: "11.7s" },
  { x: "67.2%", y: "46.2%", size: "2.2px", delay: "-9.4s", duration: "15.1s" },
  { x: "70.8%", y: "49.8%", size: "1.8px", delay: "-1.9s", duration: "13.5s" },
  { x: "74.4%", y: "44.6%", size: "2px", delay: "-6.3s", duration: "12.9s" },
  { x: "78.1%", y: "52.1%", size: "2.2px", delay: "-10.7s", duration: "15.8s" },
];

export default function CinematicClouds() {
  const { motion } = useStorm();

  return (
    <div
      className={`hero-atmosphere ${motion ? "atmosphere-storm" : "atmosphere-calm"}`}
      aria-hidden="true"
    >
      <div className="dark-cloud dark-cloud-back" />
      <div className="dark-cloud dark-cloud-front" />

      <div className="skyline-lights">
        {CITY_LIGHTS.map((light) => (
          <span
            key={`${light.x}-${light.y}`}
            className="skyline-light"
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
        .hero-atmosphere {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 1;
        }

        .dark-cloud {
          position: absolute;
          left: -62vw;
          width: 62vw;
          min-width: 760px;
          height: 25vh;
          min-height: 180px;
          border-radius: 50%;
          mix-blend-mode: multiply;
          filter: blur(10px) contrast(1.08);
          will-change: transform, opacity;
          transition: opacity 3.2s ease, filter 3.2s ease;
          background:
            radial-gradient(ellipse 22% 62% at 11% 60%, rgba(7, 13, 25, 0.98) 0%, rgba(15, 24, 39, 0.88) 47%, transparent 76%),
            radial-gradient(ellipse 28% 72% at 33% 43%, rgba(6, 12, 23, 0.98) 0%, rgba(17, 27, 43, 0.90) 48%, transparent 78%),
            radial-gradient(ellipse 25% 64% at 58% 59%, rgba(8, 15, 28, 0.97) 0%, rgba(18, 29, 46, 0.87) 48%, transparent 77%),
            radial-gradient(ellipse 29% 70% at 82% 44%, rgba(5, 11, 22, 0.98) 0%, rgba(15, 25, 41, 0.88) 49%, transparent 79%);
        }

        .dark-cloud-back {
          top: 5%;
          opacity: 0.42;
          transform: scale(1.08);
          animation: stormCloudDriftBack 86s linear infinite;
          animation-delay: -46s;
        }

        .dark-cloud-front {
          top: 18%;
          width: 54vw;
          min-width: 680px;
          height: 21vh;
          min-height: 155px;
          opacity: 0.31;
          filter: blur(8px) contrast(1.14);
          animation: stormCloudDriftFront 63s linear infinite;
          animation-delay: -28s;
        }

        .atmosphere-calm .dark-cloud {
          opacity: 0.045;
          filter: blur(18px) brightness(1.25) saturate(0.55);
        }

        .skyline-lights {
          position: absolute;
          inset: 0;
          opacity: 0.82;
          transition: opacity 2.8s ease;
        }

        .atmosphere-calm .skyline-lights {
          opacity: 0.24;
        }

        .skyline-light {
          position: absolute;
          left: var(--light-x);
          top: var(--light-y);
          width: var(--light-size);
          height: var(--light-size);
          border-radius: 1px;
          background: rgba(255, 220, 145, 0.92);
          box-shadow:
            0 0 3px rgba(255, 216, 133, 0.72),
            0 0 7px rgba(255, 190, 88, 0.24);
          opacity: 0.48;
          animation: skylineFlicker var(--light-duration) ease-in-out var(--light-delay) infinite;
        }

        @keyframes stormCloudDriftBack {
          from { transform: translate3d(-8vw, 0, 0) scale(1.08); }
          to { transform: translate3d(174vw, 1.5vh, 0) scale(1.12); }
        }

        @keyframes stormCloudDriftFront {
          from { transform: translate3d(168vw, 0, 0) scale(1.02); }
          to { transform: translate3d(-8vw, 2vh, 0) scale(1.06); }
        }

        @keyframes skylineFlicker {
          0%, 18%, 44%, 68%, 100% { opacity: 0.48; filter: brightness(1); }
          21% { opacity: 0.63; filter: brightness(1.12); }
          47% { opacity: 0.40; filter: brightness(0.92); }
          71% { opacity: 0.57; filter: brightness(1.08); }
        }

        @media (max-width: 768px) {
          .dark-cloud {
            min-width: 620px;
            height: 21vh;
            min-height: 145px;
          }

          .dark-cloud-back {
            top: 7%;
            opacity: 0.34;
          }

          .dark-cloud-front {
            top: 19%;
            opacity: 0.24;
          }

          .skyline-light:nth-child(n + 6) {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .dark-cloud,
          .skyline-light {
            animation: none !important;
          }

          .dark-cloud-back {
            transform: translate3d(22vw, 0, 0) scale(1.1);
          }

          .dark-cloud-front {
            transform: translate3d(78vw, 0, 0) scale(1.04);
          }
        }
      `}</style>
    </div>
  );
}
