import { defineBoot } from "#q-app";
import { initializeApp } from "firebase/app";
import { type Messaging, getMessaging } from "firebase/messaging";
import { type InjectionKey, inject } from "vue";

const FIREBASE_MESSAGING_KEY: InjectionKey<Messaging> =
  Symbol("firebase-messaging");
export function useFirebaseMessaging() {
  if (!import.meta.env.WEB_PUSH_ENABLED) {
    throw new Error(
      "Web Push feature is not enabled. You can enable it by setting 'WEB_PUSH_ENABLED' environment variable to 'true'",
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return inject(FIREBASE_MESSAGING_KEY)!;
}

export default defineBoot(({ app }) => {
  if (!import.meta.env.WEB_PUSH_ENABLED) {
    return;
  }

  const firebaseApp = initializeApp({
    apiKey: import.meta.env.FIREBASE_API_KEY,
    appId: import.meta.env.FIREBASE_APP_ID,
    messagingSenderId: import.meta.env.FIREBASE_MESSAGING_SENDER_ID,
    projectId: import.meta.env.FIREBASE_PROJECT_ID,
  });

  const messaging = getMessaging(firebaseApp);
  app.provide(FIREBASE_MESSAGING_KEY, messaging);
});
