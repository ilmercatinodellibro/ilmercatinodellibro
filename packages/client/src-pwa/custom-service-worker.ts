/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.config.js > pwa > workboxMode is set to "injectManifest"
 */

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";
import { clientsClaim } from "workbox-core";
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";

void self.skipWaiting();
clientsClaim();

// Use with precache injection
precacheAndRoute(self.__WB_MANIFEST);

cleanupOutdatedCaches();

// Non-SSR fallback to index.html
// Production SSR fallback to offline.html (except for dev)
// app-vite doesn't precache the index.html file, so we disable the fallback on development until it is fixed:
// https://github.com/quasarframework/quasar/issues/15030
// if (process.env.MODE !== "ssr" || process.env.PROD) {
if (process.env.PROD) {
  registerRoute(
    new NavigationRoute(
      createHandlerBoundToURL(process.env.PWA_FALLBACK_HTML),
      { denylist: [/sw\.js$/, /workbox-(.)*\.js$/] },
    ),
  );
}

if (process.env.WEB_PUSH_ENABLED === "true") {
  const firebaseApp = initializeApp({
    apiKey: process.env.FIREBASE_API_KEY,
    appId: process.env.FIREBASE_APP_ID,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    projectId: process.env.FIREBASE_PROJECT_ID,
  });

  const messaging = getMessaging(firebaseApp);
  onBackgroundMessage(messaging, () => {
    // We only send "notification" type messages, which are automatically handled by Firebase under the hood.
    // This callback will only be called if we receive a "data" type message, which we don't send at the moment.
    // If we want highly customized notifications, we can send "data" type messages and handle them here
    // to display the notification ourselves and/or do other things.
  });

  self.addEventListener("notificationclick", (event) => {
    const { action, notification } = event;

    notification.close();

    if (action.startsWith("$")) {
      const [actionType, actionPayload] = action.slice(1).split(":");

      if (actionType === "open") {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        event.waitUntil(openURL(actionPayload!));
        return;
      }
    }

    const data = notification.data as unknown;
    if (data === null || typeof data !== "object") {
      return;
    }

    const url =
      "url" in data && typeof data.url === "string"
        ? data.url
        : self.location.href;

    event.waitUntil(openURL(url));
  });
}

async function openURL(url: URL | string) {
  const absoluteUrl = new URL(url, self.location.origin).href;

  const windowClients = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });
  // Check if there is already a window/tab open with the target URL
  for (const client of windowClients) {
    // If so, just focus it.
    if (client.url === absoluteUrl.toString() && "focus" in client) {
      return client.focus();
    }
  }

  // If not, then open the target URL in a new window/tab.
  return self.clients.openWindow(absoluteUrl);
}
