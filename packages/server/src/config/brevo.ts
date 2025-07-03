import { ConfigType, registerAs } from "@nestjs/config";
import { z } from "zod";

const brevoSchema = z.object({
  apiKey: z.string(),
});

export const brevoConfiguration = registerAs("brevo", () => {
  const config = brevoSchema.parse({
    apiKey: process.env.BREVO_API_KEY,
  });

  return config;
});

export type BrevoConfiguration = ConfigType<typeof brevoConfiguration>;
