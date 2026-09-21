/* =========================================================
   PWA — Registro do Service Worker
   ========================================================= */

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .catch((err) => console.warn("Service Worker não registrado:", err));
  });
}