/* Keep authentication, saves and game content network-owned; cache only the offline notice. */
if ('serviceWorker' in navigator && window.isSecureContext) {
  addEventListener('load', () => navigator.serviceWorker.register(new URL('../service-worker.js', document.baseURI)).catch(() => {}));
}
