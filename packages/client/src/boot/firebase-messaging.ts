import { initializeApp } from "firebase/app";
import { Messaging, getMessaging } from "firebase/messaging";
import { boot } from "quasar/wrappers";
import { InjectionKey, inject } from "vue";

const FIREBASE_MESSAGING_KEY: InjectionKey<Messaging> =
  Symbol("firebase-messaging");
export function useFirebaseMessaging() {
  if (process.env.WEB_PUSH_ENABLED !== "true") {
    throw new Error(
      "Web Push feature is not enabled. You can enable it by setting 'WEB_PUSH_ENABLED' environment variable to 'true'",
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return inject(FIREBASE_MESSAGING_KEY)!;
}

export default boot(({ app }) => {
  if (process.env.WEB_PUSH_ENABLED !== "true") {
    return;
  }

  const firebaseApp = initializeApp({
    apiKey: process.env.FIREBASE_API_KEY,
    appId: process.env.FIREBASE_APP_ID,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    projectId: process.env.FIREBASE_PROJECT_ID,
  });

  const messaging = getMessaging(firebaseApp);
  app.provide(FIREBASE_MESSAGING_KEY, messaging);
});
