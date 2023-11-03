import { readFileSync } from "fs";
import { registerAs } from "@nestjs/config";
import { ServiceAccount } from "firebase-admin";
import { z } from "zod";

// Output from the Firebase Console uses snake_case
const rawFirebaseCredentialsSchema = z.object({
  project_id: z.string(),
  private_key: z.string(),
  client_email: z.string().email(),
});

// Firebase SDK uses this structure (import("firebase-admin").ServiceAccount)
const firebaseCredentialsSchema = z.object({
  projectId: z.string(),
  privateKey: z.string(),
  clientEmail: z.string().email(),
});

const pushNotificationSchema = z.discriminatedUnion("driver", [
  z.object({
    driver: z.literal("firebase"),
    firebaseCredentials: firebaseCredentialsSchema,
  }),
  z.object({
    driver: z.literal("local"),
  }),
  z.object({
    driver: z.literal("void"),
  }),
]);
export type PushNotificationConfiguration = z.infer<
  typeof pushNotificationSchema
>;

export const pushNotificationConfiguration = registerAs(
  "pushNotification",
  () => {
    if (process.env.PUSH_NOTIFICATIONS_DRIVER !== "firebase") {
      return pushNotificationSchema.parse({
        driver: process.env.PUSH_NOTIFICATIONS_DRIVER,
      });
    }

    if (!process.env.PUSH_NOTIFICATIONS_FIREBASE_CREDENTIALS_PATH) {
      throw new Error(
        "PUSH_NOTIFICATIONS_FIREBASE_CREDENTIALS_PATH environment variable is not set",
      );
    }
    const fileContents = readFileSync(
      process.env.PUSH_NOTIFICATIONS_FIREBASE_CREDENTIALS_PATH,
      "utf-8",
    );
    const parsedRawContents = JSON.parse(fileContents) as unknown;
    const rawResult = rawFirebaseCredentialsSchema.safeParse(parsedRawContents);
    // Respect both snake_case and camelCase in the file
    const firebaseCredentials: Required<ServiceAccount> = rawResult.success
      ? {
          projectId: rawResult.data.project_id,
          privateKey: rawResult.data.private_key,
          clientEmail: rawResult.data.client_email,
        }
      : firebaseCredentialsSchema.parse(parsedRawContents);

    return pushNotificationSchema.parse({
      driver: "firebase",
      firebaseCredentials,
    });
  },
);
