import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import AuthProvider from "./context/AuthContext.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import {
  clearTaskflowServiceWorkerState,
  registerPushServiceWorker
} from "./utils/pushNotifications.js";

if (typeof window !== "undefined") {
  let hasRefreshedForServiceWorker = false;
  const canUsePushServiceWorker =
    import.meta.env.PROD ||
    ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (hasRefreshedForServiceWorker) {
        return;
      }

      hasRefreshedForServiceWorker = true;
      window.location.reload();
    });
  }

  window.addEventListener("load", () => {
    if (canUsePushServiceWorker) {
      registerPushServiceWorker().catch((error) => {
        console.error("Unable to register push service worker", error);
      });
      return;
    }

    clearTaskflowServiceWorkerState().catch((error) => {
      console.error("Unable to clear push service worker state", error);
    });
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);
