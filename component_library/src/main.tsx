import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { TrackingProvider } from "./context/TrackingContext";

if (typeof window !== "undefined") {
  window.__ANALYTICS_API_URL__ =
    (import.meta as Record<string, unknown> & {
      env?: Record<string, string>;
    })?.env?.VITE_ANALYTICS_API_URL || "http://localhost:4000";
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TrackingProvider>
      <App />
    </TrackingProvider>
  </StrictMode>
);
