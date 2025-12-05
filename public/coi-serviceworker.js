/*! coi-serviceworker v0.1.7 - https://github.com/gzuidhof/coi-serviceworker */
if (typeof window === 'undefined') {
  self.addEventListener('install', () => self.skipWaiting());
  self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
  self.addEventListener('message', (ev) => {
    if (ev.data && ev.data.type === 'deregister') self.registration.unregister().then(() => self.clients.matchAll()).then((clients) => clients.forEach((client) => client.navigate(client.url)));
  });
} else {
  (() => {
    const register = () => navigator.serviceWorker.register('/coi-serviceworker.js');
    if (navigator.serviceWorker) {
      register();
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (navigator.serviceWorker.controller?.state === 'activated') window.location.reload();
      });
    }
  })();
}

