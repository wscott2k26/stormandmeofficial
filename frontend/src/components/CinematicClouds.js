import React from "react";
import { motion } from "framer-motion";
import { useStorm } from "../context/StormContext";

const WINDOW_CLUSTERS = [
  { x: "56.7%", y: "43.5%", columns: 3, rows: 2, delay: 0.2, duration: 7.4 },
  { x: "61.8%", y: "39.8%", columns: 2, rows: 3, delay: 1.4, duration: 8.8 },
  { x: "66.2%", y: "45.3%", columns: 3, rows: 2, delay: 2.1, duration: 6.9 },
  { x: "71.3%", y: "41.8%", columns: 2, rows: 3, delay: 0.9, duration: 9.2 },
  { x: "76.3%", y: "47.4%", columns: 3, rows: 2, delay: 2.7, duration: 7.8 },
];

function WindowCluster({ cluster, clusterIndex }) {
  const windows = Array.from({ length: cluster.columns * cluster.rows });

  return (
    <div
      className="window-cluster"
      style={{
        left: cluster.x,
        top: cluster.y,
        gridTemplateColumns: `repeat(${cluster.columns}, 3px)`,
      }}
    >
      {windows.map((_, windowIndex) => {
        const duration = cluster.duration + (windowIndex % 3) * 0.9;
        const delay = cluster.delay + windowIndex * 0.33 + clusterIndex * 0.16;

        return (
          <motion.span
            key={`${clusterIndex}-${windowIndex}`}
            className="building-window"
            animate={{
              opacity: [0.24, 0.88, 0.44, 1, 0.32],
              scale: [1, 1.18, 0.96, 1.28, 1],
              boxShadow: [
                "0 0 2px rgba(255,210,120,0.25)",
                "0 0 7px rgba(255,205,105,0.68)",
                "0 0 3px rgba(255,210,120,0.34)",
                "0 0 10px rgba(255,190,78,0.78)",
                "0 0 2px rgba(255,210,120,0.25)",
              ],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}

export default function CinematicClouds() {
  const { motion: stormMode } = useStorm();

  return (
    <div
      className={`hero-atmosphere ${stormMode ? "atmosphere-storm" : "atmosphere-calm"}`}
      aria-hidden="true"
    >
      <motion.div
        className="dark-cloud dark-cloud-back"
        initial={{ x: "-62vw", y: 0 }}
        animate={{ x: "112vw", y: [0, 10, 2] }}
        transition={{
          x: { duration: 40, delay: -19, repeat: Infinity, ease: "linear" },
          y: { duration: 12, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      <motion.div
        className="dark-cloud dark-cloud-front"
        initial={{ x: "110vw", y: 0 }}
        animate={{ x: "-64vw", y: [0, 7, 1] }}
        transition={{
          x: { duration: 31, delay: -12, repeat: Infinity, ease: "linear" },
          y: { duration: 9, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      <motion.div
        className="skyline-lights"
        animate={{ opacity: stormMode ? [0.72, 0.9, 0.76] : 0.22 }}
        transition={{ duration: 6, repeat: stormMode ? Infinity : 0, ease: "easeInOut" }}
      >
        {WINDOW_CLUSTERS.map((cluster, index) => (
          <WindowCluster key={`${cluster.x}-${cluster.y}`} cluster={cluster} clusterIndex={index} />
        ))}
      </motion.div>

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
          left: 0;
          width: 62vw;
          min-width: 760px;
          height: 25vh;
          min-height: 180px;
          border-radius: 50%;
          mix-blend-mode: multiply;
          filter: blur(9px) contrast(1.16);
          will-change: transform, opacity;
          transition: opacity 3.2s ease, filter 3.2s ease;
          background:
            radial-gradient(ellipse 23% 66% at 10% 61%, rgba(4, 9, 18, 1) 0%, rgba(13, 21, 35, 0.94) 46%, transparent 76%),
            radial-gradient(ellipse 30% 76% at 34% 41%, rgba(3, 8, 17, 1) 0%, rgba(14, 23, 38, 0.96) 47%, transparent 78%),
            radial-gradient(ellipse 27% 69% at 60% 59%, rgba(5, 11, 21, 1) 0%, rgba(15, 25, 41, 0.93) 48%, transparent 77%),
            radial-gradient(ellipse 31% 73% at 84% 43%, rgba(3, 8, 16, 1) 0%, rgba(13, 22, 37, 0.95) 48%, transparent 79%);
        }

        .dark-cloud-back {
          top: 4%;
          opacity: 0.48;
          transform: scale(1.1);
        }

        .dark-cloud-front {
          top: 18%;
          width: 55vw;
          min-width: 690px;
          height: 21vh;
          min-height: 155px;
          opacity: 0.38;
          filter: blur(7px) contrast(1.22);
        }

        .atmosphere-calm .dark-cloud {
          opacity: 0.045;
          filter: blur(18px) brightness(1.25) saturate(0.55);
        }

        .skyline-lights {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .window-cluster {
          position: absolute;
          display: grid;
          gap: 4px 5px;
          transform: translate(-50%, -50%);
        }

        .building-window {
          display: block;
          width: 3px;
          height: 4px;
          border-radius: 1px;
          background: rgba(255, 224, 151, 0.96);
          transform-origin: center;
        }

        @media (max-width: 768px) {
          .dark-cloud {
            min-width: 620px;
            height: 21vh;
            min-height: 145px;
          }

          .dark-cloud-back {
            top: 6%;
            opacity: 0.40;
          }

          .dark-cloud-front {
            top: 19%;
            opacity: 0.31;
          }

          .window-cluster:nth-child(n + 4) {
            display: none;
          }

          .building-window {
            width: 2px;
            height: 3px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .dark-cloud {
            transition-duration: 0.01ms;
          }
        }
      `}</style>
    </div>
  );
}
