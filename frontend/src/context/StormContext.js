import React, { createContext, useContext, useEffect, useState } from "react";

const StormContext = createContext(null);
const KEY = "storm-motion";

export function StormProvider({ children }) {
  const prefersReduced = typeof window !== "undefined" &&
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const [motion, setMotion] = useState(() => {
    const saved = localStorage.getItem(KEY);
    if (saved !== null) return saved === "on";
    return !prefersReduced;
  });

  useEffect(() => {
    localStorage.setItem(KEY, motion ? "on" : "off");
  }, [motion]);

  const toggleMotion = () => setMotion((m) => !m);

  return (
    <StormContext.Provider value={{ motion, toggleMotion }}>
      {children}
    </StormContext.Provider>
  );
}

export const useStorm = () => useContext(StormContext);
