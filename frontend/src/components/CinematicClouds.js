import React from "react";
import { useStorm } from "../context/StormContext";

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

      <style>{`
        .cinematic-clouds {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          pointer-events: none;
          z-index: 1;
          isolation: isolate;
        }

        .cloud-sky-tint,
        .cloud-band {
          position: absolute;
          pointer-events: none;
          will-change: transform, opacity;
        }

        .cloud-sky-tint {
          inset: 0;
          z-index: 0;
          background:
            linear-gradient(180deg, rgba(4, 12, 27, 0.32) 0%, rgba(13, 27, 48, 0.13) 46%, transparent 72%);
          opacity: 1;
          transition: opacity 3.6s ease, filter 3.6s ease;
        }

        .cloud-band {
          left: -55vw;
          width: 210vw;
          mask-image: linear-gradient(to bottom, #000 0%, #000 58%, transparent 100%);
          -webkit-mask-image: linear-gradient(to bottom, #000 0%, #000 58%, transparent 100%);
          transition: opacity 3.8s ease, filter 3.8s ease;
          transform: translate3d(0, 0, 0);
        }

        .cloud-band-far {
          z-index: 1;
          top: -22vh;
          height: 68vh;
          background:
            radial-gradient(ellipse 17% 31% at 8% 48%, rgba(77, 94, 119, 0.70) 0%, rgba(45, 58, 80, 0.45) 43%, transparent 72%),
            radial-gradient(ellipse 22% 35% at 26% 40%, rgba(72, 89, 113, 0.72) 0%, rgba(38, 51, 73, 0.42) 47%, transparent 74%),
            radial-gradient(ellipse 19% 30% at 46% 52%, rgba(84, 98, 122, 0.64) 0%, rgba(41, 55, 76, 0.40) 45%, transparent 74%),
            radial-gradient(ellipse 25% 36% at 68% 38%, rgba(69, 85, 110, 0.68) 0%, rgba(35, 48, 70, 0.43) 48%, transparent 75%),
            radial-gradient(ellipse 20% 31% at 88% 50%, rgba(78, 94, 119, 0.66) 0%, rgba(39, 52, 74, 0.40) 46%, transparent 73%);
          filter: blur(30px);
          animation: cloudDriftFar 165s linear infinite;
        }

        .cloud-band-mid {
          z-index: 2;
          top: -12vh;
          height: 62vh;
          background:
            radial-gradient(ellipse 15% 26% at 5% 41%, rgba(48, 62, 84, 0.76) 0%, rgba(25, 37, 57, 0.50) 47%, transparent 73%),
            radial-gradient(ellipse 21% 31% at 22% 51%, rgba(56, 70, 94, 0.74) 0%, rgba(29, 42, 63, 0.48) 46%, transparent 74%),
            radial-gradient(ellipse 18% 29% at 43% 37%, rgba(45, 60, 82, 0.78) 0%, rgba(22, 35, 55, 0.50) 48%, transparent 74%),
            radial-gradient(ellipse 24% 34% at 65% 50%, rgba(54, 69, 92, 0.72) 0%, rgba(27, 40, 61, 0.47) 46%, transparent 74%),
            radial-gradient(ellipse 18% 27% at 86% 38%, rgba(48, 62, 85, 0.76) 0%, rgba(25, 37, 58, 0.49) 47%, transparent 73%);
          filter: blur(22px);
          animation: cloudDriftMid 118s linear infinite;
        }

        .cloud-band-near {
          z-index: 3;
          top: 1vh;
          height: 54vh;
          background:
            radial-gradient(ellipse 18% 26% at 9% 34%, rgba(85, 99, 119, 0.42) 0%, rgba(43, 56, 75, 0.25) 48%, transparent 74%),
            radial-gradient(ellipse 25% 31% at 33% 45%, rgba(74, 88, 109, 0.45) 0%, rgba(39, 52, 72, 0.26) 48%, transparent 75%),
            radial-gradient(ellipse 19% 27% at 58% 32%, rgba(87, 101, 121, 0.40) 0%, rgba(45, 58, 78, 0.24) 47%, transparent 74%),
            radial-gradient(ellipse 24% 30% at 82% 43%, rgba(76, 91, 112, 0.43) 0%, rgba(39, 53, 73, 0.25) 48%, transparent 75%);
          filter: blur(38px);
          animation: cloudDriftNear 88s ease-in-out infinite alternate;
        }

        .clouds-storm .cloud-band-far { opacity: 0.38; }
        .clouds-storm .cloud-band-mid { opacity: 0.34; }
        .clouds-storm .cloud-band-near { opacity: 0.20; }

        .clouds-calm .cloud-sky-tint {
          opacity: 0.12;
          filter: brightness(1.35) saturate(0.75);
        }

        .clouds-calm .cloud-band {
          filter: blur(34px) brightness(1.75) saturate(0.55);
        }

        .clouds-calm .cloud-band-far { opacity: 0.10; }
        .clouds-calm .cloud-band-mid { opacity: 0.065; }
        .clouds-calm .cloud-band-near { opacity: 0.035; }

        @keyframes cloudDriftFar {
          from { transform: translate3d(-4vw, 0, 0) scale(1.03); }
          to { transform: translate3d(42vw, 1.5vh, 0) scale(1.06); }
        }

        @keyframes cloudDriftMid {
          from { transform: translate3d(38vw, 0, 0) scale(1.02); }
          to { transform: translate3d(-8vw, 2vh, 0) scale(1.05); }
        }

        @keyframes cloudDriftNear {
          from { transform: translate3d(-2vw, -1vh, 0) scale(1.04); }
          to { transform: translate3d(22vw, 4vh, 0) scale(1.09); }
        }

        @media (max-width: 768px) {
          .cloud-band {
            left: -72vw;
            width: 245vw;
          }

          .cloud-band-far {
            top: -16vh;
            height: 57vh;
            opacity: 0.28;
          }

          .cloud-band-mid {
            top: -8vh;
            height: 52vh;
          }

          .cloud-band-near {
            display: none;
          }

          .clouds-storm .cloud-band-far { opacity: 0.28; }
          .clouds-storm .cloud-band-mid { opacity: 0.23; }
          .clouds-calm .cloud-band-far { opacity: 0.07; }
          .clouds-calm .cloud-band-mid { opacity: 0.045; }
        }

        @media (prefers-reduced-motion: reduce) {
          .cloud-band {
            animation: none !important;
            transform: translate3d(0, 0, 0) scale(1.04);
          }

          .cloud-sky-tint,
          .cloud-band {
            transition-duration: 0.01ms;
          }
        }
      `}</style>
    </div>
  );
}
