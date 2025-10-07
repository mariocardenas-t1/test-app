"use client";

import { useEffect } from "react";
import { TrackingProvider } from "@component-context/TrackingContext";
import type { ReactNode } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_ANALYTICS_API_URL ?? "http://localhost:4000";

export default function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    window.__ANALYTICS_API_URL__ = API_URL;
  }, []);

  return <TrackingProvider>{children}</TrackingProvider>;
}
