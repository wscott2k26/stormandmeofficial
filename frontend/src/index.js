import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@/index.css";
import App from "@/App";

const BUILD_MARKER = "audio-ui-v3-b5d9add";

// One-time recovery from any stale Create React App service worker/app-shell cache.
// This site does not currently need offline/PWA behavior, so stale workers are removed.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));

      if ("caches" in window) {
        const keys = await window.caches.keys();
        await Promise.all(keys.map((key) => window.caches.delete(key)));
      }
    } catch (error) {
      console.warn("Storm & Me cache cleanup could not complete:", error);
    }
  });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

function BuildMarker() {
  return (
    <div
      data-build-marker={BUILD_MARKER}
      style={{
        position: "fixed",
        left: 10,
        bottom: 8,
        zIndex: 2147483647,
        fontSize: 9,
        letterSpacing: "0.08em",
        color: "rgba(255,255,255,0.38)",
        pointerEvents: "none",
        userSelect: "none",
      }}
      aria-hidden="true"
    >
      {BUILD_MARKER}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <BuildMarker />
    </QueryClientProvider>
  </React.StrictMode>,
);