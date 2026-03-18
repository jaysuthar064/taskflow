import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import AuthProvider from "./context/AuthContext.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { registerPushServiceWorker } from "./utils/pushNotifications.js";

if (typeof window !== "undefined") {
  window.addEventListener("load", () => {
    registerPushServiceWorker().catch((error) => {
      console.error("Unable to register push service worker", error);
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
